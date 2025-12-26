type KeyboardSubscription = { remove: () => void };
type AppStateSubscription = { remove: () => void };

export const Keyboard = {
    addListener: (
        _event: string,
        _listener: (...args: any[]) => void
    ): KeyboardSubscription => {
        return { remove: () => {} };
    },
};

export const PanResponder = {
    create: (_handlers: any) => {
        return {
            panHandlers: {},
        };
    },
};

export const AppState = {
    currentState: "active",
    addEventListener: (
        _event: string,
        _listener: (state: string) => void
    ): AppStateSubscription => {
        return { remove: () => {} };
    },
};

export type PanResponderInstance = ReturnType<typeof PanResponder.create>;

export const View = (_props: any) => null;


