import { renderHook } from "@testing-library/react-native";
import { describe, expect, test } from "@jest/globals";
import { useIdleTimer } from "../src/useIdleTimer";
import { IdleTimerProvider } from "../src/IdleTimerContext";

describe("useIdleTimer", () => {
    test("exports IdleTimerProvider", () => {
        expect(IdleTimerProvider).toBeDefined();
    });

    test("useIdleTimer", () => {
        //TODO: Testing useIdleTimer function

        const { result } = renderHook(() => useIdleTimer());

        expect(result.current.startTime).toBeDefined();
    });
});
