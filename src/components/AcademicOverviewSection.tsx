import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Filter,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ClassItem, StudentProfile } from '../types/timetable';

interface AcademicOverviewSectionProps {
  classes: ClassItem[];
  profile?: StudentProfile;
  onUpdateAttendance?: (classId: string, attended: number, total: number) => void;
  onNavigateToAttendance?: () => void;
}

interface SubjectAttendanceData {
  subject: string;
  code: string;
  shortLabel: string;
  color: string;
  type: string;
  attended: number;
  total: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
  classIds: string[];
  safeBunksRemaining: number;
  classesNeededFor75: number;
}

export const AcademicOverviewSection: React.FC<AcademicOverviewSectionProps> = ({
  classes,
  profile,
  onUpdateAttendance,
  onNavigateToAttendance,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'at-risk' | 'lecture' | 'lab'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'percentage-asc' | 'percentage-desc'>('default');

  // Group classes by subject code or subject name
  const subjectData: SubjectAttendanceData[] = useMemo(() => {
    const map: Record<string, {
      subject: string;
      code: string;
      color: string;
      type: string;
      classIds: string[];
      attended: number;
      total: number;
    }> = {};

    for (const cls of classes) {
      const key = cls.code ? `${cls.code} - ${cls.subject}` : cls.subject;
      if (!map[key]) {
        map[key] = {
          subject: cls.subject,
          code: cls.code || cls.subject.substring(0, 6).toUpperCase(),
          color: cls.color || 'blue',
          type: cls.type || 'lecture',
          classIds: [cls.id],
          attended: cls.attendance?.attended ?? 10,
          total: cls.attendance?.total ?? 12,
        };
      } else {
        map[key].classIds.push(cls.id);
        map[key].attended += cls.attendance?.attended ?? 0;
        map[key].total += cls.attendance?.total ?? 0;
      }
    }

    return Object.values(map).map((item) => {
      const total = item.total > 0 ? item.total : 1;
      const attended = Math.min(item.attended, total);
      const percentage = Math.round((attended / total) * 100);

      let status: 'good' | 'warning' | 'critical' = 'good';
      if (percentage < 65) {
        status = 'critical';
      } else if (percentage < 75) {
        status = 'warning';
      }

      // Safe bunks remaining: max bunks while maintaining >= 75%
      const safeBunksRemaining = Math.max(0, Math.floor(attended / 0.75 - total));

      // Classes needed: (attended + y) / (total + y) >= 0.75 => y >= (0.75 * total - attended) / 0.25
      const classesNeededFor75 = percentage < 75 ? Math.max(1, Math.ceil((0.75 * total - attended) / 0.25)) : 0;

      // Abbreviated label for X-axis (e.g. "CS-201" or first 2 words)
      const shortLabel = item.code || item.subject.split(' ').slice(0, 2).join(' ');

      return {
        subject: item.subject,
        code: item.code,
        shortLabel,
        color: item.color,
        type: item.type,
        attended,
        total,
        percentage,
        status,
        classIds: item.classIds,
        safeBunksRemaining,
        classesNeededFor75,
      };
    });
  }, [classes]);

  // Overall semester statistics
  const stats = useMemo(() => {
    const totalAttended = subjectData.reduce((acc, curr) => acc + curr.attended, 0);
    const totalHeld = subjectData.reduce((acc, curr) => acc + curr.total, 0);
    const overallPct = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 100;
    const atRiskCount = subjectData.filter((s) => s.percentage < 75).length;
    const goodCount = subjectData.filter((s) => s.percentage >= 75).length;

    return {
      totalAttended,
      totalHeld,
      overallPct,
      atRiskCount,
      goodCount,
      totalSubjects: subjectData.length,
    };
  }, [subjectData]);

  // Filtered and sorted data for the chart
  const chartData = useMemo(() => {
    let filtered = [...subjectData];

    if (filterMode === 'at-risk') {
      filtered = filtered.filter((s) => s.percentage < 75);
    } else if (filterMode === 'lecture') {
      filtered = filtered.filter((s) => s.type === 'lecture');
    } else if (filterMode === 'lab') {
      filtered = filtered.filter((s) => s.type === 'lab');
    }

    if (sortBy === 'percentage-asc') {
      filtered.sort((a, b) => a.percentage - b.percentage);
    } else if (sortBy === 'percentage-desc') {
      filtered.sort((a, b) => b.percentage - a.percentage);
    }

    return filtered;
  }, [subjectData, filterMode, sortBy]);

  // Quick increment/decrement attendance
  const handleQuickAdjust = (sub: SubjectAttendanceData, deltaAttended: number, deltaTotal: number) => {
    if (!onUpdateAttendance || sub.classIds.length === 0) return;
    const primaryId = sub.classIds[0];
    const newAttended = Math.max(0, sub.attended + deltaAttended);
    const newTotal = Math.max(newAttended, sub.total + deltaTotal);
    onUpdateAttendance(primaryId, newAttended, newTotal);
  };

  // Custom Chalk Tooltip for Recharts
  const CustomChalkTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: SubjectAttendanceData = payload[0].payload;
      return (
        <div className="bg-[#111613] text-white p-3.5 rounded-xl border border-white/30 shadow-2xl backdrop-blur-md max-w-xs text-xs space-y-2 z-50">
          <div className="flex items-center justify-between border-b border-white/20 pb-2">
            <div>
              <div className="font-bold text-white text-sm tracking-tight">{data.subject}</div>
              <div className="text-[11px] font-mono text-white/60 uppercase">{data.code} · {data.type}</div>
            </div>
            <div className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
              data.percentage >= 75
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : data.percentage >= 65
                ? 'bg-amber-950/80 text-amber-200 border border-amber-500/40'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
            }`}>
              {data.percentage}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <span className="text-white/50 block">Attended Classes</span>
              <span className="text-white font-mono font-semibold text-sm">
                {data.attended} / {data.total}
              </span>
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/10">
              <span className="text-white/50 block">Semester Status</span>
              <span className="text-white font-medium">
                {data.percentage >= 75 ? 'Above 75% Target' : 'Under Minimum'}
              </span>
            </div>
          </div>

          <div className="text-[11px] font-chalk text-white/90 pt-1">
            {data.percentage >= 75 ? (
              <span className="text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Safe: Can miss {data.safeBunksRemaining} more lecture(s)
              </span>
            ) : (
              <span className="text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Alert: Need {data.classesNeededFor75} consecutive class(es) to hit 75%
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-[#121815] border border-white/20 rounded-2xl shadow-xl overflow-hidden mb-8 relative z-10 transition-all">
      {/* Blackboard Top Accent Trim */}
      <div className="bg-[#161f1a] px-6 py-4 border-b border-white/15 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-md shrink-0">
            <BarChart3 className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight font-chalk">
                Academic Overview &amp; Semester Trends
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/25 text-white/90">
                {profile?.semester || 'Semester 5'}
              </span>
            </div>
            <p className="text-xs text-white/60">
              Interactive subject attendance visualization · Minimum 75% university threshold
            </p>
          </div>
        </div>

        {/* Chalk Sum Math Badge */}
        <div className="flex items-center gap-2 text-xs font-chalk text-white/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/15">
          <Sparkles className="w-3.5 h-3.5 text-white/70" />
          <span>Σ attended = {stats.totalAttended} / {stats.totalHeld} · Overall: {stats.overallPct}%</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-6">
        {/* Semester Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-black/40 border border-white/15 rounded-xl">
            <span className="text-[11px] font-semibold text-white/60 block font-chalk">
              Semester Average
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {stats.overallPct}%
            </div>
            <span className="text-[10px] text-white/50 block font-mono mt-0.5">
              Goal: ≥ 75.0%
            </span>
          </div>

          <div className="p-3.5 bg-black/40 border border-white/15 rounded-xl">
            <span className="text-[11px] font-semibold text-white/60 block font-chalk">
              Good Standing (≥75%)
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1 flex items-center gap-1.5">
              <span>{stats.goodCount}</span>
              <span className="text-xs text-emerald-400 font-normal">/ {stats.totalSubjects} subjects</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">
              Eligible for exams
            </span>
          </div>

          <div className="p-3.5 bg-black/40 border border-white/15 rounded-xl">
            <span className="text-[11px] font-semibold text-white/60 block font-chalk">
              Attention Required
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1 flex items-center gap-1.5">
              <span>{stats.atRiskCount}</span>
              {stats.atRiskCount > 0 ? (
                <span className="text-xs text-rose-400 font-normal font-sans">(&lt; 75%)</span>
              ) : (
                <span className="text-xs text-emerald-400 font-normal font-sans">(None!)</span>
              )}
            </div>
            <span className="text-[10px] text-white/50 block mt-0.5">
              Subjects under 75%
            </span>
          </div>

          <div className="p-3.5 bg-black/40 border border-white/15 rounded-xl">
            <span className="text-[11px] font-semibold text-white/60 block font-chalk">
              Lectures Tracked
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {stats.totalHeld}
            </div>
            <span className="text-[10px] text-white/50 block font-mono mt-0.5">
              Across full timetable
            </span>
          </div>
        </div>

        {/* Filter and Sorting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-white/60 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors border ${
                filterMode === 'all'
                  ? 'bg-white text-black border-white font-semibold shadow-xs'
                  : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10 hover:text-white'
              }`}
            >
              All Subjects ({subjectData.length})
            </button>
            <button
              onClick={() => setFilterMode('at-risk')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors border ${
                filterMode === 'at-risk'
                  ? 'bg-white text-black border-white font-semibold shadow-xs'
                  : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10 hover:text-white'
              }`}
            >
              At Risk &lt;75% ({stats.atRiskCount})
            </button>
            <button
              onClick={() => setFilterMode('lecture')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors border hidden sm:inline-block ${
                filterMode === 'lecture'
                  ? 'bg-white text-black border-white font-semibold shadow-xs'
                  : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10 hover:text-white'
              }`}
            >
              Lectures Only
            </button>
            <button
              onClick={() => setFilterMode('lab')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors border hidden sm:inline-block ${
                filterMode === 'lab'
                  ? 'bg-white text-black border-white font-semibold shadow-xs'
                  : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10 hover:text-white'
              }`}
            >
              Labs Only
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/60 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/60 border border-white/20 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-white font-mono"
            >
              <option value="default">Default Order</option>
              <option value="percentage-asc">Lowest % First (At Risk)</option>
              <option value="percentage-desc">Highest % First</option>
            </select>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="bg-black/40 border border-white/15 rounded-xl p-4 sm:p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
                Attendance Percentage by Subject
              </span>
              <span className="text-[11px] text-white/50 hidden md:inline">
                (Hover or tap bar for detailed class breakdown)
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-white/80">
                <span className="w-2.5 h-2.5 rounded-xs bg-white inline-block"></span>
                <span>≥ 75% Safe</span>
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-300 inline-block"></span>
                <span>65-74%</span>
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-400 inline-block"></span>
                <span>&lt; 65%</span>
              </span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="py-12 text-center text-white/60 text-xs">
              No subjects matching the current filter.
            </div>
          ) : (
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 15, left: -10, bottom: 35 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="shortLabel"
                    stroke="rgba(255, 255, 255, 0.5)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 11, fontFamily: 'monospace' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    dy={5}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 0.5)"
                    tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 11, fontFamily: 'monospace' }}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    unit="%"
                  />
                  <Tooltip
                    content={<CustomChalkTooltip />}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  {/* Minimum Required 75% Attendance Reference Line */}
                  <ReferenceLine
                    y={75}
                    stroke="#ffffff"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: '75% Required Threshold',
                      position: 'top',
                      fill: '#ffffff',
                      fontSize: 10,
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    radius={[6, 6, 0, 0]}
                    animationDuration={800}
                  >
                    {chartData.map((entry) => {
                      // High-contrast chalkboard color assignment
                      let barColor = '#ffffff'; // Chalk White for safe
                      if (entry.percentage < 65) {
                        barColor = '#f87171'; // Critical red chalk
                      } else if (entry.percentage < 75) {
                        barColor = '#fcd34d'; // Amber warning chalk
                      }
                      return (
                        <Cell
                          key={`cell-${entry.code}`}
                          fill={barColor}
                          fillOpacity={0.9}
                          stroke="#ffffff"
                          strokeWidth={0.5}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Detailed Subject Quick-Adjust Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/80 font-chalk text-sm">
              Subject Attendance Quick Log &amp; Calculations
            </span>
            {onNavigateToAttendance && (
              <button
                onClick={onNavigateToAttendance}
                className="text-xs text-white/70 hover:text-white underline font-mono transition-colors"
              >
                View Full Attendance Sheet →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {chartData.slice(0, 6).map((sub) => (
              <div
                key={sub.code}
                className={`p-3.5 rounded-xl border transition-all ${
                  sub.percentage >= 75
                    ? 'bg-black/30 border-white/15 hover:border-white/30'
                    : 'bg-black/50 border-amber-500/30 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">
                      {sub.subject}
                    </span>
                    <span className="text-[10px] font-mono text-white/60 uppercase">
                      {sub.code} · {sub.type}
                    </span>
                  </div>
                  <div className={`px-2 py-0.5 rounded font-mono font-bold text-xs shrink-0 ${
                    sub.percentage >= 75
                      ? 'bg-white/10 text-white border border-white/30'
                      : sub.percentage >= 65
                      ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-950/70 text-rose-300 border border-rose-500/40'
                  }`}>
                    {sub.percentage}%
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      sub.percentage >= 75 ? 'bg-white' : sub.percentage >= 65 ? 'bg-amber-300' : 'bg-rose-400'
                    }`}
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span className="font-mono">
                    {sub.attended} / {sub.total} classes
                  </span>

                  {onUpdateAttendance && sub.classIds.length > 0 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickAdjust(sub, 1, 1)}
                        title="Mark Present (+1)"
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 text-[10px] font-mono transition-colors"
                      >
                        + Present
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(sub, 0, 1)}
                        title="Mark Absent (+0 attended, +1 total)"
                        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-rose-950 text-white/60 hover:text-rose-200 border border-white/15 text-[10px] font-mono transition-colors"
                      >
                        + Absent
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
