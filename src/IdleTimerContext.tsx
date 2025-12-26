import React, { createContext, PropsWithChildren, useContext } from "react";
import { View } from "react-native";
import { IdleTimerHandle } from "./types/IdleTimerProps";
import { useIdleTimer } from "./useIdleTimer";
import { UseIdleTimerProps } from "./types/useIdleTimerProps";

const IdleTimerContext = createContext<IdleTimerHandle | null>(null);

export const useIdleTimerContext = () => {
    const context = useContext(IdleTimerContext);

    if (!context) {
        throw new Error(
            "useIdleTimerContext must be used within a IdleTimerProvider"
        );
    }

    return context;
};

export function IdleTimerProvider(props: PropsWithChildren<UseIdleTimerProps>) {
    const idleTimer = useIdleTimer(props);

    return (
        <IdleTimerContext.Provider value={idleTimer}>
            <View style={{ flex: 1 }} {...idleTimer.panResponder.panHandlers}>
                {props.children}
            </View>
        </IdleTimerContext.Provider>
    );
}
