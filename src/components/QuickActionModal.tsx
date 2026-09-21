import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Video,
  BellRing,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Clock,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Department, Priority, TaskStatus, StaffUser, Meeting } from '../types';
import { usePortalStore } from '../services/store';

interface QuickActionModalProps {
  isOpen: boolean;
  initialTab?: 'task' | 'meeting' | 'notice' | 'sharepoint';
  defaultAssignee?: StaffUser | null;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  initialTab = 'task',
  defaultAssignee = null,
  onClose,
}) => {
  const { staff, currentUser, actions } = usePortalStore();

  const [activeTab, setActiveTab] = useState<'task' | 'meeting' | 'notice' | 'sharepoint'>(initialTab);

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDepartment, setTaskDepartment] = useState<Department>('IT & Operations');
  const [taskPriority, setTaskPriority] = useState<Priority>('High');
  const [taskAssigneeId, setTaskAssigneeId] = useState(defaultAssignee?.id || currentUser.id);
  const [taskDueDate, setTaskDueDate] = useState('2026-09-25');
  const [taskSubtasks, setTaskSubtasks] = useState<string[]>(['Review requirements & sync in Teams', 'Upload documents to SharePoint']);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [taskType, setTaskType] = useState<'personal' | 'departmental'>('departmental');

  // Meeting Form State
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDepartment, setMeetingDepartment] = useState<Department>('Executive & Admin');
  const [meetingDate, setMeetingDate] = useState('2026-09-23');
  const [meetingStartTime, setMeetingStartTime] = useState('10:00 AM');
  const [meetingEndTime, setMeetingEndTime] = useState('11:00 AM');
  const [meetingAgenda, setMeetingAgenda] = useState<string[]>(['Review operations scorecard', 'SharePoint document sign-offs', 'Any other business']);
  const [newAgendaInput, setNewAgendaInput] = useState('');
  const [meetingAttendees, setMeetingAttendees] = useState<string[]>([]);
  const [meetingRecurrence, setMeetingRecurrence] = useState<NonNullable<Meeting['recurrence']>>('None');

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeDepartment, setNoticeDepartment] = useState<Department>('All Departments');
  const [noticePriority, setNoticePriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [noticePinned, setNoticePinned] = useState(false);
  const [noticeTargetIds, setNoticeTargetIds] = useState<string[]>([]);
  const [noticeAudience, setNoticeAudience] = useState<'all' | 'department' | 'selected_people'>('all');

  // SharePoint Upload State
  const [spFileName, setSpFileName] = useState('');
  const [spFolder, setSpFolder] = useState<'Operations' | 'Policies & Forms' | 'Finance' | 'Board Minutes' | 'Projects'>('Operations');
  const [spFileType, setSpFileType] = useState<'docx' | 'xlsx' | 'pptx' | 'pdf'>('docx');
  const [spSummary, setSpSummary] = useState('');
  const [spVisibility, setSpVisibility] = useState<'Everyone' | 'Department' | 'Specific People'>('Everyone');
  const [spTargetDepartment, setSpTargetDepartment] = useState<Department>('IT & Operations');
  const [spAllowedUserIds, setSpAllowedUserIds] = useState<string[]>([]);
  const [spEditableUserIds, setSpEditableUserIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const assignedStaff = staff.find(s => s.id === taskAssigneeId) || currentUser;

    await actions.addTask({
      title: taskTitle.trim(),
      description: taskDescription.trim() || 'No detailed description provided.',
      department: taskType === 'departmental' ? taskDepartment : 'IT & Operations', // Default or handled by logic
      status: 'To Do',
      priority: taskPriority,
      assignedToId: taskType === 'departmental' ? assignedStaff.id : currentUser.id,
      assignedToName: taskType === 'departmental' ? assignedStaff.name : currentUser.name,
      dueDate: taskDueDate,
      subtasks: taskSubtasks.map((st, i) => ({ id: `st-${Date.now()}-${i}`, title: st, completed: false })),
      tags: ['Portal', taskType],
      type: taskType,
    });

    onClose();
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    await actions.addMeeting({
      title: meetingTitle.trim(),
      department: meetingDepartment,
      date: meetingDate,
      startTime: meetingStartTime,
      endTime: meetingEndTime,
      meetingType: 'Microsoft Teams',
      agenda: meetingAgenda,
      attendees: staff
        .filter(s => meetingAttendees.includes(s.id) || s.id === currentUser.id)
        .map(s => ({
          userId: s.id,
          name: s.name,
          email: s.email,
          status: s.id === currentUser.id ? 'Accepted' : 'Pending',
          avatar: s.avatar,
        })),
      recurrence: meetingRecurrence,
    });

    onClose();
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim()) return;

    await actions.addNotice({
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      department: noticeDepartment,
      priority: noticePriority,
      pinned: noticePinned,
      attachments: [],
      targetAudienceType: noticeAudience,
      targetUserIds: noticeAudience === 'selected_people' ? noticeTargetIds : [],
      targetUserNames: noticeAudience === 'selected_people' ? staff.filter(s => noticeTargetIds.includes(s.id)).map(s => s.name) : [],
    });

    onClose();
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spFileName.trim()) return;

    const name = spFileName.endsWith(`.${spFileType}`) ? spFileName : `${spFileName}.${spFileType}`;

    await actions.addSharePointDocument({
      name,
      folder: spFolder,
      fileType: spFileType,
      size: '1.2 MB',
      version: 'v1.0',
      sharePointWebUrl: `https://wipahs.sharepoint.com/sites/${spFolder.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      contentSummary: spSummary.trim() || 'Document created and uploaded via WIPAHS OfficeHub.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-md max-w-xl w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 my-8 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Create New OfficeHub Record
            </h2>
            <p className="text-xs text-slate-500">
              Synced automatically across WIPAHS, Microsoft Teams, and SharePoint.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-md text-xs font-semibold">
          <button
            onClick={() => setActiveTab('task')}
            className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition ${
              activeTab === 'task' ? 'bg-white text-[#008f18] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#00ad1d]" />
            <span className="hidden sm:inline">New</span> Task
          </button>

          <button
            onClick={() => setActiveTab('meeting')}
            className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition ${
              activeTab === 'meeting' ? 'bg-white text-purple-800 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-purple-700" />
            Teams
          </button>

          <button
            onClick={() => setActiveTab('notice')}
            className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition ${
              activeTab === 'notice' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-amber-700" />
            Circular
          </button>

          <button
            onClick={() => setActiveTab('sharepoint')}
            className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition ${
              activeTab === 'sharepoint' ? 'bg-white text-blue-800 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#0c6fae]" />
            SharePoint
          </button>
        </div>

        {/* TAB 1: NEW TASK */}
        {activeTab === 'task' && (
          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Task Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Conduct Secondary School Teacher Workshop"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Operational context and expected deliverables..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Task Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="taskType" value="personal" checked={taskType === 'personal'} onChange={() => setTaskType('personal')} />
                  Personal
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="taskType" value="departmental" checked={taskType === 'departmental'} onChange={() => setTaskType('departmental')} />
                  Departmental
                </label>
              </div>
            </div>

            {taskType === 'departmental' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={taskDepartment}
                    onChange={(e) => setTaskDepartment(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-xs"
                  >
                    <option value="Executive & Admin">Executive & Admin</option>
                    <option value="Education & Schools">Education & Schools</option>
                    <option value="Health & Medical">Health & Medical</option>
                    <option value="Relief & Social Welfare">Relief & Social Welfare</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="IT & Operations">IT & Operations</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assignee</label>
                  <select
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-xs"
                  >
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-xs"
              >
                <option value="Urgent">Urgent (Teams Alert)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>

            {/* Subtasks Builder */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Checklist / Subtasks</label>
              <div className="space-y-1.5 mb-2">
                {taskSubtasks.map((st, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg text-xs">
                    <span className="text-slate-800">{st}</span>
                    <button
                      type="button"
                      onClick={() => setTaskSubtasks(taskSubtasks.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add item to checklist..."
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newSubtaskInput.trim()) {
                        setTaskSubtasks([...taskSubtasks, newSubtaskInput.trim()]);
                        setNewSubtaskInput('');
                      }
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSubtaskInput.trim()) {
                      setTaskSubtasks([...taskSubtasks, newSubtaskInput.trim()]);
                      setNewSubtaskInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-md text-slate-600 font-semibold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-[#00ad1d] hover:bg-[#009218] text-white font-semibold text-xs shadow-2xs"
              >
                Create Task
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SCHEDULE TEAMS MEETING */}
        {activeTab === 'meeting' && (
          <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Meeting Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Q3 Healthcare Dispensary Strategy Review"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department</label>
                <select
                  value={meetingDepartment}
                  onChange={(e) => setMeetingDepartment(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-purple-500 text-xs"
                >
                  <option value="Executive & Admin">Executive & Admin</option>
                  <option value="Education & Schools">Education & Schools</option>
                  <option value="Health & Medical">Health & Medical</option>
                  <option value="Relief & Social Welfare">Relief & Social Welfare</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="IT & Operations">IT & Operations</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Meeting Date</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
                <input
                  type="text"
                  placeholder="10:00 AM"
                  value={meetingStartTime}
                  onChange={(e) => setMeetingStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">End Time</label>
                <input
                  type="text"
                  placeholder="11:00 AM"
                  value={meetingEndTime}
                  onChange={(e) => setMeetingEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Invite Attendees</label>
              <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2">
                {staff.map(s => (
                  <label key={s.id} className="flex items-center gap-2 py-1 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={meetingAttendees.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) setMeetingAttendees([...meetingAttendees, s.id]);
                        else setMeetingAttendees(meetingAttendees.filter(id => id !== s.id));
                      }}
                      className="w-3.5 h-3.5"
                    />
                    {s.name} ({s.role})
                  </label>
                ))}
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Recurrence</label>
              <select
                value={meetingRecurrence}
                onChange={(e) => setMeetingRecurrence(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-purple-500 text-xs"
              >
                <option value="None">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                <Video className="w-3.5 h-3.5 text-purple-700" />
                <span>Microsoft Teams Virtual Room Generator</span>
              </div>
              <p className="text-[11px] text-purple-700">
                A secure Microsoft Teams meeting URL, conference ID, and Outlook .ics invite will be automatically generated.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-md text-slate-600 font-semibold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-2xs"
              >
                Schedule & Generate Teams Link
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: POST NOTICE */}
        {activeTab === 'notice' && (
          <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Circular Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mandatory Staff Digital Workflow Guidelines"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Announcement Body *</label>
              <textarea
                required
                rows={3}
                placeholder="Enter complete circular text to be distributed to authorized staff..."
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Department</label>
                <select
                  value={noticeDepartment}
                  onChange={(e) => setNoticeDepartment(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <option value="All Departments">All Departments (Broadcast)</option>
                  <option value="Executive & Admin">Executive & Admin</option>
                  <option value="Education & Schools">Education & Schools</option>
                  <option value="Health & Medical">Health & Medical</option>
                  <option value="Relief & Social Welfare">Relief & Social Welfare</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="IT & Operations">IT & Operations</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                <select
                  value={noticePriority}
                  onChange={(e) => setNoticePriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <option value="Normal">Normal Notification</option>
                  <option value="Urgent">Urgent (Triggers Teams Bot)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Audience Type</label>
              <select
                value={noticeAudience}
                onChange={(e) => setNoticeAudience(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
              >
                <option value="all">Everyone</option>
                <option value="department">By Department</option>
                <option value="selected_people">Specific People</option>
              </select>
            </div>

            {noticeAudience === 'selected_people' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Recipients</label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {staff.map(s => (
                    <label key={s.id} className="flex items-center gap-2 py-1 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={noticeTargetIds.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) setNoticeTargetIds([...noticeTargetIds, s.id]);
                          else setNoticeTargetIds(noticeTargetIds.filter(id => id !== s.id));
                        }}
                        className="w-3.5 h-3.5"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinNotice"
                checked={noticePinned}
                onChange={(e) => setNoticePinned(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <label htmlFor="pinNotice" className="text-slate-700 font-medium cursor-pointer">
                Pin this notice to top of the dashboard
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-md text-slate-600 font-semibold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-[#00ad1d] hover:bg-[#009218] text-white font-semibold text-xs shadow-2xs"
              >
                Publish & Broadcast
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: UPLOAD TO SHAREPOINT */}
        {activeTab === 'sharepoint' && (
          <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Document File Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. WIPAHS_Audit_Preparation_2026"
                value={spFileName}
                onChange={(e) => setSpFileName(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">SharePoint Folder Library</label>
                <select
                  value={spFolder}
                  onChange={(e) => setSpFolder(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-xs"
                >
                  <option value="Operations">Operations</option>
                  <option value="Policies & Forms">Policies & Forms</option>
                  <option value="Finance">Finance</option>
                  <option value="Board Minutes">Board Minutes</option>
                  <option value="Projects">Projects</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document Type</label>
                <select
                  value={spFileType}
                  onChange={(e) => setSpFileType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-xs"
                >
                  <option value="docx">Word (.docx)</option>
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="pptx">PowerPoint (.pptx)</option>
                  <option value="pdf">PDF Document (.pdf)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Visibility</label>
                <select
                  value={spVisibility}
                  onChange={(e) => setSpVisibility(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-xs"
                >
                  <option value="Everyone">Everyone</option>
                  <option value="Department">Department</option>
                  <option value="Specific People">Specific People</option>
                </select>
              </div>
              {spVisibility === 'Department' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={spTargetDepartment}
                    onChange={(e) => setSpTargetDepartment(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white text-xs"
                  >
                    <option value="Executive & Admin">Executive & Admin</option>
                    <option value="Education & Schools">Education & Schools</option>
                    <option value="Health & Medical">Health & Medical</option>
                    <option value="Relief & Social Welfare">Relief & Social Welfare</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="IT & Operations">IT & Operations</option>
                  </select>
                </div>
              )}
            </div>

            {spVisibility === 'Specific People' && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Allowed Users</label>
                <div className="max-h-24 overflow-y-auto border border-slate-200 rounded-lg p-2 text-xs">
                  {staff.map(s => (
                    <label key={s.id} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <input type="checkbox" checked={spAllowedUserIds.includes(s.id)} onChange={(e) => {
                        if (e.target.checked) setSpAllowedUserIds([...spAllowedUserIds, s.id]);
                        else setSpAllowedUserIds(spAllowedUserIds.filter(id => id !== s.id));
                      }} />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Editable Users</label>
              <div className="max-h-24 overflow-y-auto border border-slate-200 rounded-lg p-2 text-xs">
                {staff.map(s => (
                  <label key={s.id} className="flex items-center gap-2 py-0.5 cursor-pointer">
                    <input type="checkbox" checked={spEditableUserIds.includes(s.id)} onChange={(e) => {
                      if (e.target.checked) setSpEditableUserIds([...spEditableUserIds, s.id]);
                      else setSpEditableUserIds(spEditableUserIds.filter(id => id !== s.id));
                    }} />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Synopsis & Collaboration Summary</label>
              <textarea
                rows={2}
                placeholder="Describe key sections, author notes, or compliance references..."
                value={spSummary}
                onChange={(e) => setSpSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-md border border-blue-200 text-xs">
              <span className="font-bold text-blue-900 block mb-0.5">SharePoint Online Sync:</span>
              <p className="text-blue-700 text-[11px]">
                File will be indexed with active co-authoring support and version 1.0 tag in the WIPAHS cloud repository.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-md text-slate-600 font-semibold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-[#0c6fae] hover:bg-[#09578a] text-white font-semibold text-xs shadow-2xs"
              >
                Upload & Sync to SharePoint
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
