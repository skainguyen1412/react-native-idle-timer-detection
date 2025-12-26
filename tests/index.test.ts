import { renderHook } from "@testing-library/react-native";
import { describe, expect, test } from "@jest/globals";
import { useIdleTimer } from "../src/useIdleTimer";
import { jest } from "@jest/globals";

describe("useIdleTimer", () => {
    const setup = () => {
        return renderHook(() => useIdleTimer());
    };

    test("init useIdleTimer", () => {
        const { result } = setup();

        expect(result.current.startTime).toBeDefined();
        expect(result.current.currentTime).toBeDefined();
        expect(result.current.panResponder).toBeDefined();
        expect(result.current.getRemainingTime()).toEqual(10);
        expect(result.current.getCurrentState()).toEqual("running");
        expect(result.current.getIsIdle()).toBe(false);
        expect(result.current.getLastReset()).toBeNull();
    });

    test("reset useIdleTimer", () => {
        const { result } = setup();

        result.current.reset();

        const time = Date.now();
        // Note: currentTime is a snapshot value, so we check getLastReset instead
        expect(result.current.getLastReset()).toBeLessThanOrEqual(time);
        expect(result.current.getLastReset()).toBeGreaterThan(time - 1000); // Should be recent
        expect(result.current.getRemainingTime()).toEqual(10);
        expect(result.current.getCurrentState()).toEqual("running");
    });

    test("pause useIdleTimer", () => {
        jest.useFakeTimers();
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

        jest.useRealTimers();
    });

    test("resume useIdleTimer", () => {
        jest.useFakeTimers();
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

        jest.useRealTimers();
    });

    test("Reset timer", () => {
        jest.useFakeTimers();
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

        jest.useRealTimers();
    });

    test("Test trigger onIdle when time is up", () => {
        //TODO: Need to test the trigger is right flow when user pause resume and reset

        jest.useFakeTimers();

        const { result } = setup();

        expect(result.current.getIsIdle()).toBe(false);

        jest.advanceTimersByTime(10000);
        expect(result.current.getIsIdle()).toBe(true);

        jest.useRealTimers();
    });
});
