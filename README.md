# react-native-idle-timer

A React Native idle timer hook and provider for detecting user inactivity. Supports prompting before idle, pause/resume functionality, and automatic background handling.

## Features

- **Hook-first API** - Use `useIdleTimer` directly or via context provider
- **Prompting support** - Show a warning modal before the user goes idle
- **State machine** - Clear states: `active` → `prompting` → `idle`
- **Background handling** - Automatically pauses when app is backgrounded, resumes on foreground
- **Touch & keyboard detection** - Configurable activity sources
- **TypeScript** - Fully typed API

## Installation

```bash
npm install react-native-idle-timer
# or
yarn add react-native-idle-timer
# or
pnpm add react-native-idle-timer
```

## Quick Start

### Using the Provider (Recommended)

Wrap your app with `IdleTimerProvider` to automatically detect touch events:

```tsx
import { IdleTimerProvider, useIdleTimerContext } from 'react-native-idle-timer';

function App() {
  return (
    <IdleTimerProvider
      options={{
        timeoutMs: 30000, // 30 seconds
        promptBeforeIdleMs: 10000, // Show prompt 10 seconds before idle
        onIdle: () => console.log('User is idle!'),
        onActive: () => console.log('User is active again!'),
        onPrompt: () => console.log('Warning: about to go idle!'),
      }}
    >
      <MyApp />
    </IdleTimerProvider>
  );
}

function MyApp() {
  const idleTimer = useIdleTimerContext();
  
  return (
    <View>
      <Text>State: {idleTimer?.state}</Text>
      <Text>Time remaining: {idleTimer?.getRemainingTimeSec()}s</Text>
    </View>
  );
}
```

### Using the Hook Directly

If you need more control, use the hook directly and attach `panHandlers` to your root view:

```tsx
import { useIdleTimer } from 'react-native-idle-timer';

function App() {
  const idleTimer = useIdleTimer({
    timeoutMs: 30000,
    onIdle: () => console.log('Idle!'),
  });

  return (
    <View style={{ flex: 1 }} {...idleTimer.panHandlers}>
      <Text>State: {idleTimer.state}</Text>
    </View>
  );
}
```

## API Reference

### `useIdleTimer(options: IdleTimerOptions): IdleTimerApi`

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeoutMs` | `number` | **required** | Time in milliseconds until user is considered idle |
| `promptBeforeIdleMs` | `number` | `0` | Time before idle to trigger `onPrompt` |
| `onIdle` | `() => void` | - | Callback when user becomes idle |
| `onActive` | `() => void` | - | Callback when user becomes active (from idle/prompting) |
| `onPrompt` | `() => void` | - | Callback when entering prompting state |
| `events` | `IdleTimerEvents` | `{ touch: true, keyboard: "hide" }` | Activity detection configuration |
| `startOnMount` | `boolean` | `true` | Start timer on mount |
| `initiallyPaused` | `boolean` | `false` | Start in paused state |
| `debug` | `boolean` | `false` | Enable debug logging |

#### Events Configuration

```typescript
interface IdleTimerEvents {
  touch?: boolean;      // Track touch/gesture events (default: true)
  keyboard?: "hide" | "show" | "both" | false;  // Track keyboard events (default: "hide")
}
```

#### Return Value (`IdleTimerApi`)

| Property | Type | Description |
|----------|------|-------------|
| `state` | `IdleTimerState` | Current state: `"active"`, `"prompting"`, `"idle"`, or `"paused"` |
| `reset()` | `() => void` | Reset timer and mark user as active |
| `pause()` | `() => void` | Pause the timer |
| `resume()` | `() => void` | Resume the timer |
| `getRemainingTimeMs()` | `() => number` | Get remaining time in milliseconds |
| `getRemainingTimeSec()` | `() => number` | Get remaining time in seconds (rounded) |
| `lastActiveAtMs` | `number \| null` | Timestamp of last user activity |
| `lastIdleAtMs` | `number \| null` | Timestamp of last idle event |
| `panHandlers` | `PanResponderInstance["panHandlers"]` | Handlers to attach to a View for touch detection |

### `IdleTimerProvider`

```tsx
<IdleTimerProvider
  options={IdleTimerOptions}    // Required: options passed to useIdleTimer
  wrapWithTouchHandler={true}   // Optional: wrap children with touch-detecting View (default: true)
>
  {children}
