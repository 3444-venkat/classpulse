import { ClassItem, NotificationSettings, NotificationLogItem, TimetableMetadata, StudentProfile, SentEmailLog } from '../types/timetable';
import { CS_TIMETABLE } from '../data/sampleTimetables';

const STORAGE_KEYS = {
  CLASSES: 'classpulse_classes_v1',
  SETTINGS: 'classpulse_settings_v1',
  LOGS: 'classpulse_logs_v1',
  METADATA: 'classpulse_meta_v1',
  PROFILE: 'classpulse_profile_v1',
  SENT_EMAILS: 'classpulse_sent_emails_v1',
};

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'student-primary',
  name: 'Venkat Gowda',
  studentId: '21CS049',
  email: 'jvenkatgowda@gmail.com',
  institution: 'BMS College of Engineering',
  department: 'Computer Science & Engineering',
  semester: 'Semester 5',
  academicYear: '3rd Year (B.Tech / B.E)',
  section: 'Section B',
  avatar: '👨‍🎓',
  isRegistered: true,
  emailAlertsEnabled: true,
  send10MinEmailAlert: true,
  sendDailyDigestEmail: true,
  createdAt: new Date().toISOString(),
};

export const DEFAULT_SETTINGS: NotificationSettings = {
  enableBrowserNotifications: true,
  enableAudioChimes: true,
  notify10MinBefore: true, // Primary requirement
  notify5MinBefore: false,
  notify15MinBefore: false,
  notifyAtStart: true,
  soundType: 'bell',
  volume: 0.8,
};

export const DEFAULT_METADATA: TimetableMetadata = {
  studentName: 'Alex Student',
  institution: 'Faculty of Engineering & Science',
  semester: 'Fall Semester',
  lastUpdated: new Date().toISOString(),
};

export function loadClassesFromStorage(): ClassItem[] {
  if (typeof window === 'undefined') return CS_TIMETABLE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (!raw) {
      saveClassesToStorage(CS_TIMETABLE);
      return CS_TIMETABLE;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : CS_TIMETABLE;
  } catch (e) {
    console.error('Error reading classes from storage:', e);
    return CS_TIMETABLE;
  }
}

export function saveClassesToStorage(classes: ClassItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  } catch (e) {
    console.error('Error saving classes to storage:', e);
  }
}

export function loadSettingsFromStorage(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: NotificationSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to storage:', e);
  }
}

export function loadNotificationLogs(): NotificationLogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveNotificationLogs(logs: NotificationLogItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 100))); // keep last 100
  } catch (e) {
    console.error('Error saving logs:', e);
  }
}

export function loadMetadata(): TimetableMetadata {
  if (typeof window === 'undefined') return DEFAULT_METADATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.METADATA);
    return raw ? { ...DEFAULT_METADATA, ...JSON.parse(raw) } : DEFAULT_METADATA;
  } catch (e) {
    return DEFAULT_METADATA;
  }
}

export function saveMetadata(meta: TimetableMetadata) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(meta));
  } catch (e) {
    console.error('Error saving metadata:', e);
  }
}

export function loadStudentProfile(): StudentProfile {
  if (typeof window === 'undefined') return DEFAULT_STUDENT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      saveStudentProfile(DEFAULT_STUDENT_PROFILE);
      return DEFAULT_STUDENT_PROFILE;
    }
    return { ...DEFAULT_STUDENT_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_STUDENT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving student profile:', e);
  }
}

export function loadSentEmails(): SentEmailLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SENT_EMAILS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveSentEmails(emails: SentEmailLog[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SENT_EMAILS, JSON.stringify(emails.slice(0, 50)));
  } catch (e) {
    console.error('Error saving sent emails:', e);
  }
}
