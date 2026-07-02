/**
 * Seed an initial invite code using firebase-admin (bypasses Firestore rules).
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *     npx ts-node scripts/seed.ts <CODE> <role> <teamId>
 *
 * Example:
 *   npx ts-node scripts/seed.ts ADMIN1 super_admin all
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const ROLES = ['super_admin', 'manager', 'member'] as const;
const TEAMS = ['team1', 'team2', 'all'] as const;

type Role = (typeof ROLES)[number];
type Team = (typeof TEAMS)[number];

async function main() {
  const [, , codeArg, roleArg, teamArg] = process.argv;
  if (!codeArg || !roleArg || !teamArg) {
    console.error('Usage: seed.ts <CODE> <role> <teamId>');
    process.exit(1);
  }
  const code = codeArg.toUpperCase();
  if (!(ROLES as readonly string[]).includes(roleArg)) {
    console.error(`role must be one of: ${ROLES.join(', ')}`);
    process.exit(1);
  }
  if (!(TEAMS as readonly string[]).includes(teamArg)) {
    console.error(`teamId must be one of: ${TEAMS.join(', ')}`);
    process.exit(1);
  }

  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();
  const ref = db.collection('inviteCodes').doc(code);
  const existing = await ref.get();
  if (existing.exists) {
    console.error(`code ${code} already exists`);
    process.exit(1);
  }
  await ref.set({
    role: roleArg as Role,
    teamId: teamArg as Team,
    used: false,
    createdBy: 'seed-script',
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log(`created invite code ${code} (${roleArg}, ${teamArg})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
