import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { getTodayString } from '../utils/dateUtils';
import {
  CheckCircle2, Circle, Plus, Filter, ArrowUpDown, LayoutList, Kanban,
  Calendar, Flag, Tag, Repeat, Edit, Trash2, Check, Clock, ChevronDown, ChevronUp
} from 'lucide-react';

interface TasksPageProps {
  onOpenTaskModal: (task?: Task) => void;
  searchQuery: string;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onOpenTaskModal, searchQuery }) => {
  const { tasks, toggleTaskStatus, updateTask, deleteTask, toggleSubtask, goals } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const today = getTodayString();

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter & Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesTag = t.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      // Priority
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      // Category
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Date
      if (dateFilter === 'today' && t.dueDate !== today) return false;
      if (dateFilter === 'upcoming' && t.dueDate <= today) return false;
      if (dateFilter === 'overdue' && (t.dueDate >= today || t.status === 'done')) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortBy === 'priority') {
        const order: Record<TaskPriority, number> = { high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }
      return a.title.localeCompare(b.title);
    });
  }, [tasks, searchQuery, priorityFilter, categoryFilter, dateFilter, sortBy, today]);

  // Kanban Column Buckets
  const kanbanColumns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'К выполнению', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'in_progress', label: 'В процессе', color: 'border-indigo-500' },
    { id: 'done', label: 'Выполнено', color: 'border-emerald-500' },
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTask(taskId, {
        status: targetStatus,
        completedAt: targetStatus === 'done' ? new Date().toISOString() : undefined,
      });
    }
  };

  const priorityBadges = {
    high: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    low: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
  };

  const priorityLabels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Bar: Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Задачи
          </h1>
          <p className="text-xs text-slate-400">
            Управление текущими делами, проектами и рутиной
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* List / Kanban Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/40 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Список</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Канбан</span>
            </button>
          </div>

          {/* New Task Button */}
          <button
            onClick={() => onOpenTaskModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить задачу</span>
          </button>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Все приоритеты</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Все категории</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Любой срок</option>
            <option value="today">На сегодня</option>
            <option value="upcoming">Предстоящие</option>
            <option value="overdue">Просроченные</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-400">Сортировка:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="date">По дате</option>
            <option value="priority">По приоритету</option>
            <option value="title">По названию</option>
          </select>
        </div>
      </div>

      {/* VIEW: LIST MODE */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Check className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Задачи по заданным фильтрам не найдены
              </p>
              <button
                onClick={() => {
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                  setDateFilter('all');
                }}
                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === 'done';
              const isExpanded = !!expandedTaskIds[task.id];
              const linkedGoal = goals.find((g) => g.id === task.goalId);

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/50 opacity-70'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Toggle Button & Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-transform active:scale-90"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-indigo-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-sm font-semibold ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </h3>

                          {/* Priority Badge */}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              priorityBadges[task.priority]
                            }`}
                          >
                            {priorityLabels[task.priority]}
                          </span>

                          {/* Recurring badge */}
                          {task.recurring && task.recurring !== 'none' && (
                            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              <Repeat className="w-3 h-3" />
                              {task.recurring === 'daily' ? 'Каждый день' : 'Каждую неделю'}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Meta tags */}
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {task.dueDate} {task.dueDate === today && '(Сегодня)'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            {task.category}
                          </span>
                          {linkedGoal && (
                            <span className="text-indigo-500 dark:text-indigo-400 font-medium">
                              🎯 {linkedGoal.title}
                            </span>
                          )}
                          {task.subtasks.length > 0 && (
                            <button
                              onClick={() => toggleExpand(task.id)}
                              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                            >
                              Подзадачи ({task.subtasks.filter((s) => s.completed).length}/
                              {task.subtasks.length})
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>

                        {/* Expanded Subtasks */}
                        {isExpanded && task.subtasks.length > 0 && (
                          <div className="mt-3 pl-3 border-l-2 border-indigo-500/30 space-y-1.5">
                            {task.subtasks.map((st) => (
                              <label
                                key={st.id}
                                className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={st.completed}
                                  onChange={() => toggleSubtask(task.id, st.id)}
                                  className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                />
                                <span className={st.completed ? 'line-through text-slate-400' : ''}>
                                  {st.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenTaskModal(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Удалить задачу «${task.title}»?`)) {
                            deleteTask(task.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col min-h-[420px] rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border ${col.color} p-4 transition-all`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {col.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Task Cards in Column */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[650px] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="h-28 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                      Перетащите задачу сюда
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                              priorityBadges[task.priority]
                            }`}
                          >
                            {priorityLabels[task.priority]}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => onOpenTaskModal(task)}
                              className="text-slate-400 hover:text-indigo-500 p-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                          <span>{task.category}</span>
                          <span>{task.dueDate}</span>
                        </div>

                        {/* Quick move buttons for mobile / easy click */}
                        <div className="flex items-center justify-between pt-1 gap-1">
                          {col.id !== 'todo' && (
                            <button
                              type="button"
                              onClick={() => updateTask(task.id, { status: 'todo' })}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                            >
                              ← В план
                            </button>
                          )}
                          {col.id !== 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => updateTask(task.id, { status: 'in_progress' })}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300"
                            >
                              В процесс
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button
                              type="button"
                              onClick={() => {
                                updateTask(task.id, {
                                  status: 'done',
                                  completedAt: new Date().toISOString(),
                                });
                              }}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300"
                            >
                              Готово ✓
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
