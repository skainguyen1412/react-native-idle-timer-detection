/**
 * Configuration options for the idle timer hook.
 */
export interface UseIdleTimerProps {
    /**
     * Timeout duration in seconds before the timer goes idle.
     * Default: 10 seconds
     */
    timeout?: number;
    /**
     * Callback fired when the timer becomes idle (timeout reached).
     * Fires once per idle cycle.
     */
    onIdle?: () => void;
    /**
     * Callback fired when the user becomes active after being idle.
     * Fires when transitioning from idle -> active state.
     */
    onActive?: () => void;
    /**
     * Callback fired on every user action (touch, keyboard, etc.).
     * Useful for tracking all user interactions.
     */
    onAction?: () => void;
}
