import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Keyboard, PanResponder } from "react-native";

export function useIdleTimer() {
    const startTime = useRef<number>(Date.now());

    const currentTime = useRef<number>(Date.now());
    const lastIdle = useRef<number>(null);
    const lastReset = useRef<number>(null);

    const isPause = useRef<boolean>(false);
    const pauseTime = useRef<number>(null);

    const isIdle = useRef<boolean>(false);

    const remaningTime = useRef<number>(10); // Time countdown to trigger onIdle

    const tid = useRef<NodeJS.Timeout | null>(null);

    const onIdle = () => {
        console.log("onIdle");
    };

    const getRemainingTime = () => {
        // Handle for special case when user pause the timer
        if (isPause.current && pauseTime.current) {
            if (pauseTime.current > 0) {
                return (pauseTime.current / 1000).toFixed();
            } else {
                return 0;
            }
        } else {
            const timeOutTime =
                currentTime.current + remaningTime.current * 1000;
            const remainingTime = timeOutTime - Date.now();
            if (remainingTime > 0) {
                return (remainingTime / 1000).toFixed();
            } else {
                return 0;
            }
        }
    };

    const pause = () => {
        // We need to clear the timeout and pause the remainingTime
        if (tid.current) {
            clearTimeout(tid.current);
        }

        isPause.current = true;
        pauseTime.current =
            currentTime.current + remaningTime.current * 1000 - Date.now();
    };

    const handleIdle = () => {
        isIdle.current = true;

        // Trigger action
        onIdle();
    };

    const resume = () => {
        isPause.current = false;
        pauseTime.current = null;

        if (!tid.current) {
            tid.current = setTimeout(() => {
                handleIdle();
            }, remaningTime.current * 1000);
        }
    };

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
        }, remaningTime.current * 1000);

        return () => {
            if (tid.current) {
                clearTimeout(tid.current);
            }
        };
    }, []);

    const reset = () => {
        currentTime.current = Date.now();
        lastReset.current = Date.now();
        // isIdle.current = false;

        if (tid.current) {
            clearTimeout(tid.current);
        }

        tid.current = setTimeout(() => {
            handleIdle();
        }, remaningTime.current * 1000);
    };

    useEffect(() => {
        // --- A. Listen for Keyboard Appearance ---

        // Fired when keyboard starts sliding up
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            // TODO: Implement reset and pause at here

            console.log("Keyboard is OPEN");
        });

        // Fired when keyboard is fully closed
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            // TODO: Implement resume
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const getIsIdle = useCallback(() => {
        console.log("getIsIdle", isIdle.current);
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
    };

    return idleTimer;
}
