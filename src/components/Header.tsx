import React from 'react';
import { Bell, Sliders, History, Calendar, CheckCircle2, AlertCircle, Mail, Send, User } from 'lucide-react';
import { getBrowserNotificationPermission, requestNotificationPermission } from '../utils/notificationEngine';
import { StudentProfile } from '../types/timetable';
import { GoogleSignInButton } from './GoogleSignInButton';

interface HeaderProps {
  currentTab: 'today' | 'weekly' | 'attendance' | 'upload';
  setCurrentTab: (tab: 'today' | 'weekly' | 'attendance' | 'upload') => void;
  unreadCount: number;
  profile: StudentProfile;
  sentEmailsCount: number;
  isGoogleConnected?: boolean;
  onConnectGoogle?: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenSentEmails: () => void;
  onOpenRegister?: () => void;
  onTriggerTestAlert: () => void;
  onQuickEmailTimetable: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  unreadCount,
  profile,
  sentEmailsCount,
  isGoogleConnected = false,
  onConnectGoogle,
  onOpenSettings,
  onOpenHistory,
  onOpenProfile,
  onOpenSentEmails,
  onOpenRegister,
  onTriggerTestAlert,
  onQuickEmailTimetable,
}) => {
  const [permission, setPermission] = React.useState<NotificationPermission | 'unsupported'>('default');

  React.useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0f1412]/95 backdrop-blur-md border-b border-white/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single element Brand Wordmark */}
          <button
            onClick={() => setCurrentTab('today')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold font-mono shadow-[0_0_12px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-all">
              <span className="text-base font-black tracking-tight">CP</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
                  ClassPulse
                </span>
                <span className="text-[11px] px-1.5 py-0.2 rounded font-chalk text-white/80 border border-white/30 bg-white/5">
                  Blackboard
                </span>
              </div>
            </div>
          </button>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
            <button
              onClick={() => setCurrentTab('today')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'today'
                  ? 'text-white border-white font-semibold'
                  : 'border-transparent text-white/70'
              }`}
            >
              Today's Agenda
            </button>
            <button
              onClick={() => setCurrentTab('weekly')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'weekly'
                  ? 'text-white border-white font-semibold'
                  : 'border-transparent text-white/70'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setCurrentTab('attendance')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'attendance'
                  ? 'text-white border-white font-semibold'
                  : 'border-transparent text-white/70'
              }`}
            >
              Courses & Attendance
            </button>
            <button
              onClick={() => setCurrentTab('upload')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                currentTab === 'upload'
                  ? 'text-white border-white font-semibold'
                  : 'border-transparent text-white/70'
              }`}
            >
              Upload Timetable
            </button>
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Google Gmail Connection Status / Connect Button */}
            {isGoogleConnected ? (
              <div
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-white/10 border border-white/30 rounded-lg shrink-0"
                title={`Google Gmail is authorized for automated lecture alerts to ${profile.email}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Gmail Active</span>
              </div>
            ) : onConnectGoogle ? (
              <GoogleSignInButton
                onClick={onConnectGoogle}
                text="Connect Gmail"
                className="hidden sm:inline-flex text-xs py-1 px-2.5 h-8 font-semibold shrink-0 bg-neutral-900 border border-white/30 text-white hover:bg-neutral-800"
              />
            ) : null}

            {/* Quick 1-Click Email My Timetable */}
            <button
              onClick={onQuickEmailTimetable}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
              title={`Send full timetable email to ${profile.email}`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Email Schedule</span>
            </button>

            {/* Quick Test 10-Min Alert Button */}
            <button
              onClick={onTriggerTestAlert}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 border border-white/30 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Test the 10-minute class alert right now"
            >
              <Bell className="w-3.5 h-3.5 text-white" />
              <span>Test 10m Alert</span>
            </button>

            {/* Sent Mail Outbox Button */}
            <button
              onClick={onOpenSentEmails}
              className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              title="Sent Mail & Outbox"
              aria-label="Sent Mail & Outbox"
            >
              <Mail className="w-4 h-4" />
              {sentEmailsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              )}
            </button>

            {/* Notification History Button */}
            <button
              onClick={onOpenHistory}
              className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              title="Notification History"
              aria-label="Notification History"
            >
              <History className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-[0_0_6px_#fff]" />
              )}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
              title="Alert Preferences"
              aria-label="Alert Preferences"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Student Profile Chip with Roll No */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-2 pr-3 py-1 bg-white/10 hover:bg-white/20 border border-white/25 rounded-lg transition-colors text-xs font-semibold text-white shrink-0"
              title={`Student: ${profile.name} (${profile.studentId}) · ${profile.email}`}
            >
              <span className="text-base">{profile.avatar || '👨‍🎓'}</span>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="max-w-[100px] truncate text-white">{profile.name}</span>
                {profile.studentId && (
                  <span className="text-[10px] text-white/70 font-mono font-medium">{profile.studentId}</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto gap-2 py-2 border-t border-white/15 text-xs font-medium scrollbar-none">
          <button
            onClick={() => setCurrentTab('today')}
            className={`whitespace-nowrap px-3 py-1 rounded-md border ${
              currentTab === 'today' ? 'bg-white text-black font-semibold border-white' : 'text-white/70 border-white/10'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setCurrentTab('weekly')}
            className={`whitespace-nowrap px-3 py-1 rounded-md border ${
              currentTab === 'weekly' ? 'bg-white text-black font-semibold border-white' : 'text-white/70 border-white/10'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setCurrentTab('attendance')}
            className={`whitespace-nowrap px-3 py-1 rounded-md border ${
              currentTab === 'attendance' ? 'bg-white text-black font-semibold border-white' : 'text-white/70 border-white/10'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setCurrentTab('upload')}
            className={`whitespace-nowrap px-3 py-1 rounded-md border ${
              currentTab === 'upload' ? 'bg-white text-black font-semibold border-white' : 'text-white/70 border-white/10'
            }`}
          >
            Upload
          </button>
          <button
            onClick={onQuickEmailTimetable}
            className="whitespace-nowrap px-3 py-1 rounded-md bg-white text-black font-semibold"
          >
            Email Timetable
          </button>
        </div>
      </div>
    </header>
  );
};
