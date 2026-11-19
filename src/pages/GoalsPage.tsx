import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Goal, GoalStatus } from '../types';
import {
  Target, Plus, Calendar, Award, CheckCircle2, Circle, Edit, Trash2,
  TrendingUp, ListChecks, Play, Pause, ChevronRight, Check
} from 'lucide-react';

interface GoalsPageProps {
  onOpenGoalModal: (goal?: Goal) => void;
  onOpenTaskModal: () => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ onOpenGoalModal }) => {
  const { goals, updateGoal, deleteGoal, toggleMilestone, tasks } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredGoals = goals.filter((g) => {
    if (filterStatus !== 'all' && g.status !== filterStatus) return false;
    return true;
  });

  const statusLabels: Record<GoalStatus, { text: string; badge: string }> = {
    active: { text: 'Активна', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    completed: { text: 'Достигнута 🎉', badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
    paused: { text: 'На паузе', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Стратегические цели
          </h1>
          <p className="text-xs text-slate-400">
            Измеримые ориентиры роста студии и личного прогресса
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Все статусы</option>
            <option value="active">Только активные</option>
            <option value="completed">Достигнутые</option>
            <option value="paused">На паузе</option>
          </select>

          <button
            onClick={() => onOpenGoalModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Новая цель</span>
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="py-16 text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Нет целей в выбранной категории
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Определите измеримую цель для бизнеса или саморазвития с дедлайном и контрольными точками.
          </p>
          <button
            onClick={() => onOpenGoalModal()}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Создать первую цель
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => {
            // Linked tasks
            const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
            const linkedCompletedTasks = linkedTasks.filter((t) => t.status === 'done');

            // Calculation
            let progressPercent = 0;
            if (goal.autoCalculateFromTasks) {
              progressPercent = linkedTasks.length > 0
                ? Math.round((linkedCompletedTasks.length / linkedTasks.length) * 100)
                : 0;
            } else {
              progressPercent = Math.min(
                100,
                Math.round((goal.currentValue / (goal.targetValue || 1)) * 100)
              );
            }

            const isCompleted = goal.status === 'completed' || progressPercent >= 100;

            return (
              <div
                key={goal.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Goal Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        statusLabels[goal.status]?.badge || ''
                      }`}
                    >
                      {statusLabels[goal.status]?.text || goal.status}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenGoalModal(goal)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Редактировать цель"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Удалить цель «${goal.title}»?`)) {
                            deleteGoal(goal.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Numbers & Bar */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">
                        {goal.autoCalculateFromTasks ? (
                          <span>Считается по задачам ({linkedCompletedTasks.length}/{linkedTasks.length})</span>
                        ) : (
                          <span>
                            {goal.currentValue} из {goal.targetValue} {goal.unit}
                          </span>
                        )}
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {progressPercent}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPercent >= 100
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Manual quick updater if not auto */}
                    {!goal.autoCalculateFromTasks && (
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="text-[11px] text-slate-400">Быстро обновить:</span>
                        <input
                          type="number"
                          value={goal.currentValue}
                          onChange={(e) =>
                            updateGoal(goal.id, { currentValue: Number(e.target.value) || 0 })
                          }
                          className="w-20 px-2 py-0.5 text-xs rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                        <span className="text-slate-400 text-xs">{goal.unit}</span>
                      </div>
                    )}
                  </div>

                  {/* Milestones inside Goal */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        <ListChecks className="w-3.5 h-3.5" />
                        <span>Контрольные точки ({goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length})</span>
                      </div>
                      <div className="space-y-1">
                        {goal.milestones.map((ms) => (
                          <label
                            key={ms.id}
                            className="flex items-center gap-2 text-xs p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/40 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={ms.completed}
                              onChange={() => toggleMilestone(goal.id, ms.id)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            <span
                              className={
                                ms.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-700 dark:text-slate-300'
                              }
                            >
                              {ms.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked Tasks count */}
                  {linkedTasks.length > 0 && (
                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Привязано задач: {linkedTasks.length}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {linkedCompletedTasks.length} выполнено
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer status buttons & deadline */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Дедлайн: {goal.deadline}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {goal.status !== 'completed' && (
                      <button
                        onClick={() => updateGoal(goal.id, { status: 'completed' })}
                        className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-lg font-medium hover:bg-emerald-100"
                      >
                        Завершить ✓
                      </button>
                    )}
                    {goal.status === 'active' && (
                      <button
                        onClick={() => updateGoal(goal.id, { status: 'paused' })}
                        className="px-2 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 rounded-lg font-medium hover:bg-amber-100"
                      >
                        Пауза
                      </button>
                    )}
                    {goal.status === 'paused' && (
                      <button
                        onClick={() => updateGoal(goal.id, { status: 'active' })}
                        className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-lg font-medium hover:bg-indigo-100"
                      >
                        Активировать
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
