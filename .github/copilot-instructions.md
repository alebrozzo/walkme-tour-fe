# Copilot Instructions

## Project Overview

WalkMe Tour is an **Expo React Native** app (Expo ~54, React Native 0.81, React 19) written in **TypeScript** with strict mode enabled. It lets users browse walking tours, plan itineraries based on available time, and pin favourite cities. The app supports five languages including Arabic and Hebrew (RTL).

## Tech Stack

- **Framework**: Expo ~54 (managed workflow)
- **Language**: TypeScript (strict mode, path alias `@/*` → `src/*`)
- **Navigation**: `@react-navigation/native-stack`
- **UI**: React Native core components + `react-native-safe-area-context`
- **Package manager**: npm (lockfileVersion 3)

## Project Structure

```
src/
  constants/   # Shared constants (e.g. TYPE_ICON map)
  contexts/    # React contexts: LanguageContext, PinnedContext
  data/        # Static tour data (tours.ts)
  i18n/        # Translations for en, ar, he, es, fr (translations.ts)
  screens/     # HomeScreen, TourScreen, StopScreen (*.tsx)
  services/    # Business logic (generateStops.ts)
  types/       # Shared TypeScript types (index.ts)
App.tsx        # Root component with navigator and providers
index.ts       # Entry point (registers App)
```

## Commands

| Task             | Command             |
| ---------------- | ------------------- |
| Start dev server | `npm start`         |
| Type-check       | `npm run typecheck` |
| Lint             | `npm run lint`      |
| Format           | `npm run format`    |

Always run `npm run lint` and `npm run format` before considering code complete.

## Code Style

- **Prettier** config: `semi: true`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 120`, `tabWidth: 2`
- **ESLint**: `typescript-eslint` recommended + `eslint-config-prettier`
- All files use `.ts` / `.tsx` extensions; no `.js` / `.jsx`
- Import paths use the `@/*` alias for `src/` (e.g. `import { Stop } from '@/types'`)

## Key Patterns

### RTL / i18n

- Language state lives in `LanguageContext`; consume it with the `useLanguage()` hook.
- When the layout direction changes, `LanguageContext` calls `I18nManager.forceRTL()` and increments `appKey` to force a full re-mount of the navigator — **never call these directly in screens**.
- On Android, `SafeAreaView` (from `react-native-safe-area-context`) does **not** inherit the `direction` style. Always apply `direction: language.isRTL ? 'rtl' : 'ltr'` to the **first plain React Native child** (`FlatList`, `ScrollView`, or `View`), not on `SafeAreaView`.
- Use RTL-aware chevron characters: `{language.isRTL ? '‹' : '›'}` — never a hardcoded `›`.
- All user-visible strings must come from the `t` object returned by `useLanguage()`. Add new strings to every language in `src/i18n/translations.ts`.

### Async / Loading State

- Async handlers in screens must follow the **cancel-ref** pattern to prevent state updates after unmount:

  ```ts
  const cancelRef = useRef<(() => void) | null>(null);

  const handleAsync = useCallback(
    async () => {
      let cancelled = false;
      cancelRef.current = () => {
        cancelled = true;
      };
      setLoading(true);
      try {
        const result = await someAsyncCall();
        if (cancelled) return;
        setState(result);
      } finally {
        if (!cancelled) setLoading(false);
      }
    },
    [
      /* deps */
    ],
  );

  useEffect(
    () => () => {
      cancelRef.current?.();
    },
    [],
  );
  ```

### State Management

- Do **not** nest `setState` calls inside another `setState` updater callback.
- When you need to read the current value of state inside a `useCallback` or a `setState` updater that runs asynchronously, store the current value in a `ref` (`pinnedIdsRef` pattern in `PinnedContext`).
- Do not use packages from shuriken, just npm.

### Types

- Tour stop types are defined in `src/types/index.ts` — extend there first before using elsewhere.
- `Stop.walkingTime` (minutes to next stop) and `Stop.price` (display string, e.g. `"€15"`) are optional fields.

### Navigation

- All screen prop types use `NativeStackScreenProps<RootStackParamList, 'ScreenName'>`.
- Add new screens to both the `RootStackParamList` type (in `src/types/index.ts`) and the navigator in `App.tsx`.
