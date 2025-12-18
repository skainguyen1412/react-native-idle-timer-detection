/**
 * react-native-idle-timer
 *
 * A React Native idle timer hook and provider for detecting user inactivity.
 * Supports prompting before idle, pause/resume, and automatic background handling.
 */

// Hook
export { useIdleTimer } from "./useIdleTimer";

// Provider and Context
export {
    IdleTimerProvider,
    useIdleTimerContext,
    useRequiredIdleTimerContext,
} from "./IdleTimerContext";
export type { IdleTimerProviderProps } from "./IdleTimerContext";

// Types
export type {
    IdleTimerState,
    IdleTimerOptions,
    IdleTimerApi,
    IdleTimerEvents,
    KeyboardEventConfig,
} from "./types/IdleTimerTypes";
export { DEFAULT_IDLE_TIMER_OPTIONS } from "./types/IdleTimerTypes";

