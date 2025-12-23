import { useEffect, useState } from "react";
import { Button, Modal, StatusBar, Text, TextInput, View } from "react-native";
import { StyleSheet } from "react-native";
import { useIdleTimerContext } from "./IdleTimerContext";

export const DemoScreen = () => {
    const [isPrompt, setIsPrompt] = useState(false);
    const [countdownTime, setCountdownTime] = useState<number>();
    const [isIdle, setIsIdle] = useState(false);

    const idleTimer = useIdleTimerContext();

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCountdownTime(idleTimer.getRemainingTime() ?? 0);
            setIsIdle(idleTimer.getIsIdle());
        }, 500);

        return () => clearInterval(intervalId);
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

            <Text>Is idle: {isIdle ? "Idle" : "Active"}</Text>

            <Text>Timer {countdownTime}</Text>

            <StatusBar />
            <Button
                title="Pause"
                onPress={() => {
                    idleTimer.pause();
                }}
            />

            <Button
                title="Resume"
                onPress={() => {
                    idleTimer.resume();
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
