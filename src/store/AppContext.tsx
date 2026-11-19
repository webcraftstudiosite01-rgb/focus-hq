import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Task, Goal, Lead, MessageTemplate, Habit, DailyReview,
  PomodoroSession, AppSettings, AppDataBackup, TaskStatus
} from '../types';
import { storage } from '../utils/storage';
import {
  INITIAL_SETTINGS, DEMO_GOALS, DEMO_TASKS, DEMO_LEADS,
  DEMO_TEMPLATES, DEMO_HABITS, DEMO_REVIEWS, DEMO_POMODORO_SESSIONS, DEMO_OUTREACH_LOGS
} from './demoData';
import { getTodayString, calculateStreak } from '../utils/dateUtils';
import { syncService, SyncConfig } from '../utils/syncService';
import confetti from 'canvas-confetti';

interface AppContextType {
  // State
  tasks: Task[];
  goals: Goal[];
  leads: Lead[];
  templates: MessageTemplate[];
  habits: Habit[];
  reviews: DailyReview[];
  pomodoroSessions: PomodoroSession[];
  outreachLogs: Record<string, number>;
  settings: AppSettings;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Goal Actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;

  // Lead Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  changeLeadStatus: (id: string, status: Lead['status']) => void;

  // Template Actions
  addTemplate: (tpl: Omit<MessageTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;

  // Habit Actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'history'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (habitId: string, date: string) => void;

  // Review Actions
  saveReview: (review: Omit<DailyReview, 'id' | 'createdAt'>) => void;
  deleteReview: (id: string) => void;

  // Pomodoro Actions
  recordPomodoroSession: (session: Omit<PomodoroSession, 'id' | 'timestamp'>) => void;

  // Outreach Actions
  incrementTodayOutreach: () => void;
  setOutreachCount: (date: string, count: number) => void;

  // Settings Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleTheme: () => void;

  // Cloud Synchronization
  syncConfig: SyncConfig;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime: string | undefined;
  syncNow: (direction?: 'push' | 'pull') => Promise<{ success: boolean; error?: string }>;
  updateSyncConfig: (updates: Partial<SyncConfig>) => void;
  getMobilePairingUrl: () => string;

  // Backup & Reset
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => { success: boolean; error?: string };
  resetToDemoData: () => void;
  clearAllData: () => void;

  // Computed metrics
  todayTasks: Task[];
  todayCompletedCount: number;
  todayCompletionPercentage: number;
  currentStreak: number;
  monthIncome: number;
  todayOutreachCount: number;
  todayFocusedMinutes: number;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // States with localStorage initializer
  const [tasks, setTasks] = useState<Task[]>(() => storage.get('tasks', DEMO_TASKS));
  const [goals, setGoals] = useState<Goal[]>(() => storage.get('goals', DEMO_GOALS));
  const [leads, setLeads] = useState<Lead[]>(() => storage.get('leads', DEMO_LEADS));
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => storage.get('templates', DEMO_TEMPLATES));
  const [habits, setHabits] = useState<Habit[]>(() => storage.get('habits', DEMO_HABITS));
  const [reviews, setReviews] = useState<DailyReview[]>(() => storage.get('reviews', DEMO_REVIEWS));
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>(() => storage.get('pomodoroSessions', DEMO_POMODORO_SESSIONS));
  const [outreachLogs, setOutreachLogs] = useState<Record<string, number>>(() => storage.get('outreachLogs', DEMO_OUTREACH_LOGS));
  const [settings, setSettings] = useState<AppSettings>(() => storage.get('settings', INITIAL_SETTINGS));

