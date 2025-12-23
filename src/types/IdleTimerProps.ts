import type { PanResponderInstance } from "react-native";

export interface IdleTimerProps {
    panResponder: PanResponderInstance;
    reset: () => void;
    startTime: number;
    getRemainingTime: () => number;
    pause: () => void;
    resume: () => void;
    currentTime: number;
    getIsIdle: () => boolean;
    getLastReset: () => number | null;
    getCurrentState: () => "running" | "paused" | "idle";
    // idle: boolean;
    // prompted: boolean;
    // paused: boolean;
    // remaining: number;
    // promptTime: number;
    // totalIdleTime: number;
    // startTime: number;
    // lastReset: number;
    // lastIdle: number;
    // lastActive: number;
}
