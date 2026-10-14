export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type LectureType = 'lecture' | 'lab' | 'seminar' | 'tutorial' | 'exam';

export type SubjectColor = 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'sky' | 'indigo' | 'orange' | 'teal' | 'cyan';

export interface ClassItem {
  id: string;
  subject: string;
  code?: string;
  day: DayOfWeek;
  startTime: string; // HH:MM in 24h format e.g. "09:00"
  endTime: string;   // HH:MM in 24h format e.g. "10:15"
  room: string;
  instructor?: string;
  type: LectureType;
  color: SubjectColor;
  notes?: string;
  attendance?: {
    attended: number;
    total: number;
  };
}

export type SoundType = 'bell' | 'chime' | 'ping' | 'marimba';

export interface NotificationSettings {
  enableBrowserNotifications: boolean;
  enableAudioChimes: boolean;
  notify10MinBefore: boolean;
  notify5MinBefore: boolean;
  notify15MinBefore: boolean;
  notifyAtStart: boolean;
  soundType: SoundType;
  volume: number; // 0 to 1
}

export interface NotificationLogItem {
  id: string;
  classId: string;
  subject: string;
  room: string;
  instructor?: string;
  type: '10_min_warning' | 'start_alert' | '5_min_warning' | '15_min_warning' | 'test';
  message: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  studentId: string; // University Roll Number / Registration ID
  email: string;
  institution: string; // College / University / School Name
  department: string;  // Branch / Major / Stream
  semester: string;    // Semester / Term
  academicYear: string; // 1st Year, 2nd Year, 3rd Year, 4th Year, Post-Grad
  section?: string;    // Section A/B/C
  avatar: string;
  isRegistered: boolean;
  emailAlertsEnabled: boolean;
  send10MinEmailAlert: boolean;
  sendDailyDigestEmail: boolean;
  createdAt: string;
}

export interface SentEmailLog {
  id: string;
  to: string;
  studentName: string;
  subject: string;
  type: 'timetable_full' | '10_min_warning' | 'daily_agenda' | 'test';
  className?: string;
  room?: string;
  sentAt: string;
  status: 'sent' | 'delivered';
  previewHtml: string;
  gmailComposeUrl?: string;
  viaGmail?: boolean;
  gmailMessageId?: string;
}

export interface TimetableMetadata {
  studentName?: string;
  institution?: string;
  semester?: string;
  lastUpdated: string;
}
