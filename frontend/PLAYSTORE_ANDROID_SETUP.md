# FaithBliss Android (Play Store) Setup

This project is now configured for Capacitor so you can package the web app as a real Android app.

## 1. Install dependencies

```powershell
cd frontend
pnpm install
```

## 2. Add Android platform (first time only)

```powershell
pnpm cap:add:android
```

This creates an `android/` project.

## 3. Build + sync web app into Android project

```powershell
pnpm android:prepare
```

## 4. Open Android Studio

```powershell
pnpm cap:open
```

In Android Studio:

1. Wait for Gradle sync to finish.
2. Set `minSdk`/`targetSdk` as requested by current Play policies.
3. Update app icon, splash, and app name if needed.

## 5. Test on phone/emulator

Use Android Studio Run button, or:

```powershell
pnpm android:run
```

## 6. Generate Play Store build (AAB)

In Android Studio:

1. `Build` -> `Generate Signed Bundle / APK`
2. Select `Android App Bundle`
3. Create/select keystore
4. Build `release`

Upload the generated `.aab` to Google Play Console.

## Important notes

- Keep using HTTPS API endpoints in `.env` for production.
- For updates: run `pnpm android:prepare` again before rebuilding release.
- Do not commit keystore files to git.

## GitHub Actions build (no Android Studio required)

This repo now includes:

- [android-build.yml](c:/Users/user/Desktop/faithbliss/.github/workflows/android-build.yml)

Run it from GitHub:

1. Go to `Actions` -> `Android Build`
2. Click `Run workflow`
3. Download artifact: `faithbliss-android-build`

### To get Play Store-ready signed AAB from CI

Add these repository secrets:

1. `ANDROID_KEYSTORE_B64`
2. `ANDROID_KEYSTORE_PASSWORD`
3. `ANDROID_KEY_ALIAS`
4. `ANDROID_KEY_PASSWORD`

Create `ANDROID_KEYSTORE_B64`:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\upload-keystore.jks"))
```

Paste the output as the secret value.

If secrets are missing, workflow still builds unsigned artifacts for testing only.
