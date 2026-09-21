import React from 'react';
import {
  CheckSquare,
  FileText,
  Video,
  Users,
  BellRing,
  ArrowUpRight,
  Plus,
  Clock,
  ExternalLink,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Send,
  ShieldCheck,
  ChevronRight,
  Building
} from 'lucide-react';
import { usePortalStore } from '../services/store';
import { TabId } from './Sidebar';

interface DashboardViewProps {
  onSelectTab: (tab: TabId) => void;
  onOpenQuickAction: () => void;
  onOpenTeamsMeetingModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenQuickAction,
  onOpenTeamsMeetingModal,
}) => {
  const { tasks, notices, meetings, sharePointDocs, staff, auditLogs, currentUser, actions } = usePortalStore();

  const myTasks = tasks.filter(t => t.assignedToId === currentUser.id);
  const myPendingTasks = myTasks.filter(t => t.status !== 'Done');
  const urgentNotices = notices.filter(n => n.priority === 'Urgent');
  const onlineStaff = staff.filter(s => s.status === 'Online' || s.status === 'In Teams Meeting');
  const upcomingMeetings = meetings.filter(m => m.status === 'Scheduled');

  return (
    <div className="space-y-5">
      {/* Authentic Clean Top Banner */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operations Center
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              M365 Synced
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#19232d]">
            Good day, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            WIPAHS internal operations dashboard with Microsoft Teams & SharePoint integration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenTeamsMeetingModal}
            className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Schedule Teams Meeting</span>
          </button>

          <button
            onClick={onOpenQuickAction}
            className="px-3 py-1.5 rounded-md bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: My Active Tasks */}
        <div
          onClick={() => onSelectTab('tasks-my-work')}
          className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs hover:border-[#00ad1d] cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">My Work</span>
            <div className="p-1 rounded bg-[#00ad1d]/10 text-[#00ad1d]">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 leading-tight">
            {myPendingTasks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {tasks.filter(t => t.status === 'Done').length} completed total
          </div>
        </div>

        {/* Card 2: SharePoint Documents */}
        <div
          onClick={() => onSelectTab('documents')}
          className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs hover:border-[#0c6fae] cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">SharePoint Docs</span>
            <div className="p-1 rounded bg-blue-50 text-[#0c6fae]">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 leading-tight">
            {sharePointDocs.length}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-blue-700 font-medium mt-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Synced Online</span>
          </div>
        </div>

        {/* Card 3: Teams Meetings */}
        <div
          onClick={() => onSelectTab('meetings')}
          className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs hover:border-purple-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Teams Meetings</span>
            <div className="p-1 rounded bg-purple-50 text-purple-700">
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 leading-tight">
            {upcomingMeetings.length}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            Virtual conferences
          </div>
        </div>

        {/* Card 4: Notices */}
        <div
          onClick={() => onSelectTab('notices')}
          className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs hover:border-amber-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Circulars</span>
            <div className="p-1 rounded bg-amber-50 text-amber-700">
              <BellRing className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 leading-tight">
            {notices.length}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            {urgentNotices.length} urgent notices
          </div>
        </div>

        {/* Card 5: Online Staff */}
        <div
          onClick={() => onSelectTab('staff')}
          className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs hover:border-emerald-400 cursor-pointer transition col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Staff Online</span>
            <div className="p-1 rounded bg-emerald-50 text-emerald-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 leading-tight">
            {onlineStaff.length} / {staff.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Teams Presence</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): My Tasks & Urgent Notices */}
        <div className="lg:col-span-7 space-y-5">
          {/* Urgent Notices Banner if any */}
          {urgentNotices.length > 0 && (
            <div className="bg-amber-50 border-l-[3px] border-amber-500 p-3.5 rounded-r-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Urgent Circular
                  </span>
                </div>
                <button
                  onClick={() => onSelectTab('notices')}
                  className="text-xs text-amber-800 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-1">{urgentNotices[0].title}</p>
              <p className="text-xs text-slate-700 mt-0.5 line-clamp-2 leading-relaxed">
                {urgentNotices[0].content}
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                Issued by {urgentNotices[0].authorName} • {urgentNotices[0].date || urgentNotices[0].createdAt}
              </div>
            </div>
          )}

          {/* My Tasks Section */}
          <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
                  <span>My Assigned Tasks</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00ad1d]/15 text-[#008f18] font-bold">
                    {myPendingTasks.length} pending
                  </span>
                </h2>
              </div>

              <button
                onClick={() => onSelectTab('tasks-my-work')}
                className="text-xs font-semibold text-[#008f18] hover:underline flex items-center gap-1"
              >
                <span>View My Work</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-200">
              {myTasks.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  className="p-3 hover:bg-slate-50/80 transition flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-slate-900 truncate">{task.title}</span>
                      {task.teamsMeetingLink && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Teams
                        </span>
                      )}
                      {task.sharePointDocUrl && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          SharePoint
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>{task.department}</span>
                      <span>•</span>
                      <span>Due {task.dueDate}</span>
                    </div>

                    {/* Subtasks checklist preview */}
                    {task.subtasks.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {task.subtasks.slice(0, 2).map(sub => (
                          <div
                            key={sub.id}
                            onClick={() => actions.toggleSubtask(task.id, sub.id)}
                            className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              onChange={() => {}}
                              className="w-3 h-3 text-[#00ad1d] rounded border-slate-300 focus:ring-[#00ad1d]"
                            />
                            <span className={sub.completed ? 'line-through text-slate-400' : ''}>
                              {sub.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded border font-medium shrink-0 ${
                    task.status === 'Done'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : task.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Teams Meetings & SharePoint Quick Launcher */}
        <div className="lg:col-span-5 space-y-5">
          {/* Upcoming Teams Meetings */}
          <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-700" />
                <span>Upcoming Teams Meetings</span>
              </h2>

              <button
                onClick={() => onSelectTab('meetings')}
                className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
              >
                <span>Calendar</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-200">
              {upcomingMeetings.slice(0, 3).map(mtg => (
                <div key={mtg.id} className="p-3 hover:bg-slate-50/80 transition space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900">{mtg.title}</p>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 font-medium shrink-0">
                      {mtg.time || `${mtg.startTime} - ${mtg.endTime}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{mtg.date} • {mtg.department}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={mtg.teamsJoinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      <Video className="w-3 h-3" />
                      <span>Join Teams</span>
                    </a>
                    <span className="text-[10px] text-slate-400">ID: {mtg.teamsMeetingId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SharePoint Recent Documents */}
          <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#0c6fae]" />
                <span>SharePoint Documents</span>
              </h2>

              <button
                onClick={() => onSelectTab('documents')}
                className="text-xs font-semibold text-[#0c6fae] hover:underline flex items-center gap-1"
              >
                <span>Library</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-200">
              {sharePointDocs.slice(0, 3).map(doc => (
                <div key={doc.id} className="p-3 hover:bg-slate-50/80 transition flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{doc.folder || doc.category} • v{doc.version} • {doc.size}</p>
                  </div>
                  <a
                    href={doc.sharePointWebUrl || doc.webUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-[#0c6fae] rounded transition shrink-0"
                    title="Open in Office 365"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log / Activity */}
          <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                System Activity Trail
              </h2>
            </div>
            <div className="divide-y divide-slate-200 max-h-48 overflow-y-auto">
              {auditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="p-2.5 text-xs text-slate-600 flex items-center justify-between gap-2">
                  <span className="truncate">{log.description || `${log.actorName} - ${log.targetName}`}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
