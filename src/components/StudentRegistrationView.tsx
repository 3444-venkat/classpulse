import React, { useState } from 'react';
import { User, Mail, School, BookOpen, Check, ArrowRight, ShieldCheck, Sparkles, Bell, Calendar, Award } from 'lucide-react';
import { StudentProfile, ClassItem } from '../types/timetable';
import { CS_TIMETABLE, PREMED_TIMETABLE, BUSINESS_TIMETABLE } from '../data/sampleTimetables';
import { googleSignIn } from '../utils/googleAuth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface StudentRegistrationViewProps {
  initialProfile?: StudentProfile;
  onCompleteRegistration: (profile: StudentProfile, initialClasses?: ClassItem[]) => void;
}

const AVATAR_OPTIONS = ['👨‍🎓', '👩‍🎓', '🧑‍💻', '👩‍💻', '🔬', '📚', '⚡', '💡', '🎓'];

const DEGREE_TEMPLATES = [
  {
    id: 'cs',
    title: 'Computer Science & Engineering',
    category: 'B.Tech / B.E / B.S',
    classes: CS_TIMETABLE,
    desc: 'Algorithms, OS Lab, Database Systems, Computer Networks (15 classes/week)',
  },
  {
    id: 'premed',
    title: 'Pre-Med & Biomedical Sciences',
    category: 'MBBS / B.Sc / Pre-Med',
    classes: PREMED_TIMETABLE,
    desc: 'Human Anatomy, Lab Dissection, Biochemistry & Physiology (7 classes/week)',
  },
  {
    id: 'business',
    title: 'Business Administration & Management',
    category: 'BBA / MBA / Economics',
    classes: BUSINESS_TIMETABLE,
    desc: 'Corporate Finance, Marketing Strategy, Accounting & Analytics (6 classes/week)',
  },
];

