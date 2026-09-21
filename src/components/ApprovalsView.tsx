import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { usePortalStore } from '../services/store';
import { Approval, Department } from '../types';

export const ApprovalsView: React.FC = () => {
  const { approvals, projects, actions, currentUser } = usePortalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New approval state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<Approval['type']>('Budget Allocation');
  const [newDepartment, setNewDepartment] = useState<Department>('Relief & Social Welfare');
  const [newProjectName, setNewProjectName] = useState('');
  const [newAmount, setNewAmount] = useState('$5,000');
  const [newNotes, setNewNotes] = useState('');

  const filteredApprovals = approvals.filter(appr => {
    const matchesSearch = appr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appr.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appr.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || appr.status === selectedStatus;
    const matchesType = selectedType === 'All' || appr.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = approvals.filter(a => a.status === 'Pending').length;
  const approvedCount = approvals.filter(a => a.status === 'Approved').length;

  const handleCreateApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    actions.addApproval({
      title: newTitle.trim(),
      description: newDescription.trim() || 'Formal operational approval requested for procurement/sign-off.',
      type: newType,
      department: newDepartment,
      projectName: newProjectName.trim() || undefined,
      requestedBy: currentUser.name,
      requestedByAvatar: currentUser.avatar,
      amount: newAmount.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewDescription('');
    setNewAmount('$5,000');
    setNewNotes('');
    setIsNewModalOpen(false);
  };

  const getStatusBadge = (status: Approval['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'Under Review':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  };

  const getTypeBadge = (type: Approval['type']) => {
    switch (type) {
      case 'Budget Allocation':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Procurement':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Project Milestone':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Contract':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-md bg-[#00ad1d]/10 text-[#008f18]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project & Operational Approvals</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review, authorize, and track milestone disbursements, vendor contracts, and departmental purchase orders.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-medium rounded-md shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Approval Request</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting executive sign-off</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Approved Requests</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Disbursements cleared</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Volume</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{approvals.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All operational items</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Active Projects</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{projects.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Linked project portfolios</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search approval requests..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d] focus:border-[#00ad1d]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Under Review">Under Review</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
          >
            <option value="All">All Types</option>
            <option value="Budget Allocation">Budget Allocation</option>
            <option value="Procurement">Procurement</option>
            <option value="Project Milestone">Project Milestone</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {filteredApprovals.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
            <FileCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-700">No approval requests found.</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your search or create a new request.</p>
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="bg-white p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition shadow-xs"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${getStatusBadge(approval.status)}`}>
                      {approval.status}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${getTypeBadge(approval.type)}`}>
                      {approval.type}
                    </span>
                    {approval.amount && (
                      <span className="text-xs font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {approval.amount}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {approval.department}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    {approval.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {approval.description}
                  </p>

                  {approval.projectName && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Project: <span className="text-slate-700">{approval.projectName}</span>
                    </p>
                  )}

                  {approval.notes && (
                    <div className="p-2.5 bg-slate-50 rounded-md text-[11px] text-slate-600 border border-slate-100">
                      <strong>Audit Note:</strong> {approval.notes}
                    </div>
                  )}
                </div>

                {/* Right: Actions and Request Details */}
                <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-xs">
                    <img
                      src={approval.requestedByAvatar || currentUser.avatar}
                      alt={approval.requestedBy}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div className="text-right">
                      <p className="font-medium text-slate-800 text-[11px]">{approval.requestedBy}</p>
                      <p className="text-[10px] text-slate-400">{approval.requestedDate}</p>
                    </div>
                  </div>

                  {approval.status === 'Pending' ? (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => actions.rejectApproval(approval.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-md border border-rose-200 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => actions.approveApproval(approval.id)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-medium rounded-md shadow-xs transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-[11px] text-slate-500">
                      {approval.approvedBy && (
                        <p>
                          Resolved by <strong className="text-slate-700">{approval.approvedBy}</strong>
                          {approval.approvedDate && <span> on {approval.approvedDate}</span>}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Approval Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Submit Approval Request</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApproval} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Request Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Science Lab Physics Optics Sets Procurement"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Detailed Justification</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Specify items, contractor terms, vendor quotes, and budget line item..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Approval Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as Approval['type'])}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  >
                    <option value="Budget Allocation">Budget Allocation</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Project Milestone">Project Milestone</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Amount / Value</label>
                  <input
                    type="text"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="e.g. $12,500"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as Department)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
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
                  <label className="block text-slate-700 font-medium mb-1">Linked Project (Optional)</label>
                  <select
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  >
                    <option value="">-- General Operational --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Supporting Notes / Quote Reference</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Approved in board minutes August 2026; 3 comparative vendor bids attached."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00ad1d] hover:bg-[#009218] text-white font-medium rounded-md shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
