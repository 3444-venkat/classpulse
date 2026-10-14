import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Plus, Minus, RotateCcw } from 'lucide-react';
import { ClassItem } from '../types/timetable';
import { COLOR_MAP } from '../utils/theme';

interface AttendanceViewProps {
  classes: ClassItem[];
  onUpdateAttendance: (classId: string, attended: number, total: number) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  classes,
  onUpdateAttendance,
}) => {
  // Group classes by subject
  const subjectsMap: Record<string, {
    subject: string;
    code?: string;
    color: string;
    classIds: string[];
    attended: number;
    total: number;
  }> = {};

  for (const cls of classes) {
    if (!subjectsMap[cls.subject]) {
      subjectsMap[cls.subject] = {
        subject: cls.subject,
        code: cls.code,
        color: cls.color,
        classIds: [cls.id],
        attended: cls.attendance?.attended || 0,
        total: cls.attendance?.total || 0,
      };
    } else {
      subjectsMap[cls.subject].classIds.push(cls.id);
      // combine attendance counts if multiple sessions
      subjectsMap[cls.subject].attended += cls.attendance?.attended || 0;
      subjectsMap[cls.subject].total += cls.attendance?.total || 0;
    }
  }

  const subjectList = Object.values(subjectsMap);

  // Overall calculations
  const totalAttended = subjectList.reduce((acc, curr) => acc + curr.attended, 0);
  const totalHeld = subjectList.reduce((acc, curr) => acc + curr.total, 0);
  const overallPercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#131916] border border-white/20 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider block font-chalk text-sm">
            Overall Attendance Sum
          </span>
          <div className="text-3xl font-bold font-mono text-white mt-2 tabular-nums">
            {overallPercentage}%
          </div>
          <span className="text-xs text-white/60 mt-1 block font-mono">
            Σ attended = {totalAttended} / {totalHeld} total classes
          </span>
        </div>

        <div className="p-5 bg-[#131916] border border-white/20 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider block font-chalk text-sm">
            Attendance Status
          </span>
          <div className="text-lg font-bold text-white mt-2 flex items-center gap-2">
            {overallPercentage >= 75 ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Good Standing (≥ 75%)
              </span>
            ) : overallPercentage >= 65 ? (
              <span className="text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                Warning Zone (&lt; 75%)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-5 h-5 text-rose-400" />
                Attendance Shortage
              </span>
            )}
          </div>
          <span className="text-xs text-white/60 mt-1 block">
            Most colleges mandate at least 75% to sit for exams
          </span>
        </div>

        <div className="p-5 bg-[#131916] border border-white/20 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider block font-chalk text-sm">
            Active Registered Courses
          </span>
          <div className="text-3xl font-bold font-mono text-white mt-2 tabular-nums">
            {subjectList.length}
          </div>
          <span className="text-xs text-white/60 mt-1 block">
            Across {classes.length} scheduled lecture blocks
          </span>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>Course-Wise Breakdown</span>
          <span className="text-xs text-white/50 font-chalk">White chalk sums &amp; stats</span>
        </h3>

        {subjectList.length === 0 ? (
          <div className="p-12 text-center bg-[#131916] border border-white/20 rounded-xl text-white">
            <p className="text-xs text-white/60">No courses loaded yet. Add a class to begin tracking.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectList.map((item) => {
              const pct = item.total > 0 ? Math.round((item.attended / item.total) * 100) : 100;
              const isShortage = pct < 75;

              return (
                <div
                  key={item.subject}
                  className="p-5 bg-[#151c19] border border-white/20 rounded-xl shadow-md space-y-4 text-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {item.subject}
                      </h4>
                      {item.code && (
                        <span className="text-xs font-mono text-white/60">
                          {item.code}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-mono font-bold tabular-nums ${
                        pct >= 75 ? 'text-white' : pct >= 65 ? 'text-amber-300' : 'text-rose-400'
                      }`}>
                        {pct}%
                      </div>
                      <span className="text-[11px] text-white/60 font-mono tabular-nums">
                        {item.attended} / {item.total}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        pct >= 75 ? 'bg-white' : pct >= 65 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Counter adjustment controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-white/60 font-medium">Quick Adjust:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const primaryId = item.classIds[0];
                          onUpdateAttendance(primaryId, Math.max(0, item.attended - 1), Math.max(0, item.total - 1));
                        }}
                        className="p-1 border border-white/20 hover:bg-white/10 rounded text-white/70"
                        title="Decrement attended"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const primaryId = item.classIds[0];
                          onUpdateAttendance(primaryId, item.attended + 1, item.total + 1);
                        }}
                        className="px-2.5 py-1 bg-white text-black font-semibold rounded text-xs hover:bg-neutral-200 flex items-center gap-1"
                        title="Mark Attended +1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>
                      <button
                        onClick={() => {
                          const primaryId = item.classIds[0];
                          onUpdateAttendance(primaryId, item.attended, item.total + 1);
                        }}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/25 rounded text-white font-medium flex items-center gap-1"
                        title="Mark Absent +1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
