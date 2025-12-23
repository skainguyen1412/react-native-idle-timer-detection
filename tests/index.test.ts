import { renderHook } from "@testing-library/react-native";
import { describe, expect, test } from "@jest/globals";
import { useIdleTimer } from "../src/useIdleTimer";
import { IdleTimerProvider } from "../src/IdleTimerContext";
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
    });

    test("reset useIdleTimer", () => {
        const { result } = setup();

        result.current.reset();

        const time = Date.now();
        expect(result.current.currentTime).toBeLessThanOrEqual(time);
        expect(result.current.getLastReset()).toBeLessThanOrEqual(time);
        expect(result.current.getRemainingTime()).toEqual(10);
    });

    test("pause useIdleTimer", () => {
        const { result } = setup();

        const time = result.current.getRemainingTime();

        result.current.pause();

        expect(result.current.getCurrentState()).toEqual("paused");
        expect(result.current.getRemainingTime()).toEqual(time);
    });

    test("resume useIdleTimer", () => {
        jest.useFakeTimers();
        const { result } = setup();

        result.current.resume();
        const time = result.current.getRemainingTime();

        expect(result.current.getCurrentState()).toEqual("running");

        jest.advanceTimersByTime(1000);

        expect(result.current.getRemainingTime()).toEqual(time - 1);

        jest.useRealTimers();
    });
});
