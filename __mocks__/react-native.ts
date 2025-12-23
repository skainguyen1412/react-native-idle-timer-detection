type KeyboardSubscription = { remove: () => void };

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

export type PanResponderInstance = ReturnType<typeof PanResponder.create>;

export const View = (_props: any) => null;


