import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Users,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Department, Project } from '../types';
import { usePortalStore } from '../services/store';

export const ProjectsView: React.FC<{ onOpenNewProjectModal: () => void }> = ({ onOpenNewProjectModal }) => {
  const { projects, actions } = usePortalStore();

  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p => {
    if (departmentFilter !== 'All' && p.department !== departmentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-md border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#19232d]">Projects & Strategic Workflows</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              {projects.length} initiatives
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-departmental welfare, school development, and medical infrastructure projects connected with SharePoint.
          </p>
        </div>

        <button
          onClick={onOpenNewProjectModal}
          className="px-3.5 py-2 rounded-md bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition shrink-0 self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-md border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as any)}
            className="py-1.5 px-2.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
          >
            <option value="All">All Departments</option>
            <option value="Executive & Admin">Executive & Admin</option>
            <option value="Education & Schools">Education & Schools</option>
            <option value="Health & Medical">Health & Medical</option>
            <option value="Relief & Social Welfare">Relief & Social Welfare</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
            <option value="IT & Operations">IT & Operations</option>
          </select>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProjects.map(proj => (
          <div
            key={proj.id}
            className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {proj.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{proj.department}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {proj.name}
                </h3>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                proj.status === 'On Track' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                proj.status === 'At Risk' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {proj.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {proj.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Milestone Execution</span>
                <span>{proj.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00ad1d] transition-all duration-500"
                  style={{ width: `${proj.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-100 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Budget</p>
                <p className="font-bold text-slate-900 mt-0.5">{proj.budget || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Spent</p>
                <p className="font-bold text-slate-900 mt-0.5">{proj.spent || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Target Date</p>
                <p className="font-bold text-slate-900 mt-0.5">{proj.targetDate}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Lead: <b className="text-slate-800">{proj.leadName}</b> ({proj.membersCount} members)</span>

              <a
                href={proj.sharePointFolderUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-1 transition text-xs"
              >
                <span>SharePoint Workspace</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
