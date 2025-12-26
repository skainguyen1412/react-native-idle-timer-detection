import { renderHook } from "@testing-library/react-native";
import { describe, expect, test, beforeEach, afterEach } from "@jest/globals";
import { useIdleTimer } from "../src/useIdleTimer";
import { jest } from "@jest/globals";

describe("useIdleTimer", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const setup = (props?: Parameters<typeof useIdleTimer>[0]) => {
        return renderHook(() => useIdleTimer(props));
    };

    test("init useIdleTimer", () => {
        const { result } = setup();

        expect(result.current.getStartTime()).toBeDefined();
        expect(result.current.getCurrentTime()).toBeDefined();
        expect(result.current.panResponder).toBeDefined();
        expect(result.current.getRemainingTime()).toEqual(10);
        expect(result.current.getCurrentState()).toEqual("running");
        expect(result.current.getIsIdle()).toBe(false);
        expect(result.current.getLastReset()).toBeNull();
        expect(result.current.getLastIdle()).toBeNull();
    });

    test("reset useIdleTimer", () => {
        const { result } = setup();

        jest.advanceTimersByTime(2000);
        result.current.reset();

        const resetTime = Date.now();
        expect(result.current.getLastReset()).toBeLessThanOrEqual(resetTime);
        expect(result.current.getLastReset()).toBeGreaterThan(resetTime - 1000);
        expect(result.current.getRemainingTime()).toEqual(10);
        expect(result.current.getCurrentState()).toEqual("running");
        expect(result.current.getIsIdle()).toBe(false);
    });

    test("pause useIdleTimer", () => {
        const { result } = setup();

        // Let some time pass first
        jest.advanceTimersByTime(1000);
        const timeBeforePause = result.current.getRemainingTime();

        result.current.pause();

        expect(result.current.getCurrentState()).toEqual("paused");
        // When paused, remaining time should stay the same (not count down)
        const pausedTime = result.current.getRemainingTime();
        expect(pausedTime).toBeGreaterThanOrEqual(timeBeforePause - 1); // Allow 1 second tolerance
        expect(pausedTime).toBeLessThanOrEqual(timeBeforePause);

        // Advance time - paused timer should not count down
        jest.advanceTimersByTime(2000);
        expect(result.current.getRemainingTime()).toEqual(pausedTime);
        expect(result.current.getCurrentState()).toEqual("paused");
    });

    test("resume useIdleTimer", () => {
        const { result } = setup();

        // First pause the timer
        jest.advanceTimersByTime(2000);
        result.current.pause();
        const pausedTime = result.current.getRemainingTime();
        expect(result.current.getCurrentState()).toEqual("paused");

        // Advance time while paused - should not count down
        jest.advanceTimersByTime(1000);
        expect(result.current.getRemainingTime()).toEqual(pausedTime);

        // Now resume
        result.current.resume();
        expect(result.current.getCurrentState()).toEqual("running");
        const resumedTime = result.current.getRemainingTime();

        // Time should continue counting down after resume
        jest.advanceTimersByTime(1000);
        expect(result.current.getRemainingTime()).toEqual(resumedTime - 1);
    });

    test("Reset timer", () => {
        const { result } = setup();

        // Let 2 seconds pass to reduce remaining time
        jest.advanceTimersByTime(2000);
        expect(result.current.getRemainingTime()).toBe(8);

        // Simulate a touch/reset
        const resetTime = Date.now();
        result.current.reset();

        expect(result.current.getRemainingTime()).toBe(10);
        expect(result.current.getCurrentState()).toBe("running");
        expect(result.current.getLastReset()).toBeGreaterThanOrEqual(resetTime);
        expect(result.current.getLastReset()).toBeLessThanOrEqual(Date.now());
    });

    test("onIdle callback fires when timeout is reached", () => {
        const onIdle = jest.fn();
        const { result } = setup({ onIdle, timeout: 5 });

        expect(result.current.getIsIdle()).toBe(false);
        expect(onIdle).not.toHaveBeenCalled();

        // Advance past timeout
        jest.advanceTimersByTime(5000);

        expect(result.current.getIsIdle()).toBe(true);
        expect(result.current.getCurrentState()).toBe("idle");
        expect(result.current.getLastIdle()).not.toBeNull();
        expect(onIdle).toHaveBeenCalledTimes(1);
    });

    test("onIdle fires only once per idle cycle", () => {
        const onIdle = jest.fn();
        const { result } = setup({ onIdle, timeout: 5 });

        jest.advanceTimersByTime(5000);
        expect(onIdle).toHaveBeenCalledTimes(1);

        // Advance more time - should not fire again
        jest.advanceTimersByTime(5000);
        expect(onIdle).toHaveBeenCalledTimes(1);
    });

    test("reset clears idle state and triggers onActive", () => {
        const onIdle = jest.fn();
        const onActive = jest.fn();
        const onAction = jest.fn();
        const { result } = setup({ onIdle, onActive, onAction, timeout: 5 });

        // Wait for idle
        jest.advanceTimersByTime(5000);
        expect(result.current.getIsIdle()).toBe(true);
        expect(result.current.getCurrentState()).toBe("idle");
        expect(onIdle).toHaveBeenCalledTimes(1);

        // Reset should clear idle and trigger onActive
        result.current.reset();

        expect(result.current.getIsIdle()).toBe(false);
        expect(result.current.getCurrentState()).toBe("running");
        expect(onActive).toHaveBeenCalledTimes(1);
        expect(onAction).toHaveBeenCalledTimes(1);
    });

    test("onAction fires on every reset", () => {
        const onAction = jest.fn();
        const { result } = setup({ onAction });

        result.current.reset();
        expect(onAction).toHaveBeenCalledTimes(1);

        result.current.reset();
        expect(onAction).toHaveBeenCalledTimes(2);
    });

    test("pause with multiple sources (composable pause reasons)", () => {
        const { result } = setup();

        jest.advanceTimersByTime(2000);
        const timeBeforePause = result.current.getRemainingTime();

        // Pause from appstate
        result.current.pause("appstate");
        expect(result.current.getCurrentState()).toBe("paused");

        // Pause from keyboard (should still be paused)
        result.current.pause("keyboard");
        expect(result.current.getCurrentState()).toBe("paused");

        // Resume keyboard (should still be paused due to appstate)
        result.current.resume("keyboard");
        expect(result.current.getCurrentState()).toBe("paused");

        // Resume appstate (should now be running)
        result.current.resume("appstate");
        expect(result.current.getCurrentState()).toBe("running");
    });

    test("pause is idempotent", () => {
        const { result } = setup();

        result.current.pause("test");
        expect(result.current.getCurrentState()).toBe("paused");

        // Pause again with same reason
        result.current.pause("test");
        expect(result.current.getCurrentState()).toBe("paused");

        const pausedTime = result.current.getRemainingTime();
        jest.advanceTimersByTime(1000);
        expect(result.current.getRemainingTime()).toBe(pausedTime);
    });

    test("resume does nothing if already running", () => {
        const { result } = setup();

        expect(result.current.getCurrentState()).toBe("running");
        const remainingBefore = result.current.getRemainingTime();

        result.current.resume("test");
        expect(result.current.getCurrentState()).toBe("running");
        expect(result.current.getRemainingTime()).toBe(remainingBefore);
    });

    test("custom timeout value", () => {
        const { result } = setup({ timeout: 20 });

        expect(result.current.getRemainingTime()).toBe(20);

        jest.advanceTimersByTime(5000);
        expect(result.current.getRemainingTime()).toBe(15);
    });
});
