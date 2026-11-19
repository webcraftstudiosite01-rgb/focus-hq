import React from 'react';
import {
  LayoutDashboard, CheckSquare, Target, Briefcase,
  CalendarCheck, Timer, BarChart3
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
    { id: 'tasks', label: 'Задачи', icon: CheckSquare },
    { id: 'goals', label: 'Цели', icon: Target },
    { id: 'crm', label: 'CRM', icon: Briefcase },
    { id: 'habits', label: 'Привычки', icon: CalendarCheck },
    { id: 'pomodoro', label: 'Таймер', icon: Timer },
    { id: 'stats', label: 'Отчет', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around transition-colors">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
