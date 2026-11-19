import React, { useState, useEffect, useRef } from 'react';
import { useApp, AppProvider } from './store/AppContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { GoalsPage } from './pages/GoalsPage';
import { CRMPage } from './pages/CRMPage';
import { HabitsPage } from './pages/HabitsPage';
import { PomodoroPage } from './pages/PomodoroPage';
import { StatsPage } from './pages/StatsPage';

import { TaskModal } from './components/modals/TaskModal';
import { GoalModal } from './components/modals/GoalModal';
import { LeadModal } from './components/modals/LeadModal';
import { TemplateModal } from './components/modals/TemplateModal';
import { HabitModal } from './components/modals/HabitModal';
import { BackupModal } from './components/modals/BackupModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { SyncModal } from './components/modals/SyncModal';

import { Task, Goal, Lead, MessageTemplate, Habit } from './types';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<MessageTemplate | null>(null);

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Global Keyboard Shortcuts (N = new task, / = search, Escape = close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      // Escape closes any open modal
      if (e.key === 'Escape') {
        setIsTaskModalOpen(false);
        setIsGoalModalOpen(false);
        setIsLeadModalOpen(false);
        setIsTemplateModalOpen(false);
        setIsHabitModalOpen(false);
        setIsBackupModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsSyncModalOpen(false);
        return;
      }

      // If typing inside an input, do not trigger single-key hotkeys
      if (isInputActive) return;

      // 'N' or 'n' opens New Task modal
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
      }

      // '/' focuses search input
      if (e.key === '/') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openNewTaskModal = (task?: Task) => {
    setTaskToEdit(task || null);
    setIsTaskModalOpen(true);
  };

  const openGoalModal = (goal?: Goal) => {
    setGoalToEdit(goal || null);
    setIsGoalModalOpen(true);
  };

  const openLeadModal = (lead?: Lead) => {
    setLeadToEdit(lead || null);
    setIsLeadModalOpen(true);
  };

  const openTemplateModal = (tpl?: MessageTemplate) => {
    setTemplateToEdit(tpl || null);
    setIsTemplateModalOpen(true);
  };

  const openHabitModal = (habit?: Habit) => {
    setHabitToEdit(habit || null);
    setIsHabitModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenTaskModal={() => openNewTaskModal()}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigate={setActiveTab}
              onOpenTaskModal={() => openNewTaskModal()}
              onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksPage
              onOpenTaskModal={openNewTaskModal}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsPage
              onOpenGoalModal={openGoalModal}
              onOpenTaskModal={() => openNewTaskModal()}
            />
          )}

          {activeTab === 'crm' && (
            <CRMPage
              onOpenLeadModal={openLeadModal}
              onOpenTemplateModal={openTemplateModal}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'habits' && (
            <HabitsPage onOpenHabitModal={openHabitModal} />
          )}

          {activeTab === 'pomodoro' && <PomodoroPage />}

          {activeTab === 'stats' && <StatsPage />}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />

      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        leadToEdit={leadToEdit}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false);
          setTemplateToEdit(null);
        }}
        templateToEdit={templateToEdit}
      />

      <HabitModal
        isOpen={isHabitModalOpen}
        onClose={() => {
          setIsHabitModalOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

    </div>
  );
};


export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
