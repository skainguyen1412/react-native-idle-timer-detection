import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { IdleTimerProvider } from "./src/IdleTimerContext";
import { DemoScreen } from "./src";

export default function App() {
    const [isIdle, setIsIdle] = useState(false);

    return (
        <IdleTimerProvider
            onIdle={() => setIsIdle(true)}
            onActive={() => setIsIdle(false)}
        >
            <DemoScreen isIdle={isIdle} />
        </IdleTimerProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
