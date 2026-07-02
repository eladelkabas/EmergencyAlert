export const ALERT_LEVELS = {
  green: {
    id: 'green' as const,
    label: 'ירוק - עדכון כללי',
    color: '#4CAF50',
    priority: 'normal' as const,
  },
  orange: {
    id: 'orange' as const,
    label: 'כתום - אירוע פעיל',
    color: '#FF9800',
    priority: 'high' as const,
  },
  red: {
    id: 'red' as const,
    label: 'אדום - חירום',
    color: '#F44336',
    priority: 'max' as const,
  },
};

export const TEAMS = {
  team1: {
    id: 'team1' as const,
    label: 'צוות הסתערבות',
  },
  team2: {
    id: 'team2' as const,
    label: 'כיתת כוננות',
  },
};

export type AlertLevelId = keyof typeof ALERT_LEVELS;
export type TeamId = keyof typeof TEAMS;
