# Bootstrap Guide

Steps to bring a fresh Firebase project + this app up to a working state.

## 1. Firebase project

1. Create project in [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication → Anonymous**.
3. Enable **Firestore Database** (Native mode, region `me-west1` recommended for TLV).
4. Register a Web App → copy config values into `.env`:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## 2. Deploy Firestore rules

```
npm i -g firebase-tools
firebase login
firebase use --add   # pick your project
firebase deploy --only firestore:rules
```

## 3. Seed the first super_admin invite code

Rules require an existing super_admin to create invite codes.
For the very first code you must bypass rules — either use the Firestore console
or the emulator.

**Option A — Firestore Console (manual):**

1. Open Firestore → Data.
2. Add collection `inviteCodes`.
3. Add document with ID = a 6-char code, e.g. `ADMIN1`.
4. Fields:
   - `role` (string) = `super_admin`
   - `teamId` (string) = `all`
   - `used` (boolean) = `false`
   - `createdAt` (timestamp) = now
   - `createdBy` (string) = `bootstrap`

**Option B — Admin script:**

```
cd scripts
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  npx ts-node seed.ts ADMIN1 super_admin all
```

(Requires downloading a service account key from
Firebase Console → Project Settings → Service Accounts → Generate new
private key. **Do not commit this file.**)

## 4. Deploy the push Cloud Function

```
cd functions
npm install
cd ..
firebase deploy --only functions
```

The `onAlertCreated` function fans out an Expo Push message to every user
whose `teamId` matches the alert's target (or `all`) and who has a saved
`fcmToken`.

## 5. Build the mobile app

```
npx expo start
# scan QR with Expo Go on Android, or run:
npx expo run:android
```

First launch flow:
1. App signs in anonymously.
2. User enters display name + the bootstrap invite code (`ADMIN1`).
3. `joinWithInviteCode` transaction: creates `users/<uid>` with role
   `super_admin`, marks code used.
4. HomeScreen shows all three action buttons.
5. Open **Admin** → generate more invite codes for managers/members.

## 6. Verify push path

1. Launch app on device #1 (member, team1). Grant notification permission.
2. Launch app on device #2 (super_admin, all). Send a red alert to team1.
3. Device #1 should see:
   - Full-screen live alert overlay (foreground)
   - System notification with siren-priority (background/locked)
4. Press "קיבלתי" to ack — the doc's `acknowledgedBy` array grows.

## Known gaps

- iOS Critical Alerts requires Apple entitlement approval (production only).
- Sound file is `default` — swap to a bundled `.wav` for a louder siren.
- No repeated push for red alerts server-side; overlay vibration loops only
  while the app is foregrounded.
