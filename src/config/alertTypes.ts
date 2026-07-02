import type { AlertLevel, TeamId } from '../types';

export const ALERT_LEVELS: Record<
  AlertLevel,
  { id: AlertLevel; label: string; color: string; priority: 'normal' | 'high' | 'max' }
> = {
  green: {
    id: 'green',
    label: 'ירוק - עדכון כללי',
    color: '#4CAF50',
    priority: 'normal',
  },
  orange: {
    id: 'orange',
    label: 'כתום - אירוע פעיל',
    color: '#FF9800',
    priority: 'high',
  },
  red: {
    id: 'red',
    label: 'אדום - חירום',
    color: '#F44336',
    priority: 'max',
  },
};

export const TEAMS: Record<
  Exclude<TeamId, 'all'>,
  { id: Exclude<TeamId, 'all'>; label: string }
> = {
  team1: {
    id: 'team1',
    label: 'צוות הסתערבות',
  },
  team2: {
    id: 'team2',
    label: 'כיתת כוננות',
  },
};

export const TEAM_ALL_LABEL = 'כל הצוותים';

export function teamLabel(teamId: TeamId): string {
  if (teamId === 'all') return TEAM_ALL_LABEL;
  return TEAMS[teamId]?.label ?? teamId;
}
