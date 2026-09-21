import React, { useState } from 'react';
import { usePortalStore } from './services/store';
import { Header } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { SharePointView } from './components/SharePointView';
import { MeetingsTeamsView } from './components/MeetingsTeamsView';
import { NoticesView } from './components/NoticesView';
import { ProjectsView } from './components/ProjectsView';
import { StaffDirectoryView } from './components/StaffDirectoryView';
import { TeamsNotificationsView } from './components/TeamsNotificationsView';
import { DecisionsView } from './components/DecisionsView';
import { ApprovalsView } from './components/ApprovalsView';
import { DepartmentsView } from './components/DepartmentsView';
import { RolesPermissionsView } from './components/RolesPermissionsView';
import { AuditLogView } from './components/AuditLogView';
import { UsersView } from './components/UsersView';
import { MessagesView } from './components/MessagesView';
import { QuickActionModal } from './components/QuickActionModal';
import { SettingsModal } from './components/SettingsModal';
import { StaffUser } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [quickActionInitialTab, setQuickActionInitialTab] = useState<'task' | 'meeting' | 'notice' | 'sharepoint'>('task');
  const [selectedStaffAssignee, setSelectedStaffAssignee] = useState<StaffUser | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'password' | 'profile' | 'integrations' | 'admin'>('password');

  const handleOpenQuickAction = (tab: 'task' | 'meeting' | 'notice' | 'sharepoint' = 'task') => {
    setQuickActionInitialTab(tab);
    setSelectedStaffAssignee(null);
    setIsQuickActionOpen(true);
  };

  const handleAssignTaskToUser = (user: StaffUser) => {
    setSelectedStaffAssignee(user);
    setQuickActionInitialTab('task');
    setIsQuickActionOpen(true);
  };

  const handleOpenSettingsWithTab = (tab: 'password' | 'profile' | 'integrations' | 'admin') => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#19232d] flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenQuickAction={() => handleOpenQuickAction('task')}
        onOpenSettings={() => handleOpenSettingsWithTab('integrations')}
        onOpenSettingsTab={handleOpenSettingsWithTab}
        onToggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearchSelect={(tab: string) => setActiveTab(tab as TabId)}
      />

      {/* Main Body with Sidebar and Content */}
      <div className="flex-1 flex">
        {/* Authentic Sidebar */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={(tab: TabId) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenQuickAction={() => handleOpenQuickAction('task')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Content View */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
          {/* Active View Router */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectTab={(tab: TabId) => setActiveTab(tab)}
              onOpenQuickAction={() => handleOpenQuickAction('task')}
              onOpenTeamsMeetingModal={() => handleOpenQuickAction('meeting')}
            />
          )}

          {activeTab === 'my-day' && (
            <DashboardView
              onSelectTab={(tab: TabId) => setActiveTab(tab)}
              onOpenQuickAction={() => handleOpenQuickAction('task')}
              onOpenTeamsMeetingModal={() => handleOpenQuickAction('meeting')}
            />
          )}

          {activeTab === 'tasks-my-work' && (
            <TasksView
              defaultCategory="my-work"
              onOpenNewTaskModal={() => handleOpenQuickAction('task')}
            />
          )}

          {activeTab === 'tasks-department' && (
            <TasksView
              defaultCategory="department"
              onOpenNewTaskModal={() => handleOpenQuickAction('task')}
            />
          )}

          {activeTab === 'tasks-all' && (
            <TasksView
              defaultCategory="all"
              onOpenNewTaskModal={() => handleOpenQuickAction('task')}
            />
          )}

          {activeTab === 'meetings' && (
            <MeetingsTeamsView
              initialMode="list"
              onOpenScheduleModal={() => handleOpenQuickAction('meeting')}
            />
          )}

          {activeTab === 'calendar' && (
            <MeetingsTeamsView
              initialMode="calendar"
              onOpenScheduleModal={() => handleOpenQuickAction('meeting')}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView onOpenNewProjectModal={() => handleOpenQuickAction('task')} />
          )}

          {activeTab === 'approvals' && (
            <ApprovalsView />
          )}

          {activeTab === 'decisions' && (
            <DecisionsView />
          )}

          {activeTab === 'documents' && (
            <SharePointView onOpenUploadModal={() => handleOpenQuickAction('sharepoint')} />
          )}

          {activeTab === 'notices' && (
            <NoticesView onOpenNewNoticeModal={() => handleOpenQuickAction('notice')} />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView onSelectDepartmentTasks={() => setActiveTab('tasks-department')} />
          )}

          {activeTab === 'users' && (
            <UsersView onAssignTaskToUser={handleAssignTaskToUser} />
          )}

          {activeTab === 'staff' && (
            <StaffDirectoryView onAssignTaskToUser={handleAssignTaskToUser} />
          )}

          {activeTab === 'roles-permissions' && (
            <RolesPermissionsView />
          )}

          {activeTab === 'audit-log' && (
            <AuditLogView />
          )}

          {activeTab === 'teams-notifications' && (
            <TeamsNotificationsView />
          )}

          {activeTab === 'messages' && (
            <MessagesView />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        initialTab={quickActionInitialTab}
        defaultAssignee={selectedStaffAssignee}
        onClose={() => setIsQuickActionOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        initialTab={settingsInitialTab}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
