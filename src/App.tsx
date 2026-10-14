import React, { useState, useEffect, useRef } from 'react';
import { ClassItem, DayOfWeek, NotificationSettings, NotificationLogItem, StudentProfile, SentEmailLog } from './types/timetable';
import {
  loadClassesFromStorage,
  saveClassesToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  loadNotificationLogs,
  saveNotificationLogs,
  loadStudentProfile,
  saveStudentProfile,
  loadSentEmails,
  saveSentEmails,
  DEFAULT_SETTINGS,
} from './utils/storage';
import {
  getDayName,
  timeStringToMinutes,
  sendDesktopNotification,
  formatTime12h,
} from './utils/notificationEngine';
import {
  generateFullTimetableEmailHtml,
  generate10MinWarningEmailHtml,
  sendEmailNotification,
} from './utils/emailService';
import { audioSynth } from './utils/audio';
import { initAuth, googleSignIn, isGmailConnected } from './utils/googleAuth';
import { Header } from './components/Header';
import { NextLectureBanner } from './components/NextLectureBanner';
import { TodayAgendaView } from './components/TodayAgendaView';
import { WeeklyGridView } from './components/WeeklyGridView';
import { UploadModal } from './components/UploadModal';
import { AddEditClassModal } from './components/AddEditClassModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { NotificationHistoryModal } from './components/NotificationHistoryModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { SentEmailsModal } from './components/SentEmailsModal';
import { StudentRegistrationView } from './components/StudentRegistrationView';
import { AttendanceView } from './components/AttendanceView';
import { AcademicOverviewSection } from './components/AcademicOverviewSection';
import { BlackboardMathBackground, ChalkDensity, BlackboardVariant } from './components/BlackboardMathBackground';
import { BlackboardChalkRail } from './components/BlackboardChalkRail';
import { InAppNotificationToast } from './components/InAppNotificationToast';

