import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  ExternalLink,
  Users,
  ShieldCheck,
  RefreshCw,
  Folder,
  FolderOpen,
  Eye,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  Download,
  AlertCircle,
  Plus
} from 'lucide-react';
import { SharePointDocument } from '../types';
import { usePortalStore } from '../services/store';

export const SharePointView: React.FC<{ onOpenUploadModal: () => void }> = ({ onOpenUploadModal }) => {
  const { sharePointDocs, currentUser, actions } = usePortalStore();

  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDocPreview, setActiveDocPreview] = useState<SharePointDocument | null>(null);
  const [syncingDocId, setSyncingDocId] = useState<string | null>(null);

  const folders = ['All', 'Operations', 'Policies & Forms', 'Finance', 'Board Minutes', 'Projects'];

  const filteredDocs = sharePointDocs.filter(doc => {
    if (selectedFolder !== 'All' && doc.folder !== selectedFolder) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return doc.name.toLowerCase().includes(q) || (doc.contentSummary && doc.contentSummary.toLowerCase().includes(q));
    }
    return true;
  });

  const handleSyncDoc = (docId: string) => {
    setSyncingDocId(docId);
    setTimeout(() => {
      actions.syncSharePointDocument(docId);
      setSyncingDocId(null);
    }, 500);
  };

  const getFileBadgeColor = (type: SharePointDocument['fileType']) => {
    switch (type) {
      case 'docx':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'xlsx':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pptx':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pdf':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Authentic Header */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Document Collaboration
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              SharePoint Online
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#19232d]">
            SharePoint Document Library
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized document repository with cloud co-authoring and Office 365 integration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              sharePointDocs.forEach(d => handleSyncDoc(d.id));
            }}
            className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync All</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            className="px-3.5 py-1.5 rounded-md bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Folders & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-md border border-slate-200 text-xs">
        {/* Folders tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                selectedFolder === folder
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {selectedFolder === folder ? (
                <FolderOpen className="w-3.5 h-3.5" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{folder}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or contents..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00ad1d]"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
        <div className="divide-y divide-slate-200">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No documents found</p>
              <p className="text-xs text-slate-400 mt-1">Try selecting another folder or upload a new file.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-1 rounded border shrink-0 ${getFileBadgeColor(doc.fileType)}`}
                  >
                    {doc.fileType}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                      <span>Folder: {doc.folder}</span>
                      <span>•</span>
                      <span>v{doc.version}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>Updated {doc.lastModified} by {doc.lastModifiedBy}</span>
                    </div>

                    {/* Active Co-authors */}
                    {doc.activeUsers && doc.activeUsers.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-700 font-medium">
                        <Users className="w-3.5 h-3.5" />
                        <span>Currently editing: {doc.activeUsers.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => setActiveDocPreview(doc)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <a
                    href={doc.webUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#0c6fae] hover:bg-[#09578a] text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Office 365</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md shadow-xl max-w-xl w-full p-5 text-slate-800">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{activeDocPreview.folder}</span>
                <h3 className="text-base font-bold text-slate-900">{activeDocPreview.name}</h3>
              </div>
              <button
                onClick={() => setActiveDocPreview(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold text-slate-700 mb-1">Document Summary</p>
                <p className="text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                  {activeDocPreview.contentSummary || 'No summary available.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div>File Size: {activeDocPreview.size}</div>
                <div>Version: v{activeDocPreview.version}</div>
                <div>Last Modified: {activeDocPreview.lastModified}</div>
                <div>Editor: {activeDocPreview.lastModifiedBy}</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-blue-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SharePoint Online Verified</span>
              </span>

              <a
                href={activeDocPreview.webUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-[#0c6fae] hover:bg-[#09578a] text-white rounded text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch in Word / Excel Online</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
