import React from 'react';
import { X, History, Trash2, Bell, CheckCircle2, Clock } from 'lucide-react';
import { NotificationLogItem } from '../types/timetable';

interface NotificationHistoryModalProps {
  logs: NotificationLogItem[];
  isOpen: boolean;
  onClose: () => void;
  onClearLogs: () => void;
}

export const NotificationHistoryModal: React.FC<NotificationHistoryModalProps> = ({
  logs,
  isOpen,
  onClose,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#131916] text-white rounded-2xl border border-white/25 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-white" />
            <h3 className="text-base font-bold text-white font-chalk">
              Notification History &amp; Alert Log
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-10 h-10 text-white/30 mx-auto mb-2" />
              <p className="text-xs font-medium text-white/70">
                No notifications recorded yet.
              </p>
              <p className="text-[11px] text-white/40 mt-1">
                When classes approach (10 minutes before) or start, alerts will appear here.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const date = new Date(log.timestamp);
              const timeFormatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const dateFormatted = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div
                  key={log.id}
                  className="p-3 border border-white/15 rounded-xl bg-black/40 flex items-start gap-3 text-xs"
                >
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
                    log.type === '10_min_warning'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                      : log.type === 'start_alert'
                      ? 'bg-white/15 text-white border-white/30'
                      : 'bg-white/10 text-white/80 border-white/20'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white">
                        {log.subject}
                      </span>
                      <span className="font-mono text-[10px] text-white/50 tabular-nums">
                        {dateFormatted} · {timeFormatted}
                      </span>
                    </div>

                    <p className="text-white/70 text-[11px]">
                      {log.message}
                    </p>

                    <div className="text-[10px] text-white/50">
                      Room: {log.room} {log.instructor && `· Prof. ${log.instructor}`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-black/40 border-t border-white/15 text-xs">
          <span className="text-white/50 font-mono">
            {logs.length} notification{logs.length === 1 ? '' : 's'} recorded
          </span>

          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="flex items-center gap-1 text-xs text-rose-300 hover:text-rose-100 font-medium px-2 py-1 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 font-semibold text-black bg-white border border-white rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
