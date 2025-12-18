import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus, Keyboard, PanResponder } from "react-native";
import {
    DEFAULT_IDLE_TIMER_OPTIONS,
    IdleTimerApi,
    IdleTimerOptions,
    IdleTimerState,
} from "./types/IdleTimerTypes";

/**
 * Hook for managing idle timer state in React Native
 *
 * Tracks user activity via touch and keyboard events, supports prompting
 * before idle, and pauses when the app is backgrounded.
 *
 * @param options - Configuration options for the idle timer
 * @returns IdleTimerApi - Functions and state for controlling the idle timer
 */
export function useIdleTimer(options: IdleTimerOptions): IdleTimerApi {
    const {
        timeoutMs,
        promptBeforeIdleMs = DEFAULT_IDLE_TIMER_OPTIONS.promptBeforeIdleMs,
        onIdle,
        onActive,
        onPrompt,
        events = DEFAULT_IDLE_TIMER_OPTIONS.events,
        startOnMount = DEFAULT_IDLE_TIMER_OPTIONS.startOnMount,
        initiallyPaused = DEFAULT_IDLE_TIMER_OPTIONS.initiallyPaused,
        debug = DEFAULT_IDLE_TIMER_OPTIONS.debug,
    } = options;

    // Validate options
    if (timeoutMs <= 0) {
        throw new Error("useIdleTimer: timeoutMs must be greater than 0");
    }
    if (promptBeforeIdleMs < 0) {
        throw new Error("useIdleTimer: promptBeforeIdleMs must be >= 0");
    }
    if (promptBeforeIdleMs >= timeoutMs) {
        throw new Error(
            "useIdleTimer: promptBeforeIdleMs must be less than timeoutMs"
        );
    }

    // Determine initial state
    const getInitialState = (): IdleTimerState => {
        if (initiallyPaused || !startOnMount) return "paused";
        return "active";
    };

    // State
    const [state, setState] = useState<IdleTimerState>(getInitialState);
    const [lastActiveAtMs, setLastActiveAtMs] = useState<number | null>(
        startOnMount && !initiallyPaused ? Date.now() : null
    );
    const [lastIdleAtMs, setLastIdleAtMs] = useState<number | null>(null);

    // Refs for timing
    const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const deadlineAtMsRef = useRef<number>(0);
    const promptAtMsRef = useRef<number>(0);
    const remainingOnPauseMsRef = useRef<number>(timeoutMs);
    const stateBeforePauseRef = useRef<IdleTimerState>("active");

    // Refs for callbacks (to avoid stale closures)
    const onIdleRef = useRef(onIdle);
    const onActiveRef = useRef(onActive);
    const onPromptRef = useRef(onPrompt);

    // Update callback refs when they change
    useEffect(() => {
        onIdleRef.current = onIdle;
    }, [onIdle]);
    useEffect(() => {
        onActiveRef.current = onActive;
    }, [onActive]);
    useEffect(() => {
        onPromptRef.current = onPrompt;
    }, [onPrompt]);

    // Debug logger
    const log = useCallback(
        (message: string, ...args: unknown[]) => {
            if (debug) {
                console.log(`[IdleTimer] ${message}`, ...args);
            }
        },
        [debug]
    );

    // Clear any existing timer
    const clearTimer = useCallback(() => {
        if (timerIdRef.current !== null) {
            clearTimeout(timerIdRef.current);
            timerIdRef.current = null;
        }
    }, []);

    // Enter prompting state
    const enterPrompting = useCallback(() => {
        log("Entering prompting state");
        setState("prompting");
        onPromptRef.current?.();

        // Schedule transition to idle
        const remainingToIdle = deadlineAtMsRef.current - Date.now();
        if (remainingToIdle > 0) {
            timerIdRef.current = setTimeout(() => {
                enterIdle();
            }, remainingToIdle);
        } else {
            // Already past deadline, go directly to idle
            enterIdle();
        }
    }, [log]);

    // Enter idle state
    const enterIdle = useCallback(() => {
        log("Entering idle state");
        clearTimer();
        setState("idle");
        setLastIdleAtMs(Date.now());
        onIdleRef.current?.();
    }, [clearTimer, log]);

    // Schedule next transition based on current time and deadlines
    const scheduleNext = useCallback(
        (fromState: IdleTimerState) => {
            clearTimer();

            const now = Date.now();

            if (fromState === "active" && promptBeforeIdleMs > 0) {
                // Schedule prompt first
                const timeToPrompt = promptAtMsRef.current - now;
                if (timeToPrompt > 0) {
                    log(`Scheduling prompt in ${timeToPrompt}ms`);
                    timerIdRef.current = setTimeout(() => {
                        enterPrompting();
                    }, timeToPrompt);
                } else {
                    // Already past prompt time, check if past idle
                    const timeToIdle = deadlineAtMsRef.current - now;
                    if (timeToIdle > 0) {
                        // In prompting phase
                        enterPrompting();
                    } else {
                        // Past idle time
                        enterIdle();
                    }
                }
            } else {
                // No prompting, go directly to idle
                const timeToIdle = deadlineAtMsRef.current - now;
                if (timeToIdle > 0) {
                    log(`Scheduling idle in ${timeToIdle}ms`);
                    timerIdRef.current = setTimeout(() => {
                        enterIdle();
                    }, timeToIdle);
                } else {
                    // Already past deadline
                    enterIdle();
                }
            }
        },
        [clearTimer, enterIdle, enterPrompting, log, promptBeforeIdleMs]
    );

    // Reset timer and mark user as active
    const reset = useCallback(() => {
        const prevState = state;
        log(`Reset called (previous state: ${prevState})`);

        clearTimer();

        const now = Date.now();
        deadlineAtMsRef.current = now + timeoutMs;
        promptAtMsRef.current = now + timeoutMs - promptBeforeIdleMs;

        setLastActiveAtMs(now);
        setState("active");

        // Fire onActive if transitioning from idle or prompting
        if (prevState === "idle" || prevState === "prompting") {
            onActiveRef.current?.();
        }

        scheduleNext("active");
    }, [clearTimer, log, promptBeforeIdleMs, scheduleNext, state, timeoutMs]);

    // Pause the timer
    const pause = useCallback(() => {
        if (state === "paused") {
            log("Already paused, ignoring pause call");
            return;
        }

        log(`Pausing (current state: ${state})`);
        clearTimer();

        // Store remaining time
        const now = Date.now();
        const remaining = deadlineAtMsRef.current - now;
        remainingOnPauseMsRef.current = Math.max(0, remaining);
        stateBeforePauseRef.current = state;

        setState("paused");
    }, [clearTimer, log, state]);

    // Resume the timer
    const resume = useCallback(() => {
        if (state !== "paused") {
            log("Not paused, ignoring resume call");
            return;
        }

        const remaining = remainingOnPauseMsRef.current;
        const prevStateBeforePause = stateBeforePauseRef.current;
        log(
            `Resuming with ${remaining}ms remaining (was: ${prevStateBeforePause})`
        );

        const now = Date.now();
        deadlineAtMsRef.current = now + remaining;
        promptAtMsRef.current =
            now + remaining - Math.min(promptBeforeIdleMs, remaining);

        setLastActiveAtMs(now);

        // Determine which state to resume to
        if (remaining <= 0) {
            // Already expired
            enterIdle();
        } else if (
            promptBeforeIdleMs > 0 &&
            remaining <= promptBeforeIdleMs &&
            prevStateBeforePause !== "idle"
        ) {
            // Should be in prompting state
            setState("prompting");
            onPromptRef.current?.();
            timerIdRef.current = setTimeout(() => {
                enterIdle();
            }, remaining);
        } else {
            // Resume to active
            setState("active");
            scheduleNext("active");
        }
    }, [enterIdle, log, promptBeforeIdleMs, scheduleNext, state]);

    // Get remaining time in milliseconds
    const getRemainingTimeMs = useCallback((): number => {
        if (state === "paused") {
            return remainingOnPauseMsRef.current;
        }
        if (state === "idle") {
            return 0;
        }
        const remaining = deadlineAtMsRef.current - Date.now();
        return Math.max(0, remaining);
    }, [state]);

    // Get remaining time in seconds (rounded)
    const getRemainingTimeSec = useCallback((): number => {
        return Math.round(getRemainingTimeMs() / 1000);
    }, [getRemainingTimeMs]);

    // Handle user activity (touch or keyboard)
    const handleUserActivity = useCallback(() => {
        if (state === "paused") {
            log("User activity while paused, ignoring");
            return;
        }
        reset();
    }, [log, reset, state]);

    // PanResponder for touch detection
    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponderCapture: () => {
                    if (events?.touch !== false) {
                        log("Touch detected");
                        handleUserActivity();
                    }
                    return false; // Don't capture, let events propagate
                },
            }),
        [events?.touch, handleUserActivity, log]
    );

    // Setup keyboard listeners
    useEffect(() => {
        const keyboardConfig = events?.keyboard;
        if (keyboardConfig === false) {
            return;
        }

        const subscriptions: Array<{ remove: () => void }> = [];

        if (keyboardConfig === "show" || keyboardConfig === "both") {
            const subscription = Keyboard.addListener("keyboardDidShow", () => {
                log("Keyboard shown");
                handleUserActivity();
            });
            subscriptions.push(subscription);
        }

        if (
            keyboardConfig === "hide" ||
            keyboardConfig === "both" ||
            keyboardConfig === undefined
        ) {
            const subscription = Keyboard.addListener("keyboardDidHide", () => {
                log("Keyboard hidden");
                handleUserActivity();
            });
            subscriptions.push(subscription);
        }

        return () => {
            subscriptions.forEach((sub) => sub.remove());
        };
    }, [events?.keyboard, handleUserActivity, log]);

    // Setup AppState listener for background/foreground
    useEffect(() => {
        let lastAppState: AppStateStatus = AppState.currentState;

        const subscription = AppState.addEventListener(
            "change",
            (nextAppState: AppStateStatus) => {
                log(`AppState changed: ${lastAppState} -> ${nextAppState}`);

                if (
                    lastAppState === "active" &&
                    (nextAppState === "background" ||
                        nextAppState === "inactive")
                ) {
                    // Going to background - pause
                    pause();
                } else if (
                    (lastAppState === "background" ||
                        lastAppState === "inactive") &&
                    nextAppState === "active"
                ) {
                    // Coming to foreground - resume
                    resume();
                }

                lastAppState = nextAppState;
            }
        );

        return () => {
            subscription.remove();
        };
    }, [log, pause, resume]);

    // Initial setup on mount
    useEffect(() => {
        if (startOnMount && !initiallyPaused) {
            log("Starting timer on mount");
            const now = Date.now();
            deadlineAtMsRef.current = now + timeoutMs;
            promptAtMsRef.current = now + timeoutMs - promptBeforeIdleMs;
            scheduleNext("active");
        }

        return () => {
            log("Unmounting, clearing timer");
            clearTimer();
        };
        // Only run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        state,
        reset,
        pause,
        resume,
        getRemainingTimeMs,
        getRemainingTimeSec,
        lastActiveAtMs,
        lastIdleAtMs,
        panHandlers: panResponder.panHandlers,
    };
}
