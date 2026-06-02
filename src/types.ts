export type Branch = 'scientific_biology' | 'scientific_applied' | 'literary' | 'custom';

export interface SubjectConfig {
  id: string;
  name: string;
  weight: number; // 3 for heavy, 2 for medium, 1.5 for light
  color: string; // Tailwind color class for badges/backgrounds
}

export interface SelectedSubject {
  id: string;
  name: string;
  allocatedMinutes: number;
  completed: boolean;
  notes?: string;
  timeSpent?: number; // accumulated focused time in minutes
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD
  availableHours: number;
  subjects: SelectedSubject[];
  completedAt?: string; // timestamp when all completed
}

export interface DayStreak {
  history: { [date: string]: boolean }; // date -> isCompleted
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface MotivationalQuote {
  text: string;
  author?: string;
  category: 'motivation' | 'study_tip' | 'iraqi_phrase';
}
