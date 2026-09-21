import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  FileText,
  Calendar,
  ExternalLink,
  ChevronRight,
  User,
  Layers,
  Check,
  Building,
  Filter
} from 'lucide-react';
import { Department, Priority, Task, TaskStatus } from '../types';
import { usePortalStore, portalStore } from '../services/store';

interface TasksViewProps {
  onOpenNewTaskModal: () => void;
  defaultCategory?: 'my-work' | 'department' | 'all';
}

export const TasksView: React.FC<TasksViewProps> = ({
  onOpenNewTaskModal,
  defaultCategory = 'my-work'
}) => {
  const { tasks, staff, currentUser, actions } = usePortalStore();

  const [activeCategory, setActiveCategory] = useState<'my-work' | 'department' | 'all'>(defaultCategory);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Update category when defaultCategory changes
  React.useEffect(() => {
    setActiveCategory(defaultCategory);
  }, [defaultCategory]);

  // Metric counts
  const myWorkTasks = tasks.filter(t => t.assignedToId === currentUser.id);
  const deptTasks = tasks.filter(t => t.department === currentUser.department);
  const overdueCount = tasks.filter(t => {
    const isPast = new Date(t.dueDate) < new Date('2026-09-20');
    return isPast && t.status !== 'Done';
  }).length;

  const currentList = activeCategory === 'my-work'
    ? myWorkTasks
    : activeCategory === 'department'
    ? deptTasks
    : tasks;

  const filteredTasks = currentList.filter(task => {
    if (statusFilter !== 'All' && task.status !== statusFilter) return false;
    if (departmentFilter !== 'All' && task.department !== departmentFilter) return false;
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.assignedToName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityDot = (priority: Priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500';
      case 'High':
        return 'bg-amber-500';
      case 'Medium':
        return 'bg-blue-500';
      case 'Low':
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'In Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'To Do':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    actions.toggleSubtask(taskId, subtaskId);
    if (selectedTask && selectedTask.id === taskId) {
      const updated = portalStore.getTasks().find((t: Task) => t.id === taskId);
      if (updated) setSelectedTask(updated);
    }
  };

  const handleAddSubtask = (taskId: string) => {
    if (!newSubtaskText.trim()) return;
    actions.addSubtask(taskId, newSubtaskText.trim());
    setNewSubtaskText('');
    const updated = portalStore.getTasks().find((t: Task) => t.id === taskId);
    if (updated) setSelectedTask(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#00ad1d]/10 flex items-center justify-center shrink-0">
              <CheckSquare className="w-4 h-4 text-[#00ad1d]" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-tight">
                {myWorkTasks.filter(t => t.status !== 'Done').length}
              </p>
              <p className="text-xs text-slate-500">My Open Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4 text-[#0c6fae]" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-tight">
                {deptTasks.filter(t => t.status !== 'Done').length}
              </p>
              <p className="text-xs text-slate-500">{currentUser.department}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-rose-50 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-tight">{overdueCount}</p>
              <p className="text-xs text-slate-500">Overdue Tasks</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-3.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 leading-tight">
                {tasks.filter(t => t.status === 'Done').length}
              </p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Task Card */}
      <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
        {/* Card Header with Category Tabs & Actions */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          {/* Work Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-md text-xs font-medium self-start">
            <button
              onClick={() => setActiveCategory('my-work')}
              className={`px-3 py-1.5 rounded-sm transition ${
                activeCategory === 'my-work'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Work ({myWorkTasks.length})
            </button>
            <button
              onClick={() => setActiveCategory('department')}
              className={`px-3 py-1.5 rounded-sm transition ${
                activeCategory === 'department'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Department ({deptTasks.length})
            </button>
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-sm transition ${
                activeCategory === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tasks ({tasks.length})
            </button>
          </div>

          {/* New Task Button */}
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ad1d] hover:bg-[#009218] text-white rounded-md text-xs font-semibold shadow-2xs transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-3 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks by title or assignee..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {activeCategory === 'all' && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
              >
                <option value="All">All Departments</option>
                <option value="IT & Operations">IT & Operations</option>
                <option value="Education & Schools">Education & Schools</option>
                <option value="Health & Medical">Health & Medical</option>
                <option value="Welfare & Community">Welfare & Community</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Executive & Admin">Executive & Admin</option>
              </select>
            )}
          </div>
        </div>

        {/* Task List (Authentic divide-y divide-border) */}
        <div className="divide-y divide-slate-200 bg-white">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 px-4">
              <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No tasks found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filter criteria or create a new task.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isPast = new Date(task.dueDate) < new Date('2026-09-20');
              const isOverdue = isPast && task.status !== 'Done';
              const completedSubtasks = task.subtasks.filter(s => s.completed).length;
              const totalSubtasks = task.subtasks.length;

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-start sm:items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Left: Priority dot & Title/Details */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span
                      title={`Priority: ${task.priority}`}
                      className={`w-2.5 h-2.5 rounded-full mt-1 sm:mt-0 shrink-0 ${getPriorityDot(task.priority)}`}
                    ></span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-900 group-hover:text-[#008f18] truncate leading-snug">
                          {task.title}
                        </p>

                        {/* Teams meeting link tag */}
                        {task.teamsMeetingLink && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(task.teamsMeetingLink, '_blank');
                            }}
                            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                          >
                            <Video className="w-2.5 h-2.5" />
                            <span>Teams</span>
                          </span>
                        )}

                        {/* SharePoint Doc link tag */}
                        {task.sharePointDocUrl && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(task.sharePointDocUrl, '_blank');
                            }}
                            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            <span>SharePoint</span>
                          </span>
                        )}
                      </div>

                      {/* Sub-details */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        <span>{task.department}</span>
                        <span>•</span>
                        <span>Assignee: {task.assignedToName}</span>

                        {totalSubtasks > 0 && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                              <CheckCircle2 className="w-3 h-3 text-[#00ad1d]" />
                              {completedSubtasks}/{totalSubtasks} subtasks
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status badge & Due date */}
                  <div className="shrink-0 flex flex-col items-end gap-1 text-right">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded border font-medium ${getStatusBadge(task.status)}`}
                    >
                      {task.status}
                    </span>

                    <span
                      className={`flex items-center gap-1 text-xs ${
                        isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{task.dueDate}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Details Modal / Drawer (Opens when row clicked) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${getPriorityDot(selectedTask.priority)}`}></span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {selectedTask.priority} Priority • {selectedTask.department}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900">{selectedTask.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Description</p>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                  {selectedTask.description}
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 mb-1">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['To Do', 'In Progress', 'In Review', 'Done'] as TaskStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        actions.updateTaskStatus(selectedTask.id, st);
                        const updated = portalStore.getTasks().find((t: Task) => t.id === selectedTask.id);
                        if (updated) setSelectedTask(updated);
                      }}
                      className={`px-2.5 py-1 rounded border text-xs font-medium transition ${
                        selectedTask.status === st
                          ? 'bg-[#00ad1d] text-white border-[#00ad1d]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtasks Section */}
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 mb-2">
                  Subtask Checklist ({selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length})
                </p>

                <div className="space-y-1.5 mb-2.5">
                  {selectedTask.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleToggleSubtask(selectedTask.id, sub.id)}
                      className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100/70 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 text-[#00ad1d] rounded border-slate-300 focus:ring-[#00ad1d]"
                      />
                      <span className={`flex-1 ${sub.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask(selectedTask.id);
                      }
                    }}
                    placeholder="Add a new checklist item..."
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                  <button
                    onClick={() => handleAddSubtask(selectedTask.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Integrations (Teams & SharePoint) */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <p className="text-[11px] uppercase font-bold text-slate-400">Microsoft 365 Links</p>
                {selectedTask.teamsMeetingLink ? (
                  <div className="flex items-center justify-between p-2 rounded bg-purple-50/80 border border-purple-200">
                    <div className="flex items-center gap-2 text-purple-900 font-medium">
                      <Video className="w-3.5 h-3.5 text-purple-700" />
                      <span>Teams Virtual Meeting Attached</span>
                    </div>
                    <a
                      href={selectedTask.teamsMeetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 bg-purple-600 text-white rounded text-[11px] font-medium hover:bg-purple-700 transition"
                    >
                      Join Meeting
                    </a>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No Microsoft Teams meeting linked.</p>
                )}

                {selectedTask.sharePointDocUrl ? (
                  <div className="flex items-center justify-between p-2 rounded bg-blue-50/80 border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-900 font-medium">
                      <FileText className="w-3.5 h-3.5 text-blue-700" />
                      <span>SharePoint File Workspace</span>
                    </div>
                    <a
                      href={selectedTask.sharePointDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 transition"
                    >
                      Open File
                    </a>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No SharePoint document attached.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">Assignee: {selectedTask.assignedToName}</span>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-medium transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
