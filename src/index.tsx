import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useIdleTimer } from "./useIdleTimer";

// =============================================================================
// DEMO SCREEN
// A simple demo showcasing react-native-idle-timer features
// =============================================================================

export const DemoScreen = () => {
    const [remainingTime, setRemainingTime] = useState(0);
    const idleTimer = useIdleTimer({
        timeout: 30, // 30 seconds
        onIdle: () => {
            console.log("User is idle");
        },
        onActive: () => {
            console.log("User is active");
        },
    });

    const isIdle = idleTimer.getIsIdle();
    const state = idleTimer.getCurrentState();

    // Update countdown every second
    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime(idleTimer.getRemainingTime());
        }, 1000);
        setRemainingTime(idleTimer.getRemainingTime());
        return () => clearInterval(interval);
    }, [idleTimer]);

    return (
        <View style={styles.container} {...idleTimer.panResponder.panHandlers}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <Text style={styles.logo}>⏱️</Text>
                <Text style={styles.title}>Idle Timer</Text>
                <Text style={styles.subtitle}>React Native Demo</Text>

                {/* Main Status Display */}
                <View style={styles.statusContainer}>
                    <Text style={styles.countdown}>{remainingTime}</Text>
                    <Text style={styles.countdownLabel}>seconds remaining</Text>
                    <StatusBadge state={state} />
                </View>

                {/* Control Buttons */}
                <View style={styles.controls}>
                    <ControlButton
                        label="Pause"
                        icon="⏸"
                        onPress={idleTimer.pause}
                        active={state === "paused"}
                        variant="warning"
                    />
                    <ControlButton
                        label="Resume"
                        icon="▶️"
                        onPress={idleTimer.resume}
                        active={state === "running"}
                        variant="success"
                    />
                    <ControlButton
                        label="Reset"
                        icon="↻"
                        onPress={idleTimer.reset}
                        variant="primary"
                    />
                </View>

                {/* Interactive Test Area */}
                <View style={styles.testSection}>
                    <Text style={styles.sectionTitle}>
                        Test Activity Detection
                    </Text>
                    <Text style={styles.sectionHint}>
                        Touch or type below to reset the timer
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Start typing..."
                        placeholderTextColor="#666"
                        multiline
                    />
                </View>

                {/* API Reference */}
                <View style={styles.apiSection}>
                    <Text style={styles.sectionTitle}>Available Methods</Text>
                    <ApiMethod
                        name="reset()"
                        desc="Reset timer & mark active"
                    />
                    <ApiMethod name="pause()" desc="Pause the countdown" />
                    <ApiMethod name="resume()" desc="Resume the countdown" />
                    <ApiMethod
                        name="getRemainingTime()"
                        desc="Get seconds left"
                    />
                    <ApiMethod
                        name="getIsIdle()"
                        desc="Check if user is idle"
                    />
                    <ApiMethod
                        name="getCurrentState()"
                        desc="Get timer state"
                    />
                </View>
            </ScrollView>

            {/* Idle Modal */}
            <IdleModal visible={isIdle} onDismiss={idleTimer.reset} />
        </View>
    );
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const StatusBadge = ({ state }: { state: "running" | "paused" | "idle" }) => {
    const config = {
        running: { color: "#22c55e", label: "RUNNING" },
        paused: { color: "#f59e0b", label: "PAUSED" },
        idle: { color: "#ef4444", label: "IDLE" },
    }[state];

    return (
        <View style={[styles.badge, { backgroundColor: config.color + "20" }]}>
            <View
                style={[styles.badgeDot, { backgroundColor: config.color }]}
            />
            <Text style={[styles.badgeText, { color: config.color }]}>
                {config.label}
            </Text>
        </View>
    );
};

interface ControlButtonProps {
    label: string;
    icon: string;
    onPress: () => void;
    active?: boolean;
    variant: "primary" | "success" | "warning";
}

const ControlButton = ({
    label,
    icon,
    onPress,
    active,
    variant,
}: ControlButtonProps) => {
    const colors = {
        primary: "#3b82f6",
        success: "#22c55e",
        warning: "#f59e0b",
    };
    const color = colors[variant];

    return (
        <Pressable
            style={({ pressed }) => [
                styles.controlBtn,
                active && { borderColor: color, borderWidth: 2 },
                pressed && { opacity: 0.8 },
            ]}
            onPress={onPress}
        >
            <Text style={styles.controlIcon}>{icon}</Text>
            <Text style={styles.controlLabel}>{label}</Text>
        </Pressable>
    );
};

const ApiMethod = ({ name, desc }: { name: string; desc: string }) => (
    <View style={styles.apiRow}>
        <Text style={styles.apiName}>{name}</Text>
        <Text style={styles.apiDesc}>{desc}</Text>
    </View>
);

interface IdleModalProps {
    visible: boolean;
    onDismiss: () => void;
}

const IdleModal = ({ visible, onDismiss }: IdleModalProps) => (
    <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
                <Text style={styles.modalEmoji}>💤</Text>
                <Text style={styles.modalTitle}>You're Idle</Text>
                <Text style={styles.modalText}>
                    No activity detected. Tap below to continue.
                </Text>
                <Pressable
                    style={({ pressed }) => [
                        styles.modalBtn,
                        pressed && { opacity: 0.9 },
                    ]}
                    onPress={onDismiss}
                >
                    <Text style={styles.modalBtnText}>I'm Back</Text>
                </Pressable>
            </View>
        </View>
    </Modal>
);

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 72,
        alignItems: "center",
    },

    // Header
    logo: {
        fontSize: 48,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#f8fafc",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "#64748b",
        marginTop: 4,
    },

    // Status
    statusContainer: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 32,
    },
    countdown: {
        fontSize: 96,
        fontWeight: "200",
        color: "#f8fafc",
        lineHeight: 100,
    },
    countdownLabel: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 4,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 16,
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.5,
    },

    // Controls
    controls: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 40,
    },
    controlBtn: {
        backgroundColor: "#1e293b",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        minWidth: 90,
        borderWidth: 1,
        borderColor: "#334155",
    },
    controlIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    controlLabel: {
        color: "#94a3b8",
        fontSize: 13,
        fontWeight: "500",
    },

    // Test Section
    testSection: {
        width: "100%",
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#f8fafc",
        marginBottom: 4,
    },
    sectionHint: {
        fontSize: 13,
        color: "#64748b",
        marginBottom: 16,
    },
    input: {
        backgroundColor: "#0f172a",
        borderRadius: 10,
        padding: 16,
        color: "#f8fafc",
        fontSize: 15,
        minHeight: 80,
        textAlignVertical: "top",
        borderWidth: 1,
        borderColor: "#334155",
    },

    // API Section
    apiSection: {
        width: "100%",
        backgroundColor: "#1e293b",
        borderRadius: 16,
        padding: 20,
    },
    apiRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    apiName: {
        fontFamily: "monospace",
        fontSize: 13,
        color: "#38bdf8",
    },
    apiDesc: {
        fontSize: 13,
        color: "#64748b",
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalCard: {
        backgroundColor: "#1e293b",
        borderRadius: 20,
        padding: 32,
        alignItems: "center",
        width: "100%",
        maxWidth: 320,
    },
    modalEmoji: {
        fontSize: 56,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#f8fafc",
        marginBottom: 8,
    },
    modalText: {
        fontSize: 15,
        color: "#94a3b8",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    modalBtn: {
        backgroundColor: "#3b82f6",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 10,
    },
    modalBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
