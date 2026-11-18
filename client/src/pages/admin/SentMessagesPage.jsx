import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Mail,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Send,
  Eye,
  Filter,
  Smartphone
} from 'lucide-react';
import { adminApi } from '../../api/adminApi.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';

export default function SentMessagesPage() {
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [search, setSearch] = useState('');
  const [inspectedMessage, setInspectedMessage] = useState(null);

  // Fetch Sent Messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['sent-messages', selectedChannel],
    queryFn: async () => {
      const res = await adminApi.getSentMessages({
        channel: selectedChannel !== 'all' ? selectedChannel : undefined
      });
      return res.data;
    }
  });

  const messages = Array.isArray(messagesData)
    ? messagesData
    : Array.isArray(messagesData?.messages)
    ? messagesData.messages
    : [];

  const filteredMessages = messages.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.to?.toLowerCase().includes(q) ||
      m.recipientName?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.body?.toLowerCase().includes(q)
    );
  });

  const emailCount = messages.filter((m) => m.channel === 'EMAIL').length;
  const smsCount = messages.filter((m) => m.channel === 'SMS').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mb-1">
            <Send className="w-3.5 h-3.5" />
            Dispatch Transparency Log
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Simulated Notification Outbox
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live outbox audit log showing all simulated automated email alerts and SMS notices dispatched
            to students, technicians, and campus administrators.
          </p>
        </div>

        {/* Channel Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Mail className="w-3.5 h-3.5" /> {emailCount} Emails Dispatched
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <MessageSquare className="w-3.5 h-3.5" /> {smsCount} SMS Alerts Sent
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipient, subject, email..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Notification Channels</option>
            <option value="EMAIL">Email Dispatch Only</option>
            <option value="SMS">SMS Urgent Alerts Only</option>
          </select>

          <span className="text-xs text-slate-400 whitespace-nowrap">
            {filteredMessages.length} messages logged
          </span>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">Loading simulated dispatch log...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No dispatched messages matching filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Dispatched At</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Subject / Preview</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMessages.map((msg) => {
                  const isEmail = msg.channel === 'EMAIL';
                  return (
                    <tr
                      key={msg.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setInspectedMessage(msg)}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {new Date(msg.sentAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isEmail
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isEmail ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                          {msg.channel}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {msg.recipientName || 'Campus User'}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">{msg.to}</div>
                      </td>

                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                          {msg.subject}
                        </div>
                        <div className="text-slate-500 text-xs truncate mt-0.5">
                          {msg.body}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {msg.status || 'DELIVERED'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedMessage(msg);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Payload Inspector Modal */}
      {inspectedMessage && (
        <Modal
          isOpen={!!inspectedMessage}
          onClose={() => setInspectedMessage(null)}
          title={`Simulated ${inspectedMessage.channel} Delivery Inspector`}
        >
          {inspectedMessage.channel === 'EMAIL' ? (
            /* Email Viewer Envelope */
            <div className="space-y-4">
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {/* Email Header Fields */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border-b border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold w-16">FROM:</span>
                    <span className="flex-1 font-mono text-slate-800 dark:text-slate-200">
                      Apex Facilities Operations &lt;no-reply@apex.edu&gt;
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(inspectedMessage.sentAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-slate-400 font-semibold w-16">TO:</span>
                    <span className="flex-1 font-mono text-slate-800 dark:text-slate-200">
                      {inspectedMessage.recipientName} &lt;{inspectedMessage.to}&gt;
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-slate-400 font-semibold w-16">SUBJECT:</span>
                    <span className="flex-1 font-bold text-slate-900 dark:text-white">
                      {inspectedMessage.subject}
                    </span>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs text-blue-900 dark:text-blue-300 font-bold uppercase tracking-wider">
                    🏛️ Apex Institute of Technology • Notification Dispatch
                  </div>

                  <p className="leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">
                    {inspectedMessage.body}
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 space-y-1">
                    <p>This is an automated operational alert generated by the CCMMS maintenance engine.</p>
                    <p className="font-mono text-[10px]">Message ID: {inspectedMessage.id} • Status: DELIVERED</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setInspectedMessage(null)}>
                  Close Inspector
                </Button>
              </div>
            </div>
          ) : (
            /* SMS Chat Bubble Viewer */
            <div className="space-y-4">
              <div className="max-w-sm mx-auto bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-4 shadow-xl">
                {/* Phone Top Notch Bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="flex items-center gap-1 font-semibold">
                    <Smartphone className="w-3.5 h-3.5" /> SMS to {inspectedMessage.to}
                  </span>
                  <span>{inspectedMessage.recipientName}</span>
                </div>

                {/* SMS Bubble */}
                <div className="my-6 space-y-2">
                  <div className="bg-emerald-600 text-white rounded-2xl rounded-bl-sm p-3.5 text-xs shadow-md leading-relaxed">
                    <div className="font-bold text-[10px] text-emerald-200 uppercase tracking-wider mb-1">
                      {inspectedMessage.subject}
                    </div>
                    {inspectedMessage.body}
                  </div>
                  <div className="text-[10px] text-slate-400 text-right pr-2">
                    Delivered • {new Date(inspectedMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="text-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  Simulated Gateway Delivery: 200 OK
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setInspectedMessage(null)}>
                  Close Inspector
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

