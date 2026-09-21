export type Department = 
  | 'All Departments'
  | 'Executive & Admin'
  | 'Education & Schools'
  | 'Health & Medical'
  | 'Relief & Social Welfare'
  | 'Finance & Accounts'
  | 'IT & Operations';

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  dueDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  department: Department;
  status: TaskStatus;
  priority: Priority;
  assignedToId: string;
  assignedToName: string;
  assignedToAvatar: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  dueDate: string;
  subtasks: Subtask[];
  tags: string[];
  sharePointDocId?: string;
  sharePointDocUrl?: string;
  teamsMeetingLink?: string;
  teamsNotificationSent?: boolean;
  type?: 'personal' | 'departmental';
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  department: Department;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  date?: string;
  priority: 'Urgent' | 'Normal';
  pinned: boolean;
  targetAudienceType?: 'all' | 'department' | 'selected_people';
  targetUserIds?: string[];
  targetUserNames?: string[];
  attachments?: {
    name: string;
    size: string;
    type: 'pdf' | 'docx' | 'xlsx' | 'image' | 'file';
    url: string;
  }[];
  acknowledgedBy: string[]; // user IDs or names
  teamsSent?: boolean;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  department: Department;
  leadId: string;
  leadName: string;
  status: 'Active' | 'On Track' | 'At Risk' | 'Completed';
  progress: number; // 0 - 100
  budget?: string;
  spent?: string;
  startDate: string;
  targetDate: string;
  membersCount: number;
  sharePointFolderUrl: string;
  activeTasksCount: number;
}

export interface MeetingAttendee {
  userId: string;
  name: string;
  email: string;
  status: 'Accepted' | 'Pending' | 'Declined' | 'Proposed New Time';
  avatar?: string;
  proposedDate?: string;
  proposedTime?: string;
  proposalNote?: string;
}

export interface Meeting {
  id: string;
  title: string;
  department: Department;
  date: string;
  time?: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  description?: string;
  organizerId: string;
  organizerName: string;
  attendees: MeetingAttendee[];
  agenda: string[];
  meetingType: 'Microsoft Teams' | 'In-Person Boardroom' | 'Hybrid';
  teamsJoinUrl?: string;
  teamsMeetingId?: string;
  teamsPasscode?: string;
  minutes?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  recurrence?: 'None' | 'Daily' | 'Weekly' | 'Monthly';
}

export interface SharePointDocument {
  id: string;
  name: string;
  folder: 'Policies & Forms' | 'Operations' | 'Finance' | 'Board Minutes' | 'Projects' | string;
  category?: string;
  fileType: 'docx' | 'xlsx' | 'pptx' | 'pdf';
  size: string;
  modifiedAt: string;
  lastModified?: string;
  modifiedBy: string;
  lastModifiedBy?: string;
  version: string;
  sharePointWebUrl: string;
  webUrl?: string;
  visibility: 'Everyone' | 'Department' | 'Specific People';
  targetDepartment?: Department;
  allowedUserIds?: string[]; // If visibility is 'Specific People'
  editableUserIds: string[];
  isLockedForEditing: boolean;
  activeCollaborators: {
    userId: string;
    name: string;
    editingSection?: string;
  }[];
  activeUsers?: string[];
  syncedWithSharePoint: boolean;
  contentSummary?: string;
}

export type UserPresenceStatus = 'Online' | 'Busy' | 'In Teams Meeting' | 'Away' | 'Offline';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: Department;
  status: UserPresenceStatus;
  avatar: string;
  phone: string;
  activityScore: number;
  tasksCount: number;
  lastActive: string;
  teamsHandle?: string;
  birthday?: string; // e.g. "09-24" or "1992-09-24"
  bio?: string;
  location?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'image' | 'file';
  url: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  text: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  reactions?: { emoji: string; count: number; userIds: string[] }[];
}

export interface ChatConversation {
  id: string;
  type: 'direct' | 'group';
  name: string;
  description?: string;
  avatar?: string;
  department?: Department;
  participantIds: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  createdById?: string;
  createdAt?: string;
}

export interface TeamsNotificationRule {
  id: string;
  name: string;
  event: 'task_urgent_created' | 'task_completed' | 'urgent_notice' | 'teams_meeting_scheduled' | 'sharepoint_doc_uploaded';
  channelName: string;
  webhookUrl: string;
  enabled: boolean;
  lastTriggered?: string;
}

export interface AuditEvent {
  id: string;
  actorName: string;
  actorEmail: string;
  eventType: string;
  targetName: string;
  description?: string;
  timestamp: string;
  badgeColor: 'teal' | 'blue' | 'amber' | 'emerald' | 'purple' | 'green';
}

export interface Decision {
  id: string;
  title: string;
  summary: string;
  department: Department;
  meetingId?: string;
  meetingTitle?: string;
  date: string;
  decidedBy: string;
  status: 'Adopted' | 'Approved' | 'In Implementation' | 'Under Review';
  category: 'Strategic' | 'Financial' | 'Operational' | 'Governance';
  actionItemsCount: number;
}

export interface Approval {
  id: string;
  title: string;
  description: string;
  type: 'Budget Allocation' | 'Procurement' | 'Project Milestone' | 'Policy Change' | 'Contract';
  department: Department;
  projectId?: string;
  projectName?: string;
  requestedBy: string;
  requestedByAvatar?: string;
  requestedDate: string;
  amount?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

export interface DepartmentInfo {
  id: string;
  name: Department;
  headName: string;
  headRole: string;
  headAvatar: string;
  staffCount: number;
  activeProjectsCount: number;
  openTasksCount: number;
  budget: string;
  description: string;
}

export interface RolePermission {
  id: string;
  roleTitle: string;
  department: string;
  userCount: number;
  description: string;
  permissions: {
    module: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    approve: boolean;
  }[];
}

