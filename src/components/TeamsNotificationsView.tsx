import React, { useState } from 'react';
import {
  Send,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Play,
  Settings,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { usePortalStore } from '../services/store';
import { buildTeamsAdaptiveCard, sendTeamsWebhookNotification } from '../services/teamsSharePointService';

export const TeamsNotificationsView: React.FC = () => {
  const { teamsRules, tasks, notices, meetings, sharePointDocs, actions } = usePortalStore();

  const [testEventType, setTestEventType] = useState<'task' | 'notice' | 'meeting' | 'document'>('notice');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; payload: any } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleTriggerTest = async () => {
    setIsSendingTest(true);
    let sampleData: any;
    let rule = teamsRules.find(r => r.enabled);

    if (testEventType === 'notice') {
      sampleData = notices[0] || {
        id: 'test-not',
        title: 'Emergency Circular: Monsoon Weather Advisory',
        content: 'Heavy rains projected in Coast region. Community mobile dispensaries operating under emergency safety protocols.',
        department: 'All Departments',
        priority: 'Urgent',
        authorName: 'Ahmed Al-Hassani',
        authorRole: 'Executive Director',
      };
      rule = teamsRules.find(r => r.event === 'urgent_notice');
    } else if (testEventType === 'task') {
      sampleData = tasks[0] || {
        id: 'test-task',
        title: 'Urgent Procurement of Secondary School Science Kits',
        description: 'Authorize supply orders for girls high school laboratory modernization.',
        priority: 'Urgent',
        department: 'Education & Schools',
        assignedToName: 'Rija Virani',
        dueDate: '2026-09-24',
        subtasks: [{ completed: true }, { completed: false }],
      };
      rule = teamsRules.find(r => r.event === 'task_urgent_created');
    } else if (testEventType === 'meeting') {
      sampleData = meetings[0] || {
        id: 'test-meet',
        title: 'Executive Emergency Relief Operations Review',
        department: 'Executive & Admin',
        date: '2026-09-21',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        teamsJoinUrl: 'https://teams.microsoft.com',
      };
      rule = teamsRules.find(r => r.event === 'teams_meeting_scheduled');
    } else {
      sampleData = sharePointDocs[0] || {
        id: 'test-doc',
        name: 'WIPAHS_Audit_2026.xlsx',
        folder: 'Finance',
        version: 'v2.4',
        modifiedBy: 'Hassan Juma',
        size: '1.8 MB',
        sharePointWebUrl: 'https://wipahs.sharepoint.com',
      };
      rule = teamsRules.find(r => r.event === 'sharepoint_doc_uploaded');
    }

    const res = await sendTeamsWebhookNotification(rule?.webhookUrl || '', testEventType, sampleData);
    if (rule) {
      actions.updateRuleTriggered(rule.id);
    }
    actions.logAudit('teams_notification_test_sent', `Automated Teams notification sent for ${testEventType}`, 'purple');

    setTestResult(res);
    setIsSendingTest(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Automated Notifications
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              Microsoft Teams Connector
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#19232d]">
            Teams Automated Notifications & Webhook Connectors
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Broadcast urgent circulars, critical task assignments, and calendar updates directly into Microsoft Teams channels using Adaptive Cards.
          </p>
        </div>

        <button
          onClick={handleTriggerTest}
          disabled={isSendingTest}
          className="px-3.5 py-2 rounded-md bg-[#00ad1d] hover:bg-[#009218] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition active:scale-95 shrink-0 self-start md:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isSendingTest ? 'Dispatching...' : 'Test Webhook Dispatch'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Rules Config Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Active Automation Rules
                </h2>
                <p className="text-xs text-slate-500">
                  Toggle rules on or off, and update incoming webhook target channels.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {teamsRules.filter(r => r.enabled).length} Enabled
              </span>
            </div>

            <div className="space-y-3">
              {teamsRules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-md border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-300'}`}></span>
                      <h3 className="text-xs font-bold text-slate-900">{rule.name}</h3>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => actions.toggleRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00ad1d]"></div>
                    </label>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span>Target Channel: <b className="text-slate-800">{rule.channelName}</b></span>
                    <span className="text-[10px] text-slate-400">
                      {rule.lastTriggered ? `Last: ${new Date(rule.lastTriggered).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Never'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <input
                      type="text"
                      value={rule.webhookUrl}
                      onChange={(e) => actions.updateRuleWebhook(rule.id, e.target.value)}
                      placeholder="https://wipahs.webhook.office.com/..."
                      className="w-full text-[11px] font-mono px-2.5 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#00ad1d] text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Adaptive Card Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-md border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Microsoft Teams Card Simulator</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Adaptive Card 1.4
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Preview how WIPAHS alerts look directly inside Microsoft Teams channels.
              </p>
            </div>

            {/* Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md text-xs font-semibold">
              {(['notice', 'task', 'meeting', 'document'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTestEventType(type)}
                  className={`flex-1 py-1.5 rounded-md capitalize transition ${
                    testEventType === type ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Teams UI Simulation Container */}
            <div className="bg-[#464775]/10 border border-[#464775]/20 rounded-md p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-md bg-[#464775] text-white flex items-center justify-center font-bold text-[11px]">
                  T
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">WIPAHS OfficeHub Bot</p>
                  <p className="text-[10px] text-slate-500">Channel Connector • Today at 10:45 AM</p>
                </div>
              </div>

              {/* Adaptive Card body */}
              <div className="bg-white rounded-md p-3.5 border border-slate-200 shadow-2xs space-y-3">
                <div className="border-l-4 border-[#00ad1d] pl-3">
                  <h4 className="font-bold text-xs text-slate-900">
                    {testEventType === 'notice' && '📢 WIPAHS Official Circular: Transition to Cloud'}
                    {testEventType === 'task' && '⚡ High-Priority Task: Educational Scholarship Distributions'}
                    {testEventType === 'meeting' && '📅 Teams Meeting: Executive Operations Sync'}
                    {testEventType === 'document' && '📄 SharePoint Document Updated: Beneficiary_Verification.xlsx'}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {testEventType === 'notice' && 'All departmental heads and administrative staff are using our optimized OfficeHub platform with direct Microsoft Teams and SharePoint sync.'}
                    {testEventType === 'task' && 'Review student verification records across secondary school beneficiaries and sign off payment vouchers in SharePoint.'}
                    {testEventType === 'meeting' && 'Weekly executive operations and inter-departmental planning session scheduled on Microsoft Teams.'}
                    {testEventType === 'document' && 'Synced automatically with SharePoint Online library with active co-authoring support.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded-md border border-slate-100">
                  <div>Department: <b className="text-slate-800">All Departments</b></div>
                  <div>Priority: <b className="text-rose-700">Urgent</b></div>
                  <div>Sender: <b className="text-slate-800">Rija Virani</b></div>
                  <div>Status: <b className="text-emerald-700">Delivered</b></div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button className="px-3 py-1 rounded-md bg-[#00ad1d] text-white font-semibold text-[11px] flex items-center gap-1">
                    <span>Open in OfficeHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button className="px-3 py-1 rounded-md border border-slate-200 text-slate-700 font-semibold text-[11px]">
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>

            {testResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Webhook Dispatched Successfully</span>
                </div>
                <p className="text-[11px] text-emerald-700">{testResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
