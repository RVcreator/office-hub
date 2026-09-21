import React, { useState } from 'react';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  Users,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import { Department, Meeting } from '../types';
import { usePortalStore } from '../services/store';
import { downloadCalendarInvite } from '../services/teamsSharePointService';

export const MeetingsTeamsView: React.FC<{
  onOpenScheduleModal: () => void;
  initialMode?: 'list' | 'calendar';
}> = ({ onOpenScheduleModal, initialMode = 'list' }) => {
  const { meetings, currentUser, actions } = usePortalStore();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(initialMode);
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [copiedMeetingId, setCopiedMeetingId] = useState<string | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('2026-09-21');

  // Sync mode if prop changes
  React.useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode]);

  const filteredMeetings = meetings.filter(m => {
    if (departmentFilter !== 'All' && m.department !== departmentFilter) return false;
    return true;
  });

  const handleCopyLink = (meeting: Meeting) => {
    if (meeting.teamsJoinUrl) {
      navigator.clipboard.writeText(meeting.teamsJoinUrl);
      setCopiedMeetingId(meeting.id);
      setTimeout(() => setCopiedMeetingId(null), 2000);
    }
  };

  // Days in September 2026 for authentic calendar display
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
    const dayMeetings = meetings.filter(m => m.date === dateStr);
    return { dayNum, dateStr, meetings: dayMeetings };
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Conferencing & Collaboration
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              Microsoft Teams
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#19232d]">
            {viewMode === 'calendar' ? 'Office Calendar' : 'Meetings & Conferencing'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewMode === 'calendar'
              ? 'Organizational schedule, recurring departmental syncs, and board calendar.'
              : 'Direct Microsoft Teams audio/video sessions, attendance registers, and Outlook calendar (.ics) sync.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calendar
            </button>
          </div>

          <button
            onClick={onOpenScheduleModal}
            className="px-3.5 py-2 rounded-md bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Calendar Mode */}
      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00ad1d]" />
                <h2 className="text-base font-bold text-slate-900">September 2026</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">East Africa Time (EAT)</span>
            </div>

            <div className="grid grid-cols-7 gap-2 mt-4 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-xs font-bold text-slate-400 py-1">
                  {day}
                </div>
              ))}

              {calendarDays.map(item => {
                const isSelected = selectedCalendarDate === item.dateStr;
                const hasMeetings = item.meetings.length > 0;

                return (
                  <button
                    key={item.dayNum}
                    onClick={() => setSelectedCalendarDate(item.dateStr)}
                    className={`min-h-16 p-1.5 rounded-md border text-left flex flex-col justify-between transition ${
                      isSelected
                        ? 'border-[#00ad1d] bg-[#00ad1d]/5 ring-1 ring-[#00ad1d]'
                        : hasMeetings
                        ? 'border-purple-200 bg-purple-50/40 hover:border-purple-300'
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/50'
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-700">{item.dayNum}</span>
                    {hasMeetings && (
                      <div className="space-y-1 mt-1">
                        {item.meetings.map(m => (
                          <div
                            key={m.id}
                            className="text-[10px] bg-purple-100 text-purple-800 font-medium px-1 py-0.5 rounded truncate"
                            title={m.title}
                          >
                            {m.startTime || m.time} {m.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>Sessions on {selectedCalendarDate}</span>
              <span className="text-xs text-slate-400 font-normal">
                ({meetings.filter(m => m.date === selectedCalendarDate).length} scheduled)
              </span>
            </h3>

            {meetings.filter(m => m.date === selectedCalendarDate).length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No sessions scheduled on this date.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meetings.filter(m => m.date === selectedCalendarDate).map(m => (
                  <div key={m.id} className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{m.title}</span>
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                        {m.startTime || m.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{m.department}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <a
                        href={m.teamsJoinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Teams</span>
                      </a>
                      <button
                        onClick={() => downloadCalendarInvite(m)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Outlook (.ics)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List Mode */
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Filter Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
              >
                <option value="All">All Departments</option>
                <option value="IT & Operations">IT & Operations</option>
                <option value="Education & Schools">Education & Schools</option>
                <option value="Health & Medical">Health & Medical</option>
                <option value="Relief & Social Welfare">Relief & Social Welfare</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Executive & Admin">Executive & Admin</option>
              </select>
            </div>

            <div className="text-slate-500 text-xs">
              Showing <strong>{filteredMeetings.length}</strong> sessions
            </div>
          </div>

          {/* Meetings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {meeting.department}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        meeting.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : meeting.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">{meeting.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{meeting.description}</p>

                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{meeting.date} at {meeting.startTime || meeting.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{meeting.attendees.length} attendees invited</span>
                    </div>
                  </div>

                  {meeting.agenda.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Agenda</p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {meeting.agenda.map((ag, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ad1d]"></span>
                            <span>{ag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={meeting.teamsJoinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Teams</span>
                    </a>

                    <button
                      onClick={() => handleCopyLink(meeting)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs transition"
                      title="Copy Teams Link"
                    >
                      {copiedMeetingId === meeting.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => downloadCalendarInvite(meeting)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1.5 transition"
                    title="Download .ics Outlook Invite"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Calendar (.ics)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

