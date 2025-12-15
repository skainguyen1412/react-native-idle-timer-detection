import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
    Button,
    Keyboard,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function App() {
    //TODO: Planning to develop propotype for idle timer in react native

    // const [isIdle, setIsIdle] = useState(false);
    const startTime = useRef<number>(Date.now());
    const lastReset = useRef<number>(Date.now());
    const lastIdle = useRef<number>(null);
    const lastActive = useRef<number>(null);
    const idleTime = useRef<number>(0);
    const totalIdleTime = useRef<number>(0);
    const promptTime = useRef<number>(0);
    const remaining = useRef<number>(0);

    // const [startTimer, setStartTimer] = useState<number>();
    const [countdownTime, setCountdownTime] = useState<number>();

    // State References
    const idle = useRef<boolean>(false);
    const prompted = useRef<boolean>(false);
    const paused = useRef<boolean>(false);
    const firstLoad = useRef<boolean>(true);
    const eventsBound = useRef<boolean>(false);
    const tId = useRef<number>(null);

    // Show prompt
    const [isPrompt, setIsPrompt] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            // 1. The Capture Phase: This happens BEFORE the touch reaches the child.
            // We log the touch here, but return FALSE.
            onStartShouldSetPanResponderCapture: (evt, gestureState) => {
                // --- YOUR LOGIC HERE ---
                // e.g., Reset an inactivity timer, log analytics, etc.
                console.log("User touched the screen!");

                reset();

                // --- THE TRICK ---
                // Return false. This tells React Native:
                // "I saw the touch, but I don't want to stop it. Let it pass to the child."
                return false;
            },
        })
    ).current;

    useEffect(() => {
        // On mount
        console.log("mounting");
        start();
    }, []);

    const start = () => {
        destroyTimeout();

        // Set state
        idle.current = false;
        prompted.current = false;
        paused.current = false;
        remaining.current = 0;
        promptTime.current = 0;

        createTimeout();
    };

    const reset = () => {
        startTime.current = Date.now();
    };

    const createTimeout = () => {
        destroyTimeout();

        setTimeout(toggleIdleState, 1000);
    };

    const toggleIdleState = () => {
        idle.current = !idle.current;
    };

    const destroyTimeout = () => {
        if (tId.current !== null) {
            clearTimeout(tId.current);
            tId.current = null;
        }
    };

    useEffect(() => {
        // --- A. Listen for Keyboard Appearance ---

        // Fired when keyboard starts sliding up
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            console.log("Keyboard is OPEN");
        });

        // Fired when keyboard is fully closed
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            console.log("Keyboard is CLOSED");
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const getSecondsFromDateCurrent = (date: number) => {
        // Need to make this update everytime
        const currentTime = Date.now();
        const time = currentTime - date;

        return time / 1000;
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        interval = setInterval(() => {
            setCountdownTime(getSecondsFromDateCurrent(startTime.current));
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    });

    useEffect(() => {
        if (!countdownTime) return;

        if (countdownTime > 10) {
            setIsPrompt(true);
        }
    }, [countdownTime]);

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
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

            <Text>{idle.current ? "Idle" : "Active"}</Text>
            {countdownTime && <Text>Timer {countdownTime.toFixed()}</Text>}
            <StatusBar style="auto" />
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
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
