import React, { useEffect, useRef, useState } from "react";
import { Keyboard, PanResponder } from "react-native";

export function useIdleTimer() {
    // This countdown timer will trigger right away when mounted
    const startTime = useRef<number>(Date.now());
    const lastIdle = useRef<number>(null);
    const lastReset = useRef<number>(null);

    const remaningTime = useRef<number>(10); // Time countdown to trigger onIdle

    const tid = useRef<NodeJS.Timeout | null>(null);

    const onIdle = () => {
        console.log("onIdle");
    };

    const toggleIdle = () => {
        if (tid.current) {
            clearTimeout(tid.current);
        }

        // Create timeout and trigger onidle if the timeout is not destroy before it reach it will trigger onIdle
        tid.current = setTimeout(() => {
            onIdle();
        }, remaningTime.current * 1000);
    };

    const getRemainingTime = () => {
        const timeOutTime = startTime.current + remaningTime.current * 1000;

        const remainingTime = timeOutTime - Date.now();

        if (remainingTime > 0) {
            return (remainingTime / 1000).toFixed();
        } else {
            return 0;
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
    }, []);

    const reset = () => {
        startTime.current = Date.now();
        lastReset.current = Date.now();
        toggleIdle();
    };

    useEffect(() => {
        // --- A. Listen for Keyboard Appearance ---

        // Fired when keyboard starts sliding up
        const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
            console.log("Keyboard is OPEN");
        });

        // Fired when keyboard is fully closed
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            console.log("Keyboard is CLOSED");

            reset();
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const idleTimer = {
        panResponder,
        reset,
        startTime: startTime.current,
        getRemainingTime,
    };

    return idleTimer;
}
