import React, { useState } from 'react';
import {
  Search,
  Bell,
  CheckCircle2,
  Zap,
  Radio,
  ExternalLink,
  Settings,
  RefreshCw,
  Video,
  Menu,
  FileText,
  CheckSquare,
  Plus,
  KeyRound,
  User
} from 'lucide-react';
import { UserPresenceStatus } from '../types';
import { usePortalStore } from '../services/store';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenSettingsTab?: (tab: 'password' | 'profile' | 'integrations' | 'admin') => void;
  onOpenQuickAction: () => void;
  onSearchSelect?: (tab: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenSettingsTab,
  onOpenQuickAction,
  onSearchSelect,
  onToggleMobileMenu
}) => {
  const { currentUser, actions, notices, tasks, meetings, sharePointDocs } = usePortalStore();
  const [presenceMenuOpen, setPresenceMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const urgentNotices = notices.filter(n => n.priority === 'Urgent');
  const myPendingTasks = tasks.filter(t => t.assignedToId === currentUser.id && t.status !== 'Done');

  const presenceOptions: { label: string; value: UserPresenceStatus; color: string }[] = [
    { label: 'Available (Online)', value: 'Online', color: 'bg-[#00ad1d]' },
    { label: 'In Teams Meeting', value: 'In Teams Meeting', color: 'bg-purple-600' },
    { label: 'Busy', value: 'Busy', color: 'bg-rose-500' },
    { label: 'Away', value: 'Away', color: 'bg-amber-500' },
    { label: 'Offline', value: 'Offline', color: 'bg-slate-400' },
  ];

  const currentPresence = presenceOptions.find(p => p.value === currentUser.status) || presenceOptions[0];

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      actions.logAudit('m365_cloud_resync', 'Microsoft Teams & SharePoint status synced', 'emerald');
    }, 600);
  };

  const filteredTasks = searchQuery.trim() ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const filteredDocs = searchQuery.trim() ? sharePointDocs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const filteredNotices = searchQuery.trim() ? notices.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#cbd5e1] px-4 lg:px-6 h-14 flex items-center justify-between">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center justify-center overflow-hidden rounded-md bg-white shrink-0 h-9 w-9 border border-slate-200">
            <img
              src="/wipahs-logo.jpg"
              alt="WIPAHS OfficeHub"
              className="h-full w-full object-cover object-top"
              onError={(e) => {
                // fallback gracefully
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </span>
          <div className="min-w-0">
            <p className="font-bold leading-tight truncate text-[15px] text-[#19232d] tracking-tight">WIPAHS</p>
            <p className="leading-tight truncate text-[11px] text-slate-500 font-medium">OfficeHub</p>
          </div>
        </div>
      </div>

      {/* Center: Search */}
      <div className="relative flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(e.target.value.length > 0);
            }}
            onFocus={() => setShowSearchDropdown(searchQuery.length > 0)}
            placeholder="Search tasks, documents, staff, notices..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d] focus:border-[#00ad1d] transition"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-md shadow-lg p-2 z-50 max-h-96 overflow-y-auto text-xs">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400 font-medium border-b border-slate-100 mb-1">
              <span>Results for "{searchQuery}"</span>
              <button
                onClick={() => setShowSearchDropdown(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                Close
              </button>
            </div>

            {filteredTasks.length === 0 && filteredDocs.length === 0 && filteredNotices.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No matching records found.</p>
            ) : (
              <div className="space-y-2">
                {filteredTasks.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 px-2">Tasks</span>
                    {filteredTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        onClick={() => {
                          onSearchSelect?.('tasks-my-work');
                          setShowSearchDropdown(false);
                        }}
                        className="px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800 truncate">{task.title}</span>
                        <span className="text-[10px] text-slate-400">{task.priority}</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredDocs.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 px-2">SharePoint Documents</span>
                    {filteredDocs.slice(0, 3).map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onSearchSelect?.('documents');
                          setShowSearchDropdown(false);
                        }}
                        className="px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-400">{doc.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Task / Item Button */}
        <button
          onClick={onOpenQuickAction}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#00ad1d] hover:bg-[#009218] text-white rounded-md text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New</span>
        </button>

        {/* Sync Status Button */}
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          title="Sync with Microsoft Teams & SharePoint"
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#00ad1d]' : ''}`} />
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {(urgentNotices.length > 0 || myPendingTasks.length > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-md shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="font-semibold text-slate-800">Notifications & Alerts</span>
                <span className="text-[10px] text-slate-400">Microsoft 365 Connected</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {urgentNotices.map(notice => (
                  <div key={notice.id} className="p-2 rounded bg-rose-50/80 border border-rose-100">
                    <p className="font-semibold text-rose-900 text-[11px] truncate">{notice.title}</p>
                    <p className="text-[10px] text-rose-700 mt-0.5 line-clamp-2">{notice.content}</p>
                  </div>
                ))}

                {myPendingTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="p-2 rounded bg-slate-50 border border-slate-100">
                    <p className="font-medium text-slate-800 text-[11px] truncate">{task.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Due: {task.dueDate} • {task.priority}</p>
                  </div>
                ))}

                {urgentNotices.length === 0 && myPendingTasks.length === 0 && (
                  <p className="text-center text-slate-400 py-3">All caught up! No pending alerts.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          title="Portal & Integration Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Presence & Avatar */}
        <div className="relative">
          <button
            onClick={() => setPresenceMenuOpen(!presenceMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-md hover:bg-slate-100 transition text-left"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${currentPresence.color}`}
              ></span>
            </div>
            <div className="hidden lg:block leading-tight">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[110px]">{currentUser.role}</p>
            </div>
          </button>

          {/* Presence Status Dropdown */}
          {presenceMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-md shadow-lg p-2 z-50 text-xs">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400">{currentUser.email}</p>
              </div>

              <div className="py-1">
                <p className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400">Presence Status</p>
                {presenceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      actions.updateUserStatus(currentUser.id, opt.value);
                      setPresenceMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-slate-50 transition ${
                      currentUser.status === opt.value ? 'font-semibold text-[#00ad1d]' : 'text-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.color}`}></span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-1.5 mt-1 border-t border-slate-100 space-y-0.5">
                <button
                  onClick={() => {
                    setPresenceMenuOpen(false);
                    if (onOpenSettingsTab) {
                      onOpenSettingsTab('password');
                    } else {
                      onOpenSettings();
                    }
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setPresenceMenuOpen(false);
                    if (onOpenSettingsTab) {
                      onOpenSettingsTab('profile');
                    } else {
                      onOpenSettings();
                    }
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-slate-700 hover:bg-slate-50 transition"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>My Profile Details</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
