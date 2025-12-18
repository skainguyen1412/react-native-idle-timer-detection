import type { PanResponderInstance } from "react-native";

/**
 * State of the idle timer
 * - "active": user is active, countdown running
 * - "prompting": warning before idle, countdown running
 * - "idle": timeout reached
 * - "paused": timer paused (manual or app backgrounded)
 */
export type IdleTimerState = "active" | "prompting" | "idle" | "paused";

/**
 * Keyboard event configuration
 * - "hide": reset on keyboard hide
 * - "show": reset on keyboard show
 * - "both": reset on both show and hide
 * - false: disable keyboard event handling
 */
export type KeyboardEventConfig = "hide" | "show" | "both" | false;

/**
 * Events configuration for activity detection
 */
export interface IdleTimerEvents {
    /** Track touch/gesture events (default: true) */
    touch?: boolean;
    /** Track keyboard events (default: "hide") */
    keyboard?: KeyboardEventConfig;
}

/**
 * Options for configuring the idle timer
 */
export interface IdleTimerOptions {
    /** Time in milliseconds until user is considered idle (required) */
    timeoutMs: number;
    /** Time in milliseconds before idle to trigger onPrompt (default: 0) */
    promptBeforeIdleMs?: number;
    /** Callback fired when user becomes idle */
    onIdle?: () => void;
    /** Callback fired when user becomes active (from idle/prompting state) */
    onActive?: () => void;
    /** Callback fired when entering prompting state */
    onPrompt?: () => void;
    /** Event sources configuration (default: { touch: true, keyboard: "hide" }) */
    events?: IdleTimerEvents;
    /** Start timer on mount (default: true) */
    startOnMount?: boolean;
    /** Start in paused state (default: false) */
    initiallyPaused?: boolean;
    /** Enable debug logging (default: false) */
    debug?: boolean;
}

/**
 * API returned by useIdleTimer hook
 */
export interface IdleTimerApi {
    /** Current state of the idle timer */
    state: IdleTimerState;
    /** Reset the timer and mark user as active */
    reset: () => void;
    /** Pause the timer */
    pause: () => void;
    /** Resume the timer */
    resume: () => void;
    /** Get remaining time until idle in milliseconds */
    getRemainingTimeMs: () => number;
    /** Get remaining time until idle in seconds (rounded) */
    getRemainingTimeSec: () => number;
    /** Timestamp of last user activity (null if never active) */
    lastActiveAtMs: number | null;
    /** Timestamp of last idle event (null if never idle) */
    lastIdleAtMs: number | null;
    /** PanResponder handlers to attach to a View for touch detection */
    panHandlers: PanResponderInstance["panHandlers"];
}

/**
 * Default options for the idle timer
 */
export const DEFAULT_IDLE_TIMER_OPTIONS: Required<
    Omit<IdleTimerOptions, "timeoutMs" | "onIdle" | "onActive" | "onPrompt">
> = {
    promptBeforeIdleMs: 0,
    events: { touch: true, keyboard: "hide" },
    startOnMount: true,
    initiallyPaused: false,
    debug: false,
};

