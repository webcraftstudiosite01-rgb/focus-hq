import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Habit, DailyReview } from '../types';
import { getCurrentWeekDays, getTodayString, formatDateToRussian } from '../utils/dateUtils';
import {
  CalendarCheck, Plus, Check, Sparkles, BookOpen, Star, Trash2, Edit,
  ChevronDown, ChevronUp, Save, Clock, ArrowRight
} from 'lucide-react';

interface HabitsPageProps {
  onOpenHabitModal: (habit?: Habit) => void;
}

export const HabitsPage: React.FC<HabitsPageProps> = ({ onOpenHabitModal }) => {
  const {
    habits,
    toggleHabitDate,
    deleteHabit,
    reviews,
    saveReview,
    deleteReview,
  } = useApp();

  const today = getTodayString();
  const weekDays = getCurrentWeekDays();

  // Find existing review for today or empty
  const todayReview = reviews.find((r) => r.date === today);

  const [whatDone, setWhatDone] = useState(todayReview?.whatDone || '');
  const [whatWentWrong, setWhatWentWrong] = useState(todayReview?.whatWentWrong || '');
  const [tomorrowPlan, setTomorrowPlan] = useState(todayReview?.tomorrowPlan || '');
  const [rating, setRating] = useState<number>(todayReview?.rating || 5);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatDone.trim() && !whatWentWrong.trim() && !tomorrowPlan.trim()) return;

    saveReview({
      date: today,
      whatDone: whatDone.trim(),
      whatWentWrong: whatWentWrong.trim(),
      tomorrowPlan: tomorrowPlan.trim(),
      rating,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Привычки & Вечерний обзор
          </h1>
          <p className="text-xs text-slate-400">
            Дисциплина ключевых действий и ежедневная рефлексия
          </p>
        </div>

        <button
          onClick={() => onOpenHabitModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Новая привычка</span>
        </button>
      </div>

      {/* 2. Habits Tracker: Weekly Grid Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Недельный трекер привычек
              </h2>
              <p className="text-xs text-slate-400">
                Отмечайте выполненные ритуалы каждый день текущей недели
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs">
                <th className="py-3 px-3 font-semibold text-slate-400 uppercase tracking-wider">Привычка</th>
                {weekDays.map((wd) => (
                  <th
                    key={wd.date}
                    className={`py-3 px-2 text-center font-bold ${
                      wd.isToday
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-t-xl'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] uppercase">{wd.dayName}</div>
                    <div className="text-sm">{wd.dayNumber}</div>
                  </th>
                ))}
                <th className="py-3 px-3 text-center text-slate-400 uppercase tracking-wider text-[11px]">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-slate-400">
                    Нет активных привычек. Создайте привычку, нажав кнопку выше.
                  </td>
                </tr>
              ) : (
                habits.map((habit) => {
                  const completedDaysInWeek = weekDays.filter((wd) => !!habit.history[wd.date]).length;

                  return (
                    <tr key={habit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      {/* Title & Info */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: habit.color || '#6366f1' }}
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {habit.title}
                            </div>
                            {habit.description && (
                              <div className="text-[10px] text-slate-400 line-clamp-1">
                                {habit.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 7 Days Grid Cells */}
                      {weekDays.map((wd) => {
                        const isDone = !!habit.history[wd.date];
                        return (
                          <td
                            key={wd.date}
                            className={`py-3 px-2 text-center ${
                              wd.isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                            }`}
                          >
                            <button
                              onClick={() => toggleHabitDate(habit.id, wd.date)}
                              className={`w-7 h-7 mx-auto rounded-xl flex items-center justify-center transition-all ${
                                isDone
                                  ? 'text-white shadow-xs scale-105'
                                  : 'border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-transparent'
                              }`}
                              style={{
                                backgroundColor: isDone ? habit.color || '#6366f1' : 'transparent',
                              }}
                              title={`${habit.title} (${wd.date}): ${isDone ? 'Выполнено' : 'Не выполнено'}`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </td>
                        );
                      })}

                      {/* Action buttons */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenHabitModal(habit)}
                            className="p-1 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Редактировать"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Удалить привычку «${habit.title}»?`)) {
                                deleteHabit(habit.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Evening Review Form & Review History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (7 cols): Evening Review Form */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Вечерний обзор ({formatDateToRussian(new Date())})
                </h2>
                <p className="text-xs text-slate-400">
                  Подведение итогов дня и подготовка к завтрашнему рывку
                </p>
              </div>
            </div>

            {/* Day Rating Stars */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  title={`Оценка дня: ${star}/5`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveReview} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                1. Что получилось сделать за день? 🚀
              </label>
              <textarea
                rows={3}
                placeholder="Главные победы, отправленные КП, закрытые задачи, выручка..."
                value={whatDone}
                onChange={(e) => setWhatDone(e.target.value)}
                className="w-full p-3 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                2. Что пошло не так / какие были трудности? ⚠️
              </label>
              <textarea
                rows={2}
                placeholder="Прокрастинация, непредвиденные баги, сорванные сроки, отвлечения..."
                value={whatWentWrong}
                onChange={(e) => setWhatWentWrong(e.target.value)}
                className="w-full p-3 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                3. План на завтра (Топ-3 задачи) 🎯
              </label>
              <textarea
                rows={3}
                placeholder="1. Дожать 15 аутрич-сообщений&#10;2. Сдать макет главной клиенту&#10;3. Созвон по новому проекту..."
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                className="w-full p-3 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSaved ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Обзор сохранен!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Сохраняется в локальную историю
                </span>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Сохранить обзор дня
              </button>
            </div>
          </form>
        </div>

        {/* Right (5 cols): Review History */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              История обзоров
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Всего: {reviews.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                Пока нет сохраненных вечерних обзоров
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-700 pb-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rev.date} {rev.date === today && '(Сегодня)'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {rev.rating && (
                        <div className="flex items-center text-amber-400 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" /> {rev.rating}/5
                        </div>
                      )}
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="text-slate-400 hover:text-rose-500 p-0.5"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {rev.whatDone && (
                    <div>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                        Сделано:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {rev.whatDone}
                      </p>
                    </div>
                  )}

                  {rev.whatWentWrong && (
                    <div>
                      <span className="font-semibold text-rose-500 block mb-0.5">
                        Трудности:
                      </span>
                      <p className="text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                        {rev.whatWentWrong}
                      </p>
                    </div>
                  )}

                  {rev.tomorrowPlan && (
                    <div>
                      <span className="font-semibold text-indigo-500 block mb-0.5">
                        План на завтра:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {rev.tomorrowPlan}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
