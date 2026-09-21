import React, { useState } from 'react';
import {
  Users,
  Mail,
  Phone,
  Video,
  MessageSquare,
  CheckSquare,
  Search,
  Filter,
  ShieldCheck,
  ExternalLink,
  Award
} from 'lucide-react';
import { Department, StaffUser, UserPresenceStatus } from '../types';
import { usePortalStore } from '../services/store';

export const StaffDirectoryView: React.FC<{ onAssignTaskToUser: (user: StaffUser) => void }> = ({
  onAssignTaskToUser
}) => {
  const { staff, departments } = usePortalStore();

  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<UserPresenceStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#19232d]">Authorized Staff Directory</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              {staff.length} staff
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time presence tracking, departmental roles, and instant Microsoft Teams chat routing.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-[#00ad1d]" />
          <span className="text-slate-600 font-medium">Active Directory Synced</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-md border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name or role..."
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
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
          >
            <option value="All">All Presence Statuses</option>
            <option value="Online">Online</option>
            <option value="In Teams Meeting">In Teams Meeting</option>
            <option value="Busy">Busy</option>
            <option value="Away">Away</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500">
          Available: <b className="text-emerald-700">{staff.filter(s => s.status === 'Online' || s.status === 'In Teams Meeting').length}</b> online
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map(member => {
          const statusBadge = getStatusBadge(member.status);
          const teamsChatUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(member.email)}`;

          return (
            <div
              key={member.id}
              className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between space-y-3"
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
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">{member.name}</h3>
                      <p className="text-xs text-slate-500">{member.role}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{member.department}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border shrink-0 ${statusBadge.bg}`}
                  >
                    {member.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                {/* Operational Activity stats */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-2 rounded-md text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Activity Score</span>
                    <b className="text-slate-900 font-bold">{member.activityScore} pts</b>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Assigned Tasks</span>
                    <b className="text-[#008f18] font-bold">{member.tasksCount} active</b>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs">
                <a
                  href={teamsChatUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-3 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Teams Chat</span>
                </a>

                <button
                  onClick={() => onAssignTaskToUser(member)}
                  className="py-1.5 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition"
                  title="Assign a task to this staff member"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
                  <span>Assign</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
