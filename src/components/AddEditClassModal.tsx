import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Sparkles } from 'lucide-react';
import { ClassItem, DayOfWeek, LectureType, SubjectColor } from '../types/timetable';
import {
  DAYS_OF_WEEK,
  formatTime12h,
  parseTimeParts12h,
  convert12hTo24h,
  timeStringToMinutes,
  minutesToTimeString,
} from '../utils/notificationEngine';
import { COLOR_MAP, TYPE_LABELS } from '../utils/theme';

interface AddEditClassModalProps {
  initialClass?: ClassItem | null;
  defaultDay?: DayOfWeek;
  isOpen: boolean;
  onClose: () => void;
  onSave: (classItem: ClassItem) => void;
}

const COLOR_OPTIONS: SubjectColor[] = [
  'blue',
  'emerald',
  'amber',
  'purple',
  'rose',
  'sky',
  'indigo',
  'orange',
  'teal',
  'cyan',
];

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES_PRESETS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const AddEditClassModal: React.FC<AddEditClassModalProps> = ({
  initialClass,
  defaultDay = 'Monday',
  isOpen,
  onClose,
  onSave,
}) => {
  const [subject, setSubject] = useState('');
  const [code, setCode] = useState('');
  const [day, setDay] = useState<DayOfWeek>(defaultDay);

  // 12h AM/PM parts
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [startAmPm, setStartAmPm] = useState<'AM' | 'PM'>('AM');

  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(15);
  const [endAmPm, setEndAmPm] = useState<'AM' | 'PM'>('AM');

  // Input mode: 12h AM/PM or 24h
  const [timeMode, setTimeMode] = useState<'12h' | '24h'>('12h');

  // Computed 24-hour strings
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:15');

  const [room, setRoom] = useState('');
  const [instructor, setInstructor] = useState('');
  const [type, setType] = useState<LectureType>('lecture');
  const [color, setColor] = useState<SubjectColor>('blue');
  const [notes, setNotes] = useState('');

  // Synchronize when opening or initialClass changes
  useEffect(() => {
    if (initialClass) {
      setSubject(initialClass.subject);
      setCode(initialClass.code || '');
      setDay(initialClass.day);
      setStartTime(initialClass.startTime);
      setEndTime(initialClass.endTime);

      const startParts = parseTimeParts12h(initialClass.startTime);
      setStartHour(startParts.hour12);
      setStartMinute(startParts.minute);
      setStartAmPm(startParts.ampm);

      const endParts = parseTimeParts12h(initialClass.endTime);
      setEndHour(endParts.hour12);
      setEndMinute(endParts.minute);
      setEndAmPm(endParts.ampm);

      setRoom(initialClass.room);
      setInstructor(initialClass.instructor || '');
      setType(initialClass.type);
      setColor(initialClass.color);
      setNotes(initialClass.notes || '');
    } else {
      setSubject('');
      setCode('');
      setDay(defaultDay);
      setStartTime('09:00');
      setEndTime('10:15');

      setStartHour(9);
      setStartMinute(0);
      setStartAmPm('AM');

      setEndHour(10);
      setEndMinute(15);
      setEndAmPm('AM');

      setRoom('');
      setInstructor('');
      setType('lecture');
      setColor('blue');
      setNotes('');
    }
  }, [initialClass, defaultDay, isOpen]);

  // When 12-hour parts change, update 24-hour strings
  const updateStartTime12h = (h: number, m: number, ap: 'AM' | 'PM') => {
    setStartHour(h);
    setStartMinute(m);
    setStartAmPm(ap);
    const new24 = convert12hTo24h(h, m, ap);
    setStartTime(new24);
  };

  const updateEndTime12h = (h: number, m: number, ap: 'AM' | 'PM') => {
    setEndHour(h);
    setEndMinute(m);
    setEndAmPm(ap);
    const new24 = convert12hTo24h(h, m, ap);
    setEndTime(new24);
  };

  // When 24-hour input is changed directly
  const handleStartTime24Change = (val: string) => {
    setStartTime(val);
    const parts = parseTimeParts12h(val);
    setStartHour(parts.hour12);
    setStartMinute(parts.minute);
    setStartAmPm(parts.ampm);
  };

  const handleEndTime24Change = (val: string) => {
    setEndTime(val);
    const parts = parseTimeParts12h(val);
    setEndHour(parts.hour12);
    setEndMinute(parts.minute);
    setEndAmPm(parts.ampm);
  };

  // Quick duration setter from start time
  const applyDuration = (durationMinutes: number) => {
    const startMins = timeStringToMinutes(startTime);
    const endMins = (startMins + durationMinutes) % 1440;
    const newEnd24 = minutesToTimeString(endMins);
    setEndTime(newEnd24);
    const parts = parseTimeParts12h(newEnd24);
    setEndHour(parts.hour12);
    setEndMinute(parts.minute);
    setEndAmPm(parts.ampm);
  };

  // Calculate duration in hours/mins
  const startMins = timeStringToMinutes(startTime);
  const endMins = timeStringToMinutes(endTime);
  const duration = endMins >= startMins ? endMins - startMins : 1440 - startMins + endMins;
  const durationHours = Math.floor(duration / 60);
  const durationRemainderMins = duration % 60;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const classData: ClassItem = {
      id: initialClass?.id || `class-${Date.now()}`,
      subject: subject.trim(),
      code: code.trim() || undefined,
      day,
      startTime,
      endTime,
      room: room.trim() || 'Classroom',
      instructor: instructor.trim() || undefined,
      type,
      color,
      notes: notes.trim() || undefined,
      attendance: initialClass?.attendance || { attended: 0, total: 0 },
    };

    onSave(classData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#131916] text-white rounded-2xl border border-white/25 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-black/50">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-chalk">
              <Clock className="w-4 h-4 text-white" />
              {initialClass ? 'Edit Lecture Schedule' : 'Add New Lecture'}
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Configure class timings with 12-Hour AM/PM and reminder triggers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Subject & Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS-201"
                className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Day & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Day of Week
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Session Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LectureType)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TIMING SECTION WITH AM / PM CONTROLS */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Lecture Timings</span>
              </div>
              {/* Mode switch */}
              <div className="inline-flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setTimeMode('12h')}
                  className={`px-2.5 py-0.5 rounded-md transition-all ${
                    timeMode === '12h'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  12-Hour (AM / PM)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeMode('24h')}
                  className={`px-2.5 py-0.5 rounded-md transition-all ${
                    timeMode === '24h'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  24-Hour
                </button>
              </div>
            </div>

            {timeMode === '12h' ? (
              <div className="space-y-3">
                {/* Start Time 12h */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Start Time (AM/PM)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-blue-600">
                      {formatTime12h(startTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Hour */}
                    <div className="flex-1">
                      <select
                        value={startHour}
                        onChange={(e) =>
                          updateStartTime12h(parseInt(e.target.value, 10), startMinute, startAmPm)
                        }
                        className="w-full text-xs font-mono font-semibold p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {HOURS_12.map((h) => (
                          <option key={`sh-${h}`} value={h}>
                            {h.toString().padStart(2, '0')} Hr
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-slate-400 font-bold">:</span>

                    {/* Minute */}
                    <div className="flex-1">
                      <select
                        value={startMinute}
                        onChange={(e) =>
                          updateStartTime12h(startHour, parseInt(e.target.value, 10), startAmPm)
                        }
                        className="w-full text-xs font-mono font-semibold p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {MINUTES_PRESETS.map((m) => (
                          <option key={`sm-${m}`} value={m}>
                            {m.toString().padStart(2, '0')} Min
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* AM / PM Toggle Buttons */}
                    <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden bg-slate-100 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateStartTime12h(startHour, startMinute, 'AM')}
                        className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
                          startAmPm === 'AM'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStartTime12h(startHour, startMinute, 'PM')}
                        className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
                          startAmPm === 'PM'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                {/* End Time 12h */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      End Time (AM/PM)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-blue-600">
                      {formatTime12h(endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Hour */}
                    <div className="flex-1">
                      <select
                        value={endHour}
                        onChange={(e) =>
                          updateEndTime12h(parseInt(e.target.value, 10), endMinute, endAmPm)
                        }
                        className="w-full text-xs font-mono font-semibold p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {HOURS_12.map((h) => (
                          <option key={`eh-${h}`} value={h}>
                            {h.toString().padStart(2, '0')} Hr
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-slate-400 font-bold">:</span>

                    {/* Minute */}
                    <div className="flex-1">
                      <select
                        value={endMinute}
                        onChange={(e) =>
                          updateEndTime12h(endHour, parseInt(e.target.value, 10), endAmPm)
                        }
                        className="w-full text-xs font-mono font-semibold p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {MINUTES_PRESETS.map((m) => (
                          <option key={`em-${m}`} value={m}>
                            {m.toString().padStart(2, '0')} Min
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* AM / PM Toggle Buttons */}
                    <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden bg-slate-100 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateEndTime12h(endHour, endMinute, 'AM')}
                        className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
                          endAmPm === 'AM'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => updateEndTime12h(endHour, endMinute, 'PM')}
                        className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
                          endAmPm === 'PM'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 24-hour Fallback Input */
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Start Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => handleStartTime24Change(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Displays as: {formatTime12h(startTime)}
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    End Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => handleEndTime24Change(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Displays as: {formatTime12h(endTime)}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Duration Buttons & Summary */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-slate-600 font-medium">Quick Class Lengths:</span>
                <span className="font-semibold text-slate-800">
                  {durationHours > 0 ? `${durationHours}h ` : ''}
                  {durationRemainderMins > 0 ? `${durationRemainderMins}m` : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[45, 50, 60, 75, 90, 120].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => applyDuration(dur)}
                    className="px-2 py-1 text-[11px] bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-md font-medium text-slate-700 transition-colors shadow-2xs"
                  >
                    +{dur >= 60 ? `${dur / 60}h` : `${dur}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Notice: 10-Minute Prior Alert Indicator */}
            <div className="flex items-center gap-2 p-2 bg-blue-50/80 border border-blue-200/80 rounded-lg text-[11px] text-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                10-Minute warning alert will trigger automatically at{' '}
                <strong>
                  {formatTime12h(minutesToTimeString((timeStringToMinutes(startTime) - 10 + 1440) % 1440))}
                </strong>
                .
              </span>
            </div>
          </div>

          {/* Room & Instructor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room / Location
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Hall 302 or Online"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructor / Professor
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Prof. Alan Turing"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject Color Theme
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      COLOR_MAP[c]?.badgeBg || 'bg-slate-200'
                    } ${
                      isSelected
                        ? 'ring-2 ring-blue-600 ring-offset-2 scale-110 shadow-sm'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lecture Notes / Syllabus Links (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bring scientific calculator; Homework 3 due today"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/15">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white/70 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-black bg-white hover:bg-neutral-200 rounded-lg shadow-sm transition-all"
            >
              {initialClass ? 'Save Changes' : 'Add to Timetable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
