import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { getTodayString } from '../utils/dateUtils';
import { playSoftChime } from '../utils/sound';
import { sendNotification, requestNotificationPermission } from '../utils/notifications';
import { ProgressRing } from '../components/ui/ProgressRing';
import {
  Timer, Play, Pause, RotateCcw, SkipForward, CheckCircle2,
  Bell, Volume2, Sparkles, Clock, ListChecks
} from 'lucide-react';

export const PomodoroPage: React.FC = () => {
  const {
    tasks,
    settings,
    todayFocusedMinutes,
    recordPomodoroSession,
    pomodoroSessions,
    triggerConfetti,
  } = useApp();

  type Mode = 'work' | 'short_break' | 'long_break';
  const [mode, setMode] = useState<Mode>('work');

  // Selected task attachment
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Mode durations in seconds
  const getDuration = (m: Mode) => {
    if (m === 'work') return (settings.pomodoroWorkDuration || 25) * 60;
    if (m === 'short_break') return (settings.pomodoroShortBreak || 5) * 60;
    return (settings.pomodoroLongBreak || 15) * 60;
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => getDuration('work'));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Update timeLeft when settings change if not running
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDuration(mode));
    }
  }, [settings, mode]);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, mode, selectedTaskId]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    // Play chime sound
    if (settings.soundEnabled) {
      playSoftChime();
    }

    // Trigger confetti if work session
    if (mode === 'work') {
      triggerConfetti();
    }

    // Desktop Notification
    if (settings.notificationsEnabled) {
      const title =
        mode === 'work'
          ? '🎉 Помодоро завершено!'
          : '⚡️ Перерыв окончен, пора вернуться к фокусу!';
      const body =
        mode === 'work'
          ? 'Отличная работа! Сделайте 5-минутный перерыв.'
          : 'Сделайте глубокий вдох и начните новую рабочую сессию.';
      sendNotification(title, { body });
    }

    // Record session
    const durationMins =
      mode === 'work'
        ? settings.pomodoroWorkDuration
        : mode === 'short_break'
        ? settings.pomodoroShortBreak
        : settings.pomodoroLongBreak;

    const matchedTask = tasks.find((t) => t.id === selectedTaskId);

    recordPomodoroSession({
      taskId: selectedTaskId || undefined,
      taskTitle: matchedTask?.title,
      durationMinutes: durationMins,
      type: mode,
      date: getTodayString(),
    });

    // Switch mode automatically
    if (mode === 'work') {
      setMode('short_break');
      setTimeLeft(getDuration('short_break'));
    } else {
      setMode('work');
      setTimeLeft(getDuration('work'));
    }
  };

  const toggleTimer = async () => {
    if (!isRunning && settings.notificationsEnabled) {
      await requestNotificationPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const skipTimer = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setMode('short_break');
      setTimeLeft(getDuration('short_break'));
    } else {
      setMode('work');
      setTimeLeft(getDuration('work'));
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = getDuration(mode);
  const progressPercent = Math.round(((totalDuration - timeLeft) / totalDuration) * 100);

  // Active uncompleted tasks for select
  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const todaySessions = pomodoroSessions.filter((s) => s.date === getTodayString() && s.type === 'work');

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl mx-auto">
      
      {/* 1. Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Таймер глубокого фокуса
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Метод Помодоро (25/5): работайте спринтами без отвлечений и отслеживайте чистое время
        </p>
      </div>

      {/* 2. Mode Selector Pills */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit mx-auto">
        <button
          onClick={() => handleModeChange('work')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mode === 'work'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Фокус ({settings.pomodoroWorkDuration} мин)
        </button>
        <button
          onClick={() => handleModeChange('short_break')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mode === 'short_break'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Короткий отдых ({settings.pomodoroShortBreak} мин)
        </button>
        <button
          onClick={() => handleModeChange('long_break')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mode === 'long_break'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Длинный отдых ({settings.pomodoroLongBreak} мин)
        </button>
      </div>

      {/* 3. Main Circular Timer Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        
        {/* Progress Ring with giant clock */}
        <div className="py-2">
          <ProgressRing
            progress={progressPercent}
            size={240}
            strokeWidth={14}
            strokeColor={mode === 'work' ? '#6366f1' : mode === 'short_break' ? '#10b981' : '#06b6d4'}
          >
            <div className="flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {timeFormatted}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                {mode === 'work' ? 'Сессия фокуса' : 'Перерыв'}
              </span>
            </div>
          </ProgressRing>
        </div>

        {/* Task Link Attachment Selector */}
        <div className="w-full max-w-sm space-y-1.5">
          <label className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <ListChecks className="w-3.5 h-3.5" /> Привязать сессию к задаче:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none text-center"
          >
            <option value="">Без конкретной задачи (общий фокус)</option>
            {activeTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Controls: Play / Pause, Reset, Skip */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetTimer}
            className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Сбросить таймер"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-extrabold text-white shadow-lg active:scale-95 transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Пауза</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{timeLeft < totalDuration ? 'Продолжить' : 'Начать фокус'}</span>
              </>
            )}
          </button>

          <button
            onClick={skipTimer}
            className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Пропустить сессию"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* 4. Stats & Completed Sessions Today */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Today's total focus time */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Чистое время фокуса сегодня
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {todayFocusedMinutes} мин
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ≈ {(todayFocusedMinutes / 60).toFixed(1)} ч глубокой работы
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Sessions count */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Завершенных спринтов сегодня
            </span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {todaySessions.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Цель дня: 4+ спринта (100+ минут)
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

      </div>

    </div>
  );
};
