import React from 'react';
import { Calendar, Download, Plus, MapPin, User, Clock } from 'lucide-react';
import { ClassItem, DayOfWeek } from '../types/timetable';
import { DAYS_OF_WEEK, formatTime12h, timeStringToMinutes, exportToICS } from '../utils/notificationEngine';
import { COLOR_MAP } from '../utils/theme';

interface WeeklyGridViewProps {
  classes: ClassItem[];
  onSelectClass: (cls: ClassItem) => void;
  onAddClassForDay: (day: DayOfWeek) => void;
}

export const WeeklyGridView: React.FC<WeeklyGridViewProps> = ({
  classes,
  onSelectClass,
  onAddClassForDay,
}) => {
  const [showWeekend, setShowWeekend] = React.useState(false);

  const visibleDays: DayOfWeek[] = showWeekend
    ? DAYS_OF_WEEK
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const timeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  const handleDownloadICS = () => {
    const icsData = exportToICS(classes);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ClassPulse_Timetable.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls & Export Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/20 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-white">
            Weekly Schedule Matrix
          </h2>
          <span className="text-xs text-white/60">
            {classes.length} total weekly lecture blocks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeekend(!showWeekend)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showWeekend
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            {showWeekend ? 'Hide Weekend' : 'Include Weekend'}
          </button>

          <button
            onClick={handleDownloadICS}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 border border-white rounded-lg transition-colors shadow-sm"
            title="Download .ics file to sync with Google Calendar or Apple Calendar"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Export to iCal (.ics)</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-[#121815] border border-white/25 rounded-xl overflow-x-auto shadow-xl">
        <div className="min-w-[850px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(140px,1fr))] border-b border-white/20 bg-[#17201c]">
            <div className="p-3 text-xs font-semibold text-white/50 border-r border-white/20 flex items-center justify-center font-mono">
              Time
            </div>
            {visibleDays.map((day) => (
              <div
                key={day}
                className="p-3 text-xs font-bold text-white border-r border-white/20 last:border-r-0 flex items-center justify-between"
              >
                <span>{day}</span>
                <button
                  onClick={() => onAddClassForDay(day)}
                  className="text-white/50 hover:text-white p-1 rounded"
                  title={`Add class on ${day}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Time Slots Rows */}
          <div className="relative">
            {timeSlots.map((slot) => {
              const slotMinutes = timeStringToMinutes(slot);

              return (
                <div
                  key={slot}
                  className="grid grid-cols-[80px_repeat(auto-fit,minmax(140px,1fr))] border-b border-white/10 min-h-[96px]"
                >
                  {/* Time column */}
                  <div className="p-2 border-r border-white/15 text-xs font-mono text-white/70 flex items-start justify-center pt-2 tabular-nums bg-[#0e1411]">
                    {slot}
                  </div>

                  {/* Day cells */}
                  {visibleDays.map((day) => {
                    const cellClasses = classes.filter((cls) => {
                      if (cls.day !== day) return false;
                      const startM = timeStringToMinutes(cls.startTime);
                      return startM >= slotMinutes && startM < slotMinutes + 60;
                    });

                    return (
                      <div
                        key={`${day}-${slot}`}
                        className="p-1.5 border-r border-white/10 last:border-r-0 relative group min-h-[96px] bg-[#121815] hover:bg-[#16201c] transition-colors"
                      >
                        {cellClasses.map((cls) => {
                          const colorScheme = COLOR_MAP[cls.color] || COLOR_MAP.blue;
                          return (
                            <button
                              key={cls.id}
                              onClick={() => onSelectClass(cls)}
                              className={`w-full text-left p-2.5 rounded-lg border mb-1 transition-transform hover:scale-[1.02] shadow-sm bg-[#19231f] border-white/25 hover:border-white/50`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-[10px] font-mono font-bold tabular-nums text-white`}>
                                  {cls.startTime} - {cls.endTime}
                                </span>
                                {cls.code && (
                                  <span className="text-[9px] font-mono font-medium text-white/70 bg-white/10 px-1 rounded">
                                    {cls.code}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-bold line-clamp-1 text-white">
                                {cls.subject}
                              </div>
                              <div className="text-[11px] text-white/70 flex items-center gap-1 mt-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0 text-white/50" />
                                <span className="truncate">{cls.room}</span>
                              </div>
                              {cls.instructor && (
                                <div className="text-[10px] text-white/50 flex items-center gap-1 mt-0.5 truncate">
                                  <User className="w-2.5 h-2.5 shrink-0 text-white/40" />
                                  <span className="truncate">{cls.instructor}</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
