import React from 'react';
import { useApp } from '../../store/AppContext';
import {
  Flame, Sun, Moon, Plus, Download, Sliders, Search, Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenTaskModal: () => void;
  onOpenBackupModal: () => void;
  onOpenSettingsModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTaskModal,
  onOpenBackupModal,
  onOpenSettingsModal,
  searchQuery,
  onSearchChange,
  searchInputRef,
}) => {
  const { currentStreak, settings, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        
        {/* Left: Search input */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Поиск по задачам, лидам, целям... (нажмите /)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-10 py-1.5 text-sm bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
            <kbd className="hidden sm:inline-flex items-center justify-center absolute right-2.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-200 dark:bg-slate-700/60 rounded border border-slate-300 dark:border-slate-600">
              /
            </kbd>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Streak Badge */}
          <div
            title={`Текущая серия продуктивности: ${currentStreak} дн.`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              currentStreak > 0
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{currentStreak} дн.</span>
          </div>

          {/* Quick Add Task Button */}
          <button
            onClick={onOpenTaskModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-medium rounded-xl shadow-md shadow-indigo-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            title="Создать новую задачу (N)"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Новая задача</span>
            <kbd className="hidden lg:inline-flex px-1 py-0.2 text-[10px] bg-indigo-700 rounded text-indigo-100">
              N
            </kbd>
          </button>

          {/* Backup JSON Button */}
          <button
            onClick={onOpenBackupModal}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Экспорт / Импорт резервной копии JSON"
            aria-label="Резервное копирование JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title={settings.theme === 'dark' ? 'Включить светлую тему' : 'Включить темную тему'}
            aria-label="Переключить тему оформления"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Настройки Focus HQ"
            aria-label="Настройки"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
