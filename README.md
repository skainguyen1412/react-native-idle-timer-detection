# react-native-idle-timer

A React Native library for detecting user idle time with automatic pause/resume support for keyboard and app state changes.

## Features

- ⏱️ **Configurable timeout** - Set custom idle timeout duration
- 🎯 **Automatic detection** - Detects touch events, keyboard interactions, and app state changes
- ⏸️ **Pause/Resume** - Manually pause or resume the timer with composable pause reasons
- 🔄 **State management** - Track idle state, remaining time, and timer status
- 📱 **React Native optimized** - Uses PanResponder for efficient touch detection
- 🎣 **Hook & Context** - Use as a hook or context provider for app-wide idle detection
- 📝 **TypeScript** - Full TypeScript support with type definitions
- 🎨 **Event callbacks** - `onIdle`, `onActive`, and `onAction` callbacks for custom logic

## Installation

```bash
npm install react-native-idle-timer
# or
yarn add react-native-idle-timer
# or
pnpm add react-native-idle-timer
```

## Quick Start

### Using the Hook

```tsx
import { useIdleTimer } from 'react-native-idle-timer';

function MyComponent() {
  const idleTimer = useIdleTimer({
    timeout: 30, // 30 seconds
    onIdle: () => {
      console.log('User is idle');
    },
    onActive: () => {
      console.log('User is active');
    },
  });

  return (
    <View {...idleTimer.panResponder.panHandlers}>
      <Text>Remaining: {idleTimer.getRemainingTime()}s</Text>
      <Text>State: {idleTimer.getCurrentState()}</Text>
      <Text>Is Idle: {idleTimer.getIsIdle() ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

### Using the Context Provider

```tsx
import { IdleTimerProvider, useIdleTimerContext } from 'react-native-idle-timer';

function App() {
  return (
    <IdleTimerProvider
      timeout={30}
      onIdle={() => console.log('User is idle')}
      onActive={() => console.log('User is active')}
    >
      <MyApp />
    </IdleTimerProvider>
  );
}

function MyComponent() {
  const idleTimer = useIdleTimerContext();
  
  return (
    <View>
      <Text>Remaining: {idleTimer.getRemainingTime()}s</Text>
    </View>
  );
}
```

## API Reference

### `useIdleTimer(props?)`

The main hook for idle timer functionality.

#### Parameters

```typescript
interface UseIdleTimerProps {
  /**
   * Timeout duration in seconds before the timer goes idle.
   * Default: 10 seconds
   */
  timeout?: number;
  
  /**
   * Callback fired when the timer becomes idle (timeout reached).
   * Fires once per idle cycle.
   */
  onIdle?: () => void;
  
  /**
   * Callback fired when the user becomes active after being idle.
   * Fires when transitioning from idle -> active state.
   */
  onActive?: () => void;
  
  /**
   * Callback fired on every user action (touch, keyboard, etc.).
   * Useful for tracking all user interactions.
   */
  onAction?: () => void;
}
```

#### Returns

```typescript
interface IdleTimerHandle {
  /** PanResponder instance for capturing touch events */
  panResponder: PanResponderInstance;
  
  /** Reset the timer and mark user as active */
  reset: () => void;
  
  /** Get the timestamp when the timer was started (in milliseconds) */
  getStartTime: () => number;
  
  /** Get the current timestamp (in milliseconds) */
  getCurrentTime: () => number;
  
  /** Get remaining time until idle (in seconds) */
  getRemainingTime: () => number;
  
  /** Pause the timer (optionally with a reason) */
  pause: (reason?: string) => void;
  
  /** Resume the timer (optionally with a reason) */
  resume: (reason?: string) => void;
  
  /** Check if the timer is currently idle */
  getIsIdle: () => boolean;
  
  /** Get the timestamp of the last reset (in milliseconds), or null if never reset */
  getLastReset: () => number | null;
  
  /** Get the timestamp of the last idle event (in milliseconds), or null if never idle */
  getLastIdle: () => number | null;
  
  /** Get the current state: "running" | "paused" | "idle" */
  getCurrentState: () => "running" | "paused" | "idle";
}
```

### `IdleTimerProvider`

Context provider component that wraps your app and provides idle timer functionality to all child components.

#### Props

Same as `UseIdleTimerProps` (see above).

### `useIdleTimerContext()`

Hook to access the idle timer from within a component wrapped by `IdleTimerProvider`.

#### Returns

Same as `useIdleTimer` return value (see `IdleTimerHandle` above).

#### Throws

Throws an error if used outside of `IdleTimerProvider`.

## Usage Examples

### Basic Timer with Callbacks

```tsx
import { useIdleTimer } from 'react-native-idle-timer';

