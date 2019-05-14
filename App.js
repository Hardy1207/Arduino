import React, { Component } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Modal,
  ActivityIndicator,
  Image
} from "react-native";
import { Container, Header, Content, Tab, Tabs } from 'native-base';
import { DeviceList } from "./scr/screens/DeviceList"
import { SensorList } from "./scr/screens/Sensor"
import BluetoothSerial from "react-native-bluetooth-serial";

const Button = ({ title, onPress, style, textStyle }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={[styles.buttonText, textStyle]}>{title.toUpperCase()}</Text>
  </TouchableOpacity>
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: [],
      connected: false,
      section: 0,
      sensorData: {
        temperature: 0,
        humidity: 0,
        co2: 0,
        battety: 0,
        pm1: 0,
        pm25: 0,
        pm10: 0,
        tvoc: 0
      }
    };
  }

  componentWillMount() {
    Promise.all([BluetoothSerial.isEnabled(), BluetoothSerial.list()]).then(
      values => {
        const [isEnabled, devices] = values;
        this.setState({ isEnabled, devices });
      }
    );

    BluetoothSerial.on("bluetoothEnabled", () =>
      console.log("Bluetooth enabled")
    );
    BluetoothSerial.on("bluetoothDisabled", () =>
    console.log("Bluetooth disabled")
    );
    BluetoothSerial.on("error", err => console.log(`Error: ${err.message}`));
    BluetoothSerial.on("connectionLost", () => {
      if (this.state.device) {
        console.log(
          `Connection to device ${this.state.device.name} has been lost`
        );
      }
      this.setState({ connected: false });
    });

    BluetoothSerial.on('read', data => {
      const dataFromSensor = data.data.split(" ");
      this.setState({
        sensorData: {
          temperature: dataFromSensor[0] / 100,
          humidity: dataFromSensor[1] / 100,
          co2: dataFromSensor[2],
          battety: `${dataFromSensor[3]}%`,
          pm1: dataFromSensor[4],
          pm25: dataFromSensor[5],
          pm10: dataFromSensor[6],
          tvoc: dataFromSensor[7]
        }
      })
    });
  }

  /**
   * [android]
   * request enable of bluetooth from user
   */
  requestEnable() {
    BluetoothSerial.requestEnable()
      .then(res => this.setState({ isEnabled: true }))
      .catch(err => console.log(err.message));
  }

  /**
   * [android]
   * enable bluetooth on device
   */
  enable() {
    BluetoothSerial.enable()
      .then(res => this.setState({ isEnabled: true }))
      .catch(err => console.log(err.message));
  }

  /**
   * [android]
   * disable bluetooth on device
   */
  disable() {
    BluetoothSerial.disable()
      .then(res => this.setState({ isEnabled: false }))
      .catch(err => console.log(err.message));
  }

  /**
   * [android]
   * toggle bluetooth
   */
  toggleBluetooth(value) {
    if (value === true) {
      this.enable();
    } else {
      this.disable();
    }
  }

  /**
   * [android]
   * Discover unpaired devices, works only in android
   */
  discoverUnpaired() {
    if (this.state.discovering) {
      return false;
    } else {
      this.setState({ discovering: true });
      BluetoothSerial.discoverUnpairedDevices()
        .then(unpairedDevices => {
          this.setState({ unpairedDevices, discovering: false });
        })
        .catch(err => console.log(err.message));
    }
  }

  /**
   * [android]
   * Discover unpaired devices, works only in android
   */
  cancelDiscovery() {
    if (this.state.discovering) {
      BluetoothSerial.cancelDiscovery()
        .then(() => {
          this.setState({ discovering: false });
        })
        .catch(err => console.log(err.message));
    }
  }

  /**
   * [android]
   * Pair device
   */
  pairDevice(device) {
    BluetoothSerial.pairDevice(device.id)
      .then(paired => {
        if (paired) {
          console.log(`Device ${device.name} paired successfully`);
          const devices = this.state.devices;
          devices.push(device);
          this.setState({
            devices,
            unpairedDevices: this.state.unpairedDevices.filter(
              d => d.id !== device.id
            )
          });
        } else {
          console.log(`Device ${device.name} pairing failed`);
        }
      })
      .catch(err => console.log(err.message));
  }

  /**
   * Connect to bluetooth device by id
   * @param  {Object} device
   */
  connect(device) {
    this.setState({ connecting: true });
    BluetoothSerial.connect(device.id)
      .then(res => {
        console.log(device + "HERE PRESS");
        this.read();
        console.log(`Connected to device ${device.name}`);
        this.setState({ device, connected: true, connecting: false });
      })
      .catch(err => console.log(err.message));
  }

  /**
   * Disconnect from bluetooth device
   */
  disconnect() {
    BluetoothSerial.disconnect()
      .then(() => this.setState({ connected: false }))
      .catch(err => console.log(err.message));
  }

  /**
   * Toggle connection when we have active device
   * @param  {Boolean} value
   */
  toggleConnect(value) {
    if (value === true && this.state.device) {
      this.connect(this.state.device);
    } else {
      this.disconnect();
    }
  }

  /**
   * Write message to device
   * @param  {String} message
   */
  write(message) {
    if (!this.state.connected) {
      console.log("You must connect to device first");
    }

    BluetoothSerial.write(message)
      .then(res => {
        console.log("Successfuly wrote to device");
        this.setState({ connected: true });
      })
      .catch(err => console.log(err.message));
  }

  onDevicePress(device) {
    console.log(device + "HERE PRESS");
    if (this.state.section === 0) {
      this.connect(device);
    } else {
      this.pairDevice(device);
    }
  }

  read() {
    if (!this.state.connected) {
      console.log("You must connect to device first");
    }

    BluetoothSerial.readFromDevice()
    .then(res => {
      console.log("Successfuly read to device");
      console.log("HERE  " + res.trim());
      // console.log("HERE2  " + Buffer(res));
      // console.log( "HERE3 " + Buffer.from(res, 'ascii'));
      // console.log("HERE4 " + Buffer.from(res, 'utf16le'));
      const res1 = res.split(" ")[0];
      console.log(res1);
      this.setState({ connected: true });
    })
    .catch(err => console.log(err.message));

    BluetoothSerial.on('read', data => {
      console.log(`DATA FROM BLUETOOTH: ${data.data}`);
    });


    BluetoothSerial.withDelimiter('\r').then((res)=>{
      console.log("delimiter setup",res);
      BluetoothSerial.on('read',(data)=>{
      console.log('read',data);
      })
      })

  }

  render() {
    const activeTabStyle = { borderBottomWidth: 6, borderColor: "#009688" };
    return (
      <Container>
      <Header hasTabs />
      <Tabs>
        <Tab heading="Bluetooth">
        <DeviceList
            showConnectedIcon={this.state.section === 0}
            connectedId={this.state.device && this.state.device.id}
            devices={
              this.state.section === 0
                ? this.state.devices
                : this.state.unpairedDevices
            }
            onDevicePress={device => this.onDevicePress(device)}
          />
        </Tab>
        <Tab heading="Датчик">
          <SensorList sensorData={this.state.sensorData}  />
        </Tab>
      </Tabs>
    </Container>
    );
  }
}


  // render() {
  //   const activeTabStyle = { borderBottomWidth: 6, borderColor: "#009688" };
  //   return (
  //     <View style={{ flex: 1 }}>
  //       <View style={styles.topBar}>
  //         <Text style={styles.heading}>Bluetooth Serial Example</Text>
  //         {Platform.OS === "android" ? (
  //           <View style={styles.enableInfoWrapper}>
  //             <Text style={{ fontSize: 12, color: "#FFFFFF" }}>
  //               {this.state.isEnabled ? "disable" : "enable"}
  //             </Text>
  //             <Switch
  //               onValueChange={this.toggleBluetooth.bind(this)}
  //               value={this.state.isEnabled}
  //             />
  //           </View>
  //         ) : null}
  //       </View>

  //       {Platform.OS === "android" ? (
  //         <View
  //           style={[
  //             styles.topBar,
  //             { justifyContent: "center", paddingHorizontal: 0 }
  //           ]}
  //         >
  //           <TouchableOpacity
  //             style={[styles.tab, this.state.section === 0 && activeTabStyle]}
  //             onPress={() => this.setState({ section: 0 })}
  //           >
  //             <Text style={{ fontSize: 14, color: "#FFFFFF" }}>
  //               PAIRED DEVICES
  //             </Text>
  //           </TouchableOpacity>
  //           <TouchableOpacity
  //             style={[styles.tab, this.state.section === 1 && activeTabStyle]}
  //             onPress={() => this.setState({ section: 1 })}
  //           >
  //             <Text style={{ fontSize: 14, color: "#FFFFFF" }}>
  //               UNPAIRED DEVICES
  //             </Text>
  //           </TouchableOpacity>
  //         </View>
  //       ) : null}
  //       {this.state.discovering && this.state.section === 1 ? (
  //         <View
  //           style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
  //         >
  //           <ActivityIndicator style={{ marginBottom: 15 }} size={60} />
  //           <Button
  //             textStyle={{ color: "#FFFFFF" }}
  //             style={styles.buttonRaised}
  //             title="Cancel Discovery"
  //             onPress={() => this.cancelDiscovery()}
  //           />
  //         </View>
  //       ) : (
  //         <DeviceList
  //           showConnectedIcon={this.state.section === 0}
  //           connectedId={this.state.device && this.state.device.id}
  //           devices={
  //             this.state.section === 0
  //               ? this.state.devices
  //               : this.state.unpairedDevices
  //           }
  //           onDevicePress={device => this.onDevicePress(device)}
  //         />
  //       )}

  //       <View style={{ alignSelf: "flex-end", height: 52 }}>
  //         <ScrollView horizontal contentContainerStyle={styles.fixedFooter}>
  //           {Platform.OS === "android" && this.state.section === 1 ? (
  //             <Button
  //               title={
  //                 this.state.discovering
  //                   ? "... Discovering"
  //                   : "Discover devices"
  //               }
  //               onPress={this.discoverUnpaired.bind(this)}
  //             />
  //           ) : null}
  //           {Platform.OS === "android" && !this.state.isEnabled ? (
  //             <Button
  //               title="Request enable"
  //               onPress={() => this.requestEnable()}
  //             />
  //           ) : null}
  //         </ScrollView>
  //         <Text>{`Temperature ${this.state.sensorData.temperature}`}</Text>
  //         <Text>{`Battery ${this.state.sensorData.battety}`}</Text>
  //         <Text>{`CO2 ${this.state.sensorData.co2}`}</Text>
  //         <Text>{`Humidity ${this.state.sensorData.humidity}`}</Text>
  //         <Text>{`PM1 ${this.state.sensorData.pm1}`}</Text>
  //         <Text>{`PM2.5 ${this.state.sensorData.pm25}`}</Text>
  //         <Text>{`PM10 ${this.state.sensorData.pm10}`}</Text>
  //         <Text>{`TVOC ${this.state.sensorData.tvoc}`}</Text>
  //         <Button
  //               title="READ DATA"
  //               onPress={() => this.read()}
  //             />
  //       </View>
  //     </View>
  //   );
  // }
//}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: "#F5FCFF"
  },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 6,
    backgroundColor: "#7B1FA2"
  },
  heading: {
    fontWeight: "bold",
    fontSize: 16,
    alignSelf: "center",
    color: "#FFFFFF"
  },
  enableInfoWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  tab: {
    alignItems: "center",
    flex: 0.5,
    height: 56,
    justifyContent: "center",
    borderBottomWidth: 6,
    borderColor: "transparent"
  },
  listContainer: {
    borderColor: "#ccc",
    borderTopWidth: 0.5
  },
  listItem: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderColor: "#ccc",
    borderBottomWidth: 0.5,
    justifyContent: "center"
  },
  fixedFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd"
  },
  button: {
    height: 36,
    margin: 5,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: "#7B1FA2",
    fontWeight: "bold",
    fontSize: 14
  },
  buttonRaised: {
    backgroundColor: "#7B1FA2",
    borderRadius: 2,
    elevation: 2
  }
});

export default App;