export default function App() {
  const [classes, setClasses] = useState<ClassItem[]>(() => loadClassesFromStorage());
  const [settings, setSettings] = useState<NotificationSettings>(() => loadSettingsFromStorage());
  const [logs, setLogs] = useState<NotificationLogItem[]>(() => loadNotificationLogs());
  const [profile, setProfile] = useState<StudentProfile>(() => loadStudentProfile());
  const [sentEmails, setSentEmails] = useState<SentEmailLog[]>(() => loadSentEmails());
  const [currentTab, setCurrentTab] = useState<'today' | 'weekly' | 'attendance' | 'upload'>('today');

  // Blackboard theme customization state
  const [blackboardVariant, setBlackboardVariant] = useState<BlackboardVariant>(() => {
    return (localStorage.getItem('classpulse_blackboard_variant') as BlackboardVariant) || 'classic';
  });
  const [chalkDensity, setChalkDensity] = useState<ChalkDensity>(() => {
    return (localStorage.getItem('classpulse_chalk_density') as ChalkDensity) || 'dense';
  });

  const handleChangeVariant = (variant: BlackboardVariant) => {
    setBlackboardVariant(variant);
    localStorage.setItem('classpulse_blackboard_variant', variant);
  };

  const handleChangeDensity = (density: ChalkDensity) => {
    setChalkDensity(density);
    localStorage.setItem('classpulse_chalk_density', density);
  };

  // Google Gmail connection state
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(() => isGmailConnected());

  // Registration portal state
  const [isRegistering, setIsRegistering] = useState<boolean>(() => !profile.isRegistered);

  // Modal visibility
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSentEmailsOpen, setIsSentEmailsOpen] = useState(false);

  // Real or Simulated Time
  const [realClock, setRealClock] = useState<Date>(new Date());
  const [simulatedTimeMinutes, setSimulatedTimeMinutes] = useState<number | null>(null);

  // Selected Day for Agenda
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => getDayName(new Date()));

  // Active Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [defaultAddDay, setDefaultAddDay] = useState<DayOfWeek>('Monday');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // In-App Toast Alert
  const [activeToast, setActiveToast] = useState<NotificationLogItem | null>(null);

  // Track dispatched alerts to avoid double notification in the same minute
  const firedAlertsRef = useRef<Set<string>>(new Set());

  // Listen to Google OAuth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (_user, token) => {
        setIsGoogleConnected(Boolean(token));
      },
      () => {
        setIsGoogleConnected(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnectGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setIsGoogleConnected(true);
        setActiveToast({
          id: `toast-${Date.now()}`,
          classId: 'google-auth',
          subject: 'Gmail Connected',
          room: res.user.email || profile.email,
          type: 'test',
          message: 'Google Gmail connected! Lecture alerts and 10m warnings will now be sent directly from your Gmail account.',
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
    }
  };

  // Clock tick every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setRealClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute effective current time (real or simulated)
  const effectiveTime = React.useMemo(() => {
    if (simulatedTimeMinutes === null) {
      return realClock;
    }
    const d = new Date(realClock);
    const h = Math.floor(simulatedTimeMinutes / 60) % 24;
    const m = Math.floor(simulatedTimeMinutes % 60);
    d.setHours(h, m, realClock.getSeconds());
    return d;
  }, [realClock, simulatedTimeMinutes]);

  // Dispatch an alert helper
  const triggerNotification = (
    cls: ClassItem,
    type: '10_min_warning' | 'start_alert' | '5_min_warning' | '15_min_warning' | 'test',
    customMsg?: string
  ) => {
    const defaultMsg =
      type === '10_min_warning'
        ? `Reminder: ${cls.subject} starts in 10 minutes at ${formatTime12h(cls.startTime)} in ${cls.room}.`
        : type === 'start_alert'
        ? `Class Starting Now: ${cls.subject} is beginning in ${cls.room} with ${cls.instructor || 'instructor'}.`
        : type === '5_min_warning'
        ? `Urgent: ${cls.subject} starts in 5 minutes in ${cls.room}!`
        : type === '15_min_warning'
        ? `Heads up: ${cls.subject} starts in 15 minutes.`
        : `Test Alert: ${cls.subject} scheduled for ${formatTime12h(cls.startTime)} in ${cls.room}.`;

    const message = customMsg || defaultMsg;

    // 1. Play audio chime
    if (settings.enableAudioChimes) {
      audioSynth.playAlert(settings.soundType, settings.volume);
    }

    // 2. Browser Desktop Notification
    if (settings.enableBrowserNotifications) {
      sendDesktopNotification(
        type === '10_min_warning'
          ? `⏰ 10-Minute Warning: ${cls.subject}`
          : type === 'start_alert'
          ? `🔔 Class Starting: ${cls.subject}`
          : `🎓 Class Alert: ${cls.subject}`,
        {
          body: message,
          tag: `${cls.id}-${type}`,
        }
      );
    }

    // 3. Create Log Item
    const newLog: NotificationLogItem = {
      id: `log-${Date.now()}-${Math.random()}`,
      classId: cls.id,
      subject: cls.subject,
      room: cls.room,
      instructor: cls.instructor,
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setLogs((prev) => {
      const updated = [newLog, ...prev];
      saveNotificationLogs(updated);
      return updated;
    });

    // 4. In-App Floating Toast
    setActiveToast(newLog);
  };

  // Automated Real-Time Schedule Monitor (runs on effectiveTime change)
  useEffect(() => {
    const currentDay = getDayName(effectiveTime);
    const nowMinutes = effectiveTime.getHours() * 60 + effectiveTime.getMinutes() + effectiveTime.getSeconds() / 60;
    const dateKey = `${effectiveTime.getFullYear()}-${effectiveTime.getMonth()}-${effectiveTime.getDate()}`;

    // Filter today's classes
    const todayClasses = classes.filter((c) => c.day === currentDay);

    for (const cls of todayClasses) {
      const startMinutes = timeStringToMinutes(cls.startTime);
      const diffMinutes = startMinutes - nowMinutes;

      // 1. 10-Minute Warning (Primary requirement!)
      // Trigger when class starts in between 9.5 and 10.5 minutes
      if (settings.notify10MinBefore && diffMinutes <= 10.2 && diffMinutes >= 9.2) {
        const key = `${dateKey}-${cls.id}-10m`;
        if (!firedAlertsRef.current.has(key)) {
          firedAlertsRef.current.add(key);
          triggerNotification(cls, '10_min_warning');
          if (profile.emailAlertsEnabled && profile.send10MinEmailAlert && profile.email) {
            handleEmail10MinAlertForClass(cls);
          }
        }
      }

      // 2. Exact Start Alert (0 min remaining)
      if (settings.notifyAtStart && diffMinutes <= 0.3 && diffMinutes >= -0.5) {
        const key = `${dateKey}-${cls.id}-start`;
        if (!firedAlertsRef.current.has(key)) {
          firedAlertsRef.current.add(key);
          triggerNotification(cls, 'start_alert');
        }
      }

      // 3. Optional 5-min warning
      if (settings.notify5MinBefore && diffMinutes <= 5.2 && diffMinutes >= 4.5) {
        const key = `${dateKey}-${cls.id}-5m`;
        if (!firedAlertsRef.current.has(key)) {
          firedAlertsRef.current.add(key);
          triggerNotification(cls, '5_min_warning');
        }
      }

      // 4. Optional 15-min warning
      if (settings.notify15MinBefore && diffMinutes <= 15.2 && diffMinutes >= 14.5) {
        const key = `${dateKey}-${cls.id}-15m`;
        if (!firedAlertsRef.current.has(key)) {
          firedAlertsRef.current.add(key);
          triggerNotification(cls, '15_min_warning');
        }
      }
    }
  }, [effectiveTime, classes, settings, profile]);

  // Handlers for Student Profile & Emails
  const handleSaveProfile = (updated: StudentProfile) => {
    setProfile(updated);
    saveStudentProfile(updated);
  };

  const handleRecordSentEmail = (emailLog: SentEmailLog) => {
    setSentEmails((prev) => {
      const updated = [emailLog, ...prev];
      saveSentEmails(updated);
      return updated;
    });
  };

  const handleClearSentEmails = () => {
    setSentEmails([]);
    saveSentEmails([]);
  };

  const handleEmail10MinAlertForClass = async (cls: ClassItem) => {
    if (!profile.email) return;
    const subject = `⏰ 10-Minute Warning: ${cls.subject} starts at ${formatTime12h(cls.startTime)} in ${cls.room}`;
    const html = generate10MinWarningEmailHtml(profile, cls);
    const result = await sendEmailNotification({
      to: profile.email,
      studentName: profile.name,
      subject,
      type: '10_min_warning',
      html,
      className: cls.subject,
      room: cls.room,
    });
    handleRecordSentEmail({
      id: result.emailId,
      to: result.to,
      studentName: profile.name,
      subject: result.subject,
      type: '10_min_warning',
      className: cls.subject,
      room: cls.room,
      sentAt: result.sentAt,
      status: 'delivered',
      previewHtml: result.previewHtml,
      gmailComposeUrl: result.gmailComposeUrl,
      viaGmail: result.viaGmail,
      gmailMessageId: result.emailId,
    });
  };

  const handleQuickEmailTimetable = async (classesToSend = classes) => {
    if (!profile.email) {
      setIsProfileOpen(true);
      return;
    }
    const subject = `📅 Complete Weekly Timetable for ${profile.name} (${profile.department})`;
    const html = generateFullTimetableEmailHtml(profile, classesToSend);
    const result = await sendEmailNotification({
      to: profile.email,
      studentName: profile.name,
      subject,
      type: 'timetable_full',
      html,
    });
    handleRecordSentEmail({
      id: result.emailId,
      to: result.to,
      studentName: profile.name,
      subject: result.subject,
      type: 'timetable_full',
      sentAt: result.sentAt,
      status: 'delivered',
      previewHtml: result.previewHtml,
      gmailComposeUrl: result.gmailComposeUrl,
      viaGmail: result.viaGmail,
      gmailMessageId: result.emailId,
    });
    setActiveToast({
      id: `toast-${Date.now()}`,
      classId: 'email-sent',
      subject: 'Timetable Sent by Email',
      room: profile.email,
      type: 'test',
      message: `Full weekly schedule delivered to ${profile.email}`,
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  const handleEmail10MinAlert = async () => {
    const todayClasses = classes.filter((c) => c.day === getDayName(effectiveTime));
    const targetClass = todayClasses[0] || classes[0];
    if (!targetClass) {
      alert('Please add a lecture first.');
      return;
    }
    await handleEmail10MinAlertForClass(targetClass);
    if (settings.enableAudioChimes) {
      audioSynth.playAlert(settings.soundType, settings.volume);
    }
    setActiveToast({
      id: `toast-${Date.now()}`,
      classId: targetClass.id,
      subject: `10m Alert Emailed: ${targetClass.subject}`,
      room: profile.email,
      type: '10_min_warning',
      message: `10-minute warning email dispatched to ${profile.email}`,
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  // Handlers
  const handleSaveClass = (classItem: ClassItem) => {
    setClasses((prev) => {
      const exists = prev.some((c) => c.id === classItem.id);
      const updated = exists ? prev.map((c) => (c.id === classItem.id ? classItem : c)) : [...prev, classItem];
      saveClassesToStorage(updated);
      return updated;
    });
  };

  const handleDeleteClass = (id: string) => {
    setClasses((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveClassesToStorage(updated);
      return updated;
    });
  };

  const handleImportClasses = (newClasses: ClassItem[], mode: 'replace' | 'append') => {
    setClasses((prev) => {
      const updated = mode === 'replace' ? newClasses : [...prev, ...newClasses];
      saveClassesToStorage(updated);
      return updated;
    });
    setCurrentTab('today');
  };

  const handleMarkAttendance = (id: string, attended: boolean) => {
    setClasses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const current = c.attendance || { attended: 0, total: 0 };
          return {
            ...c,
            attendance: {
              attended: attended ? current.attended + 1 : current.attended,
              total: current.total + 1,
            },
          };
        }
        return c;
      });
      saveClassesToStorage(updated);
      return updated;
    });
  };

  const handleUpdateSubjectAttendance = (classId: string, attended: number, total: number) => {
    setClasses((prev) => {
      const targetClass = prev.find((c) => c.id === classId);
      if (!targetClass) return prev;
      const targetSubject = targetClass.subject;

      const updated = prev.map((c) => {
        if (c.subject === targetSubject) {
          return {
            ...c,
            attendance: { attended, total },
          };
        }
        return c;
      });
      saveClassesToStorage(updated);
      return updated;
    });
  };

  const handleSaveSettings = (updated: NotificationSettings) => {
    setSettings(updated);
    saveSettingsToStorage(updated);
  };

  const handleClearLogs = () => {
    setLogs([]);
    saveNotificationLogs([]);
  };

  const handleTriggerTestAlert = () => {
    const todayClasses = classes.filter((c) => c.day === getDayName(effectiveTime));
    const targetClass =
      todayClasses[0] ||
      classes[0] || {
        id: 'test-class',
        subject: 'Advanced Computer Systems',
        code: 'CS-401',
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:15',
        room: 'Turing Hall 302',
        instructor: 'Prof. Alan Turing',
        type: 'lecture',
        color: 'blue',
      };

    triggerNotification(
      targetClass,
      '10_min_warning',
      `🔔 10-Minute Warning: ${targetClass.subject} starts at ${formatTime12h(targetClass.startTime)} in ${targetClass.room}. Pack your bag and head to class!`
    );
  };

  const handleCompleteRegistration = (newProfile: StudentProfile, initialClasses?: ClassItem[]) => {
    setProfile(newProfile);
    saveStudentProfile(newProfile);
    if (initialClasses && initialClasses.length > 0) {
      setClasses(initialClasses);
      saveClassesToStorage(initialClasses);
    }
    setIsRegistering(false);
    setActiveToast({
      id: `toast-${Date.now()}`,
      classId: 'reg-success',
      subject: '🎓 Student Registration Active',
      room: newProfile.studentId,
      type: 'test',
      message: `Welcome, ${newProfile.name}! Your student timetable and 10-minute alerts are verified.`,
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  // If student is not registered or requests re-registration, render Student Portal Registration Gate
  if (!profile.isRegistered || isRegistering) {
    return (
      <StudentRegistrationView
        initialProfile={profile}
        onCompleteRegistration={handleCompleteRegistration}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0c120f] chalk-board-bg text-white flex flex-col antialiased relative">
      {/* Background Chalk Math & Equations */}
      <BlackboardMathBackground density={chalkDensity} variant={blackboardVariant} />

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        unreadCount={logs.filter((l) => !l.read).length}
        profile={profile}
        sentEmailsCount={sentEmails.length}
        isGoogleConnected={isGoogleConnected}
        onConnectGoogle={handleConnectGoogle}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSentEmails={() => setIsSentEmailsOpen(true)}
        onOpenRegister={() => setIsRegistering(true)}
        onTriggerTestAlert={handleTriggerTestAlert}
        onQuickEmailTimetable={() => handleQuickEmailTimetable()}
      />

      {/* Blackboard Math Quote & Customization Chalk Rail */}
      <BlackboardChalkRail
        density={chalkDensity}
        onChangeDensity={handleChangeDensity}
        variant={blackboardVariant}
        onChangeVariant={handleChangeVariant}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Dominant Next Lecture Focal Anchor */}
        <NextLectureBanner
          classes={classes}
          currentTime={effectiveTime}
          profile={profile}
          simulatedTimeMinutes={simulatedTimeMinutes}
          onSetSimulatedTime={setSimulatedTimeMinutes}
          onTriggerTestAlert={handleTriggerTestAlert}
          onEmail10MinAlert={handleEmail10MinAlert}
          onOpenAddModal={() => {
            setEditingClass(null);
            setDefaultAddDay(getDayName(effectiveTime));
            setIsAddEditOpen(true);
          }}
        />

        {/* Academic Overview Section: Recharts Bar Chart on Dashboard */}
        {currentTab === 'today' && (
          <AcademicOverviewSection
            classes={classes}
            profile={profile}
            onUpdateAttendance={handleUpdateSubjectAttendance}
            onNavigateToAttendance={() => setCurrentTab('attendance')}
          />
        )}

        {/* View Routing */}
        {currentTab === 'today' && (
          <TodayAgendaView
            classes={classes}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            currentTime={effectiveTime}
            onEditClass={(cls) => {
              setEditingClass(cls);
              setIsAddEditOpen(true);
            }}
            onDeleteClass={handleDeleteClass}
            onAddClass={() => {
              setEditingClass(null);
              setDefaultAddDay(selectedDay);
              setIsAddEditOpen(true);
            }}
            onMarkAttendance={handleMarkAttendance}
          />
        )}

        {currentTab === 'weekly' && (
          <WeeklyGridView
            classes={classes}
            onSelectClass={(cls) => {
              setEditingClass(cls);
              setIsAddEditOpen(true);
            }}
            onAddClassForDay={(day) => {
              setEditingClass(null);
              setDefaultAddDay(day);
              setIsAddEditOpen(true);
            }}
          />
        )}

        {currentTab === 'attendance' && (
          <div className="space-y-6">
            <AcademicOverviewSection
              classes={classes}
              profile={profile}
              onUpdateAttendance={handleUpdateSubjectAttendance}
            />
            <AttendanceView
              classes={classes}
              onUpdateAttendance={handleUpdateSubjectAttendance}
            />
          </div>
        )}

        {currentTab === 'upload' && (
          <UploadModal
            onImportClasses={handleImportClasses}
            onClose={() => setCurrentTab('today')}
            profile={profile}
            onSendTimetableEmail={(newClasses) => handleQuickEmailTimetable(newClasses)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/15 bg-[#0a0f0d] py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 flex-wrap text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide">ClassPulse</span>
            <span>·</span>
            <span className="font-chalk text-white/80">Blackboard Theme with White Chalk Sums</span>
            <span>·</span>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="text-white hover:text-white/80 underline font-semibold flex items-center gap-1"
            >
              <span>{profile.avatar}</span>
              <span>{profile.name} ({profile.email})</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="hover:text-white transition-colors font-medium text-white/80"
            >
              Student Profile
            </button>
            <button
              onClick={() => setIsSentEmailsOpen(true)}
              className="hover:text-white transition-colors font-medium text-white/80"
            >
              Sent Mails ({sentEmails.length})
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition-colors"
            >
              Alert Settings
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-white transition-colors"
            >
              Notification Logs
            </button>
            <button
              onClick={() => setCurrentTab('upload')}
              className="hover:text-white transition-colors"
            >
              Upload Schedule
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AddEditClassModal
        isOpen={isAddEditOpen}
        initialClass={editingClass}
        defaultDay={defaultAddDay}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingClass(null);
        }}
        onSave={handleSaveClass}
      />

      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      <NotificationHistoryModal
        isOpen={isHistoryOpen}
        logs={logs}
        onClose={() => setIsHistoryOpen(false)}
        onClearLogs={handleClearLogs}
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        profile={profile}
        classes={classes}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSaveProfile={handleSaveProfile}
        onRecordSentEmail={handleRecordSentEmail}
        onNavigateToUpload={() => setCurrentTab('upload')}
        onRegisterNewStudent={() => {
          setIsProfileOpen(false);
          setIsRegistering(true);
        }}
      />

      {/* Sent Emails Outbox Modal */}
      <SentEmailsModal
        emails={sentEmails}
        isOpen={isSentEmailsOpen}
        onClose={() => setIsSentEmailsOpen(false)}
        onClearEmails={handleClearSentEmails}
      />

      {/* Real-time in-app alert toast */}
      <InAppNotificationToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
      />
    </div>
  );
}