function MyScreen() {
  const idleTimer = useIdleTimer({
    timeout: 60, // 1 minute
    onIdle: () => {
      // Show idle modal or logout user
      console.log('User has been idle for 60 seconds');
    },
    onActive: () => {
      // Hide idle modal
      console.log('User is active again');
    },
    onAction: () => {
      // Track user activity
      console.log('User performed an action');
    },
  });

  return (
    <View {...idleTimer.panResponder.panHandlers}>
      <Text>Time remaining: {idleTimer.getRemainingTime()}s</Text>
    </View>
  );
}
```

### Manual Pause/Resume

```tsx
function MyComponent() {
  const idleTimer = useIdleTimer({ timeout: 30 });

  const handlePause = () => {
    idleTimer.pause('manual');
  };

  const handleResume = () => {
    idleTimer.resume('manual');
  };

  return (
    <View>
      <Button title="Pause" onPress={handlePause} />
      <Button title="Resume" onPress={handleResume} />
      <Text>State: {idleTimer.getCurrentState()}</Text>
    </View>
  );
}
```

### Composable Pause Reasons

The timer supports multiple pause reasons. The timer will only resume when all pause reasons are cleared:

```tsx
function MyComponent() {
  const idleTimer = useIdleTimer({ timeout: 30 });

  // Pause for app state
  idleTimer.pause('appstate');
  
  // Pause for keyboard
  idleTimer.pause('keyboard');
  
  // Resume keyboard (timer still paused due to appstate)
  idleTimer.resume('keyboard');
  
  // Resume appstate (timer now running)
  idleTimer.resume('appstate');
}
```

### Real-time Countdown Display

```tsx
import { useEffect, useState } from 'react';
import { useIdleTimer } from 'react-native-idle-timer';

function CountdownDisplay() {
  const [remainingTime, setRemainingTime] = useState(0);
  const idleTimer = useIdleTimer({ timeout: 30 });

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(idleTimer.getRemainingTime());
    }, 1000);
    
    setRemainingTime(idleTimer.getRemainingTime());
    
    return () => clearInterval(interval);
  }, [idleTimer]);

  return (
    <View>
      <Text style={{ fontSize: 48 }}>{remainingTime}</Text>
      <Text>seconds remaining</Text>
      <Text>State: {idleTimer.getCurrentState()}</Text>
    </View>
  );
}
```

### App-wide Idle Detection with Context

```tsx
import { IdleTimerProvider, useIdleTimerContext } from 'react-native-idle-timer';

function App() {
  return (
    <IdleTimerProvider
      timeout={120}
      onIdle={() => {
        // Show lock screen or logout
        console.log('User idle - showing lock screen');
      }}
      onActive={() => {
        // Hide lock screen
        console.log('User active - hiding lock screen');
      }}
    >
      <NavigationContainer>
        <Stack.Navigator>
          {/* Your screens */}
        </Stack.Navigator>
      </NavigationContainer>
    </IdleTimerProvider>
  );
}

// In any child component
function AnyScreen() {
  const idleTimer = useIdleTimerContext();
  
  const handleReset = () => {
    idleTimer.reset();
  };

  return (
    <View>
      <Text>Remaining: {idleTimer.getRemainingTime()}s</Text>
      <Button title="Reset Timer" onPress={handleReset} />
    </View>
  );
}
```

## Automatic Features

The library automatically handles:

- **Touch Events**: Uses `PanResponder` to detect touch interactions and reset the timer
- **Keyboard Events**: Automatically pauses when keyboard opens and resumes when it closes
- **App State Changes**: Automatically pauses when app goes to background and resumes when active

## Timer States

The timer can be in one of three states:

- **`running`**: Timer is actively counting down
- **`paused`**: Timer is paused (remaining time is preserved)
- **`idle`**: Timer has reached timeout and user is considered idle

## Notes

- The timer uses deadline-based calculation for accurate remaining time
- When paused, the remaining time is preserved and resumes from the same point
- The `onIdle` callback fires only once per idle cycle
- The `onActive` callback fires when transitioning from idle to active
- The `onAction` callback fires on every user action (touch, reset, etc.)
- All time values are in seconds except timestamp methods which return milliseconds

## License

MIT

