# 🚨 EmergencyAlert — אפליקציית התרעת חירום

אפליקציה מובייל לניהול והפצת התרעות חירום לצוותי מתנדבים.

## הבעיה שפתרנו

חברי צוות שמים את הטלפון על מצב שקט בלילה ומפספסים התרעות חירום.
האפליקציה עוקפת מצב שקט ו-DND ומבטיחה שכולם יקבלו את ההתרעה.

## תפקידים

- **Super Admin** — ניהול משתמשים, יצירת קודי הזמנה, שליחת התרעות.
- **Manager** — שליחת התרעות בלבד.
- **Member** — קבלת התרעות בלבד.

## צוותים

- 🔵 צוות הסתערבות (`team1`)
- 🟡 כיתת כוננות (`team2`)

## רמות התרעה

| רמה | משמעות | ערוץ אנדרואיד | קול iOS |
|-----|--------|--------------|---------|
| 🟢 ירוק | עדכון כללי / טסט | `alerts-green` (DEFAULT) | default |
| 🟠 כתום | אירוע פעיל | `alerts-orange` (HIGH) | default |
| 🔴 אדום | חירום | `alerts-red` (MAX + bypassDnd) | critical alert |

## תשתית

- **Frontend:** React Native + Expo (Expo Router)
- **State/Auth:** Firebase Anonymous Auth + קוד הזמנה חד-פעמי
- **DB:** Firestore (`users`, `alerts`, `inviteCodes`)
- **Push:** Cloud Function `onAlertCreated` שולחת Expo Push לכל
  המכשירים בצוות היעד
- **RTL:** מלא, כל הטקסטים ב-`src/i18n/he.ts`

## מבנה הפרויקט

```
app/                    expo-router routes
  _layout.tsx           AuthProvider + NotificationSetup + LiveAlertOverlay
  index.tsx             gate: config-missing → join → home
  alert.tsx history.tsx admin.tsx

src/
  components/           HomeBanner, LiveAlertOverlay
  config/               firebase.ts, alertTypes.ts
  context/              AuthContext, NotificationSetup
  i18n/he.ts            all Hebrew strings
  screens/              Join, Home, Alert, History, Admin, ConfigMissing
  services/             firestore.ts (CRUD), notifications.ts
  types/index.ts        User, Alert, InviteCode, TeamId, AlertLevel, UserRole

functions/              firebase-functions v2 onAlertCreated fanout
scripts/                admin-SDK bootstrap (seed initial invite code)
docs/BOOTSTRAP.md       end-to-end bring-up guide
firestore.rules         role-based security rules
firebase.json           firestore + functions wiring
```

## התחלה מהירה

ראה [`docs/BOOTSTRAP.md`](docs/BOOTSTRAP.md) לתהליך מלא. תמצית:

```bash
# 1. Firebase project + copy config
cp .env.example .env  # מלא את המפתחות

# 2. Deploy rules + functions
firebase deploy --only firestore:rules
cd functions && npm install && cd ..
firebase deploy --only functions

# 3. Seed the first super_admin invite code
GOOGLE_APPLICATION_CREDENTIALS=./scripts/service-account.json \
  npx ts-node scripts/seed.ts ADMIN1 super_admin all

# 4. Run the app
npm install
npx expo start
```

## פיתוח

```bash
npx tsc --noEmit           # type-check the app
cd functions && npx tsc --noEmit    # type-check the CF
```

CI (`.github/workflows/ci.yml`) מריץ את שני ה-tsc אוטומטית ב-PR ובדחיפה
ל-`main`.

## סטטוס

- ✅ Auth + join flow + RTL
- ✅ Send / history / admin (role-gated)
- ✅ Live in-app alert overlay עם ויברציה חוזרת
- ✅ Firestore security rules
- ✅ Push fanout Cloud Function
- ✅ CI

חסר לפני production:
- Apple Critical Alerts entitlement (אישור פרודקשן)
- קובץ צליל בכפייה למכשירי אנדרואיד (במקום default)
- Cron re-push לרמת אדום עד לאישור

---

פותח עבור צוות מתנדבים 🇮🇱
