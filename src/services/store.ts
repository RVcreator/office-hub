import { useState, useEffect } from 'react';
import {
  Department,
  Meeting,
  Notice,
  Project,
  SharePointDocument,
  StaffUser,
  Task,
  TeamsNotificationRule,
  AuditEvent,
  UserPresenceStatus,
  Subtask,
  Decision,
  Approval,
  DepartmentInfo,
  RolePermission,
  ChatConversation,
  ChatMessage
} from '../types';
import {
  CURRENT_USER,
  INITIAL_STAFF,
  INITIAL_TASKS,
  INITIAL_NOTICES,
  INITIAL_PROJECTS,
  INITIAL_MEETINGS,
  INITIAL_SHAREPOINT_DOCS,
  INITIAL_TEAMS_RULES,
  INITIAL_AUDIT_LOGS,
  INITIAL_DECISIONS,
  INITIAL_APPROVALS,
  INITIAL_DEPARTMENTS,
  INITIAL_ROLES,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES
} from '../data/mockData';
import { generateTeamsMeetingPayload, sendTeamsWebhookNotification } from './teamsSharePointService';

const STORAGE_PREFIX = 'wipahs_officehub_v2_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e);
  }
}

// Global subscribers for reactive multi-component syncing without heavy context provider nesting
type Listener = () => void;
const listeners = new Set<Listener>();
function notifyListeners() {
  listeners.forEach((l) => l());
}

let tasksState: Task[] = loadFromStorage('tasks', INITIAL_TASKS);
let noticesState: Notice[] = loadFromStorage('notices', INITIAL_NOTICES);
let projectsState: Project[] = loadFromStorage('projects', INITIAL_PROJECTS);
let meetingsState: Meeting[] = loadFromStorage('meetings', INITIAL_MEETINGS);
let staffState: StaffUser[] = loadFromStorage('staff', INITIAL_STAFF);
let sharePointDocsState: SharePointDocument[] = loadFromStorage('sharepoint_docs', INITIAL_SHAREPOINT_DOCS);
let teamsRulesState: TeamsNotificationRule[] = loadFromStorage('teams_rules', INITIAL_TEAMS_RULES);
let auditLogsState: AuditEvent[] = loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS);
let currentUserState: StaffUser = loadFromStorage('current_user', CURRENT_USER);
let decisionsState: Decision[] = loadFromStorage('decisions', INITIAL_DECISIONS);
let approvalsState: Approval[] = loadFromStorage('approvals', INITIAL_APPROVALS);
let departmentsState: DepartmentInfo[] = loadFromStorage('departments', INITIAL_DEPARTMENTS);
let rolesState: RolePermission[] = loadFromStorage('roles', INITIAL_ROLES);
let conversationsState: ChatConversation[] = loadFromStorage('conversations', INITIAL_CONVERSATIONS);
let messagesState: ChatMessage[] = loadFromStorage('messages', INITIAL_MESSAGES);

