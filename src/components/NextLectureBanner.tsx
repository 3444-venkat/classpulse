import React from 'react';
import { Bell, MapPin, User, Clock, ArrowRight, Play, FastForward, RotateCcw } from 'lucide-react';
import { StudentProfile, ClassItem } from '../types/timetable';
import { formatTime12h, getActiveOrNextClass, timeStringToMinutes, minutesToTimeString } from '../utils/notificationEngine';
import { COLOR_MAP } from '../utils/theme';
import { Mail } from 'lucide-react';

interface NextLectureBannerProps {
  classes: ClassItem[];
  currentTime: Date;
  profile?: StudentProfile;
  simulatedTimeMinutes: number | null;
  onSetSimulatedTime: (minutes: number | null) => void;
  onTriggerTestAlert: () => void;
  onEmail10MinAlert?: () => void;
  onOpenAddModal: () => void;
}

export const NextLectureBanner: React.FC<NextLectureBannerProps> = ({
  classes,
  currentTime,
  profile,
  simulatedTimeMinutes,
  onSetSimulatedTime,
  onTriggerTestAlert,
  onEmail10MinAlert,
  onOpenAddModal,
}) => {
  const [showSimulator, setShowSimulator] = React.useState(false);

  const { activeClass, nextClass, secondsUntilNext } = getActiveOrNextClass(classes, currentTime);

  // Format seconds into HH:MM:SS or MM:SS
  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00:00';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const isUnder10Mins = nextClass && secondsUntilNext > 0 && secondsUntilNext <= 600;

  // Active class progress
  let activeProgress = 0;
  let activeRemainingMins = 0;
  if (activeClass) {
    const startM = timeStringToMinutes(activeClass.startTime);
    const endM = timeStringToMinutes(activeClass.endTime);
    const currentM = currentTime.getHours() * 60 + currentTime.getMinutes() + currentTime.getSeconds() / 60;
    const duration = Math.max(1, endM - startM);
    const elapsed = Math.max(0, currentM - startM);
    activeProgress = Math.min(100, Math.round((elapsed / duration) * 100));
    activeRemainingMins = Math.max(0, Math.round(endM - currentM));
  }

  const currentHours = currentTime.getHours().toString().padStart(2, '0');
  const currentMins = currentTime.getMinutes().toString().padStart(2, '0');
  const currentSecs = currentTime.getSeconds().toString().padStart(2, '0');

  return (
    <div className="bg-[#131916] border border-white/25 rounded-2xl shadow-xl overflow-hidden mb-8 relative z-10">
      {/* Blackboard Top Accent Banner */}
      <div className={`px-6 py-6 border-b transition-colors relative ${
        isUnder10Mins
          ? 'bg-white text-black border-white'
          : activeClass
          ? 'bg-[#18211d] text-white border-white/20'
          : 'bg-[#18211d] text-white border-white/20'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Info Column */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs tracking-wider uppercase font-semibold">
              {activeClass ? (
                <span className="flex items-center gap-1.5 text-white bg-black/60 px-2.5 py-0.5 rounded border border-white/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Class In Session
                </span>
              ) : isUnder10Mins ? (
                <span className="flex items-center gap-1.5 bg-black text-white px-2.5 py-0.5 rounded font-bold shadow-sm">
                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                  10-Minute Warning Active
                </span>
              ) : nextClass ? (
                <span className="flex items-center gap-1.5 text-white/90">
                  <Clock className="w-3.5 h-3.5" />
                  Next Upcoming Lecture
                </span>
              ) : (
                <span className="text-white/60">Schedule Complete For Today</span>
              )}

              <span className="text-white/40">·</span>
              <span className={`font-mono tabular-nums ${isUnder10Mins ? 'text-black font-bold' : 'text-white/80'}`}>
                Current Time: {currentHours}:{currentMins}:{currentSecs}
              </span>
              {simulatedTimeMinutes !== null && (
                <span className="bg-white text-black px-2 py-0.5 rounded text-[11px] font-bold shadow-xs">
                  Simulated
                </span>
              )}
            </div>

            {/* Subject Title */}
            {activeClass ? (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {activeClass.subject}
                </h1>
                <p className="text-sm text-white/80 mt-1 flex items-center gap-4 flex-wrap">
                  {activeClass.code && <span className="font-mono text-white/90 border border-white/20 px-1.5 py-0.5 rounded text-xs">{activeClass.code}</span>}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-white/60" />
                    {activeClass.room}
                  </span>
                  {activeClass.instructor && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-white/60" />
                      {activeClass.instructor}
                    </span>
                  )}
                  <span>·</span>
                  <span>{formatTime12h(activeClass.startTime)} - {formatTime12h(activeClass.endTime)}</span>
                </p>
              </div>
            ) : nextClass ? (
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isUnder10Mins ? 'text-black font-black' : 'text-white'}`}>
                  {nextClass.subject}
                </h1>
                <p className={`text-sm mt-1 flex items-center gap-4 flex-wrap ${isUnder10Mins ? 'text-black/80 font-medium' : 'text-white/80'}`}>
                  {nextClass.code && <span className="font-mono border border-current px-1.5 py-0.5 rounded text-xs">{nextClass.code}</span>}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 opacity-70" />
                    {nextClass.room}
                  </span>
                  {nextClass.instructor && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 opacity-70" />
                      {nextClass.instructor}
                    </span>
                  )}
                  <span>·</span>
                  <span>Starts at {formatTime12h(nextClass.startTime)}</span>
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  No More Classes Today
                </h1>
                <p className="text-sm text-white/60 mt-1">
                  You are all caught up. Check your weekly schedule or add new lectures anytime.
                </p>
              </div>
            )}
          </div>

          {/* Right Countdown & Primary Status */}
          <div className="flex flex-col sm:items-end justify-center shrink-0">
            {activeClass ? (
              <div className="text-right">
                <span className="text-xs uppercase text-white/70 tracking-wider font-semibold block mb-1">
                  Time Remaining
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-black tracking-tight tabular-nums text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                  {activeRemainingMins} mins
                </div>
                <div className="w-48 bg-white/20 h-2 rounded-full overflow-hidden mt-2 ml-auto">
                  <div
                    className="bg-white h-full transition-all duration-500 rounded-full"
                    style={{ width: `${activeProgress}%` }}
                  />
                </div>
              </div>
            ) : nextClass ? (
              <div className="sm:text-right">
                <span className={`text-xs uppercase tracking-wider font-semibold block mb-1 ${isUnder10Mins ? 'text-black/80 font-bold' : 'text-white/70'}`}>
                  {isUnder10Mins ? 'Lecture Starts In' : 'Starts In'}
                </span>
                <div className={`text-3xl sm:text-4xl font-mono font-black tracking-tight tabular-nums ${isUnder10Mins ? 'text-black' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'}`}>
                  {formatCountdown(secondsUntilNext)}
                </div>
                <span className={`text-xs mt-1 block ${isUnder10Mins ? 'text-black font-semibold' : 'text-white/70'}`}>
                  {isUnder10Mins ? '🔔 10-minute alert sent to your device' : 'Reminder scheduled 10 min prior'}
                </span>
              </div>
            ) : (
              <div>
                <button
                  onClick={onOpenAddModal}
                  className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap shadow-md"
                >
                  + Add Lecture
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Bar: Test alerts & Time Travel Simulator */}
      <div className="px-6 py-3 bg-[#0d1210] flex items-center justify-between gap-4 flex-wrap text-xs text-white/80 border-t border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-medium text-white flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-white" />
            Notification Rules:
          </span>
          <span className="text-white/70">
            Automatically notifies <strong className="text-white font-semibold">10 minutes before</strong> every class + sound chime
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick trigger test */}
          <button
            onClick={onTriggerTestAlert}
            className="px-3 py-1 font-medium text-white bg-white/10 hover:bg-white/20 border border-white/25 rounded-md transition-colors"
          >
            Send Test Alert
          </button>

          {/* Quick 10m Warning Email */}
          {onEmail10MinAlert && (
            <button
              onClick={onEmail10MinAlert}
              className="px-3 py-1 font-medium text-black bg-white hover:bg-neutral-200 border border-white rounded-md transition-colors flex items-center gap-1.5 font-semibold"
              title={`Email 10-minute warning alert to ${profile?.email || 'student email'}`}
            >
              <Mail className="w-3.5 h-3.5 text-black" />
              <span>Email 10m Alert</span>
            </button>
          )}

          {/* Time simulation button */}
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className={`px-3 py-1 font-medium rounded-md border transition-colors flex items-center gap-1.5 ${
              showSimulator || simulatedTimeMinutes !== null
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-white/10 text-white border-white/25 hover:bg-white/20'
            }`}
          >
            <FastForward className="w-3 h-3" />
            <span>{simulatedTimeMinutes !== null ? 'Time Simulator (Active)' : 'Fast-Forward Test'}</span>
          </button>
        </div>
      </div>

      {/* Simulator Drawer for testing */}
      {showSimulator && (
        <div className="p-4 bg-[#141a17] border-t border-white/20 text-xs text-white">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
            <div>
              <span className="font-semibold text-white">Interactive Lecture Time Simulator:</span>{' '}
              <span className="text-white/70">
                Slide the clock forward or backward to test the exact 10-minute notification triggers without waiting for real class times!
              </span>
            </div>
            {simulatedTimeMinutes !== null && (
              <button
                onClick={() => onSetSimulatedTime(null)}
                className="flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white underline"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to Real Clock
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3">
            <span className="font-mono text-white/80 text-xs w-16 text-right">07:00 AM</span>
            <input
              type="range"
              min={7 * 60}
              max={20 * 60}
              step={5}
              value={
                simulatedTimeMinutes !== null
                  ? simulatedTimeMinutes
                  : currentTime.getHours() * 60 + currentTime.getMinutes()
              }
              onChange={(e) => onSetSimulatedTime(parseInt(e.target.value, 10))}
              className="w-full accent-white cursor-pointer"
            />
            <span className="font-mono text-white/80 text-xs w-16">08:00 PM</span>
          </div>

          {/* Quick jump presets to test 10-min alerts for next class */}
          {nextClass && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-white/60">Quick Test Shortcuts:</span>
              <button
                onClick={() => {
                  const startM = timeStringToMinutes(nextClass.startTime);
                  onSetSimulatedTime(startM - 10);
                }}
                className="px-2.5 py-1 bg-white text-black font-semibold rounded text-xs hover:bg-neutral-200"
              >
                Set to 10 min before {nextClass.subject} ({minutesToTimeString(timeStringToMinutes(nextClass.startTime) - 10)})
              </button>
              <button
                onClick={() => {
                  const startM = timeStringToMinutes(nextClass.startTime);
                  onSetSimulatedTime(startM);
                }}
                className="px-2.5 py-1 bg-white/10 text-white border border-white/30 rounded text-xs hover:bg-white/20 font-medium"
              >
                Set to Exact Start Time ({nextClass.startTime})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
