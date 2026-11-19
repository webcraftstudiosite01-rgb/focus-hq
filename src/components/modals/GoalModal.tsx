import React, { useState, useEffect } from 'react';
import { Goal, GoalStatus, Milestone } from '../../types';
import { useApp } from '../../store/AppContext';
import { getTodayString } from '../../utils/dateUtils';
import { X, Plus, Trash2, Calendar, Target, Award, ListChecks } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const { addGoal, updateGoal } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(getTodayString());
  const [targetValue, setTargetValue] = useState<number>(10);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('$');
  const [autoCalculateFromTasks, setAutoCalculateFromTasks] = useState(false);
  const [status, setStatus] = useState<GoalStatus>('active');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setDeadline(goalToEdit.deadline);
      setTargetValue(goalToEdit.targetValue);
      setCurrentValue(goalToEdit.currentValue);
      setUnit(goalToEdit.unit || '$');
      setAutoCalculateFromTasks(goalToEdit.autoCalculateFromTasks);
      setStatus(goalToEdit.status);
      setMilestones(goalToEdit.milestones || []);
    } else {
      setTitle('');
      setDescription('');
      setDeadline(getTodayString());
      setTargetValue(10);
      setCurrentValue(0);
      setUnit('$');
      setAutoCalculateFromTasks(false);
      setStatus('active');
      setMilestones([]);
    }
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: 'ms-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
        title: newMilestoneTitle.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneTitle('');
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)));
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (goalToEdit) {
      updateGoal(goalToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        deadline,
        targetValue: Number(targetValue) || 1,
        currentValue: Number(currentValue) || 0,
        unit: unit.trim() || '$',
        autoCalculateFromTasks,
        status,
        milestones,
      });
    } else {
      addGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        deadline,
        targetValue: Number(targetValue) || 1,
        currentValue: Number(currentValue) || 0,
        unit: unit.trim() || '$',
        autoCalculateFromTasks,
        status,
        milestones,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {goalToEdit ? 'Редактировать цель' : 'Новая цель'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Название цели <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Например: Выйти на доход $2500 в месяц со студии"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Описание / Стратегия
            </label>
            <textarea
              rows={2}
              placeholder="Что именно нужно сделать для достижения этой цели..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Target Value, Current Value & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Целевое значение
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Текущее значение
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Единица измерения
              </label>
              <input
                type="text"
                placeholder="$, клиентов, %"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Deadline & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Дедлайн
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                <Award className="w-3.5 h-3.5" /> Статус
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Активна</option>
                <option value="completed">Завершена</option>
                <option value="paused">На паузе</option>
              </select>
            </div>
          </div>

          {/* Auto Calculate Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <input
              type="checkbox"
              id="autoCalc"
              checked={autoCalculateFromTasks}
              onChange={(e) => setAutoCalculateFromTasks(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="autoCalc" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <span className="font-semibold block text-slate-900 dark:text-white">Считать прогресс автоматически</span>
              Прогресс будет рассчитываться на основе выполненных привязанных задач (в %)
            </label>
          </div>

          {/* Milestones */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              <ListChecks className="w-3.5 h-3.5" /> Ключевые этапы / Майлстоуны ({milestones.filter((m) => m.completed).length}/{milestones.length})
            </label>

            <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto pr-1">
              {milestones.map((ms) => (
                <div
                  key={ms.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={ms.completed}
                      onChange={() => handleToggleMilestone(ms.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className={`text-xs ${ms.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {ms.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(ms.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Добавить контрольную точку..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMilestone();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all"
            >
              {goalToEdit ? 'Сохранить изменения' : 'Создать цель'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
