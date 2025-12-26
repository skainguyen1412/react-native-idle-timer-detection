import React, { useCallback, useEffect, useRef } from "react";
import { Keyboard, PanResponder, AppState } from "react-native";
import { UseIdleTimerProps } from "./types/useIdleTimerProps";

export function useIdleTimer(props: UseIdleTimerProps = {}) {
    // Timeout in seconds, converted to ms internally
    const timeoutSeconds = props.timeout ?? 10;
    const timeoutMs = timeoutSeconds * 1000;

    // Timestamps
    const startTime = useRef<number>(Date.now());
    const lastIdle = useRef<number | null>(null);
    const lastReset = useRef<number | null>(null);

    // Deadline-based time tracking
    const deadlineMs = useRef<number | null>(null);
    const pausedRemainingMs = useRef<number | null>(null);

    // State tracking
    const isIdle = useRef<boolean>(false);
    const currentState = useRef<"running" | "paused" | "idle">("running");

    // Timer handle (RN-safe type)
    const tid = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Pause reason tracking (for composable pause sources)
    const pauseReasons = useRef<Set<string>>(new Set());

    // Store callbacks in refs to prevent stale closures
    const onIdleRef = useRef(props.onIdle);
    const onActiveRef = useRef(props.onActive);
    const onActionRef = useRef(props.onAction);

    // Update callback refs when props change
    useEffect(() => {
        onIdleRef.current = props.onIdle;
        onActiveRef.current = props.onActive;
        onActionRef.current = props.onAction;
    }, [props.onIdle, props.onActive, props.onAction]);

    // Scheduler helpers
    const clearTimer = useCallback(() => {
        if (tid.current) {
            clearTimeout(tid.current);
            tid.current = null;
        }
    }, []);

    const handleIdle = useCallback(() => {
        // Prevent firing multiple times if already idle
        if (currentState.current === "idle") {
            return;
        }

        currentState.current = "idle";
        isIdle.current = true;
        lastIdle.current = Date.now();

        onIdleRef.current?.();
    }, []);

    const scheduleIdle = useCallback(
        (remainingMs: number) => {
            clearTimer();
            tid.current = setTimeout(() => {
                handleIdle();
            }, Math.max(0, remainingMs));
        },
        [clearTimer, handleIdle]
    );

    const getRemainingTime = useCallback(() => {
        if (
            currentState.current === "paused" &&
            pausedRemainingMs.current !== null
        ) {
            // When paused, return the stored remaining time in seconds
            return Math.max(0, Math.round(pausedRemainingMs.current / 1000));
        } else if (currentState.current === "idle") {
            return 0;
        } else if (deadlineMs.current !== null) {
            // When running, calculate remaining time from deadline
            const remainingMs = Math.max(0, deadlineMs.current - Date.now());
            return Math.round(remainingMs / 1000);
        } else {
            // Fallback: return full timeout
            return timeoutSeconds;
        }
    }, [timeoutSeconds]);

    const pause = useCallback(
        (reason: string = "manual") => {
            // Don't pause if already paused or idle
            if (
                currentState.current === "paused" ||
                currentState.current === "idle"
            ) {
                pauseReasons.current.add(reason);
                return;
            }

            clearTimer();
            pauseReasons.current.add(reason);

            // Calculate and store remaining time
            if (deadlineMs.current !== null) {
                pausedRemainingMs.current = Math.max(
                    0,
                    deadlineMs.current - Date.now()
                );
            } else {
                pausedRemainingMs.current = timeoutMs;
            }

            currentState.current = "paused";
        },
        [clearTimer, timeoutMs]
    );

    const resume = useCallback(
        (reason: string = "manual") => {
            // Remove pause reason
            pauseReasons.current.delete(reason);

            // Don't resume if other pause reasons still exist
            if (pauseReasons.current.size > 0) {
                return;
            }

            // Don't resume if already running
            if (currentState.current === "running") {
                return;
            }

            // Calculate deadline from paused remaining time
            const remainingMs =
                pausedRemainingMs.current !== null
                    ? pausedRemainingMs.current
                    : timeoutMs;

            deadlineMs.current = Date.now() + remainingMs;
            pausedRemainingMs.current = null;
            currentState.current = "running";

            scheduleIdle(remainingMs);
        },
        [scheduleIdle, timeoutMs]
    );

    const reset = useCallback(() => {
        const wasIdle = isIdle.current;

        // Clear idle state
        isIdle.current = false;
        currentState.current = "running";
        lastReset.current = Date.now();

        // Clear pause state
        pausedRemainingMs.current = null;
        pauseReasons.current.clear();

        // Fire callbacks
        onActionRef.current?.();
        if (wasIdle) {
            onActiveRef.current?.();
        }

        // Reset deadline and schedule new timeout
        deadlineMs.current = Date.now() + timeoutMs;
        scheduleIdle(timeoutMs);
    }, [scheduleIdle, timeoutMs]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: () => {
                reset();
                return false;
            },
        })
    ).current;

    // Initialize timer on mount
    useEffect(() => {
        deadlineMs.current = Date.now() + timeoutMs;
        scheduleIdle(timeoutMs);

        return () => {
            clearTimer();
        };
    }, []);

    // AppState listener
    useEffect(() => {
        if (!AppState || !AppState.addEventListener) {
            return;
        }

        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                resume("appstate");
            } else {
                pause("appstate");
            }
        });

        return () => {
            subscription.remove();
        };
    }, [pause, resume]);

    // Keyboard listeners
    useEffect(() => {
        if (!Keyboard || !Keyboard.addListener) {
            return;
        }

        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            reset(); // Keyboard open counts as activity
            pause("keyboard");
        });

        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            resume("keyboard");
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [reset, pause, resume]);

    const getCurrentState = useCallback(() => {
        return currentState.current;
    }, []);

    const getIsIdle = useCallback(() => {
        return isIdle.current;
    }, []);

    const getLastReset = useCallback(() => {
        return lastReset.current;
    }, []);

    const getLastIdle = useCallback(() => {
        return lastIdle.current;
    }, []);

    const getCurrentTime = useCallback(() => {
        return Date.now();
    }, []);

    const getStartTime = useCallback(() => {
        return startTime.current;
    }, []);

    const idleTimer = {
        panResponder,
        reset,
        getCurrentTime,
        getStartTime,
        getRemainingTime,
        pause,
        resume,
        getIsIdle,
        getLastReset,
        getLastIdle,
        getCurrentState,
    };

    return idleTimer;
}
