import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Alert, AlertLevel, InviteCode, TeamId, User, UserRole } from '../types';

const USERS = 'users';
const ALERTS = 'alerts';
const INVITE_CODES = 'inviteCodes';

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

function parseUser(uid: string, data: Record<string, unknown>): User {
  return {
    uid,
    role: (data.role as UserRole) ?? 'member',
    teamId: (data.teamId as TeamId) ?? 'team1',
    displayName: data.displayName as string | undefined,
    fcmToken: data.fcmToken as string | undefined,
    createdAt: toDate(data.createdAt),
  };
}

function parseAlert(id: string, data: Record<string, unknown>): Alert {
  return {
    id,
    level: data.level as AlertLevel,
    teamTarget: data.teamTarget as TeamId,
    message: (data.message as string) ?? '',
    sentBy: (data.sentBy as string) ?? '',
    sentAt: toDate(data.sentAt),
    acknowledgedBy: (data.acknowledgedBy as string[]) ?? [],
  };
}

function parseInviteCode(code: string, data: Record<string, unknown>): InviteCode {
  return {
    code,
    role: data.role as UserRole,
    teamId: data.teamId as TeamId,
    used: (data.used as boolean) ?? false,
    createdAt: toDate(data.createdAt),
  };
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, USERS, uid));
  return snap.exists() ? parseUser(uid, snap.data()) : null;
}

export async function joinWithInviteCode(
  uid: string,
  rawCode: string,
  displayName?: string,
): Promise<User> {
  const code = rawCode.trim().toUpperCase();
  if (!code) throw new Error('קוד הזמנה ריק');

  return runTransaction(db, async (tx) => {
    const codeRef = doc(db, INVITE_CODES, code);
    const codeSnap = await tx.get(codeRef);
    if (!codeSnap.exists()) throw new Error('קוד הזמנה לא קיים');
    const codeData = codeSnap.data();
    if (codeData.used) throw new Error('קוד הזמנה כבר בשימוש');

    const userRef = doc(db, USERS, uid);
    const existing = await tx.get(userRef);
    if (existing.exists()) throw new Error('משתמש כבר קיים');

    const userDoc = {
      role: codeData.role,
      teamId: codeData.teamId,
      displayName: displayName ?? null,
      createdAt: serverTimestamp(),
    };
    tx.set(userRef, userDoc);
    tx.update(codeRef, { used: true, usedBy: uid, usedAt: serverTimestamp() });

    return {
      uid,
      role: codeData.role as UserRole,
      teamId: codeData.teamId as TeamId,
      displayName,
      createdAt: new Date(),
    };
  });
}

export async function sendAlert(params: {
  level: AlertLevel;
  teamTarget: TeamId;
  message: string;
  sentBy: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, ALERTS), {
    level: params.level,
    teamTarget: params.teamTarget,
    message: params.message,
    sentBy: params.sentBy,
    sentAt: serverTimestamp(),
    acknowledgedBy: [],
  });
  return ref.id;
}

export async function acknowledgeAlert(alertId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, ALERTS, alertId), {
    acknowledgedBy: arrayUnion(uid),
  });
}

export function listenToAlerts(
  userTeam: TeamId,
  onData: (alerts: Alert[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const targets: TeamId[] = userTeam === 'all' ? ['team1', 'team2', 'all'] : [userTeam, 'all'];
  const q = query(
    collection(db, ALERTS),
    where('teamTarget', 'in', targets),
    orderBy('sentAt', 'desc'),
    limit(50),
  );
  return onSnapshot(
    q,
    (snap) => {
      const alerts = snap.docs.map((d) => parseAlert(d.id, d.data()));
      onData(alerts);
    },
    (err) => onError?.(err),
  );
}

function randomCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function generateInviteCode(params: {
  role: UserRole;
  teamId: TeamId;
  createdBy: string;
}): Promise<InviteCode> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const ref = doc(db, INVITE_CODES, code);
    const existing = await getDoc(ref);
    if (existing.exists()) continue;
    await setDoc(ref, {
      role: params.role,
      teamId: params.teamId,
      used: false,
      createdBy: params.createdBy,
      createdAt: serverTimestamp(),
    });
    return {
      code,
      role: params.role,
      teamId: params.teamId,
      used: false,
      createdAt: new Date(),
    };
  }
  throw new Error('נכשלה יצירת קוד ייחודי');
}

export async function listInviteCodes(): Promise<InviteCode[]> {
  const snap = await getDocs(query(collection(db, INVITE_CODES), orderBy('createdAt', 'desc'), limit(50)));
  return snap.docs.map((d) => parseInviteCode(d.id, d.data()));
}

export async function listUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, USERS));
  return snap.docs.map((d) => parseUser(d.id, d.data()));
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, USERS, uid), { role });
}

export async function updateUserTeam(uid: string, teamId: TeamId): Promise<void> {
  await updateDoc(doc(db, USERS, uid), { teamId });
}

export async function updateUserFcmToken(uid: string, fcmToken: string): Promise<void> {
  await updateDoc(doc(db, USERS, uid), { fcmToken });
}
