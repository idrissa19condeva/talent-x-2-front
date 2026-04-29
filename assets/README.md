# TalentX mobile assets

Drop production artwork here. Expected files (Expo reads these via `app.config.ts`):

| File                    | Size         | Notes                                  |
| ----------------------- | ------------ | -------------------------------------- |
| `icon.png`              | 1024×1024    | App icon. Transparent corners are fine |
| `splash.png`            | 1242×2436    | Splash screen. Matches brand background |
| `adaptive-icon.png`     | 1024×1024    | Android adaptive foreground           |

Until real artwork is provided, run `npx expo install expo-splash-screen` and
place any valid PNGs here — Expo will not boot without them.
