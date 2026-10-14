import React from 'react';
import { Clock, MapPin, User, Check, X, Edit2, Trash2, Bell, AlertTriangle, Plus, FileText } from 'lucide-react';
import { ClassItem, DayOfWeek } from '../types/timetable';
import { DAYS_OF_WEEK, formatTime12h, getClassStatus, getDayName, timeStringToMinutes } from '../utils/notificationEngine';
import { COLOR_MAP, TYPE_LABELS } from '../utils/theme';

interface TodayAgendaViewProps {
  classes: ClassItem[];
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  currentTime: Date;
  onEditClass: (cls: ClassItem) => void;
  onDeleteClass: (id: string) => void;
  onAddClass: () => void;
  onMarkAttendance: (id: string, attended: boolean) => void;
}

export const TodayAgendaView: React.FC<TodayAgendaViewProps> = ({
  classes,
  selectedDay,
  onSelectDay,
  currentTime,
  onEditClass,
  onDeleteClass,
  onAddClass,
  onMarkAttendance,
}) => {
  const currentActualDay = getDayName(currentTime);

  const dayClasses = classes
    .filter((c) => c.day === selectedDay)
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  return (
    <div className="space-y-6">
      {/* Day Selector Segmented Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/20 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = currentActualDay === day;
            const countForDay = classes.filter((c) => c.day === day).length;

            return (
              <button
                key={day}
                onClick={() => onSelectDay(day)}
                className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)] font-bold'
                    : 'bg-[#121815] text-white/70 hover:text-white border-white/20 hover:bg-[#18211d]'
                }`}
              >
                <span>{day.slice(0, 3)}</span>
                {isToday && (
                  <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${isSelected ? 'bg-black text-white' : 'bg-white/20 text-white'}`}>
                    Today
                  </span>
                )}
                {countForDay > 0 && (
                  <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-black text-white' : 'bg-white/10 text-white/80'}`}>
                    {countForDay}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onAddClass}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Lecture</span>
        </button>
      </div>

      {/* Classes Timeline Feed */}
      {dayClasses.length === 0 ? (
        <div className="bg-[#121815] border border-white/25 rounded-xl p-12 text-center max-w-lg mx-auto text-white">
          <Clock className="w-10 h-10 text-white/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">
            No Lectures Scheduled for {selectedDay}
          </h3>
          <p className="text-xs text-white/60 mb-5">
            Enjoy your free time, or add a class or lab to this day's blackboard schedule.
          </p>
          <button
            onClick={onAddClass}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lecture for {selectedDay}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {dayClasses.map((cls, idx) => {
            const colorScheme = COLOR_MAP[cls.color] || COLOR_MAP.blue;
            const statusInfo = getClassStatus(cls, currentTime);
            const isActualDay = selectedDay === currentActualDay;

            return (
              <div
                key={cls.id}
                className={`bg-[#141b18] border rounded-xl p-5 transition-all shadow-md hover:border-white/40 text-white ${
                  isActualDay && statusInfo.status === 'starts_in_10'
                    ? 'border-white ring-2 ring-white/60 bg-[#1c2621]'
                    : isActualDay && statusInfo.status === 'in_progress'
                    ? 'border-white/60 ring-2 ring-white/30 bg-[#17201c]'
                    : 'border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Time & Status */}
                  <div className="sm:w-44 shrink-0">
                    <div className="font-mono text-base font-bold text-white tabular-nums">
                      {formatTime12h(cls.startTime)}
                    </div>
                    <div className="text-xs text-white/60 font-mono tabular-nums">
                      to {formatTime12h(cls.endTime)}
                    </div>

                    {/* Real-time status badge */}
                    {isActualDay && (
                      <div className="mt-2">
                        {statusInfo.status === 'starts_in_10' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-white border border-white px-2 py-0.5 rounded shadow-sm">
                            <Bell className="w-3 h-3 text-black animate-bounce" />
                            Starts in {statusInfo.minutesUntilStart}m
                          </span>
                        )}
                        {statusInfo.status === 'in_progress' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 border border-white/40 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            In Progress ({statusInfo.minutesRemainingInClass}m left)
                          </span>
                        )}
                        {statusInfo.status === 'past' && (
                          <span className="text-[11px] text-white/40 font-medium">
                            Completed today
                          </span>
                        )}
                        {statusInfo.status === 'upcoming' && (
                          <span className="text-[11px] text-white/70 font-medium">
                            Upcoming ({Math.floor(statusInfo.minutesUntilStart / 60)}h {statusInfo.minutesUntilStart % 60}m)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Middle Column: Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-white">
                        {cls.subject}
                      </h4>
                      {cls.code && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/20 font-medium">
                          {cls.code}
                        </span>
                      )}
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${colorScheme.badgeBg}`}>
                        {TYPE_LABELS[cls.type]?.label || cls.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-white/80 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-white">
                        <MapPin className="w-3.5 h-3.5 text-white/70" />
                        {cls.room || 'Room not specified'}
                      </span>
                      {cls.instructor && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-white/50" />
                          {cls.instructor}
                        </span>
                      )}
                    </div>

                    {cls.notes && (
                      <p className="text-xs text-white/80 bg-black/40 p-2.5 rounded-lg border border-white/15 flex items-start gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
                        <span>{cls.notes}</span>
                      </p>
                    )}
                  </div>

                  {/* Right Column: Attendance & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/15">
                    {/* Attendance summary & quick mark */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onMarkAttendance(cls.id, true)}
                        className="px-2 py-1 text-[11px] font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded flex items-center gap-1 transition-colors"
                        title="Mark Attended"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Present</span>
                      </button>
                      <button
                        onClick={() => onMarkAttendance(cls.id, false)}
                        className="px-2 py-1 text-[11px] font-semibold text-white/70 bg-black/40 hover:bg-white/10 border border-white/20 rounded flex items-center gap-1 transition-colors"
                        title="Mark Absent"
                      >
                        <X className="w-3 h-3 text-rose-400" />
                        <span>Absent</span>
                      </button>
                    </div>

                    {cls.attendance && cls.attendance.total > 0 && (
                      <div className="text-[11px] text-white/70 font-mono tabular-nums">
                        Attended: {cls.attendance.attended}/{cls.attendance.total} (
                        {Math.round((cls.attendance.attended / cls.attendance.total) * 100)}%)
                      </div>
                    )}

                    {/* Edit / Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditClass(cls)}
                        className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Edit Lecture"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteClass(cls.id)}
                        className="p-1.5 text-white/60 hover:text-rose-400 hover:bg-white/10 rounded transition-colors"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

