# 🚨 EmergencyAlert - אפליקציית התרעת חירום

אפליקציה מובייל לניהול והפצת התרעות חירום לצוותי מתנדבים.

## הבעיה שפתרנו
אנשי צוות שמים את הטלפון על מצב שקט בלילה ומפספסים התרעות חירום.
האפליקציה עוקפת מצב שקט ו-DND ומבטיחה שכולם יקבלו את ההתרעה.

## הצוותים
- 🔵 צוות הסתערבות
- 🟡 כיתת כוננות

## רמות התרעה
| רמה | משמעות | התנהגות |
|-----|---------|----------|
| 🟢 ירוק | עדכון כללי / טסט | התרעה רגילה |
| 🟠 כתום | אירוע פעיל | עוקף מצב שקט |
| 🔴 אדום | חירום אמת | עוקף DND + אזעקה חוזרת |

## תפקידים במערכת
- **Super Admin** - ניהול מלא של המערכת והמשתמשים
- **Manager** - שליחת התרעות לצוותים
- **Member** - קבלת התרעות בלבד

## כניסה למערכת
המערכת סגורה - הצטרפות באמצעות קוד הזמנה בלבד.

## טכנולוגיות
- **Frontend:** React Native (Expo)
- **Backend:** Firebase Firestore
- **Auth:** Firebase Anonymous Auth + קוד הזמנה
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Platforms:** Android + iOS

## התקנה למפתחים

### דרישות מקדימות
- Node.js
- Expo CLI
- חשבון Firebase

### הרצה
```bash
git clone https://github.com/eladelkabas/EmergencyAlert.git
cd EmergencyAlert/EmergencyAlert2
npm install
npx expo start
```

### משתני סביבה
צור קובץ `src/config/firebase.ts` עם ה-credentials שלך מ-Firebase Console.

## סטטוס הפרויקט
🚧 בפיתוח פעיל

### הושלם ✅
- תשתית Firebase
- מבנה פרויקט ומסכים
- מערכת תפקידים וצוותים
- הגדרת רמות התרעה

### בפיתוח 🔄
- מסך כניסה עם קוד הזמנה
- מסך שליחת התרעות
- Push Notifications שעוקפות DND
- מסך ניהול משתמשים

## אבטחה
- אין רישום פתוח - קוד הזמנה בלבד
- Firebase Security Rules
- הרשאות לפי תפקיד

---
פותח עבור צוות מתנדבים 🇮🇱
