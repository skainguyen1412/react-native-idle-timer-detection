import { useEffect, useState } from "react";
import { Button, Modal, StatusBar, Text, TextInput, View } from "react-native";
import { StyleSheet } from "react-native";
import { useIdleTimerContext } from "./IdleTimerContext";

export const DemoScreen = () => {
    const [isPrompt, setIsPrompt] = useState(false);
    const [countdownTime, setCountdownTime] = useState<number>();

    const idleTimer = useIdleTimerContext();

    useEffect(() => {
        console.log(idleTimer?.startTime);
    }, []);

    const getSecondsFromDateCurrent = (date: number) => {
        // Need to make this update everytime
        const currentTime = Date.now();
        const time = currentTime - date;

        return time / 1000;
    };

    useEffect(() => {
        setInterval(() => {
            console.log(idleTimer?.getRemainingTime());
            setCountdownTime(idleTimer?.getRemainingTime() ?? 0);
        }, 1000);
    }, [idleTimer]);

    return (
        <View style={styles.container}>
            <Modal animationType="slide" visible={isPrompt}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text>aa</Text>
                    <Button
                        title="Hide prompt"
                        onPress={() => {
                            setIsPrompt(false);
                        }}
                    />
                </View>
            </Modal>

            {/* <Text>{idle.current ? "Idle" : "Active"}</Text> */}
            {countdownTime && <Text>Timer {countdownTime}</Text>}

            <StatusBar />
            <Button
                title="Test button pressed"
                onPress={() => {
                    console.log("Test button pressed");
                }}
            />
            <TextInput
                placeholder="Enter your text"
                style={{
                    borderWidth: 1,
                    borderColor: "black",
                    padding: 10,
                    margin: 10,
                    width: "80%",
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
