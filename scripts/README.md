# Scripts

Node scripts that use `firebase-admin` to bypass Firestore security rules.
Run outside the mobile app.

## Setup

```
npm i -D ts-node firebase-admin
```

Get a service account key from Firebase Console → Project Settings →
Service Accounts → Generate new private key. Save as
`scripts/service-account.json` — **do not commit it** (already gitignored
via `*service-account*.json`).

```
export GOOGLE_APPLICATION_CREDENTIALS=./scripts/service-account.json
```

## seed.ts

Create an invite code (used to bootstrap the first super_admin).

```
npx ts-node scripts/seed.ts ADMIN1 super_admin all
```
