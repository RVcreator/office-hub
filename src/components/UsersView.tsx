import React, { useState } from 'react';
import {
  Users,
  Mail,
  Phone,
  MessageSquare,
  CheckSquare,
  Search,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  X,
  CheckCircle2,
  Copy,
  AlertCircle
} from 'lucide-react';
import { Department, StaffUser, UserPresenceStatus } from '../types';
import { usePortalStore } from '../services/store';

interface UsersViewProps {
  onAssignTaskToUser?: (user: StaffUser) => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ onAssignTaskToUser }) => {
  const { staff, departments, actions, currentUser } = usePortalStore();

  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<UserPresenceStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [passwordResetInfo, setPasswordResetInfo] = useState<{ user: StaffUser; tempPass: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<StaffUser | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: 'Executive & Admin' as Department,
    phone: '+255 22 286 1234',
    status: 'Online' as UserPresenceStatus,
    teamsHandle: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  const departmentOptions: Department[] = departments.map(d => d.name);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: 'Executive & Admin',
      phone: '+255 22 286 1234',
      status: 'Online',
      teamsHandle: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: StaffUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      status: user.status,
      teamsHandle: user.teamsHandle || '',
      avatar: user.avatar
    });
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.role.trim()) {
      alert('Please fill in all required fields (Name, Email, Role)');
      return;
    }

    if (editingUser) {
      actions.updateStaffMember(editingUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role.trim(),
        department: formData.department,
        phone: formData.phone.trim(),
        status: formData.status,
        teamsHandle: formData.teamsHandle.trim() || undefined,
        avatar: formData.avatar
      });
      setEditingUser(null);
    } else {
      actions.addStaffMember({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role.trim(),
        department: formData.department,
        phone: formData.phone.trim(),
        status: formData.status,
        teamsHandle: formData.teamsHandle.trim() || undefined,
        avatar: formData.avatar
      });
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleDeleteUser = (user: StaffUser) => {
    if (user.id === currentUser.id) {
      alert('You cannot delete your own logged-in account.');
      return;
    }
    actions.removeStaffMember(user.id);
    setDeleteConfirmUser(null);
  };

  const handleResetPassword = (user: StaffUser) => {
    const temp = actions.resetUserPassword(user.id);
    setPasswordResetInfo({ user, tempPass: temp });
    setCopiedPass(false);
  };

  const filteredStaff = staff.filter(user => {
    if (departmentFilter !== 'All' && user.department !== departmentFilter) return false;
    if (statusFilter !== 'All' && user.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: UserPresenceStatus) => {
    switch (status) {
      case 'Online':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
      case 'In Teams Meeting':
        return { bg: 'bg-purple-50 text-purple-800 border-purple-200', dot: 'bg-purple-500 animate-pulse' };
      case 'Busy':
        return { bg: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' };
      case 'Away':
        return { bg: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
      case 'Offline':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-md bg-[#00ad1d]/10 text-[#008f18]">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">User Account Administration</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              {staff.length} Team Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision staff profiles, manage department assignments, update permissions, and issue password credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, role, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as any)}
            className="py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
          >
            <option value="All">All Departments</option>
            {departmentOptions.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
          >
            <option value="All">All Statuses</option>
            <option value="Online">Online</option>
            <option value="In Teams Meeting">In Teams Meeting</option>
            <option value="Busy">Busy</option>
            <option value="Away">Away</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500">
          Showing <b>{filteredStaff.length}</b> of {staff.length} staff members
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map(member => {
          const statusBadge = getStatusBadge(member.status);
          const teamsChatUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(member.email)}`;
          const isMe = member.id === currentUser.id;

          return (
            <div
              key={member.id}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <span
                        className={`w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 ring-2 ring-white ${statusBadge.dot}`}
                      ></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-[#19232d]">{member.name}</h3>
                        {isMe && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">You</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{member.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}
                  >
                    {member.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-800">{member.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Email:</span>
                    <a
                      href={`mailto:${member.email}`}
                      className="font-medium text-slate-700 hover:text-[#00ad1d] truncate max-w-[170px]"
                    >
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Phone / Ext:</span>
                    <span className="font-medium text-slate-700">{member.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action Controls for Admin */}
              <div className="pt-2.5 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between gap-1.5 text-xs">
                  <a
                    href={teamsChatUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded font-medium transition"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Teams</span>
                  </a>

                  {onAssignTaskToUser && (
                    <button
                      onClick={() => onAssignTaskToUser(member)}
                      className="inline-flex items-center gap-1 text-[11px] text-[#008f18] hover:bg-emerald-50 px-2 py-1 rounded font-medium border border-[#00ad1d]/30 transition"
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span>Task</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleResetPassword(member)}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded font-medium transition"
                    title="Reset Password"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Password</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                    title="Edit Member"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {!isMe && (
                    <button
                      onClick={() => setDeleteConfirmUser(member)}
                      className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                      title="Remove Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Member Modal */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-[#00ad1d]/10 text-[#008f18]">
                  <Users className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {editingUser ? 'Edit Team Member Profile' : 'Add New Member to WIPAHS'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Hassan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@wipahs.org"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Role / Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operations Coordinator"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  >
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Phone / Extension
                  </label>
                  <input
                    type="text"
                    placeholder="+255 22 286 1234"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Presence Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserPresenceStatus })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  >
                    <option value="Online">Online</option>
                    <option value="In Teams Meeting">In Teams Meeting</option>
                    <option value="Busy">Busy</option>
                    <option value="Away">Away</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Microsoft Teams User Handle
                </label>
                <input
                  type="text"
                  placeholder="@user or user.teams"
                  value={formData.teamsHandle}
                  onChange={(e) => setFormData({ ...formData, teamsHandle: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                />
              </div>

              {!editingUser && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600">
                  <span className="font-semibold">Security Note:</span> A temporary initial password (<code className="bg-slate-200 px-1 rounded">Wipahs@2026</code>) will be generated for the new member. They can change it via their profile settings upon logging in.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-3.5 py-1.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-md text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00ad1d] hover:bg-[#009218] text-white font-semibold rounded-md text-xs shadow-xs"
                >
                  {editingUser ? 'Update Member' : 'Create Member Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordResetInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-amber-100 text-amber-800">
                  <KeyRound className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">Password Reset Successful</h2>
              </div>
              <button
                onClick={() => setPasswordResetInfo(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                A temporary password has been generated for <b>{passwordResetInfo.user.name}</b> ({passwordResetInfo.user.email}).
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                <code className="text-sm font-bold text-slate-800 font-mono tracking-wide">
                  {passwordResetInfo.tempPass}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(passwordResetInfo.tempPass);
                    setCopiedPass(true);
                    setTimeout(() => setCopiedPass(false), 2000);
                  }}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded shadow-2xs font-medium"
                >
                  {copiedPass ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This administrative credential reset has been recorded in the immutable System Audit Log. The staff member can change it anytime in their settings.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setPasswordResetInfo(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md text-xs shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base pb-2 border-b border-slate-100">
              <Trash2 className="w-5 h-5" />
              <span>Confirm Member Removal</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <b>{deleteConfirmUser.name}</b> ({deleteConfirmUser.role}, {deleteConfirmUser.department}) from the active staff directory?
            </p>

            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-[11px] text-rose-800">
              Their past audit trail logs and completed historical task records will be preserved for organizational accountability.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-3.5 py-1.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-md text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md text-xs shadow-xs"
              >
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
