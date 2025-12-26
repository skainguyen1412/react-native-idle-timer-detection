import React, { useCallback, useEffect, useRef } from "react";
import { Keyboard, PanResponder, AppState } from "react-native";
import { UseIdleTimerProps } from "./types/useIdleTimerProps";

export function useIdleTimer(props: UseIdleTimerProps = {}) {
    const startTime = useRef<number>(Date.now());
    const currentTime = useRef<number>(Date.now());
    const lastIdle = useRef<number>(null);
    const lastReset = useRef<number>(null);

    const pauseTime = useRef<number>(null);

    const isIdle = useRef<boolean>(false);

    const remainingTime = useRef<number>(props.timeout ?? 10); // Time countdown to trigger onIdle

    const currentState = useRef<"running" | "paused" | "idle">("running");

    const tid = useRef<NodeJS.Timeout | null>(null);

    const onIdle = () => {
        console.log("onIdle");
        props.onIdle?.();
    };

    const getCurrentState = () => {
        return currentState.current;
    };

    const getRemainingTime = () => {
        // Handle for special case when user pause the timer
        if (currentState.current === "paused" && pauseTime.current) {
            if (pauseTime.current > 0) {
                return Math.round(pauseTime.current / 1000);
            } else {
                return 0;
            }
        } else {
            const timeOutTime =
                currentTime.current + remainingTime.current * 1000;
            const remainingTimeValue = timeOutTime - Date.now();
            if (remainingTimeValue > 0) {
                return Math.round(remainingTimeValue / 1000);
            } else {
                return 0;
            }
        }
    };

    const pause = useCallback(() => {
        // We need to clear the timeout and pause the remainingTime
        if (tid.current) {
            clearTimeout(tid.current);
            tid.current = null;
        }

        currentState.current = "paused";
        pauseTime.current =
            currentTime.current + remainingTime.current * 1000 - Date.now();
    }, []);

    const handleIdle = useCallback(() => {
        isIdle.current = true;

        // Trigger action
        onIdle();
    }, []);

    const resume = useCallback(() => {
        currentState.current = "running";

        // Use pauseTime if available (when resuming from paused state), otherwise use remainingTime
        const timeoutDuration =
            pauseTime.current !== null
                ? pauseTime.current
                : remainingTime.current * 1000;

        // Update currentTime and remainingTime when resuming
        if (pauseTime.current !== null) {
            currentTime.current = Date.now();
            remainingTime.current = Math.max(
                0,
                Math.round(timeoutDuration / 1000)
            );
        }

        pauseTime.current = null;

        if (!tid.current) {
            tid.current = setTimeout(() => {
                handleIdle();
            }, timeoutDuration);
        }
    }, [handleIdle]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: (evt, gestureState) => {
                console.log("User touched the screen!");

                reset();
                return false;
            },
        })
    ).current;

    useEffect(() => {
        // On mount
        console.log("mounting");
        tid.current = setTimeout(() => {
            handleIdle();
        }, remainingTime.current * 1000);

        return () => {
            if (tid.current) {
                clearTimeout(tid.current);
            }
        };
    }, []);

    useEffect(() => {
        // Guard against AppState not being available (e.g., in test environments)
        if (!AppState || !AppState.addEventListener) {
            return;
        }

        const subscription = AppState.addEventListener("change", (state) => {
            // Pause when the app is in the background
            if (state === "active") {
                console.log("AppState changed to active, resuming");
                resume();
            } else {
                console.log("AppState changed to background, pausing");
                pause();
            }

            console.log("AppState changed to", state);
        });

        return () => {
            subscription.remove();
        };
    }, [resume, pause]);

    const reset = () => {
        currentTime.current = Date.now();
        lastReset.current = Date.now();
        // isIdle.current = false;

        if (tid.current) {
            clearTimeout(tid.current);
            tid.current = null;
        }

        // Reset state to running and clear pauseTime
        currentState.current = "running";
        pauseTime.current = null;

        // Reset remainingTime back to the original timeout value
        remainingTime.current = props.timeout ?? 10;

        tid.current = setTimeout(() => {
            handleIdle();
        }, remainingTime.current * 1000);
    };

    useEffect(() => {
        // Guard against Keyboard not being available (e.g., in test environments)
        if (!Keyboard || !Keyboard.addListener) {
            return;
        }

        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            console.log("Keyboard is OPEN");
            reset();
            pause();
        });

        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            resume();
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const getIsIdle = useCallback(() => {
        return isIdle.current;
    }, [isIdle.current]);

    const setIsIdle = useCallback(
        (value: boolean) => {
            isIdle.current = value;
        },
        [isIdle.current]
    );

    const idleTimer = {
        panResponder,
        reset,
        currentTime: currentTime.current,
        startTime: startTime.current,
        getRemainingTime,
        pause,
        resume,
        getIsIdle,
        getLastReset: () => lastReset.current,
        getCurrentState,
    };

    return idleTimer;
}
