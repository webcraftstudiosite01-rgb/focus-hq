// Focus HQ - TypeScript Domain Types

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type RecurringFrequency = 'none' | 'daily' | 'weekly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  category: string;
  status: TaskStatus;
  subtasks: Subtask[];
  recurring: RecurringFrequency;
  goalId?: string;
  completedAt?: string; // ISO string when completed
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  deadline: string; // YYYY-MM-DD
  targetValue: number;
  currentValue: number;
  unit: string; // e.g. '$', 'клиентов', 'проектов'
  autoCalculateFromTasks: boolean;
  milestones: Milestone[];
  status: GoalStatus;
  createdAt: string;
}

export type LeadStatus = 'contacted' | 'replied' | 'negotiating' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  contactLink: string;
  niche: string;
  status: LeadStatus;
  price: number;
  notes: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: string;
  text: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: string;
  color: string;
  history: Record<string, boolean>; // key: YYYY-MM-DD, val: true
  createdAt: string;
}

export interface DailyReview {
  id: string;
  date: string; // YYYY-MM-DD
  whatDone: string;
  whatWentWrong: string;
  tomorrowPlan: string;
  rating?: number; // 1 to 5
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  type: 'work' | 'short_break' | 'long_break';
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
}

export interface OutreachDayLog {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  monthlyIncomeTarget: number;
  dailyOutreachTarget: number;
  pomodoroWorkDuration: number; // minutes
  pomodoroShortBreak: number;
  pomodoroLongBreak: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface AppDataBackup {
  version: string;
  exportedAt: string;
  updatedAtTimestamp?: number;
  tasks: Task[];
  goals: Goal[];
  leads: Lead[];
  templates: MessageTemplate[];
  habits: Habit[];
  reviews: DailyReview[];
  pomodoroSessions: PomodoroSession[];
  outreachLogs: Record<string, number>; // date -> count
  settings: AppSettings;
}
