import React from 'react';
import {
  LayoutDashboard, CheckSquare, Target, Briefcase,
  CalendarCheck, Timer, BarChart3, ChevronRight, Zap
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

export type NavTab = 'dashboard' | 'tasks' | 'goals' | 'crm' | 'habits' | 'pomodoro' | 'stats';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { todayTasks, leads } = useApp();

  const pendingTasksCount = todayTasks.filter((t) => t.status !== 'done').length;
  const activeLeadsCount = leads.filter((l) => l.status === 'negotiating' || l.status === 'replied').length;

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; color?: string }[] = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'tasks', label: 'Задачи', icon: CheckSquare, badge: pendingTasksCount > 0 ? pendingTasksCount : undefined },
    { id: 'goals', label: 'Цели', icon: Target },
    { id: 'crm', label: 'CRM WebCraft', icon: Briefcase, badge: activeLeadsCount > 0 ? activeLeadsCount : undefined },
    { id: 'habits', label: 'Привычки & Обзор', icon: CalendarCheck },
    { id: 'pomodoro', label: 'Помодоро', icon: Timer },
    { id: 'stats', label: 'Аналитика', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 min-h-screen p-4 transition-colors">
      
      {/* Brand logo & Studio Name */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white">Focus HQ</h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">v2.0</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">WebCraft Studio OS</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info Widget */}
      <div className="mt-auto p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Фокус дня</span>
          <span>100% offline</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
          Все данные сохраняются локально. Не забывайте делать экспорт JSON.
        </p>
      </div>

    </aside>
  );
};
