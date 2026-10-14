import { SubjectColor, LectureType } from '../types/timetable';

export interface ColorScheme {
  bg: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  text: string;
  accent: string;
}

export const COLOR_MAP: Record<SubjectColor, ColorScheme> = {
  blue: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-white/10 text-white border border-white/30',
    badgeText: 'text-white font-medium',
    border: 'border-white/20 hover:border-white/40',
    text: 'text-white',
    accent: '#ffffff',
  },
  emerald: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40',
    badgeText: 'text-emerald-300 font-medium',
    border: 'border-emerald-500/30 hover:border-emerald-400/50',
    text: 'text-white',
    accent: '#34d399',
  },
  amber: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-amber-950/60 text-amber-200 border border-amber-500/40',
    badgeText: 'text-amber-200 font-medium',
    border: 'border-amber-500/30 hover:border-amber-400/50',
    text: 'text-white',
    accent: '#fbbf24',
  },
  purple: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-purple-950/60 text-purple-200 border border-purple-500/40',
    badgeText: 'text-purple-200 font-medium',
    border: 'border-purple-500/30 hover:border-purple-400/50',
    text: 'text-white',
    accent: '#c084fc',
  },
  rose: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-rose-950/60 text-rose-200 border border-rose-500/40',
    badgeText: 'text-rose-200 font-medium',
    border: 'border-rose-500/30 hover:border-rose-400/50',
    text: 'text-white',
    accent: '#fb7185',
  },
  sky: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-sky-950/60 text-sky-200 border border-sky-500/40',
    badgeText: 'text-sky-200 font-medium',
    border: 'border-sky-500/30 hover:border-sky-400/50',
    text: 'text-white',
    accent: '#38bdf8',
  },
  indigo: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-indigo-950/60 text-indigo-200 border border-indigo-500/40',
    badgeText: 'text-indigo-200 font-medium',
    border: 'border-indigo-500/30 hover:border-indigo-400/50',
    text: 'text-white',
    accent: '#818cf8',
  },
  orange: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-orange-950/60 text-orange-200 border border-orange-500/40',
    badgeText: 'text-orange-200 font-medium',
    border: 'border-orange-500/30 hover:border-orange-400/50',
    text: 'text-white',
    accent: '#fb923c',
  },
  teal: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-teal-950/60 text-teal-200 border border-teal-500/40',
    badgeText: 'text-teal-200 font-medium',
    border: 'border-teal-500/30 hover:border-teal-400/50',
    text: 'text-white',
    accent: '#2dd4bf',
  },
  cyan: {
    bg: 'bg-neutral-900/90 hover:bg-neutral-900',
    badgeBg: 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/40',
    badgeText: 'text-cyan-200 font-medium',
    border: 'border-cyan-500/30 hover:border-cyan-400/50',
    text: 'text-white',
    accent: '#22d3ee',
  },
};

export const TYPE_LABELS: Record<LectureType, { label: string; icon: string }> = {
  lecture: { label: 'Lecture', icon: 'BookOpen' },
  lab: { label: 'Lab Practical', icon: 'FlaskConical' },
  seminar: { label: 'Seminar', icon: 'Users' },
  tutorial: { label: 'Tutorial', icon: 'GraduationCap' },
  exam: { label: 'Exam / Quiz', icon: 'FileText' },
};
