import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Video,
  BellRing,
  FolderGit2,
  Send,
  Users,
  Calendar,
  Settings,
  Clock,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  Briefcase,
  FileCheck,
  Building2,
  ScrollText,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { usePortalStore } from '../services/store';

export type TabId = 
  | 'dashboard'
  | 'my-day'
  | 'staff'
  | 'users'
  | 'notices'
  | 'tasks-my-work'
  | 'tasks-department'
  | 'tasks-all'
  | 'meetings'
  | 'calendar'
  | 'decisions'
  | 'projects'
  | 'approvals'
  | 'documents'
  | 'departments'
  | 'roles-permissions'
  | 'audit-log'
  | 'teams-notifications'
  | 'messages'
  | 'settings';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenQuickAction: () => void;
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickAction,
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { tasks, notices, meetings, sharePointDocs, currentUser, approvals, decisions } = usePortalStore();

  const myTasksCount = tasks.filter(t => t.assignedToId === currentUser.id && t.status !== 'Done').length;
  const deptTasksCount = tasks.filter(t => t.department === currentUser.department && t.status !== 'Done').length;
  const urgentNoticesCount = notices.filter(n => n.priority === 'Urgent').length;
  const scheduledMeetingsCount = meetings.filter(m => m.status === 'Scheduled').length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;

  const navigationGroup = [
    { id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-day' as TabId, label: 'My Day', icon: Clock },
    { id: 'staff' as TabId, label: 'Staff Directory', icon: UserCheck },
    {
      id: 'notices' as TabId,
      label: 'Notices',
      icon: BellRing,
      badge: urgentNoticesCount > 0 ? urgentNoticesCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'teams-notifications' as TabId,
      label: 'Notifications',
      icon: Send,
    },
    { id: 'messages' as TabId, label: 'Messages', icon: MessageSquare },
  ];

  const tasksGroup = [
    {
      id: 'tasks-my-work' as TabId,
      label: 'My Work',
      icon: CheckSquare,
      badge: myTasksCount > 0 ? myTasksCount : undefined,
      badgeColor: 'bg-[#00ad1d]/15 text-[#008f18] font-bold'
    },
    {
      id: 'tasks-department' as TabId,
      label: 'Department Tasks',
      icon: Briefcase,
      badge: deptTasksCount > 0 ? deptTasksCount : undefined,
      badgeColor: 'bg-slate-200 text-slate-700'
    },
    {
      id: 'tasks-all' as TabId,
      label: 'All Tasks',
      icon: CheckCircle,
    },
  ];

  const meetingsGroup = [
    {
      id: 'meetings' as TabId,
      label: 'Meetings',
      icon: Video,
      badge: scheduledMeetingsCount > 0 ? scheduledMeetingsCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    { id: 'calendar' as TabId, label: 'Office Calendar', icon: Calendar },
    { id: 'decisions' as TabId, label: 'Decisions', icon: FileCheck },
  ];

  const projectsGroup = [
    { id: 'projects' as TabId, label: 'Projects', icon: FolderGit2 },
    {
      id: 'approvals' as TabId,
      label: 'Approvals',
      icon: ShieldCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold'
    },
  ];

  const documentsGroup = [
    {
      id: 'documents' as TabId,
      label: 'Documents',
      icon: FileText,
      badge: sharePointDocs.length,
      badgeColor: 'bg-slate-200 text-slate-700'
    },
  ];

  const administrationGroup = [
    { id: 'departments' as TabId, label: 'Departments', icon: Building2 },
    { id: 'users' as TabId, label: 'User Management', icon: Users },
    { id: 'roles-permissions' as TabId, label: 'Roles & Permissions', icon: ShieldCheck },
    { id: 'audit-log' as TabId, label: 'Audit Log', icon: ScrollText },
  ];

  const renderNavGroup = (items: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; badgeColor?: string }[]) => (
    <div className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onSelectTab(item.id);
              onCloseMobile?.();
            }}
            className={`w-full sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 min-w-0 truncate text-left">{item.label}</span>
            {item.badge !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${item.badgeColor}`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-60 bg-[#edf3ee] border-r border-[#cbd5e1] text-[#19232d] flex flex-col shrink-0 select-none
          transition-transform duration-150 ease-in-out lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <p className="section-label">Navigation</p>
          {renderNavGroup(navigationGroup)}

          <div className="border-t border-[#cbd5e1]/60 my-2"></div>

          <p className="section-label">Tasks</p>
          {renderNavGroup(tasksGroup)}

          <div className="border-t border-[#cbd5e1]/60 my-2"></div>

          <p className="section-label">Meetings</p>
          {renderNavGroup(meetingsGroup)}

          <div className="border-t border-[#cbd5e1]/60 my-2"></div>

          <p className="section-label">Projects</p>
          {renderNavGroup(projectsGroup)}

          <div className="border-t border-[#cbd5e1]/60 my-2"></div>

          <p className="section-label">Documents</p>
          {renderNavGroup(documentsGroup)}

          <div className="border-t border-[#cbd5e1]/60 my-2"></div>

          <p className="section-label">Administration</p>
          {renderNavGroup(administrationGroup)}

          <div className="space-y-0.5 mt-1">
            <button
              onClick={() => {
                onOpenSettings();
                onCloseMobile?.();
              }}
              className="w-full sidebar-nav-item"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="flex-1 min-w-0 truncate text-left">System Settings</span>
            </button>
          </div>
        </nav>

        {/* Authentic Footer */}
        <div className="px-4 py-3 border-t border-[#cbd5e1] bg-[#edf3ee] shrink-0">
          <p className="text-[10px] text-slate-500 font-medium">Internal Operations Platform</p>
        </div>
      </aside>
    </>
  );
};

