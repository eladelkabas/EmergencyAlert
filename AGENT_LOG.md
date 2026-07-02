# Agent Log

## [Session 1]
- Date: Sunday, May 31, 2026
- Agent: Cursor
- Task: Project initialization
- Actions taken:
  - Created PROJECT_OVERVIEW.md
  - Created AGENT_LOG.md
  - Initialized Expo project via terminal
- Files created: PROJECT_OVERVIEW.md, AGENT_LOG.md
- Next step: Install Firebase and configure push notifications

## [Session 2]
- Date: Sunday, May 31, 2026
- Agent: Cursor
- Task: Firebase setup and project configuration
- Actions taken:
  - Installed firebase, expo-notifications, expo-device,
    async-storage
  - Created src/config/firebase.ts (credentials pending)
  - Created src/config/alertTypes.ts
- Next step: Create Firebase project in console,
  add real credentials, build first screen

## [Session 3]
- Date: Sunday, May 31, 2026
- Agent: Cursor
- Task: Firebase credentials configured + dependencies installed
- Actions taken:
  - Updated src/config/firebase.ts with real credentials
  - Installed firebase, expo-notifications, expo-device,
    async-storage
  - Created src/config/alertTypes.ts
  - Firebase project: emergencyalert-43b91
  - Firestore: Tel Aviv (me-west1)
  - Auth: Anonymous enabled
- Next step: Build app screens and navigation structure

## [Session 4]
- Date: Sunday, May 31, 2026
- Agent: Cursor
- Task: Navigation structure and screens created
- Actions taken:
  - Installed navigation packages
  - Created src/types/index.ts
  - Created src/context/AuthContext.tsx
  - Created 5 placeholder screens
  - Updated _layout.tsx and index.tsx
- Next step: Run app and verify it loads correctly

## [Session 5]
- Date: Tuesday, June 2, 2026
- Agent: Cursor
- Task: Phase 0 + Phase 1 full scaffold — first proper Git commit
- Actions taken:
  - Verified all EmergencyAlert2/ source files were complete but uncommitted
  - Confirmed package.json includes all required dependencies (firebase,
    expo-notifications, expo-device, @react-native-async-storage/async-storage,
    expo-router, react-native-safe-area-context, react-native-screens)
  - Added .env to .gitignore to protect Firebase credentials
  - Verified app/_layout.tsx (AuthProvider + RTL + Stack router)
  - Verified app/index.tsx (auth-state routing: loading → join → home)
  - Verified src/config/firebase.ts (EXPO_PUBLIC_ env vars only, no hardcoded creds)
  - Verified src/config/alertTypes.ts (3 alert levels + 2 teams in Hebrew)
  - Verified src/types/index.ts (UserRole, TeamId, User, Alert, InviteCode)
  - Verified src/context/AuthContext.tsx (anonymous sign-in + Firestore user lookup)
  - Verified 5 placeholder screens with Hebrew text and RTL layout
  - Committed entire scaffold as "Phase 1: full project scaffold"
- Files committed: all EmergencyAlert2/ source and config files
- Next step: Add real Firebase credentials in .env, run the app, verify it boots

## [Session 6]
- Date: Tuesday, June 2, 2026
- Agent: Cursor
- Task: Created .env template
- Actions taken:
  - Created EmergencyAlert2/.env (empty template)
  - Verified .env is in .gitignore (line 34 of EmergencyAlert2/.gitignore)
- Next step: Fill .env with real Firebase credentials

## [Session 7]
- Date: Tuesday, June 2, 2026
- Agent: Cursor
- Task: Fix Firebase/Hermes compatibility
- Actions taken:
  - Updated babel.config.js with three private-property plugins:
    @babel/plugin-proposal-private-methods,
    @babel/plugin-proposal-class-properties,
    @babel/plugin-proposal-private-property-in-object
  - Installed missing babel plugins via npm (--legacy-peer-deps)
  - Killed stale Expo process on port 8081
  - Cleared Metro cache and restarted: npx expo start --clear
  - Metro Bundler started successfully on http://localhost:8081
  - No SyntaxError on startup — fix confirmed working
  - Note: minor version-mismatch warnings exist for babel-preset-expo,
    @types/react, typescript (non-blocking, cleanup in future session)
- Next step: Verify app loads correctly on device

