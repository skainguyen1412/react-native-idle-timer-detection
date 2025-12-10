import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Button, PanResponder, StyleSheet, Text, View } from "react-native";

export default function App() {
  //TODO: Planning to develop propotype for idle timer in react native

  const [isIdle, setIsIdle] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      // 1. The Capture Phase: This happens BEFORE the touch reaches the child.
      // We log the touch here, but return FALSE.
      onStartShouldSetPanResponderCapture: (evt, gestureState) => {
        // --- YOUR LOGIC HERE ---
        // e.g., Reset an inactivity timer, log analytics, etc.
        console.log("User touched the screen!");

        // --- THE TRICK ---
        // Return false. This tells React Native:
        // "I saw the touch, but I don't want to stop it. Let it pass to the child."
        return false;
      },

      // Optional: Detect dragging movement too
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return false;
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Text>{isIdle ? "Idle" : "Active"}</Text>
      <StatusBar style="auto" />
      <Button
        title="Test button pressed"
        onPress={() => {
          console.log("Test button pressed");
        }}
      />
    </View>
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
