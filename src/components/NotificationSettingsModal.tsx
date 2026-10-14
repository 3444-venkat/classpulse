import React from 'react';
import { X, Bell, Volume2, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { NotificationSettings, SoundType } from '../types/timetable';
import { audioSynth } from '../utils/audio';
import { getBrowserNotificationPermission, requestNotificationPermission } from '../utils/notificationEngine';

interface NotificationSettingsModalProps {
  settings: NotificationSettings;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: NotificationSettings) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSave,
}) => {
  const [current, setCurrent] = React.useState<NotificationSettings>(settings);
  const [permission, setPermission] = React.useState<NotificationPermission | 'unsupported'>('default');

  React.useEffect(() => {
    setCurrent(settings);
    setPermission(getBrowserNotificationPermission());
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      setCurrent((prev) => ({ ...prev, enableBrowserNotifications: true }));
    }
  };

  const handlePreviewSound = (sound: SoundType) => {
    audioSynth.playAlert(sound, current.volume);
  };

  const handleSave = () => {
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141b18] text-white rounded-2xl border border-white/25 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-white" />
            <h3 className="text-base font-bold text-white font-chalk">
              Lecture Alert Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Permission card */}
          <div className="p-4 bg-black/40 border border-white/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Desktop Push Notifications
              </span>
              {permission === 'granted' ? (
                <span className="text-[11px] font-semibold text-white bg-white/20 px-2 py-0.5 rounded flex items-center gap-1 border border-white/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Enabled
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-500/40">
                  <AlertCircle className="w-3 h-3 text-amber-300" />
                  Not Active
                </span>
              )}
            </div>
            <p className="text-xs text-white/70">
              Allows ClassPulse to pop up reminders on your laptop or phone even when this tab is in the background.
            </p>
            {permission !== 'granted' && permission !== 'unsupported' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full mt-2 py-1.5 px-3 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors"
              >
                Grant Browser Permission
              </button>
            )}
          </div>

          {/* Core Alert Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 font-chalk text-sm">
              Notification Triggers
            </h4>

            {/* 10 MIN BEFORE - Primary Requirement */}
            <label className="p-3 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors bg-white/10 border-white/40">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>10 Minutes Before Lecture</span>
                  <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.2 rounded">
                    Core
                  </span>
                </div>
                <p className="text-[11px] text-white/70 mt-0.5">
                  Gives you 10 minutes to walk to the lecture hall or prepare your notebook
                </p>
              </div>
              <input
                type="checkbox"
                checked={current.notify10MinBefore}
                onChange={(e) => setCurrent({ ...current, notify10MinBefore: e.target.checked })}
                className="w-4 h-4 accent-white rounded"
              />
            </label>

            {/* At start time */}
            <label className="p-3 border border-white/20 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors">
              <div>
                <div className="text-xs font-bold text-white">
                  Exact Class Start Time
                </div>
                <p className="text-[11px] text-white/70 mt-0.5">
                  Notifies right as the lecture begins (0 min remaining)
                </p>
              </div>
              <input
                type="checkbox"
                checked={current.notifyAtStart}
                onChange={(e) => setCurrent({ ...current, notifyAtStart: e.target.checked })}
                className="w-4 h-4 accent-white rounded"
              />
            </label>

            {/* 5 min & 15 min optional */}
            <div className="grid grid-cols-2 gap-2">
              <label className="p-2.5 border border-white/20 rounded-xl flex items-center justify-between gap-2 cursor-pointer hover:bg-white/5">
                <span className="text-xs text-white/80">15 min early</span>
                <input
                  type="checkbox"
                  checked={current.notify15MinBefore}
                  onChange={(e) => setCurrent({ ...current, notify15MinBefore: e.target.checked })}
                  className="w-3.5 h-3.5 accent-white rounded"
                />
              </label>

              <label className="p-2.5 border border-white/20 rounded-xl flex items-center justify-between gap-2 cursor-pointer hover:bg-white/5">
                <span className="text-xs text-white/80">5 min urgent</span>
                <input
                  type="checkbox"
                  checked={current.notify5MinBefore}
                  onChange={(e) => setCurrent({ ...current, notify5MinBefore: e.target.checked })}
                  className="w-3.5 h-3.5 accent-white rounded"
                />
              </label>
            </div>
          </div>

          {/* Audio Chime Settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 font-chalk text-sm">
              Audio Chimes &amp; Bell Sound
            </h4>

            <label className="flex items-center justify-between text-xs font-semibold text-white cursor-pointer">
              <span>Play Audio Chime on Alerts</span>
              <input
                type="checkbox"
                checked={current.enableAudioChimes}
                onChange={(e) => setCurrent({ ...current, enableAudioChimes: e.target.checked })}
                className="w-4 h-4 accent-white rounded"
              />
            </label>

            {current.enableAudioChimes && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  {(['bell', 'chime', 'ping', 'marimba'] as SoundType[]).map((sound) => (
                    <div
                      key={sound}
                      className={`p-2 border rounded-lg flex items-center justify-between ${
                        current.soundType === sound
                          ? 'border-white bg-white/15'
                          : 'border-white/20 bg-black/40'
                      }`}
                    >
                      <label className="text-xs font-medium capitalize text-white cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="soundType"
                          checked={current.soundType === sound}
                          onChange={() => setCurrent({ ...current, soundType: sound })}
                          className="mr-1.5 accent-white"
                        />
                        {sound === 'bell' ? 'Campus Bell' : sound}
                      </label>
                      <button
                        type="button"
                        onClick={() => handlePreviewSound(sound)}
                        className="p-1 text-white/60 hover:text-white rounded"
                        title="Preview sound"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-3 pt-1">
                  <Volume2 className="w-4 h-4 text-white/60 shrink-0" />
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={current.volume}
                    onChange={(e) => setCurrent({ ...current, volume: parseFloat(e.target.value) })}
                    className="w-full accent-white"
                  />
                  <span className="font-mono text-xs text-white/70 w-10 text-right tabular-nums">
                    {Math.round(current.volume * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#0e1411] border-t border-white/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white/70 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
