import React from 'react';
import { Bell, MapPin, X, Clock, User } from 'lucide-react';
import { NotificationLogItem } from '../types/timetable';

interface InAppNotificationToastProps {
  notification: NotificationLogItem | null;
  onDismiss: () => void;
}

export const InAppNotificationToast: React.FC<InAppNotificationToastProps> = ({
  notification,
  onDismiss,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#131916] text-white rounded-2xl shadow-2xl border border-white/30 p-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0 shadow-md font-bold">
            <Bell className="w-5 h-5 animate-bounce text-black" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black bg-white px-2 py-0.5 rounded">
                {notification.type === '10_min_warning' ? '10-Minute Warning' : 'Lecture Alert'}
              </span>
            </div>

            <h4 className="text-sm font-bold text-white leading-tight">
              {notification.subject}
            </h4>

            <p className="text-xs text-white/80">
              {notification.message}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-white/60 pt-1">
              <span className="flex items-center gap-1 font-medium text-white">
                <MapPin className="w-3 h-3 text-white/80" />
                {notification.room}
              </span>
              {notification.instructor && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {notification.instructor}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-white/60 hover:text-white p-1 rounded-lg"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
