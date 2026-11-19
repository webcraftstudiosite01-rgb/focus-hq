import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { requestNotificationPermission } from '../../utils/notifications';
import { playSoftChime } from '../../utils/sound';
import {
  X, Sliders, DollarSign, Send, Clock, Bell, Volume2, RotateCcw, Trash2, CheckCircle2
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToDemoData, clearAllData } = useApp();

  const [incomeTarget, setIncomeTarget] = useState(settings.monthlyIncomeTarget);
  const [outreachTarget, setOutreachTarget] = useState(settings.dailyOutreachTarget);
  const [pomoWork, setPomoWork] = useState(settings.pomodoroWorkDuration);
  const [pomoShort, setPomoShort] = useState(settings.pomodoroShortBreak);
  const [pomoLong, setPomoLong] = useState(settings.pomodoroLongBreak);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [notifEnabled, setNotifEnabled] = useState(settings.notificationsEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      monthlyIncomeTarget: Number(incomeTarget) || 1000,
      dailyOutreachTarget: Number(outreachTarget) || 15,
      pomodoroWorkDuration: Number(pomoWork) || 25,
      pomodoroShortBreak: Number(pomoShort) || 5,
      pomodoroLongBreak: Number(pomoLong) || 15,
      soundEnabled,
      notificationsEnabled: notifEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleToggleNotifications = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      setNotifEnabled(granted);
    } else {
      setNotifEnabled(false);
    }
  };

  const handleTestSound = () => {
    playSoftChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Настройки приложения
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Настройки успешно сохранены!
            </div>
          )}

          {/* Targets Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Финансовые и продуктивные цели
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> План дохода на месяц ($)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={incomeTarget}
                  onChange={(e) => setIncomeTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  <Send className="w-3.5 h-3.5 text-indigo-500" /> План аутрича (сообщений в день)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={outreachTarget}
                  onChange={(e) => setOutreachTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Pomodoro Settings */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" /> Таймер Помодоро (минуты)
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Фокус
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={pomoWork}
                  onChange={(e) => setPomoWork(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Короткий отдых
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={pomoShort}
                  onChange={(e) => setPomoShort(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Длинный отдых
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={pomoLong}
                  onChange={(e) => setPomoLong(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Sound & Notifications */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Звуки и уведомления
            </h3>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Звуковой сигнал по окончании сессии
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-0.5"
                >
                  Тест
                </button>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Браузерные уведомления
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifEnabled}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Demo Data & Danger Zone */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Управление данными
            </h3>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Сбросить текущие данные и загрузить демонстрационные данные студии?')) {
                    resetToDemoData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-500" /> Сбросить до демо-данных
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('ВНИМАНИЕ! Вы уверены, что хотите полностью очистить все сохраненные данные? Это действие необратимо.')) {
                    clearAllData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Очистить все данные
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
              Сохранить настройки
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