export const StudentRegistrationView: React.FC<StudentRegistrationViewProps> = ({
  initialProfile,
  onCompleteRegistration,
}) => {
  const [name, setName] = useState(initialProfile?.name || 'Venkat Gowda');
  const [studentId, setStudentId] = useState(initialProfile?.studentId || '21CS049');
  const [email, setEmail] = useState(initialProfile?.email || 'jvenkatgowda@gmail.com');
  const [institution, setInstitution] = useState(initialProfile?.institution || 'BMS College of Engineering');
  const [department, setDepartment] = useState(initialProfile?.department || 'Computer Science & Engineering');
  const [academicYear, setAcademicYear] = useState(initialProfile?.academicYear || '3rd Year (B.Tech)');
  const [semester, setSemester] = useState(initialProfile?.semester || 'Semester 5');
  const [section, setSection] = useState(initialProfile?.section || 'Section B');
  const [avatar, setAvatar] = useState(initialProfile?.avatar || '👨‍🎓');
  
  // Notification options
  const [send10MinEmailAlert, setSend10MinEmailAlert] = useState(true);
  const [sendDailyDigestEmail, setSendDailyDigestEmail] = useState(true);

  // Initial schedule template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<'cs' | 'premed' | 'business' | 'empty'>('cs');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !studentId.trim()) {
      alert('Please fill out the student name, registration number, and email.');
      return;
    }

    const newProfile: StudentProfile = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      studentId: studentId.trim(),
      email: email.trim(),
      institution: institution.trim() || 'College of Engineering',
      department: department.trim() || 'Computer Science',
      academicYear,
      semester,
      section,
      avatar,
      isRegistered: true,
      emailAlertsEnabled: true,
      send10MinEmailAlert,
      sendDailyDigestEmail,
      createdAt: new Date().toISOString(),
    };

    let chosenClasses: ClassItem[] | undefined;
    if (selectedTemplateId === 'cs') chosenClasses = CS_TIMETABLE;
    else if (selectedTemplateId === 'premed') chosenClasses = PREMED_TIMETABLE;
    else if (selectedTemplateId === 'business') chosenClasses = BUSINESS_TIMETABLE;

    onCompleteRegistration(newProfile, chosenClasses);
  };

  const handleQuickRegister = () => {
    const quickProfile: StudentProfile = {
      id: 'student-primary',
      name: 'Venkat Gowda',
      studentId: '21CS049',
      email: 'jvenkatgowda@gmail.com',
      institution: 'BMS College of Engineering',
      department: 'Computer Science & Engineering',
      academicYear: '3rd Year (B.Tech)',
      semester: 'Semester 5',
      section: 'Section B',
      avatar: '👨‍🎓',
      isRegistered: true,
      emailAlertsEnabled: true,
      send10MinEmailAlert: true,
      sendDailyDigestEmail: true,
      createdAt: new Date().toISOString(),
    };
    onCompleteRegistration(quickProfile, CS_TIMETABLE);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const res = await googleSignIn();
      if (res?.user) {
        if (res.user.displayName) setName(res.user.displayName);
        if (res.user.email) setEmail(res.user.email);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1210] chalk-board-bg text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased relative">
      <div className="max-w-4xl w-full mx-auto space-y-8 relative z-10">
        
        {/* Top Student Notice Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-2 font-chalk">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Dedicated Student Platform · Blackboard Edition</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-chalk">
            ClassPulse Student Registration
          </h1>
          <p className="text-sm text-white/70 max-w-xl mx-auto">
            This app is exclusively for college and university students. Register your student identity to manage your timetable, receive automated 10-minute lecture warning alerts, and email notifications.
          </p>
        </div>

        {/* 2-Column Split: Registration Form & Live Student ID Card Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Registration Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#131916] text-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/25">
            <div className="flex items-center justify-between pb-4 border-b border-white/20 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Student Registration Form</span>
                </h2>
                <span className="text-xs text-white/50">
                  Academic Year 2026–2027 Registration
                </span>
              </div>
              <button
                type="button"
                onClick={handleQuickRegister}
                className="text-xs font-semibold text-black bg-white hover:bg-neutral-200 px-2.5 py-1 rounded-md border border-white transition-colors"
                title="Fill in 1 click as Venkat Gowda"
              >
                Quick 1-Click Register
              </button>
            </div>

            {/* Google One-Click Registration & Gmail Connection */}
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">
                  Connect with Google for Gmail Alerts
                </span>
                <span className="text-[11px] text-white/70">
                  Autofills student details and enables direct Gmail lecture alerts.
                </span>
              </div>
              <GoogleSignInButton
                onClick={handleGoogleSignIn}
                isLoading={isGoogleLoading}
                text="Sign in with Google"
                className="shrink-0 text-xs py-2 px-3 bg-neutral-900 border border-white/30 text-white hover:bg-neutral-800"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Student Avatar Badge
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center border transition-all ${
                        avatar === av
                          ? 'border-white bg-white/20 scale-110 shadow-sm'
                          : 'border-white/20 bg-black/40 hover:bg-white/10'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name and Student ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Venkat Gowda"
                    className="w-full text-xs p-2.5 bg-black/40 border border-white/25 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Roll No / Reg. Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 21CS049 or STU-891"
                    className="w-full text-xs font-mono p-2.5 bg-black/40 border border-white/25 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Student Email */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Student Email * (Used for 10-Minute Lecture Warnings &amp; Timetable Delivery)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. jvenkatgowda@gmail.com"
                    className="w-full text-xs p-2.5 pl-8 bg-black/40 border border-white/25 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white focus:outline-none"
                  />
                  <Mail className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-3" />
                </div>
              </div>

              {/* College & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    College / University Name
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. BMS College of Engineering"
                    className="w-full text-xs p-2.5 bg-black/40 border border-white/25 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Department / Branch / Major
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full text-xs p-2.5 bg-black/40 border border-white/25 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Year, Semester & Section */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full text-xs p-2.5 bg-black/70 border border-white/25 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white focus:outline-none"
                  >
                    <option value="1st Year (Freshman)">1st Year</option>
                    <option value="2nd Year (Sophomore)">2nd Year</option>
                    <option value="3rd Year (B.Tech)">3rd Year</option>
                    <option value="4th Year (Senior)">4th Year</option>
                    <option value="Post-Graduate / Masters">Post-Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full text-xs p-2.5 bg-black/70 border border-white/25 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white focus:outline-none"
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. Section B"
                    className="w-full text-xs p-2.5 bg-black/40 border border-white/25 rounded-lg focus:border-white focus:ring-1 focus:ring-white text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Initial Timetable Choice */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Initial Timetable Setup
                </label>
                <div className="space-y-2">
                  {DEGREE_TEMPLATES.map((tmpl) => (
                    <label
                      key={tmpl.id}
                      className={`p-2.5 border rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        selectedTemplateId === tmpl.id
                          ? 'border-white bg-white/10 font-semibold'
                          : 'border-white/15 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="routineTemplate"
                          checked={selectedTemplateId === tmpl.id}
                          onChange={() => setSelectedTemplateId(tmpl.id as any)}
                          className="accent-white"
                        />
                        <div>
                          <span className="text-white">{tmpl.title}</span>
                          <span className="text-[11px] text-white/60 block font-normal">{tmpl.desc}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email Alert Toggles */}
              <div className="space-y-2 pt-2 border-t border-white/20 text-xs">
                <label className="flex items-center gap-2 text-white/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={send10MinEmailAlert}
                    onChange={(e) => setSend10MinEmailAlert(e.target.checked)}
                    className="w-4 h-4 accent-white rounded"
                  />
                  <span>
                    Send me an <strong className="text-white">email reminder 10 minutes before</strong> every lecture starts
                  </span>
                </label>
                <label className="flex items-center gap-2 text-white/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendDailyDigestEmail}
                    onChange={(e) => setSendDailyDigestEmail(e.target.checked)}
                    className="w-4 h-4 accent-white rounded"
                  />
                  <span>Email me my daily morning class schedule at 8:00 AM</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-sm font-bold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Complete Student Registration &amp; Open Timetable</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Digital Student ID Card Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs uppercase tracking-wider font-bold text-white/60 block text-center lg:text-left font-chalk">
              Live Digital Student Pass Preview
            </span>

            {/* Student ID Card Simulation */}
            <div className="bg-[#18211d] border border-white/30 rounded-2xl p-6 shadow-2xl text-white relative overflow-hidden">
              {/* Top Card Strip */}
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs font-mono">
                    CP
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold block leading-none">
                      Academic Pass
                    </span>
                    <span className="text-xs font-bold text-white">
                      {institution || 'BMS College of Engineering'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] bg-white/20 text-white border border-white/40 px-2 py-0.5 rounded-full font-bold">
                  STUDENT
                </span>
              </div>

              {/* Photo & Details */}
              <div className="flex items-center gap-4 my-5">
                <div className="w-16 h-16 rounded-2xl bg-black/60 border-2 border-white/40 flex items-center justify-center text-4xl shadow-inner shrink-0">
                  {avatar}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <h3 className="text-lg font-bold text-white truncate font-chalk">
                    {name || 'Student Name'}
                  </h3>
                  <div className="font-mono text-xs text-white/90 font-semibold">
                    REG: {studentId || '21CS049'}
                  </div>
                  <div className="text-xs text-white/70 truncate">
                    {department || 'Computer Science'}
                  </div>
                  <div className="text-[11px] text-white/50">
                    {academicYear} · {semester} {section && `(${section})`}
                  </div>
                </div>
              </div>

              {/* Notification Badge on Card */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/20 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 font-medium">10-Min Alert Protocol:</span>
                  <span className="text-white font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 font-medium">Registered Mail:</span>
                  <span className="text-white font-mono truncate max-w-[170px]">{email}</span>
                </div>
              </div>

              {/* Barcode Strip */}
              <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-white/50">
                <div className="font-mono text-[9px] tracking-widest text-white/60 uppercase">
                  ||||| ||| ||||||| |||| || ||||||
                </div>
                <span className="text-[10px] font-mono text-white/60">
                  AY 2026-27
                </span>
              </div>
            </div>

            {/* Why Registration is Required callout */}
            <div className="p-4 bg-[#141b18] border border-white/20 rounded-xl text-xs text-white/80 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-white" />
                Why Register as a Student?
              </span>
              <ul className="space-y-1 text-white/60 list-disc list-inside text-[11px]">
                <li>Strict student-only lecture timing tracker</li>
                <li>Automated 10-minute warning email and audio chimes</li>
                <li>AI timetable OCR scanner customized to your roll number &amp; branch</li>
                <li>Attendance requirement tracker (&ge;75% minimum compliance)</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
