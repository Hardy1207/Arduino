import React from "react";
import { Image, ScrollView, Text, TouchableHighlight, View } from "react-native";
import { Card, CardItem, Container } from "native-base";
import styles from "./styles";

export const SensorList = ({
    sensorData
}) => (
        <View style={{ flex: 1 }}>
            <Card style={styles.card}>
                <View style={styles.typeIcon}>
                    <FontAwesome5 name="user" style={styles.userIcon} size={theme.size.icons.medium} solid />
                </View>
                <View>
                    <Text>{`Temperature ${sensorData.temperature}`}</Text>
                </View>
            </Card>
            <Card style={styles.card}>
                <View style={styles.typeIcon}>
                    <FontAwesome5 name="user" style={styles.userIcon} size={theme.size.icons.medium} solid />
                </View>
                <View>
                    <Text>{`Battery ${sensorData.battety}`}</Text>
                </View>
            </Card>
            <Card style={styles.card}>
                <View style={styles.typeIcon}>
                    <FontAwesome5 name="user" style={styles.userIcon} size={theme.size.icons.medium} solid />
                </View>
                <View>
                    <Text>{`CO2 ${sensorData.co2}`}</Text>
                </View>
            </Card>
            <Card style={styles.card}>
                <View style={styles.typeIcon}>
                    <FontAwesome5 name="user" style={styles.userIcon} size={theme.size.icons.medium} solid />
                </View>
                <View>
                    <Text>{`Humidity ${sensorData.humidity}`}</Text>
                </View>
            </Card>
            <Card style={styles.card}>
                <View style={styles.typeIcon}>
                    <FontAwesome5 name="user" style={styles.userIcon} size={theme.size.icons.medium} solid />
                </View>
                <View>
                    <Text>{`PM1 ${sensorData.pm1}`}</Text>
                </View>
            </Card>
            <Card style={styles.card}>
                <View style={styles.typeIcon}>
                    <FontAwesome5 name="user" style={styles.userIcon} size={theme.size.icons.medium} solid />
                </View>
                <View>
                    <Text>{`PM2.5 ${sensorData.pm25}`}</Text>
                </View>
            </Card>
            <Card style={styles.card}>
                <View style={styles.typeIcon}>
                    <FontAwesome5 name="user" style={styles.userIcon} size={theme.size.icons.medium} solid />
                </View>
                <View>
                    <Text>{`PM10 ${sensorData.pm10}`}</Text>
                </View>
            </Card>
            <Card style={styles.card}> <View style={styles.typeIcon}>
                <FontAwesome5 name="user" style={styles.userIcon} size={theme.size.icons.medium} solid />
            </View>
                <View>
                    <Text>{`TVOC ${sensorData.tvoc}`}</Text>
                </View>
            </Card>
        </View>
    );