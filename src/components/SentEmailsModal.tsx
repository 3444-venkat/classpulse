import React, { useState } from 'react';
import { X, Mail, CheckCircle2, ExternalLink, Eye, Trash2, Clock, Send } from 'lucide-react';
import { SentEmailLog } from '../types/timetable';

interface SentEmailsModalProps {
  emails: SentEmailLog[];
  isOpen: boolean;
  onClose: () => void;
  onClearEmails: () => void;
}

export const SentEmailsModal: React.FC<SentEmailsModalProps> = ({
  emails,
  isOpen,
  onClose,
  onClearEmails,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<SentEmailLog | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#131916] text-white rounded-2xl border border-white/25 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-black/50 text-white">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-white" />
            <h3 className="text-base font-bold font-chalk">
              Sent Mail Outbox &amp; Email Delivery History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {emails.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="w-10 h-10 text-white/30 mx-auto mb-2" />
              <p className="text-xs font-semibold text-white/80">
                No emails sent yet.
              </p>
              <p className="text-[11px] text-white/50 mt-1 max-w-sm mx-auto">
                Open your student profile or click "Email Timetable" to dispatch your schedule or 10-minute lecture alerts directly to your inbox.
              </p>
            </div>
          ) : (
            emails.map((email) => {
              const date = new Date(email.sentAt);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div
                  key={email.id}
                  className="p-4 border border-white/15 rounded-xl bg-black/40 hover:bg-black/60 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          email.type === '10_min_warning'
                            ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                            : email.type === 'timetable_full'
                            ? 'bg-white/10 text-white border border-white/25'
                            : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {email.type === '10_min_warning' ? '10m Warning' : email.type === 'timetable_full' ? 'Timetable' : 'Daily Brief'}
                        </span>
                        <span className="font-mono text-[11px] text-white/50 tabular-nums">
                          {dateStr} at {timeStr}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        {email.subject}
                      </h4>
                      <p className="text-white/70 text-[11px]">
                        Recipient: <strong className="text-white">{email.to}</strong> ({email.studentName})
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setSelectedPreview(email)}
                        className="px-2.5 py-1 text-[11px] font-medium text-white bg-white/10 hover:bg-white hover:text-black border border-white/25 rounded-md transition-colors flex items-center gap-1"
                        title="View HTML email preview"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Email</span>
                      </button>

                      {email.gmailComposeUrl && (
                        <a
                          href={email.gmailComposeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 text-[11px] font-medium text-white bg-white/15 hover:bg-white hover:text-black border border-white/25 rounded-md transition-colors flex items-center gap-1"
                          title="Open or send in Gmail"
                        >
                          <span>Gmail</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] pt-1">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{email.viaGmail ? 'Delivered via Google Gmail API' : 'Delivered to Student Inbox'}</span>
                    </div>
                    {email.viaGmail && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/25">
                        ⚡ Gmail API Direct
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-black/40 border-t border-white/15 text-xs">
          <span className="text-white/50 font-mono">
            {emails.length} email{emails.length === 1 ? '' : 's'} dispatched
          </span>
          <div className="flex items-center gap-2">
            {emails.length > 0 && (
              <button
                onClick={onClearEmails}
                className="text-xs text-rose-300 hover:text-rose-100 font-medium px-2 py-1 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 font-semibold text-black bg-white hover:bg-neutral-200 border border-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* HTML Email Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151c19] text-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-white/30">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/20 bg-black/50 text-white">
              <div className="truncate">
                <span className="text-xs text-white/50">Email Preview:</span>{' '}
                <span className="text-xs font-bold text-white">{selectedPreview.subject}</span>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1 text-white/60 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-neutral-900">
              <div
                className="bg-white text-slate-900 rounded-lg shadow-sm max-w-2xl mx-auto overflow-hidden p-2"
                dangerouslySetInnerHTML={{ __html: selectedPreview.previewHtml }}
              />
            </div>
            <div className="p-3 bg-black/40 border-t border-white/20 flex justify-end">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
