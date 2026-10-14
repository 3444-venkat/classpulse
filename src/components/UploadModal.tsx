import React, { useState } from 'react';
import { Upload, Sparkles, FileText, Check, AlertCircle, BookOpen, Layers, RefreshCw, ArrowRight, Mail, Send } from 'lucide-react';
import { StudentProfile, ClassItem, DayOfWeek, SubjectColor, LectureType } from '../types/timetable';
import { TIMETABLE_PRESETS } from '../data/sampleTimetables';
import { formatTime12h } from '../utils/notificationEngine';

interface UploadModalProps {
  onImportClasses: (newClasses: ClassItem[], mode: 'replace' | 'append') => void;
  onClose?: () => void;
  isModal?: boolean;
  profile?: StudentProfile;
  onSendTimetableEmail?: (classes: ClassItem[]) => void;
}

const COLOR_ROTATION: SubjectColor[] = ['blue', 'emerald', 'purple', 'amber', 'rose', 'cyan', 'indigo', 'orange', 'teal'];

export const UploadModal: React.FC<UploadModalProps> = ({
  onImportClasses,
  onClose,
  isModal = false,
  profile,
  onSendTimetableEmail,
}) => {
  const [alsoEmail, setAlsoEmail] = useState(true);
  const [activeTab, setActiveTab] = useState<'image' | 'text' | 'presets' | 'json'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted preview before saving
  const [previewClasses, setPreviewClasses] = useState<ClassItem[] | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParseWithGemini = async () => {
    if (!imagePreview && !textInput.trim()) {
      setErrorMessage('Please upload a timetable image or paste your schedule text first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('Analyzing timetable with Gemini AI...');

    try {
      const response = await fetch('/api/parse-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview || undefined,
          mimeType: selectedFile?.type || 'image/jpeg',
          textContent: textInput.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract classes from timetable.');
      }

      if (!data.classes || data.classes.length === 0) {
        throw new Error('No lectures could be extracted. Please check the image resolution or text format.');
      }

      // Map extracted classes to internal ClassItem format
      const formattedClasses: ClassItem[] = data.classes.map((item: any, idx: number) => {
        const color = COLOR_ROTATION[idx % COLOR_ROTATION.length];
        const validDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const day: DayOfWeek = validDays.includes(item.day) ? item.day : 'Monday';
        const validTypes: LectureType[] = ['lecture', 'lab', 'seminar', 'tutorial', 'exam'];
        const type: LectureType = validTypes.includes(item.type?.toLowerCase()) ? item.type.toLowerCase() : 'lecture';

        return {
          id: `extracted-${Date.now()}-${idx}`,
          subject: item.subject || 'Class',
          code: item.code || '',
          day,
          startTime: item.startTime || '09:00',
          endTime: item.endTime || '10:15',
          room: item.room || 'Room TBD',
          instructor: item.instructor || '',
          type,
          color,
          notes: item.notes || '',
          attendance: { attended: 0, total: 0 },
        };
      });

      setPreviewClasses(formattedClasses);
      setStatusMessage(`Successfully extracted ${formattedClasses.length} lectures! Review below.`);
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      setErrorMessage(err.message || 'Error processing timetable. Please try another image or manual entry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewClasses && previewClasses.length > 0) {
      onImportClasses(previewClasses, importMode);
      if (alsoEmail && onSendTimetableEmail) {
        onSendTimetableEmail(previewClasses);
      }
      setPreviewClasses(null);
      setSelectedFile(null);
      setImagePreview(null);
      setTextInput('');
      if (onClose) onClose();
    }
  };

  const handleApplyPreset = (presetClasses: ClassItem[]) => {
    onImportClasses(presetClasses, 'replace');
    if (alsoEmail && onSendTimetableEmail) {
      onSendTimetableEmail(presetClasses);
    }
    if (onClose) onClose();
  };

  return (
    <div className="bg-[#131916] border border-white/25 rounded-2xl p-6 shadow-xl space-y-6 text-white relative z-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-chalk">
            Upload &amp; Scan Timetable
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Upload a photo of your class schedule, paste your routine, or choose a university template. Our AI automatically extracts your lectures and configures 10-minute warning notifications.
          </p>
        </div>

        {profile && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/20 rounded-xl text-xs">
            <span className="text-base">{profile.avatar}</span>
            <div>
              <span className="font-bold text-white">{profile.name}</span>
              <span className="text-white/60 block text-[11px] font-mono">{profile.email}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/15 pb-2">
        <button
          onClick={() => { setActiveTab('image'); setErrorMessage(null); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'image'
              ? 'bg-white text-black font-semibold'
              : 'text-white/70 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Timetable Photo</span>
        </button>

        <button
          onClick={() => { setActiveTab('text'); setErrorMessage(null); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'text'
              ? 'bg-white text-black font-semibold'
              : 'text-white/70 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Paste Schedule Text</span>
        </button>

        <button
          onClick={() => { setActiveTab('presets'); setErrorMessage(null); }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'presets'
              ? 'bg-white text-black font-semibold'
              : 'text-white/70 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>College Presets</span>
        </button>
      </div>

      {/* Error / Status Alerts */}
      {errorMessage && (
        <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {statusMessage && !errorMessage && (
        <div className="p-3 bg-black/50 border border-white/25 rounded-xl text-xs text-white/90 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* TAB 1: Image Upload */}
      {activeTab === 'image' && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-white/30 hover:border-white rounded-2xl p-6 text-center cursor-pointer transition-colors bg-black/40"
            onClick={() => document.getElementById('timetable-file-input')?.click()}
          >
            <input
              id="timetable-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="space-y-3">
                <img
                  src={imagePreview}
                  alt="Timetable Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-sm border border-white/20 object-contain"
                />
                <p className="text-xs text-white/60">
                  {selectedFile?.name} · Click or drag another image to replace
                </p>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/20">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-white">
                  Drop your timetable photo here, or click to browse
                </div>
                <p className="text-xs text-white/50">
                  Supports photos of notice boards, printed schedules, screenshots (PNG, JPG, WebP)
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-white/60">
              AI will extract lecture times, days, classrooms, and professor names automatically.
            </span>
            <button
              onClick={handleParseWithGemini}
              disabled={!imagePreview || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-400 rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract Timetable with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Text Paste */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              Paste your schedule routine or syllabus text:
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Example:\nMonday 9:00 AM - 10:15 AM Data Structures & Algorithms, Room 302, Prof. Reed\nTuesday 11:15 AM Database Systems, Lab 1, Dr. Patel\nWednesday 2:00 PM Operating Systems Lab, Hall B...`}
              rows={6}
              className="w-full text-xs font-mono p-3 bg-black/50 border border-white/20 text-white rounded-xl focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleParseWithGemini}
              disabled={!textInput.trim() || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-black bg-white hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-400 rounded-xl transition-colors shadow-sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract Schedule with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: College Presets */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIMETABLE_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-4 bg-black/40 border border-white/20 rounded-xl hover:border-white/50 transition-colors flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider block font-mono">
                  {preset.category}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  {preset.name}
                </h4>
                <p className="text-xs text-white/60 mt-1">
                  {preset.description}
                </p>
              </div>

              <button
                onClick={() => handleApplyPreset(preset.classes)}
                className="w-full py-2 px-3 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Load This Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Extracted Preview Review Drawer */}
      {previewClasses && previewClasses.length > 0 && (
        <div className="p-4 bg-black/60 border border-white/20 rounded-xl space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h4 className="text-sm font-bold text-white">
                Extracted Lectures ({previewClasses.length})
              </h4>
              <p className="text-xs text-white/50">
                Preview the extracted routine before saving.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-white/80 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-white"
                />
                <span>Replace Current</span>
              </label>

              <label className="text-xs text-white/80 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="accent-white"
                />
                <span>Add to Existing</span>
              </label>

              {profile?.email && (
                <label className="text-xs text-white bg-white/10 px-2.5 py-1 rounded-md flex items-center gap-1.5 cursor-pointer font-medium border border-white/20">
                  <input
                    type="checkbox"
                    checked={alsoEmail}
                    onChange={(e) => setAlsoEmail(e.target.checked)}
                    className="accent-white"
                  />
                  <span>Email copy to {profile.email}</span>
                </label>
              )}

              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Timetable &amp; Enable 10m Alerts</span>
              </button>
            </div>
          </div>

          {/* List of extracted classes */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {previewClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-3 bg-black/40 border border-white/15 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">{cls.subject}</span>{' '}
                  <span className="text-white/50 font-mono text-[11px]">
                    ({cls.day} {formatTime12h(cls.startTime)} - {formatTime12h(cls.endTime)})
                  </span>
                </div>
                <div className="text-white/60">
                  {cls.room} {cls.instructor && `· ${cls.instructor}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