## [Session 8]
- Date: Thursday, July 2, 2026
- Agent: Claude (Opus 4.7)
- Task: Consolidate repo + build Phase 2 features autonomously

- Actions taken:
  - Consolidated repo: removed empty EmergencyAlert/ and duplicate
    EmergencyAlert3/ mockup, flattened EmergencyAlert2/ contents to
    repo root. Cleaned iCloud "* 2.*" duplicate files and added
    them to .gitignore.
  - Rebased local main onto origin/main (which had PR #2 merged),
    pushed main, deleted stale remote branches `one` and
    `cursor/emergencyalert3-hebrew-ui`. Repo now has a single
    `main` branch, local and remote in sync.
  - Reconciled type definitions: TeamId lives in src/types/index.ts
    ('team1' | 'team2' | 'all'); src/config/alertTypes.ts imports
    from types and re-exports typed maps + a teamLabel() helper.
  - Created src/services/firestore.ts with typed CRUD helpers:
    getUser, joinWithInviteCode (transactional), sendAlert,
    acknowledgeAlert, listenToAlerts, generateInviteCode,
    listInviteCodes, listUsers, updateUserRole, updateUserTeam,
    updateUserFcmToken.
  - Extracted all Hebrew strings to src/i18n/he.ts (single source
    of truth for app/join/alert/history/admin/liveAlert/errors).
  - JoinScreen: wired to joinWithInviteCode. Validates input,
    calls refreshUser on success, shows error dialogs on failure.
  - HomeScreen: role-based navigation hub. Send-alert button for
    super_admin/manager, history for all, admin panel for
    super_admin. Uses expo-router push.
  - AlertScreen: 3 severity buttons (red/orange/green), team
    selector (team1/team2/all), optional message, confirm dialog,
    sends via sendAlert(), navigates back on success.
  - HistoryScreen: live Firestore listener via listenToAlerts,
    filters by user's team + 'all'. List with color-coded level
    stripe, sender team, message, ack button.
  - AdminScreen (super_admin gated): generate invite codes with
    role+team selectors, list codes with used/available status,
    list users with cycle-role and cycle-team buttons.
  - Added app/alert.tsx, app/history.tsx, app/admin.tsx route
    entries for expo-router.
  - Created src/services/notifications.ts: notification handler,
    Android channels (red = MAX importance + bypass DND, orange =
    HIGH, green = DEFAULT), permission request (allowCriticalAlerts
    on iOS), Expo push token retrieval.
  - Added src/context/NotificationSetup.tsx to wire notification
    permission + FCM token save to user doc on login. Mounted in
    app/_layout.tsx.
  - Added src/components/LiveAlertOverlay.tsx: subscribes to
    alerts, on new red/orange for user's team shows full-screen
    color-coded modal with vibration (looping for red). Ack
    dismisses modal and writes acknowledgedBy.
  - Fixed firebase RN persistence import: metro resolves
    getReactNativePersistence from firebase/auth at runtime, but
    the shipped .d.ts only ships the web surface; added
    @ts-expect-error on the import to keep tsc clean.
  - Bumped typescript to ~5.6.0 to satisfy expo's tsconfig.base
    (module=preserve requires TS 5.4+). Removed accidental
    duplicate @types/{istanbul-reports,yargs} " 2" folders.
  - `npx tsc --noEmit` passes clean (exit 0) on the entire tree.

- Files created:
  - src/services/firestore.ts
  - src/services/notifications.ts
  - src/context/NotificationSetup.tsx
  - src/components/LiveAlertOverlay.tsx
  - src/i18n/he.ts
  - app/alert.tsx, app/history.tsx, app/admin.tsx

- Files updated:
  - src/config/alertTypes.ts (typed to canonical TeamId)
  - src/config/firebase.ts (RN persistence import)
  - src/screens/{JoinScreen,HomeScreen,AlertScreen,HistoryScreen,
    AdminScreen}.tsx (full implementations)
  - app/_layout.tsx (mounted NotificationSetup + LiveAlertOverlay)

- Next step: fill EmergencyAlert/.env with real Firebase
  credentials, seed an initial super-admin invite code in
  Firestore console, launch on a physical device, verify:
    1. Anonymous auth + join flow with a valid invite code
    2. HomeScreen renders role-based buttons
    3. Sending a red alert triggers full-screen overlay on
       another device in the same team
    4. Push notification arrives when app is backgrounded
    5. Ack button writes acknowledgedBy and dismisses vibration

## [Session 9]
- Date: Thursday, July 2, 2026
- Agent: Claude (Opus 4.7)
- Task: Phase 3 — security rules, push CF, bootstrap tooling, config guards

- Actions taken:
  - firestore.rules: enforced role-based read/write per collection.
    Users can only edit their own fcmToken/displayName (role/team
    fields locked for self). Only super_admin may promote or move
    users, or create/delete invite codes. Alerts: only manager/
    super_admin may create with sentBy == self and empty
    acknowledgedBy; any signed-in user may append their own uid to
    acknowledgedBy (all other fields must be preserved). Invite codes:
    any signed-in user may redeem an unused code by flipping
    used=false to used=true; role/teamId cannot be tampered with.
  - Added firebase.json wiring firestore rules + functions.
  - functions/: created firebase-functions v2 workspace with own
    tsconfig, package.json (node 20 runtime, firebase-admin,
    firebase-functions). onAlertCreated Firestore trigger queries
    matching users (teamId in [target, 'all']), builds an Expo Push
    payload per token (critical alert + channelId=alerts-red for
    red level, high priority for orange), sends in chunks of 100 to
    https://exp.host/--/api/v2/push/send.
  - scripts/seed.ts + README: node script using firebase-admin
    (application default credentials via GOOGLE_APPLICATION_CREDENTIALS)
    to create an initial invite code that bypasses Firestore rules —
    solves the bootstrap chicken-and-egg (rules require super_admin
    to create codes but no user has super_admin yet).
  - docs/BOOTSTRAP.md: end-to-end bring-up guide covering Firebase
    project setup, env vars, rules deploy, first-invite bootstrap
    (console or seed script), CF deploy, mobile launch, push
    verification path, and known gaps (iOS Critical Alerts entitlement,
    default sound, no server-side red-alert re-push).
  - JoinScreen: added display name input, validated before code
    submit, passed through to joinWithInviteCode (stored on user
    doc).
  - HomeScreen: added logout button with confirmation dialog. Calls
    firebase signOut — onAuthStateChanged fires with null →
    anonymous re-sign-in → new uid without a user doc → JoinScreen.
    (Acts as a "leave team" flow.)
  - src/config/firebase.ts: detects missing EXPO_PUBLIC_FIREBASE_*
    env keys instead of crashing initializeApp with undefined.
    Exports isFirebaseConfigured + missingFirebaseConfig for the UI.
  - Added src/screens/ConfigMissingScreen.tsx and wired app/index.tsx
    to render it when config keys are missing. AuthContext no-ops if
    not configured to avoid null-deref on auth/db.
  - Root tsconfig.json: excluded functions/ and scripts/ from the app
    typecheck (they have their own toolchains and firebase-admin
    isn't installed at the app level).
  - .gitignore: added *service-account*.json and
    scripts/service-account.json.
  - `npx tsc --noEmit` still clean on the app tree.

- Files created:
  - firestore.rules, firebase.json
  - functions/{package.json,tsconfig.json,.gitignore,src/index.ts}
  - scripts/{seed.ts,README.md}
  - docs/BOOTSTRAP.md
  - src/screens/ConfigMissingScreen.tsx

- Files updated:
  - app/index.tsx (config-missing gate)
  - src/config/firebase.ts (env-var validation + lazy init)
  - src/context/AuthContext.tsx (no-op when not configured)
  - src/i18n/he.ts (name field + logout confirm strings)
  - src/screens/JoinScreen.tsx (display name input)
  - src/screens/HomeScreen.tsx (logout button)
  - tsconfig.json (exclude functions + scripts)
  - .gitignore (service account keys)

- Next step:
  - Set EXPO_PUBLIC_FIREBASE_* keys in .env (project already exists:
    emergencyalert-43b91, me-west1)
  - firebase login && firebase use emergencyalert-43b91
  - firebase deploy --only firestore:rules
  - Seed first super_admin invite code (console or seed.ts)
  - cd functions && npm install && firebase deploy --only functions
  - npx expo start, run on device, complete join flow
  - Send a red alert to team1 from a second device and verify
    LiveAlertOverlay + system push both fire