</IdleTimerProvider>
```

### Context Hooks

- `useIdleTimerContext()` - Returns `IdleTimerApi | null`
- `useRequiredIdleTimerContext()` - Returns `IdleTimerApi`, throws if not in provider

## Prompting Modal Example

Show a countdown modal when the user is about to go idle:

```tsx
import { Modal, Text, Button, View } from 'react-native';
import { IdleTimerProvider, useRequiredIdleTimerContext } from 'react-native-idle-timer';
import { useEffect, useState } from 'react';

function App() {
  return (
    <IdleTimerProvider
      options={{
        timeoutMs: 60000,        // 1 minute
        promptBeforeIdleMs: 15000, // Prompt 15 seconds before
        onIdle: () => {
          // Handle idle - e.g., logout user
        },
      }}
    >
      <MainScreen />
    </IdleTimerProvider>
  );
}

function MainScreen() {
  const idleTimer = useRequiredIdleTimerContext();
  const [countdown, setCountdown] = useState(0);

  // Update countdown every second when prompting
  useEffect(() => {
    if (idleTimer.state !== 'prompting') return;
    
    const interval = setInterval(() => {
      setCountdown(idleTimer.getRemainingTimeSec());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [idleTimer.state]);

  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      
      {/* Prompting Modal */}
      <Modal visible={idleTimer.state === 'prompting'} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>Are you still there?</Text>
            <Text style={styles.countdown}>{countdown}s</Text>
            <Button title="I'm here!" onPress={idleTimer.reset} />
          </View>
        </View>
      </Modal>
      
      {/* Idle Modal */}
      <Modal visible={idleTimer.state === 'idle'} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text>Session expired</Text>
            <Button title="Continue" onPress={idleTimer.reset} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
```

## Background Behavior

The timer automatically handles app state changes:

- **App goes to background**: Timer pauses, remaining time is preserved
- **App returns to foreground**: Timer resumes with the preserved remaining time

This ensures users aren't unfairly timed out while the app is backgrounded.

## State Machine

```
                    ┌──────────────────────────────────┐
                    │                                  │
                    ▼                                  │
    ┌─────────┐  timeout  ┌───────────┐  timeout  ┌───────┐
    │  active │──────────►│ prompting │──────────►│ idle  │
    └─────────┘           └───────────┘           └───────┘
         ▲                      │                      │
         │                      │                      │
         │     user action      │     user action      │
         └──────────────────────┴──────────────────────┘
         
         │                      │                      │
         │    app background    │    app background    │
         └──────────┬───────────┴──────────┬───────────┘
                    │                      │
                    ▼                      ▼
              ┌──────────┐          ┌──────────┐
              │  paused  │◄─────────│  paused  │
              └──────────┘          └──────────┘
                    │
                    │ app foreground
                    ▼
              (resumes to previous state with remaining time)
```

## Common Patterns

### Session Timeout with Logout

```tsx
const handleIdle = useCallback(() => {
  // Clear auth state
  logout();
  // Navigate to login
  navigation.reset({ routes: [{ name: 'Login' }] });
}, []);

<IdleTimerProvider
  options={{
    timeoutMs: 15 * 60 * 1000, // 15 minutes
    promptBeforeIdleMs: 60 * 1000, // 1 minute warning
    onIdle: handleIdle,
  }}
>
```

### Manual Pause/Resume

```tsx
function SettingsScreen() {
  const idleTimer = useRequiredIdleTimerContext();
  
  // Pause during video playback
  useEffect(() => {
    if (isVideoPlaying) {
      idleTimer.pause();
    } else {
      idleTimer.resume();
    }
  }, [isVideoPlaying]);
}
```

### Conditional Timer Start

```tsx
// Don't start until user is authenticated
<IdleTimerProvider
  options={{
    timeoutMs: 30000,
    startOnMount: isAuthenticated,
    initiallyPaused: !isAuthenticated,
  }}
>
```

## Caveats

1. **Timer accuracy**: JavaScript timers aren't perfectly accurate. For critical timeout scenarios, validate on the server side.

2. **Touch detection**: The `PanResponder` captures touch starts but doesn't interfere with child component events. If you have custom gesture handlers, they should still work.

3. **Keyboard events**: By default, only `keyboardDidHide` resets the timer. This is intentional - showing the keyboard doesn't necessarily mean the user is actively typing.

4. **Background timing**: When the app is backgrounded, time doesn't continue counting. This is a feature, not a bug - it prevents users from being logged out while switching apps briefly.

## License

MIT

