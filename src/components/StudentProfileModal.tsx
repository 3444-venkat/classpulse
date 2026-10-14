import React, { useState } from 'react';
import { X, User, Mail, School, BookOpen, Check, Send, ExternalLink, Bell, Clock, Calendar } from 'lucide-react';
import { StudentProfile, ClassItem, SentEmailLog } from '../types/timetable';
import {
  generateFullTimetableEmailHtml,
  generate10MinWarningEmailHtml,
  generateTodayScheduleEmailHtml,
  sendEmailNotification,
} from '../utils/emailService';
import { getDayName, formatTime12h } from '../utils/notificationEngine';
import { googleSignIn, logoutGoogle, isGmailConnected, auth } from '../utils/googleAuth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface StudentProfileModalProps {
  profile: StudentProfile;
  classes: ClassItem[];
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updated: StudentProfile) => void;
  onRecordSentEmail: (emailLog: SentEmailLog) => void;
  onNavigateToUpload: () => void;
  onRegisterNewStudent?: () => void;
}

const AVATAR_OPTIONS = ['👨‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻', '🔬', '📚', '⚡', '💡', '🎓'];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  profile,
  classes,
  isOpen,
  onClose,
  onSaveProfile,
  onRecordSentEmail,
  onNavigateToUpload,
  onRegisterNewStudent,
}) => {
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [sendingState, setSendingState] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<{ message: string; gmailUrl?: string } | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(() => isGmailConnected());

  React.useEffect(() => {
    setFormData(profile);
  }, [profile, isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      setGoogleConnected(isGmailConnected());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsEditing(false);
    setSuccessBanner({ message: 'Student profile updated successfully!' });
  };

  const handleSendFullTimetableEmail = async () => {
    if (!formData.email) {
      alert('Please enter a student email address first.');
      return;
    }

    setSendingState('timetable');
    setSuccessBanner(null);

    const subject = `📅 Complete Weekly Timetable for ${formData.name} (${formData.department})`;
    const html = generateFullTimetableEmailHtml(formData, classes);

    const result = await sendEmailNotification({
      to: formData.email,
      studentName: formData.name,
      subject,
      type: 'timetable_full',
      html,
    });

    const newLog: SentEmailLog = {
      id: result.emailId,
      to: result.to,
      studentName: formData.name,
      subject: result.subject,
      type: 'timetable_full',
      sentAt: result.sentAt,
      status: 'delivered',
      previewHtml: result.previewHtml,
      gmailComposeUrl: result.gmailComposeUrl,
      viaGmail: result.viaGmail,
      gmailMessageId: result.emailId,
    };

    onRecordSentEmail(newLog);
    setSendingState(null);
    setSuccessBanner({
      message: result.viaGmail
        ? `Full Timetable successfully sent directly via Gmail to ${formData.email}!`
        : `Full Timetable successfully sent to ${formData.email}!`,
      gmailUrl: result.gmailComposeUrl,
    });
  };

  const handleSendTodayScheduleEmail = async () => {
    if (!formData.email) {
      alert('Please enter a student email address first.');
      return;
    }

    setSendingState('today');
    setSuccessBanner(null);

    const today = getDayName(new Date());
    const subject = `📚 Today's Lecture Schedule (${today}) - ${formData.name}`;
    const html = generateTodayScheduleEmailHtml(formData, classes, today);

    const result = await sendEmailNotification({
      to: formData.email,
      studentName: formData.name,
      subject,
      type: 'daily_agenda',
      html,
    });

    const newLog: SentEmailLog = {
      id: result.emailId,
      to: result.to,
      studentName: formData.name,
      subject: result.subject,
      type: 'daily_agenda',
      sentAt: result.sentAt,
      status: 'delivered',
      previewHtml: result.previewHtml,
      gmailComposeUrl: result.gmailComposeUrl,
      viaGmail: result.viaGmail,
      gmailMessageId: result.emailId,
    };

    onRecordSentEmail(newLog);
    setSendingState(null);
    setSuccessBanner({
      message: result.viaGmail
        ? `Today's schedule successfully sent directly via Gmail to ${formData.email}!`
        : `Today's schedule successfully sent to ${formData.email}!`,
      gmailUrl: result.gmailComposeUrl,
    });
  };

  const handleSend10MinAlertEmail = async () => {
    if (!formData.email) {
      alert('Please enter a student email address first.');
      return;
    }

    setSendingState('10min');
    setSuccessBanner(null);

    const targetClass = classes[0] || {
      id: 'demo-cls',
      subject: 'Data Structures & Algorithms',
      code: 'CS-201',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:15',
      room: 'Hall 302 (Turing Building)',
      instructor: 'Dr. Evelyn Reed',
      type: 'lecture',
      color: 'blue',
      notes: 'Review binary search trees before class',
    };

    const subject = `⏰ 10-Minute Warning: ${targetClass.subject} starts at ${formatTime12h(targetClass.startTime)} in ${targetClass.room}`;
    const html = generate10MinWarningEmailHtml(formData, targetClass);

    const result = await sendEmailNotification({
      to: formData.email,
      studentName: formData.name,
      subject,
      type: '10_min_warning',
      html,
      className: targetClass.subject,
      room: targetClass.room,
    });

    const newLog: SentEmailLog = {
      id: result.emailId,
      to: result.to,
      studentName: formData.name,
      subject: result.subject,
      type: '10_min_warning',
      className: targetClass.subject,
      room: targetClass.room,
      sentAt: result.sentAt,
      status: 'delivered',
      previewHtml: result.previewHtml,
      gmailComposeUrl: result.gmailComposeUrl,
      viaGmail: result.viaGmail,
      gmailMessageId: result.emailId,
    };

    onRecordSentEmail(newLog);
    setSendingState(null);
    setSuccessBanner({
      message: result.viaGmail
        ? `10-Minute Warning alert successfully sent directly via Gmail to ${formData.email}!`
        : `10-Minute Warning alert successfully sent to ${formData.email}!`,
      gmailUrl: result.gmailComposeUrl,
    });
  };

  const handleGoogleConnect = async () => {
    try {
      setIsGoogleLoading(true);
      const res = await googleSignIn();
      if (res?.user?.email) {
        setGoogleConnected(true);
        if (res.user.displayName && !formData.name) {
          setFormData((prev) => ({ ...prev, name: res.user.displayName || prev.name }));
        }
        if (res.user.email) {
          setFormData((prev) => ({ ...prev, email: res.user.email || prev.email }));
        }
        setSuccessBanner({
          message: `Connected to Google (${res.user.email})! Automatic Gmail dispatch is now active.`,
        });
      }
    } catch (err: any) {
      console.error('Google connect error:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    await logoutGoogle();
    setGoogleConnected(false);
    setSuccessBanner({
      message: 'Disconnected from Google account.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#131916] text-white rounded-2xl border border-white/25 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-black/50 text-white">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-white" />
            <h3 className="text-base font-bold font-chalk">
              Student Profile &amp; Email Dispatcher
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Success Banner */}
          {successBanner && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{successBanner.message}</span>
              </div>
              {successBanner.gmailUrl && (
                <a
                  href={successBanner.gmailUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-black bg-white px-2.5 py-1 rounded border border-white shrink-0 hover:bg-neutral-200"
                >
                  <span>Open in Gmail</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Profile Card Summary */}
          {!isEditing ? (
            <div className="p-5 bg-black/40 border border-white/20 rounded-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center text-3xl shadow-xs">
                    {profile.avatar || '👨‍🎓'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {profile.name}
                    </h4>
                    <div className="text-xs text-white/60 font-mono">
                      ID: {profile.studentId || 'Not set'} · {profile.semester}
                    </div>
                    <div className="text-xs font-semibold text-white/90 flex items-center gap-1 mt-0.5 font-mono">
                      <Mail className="w-3 h-3 text-white/70" />
                      <span>{profile.email}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 border border-white rounded-lg transition-colors shadow-xs"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/15 text-xs text-white/70">
                <div>
                  <span className="text-[11px] text-white/40 uppercase tracking-wider block font-semibold font-mono">
                    University / College
                  </span>
                  <span className="font-medium text-white">{profile.institution}</span>
                </div>
                <div>
                  <span className="text-[11px] text-white/40 uppercase tracking-wider block font-semibold font-mono">
                    Department / Major
                  </span>
                  <span className="font-medium text-white">{profile.department}</span>
                </div>
              </div>

              {/* Google Gmail Auto-Alert Integration Card */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Google Gmail Automatic Alerts
                    </span>
                    {googleConnected ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        ● Gmail Connected & Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950 text-amber-200 border border-amber-500/40">
                        Disconnected
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/60">
                    {googleConnected
                      ? `Alerts and timetable summaries are automatically sent directly from your Gmail account (${auth.currentUser?.email || profile.email}).`
                      : 'Connect your Google account to enable 100% automated Gmail delivery for 10-minute lecture warnings.'}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {googleConnected ? (
                    <button
                      type="button"
                      onClick={handleGoogleDisconnect}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-950 border border-rose-500/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Disconnect Gmail
                    </button>
                  ) : (
                    <GoogleSignInButton
                      onClick={handleGoogleConnect}
                      isLoading={isGoogleLoading}
                      text="Connect Gmail"
                      className="text-xs py-2 px-3 shadow-xs"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Edit Profile Form */
            <form onSubmit={handleSave} className="p-5 bg-black/50 border border-white/20 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 font-chalk">
                  Edit Student Information
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* Avatar options */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Select Avatar Icon
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: av })}
                      className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center border transition-all ${
                        formData.avatar === av
                          ? 'border-white bg-white/20 scale-110 shadow-xs'
                          : 'border-white/20 bg-black/40 hover:bg-white/10'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-black/60 border border-white/25 rounded-lg text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Student ID / Roll No
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full text-xs font-mono p-2.5 bg-black/60 border border-white/25 rounded-lg text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Student Email Address * (Used for 10-min lecture warnings &amp; timetable dispatch)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs p-2.5 bg-black/60 border border-white/25 rounded-lg text-white focus:border-white focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    University / College
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full text-xs p-2.5 bg-black/60 border border-white/25 rounded-lg text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Department / Major
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full text-xs p-2.5 bg-black/60 border border-white/25 rounded-lg text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Academic Semester
                </label>
                <input
                  type="text"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full text-xs p-2.5 bg-black/60 border border-white/25 rounded-lg text-white focus:border-white focus:outline-none"
                />
              </div>

              {/* Email checkboxes */}
              <div className="space-y-2 pt-2 border-t border-white/15">
                <label className="flex items-center gap-2 text-xs text-white/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.send10MinEmailAlert}
                    onChange={(e) => setFormData({ ...formData, send10MinEmailAlert: e.target.checked })}
                    className="w-3.5 h-3.5 accent-white rounded"
                  />
                  <span className="font-medium">Automatically send email notification 10 minutes before each class starts</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-white/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sendDailyDigestEmail}
                    onChange={(e) => setFormData({ ...formData, sendDailyDigestEmail: e.target.checked })}
                    className="w-3.5 h-3.5 accent-white rounded"
                  />
                  <span className="font-medium">Send daily morning schedule digest to my inbox</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {/* Quick Actions Strip: Timetable Upload & Email Dispatching */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 font-chalk">
              Timetable &amp; Email Dispatch Actions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Send Full Timetable Email */}
              <div className="p-4 border border-white/15 rounded-xl bg-black/40 hover:border-white/40 transition-colors flex flex-col justify-between space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center mb-2 border border-white/20">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white">
                    Email Full Timetable
                  </h5>
                  <p className="text-[11px] text-white/50 mt-1">
                    Sends your complete weekly schedule ({classes.length} classes) with timings and rooms.
                  </p>
                </div>
                <button
                  onClick={handleSendFullTimetableEmail}
                  disabled={sendingState === 'timetable'}
                  className="w-full py-2 px-3 text-xs font-semibold text-black bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingState === 'timetable' ? 'Dispatching...' : 'Send Timetable'}</span>
                </button>
              </div>

              {/* 2. Send 10-Minute Alert Email */}
              <div className="p-4 border border-white/15 rounded-xl bg-black/40 hover:border-white/40 transition-colors flex flex-col justify-between space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/70 text-amber-300 flex items-center justify-center mb-2 border border-amber-500/40">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white">
                    Test 10m Alert Email
                  </h5>
                  <p className="text-[11px] text-white/50 mt-1">
                    Dispatches an immediate 10-minute warning email for your next lecture.
                  </p>
                </div>
                <button
                  onClick={handleSend10MinAlertEmail}
                  disabled={sendingState === '10min'}
                  className="w-full py-2 px-3 text-xs font-semibold text-black bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{sendingState === '10min' ? 'Sending...' : 'Send 10m Alert'}</span>
                </button>
              </div>

              {/* 3. Send Today's Schedule Email */}
              <div className="p-4 border border-white/15 rounded-xl bg-black/40 hover:border-white/40 transition-colors flex flex-col justify-between space-y-3">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center mb-2 border border-white/20">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h5 className="text-xs font-bold text-white">
                    Email Today's Classes
                  </h5>
                  <p className="text-[11px] text-white/50 mt-1">
                    Sends an agenda email of today's upcoming lectures and classroom numbers.
                  </p>
                </div>
                <button
                  onClick={handleSendTodayScheduleEmail}
                  disabled={sendingState === 'today'}
                  className="w-full py-2 px-3 text-xs font-semibold text-black bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-400 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingState === 'today' ? 'Sending...' : 'Send Today’s List'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upload Timetable for this student */}
          <div className="p-4 bg-black/50 border border-white/20 text-white rounded-xl flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h5 className="text-xs font-bold">
                Update or Upload Timetable for {formData.name}
              </h5>
              <p className="text-[11px] text-white/50 mt-0.5">
                Upload a new photo or routine text to sync with this profile.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onNavigateToUpload();
              }}
              className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors shadow-xs"
            >
              Upload Timetable Photo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-black/50 border-t border-white/15 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-white/50">
              Recipient: <strong className="text-white font-mono">{formData.email}</strong>
            </span>
            {onRegisterNewStudent && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRegisterNewStudent();
                }}
                className="text-xs text-white hover:text-white/80 font-semibold underline"
              >
                Register as New Student
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-black bg-white hover:bg-neutral-200 border border-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
