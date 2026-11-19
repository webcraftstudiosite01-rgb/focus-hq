import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { getGreeting, formatDateToRussian, getTodayString } from '../utils/dateUtils';
import { ProgressRing } from '../components/ui/ProgressRing';
import { NavTab } from '../components/layout/Sidebar';
import {
  CheckCircle2, Circle, Flame, Target, DollarSign, Send, ArrowRight,
  Plus, Clock, Sparkles, TrendingUp, Calendar, ChevronRight
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenTaskModal: () => void;
  onOpenSettingsModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenTaskModal,
  onOpenSettingsModal,
}) => {
  const {
    todayTasks,
    todayCompletedCount,
    todayCompletionPercentage,
    currentStreak,
    monthIncome,
    todayOutreachCount,
    todayFocusedMinutes,
    goals,
    settings,
    toggleTaskStatus,
    addTask,
    incrementTodayOutreach,
  } = useApp();

  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const todayStr = getTodayString();
  const greeting = getGreeting();
  const dateFormatted = formatDateToRussian(new Date());

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    addTask({
      title: quickTaskTitle.trim(),
      priority: 'medium',
      dueDate: todayStr,
      category: 'Работа',
      status: 'todo',
      subtasks: [],
      recurring: 'none',
    });

    setQuickTaskTitle('');
  };

  // Top 3 active goals
  const topGoals = goals.filter((g) => g.status === 'active').slice(0, 3);

  // Income target progress
  const incomeProgress = Math.min(
    100,
    Math.round((monthIncome / (settings.monthlyIncomeTarget || 1000)) * 100)
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        {/* Glow circle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-300 text-xs sm:text-sm font-medium tracking-wide">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{dateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {greeting}, Алекс!
          </h1>
          <p className="text-sm text-slate-300 max-w-lg">
            {todayTasks.length === 0
              ? 'На сегодня еще нет запланированных задач. Добавьте главную цель дня!'
              : `Сегодня запланировано задач: ${todayTasks.length}. Выполнено: ${todayCompletedCount} (${todayCompletionPercentage}%).`}
          </p>
        </div>

        {/* Quick Streak & Outreach Counters */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Streak Card */}
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[100px]">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-lg sm:text-xl">
              <Flame className="w-5 h-5 fill-current animate-bounce" />
              <span>{currentStreak}</span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium">Серия дней</span>
          </div>

          {/* Outreach Counter Card */}
          <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[110px]">
            <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-lg sm:text-xl">
              <Send className="w-4 h-4" />
              <span>
                {todayOutreachCount}/{settings.dailyOutreachTarget}
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium">Аутрич дня</span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row: Progress Ring & Money Tracker Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Progress Ring Widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Прогресс дня
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {todayCompletionPercentage}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {todayCompletedCount} из {todayTasks.length} задач готово
            </p>
          </div>

          <ProgressRing
            progress={todayCompletionPercentage}
            size={88}
            strokeWidth={9}
            strokeColor="#6366f1"
          >
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {todayCompletionPercentage}%
            </span>
          </ProgressRing>
        </div>

        {/* Money Tracker Widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Доход студии (этот месяц)
              </span>
            </div>
            <button
              onClick={onOpenSettingsModal}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              title="Изменить цель дохода"
            >
              Цель: ${settings.monthlyIncomeTarget}
            </button>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ${monthIncome.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">
                из ${settings.monthlyIncomeTarget.toLocaleString()}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${incomeProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>Выполнено {incomeProgress}% цели</span>
            <button
              onClick={() => onNavigate('crm')}
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Воронка сделок <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Focused Time & Quick Outreach Action */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Глубокий фокус
              </span>
            </div>
            <button
              onClick={() => onNavigate('pomodoro')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Открыть таймер
            </button>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {todayFocusedMinutes} мин
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round(todayFocusedMinutes / 25)} завершенных помодоро-сессий сегодня
            </p>
          </div>

          {/* Quick Outreach Button */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={incrementTodayOutreach}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-200/50 dark:border-indigo-800/50 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> +1 отправлено в аутрич
            </button>
          </div>
        </div>

      </div>

      {/* 3. Main Dashboard Grid: Today's Tasks & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Today's Tasks with Quick-Add input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Задачи на сегодня</span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {todayTasks.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Завершайте намеченное для поддержания серии</p>
              </div>

              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Все задачи <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Add Input (Press Enter to add) */}
            <form onSubmit={handleQuickAdd} className="relative flex items-center">
              <Plus className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Добавить задачу на сегодня (Enter)..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="w-full pl-9 pr-24 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 rounded-2xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <button
                type="submit"
                disabled={!quickTaskTitle.trim()}
                className="absolute right-2 px-3 py-1 bg-indigo-600 disabled:opacity-40 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition-all"
              >
                Добавить
              </button>
            </form>

            {/* Today's Tasks List */}
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Все задачи на сегодня выполнены или список пуст!
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Введите задачу в поле выше или откройте модальное окно.
                </p>
                <button
                  onClick={onOpenTaskModal}
                  className="mt-3 px-3.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Создать подробную задачу
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => {
                  const isDone = task.status === 'done';
                  const priorityColors = {
                    high: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
                    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                    low: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
                  };

                  return (
                    <div
                      key={task.id}
                      className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-slate-50/60 dark:bg-slate-800/20 border-slate-200/50 dark:border-slate-800/40 opacity-70'
                          : 'bg-white dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-transform active:scale-90"
                          title={isDone ? 'Отметить как невыполненную' : 'Отметить выполненной'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-indigo-500" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium truncate ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                                priorityColors[task.priority]
                              }`}
                            >
                              {task.priority === 'high'
                                ? 'Высокий'
                                : task.priority === 'medium'
                                ? 'Средний'
                                : 'Низкий'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {task.category}
                            </span>
                            {task.subtasks.length > 0 && (
                              <span className="text-[10px] text-indigo-500 dark:text-indigo-400">
                                ✓ {task.subtasks.filter((s) => s.completed).length}/
                                {task.subtasks.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Right Column (5 cols): Top 3 Active Goals */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <span>Топ-3 активные цели</span>
                </h2>
                <p className="text-xs text-slate-400">Ключевые векторы студии и развития</p>
              </div>

              <button
                onClick={() => onNavigate('goals')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Все цели <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {topGoals.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">Нет активных целей</p>
                <button
                  onClick={() => onNavigate('goals')}
                  className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Поставить первую цель
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {topGoals.map((goal) => {
                  const percent = Math.min(
                    100,
                    Math.round((goal.currentValue / (goal.targetValue || 1)) * 100)
                  );

                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {goal.title}
                        </h3>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {percent}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                        <span>до {goal.deadline}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Evening Review Callout Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Вечерний обзор дня
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Зафиксируйте успехи, ошибки и составьте план на завтра
              </p>
            </div>
            <button
              onClick={() => onNavigate('habits')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
            >
              Заполнить
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