// Store Actions
export const portalStore = {
  getTasks: () => tasksState,
  getNotices: () => noticesState,
  getProjects: () => projectsState,
  getMeetings: () => meetingsState,
  getStaff: () => staffState,
  getSharePointDocs: () => sharePointDocsState,
  getTeamsRules: () => teamsRulesState,
  getAuditLogs: () => auditLogsState,
  getCurrentUser: () => currentUserState,
  getDecisions: () => decisionsState,
  getApprovals: () => approvalsState,
  getDepartments: () => departmentsState,
  getRoles: () => rolesState,
  getConversations: () => conversationsState,
  getMessages: () => messagesState,

  addConversation: (conversation: ChatConversation) => {
    conversationsState = [conversation, ...conversationsState];
    saveToStorage('conversations', conversationsState);
    notifyListeners();
  },
  
  sendMessage: (message: ChatMessage) => {
    messagesState = [...messagesState, message];
    saveToStorage('messages', messagesState);
    conversationsState = conversationsState.map(c => 
      c.id === message.conversationId 
        ? { ...c, lastMessage: message.text, lastMessageTime: message.timestamp } 
        : c
    );
    saveToStorage('conversations', conversationsState);
    notifyListeners();
  },

  setCurrentUserPresence: (status: UserPresenceStatus) => {
    currentUserState = { ...currentUserState, status, lastActive: 'Just now' };
    saveToStorage('current_user', currentUserState);
    staffState = staffState.map(s => s.id === currentUserState.id ? currentUserState : s);
    saveToStorage('staff', staffState);
    portalStore.logAudit('presence_status_changed', `Changed presence status to ${status}`, 'teal');
    notifyListeners();
  },

  // Tasks actions
  addTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'createdById' | 'createdByName' | 'assignedToAvatar'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdById: currentUserState.id,
      createdByName: currentUserState.name,
      assignedToAvatar: staffState.find(s => s.id === taskData.assignedToId)?.avatar || CURRENT_USER.avatar,
      subtasks: taskData.subtasks || [],
    };

    tasksState = [newTask, ...tasksState];
    saveToStorage('tasks', tasksState);
    portalStore.logAudit('task_created', newTask.title, 'teal');

    // Trigger Teams rule if urgent or high priority
    if (newTask.priority === 'Urgent' || newTask.priority === 'High') {
      const rule = teamsRulesState.find(r => r.event === 'task_urgent_created' && r.enabled);
      if (rule) {
        await sendTeamsWebhookNotification(rule.webhookUrl, 'task', newTask);
        portalStore.updateRuleTriggered(rule.id);
      }
    }

    notifyListeners();
    return newTask;
  },

  updateTaskStatus: (taskId: string, newStatus: Task['status']) => {
    tasksState = tasksState.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, status: newStatus };
        if (newStatus === 'Done') {
          portalStore.logAudit('task_completed', t.title, 'emerald');
          const rule = teamsRulesState.find(r => r.event === 'task_completed' && r.enabled);
          if (rule) {
            sendTeamsWebhookNotification(rule.webhookUrl, 'task', updated);
            portalStore.updateRuleTriggered(rule.id);
          }
        }
        return updated;
      }
      return t;
    });
    saveToStorage('tasks', tasksState);
    notifyListeners();
  },

  toggleSubtask: (taskId: string, subtaskId: string) => {
    tasksState = tasksState.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(s => {
          if (s.id === subtaskId) {
            const nextVal = !s.completed;
            portalStore.logAudit(nextVal ? 'subtask_completed' : 'subtask_reopened', `${s.title} (${t.title})`, nextVal ? 'emerald' : 'blue');
            return { ...s, completed: nextVal };
          }
          return s;
        });
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    });
    saveToStorage('tasks', tasksState);
    notifyListeners();
  },

  addSubtask: (taskId: string, title: string) => {
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title,
      completed: false,
    };
    tasksState = tasksState.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: [...t.subtasks, newSub] };
      }
      return t;
    });
    saveToStorage('tasks', tasksState);
    notifyListeners();
  },

  deleteTask: (taskId: string) => {
    const target = tasksState.find(t => t.id === taskId);
    tasksState = tasksState.filter(t => t.id !== taskId);
    saveToStorage('tasks', tasksState);
    if (target) portalStore.logAudit('task_deleted', target.title, 'amber');
    notifyListeners();
  },

  // Notices actions
  addNotice: async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'authorRole' | 'acknowledgedBy'>) => {
    const newNotice: Notice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      createdAt: new Date().toISOString(),
      authorId: currentUserState.id,
      authorName: currentUserState.name,
      authorRole: currentUserState.role,
      acknowledgedBy: [currentUserState.id],
    };

    noticesState = [newNotice, ...noticesState];
    saveToStorage('notices', noticesState);
    portalStore.logAudit('notice_published', newNotice.title, newNotice.priority === 'Urgent' ? 'amber' : 'blue');

    if (newNotice.priority === 'Urgent') {
      const rule = teamsRulesState.find(r => r.event === 'urgent_notice' && r.enabled);
      if (rule) {
        await sendTeamsWebhookNotification(rule.webhookUrl, 'notice', newNotice);
        portalStore.updateRuleTriggered(rule.id);
      }
    }

    notifyListeners();
    return newNotice;
  },

  togglePinNotice: (noticeId: string) => {
    noticesState = noticesState.map(n => n.id === noticeId ? { ...n, pinned: !n.pinned } : n);
    saveToStorage('notices', noticesState);
    notifyListeners();
  },

  acknowledgeNotice: (noticeId: string, _userId?: string) => {
    noticesState = noticesState.map(n => {
      if (n.id === noticeId && !n.acknowledgedBy.includes(currentUserState.id)) {
        portalStore.logAudit('notice_acknowledged', n.title, 'emerald');
        return { ...n, acknowledgedBy: [...n.acknowledgedBy, currentUserState.id] };
      }
      return n;
    });
    saveToStorage('notices', noticesState);
    notifyListeners();
  },

  // Meetings actions (with Microsoft Teams link generation)
  addMeeting: async (meetingData: Omit<Meeting, 'id' | 'organizerId' | 'organizerName' | 'status'>) => {
    const teamsMeta = meetingData.meetingType === 'Microsoft Teams' || meetingData.meetingType === 'Hybrid'
      ? generateTeamsMeetingPayload(meetingData)
      : {};

    const newMeeting: Meeting = {
      ...meetingData,
      ...teamsMeta,
      id: `meet-${Date.now()}`,
      organizerId: currentUserState.id,
      organizerName: currentUserState.name,
      status: 'Scheduled',
    };

    meetingsState = [newMeeting, ...meetingsState];
    saveToStorage('meetings', meetingsState);
    portalStore.logAudit('teams_meeting_scheduled', `${newMeeting.title} (${newMeeting.date})`, 'purple');

    // Trigger Teams rule
    const rule = teamsRulesState.find(r => r.event === 'teams_meeting_scheduled' && r.enabled);
    if (rule) {
      await sendTeamsWebhookNotification(rule.webhookUrl, 'meeting', newMeeting);
      portalStore.updateRuleTriggered(rule.id);
    }

    notifyListeners();
    return newMeeting;
  },

  // SharePoint actions
  addSharePointDocument: async (docData: Omit<SharePointDocument, 'id' | 'modifiedAt' | 'modifiedBy' | 'syncedWithSharePoint' | 'isLockedForEditing' | 'activeCollaborators'>) => {
    const newDoc: SharePointDocument = {
      ...docData,
      id: `sp-doc-${Date.now()}`,
      modifiedAt: new Date().toISOString(),
      modifiedBy: currentUserState.name,
      syncedWithSharePoint: true,
      isLockedForEditing: false,
      activeCollaborators: [],
    };

    sharePointDocsState = [newDoc, ...sharePointDocsState];
    saveToStorage('sharepoint_docs', sharePointDocsState);
    portalStore.logAudit('sharepoint_document_uploaded', newDoc.name, 'blue');

    const rule = teamsRulesState.find(r => r.event === 'sharepoint_doc_uploaded' && r.enabled);
    if (rule) {
      await sendTeamsWebhookNotification(rule.webhookUrl, 'document', newDoc);
      portalStore.updateRuleTriggered(rule.id);
    }

    notifyListeners();
    return newDoc;
  },

  syncSharePointDocument: (docId: string) => {
    sharePointDocsState = sharePointDocsState.map(d => {
      if (d.id === docId) {
        portalStore.logAudit('sharepoint_synced', d.name, 'teal');
        return {
          ...d,
          syncedWithSharePoint: true,
          modifiedAt: new Date().toISOString(),
          modifiedBy: currentUserState.name,
        };
      }
      return d;
    });
    saveToStorage('sharepoint_docs', sharePointDocsState);
    notifyListeners();
  },

  toggleDocumentCollaboration: (docId: string) => {
    sharePointDocsState = sharePointDocsState.map(d => {
      if (d.id === docId) {
        const isCurrentlyIn = d.activeCollaborators.some(c => c.userId === currentUserState.id);
        const updatedCollabs = isCurrentlyIn
          ? d.activeCollaborators.filter(c => c.userId !== currentUserState.id)
          : [...d.activeCollaborators, { userId: currentUserState.id, name: currentUserState.name, editingSection: 'Active co-authoring session' }];

        portalStore.logAudit(isCurrentlyIn ? 'document_left' : 'document_coauthoring_joined', d.name, 'blue');
        return {
          ...d,
          activeCollaborators: updatedCollabs,
          isLockedForEditing: !isCurrentlyIn && updatedCollabs.length > 1,
        };
      }
      return d;
    });
    saveToStorage('sharepoint_docs', sharePointDocsState);
    notifyListeners();
  },

  // Notification Rules actions
  toggleRule: (ruleId: string) => {
    teamsRulesState = teamsRulesState.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    saveToStorage('teams_rules', teamsRulesState);
    notifyListeners();
  },

  updateRuleWebhook: (ruleId: string, webhookUrl: string) => {
    teamsRulesState = teamsRulesState.map(r => r.id === ruleId ? { ...r, webhookUrl } : r);
    saveToStorage('teams_rules', teamsRulesState);
    notifyListeners();
  },

  updateRuleTriggered: (ruleId: string) => {
    teamsRulesState = teamsRulesState.map(r => r.id === ruleId ? { ...r, lastTriggered: new Date().toISOString() } : r);
    saveToStorage('teams_rules', teamsRulesState);
    notifyListeners();
  },

  // Projects actions
  addProject: (projData: Omit<Project, 'id' | 'leadId' | 'leadName' | 'activeTasksCount'>) => {
    const newProject: Project = {
      ...projData,
      id: `proj-${Date.now()}`,
      leadId: currentUserState.id,
      leadName: currentUserState.name,
      activeTasksCount: 0,
    };
    projectsState = [newProject, ...projectsState];
    saveToStorage('projects', projectsState);
    portalStore.logAudit('project_created', newProject.name, 'teal');
    notifyListeners();
    return newProject;
  },

  // Audit Logs
  logAudit: (eventType: string, targetName: string, badgeColor: AuditEvent['badgeColor']) => {
    const newLog: AuditEvent = {
      id: `aud-${Date.now()}`,
      actorName: currentUserState.name,
      actorEmail: currentUserState.email,
      eventType,
      targetName,
      timestamp: new Date().toISOString(),
      badgeColor,
    };
    auditLogsState = [newLog, ...auditLogsState.slice(0, 49)];
    saveToStorage('audit_logs', auditLogsState);
    notifyListeners();
  },

  // User Status
  updateUserStatus: (arg1: string | UserPresenceStatus, arg2?: UserPresenceStatus) => {
    const status: UserPresenceStatus = (arg2 || arg1) as UserPresenceStatus;
    currentUserState = { ...currentUserState, status };
    staffState = staffState.map(s => s.id === currentUserState.id ? { ...s, status } : s);
    saveToStorage('current_user', currentUserState);
    saveToStorage('staff', staffState);
    portalStore.logAudit('status_changed', `Changed status to ${status}`, 'teal');
    notifyListeners();
  },

  // Staff & User Management actions (Admin & User)
  addStaffMember: (userData: Omit<StaffUser, 'id' | 'activityScore' | 'tasksCount' | 'lastActive'>) => {
    const newMember: StaffUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      activityScore: 90,
      tasksCount: 0,
      lastActive: 'Just now',
    };
    staffState = [newMember, ...staffState];
    saveToStorage('staff', staffState);

    // set default password for new user
    const passwords = loadFromStorage<Record<string, string>>('user_passwords', { 'usr-rija': 'Wipahs@2026' });
    passwords[newMember.id] = 'Wipahs@2026';
    saveToStorage('user_passwords', passwords);

    portalStore.logAudit('user_created', `Added new team member: ${newMember.name} (${newMember.role})`, 'teal');
    notifyListeners();
    return newMember;
  },

  updateStaffMember: (id: string, updates: Partial<StaffUser>) => {
    staffState = staffState.map(s => s.id === id ? { ...s, ...updates } : s);
    if (currentUserState.id === id) {
      currentUserState = { ...currentUserState, ...updates };
      saveToStorage('current_user', currentUserState);
    }
    saveToStorage('staff', staffState);
    const target = staffState.find(s => s.id === id);
    portalStore.logAudit('user_updated', `Updated user record for ${target?.name || id}`, 'blue');
    notifyListeners();
  },

  removeStaffMember: (id: string) => {
    const target = staffState.find(s => s.id === id);
    staffState = staffState.filter(s => s.id !== id);
    saveToStorage('staff', staffState);
    portalStore.logAudit('user_removed', `Removed staff user: ${target?.name || id}`, 'amber');
    notifyListeners();
  },

  resetUserPassword: (id: string, customPass?: string) => {
    const target = staffState.find(s => s.id === id);
    const temp = customPass || `Wipahs#${Math.floor(1000 + Math.random() * 9000)}!`;
    const passwords = loadFromStorage<Record<string, string>>('user_passwords', { 'usr-rija': 'Wipahs@2026' });
    passwords[id] = temp;
    saveToStorage('user_passwords', passwords);
    portalStore.logAudit('password_reset_admin', `Admin reset password for ${target?.name || id}`, 'purple');
    notifyListeners();
    return temp;
  },

  changeCurrentUserPassword: (currentPassword: string, newPassword: string): { success: boolean; message: string } => {
    const passwords = loadFromStorage<Record<string, string>>('user_passwords', { 'usr-rija': 'Wipahs@2026' });
    const currentStored = passwords[currentUserState.id] || 'Wipahs@2026';
    if (currentPassword !== currentStored) {
      return { success: false, message: 'Current password does not match our records.' };
    }
    if (newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters.' };
    }
    passwords[currentUserState.id] = newPassword;
    saveToStorage('user_passwords', passwords);
    portalStore.logAudit('password_changed', `${currentUserState.name} updated account password`, 'emerald');
    notifyListeners();
    return { success: true, message: 'Password updated successfully!' };
  },

  updateCurrentUserProfile: (updates: Partial<StaffUser>) => {
    currentUserState = { ...currentUserState, ...updates };
    staffState = staffState.map(s => s.id === currentUserState.id ? { ...s, ...updates } : s);
    saveToStorage('current_user', currentUserState);
    saveToStorage('staff', staffState);
    portalStore.logAudit('profile_updated', `${currentUserState.name} updated profile details`, 'teal');
    notifyListeners();
  },

  // Department Management actions
  addDepartment: (deptData: Omit<DepartmentInfo, 'id' | 'staffCount' | 'activeProjectsCount' | 'openTasksCount'>) => {
    const newDept: DepartmentInfo = {
      ...deptData,
      id: `dept-${Date.now()}`,
      staffCount: staffState.filter(s => s.department === deptData.name).length,
      activeProjectsCount: projectsState.filter(p => p.department === deptData.name).length,
      openTasksCount: tasksState.filter(t => t.department === deptData.name && t.status !== 'Done').length,
    };
    departmentsState = [...departmentsState, newDept];
    saveToStorage('departments', departmentsState);
    portalStore.logAudit('department_created', `Added organizational department: ${newDept.name}`, 'teal');
    notifyListeners();
    return newDept;
  },

  updateDepartment: (id: string, updates: Partial<DepartmentInfo>) => {
    departmentsState = departmentsState.map(d => d.id === id ? { ...d, ...updates } : d);
    saveToStorage('departments', departmentsState);
    const target = departmentsState.find(d => d.id === id);
    portalStore.logAudit('department_updated', `Updated department: ${target?.name || id}`, 'blue');
    notifyListeners();
  },

  deleteDepartment: (id: string) => {
    const target = departmentsState.find(d => d.id === id);
    departmentsState = departmentsState.filter(d => d.id !== id);
    saveToStorage('departments', departmentsState);
    portalStore.logAudit('department_deleted', `Deleted department: ${target?.name || id}`, 'amber');
    notifyListeners();
  },

  // Roles & Permissions management
  updateRolePermission: (roleId: string, moduleName: string, permKey: 'view' | 'create' | 'edit' | 'approve', value: boolean) => {
    rolesState = rolesState.map(r => {
      if (r.id === roleId) {
        const updatedPerms = r.permissions.map(p => {
          if (p.module === moduleName) {
            return { ...p, [permKey]: value };
          }
          return p;
        });
        return { ...r, permissions: updatedPerms };
      }
      return r;
    });
    saveToStorage('roles', rolesState);
    const role = rolesState.find(r => r.id === roleId);
    portalStore.logAudit('role_permission_updated', `${role?.roleTitle || roleId}: updated ${moduleName} [${permKey}] to ${value ? 'Allowed' : 'Restricted'}`, 'blue');
    notifyListeners();
  },

  addRole: (roleData: Omit<RolePermission, 'id' | 'userCount'>) => {
    const newRole: RolePermission = {
      ...roleData,
      id: `role-${Date.now()}`,
      userCount: staffState.filter(s => s.role.toLowerCase() === roleData.roleTitle.toLowerCase()).length,
    };
    rolesState = [...rolesState, newRole];
    saveToStorage('roles', rolesState);
    portalStore.logAudit('role_created', `Created custom authorization role: ${newRole.roleTitle}`, 'teal');
    notifyListeners();
    return newRole;
  },

  updateRole: (id: string, updates: Partial<RolePermission>) => {
    rolesState = rolesState.map(r => r.id === id ? { ...r, ...updates } : r);
    saveToStorage('roles', rolesState);
    const target = rolesState.find(r => r.id === id);
    portalStore.logAudit('role_updated', `Updated role specifications for ${target?.roleTitle || id}`, 'blue');
    notifyListeners();
  },

  deleteRole: (id: string) => {
    const target = rolesState.find(r => r.id === id);
    rolesState = rolesState.filter(r => r.id !== id);
    saveToStorage('roles', rolesState);
    portalStore.logAudit('role_deleted', `Deleted role: ${target?.roleTitle || id}`, 'amber');
    notifyListeners();
  },

  // Decisions actions
  addDecision: (decisionData: Omit<Decision, 'id' | 'date'>) => {
    const newDecision: Decision = {
      ...decisionData,
      id: `dec-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    decisionsState = [newDecision, ...decisionsState];
    saveToStorage('decisions', decisionsState);
    portalStore.logAudit('decision_logged', newDecision.title, 'purple');
    notifyListeners();
  },

  updateDecisionStatus: (id: string, status: Decision['status']) => {
    decisionsState = decisionsState.map(d => d.id === id ? { ...d, status } : d);
    saveToStorage('decisions', decisionsState);
    portalStore.logAudit('decision_status_updated', `Decision status updated to ${status}`, 'blue');
    notifyListeners();
  },

  // Approvals actions
  addApproval: (approvalData: Omit<Approval, 'id' | 'requestedDate' | 'status'>) => {
    const newApproval: Approval = {
      ...approvalData,
      id: `appr-${Date.now()}`,
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };
    approvalsState = [newApproval, ...approvalsState];
    saveToStorage('approvals', approvalsState);
    portalStore.logAudit('approval_requested', newApproval.title, 'amber');
    notifyListeners();
  },

  approveApproval: (id: string, notes?: string) => {
    approvalsState = approvalsState.map(a => 
      a.id === id ? { 
        ...a, 
        status: 'Approved', 
        approvedBy: currentUserState.name, 
        approvedDate: new Date().toISOString().split('T')[0],
        notes: notes || a.notes
      } : a
    );
    saveToStorage('approvals', approvalsState);
    const target = approvalsState.find(a => a.id === id);
    portalStore.logAudit('approval_granted', `Approved request: ${target?.title || id}`, 'emerald');
    notifyListeners();
  },

  rejectApproval: (id: string, notes?: string) => {
    approvalsState = approvalsState.map(a => 
      a.id === id ? { 
        ...a, 
        status: 'Rejected', 
        approvedBy: currentUserState.name, 
        approvedDate: new Date().toISOString().split('T')[0],
        notes: notes || a.notes
      } : a
    );
    saveToStorage('approvals', approvalsState);
    const target = approvalsState.find(a => a.id === id);
    portalStore.logAudit('approval_rejected', `Rejected request: ${target?.title || id}`, 'amber');
    notifyListeners();
  },

  getState: () => ({
    tasks: tasksState,
    notices: noticesState,
    projects: projectsState,
    meetings: meetingsState,
    staff: staffState,
    sharePointDocs: sharePointDocsState,
    teamsRules: teamsRulesState,
    auditLogs: auditLogsState,
    currentUser: currentUserState,
    decisions: decisionsState,
    approvals: approvalsState,
    departments: departmentsState,
    roles: rolesState,
  }),

  // Reset to default data
  resetAllData: () => {
    localStorage.clear();
    tasksState = INITIAL_TASKS;
    noticesState = INITIAL_NOTICES;
    projectsState = INITIAL_PROJECTS;
    meetingsState = INITIAL_MEETINGS;
    staffState = INITIAL_STAFF;
    sharePointDocsState = INITIAL_SHAREPOINT_DOCS;
    teamsRulesState = INITIAL_TEAMS_RULES;
    auditLogsState = INITIAL_AUDIT_LOGS;
    currentUserState = CURRENT_USER;
    decisionsState = INITIAL_DECISIONS;
    approvalsState = INITIAL_APPROVALS;
    departmentsState = INITIAL_DEPARTMENTS;
    rolesState = INITIAL_ROLES;
    notifyListeners();
  },
};

/**
 * React hook to listen to store updates
 */
export function usePortalStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    tasks: portalStore.getTasks(),
    notices: portalStore.getNotices(),
    projects: portalStore.getProjects(),
    meetings: portalStore.getMeetings(),
    staff: portalStore.getStaff(),
    sharePointDocs: portalStore.getSharePointDocs(),
    teamsRules: portalStore.getTeamsRules(),
    auditLogs: portalStore.getAuditLogs(),
    currentUser: portalStore.getCurrentUser(),
    decisions: portalStore.getDecisions(),
    approvals: portalStore.getApprovals(),
    departments: portalStore.getDepartments(),
    roles: portalStore.getRoles(),
    conversations: portalStore.getConversations(),
    messages: portalStore.getMessages(),
    actions: portalStore,
  };
}

