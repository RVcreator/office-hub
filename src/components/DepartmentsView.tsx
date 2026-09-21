import React, { useState } from 'react';
import {
  Building2,
  Users,
  FolderGit2,
  CheckSquare,
  DollarSign,
  Search,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';
import { usePortalStore } from '../services/store';
import { Department, DepartmentInfo } from '../types';

interface DepartmentsViewProps {
  onSelectDepartmentTasks?: (dept: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ onSelectDepartmentTasks }) => {
  const { departments, tasks, projects, staff, actions } = usePortalStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentInfo | null>(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentInfo | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    headName: '',
    headRole: '',
    headAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    budget: '$100,000',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      headName: '',
      headRole: '',
      headAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      budget: '$100,000',
      description: ''
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentInfo) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      headName: dept.headName,
      headRole: dept.headRole,
      headAvatar: dept.headAvatar,
      budget: dept.budget,
      description: dept.description
    });
  };

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.headName.trim()) {
      alert('Please provide a department name and head of department.');
      return;
    }

    if (editingDept) {
      actions.updateDepartment(editingDept.id, {
        name: formData.name.trim() as Department,
        headName: formData.headName.trim(),
        headRole: formData.headRole.trim() || 'Department Head',
        headAvatar: formData.headAvatar,
        budget: formData.budget.trim(),
        description: formData.description.trim()
      });
      setEditingDept(null);
    } else {
      actions.addDepartment({
        name: formData.name.trim() as Department,
        headName: formData.headName.trim(),
        headRole: formData.headRole.trim() || 'Department Head',
        headAvatar: formData.headAvatar,
        budget: formData.budget.trim() || '$100,000',
        description: formData.description.trim() || 'Operational unit coordinating community and institutional programs.'
      });
      setIsAddModalOpen(false);
    }
    resetForm();
  };

  const handleDeleteDepartment = (dept: DepartmentInfo) => {
    actions.deleteDepartment(dept.id);
    setDeleteConfirmDept(null);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-md bg-[#00ad1d]/10 text-[#008f18]">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Departments Directory</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              {departments.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Overview of WIPAHS organizational units, departmental heads, operational capacity, and resource budgets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-semibold rounded-md shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search departments, leads, mandate..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00ad1d] focus:border-[#00ad1d]"
          />
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepartments.map((dept) => {
          const deptTasks = tasks.filter(t => t.department === dept.name);
          const deptProjects = projects.filter(p => p.department === dept.name);
          const deptStaff = staff.filter(s => s.department === dept.name);

          return (
            <div
              key={dept.id}
              className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-md bg-slate-100 text-slate-700">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {dept.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Budget: <strong className="text-emerald-700 font-semibold">{dept.budget}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                      title="Edit Department"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmDept(dept)}
                      className="p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed min-h-10">
                  {dept.description}
                </p>

                {/* Lead Profile */}
                <div className="p-3 bg-slate-50 rounded-md border border-slate-100 flex items-center gap-3">
                  <img
                    src={dept.headAvatar}
                    alt={dept.headName}
                    className="w-9 h-9 rounded-full object-cover border border-white shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{dept.headName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{dept.headRole}</p>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Staff</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {deptStaff.length || dept.staffCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Projects</p>
                    <p className="text-sm font-bold text-purple-700 mt-0.5">
                      {deptProjects.length || dept.activeProjectsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Tasks</p>
                    <p className="text-sm font-bold text-blue-700 mt-0.5">
                      {deptTasks.length || dept.openTasksCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-3 mt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Active Operations
                </span>
                {onSelectDepartmentTasks && (
                  <button
                    onClick={() => onSelectDepartmentTasks(dept.name)}
                    className="text-xs font-medium text-[#00ad1d] hover:text-[#008f18] inline-flex items-center gap-1"
                  >
                    <span>View Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {(isAddModalOpen || editingDept) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-[#00ad1d]/10 text-[#008f18]">
                  <Building2 className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {editingDept ? 'Edit Organizational Department' : 'Add New Department'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingDept(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Humanitarian Logistics & Aid"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Head of Department <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Fatma Al-Husseini"
                    value={formData.headName}
                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Head Role / Designation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Medical Director & Chief Surgeon"
                    value={formData.headRole}
                    onChange={(e) => setFormData({ ...formData, headRole: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Annual / Operational Budget
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $180,000 or TZS 420,000,000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Head Avatar Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.headAvatar}
                    onChange={(e) => setFormData({ ...formData, headAvatar: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Department Mandate & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the department's core responsibilities and program oversight..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingDept(null);
                  }}
                  className="px-3.5 py-1.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-md text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00ad1d] hover:bg-[#009218] text-white font-semibold rounded-md text-xs shadow-xs"
                >
                  {editingDept ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base pb-2 border-b border-slate-100">
              <Trash2 className="w-5 h-5" />
              <span>Confirm Department Deletion</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove the <b>{deleteConfirmDept.name}</b> department?
            </p>

            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-[11px] text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                Staff members and projects currently associated with this unit will remain in the database.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirmDept(null)}
                className="px-3.5 py-1.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-md text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDepartment(deleteConfirmDept)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md text-xs shadow-xs"
              >
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
