import React, {
    createContext,
    PropsWithChildren,
    useContext,
} from "react";
import { View, StyleSheet } from "react-native";
import { useIdleTimer } from "./useIdleTimer";
import { IdleTimerApi, IdleTimerOptions } from "./types/IdleTimerTypes";

/**
 * Context for sharing idle timer state across the component tree
 */
const IdleTimerContext = createContext<IdleTimerApi | null>(null);

/**
 * Hook to access the idle timer context
 * Must be used within an IdleTimerProvider
 *
 * @returns IdleTimerApi or null if not within a provider
 */
export const useIdleTimerContext = (): IdleTimerApi | null => {
    return useContext(IdleTimerContext);
};

/**
 * Hook to access the idle timer context with a guarantee it exists
 * Throws if used outside of IdleTimerProvider
 *
 * @returns IdleTimerApi
 * @throws Error if not within a provider
 */
export const useRequiredIdleTimerContext = (): IdleTimerApi => {
    const context = useContext(IdleTimerContext);
    if (context === null) {
        throw new Error(
            "useRequiredIdleTimerContext must be used within an IdleTimerProvider"
        );
    }
    return context;
};

/**
 * Props for IdleTimerProvider
 */
export interface IdleTimerProviderProps extends PropsWithChildren {
    /** Options passed to useIdleTimer hook */
    options: IdleTimerOptions;
    /** Whether to wrap children in a View with panHandlers (default: true) */
    wrapWithTouchHandler?: boolean;
}

/**
 * Provider component that wraps your app to enable idle timer functionality
 *
 * By default, wraps children in a View that captures touch events.
 * Set wrapWithTouchHandler to false if you want to attach panHandlers manually.
 *
 * @example
 * ```tsx
 * // Basic usage with wrapper
 * <IdleTimerProvider options={{ timeoutMs: 30000, onIdle: handleIdle }}>
 *   <App />
 * </IdleTimerProvider>
 *
 * // Without wrapper (attach panHandlers manually)
 * <IdleTimerProvider options={{ timeoutMs: 30000 }} wrapWithTouchHandler={false}>
 *   <View {...idleTimer.panHandlers}>
 *     <App />
 *   </View>
 * </IdleTimerProvider>
 * ```
 */
export function IdleTimerProvider({
    children,
    options,
    wrapWithTouchHandler = true,
}: IdleTimerProviderProps) {
    const idleTimer = useIdleTimer(options);

    return (
        <IdleTimerContext.Provider value={idleTimer}>
            {wrapWithTouchHandler ? (
                <View style={styles.container} {...idleTimer.panHandlers}>
                    {children}
                </View>
            ) : (
                children
            )}
        </IdleTimerContext.Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
