import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    View,
    SafeAreaView,
} from "react-native";
import {
    IdleTimerProvider,
    useRequiredIdleTimerContext,
    IdleTimerState,
} from "./src";

// Configuration for the demo
const TIMEOUT_MS = 15000; // 15 seconds until idle
const PROMPT_BEFORE_IDLE_MS = 5000; // Show prompt 5 seconds before idle

/**
 * Demo screen showing idle timer functionality
 */
function DemoScreen() {
    const idleTimer = useRequiredIdleTimerContext();
    const [remainingSeconds, setRemainingSeconds] = useState<number>(
        idleTimer.getRemainingTimeSec()
    );

    // Update remaining time every second with proper cleanup
    useEffect(() => {
        const intervalId = setInterval(() => {
            setRemainingSeconds(idleTimer.getRemainingTimeSec());
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [idleTimer]);

    // Get display color based on state
    const getStateColor = (state: IdleTimerState): string => {
        switch (state) {
            case "active":
                return "#4CAF50"; // Green
            case "prompting":
                return "#FF9800"; // Orange
            case "idle":
                return "#F44336"; // Red
            case "paused":
                return "#9E9E9E"; // Gray
            default:
                return "#000000";
        }
    };

    // Get human-readable state label
    const getStateLabel = (state: IdleTimerState): string => {
        switch (state) {
            case "active":
                return "Active";
            case "prompting":
                return "Warning!";
            case "idle":
                return "Idle";
            case "paused":
                return "Paused";
            default:
                return state;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="auto" />

            {/* Prompting Modal */}
            <Modal
                animationType="fade"
                transparent
                visible={idleTimer.state === "prompting"}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Are you still there?</Text>
                        <Text style={styles.modalTimer}>{remainingSeconds}s</Text>
                        <Text style={styles.modalSubtext}>
                            Tap anywhere or press the button to stay active
                        </Text>
                        <Button
                            title="I'm here!"
                            onPress={() => {
                                idleTimer.reset();
                            }}
                        />
                    </View>
                </View>
            </Modal>

            {/* Idle Modal */}
            <Modal
                animationType="fade"
                transparent
                visible={idleTimer.state === "idle"}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, styles.idleModalContent]}>
                        <Text style={styles.modalTitle}>Session Timed Out</Text>
                        <Text style={styles.modalSubtext}>
                            You've been idle. Tap to resume.
                        </Text>
                        <Button
                            title="Resume"
                            onPress={() => {
                                idleTimer.reset();
                            }}
                        />
                    </View>
                </View>
            </Modal>

            {/* Main Content */}
            <View style={styles.content}>
                <Text style={styles.title}>Idle Timer Demo</Text>

                {/* State indicator */}
                <View
                    style={[
                        styles.stateContainer,
                        { backgroundColor: getStateColor(idleTimer.state) },
                    ]}
                >
                    <Text style={styles.stateText}>
                        {getStateLabel(idleTimer.state)}
                    </Text>
                </View>

                {/* Timer display */}
                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Time until idle:</Text>
                    <Text style={styles.timerValue}>{remainingSeconds}s</Text>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                        Last active:{" "}
                        {idleTimer.lastActiveAtMs
                            ? new Date(idleTimer.lastActiveAtMs).toLocaleTimeString()
                            : "Never"}
                    </Text>
                    <Text style={styles.infoText}>
                        Last idle:{" "}
                        {idleTimer.lastIdleAtMs
                            ? new Date(idleTimer.lastIdleAtMs).toLocaleTimeString()
                            : "Never"}
                    </Text>
                </View>

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    <View style={styles.buttonRow}>
                        <Button title="Reset" onPress={idleTimer.reset} />
                        <Button title="Pause" onPress={idleTimer.pause} />
                        <Button title="Resume" onPress={idleTimer.resume} />
                    </View>
                </View>

                {/* Test interaction elements */}
                <View style={styles.testContainer}>
                    <Text style={styles.sectionTitle}>Test Interactions</Text>
                    <Text style={styles.hint}>
                        Touch anywhere or interact with these elements to reset the timer
                    </Text>
                    <Button
                        title="Press Me"
                        onPress={() => {
                            console.log("Button pressed - timer should reset");
                        }}
                    />
                    <TextInput
                        placeholder="Type here to test keyboard events"
                        style={styles.textInput}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

/**
 * App root with IdleTimerProvider
 */
export default function App() {
    const handleIdle = useCallback(() => {
        console.log("User became idle!");
    }, []);

    const handleActive = useCallback(() => {
        console.log("User became active!");
    }, []);

    const handlePrompt = useCallback(() => {
        console.log("Prompting user - about to go idle!");
    }, []);

    return (
        <IdleTimerProvider
            options={{
                timeoutMs: TIMEOUT_MS,
                promptBeforeIdleMs: PROMPT_BEFORE_IDLE_MS,
                onIdle: handleIdle,
                onActive: handleActive,
                onPrompt: handlePrompt,
                debug: true,
            }}
        >
            <DemoScreen />
        </IdleTimerProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
    },
    stateContainer: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        marginBottom: 20,
    },
    stateText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    timerContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    timerLabel: {
        fontSize: 14,
        color: "#666",
    },
    timerValue: {
        fontSize: 48,
        fontWeight: "bold",
        color: "#333",
    },
    infoContainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        width: "100%",
        marginBottom: 20,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    controlsContainer: {
        width: "100%",
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    testContainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "#333",
    },
    hint: {
        fontSize: 12,
        color: "#999",
        textAlign: "center",
        marginBottom: 12,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        width: "100%",
        backgroundColor: "#fafafa",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 24,
        borderRadius: 16,
        alignItems: "center",
        marginHorizontal: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    idleModalContent: {
        backgroundColor: "#ffebee",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333",
    },
    modalTimer: {
        fontSize: 64,
        fontWeight: "bold",
        color: "#FF9800",
        marginBottom: 16,
    },
    modalSubtext: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 16,
    },
});
