export type UserRole = 'super_admin' | 'manager' | 'member';

export type TeamId = 'team1' | 'team2' | 'all';

export type AlertLevel = 'green' | 'orange' | 'red';

export interface User {
  uid: string;
  role: UserRole;
  teamId: TeamId;
  displayName?: string;
  fcmToken?: string;
  createdAt: Date;
}

export interface Alert {
  id: string;
  level: AlertLevel;
  teamTarget: TeamId;
  message: string;
  sentBy: string;
  sentAt: Date;
  acknowledgedBy: string[];
}

export interface InviteCode {
  code: string;
  role: UserRole;
  teamId: TeamId;
  used: boolean;
  createdAt: Date;
}
