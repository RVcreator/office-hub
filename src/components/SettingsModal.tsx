import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Zap,
  RefreshCw,
  Database,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  KeyRound,
  User,
  Eye,
  EyeOff,
  Cloud,
  Check,
  Lock
} from 'lucide-react';
import { usePortalStore } from '../services/store';
import { Department } from '../types';

export type SettingsTabType = 'password' | 'profile' | 'integrations' | 'admin';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTabType;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'password'
}) => {
  const { actions, currentUser, departments } = usePortalStore();

  const [activeTab, setActiveTab] = useState<SettingsTabType>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    department: currentUser.department,
    phone: currentUser.phone,
    avatar: currentUser.avatar,
    teamsHandle: currentUser.teamsHandle || ''
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Integrations state
  const [tenantId, setTenantId] = useState('wipahs-org-tenant-id');
  const [sharePointUrl, setSharePointUrl] = useState('https://wipahs.sharepoint.com/sites/operations');
  const [supabaseProject, setSupabaseProject] = useState('wxjjrfhahxqhbixaviwm');
  const [integrationSaved, setIntegrationSaved] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword) {
      setPasswordStatus({ type: 'error', message: 'Please enter your current password.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    const res = actions.changeCurrentUserPassword(currentPassword, newPassword);
    if (res.success) {
      setPasswordStatus({ type: 'success', message: res.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus({ type: 'error', message: res.message });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    actions.updateCurrentUserProfile({
      name: profileData.name.trim(),
      role: profileData.role.trim(),
      department: profileData.department,
      phone: profileData.phone.trim(),
      avatar: profileData.avatar.trim(),
      teamsHandle: profileData.teamsHandle.trim() || undefined
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    actions.logAudit('settings_updated', 'Updated Microsoft 365 and cloud integration endpoints', 'green');
    setIntegrationSaved(true);
    setTimeout(() => setIntegrationSaved(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Reset all tasks, notices, meetings, users, departments, and roles to standard default WIPAHS sample data?')) {
      actions.resetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-0 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-md bg-[#00ad1d]/10 text-[#008f18]">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Settings & Account Center</h2>
              <p className="text-xs text-slate-500">Security credentials, personal profile, and portal governance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-200 bg-white px-4 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'password'
                ? 'border-[#00ad1d] text-[#008f18]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'profile'
                ? 'border-[#00ad1d] text-[#008f18]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'integrations'
                ? 'border-[#00ad1d] text-[#008f18]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Microsoft 365 & Cloud</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'admin'
                ? 'border-[#00ad1d] text-[#008f18]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>System Maintenance</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs">
          {/* 1. CHANGE PASSWORD TAB */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-800">Security Requirement</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Passwords must be at least 8 characters. Default demo password is <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">Wipahs@2026</code>.
                </p>
              </div>

              {passwordStatus && (
                <div
                  className={`p-3 rounded-md border flex items-start gap-2 ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="Enter new password (min. 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password to confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00ad1d] hover:bg-[#009218] text-white font-semibold rounded-md text-xs shadow-xs transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              {profileSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your profile details have been saved successfully!</span>
                </div>
              )}

              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{currentUser.name}</h3>
                  <p className="text-slate-500">{currentUser.email}</p>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold mt-1 inline-block">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Job Title / Role</label>
                  <input
                    type="text"
                    required
                    value={profileData.role}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value as Department })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone / Ext</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={profileData.avatar}
                    onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Microsoft Teams Handle</label>
                  <input
                    type="text"
                    placeholder="@handle"
                    value={profileData.teamsHandle}
                    onChange={(e) => setProfileData({ ...profileData, teamsHandle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00ad1d] hover:bg-[#009218] text-white font-semibold rounded-md text-xs shadow-xs transition"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* 3. INTEGRATIONS TAB */}
          {activeTab === 'integrations' && (
            <form onSubmit={handleSaveIntegrations} className="space-y-4 max-w-lg">
              {integrationSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Integration configuration updated!</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Microsoft 365 Tenant Domain / ID
                </label>
                <input
                  type="text"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Used for MS Teams meeting context links and Azure AD SSO.
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  SharePoint Online Root Site URL
                </label>
                <input
                  type="text"
                  value={sharePointUrl}
                  onChange={(e) => setSharePointUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Document library target for WIPAHS operations and department binders.
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00ad1d] hover:bg-[#009218] text-white font-semibold rounded-md text-xs shadow-xs transition"
                >
                  Save Integrations
                </button>
              </div>
            </form>
          )}

          {/* 4. ADMIN TAB */}
          {activeTab === 'admin' && (
            <div className="space-y-4 max-w-lg">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>Data Store Status</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  All operational records, user accounts, and department permissions are synchronized locally with instant cloud-ready fallback.
                </p>
              </div>

              <div className="p-4 border border-rose-200 bg-rose-50/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Administrative Emergency Data Reset</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Reset the portal back to authentic WIPAHS baseline data. This resets all added tasks, notices, staff members, and custom role permissions.
                </p>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shadow-xs transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Portal Data to Defaults</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
