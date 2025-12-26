import type { PanResponderInstance } from "react-native";

/**
 * Handle/API returned by `useIdleTimer` hook.
 * Provides methods to control and query the idle timer state.
 */
export interface IdleTimerHandle {
    /** PanResponder instance for capturing touch events */
    panResponder: PanResponderInstance;
    /** Reset the timer and mark user as active */
    reset: () => void;
    /** Get the timestamp when the timer was started (in milliseconds) */
    getStartTime: () => number;
    /** Get the current timestamp (in milliseconds) */
    getCurrentTime: () => number;
    /** Get remaining time until idle (in seconds) */
    getRemainingTime: () => number;
    /** Pause the timer */
    pause: () => void;
    /** Resume the timer */
    resume: () => void;
    /** Check if the timer is currently idle */
    getIsIdle: () => boolean;
    /** Get the timestamp of the last reset (in milliseconds), or null if never reset */
    getLastReset: () => number | null;
    /** Get the timestamp of the last idle event (in milliseconds), or null if never idle */
    getLastIdle: () => number | null;
    /** Get the current state: "running" | "paused" | "idle" */
    getCurrentState: () => "running" | "paused" | "idle";
}
