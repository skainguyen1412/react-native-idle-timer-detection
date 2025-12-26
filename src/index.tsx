import { useEffect, useState } from "react";
import {
    Button,
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { StyleSheet } from "react-native";
import { useIdleTimerContext } from "./IdleTimerContext";

interface DemoScreenProps {
    isIdle?: boolean;
}

export const DemoScreen = ({ isIdle: isIdleProp }: DemoScreenProps = {}) => {
    const [countdownTime, setCountdownTime] = useState<number>(0);
    const [lastResetTime, setLastResetTime] = useState<number | null>(null);
    const [lastIdleTime, setLastIdleTime] = useState<number | null>(null);

    const idleTimer = useIdleTimerContext();

    // Use prop for idle state (event-driven) or fallback to polling
    const isIdle = isIdleProp ?? idleTimer.getIsIdle();
    const currentState = idleTimer.getCurrentState();

    // Lightweight interval only for countdown display (1 second is sufficient for UI)
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCountdownTime(idleTimer.getRemainingTime());
            setLastResetTime(idleTimer.getLastReset());
            setLastIdleTime(idleTimer.getLastIdle());
        }, 1000);

        // Initial update
        setCountdownTime(idleTimer.getRemainingTime());
        setLastResetTime(idleTimer.getLastReset());
        setLastIdleTime(idleTimer.getLastIdle());

        return () => clearInterval(intervalId);
    }, [idleTimer]);

    const formatTimestamp = (timestamp: number | null): string => {
        if (!timestamp) return "Never";
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };

    const getStateColor = (): string => {
        switch (currentState) {
            case "idle":
                return "#ef4444"; // red
            case "paused":
                return "#f59e0b"; // amber
            case "running":
                return "#10b981"; // green
            default:
                return "#6b7280"; // gray
        }
    };

    const getStateEmoji = (): string => {
        switch (currentState) {
            case "idle":
                return "😴";
            case "paused":
                return "⏸️";
            case "running":
                return "▶️";
            default:
                return "❓";
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.title}>Idle Timer Demo</Text>
                    <Text style={styles.subtitle}>React Native Idle Timer</Text>
                </View>

                {/* Status Card */}
                <View style={[styles.card, styles.statusCard]}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusEmoji}>
                            {getStateEmoji()}
                        </Text>
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusLabel}>Status</Text>
                            <Text
                                style={[
                                    styles.statusValue,
                                    { color: getStateColor() },
                                ]}
                            >
                                {currentState.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>User Activity:</Text>
                        <Text
                            style={[
                                styles.infoValue,
                                { color: isIdle ? "#ef4444" : "#10b981" },
                            ]}
                        >
                            {isIdle ? "Idle" : "Active"}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Remaining Time:</Text>
                        <Text style={[styles.infoValue, styles.countdownText]}>
                            {countdownTime}s
                        </Text>
                    </View>
                </View>

                {/* Timer Info Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Timer Information</Text>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Last Reset:</Text>
                        <Text style={styles.infoValue}>
                            {formatTimestamp(lastResetTime)}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Last Idle:</Text>
                        <Text style={styles.infoValue}>
                            {formatTimestamp(lastIdleTime)}
                        </Text>
                    </View>
                </View>

                {/* Controls Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Controls</Text>
                    <View style={styles.divider} />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.pauseButton,
                                currentState === "paused" &&
                                    styles.buttonActive,
                            ]}
                            onPress={() => idleTimer.pause()}
                        >
                            <Text style={styles.buttonText}>⏸️ Pause</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.resumeButton,
                                currentState === "running" &&
                                    styles.buttonActive,
                            ]}
                            onPress={() => idleTimer.resume()}
                        >
                            <Text style={styles.buttonText}>▶️ Resume</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.button, styles.resetButton]}
                        onPress={() => idleTimer.reset()}
                    >
                        <Text style={styles.buttonText}>🔄 Reset Timer</Text>
                    </TouchableOpacity>
                </View>

                {/* Interactive Test Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Interactive Test</Text>
                    <Text style={styles.cardDescription}>
                        Type in the input below or touch anywhere to reset the
                        timer
                    </Text>
                    <View style={styles.divider} />
                    <TextInput
                        placeholder="Type here to test activity detection..."
                        placeholderTextColor="#9ca3af"
                        style={styles.textInput}
                        multiline
                    />
                    <Text style={styles.hintText}>
                        💡 Tip: Try pausing, then typing. The keyboard will
                        pause the timer.
                    </Text>
                </View>

                {/* Idle Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isIdle}
                    onRequestClose={() => {}}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalEmoji}>😴</Text>
                            <Text style={styles.modalTitle}>You're Idle!</Text>
                            <Text style={styles.modalMessage}>
                                You've been inactive for too long. Touch
                                anywhere to become active again.
                            </Text>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => idleTimer.reset()}
                            >
                                <Text style={styles.modalButtonText}>
                                    I'm Back!
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusCard: {
        borderLeftWidth: 4,
        borderLeftColor: "#10b981",
    },
    statusHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    statusEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    statusInfo: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 12,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 24,
        fontWeight: "bold",
    },
    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 4,
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: "#6b7280",
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
    },
    countdownText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#3b82f6",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
    },
    pauseButton: {
        backgroundColor: "#fef3c7",
    },
    resumeButton: {
        backgroundColor: "#d1fae5",
    },
    resetButton: {
        backgroundColor: "#dbeafe",
        marginTop: 0,
    },
    buttonActive: {
        opacity: 0.8,
        borderWidth: 2,
        borderColor: "#3b82f6",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#111827",
        backgroundColor: "#ffffff",
        minHeight: 100,
        textAlignVertical: "top",
    },
    hintText: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 8,
        fontStyle: "italic",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        width: "100%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111827",
        marginBottom: 12,
        textAlign: "center",
    },
    modalMessage: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 24,
    },
    modalButton: {
        backgroundColor: "#3b82f6",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        minWidth: 200,
    },
    modalButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
});