  // Cloud Sync State
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(() => syncService.getConfig());
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>(() => syncService.getConfig().lastSyncTime);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    storage.set('tasks', tasks);
  }, [tasks, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    storage.set('goals', goals);
  }, [goals, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    storage.set('leads', leads);
  }, [leads, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    storage.set('templates', templates);
  }, [templates, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    storage.set('habits', habits);
  }, [habits, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    storage.set('reviews', reviews);
  }, [reviews, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    storage.set('pomodoroSessions', pomodoroSessions);
  }, [pomodoroSessions, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    storage.set('outreachLogs', outreachLogs);
  }, [outreachLogs, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    storage.set('settings', settings);

    // Apply dark/light theme class to document root
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings, isInitialized]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
      });
    } catch {
      // Ignore if confetti not supported
    }
  };

  // --- Task Actions ---
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextStatus: TaskStatus = t.status === 'done' ? 'todo' : 'done';
        if (nextStatus === 'done') {
          triggerConfetti();
        }
        return {
          ...t,
          status: nextStatus,
          completedAt: nextStatus === 'done' ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subtasks: updatedSubtasks };
      })
    );
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newSt = {
          id: 'st-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
          title: title.trim(),
          completed: false,
        };
        return { ...t, subtasks: [...t.subtasks, newSt] };
      })
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return { ...t, subtasks: t.subtasks.filter((st) => st.id !== subtaskId) };
      })
    );
  };

  // --- Goal Actions ---
  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updated = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        return { ...g, milestones: updated };
      })
    );
  };

  // --- Lead Actions ---
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  const changeLeadStatus = (id: string, status: Lead['status']) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (status === 'won' && l.status !== 'won') {
          triggerConfetti();
        }
        return { ...l, status };
      })
    );
  };

  // --- Template Actions ---
  const addTemplate = (tplData: Omit<MessageTemplate, 'id'>) => {
    const newTpl: MessageTemplate = {
      ...tplData,
      id: 'tpl-' + Date.now(),
    };
    setTemplates((prev) => [...prev, newTpl]);
  };

  const updateTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Habit Actions ---
  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt' | 'history'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: 'habit-' + Date.now(),
      history: {},
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleHabitDate = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentVal = !!h.history[date];
        const newHistory = { ...h.history };
        if (currentVal) {
          delete newHistory[date];
        } else {
          newHistory[date] = true;
        }
        return { ...h, history: newHistory };
      })
    );
  };

  // --- Review Actions ---
  const saveReview = (reviewData: Omit<DailyReview, 'id' | 'createdAt'>) => {
    const existingIndex = reviews.findIndex((r) => r.date === reviewData.date);
    if (existingIndex >= 0) {
      setReviews((prev) =>
        prev.map((r, i) =>
          i === existingIndex
            ? { ...r, ...reviewData }
            : r
        )
      );
    } else {
      const newReview: DailyReview = {
        ...reviewData,
        id: 'rev-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      setReviews((prev) => [newReview, ...prev]);
    }
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // --- Pomodoro Actions ---
  const recordPomodoroSession = (sessionData: Omit<PomodoroSession, 'id' | 'timestamp'>) => {
    const newSession: PomodoroSession = {
      ...sessionData,
      id: 'pomo-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setPomodoroSessions((prev) => [newSession, ...prev]);
  };

  // --- Outreach Actions ---
  const incrementTodayOutreach = () => {
    const today = getTodayString();
    setOutreachLogs((prev) => {
      const current = prev[today] || 0;
      return {
        ...prev,
        [today]: current + 1,
      };
    });
  };

  const setOutreachCount = (date: string, count: number) => {
    setOutreachLogs((prev) => ({
      ...prev,
      [date]: Math.max(0, count),
    }));
  };

  // --- Settings Actions ---
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // --- Backup & Reset ---
  const exportDataJSON = (): string => {
    const backup: AppDataBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks,
      goals,
      leads,
      templates,
      habits,
      reviews,
      pomodoroSessions,
      outreachLogs,
      settings,
    };
    return JSON.stringify(backup, null, 2);
  };

  const getBackupDataObject = (): AppDataBackup => ({
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    tasks,
    goals,
    leads,
    templates,
    habits,
    reviews,
    pomodoroSessions,
    outreachLogs,
    settings,
  });

  // --- Cloud Sync Implementation ---
  const updateSyncConfig = (updates: Partial<SyncConfig>) => {
    setSyncConfig((prev) => {
      const next = { ...prev, ...updates };
      syncService.saveConfig(next);
      return next;
    });
  };

  const getMobilePairingUrl = (): string => {
    return syncService.getMobilePairingUrl(syncConfig);
  };

  const syncNow = async (direction?: 'push' | 'pull'): Promise<{ success: boolean; error?: string }> => {
    setSyncStatus('syncing');

    if (direction === 'push') {
      const currentData = getBackupDataObject();
      const res = await syncService.pushToCloud(currentData);
      if (res.success) {
        setSyncStatus('success');
        setLastSyncTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSyncStatus('error');
      }
      return res;
    }

    if (direction === 'pull') {
      const res = await syncService.pullFromCloud();
      if (res.success && res.data) {
        applyImportedData(res.data);
        setSyncStatus('success');
        setLastSyncTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
        return { success: true };
      } else {
        setSyncStatus('error');
        return { success: false, error: res.error };
      }
    }

    // Default: try pull first, if empty or error, push
    const pullRes = await syncService.pullFromCloud();
    if (pullRes.success && pullRes.data && Array.isArray(pullRes.data.tasks) && pullRes.data.tasks.length > 0) {
      applyImportedData(pullRes.data);
      setSyncStatus('success');
      setLastSyncTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      return { success: true };
    } else {
      const pushRes = await syncService.pushToCloud(getBackupDataObject());
      if (pushRes.success) {
        setSyncStatus('success');
        setLastSyncTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSyncStatus('error');
      }
      return pushRes;
    }
  };

  const applyImportedData = (data: Partial<AppDataBackup>) => {
    if (Array.isArray(data.tasks)) setTasks(data.tasks);
    if (Array.isArray(data.goals)) setGoals(data.goals);
    if (Array.isArray(data.leads)) setLeads(data.leads);
    if (Array.isArray(data.templates)) setTemplates(data.templates);
    if (Array.isArray(data.habits)) setHabits(data.habits);
    if (Array.isArray(data.reviews)) setReviews(data.reviews);
    if (Array.isArray(data.pomodoroSessions)) setPomodoroSessions(data.pomodoroSessions);
    if (data.outreachLogs && typeof data.outreachLogs === 'object') setOutreachLogs(data.outreachLogs);
    if (data.settings && typeof data.settings === 'object') setSettings({ ...INITIAL_SETTINGS, ...data.settings });
  };

  // Initial cloud sync and window focus listener
  useEffect(() => {
    if (!isInitialized) return;

    if (syncConfig.autoSync && syncConfig.token && syncConfig.gistId) {
      // Pull on initial load
      syncService.pullFromCloud().then((res) => {
        if (res.success && res.data && Array.isArray(res.data.tasks) && res.data.tasks.length > 0) {
          applyImportedData(res.data);
          setSyncStatus('success');
          setLastSyncTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
        } else {
          // If gist was empty, push initial state
          syncService.pushToCloud(getBackupDataObject()).then((pushRes) => {
            if (pushRes.success) {
              setSyncStatus('success');
              setLastSyncTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
            }
          });
        }
      });
    }

    // Auto-pull on window focus (so when returning from mobile to laptop, updates are instant)
    const handleFocus = () => {
      if (syncConfig.autoSync && syncConfig.token && syncConfig.gistId) {
        syncService.pullFromCloud().then((res) => {
          if (res.success && res.data) {
            applyImportedData(res.data);
            setSyncStatus('success');
            setLastSyncTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
          }
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isInitialized]);

  // Debounced auto-save to cloud
  useEffect(() => {
    if (!isInitialized || !syncConfig.autoSync || !syncConfig.token || !syncConfig.gistId) return;

    const timer = setTimeout(() => {
      setSyncStatus('syncing');
      syncService.pushToCloud(getBackupDataObject()).then((res) => {
        if (res.success) {
          setSyncStatus('success');
          setLastSyncTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
        } else {
          setSyncStatus('error');
        }
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [tasks, goals, leads, templates, habits, reviews, pomodoroSessions, outreachLogs, settings]);

  const importDataJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString) as Partial<AppDataBackup>;
      if (!parsed) {
        return { success: false, error: 'Файл пуст или поврежден.' };
      }

      if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
      if (Array.isArray(parsed.goals)) setGoals(parsed.goals);
      if (Array.isArray(parsed.leads)) setLeads(parsed.leads);
      if (Array.isArray(parsed.templates)) setTemplates(parsed.templates);
      if (Array.isArray(parsed.habits)) setHabits(parsed.habits);
      if (Array.isArray(parsed.reviews)) setReviews(parsed.reviews);
      if (Array.isArray(parsed.pomodoroSessions)) setPomodoroSessions(parsed.pomodoroSessions);
      if (parsed.outreachLogs && typeof parsed.outreachLogs === 'object') setOutreachLogs(parsed.outreachLogs);
      if (parsed.settings && typeof parsed.settings === 'object') setSettings({ ...INITIAL_SETTINGS, ...parsed.settings });

      return { success: true };
    } catch (err: unknown) {
      console.error('Import error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Неверный формат JSON файла' };
    }
  };

  const resetToDemoData = () => {
    setTasks(DEMO_TASKS);
    setGoals(DEMO_GOALS);
    setLeads(DEMO_LEADS);
    setTemplates(DEMO_TEMPLATES);
    setHabits(DEMO_HABITS);
    setReviews(DEMO_REVIEWS);
    setPomodoroSessions(DEMO_POMODORO_SESSIONS);
    setOutreachLogs(DEMO_OUTREACH_LOGS);
    setSettings(INITIAL_SETTINGS);
  };

  const clearAllData = () => {
    storage.clearAll();
    setTasks([]);
    setGoals([]);
    setLeads([]);
    setTemplates([]);
    setHabits([]);
    setReviews([]);
    setPomodoroSessions([]);
    setOutreachLogs({});
    setSettings(INITIAL_SETTINGS);
  };

  // --- Computed Metrics ---
  const todayStr = getTodayString();

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const todayCompletedCount = useMemo(() => {
    return todayTasks.filter((t) => t.status === 'done').length;
  }, [todayTasks]);

  const todayCompletionPercentage = useMemo(() => {
    if (todayTasks.length === 0) return 0;
    return Math.round((todayCompletedCount / todayTasks.length) * 100);
  }, [todayTasks, todayCompletedCount]);

  const currentStreak = useMemo(() => {
    const completedDates: string[] = [];
    tasks.forEach((t) => {
      if (t.status === 'done') {
        if (t.completedAt) {
          completedDates.push(t.completedAt.split('T')[0]);
        } else if (t.dueDate) {
          completedDates.push(t.dueDate);
        }
      }
    });
    return calculateStreak(completedDates);
  }, [tasks]);

  const monthIncome = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return leads
      .filter((lead) => lead.status === 'won' && lead.date.startsWith(currentMonthPrefix))
      .reduce((sum, lead) => sum + (Number(lead.price) || 0), 0);
  }, [leads]);

  const todayOutreachCount = useMemo(() => {
    return outreachLogs[todayStr] || 0;
  }, [outreachLogs, todayStr]);

  const todayFocusedMinutes = useMemo(() => {
    return pomodoroSessions
      .filter((s) => s.date === todayStr && s.type === 'work')
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  }, [pomodoroSessions, todayStr]);

  const value = {
    tasks,
    goals,
    leads,
    templates,
    habits,
    reviews,
    pomodoroSessions,
    outreachLogs,
    settings,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    addLead,
    updateLead,
    deleteLead,
    changeLeadStatus,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitDate,
    saveReview,
    deleteReview,
    recordPomodoroSession,
    incrementTodayOutreach,
    setOutreachCount,
    updateSettings,
    toggleTheme,
    exportDataJSON,
    importDataJSON,
    resetToDemoData,
    clearAllData,
    syncConfig,
    syncStatus,
    lastSyncTime,
    syncNow,
    updateSyncConfig,
    getMobilePairingUrl,
    todayTasks,
    todayCompletedCount,
    todayCompletionPercentage,
    currentStreak,
    monthIncome,
    todayOutreachCount,
    todayFocusedMinutes,
    triggerConfetti,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
