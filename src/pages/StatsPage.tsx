import React, { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { getPastDaysList, getTodayString } from '../utils/dateUtils';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, AreaChart, Area
} from 'recharts';
import {
  BarChart3, CheckSquare, DollarSign, Clock, Send, TrendingUp, Calendar
} from 'lucide-react';

export const StatsPage: React.FC = () => {
  const {
    tasks,
    leads,
    pomodoroSessions,
    outreachLogs,
    currentStreak,
    monthIncome,
    settings,
  } = useApp();

  const past7Days = useMemo(() => getPastDaysList(7), []);

  // 1. Tasks completed per day in the last 7 days
  const tasksChartData = useMemo(() => {
    return past7Days.map((day) => {
      const count = tasks.filter((t) => {
        if (t.status !== 'done') return false;
        const completionDate = t.completedAt ? t.completedAt.split('T')[0] : t.dueDate;
        return completionDate === day.date;
      }).length;

      return {
        name: day.dayName,
        date: day.shortDate,
        задачи: count,
      };
    });
  }, [tasks, past7Days]);

  // 2. Focused time per day (minutes) in the last 7 days
  const focusChartData = useMemo(() => {
    return past7Days.map((day) => {
      const totalMinutes = pomodoroSessions
        .filter((s) => s.date === day.date && s.type === 'work')
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      return {
        name: day.dayName,
        date: day.shortDate,
        минуты: totalMinutes,
      };
    });
  }, [pomodoroSessions, past7Days]);

  // 3. Outreach messages per day in the last 7 days
  const outreachChartData = useMemo(() => {
    return past7Days.map((day) => {
      const count = outreachLogs[day.date] || 0;
      return {
        name: day.dayName,
        date: day.shortDate,
        сообщения: count,
        цель: settings.dailyOutreachTarget || 15,
      };
    });
  }, [outreachLogs, past7Days, settings.dailyOutreachTarget]);

  // 4. Monthly income breakdown (last 6 months)
  const monthlyIncomeData = useMemo(() => {
    const months = [
      { name: 'Июн', year: 2026, month: '06', amount: 850 },
      { name: 'Июл', year: 2026, month: '07', amount: 920 },
      { name: 'Авг', year: 2026, month: '08', amount: 1100 },
      { name: 'Сен', year: 2026, month: '09', amount: 1350 },
      { name: 'Окт', year: 2026, month: '10', amount: 1600 },
      { name: 'Ноя (тек)', year: 2026, month: '11', amount: monthIncome },
    ];
    return months;
  }, [monthIncome]);

  const totalTasksCompleted = tasks.filter((t) => t.status === 'done').length;
  const totalFocusAllTime = pomodoroSessions
    .filter((s) => s.type === 'work')
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Аналитика продуктивности
        </h1>
        <p className="text-xs text-slate-400">
          Наглядная статистика выполнения задач, фокус-часов, аутрича и дохода студии
        </p>
      </div>

      {/* 2. Top Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Выполнено задач</span>
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalTasksCompleted}
          </div>
          <span className="text-[11px] text-slate-400">За все время</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Всего фокуса</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {(totalFocusAllTime / 60).toFixed(1)} ч
          </div>
          <span className="text-[11px] text-slate-400">{totalFocusAllTime} минут в потоке</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Серия продуктивности</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-2">
            {currentStreak} дн.
          </div>
          <span className="text-[11px] text-slate-400">Дней подряд с задачами</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Доход за месяц</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ${monthIncome.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Цель: ${settings.monthlyIncomeTarget}</span>
        </div>
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Tasks Completed per Week / Day */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                <span>Выполненные задачи за 7 дней</span>
              </h3>
              <p className="text-xs text-slate-400">Динамика закрытия задач по дням недели</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="задачи" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Focused Time per Day */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Время глубокого фокуса (минуты)</span>
              </h3>
              <p className="text-xs text-slate-400">Минуты работы по таймеру Помодоро</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#064e3b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="минуты" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#focusColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Outreach Messages per Day */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-500" />
                <span>Отправленные сообщения в аутрич</span>
              </h3>
              <p className="text-xs text-slate-400">Факт отправок vs ежедневный план (15 сообщений)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={outreachChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="цель" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="сообщения" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Income per Month */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Выручка студии по месяцам ($)</span>
              </h3>
              <p className="text-xs text-slate-400">Рост дохода студии WebCraft</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyIncomeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#064e3b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: unknown) => [`$${val}`, 'Доход']}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
