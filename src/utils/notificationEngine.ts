import { ClassItem, DayOfWeek, NotificationSettings, NotificationLogItem } from '../types/timetable';
import { audioSynth } from './audio';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function getDayName(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Converts "HH:MM" string to minutes from start of day
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10) || 0);
  return h * 60 + m;
}

/**
 * Converts minutes from midnight to "HH:MM"
 */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Format 24h "HH:MM" to friendly "09:00 AM"
 */
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr ? mStr.padStart(2, '0') : '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

/**
 * Parses 24h time string into 12-hour parts (1-12, minute, 'AM' | 'PM')
 */
export function parseTimeParts12h(timeStr: string): { hour12: number; minute: number; ampm: 'AM' | 'PM' } {
  if (!timeStr) return { hour12: 9, minute: 0, ampm: 'AM' };
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10) || 0;
  const minute = parseInt(mStr, 10) || 0;
  const ampm: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return { hour12: h, minute, ampm };
}

/**
 * Converts 12-hour parts (1-12, minute, 'AM' | 'PM') to 24h "HH:MM" string
 */
export function convert12hTo24h(hour12: number, minute: number, ampm: 'AM' | 'PM'): string {
  let h = hour12 % 12;
  if (ampm === 'PM') h += 12;
  const m = Math.max(0, Math.min(59, minute));
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Check browser notification permission status
 */
export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return false;
  }
}

/**
 * Dispatch desktop notification
 */
export function sendDesktopNotification(title: string, options: NotificationOptions = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notif = new Notification(title, {
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⏰</text></svg>',
      ...options,
    });

    // Auto close desktop banner after 8 seconds
    setTimeout(() => {
      try {
        notif.close();
      } catch (e) {}
    }, 8000);
  } catch (e) {
    console.warn('Could not display desktop notification:', e);
  }
}

export interface ClassStatusInfo {
  status: 'past' | 'in_progress' | 'starts_in_10' | 'starts_soon' | 'upcoming';
  minutesUntilStart: number;
  minutesRemainingInClass: number;
  progressPercent: number;
}

/**
 * Computes status of a class relative to a specific reference Date
 */
export function getClassStatus(cls: ClassItem, refDate: Date): ClassStatusInfo {
  const currentDay = getDayName(refDate);
  const nowMinutes = refDate.getHours() * 60 + refDate.getMinutes() + refDate.getSeconds() / 60;
  const startMinutes = timeStringToMinutes(cls.startTime);
  const endMinutes = timeStringToMinutes(cls.endTime);

  if (cls.day !== currentDay) {
    return {
      status: 'upcoming',
      minutesUntilStart: 9999,
      minutesRemainingInClass: 0,
      progressPercent: 0,
    };
  }

  const duration = Math.max(1, endMinutes - startMinutes);

  if (nowMinutes >= endMinutes) {
    return {
      status: 'past',
      minutesUntilStart: -(nowMinutes - startMinutes),
      minutesRemainingInClass: 0,
      progressPercent: 100,
    };
  }

  if (nowMinutes >= startMinutes && nowMinutes < endMinutes) {
    const elapsed = nowMinutes - startMinutes;
    return {
      status: 'in_progress',
      minutesUntilStart: 0,
      minutesRemainingInClass: Math.round(endMinutes - nowMinutes),
      progressPercent: Math.min(100, Math.round((elapsed / duration) * 100)),
    };
  }

  const diffStart = startMinutes - nowMinutes;
  if (diffStart <= 10.5 && diffStart >= 0) {
    return {
      status: 'starts_in_10',
      minutesUntilStart: Math.round(diffStart),
      minutesRemainingInClass: duration,
      progressPercent: 0,
    };
  }

  if (diffStart <= 30) {
    return {
      status: 'starts_soon',
      minutesUntilStart: Math.round(diffStart),
      minutesRemainingInClass: duration,
      progressPercent: 0,
    };
  }

  return {
    status: 'upcoming',
    minutesUntilStart: Math.round(diffStart),
    minutesRemainingInClass: duration,
    progressPercent: 0,
  };
}

/**
 * Finds the currently active class or the immediate next class for today
 */
export function getActiveOrNextClass(classes: ClassItem[], refDate: Date): {
  activeClass: ClassItem | null;
  nextClass: ClassItem | null;
  minutesUntilNext: number;
  secondsUntilNext: number;
} {
  const currentDay = getDayName(refDate);
  const todayClasses = classes
    .filter((c) => c.day === currentDay)
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  const nowSeconds = refDate.getHours() * 3600 + refDate.getMinutes() * 60 + refDate.getSeconds();

  let activeClass: ClassItem | null = null;
  let nextClass: ClassItem | null = null;
  let secondsUntilNext = 0;

  for (const cls of todayClasses) {
    const startSec = timeStringToMinutes(cls.startTime) * 60;
    const endSec = timeStringToMinutes(cls.endTime) * 60;

    if (nowSeconds >= startSec && nowSeconds < endSec) {
      activeClass = cls;
    } else if (nowSeconds < startSec && !nextClass) {
      nextClass = cls;
      secondsUntilNext = startSec - nowSeconds;
    }
  }

  return {
    activeClass,
    nextClass,
    minutesUntilNext: Math.floor(secondsUntilNext / 60),
    secondsUntilNext,
  };
}

/**
 * Export classes to iCalendar (.ics) format for import into Google Calendar or Apple Calendar
 */
export function exportToICS(classes: ClassItem[], calendarName = 'ClassPulse Timetable'): string {
  const dayIndexMap: Record<DayOfWeek, string> = {
    Monday: 'MO',
    Tuesday: 'TU',
    Wednesday: 'WE',
    Thursday: 'TH',
    Friday: 'FR',
    Saturday: 'SA',
    Sunday: 'SU',
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClassPulse//Student Schedule//EN',
    `X-WR-CALNAME:${calendarName}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  // Base date for recurring weekly events: current Monday
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const baseMonday = new Date(now);
  baseMonday.setDate(now.getDate() - currentDayOfWeek);

  const dayOffsets: Record<DayOfWeek, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };

  for (const cls of classes) {
    const dayOffset = dayOffsets[cls.day] || 0;
    const eventDate = new Date(baseMonday);
    eventDate.setDate(baseMonday.getDate() + dayOffset);

    const [startH, startM] = cls.startTime.split(':').map((x) => parseInt(x, 10));
    const [endH, endM] = cls.endTime.split(':').map((x) => parseInt(x, 10));

    const yyyy = eventDate.getFullYear();
    const mm = (eventDate.getMonth() + 1).toString().padStart(2, '0');
    const dd = eventDate.getDate().toString().padStart(2, '0');

    const dtStart = `${yyyy}${mm}${dd}T${startH.toString().padStart(2, '0')}${startM.toString().padStart(2, '0')}00`;
    const dtEnd = `${yyyy}${mm}${dd}T${endH.toString().padStart(2, '0')}${endM.toString().padStart(2, '0')}00`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${cls.id}-${Date.now()}@classpulse.app`);
    lines.push(`DTSTAMP:${yyyy}${mm}${dd}T000000Z`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${dayIndexMap[cls.day]}`);
    lines.push(`SUMMARY:${cls.subject} (${cls.code || cls.type})`);
    lines.push(`LOCATION:${cls.room || 'Classroom'}`);
    lines.push(`DESCRIPTION:Instructor: ${cls.instructor || 'TBD'}\\nType: ${cls.type}\\n${cls.notes || ''}`);
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT10M'); // 10 minute warning!
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Reminder: ${cls.subject} starts in 10 minutes`);
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
