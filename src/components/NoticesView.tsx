import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  Pin,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Download,
  Share2,
  Send,
  Search,
  Filter
} from 'lucide-react';
import { Department, Notice } from '../types';
import { usePortalStore } from '../services/store';

export const NoticesView: React.FC<{ onOpenNewNoticeModal: () => void }> = ({ onOpenNewNoticeModal }) => {
  const { notices, currentUser, actions } = usePortalStore();

  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotices = notices.filter(n => {
    if (departmentFilter !== 'All' && n.department !== departmentFilter && n.department !== 'All Departments') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.authorName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#19232d]">Official Notices & Circulars</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              {notices.length} circulars
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Departmental announcements, operational circulars, and executive memos with automatic Teams broadcast.
          </p>
        </div>

        <button
          onClick={onOpenNewNoticeModal}
          className="px-3.5 py-2 rounded-md bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Post Circular</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-md border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Department:</span>
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
        </div>

        <div className="relative min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
          />
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.map((notice) => {
          const isAcknowledged = notice.acknowledgedBy.includes(currentUser.name);

          return (
            <div
              key={notice.id}
              className={`bg-white rounded-md border p-4 shadow-2xs transition ${
                notice.priority === 'Urgent' ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {notice.pinned && (
                    <span className="p-1 rounded bg-amber-100 text-amber-800" title="Pinned Notice">
                      <Pin className="w-3 h-3 fill-amber-700" />
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      notice.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {notice.priority}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{notice.department}</span>
                </div>

                <span className="text-xs text-slate-400">{notice.date}</span>
              </div>

              <h3 className="font-bold text-base text-slate-900 mt-2">{notice.title}</h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-line">{notice.content}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-500">
                  Issued by <span className="font-medium text-slate-700">{notice.authorName}</span> ({notice.authorRole})
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => actions.acknowledgeNotice(notice.id, currentUser.name)}
                    className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                      isAcknowledged
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAcknowledged ? 'Acknowledged' : 'Mark as Read'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    {notice.acknowledgedBy.length} staff read
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
