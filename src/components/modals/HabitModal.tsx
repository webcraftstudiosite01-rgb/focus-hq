import React, { useState, useEffect } from 'react';
import { Habit } from '../../types';
import { useApp } from '../../store/AppContext';
import { X, Sparkles } from 'lucide-react';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: Habit | null;
}

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, habitToEdit }) => {
  const { addHabit, updateHabit } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Фокус');
  const [color, setColor] = useState('#6366f1');

  const colorPresets = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ef4444', // Red
  ];

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setCategory(habitToEdit.category);
      setColor(habitToEdit.color);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Фокус');
      setColor('#6366f1');
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (habitToEdit) {
      updateHabit(habitToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
        color,
      });
    } else {
      addHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim(),
        color,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {habitToEdit ? 'Редактировать привычку' : 'Новая привычка'}
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
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Название привычки <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Например: 4 Помодоро глубокого фокуса"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Описание / Критерий выполнения
            </label>
            <input
              type="text"
              placeholder="Минимум 100 минут чистой работы без соцсетей"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Категория
            </label>
            <input
              type="text"
              placeholder="Бизнес, Фокус, Здоровье, Осознанность"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Цвет отметки
            </label>
            <div className="flex items-center gap-3">
              {colorPresets.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

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
              {habitToEdit ? 'Сохранить изменения' : 'Создать привычку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
