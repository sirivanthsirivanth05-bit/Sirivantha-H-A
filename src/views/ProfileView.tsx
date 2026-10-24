import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Download,
  Upload,
  Cpu,
  ShieldCheck,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Flame,
  Award,
  Zap,
  Sun,
  Moon,
  Coffee,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { StreakCounterWidget } from '../components/StreakCounterWidget';

export const ProfileView: React.FC = () => {
  const {
    profile,
    updateProfile,
    addSubject,
    removeSubject,
    resetToDemoData,
    exportDataJson,
    importDataJson,
    aiStatus,
    refreshAiStatus,
    streakData,
    activeStreak,
    allMilestones,
    triggerMilestoneCelebration,
  } = useStudy();

  // Profile form state
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    university: profile.university,
    major: profile.major,
    yearOfStudy: profile.yearOfStudy,
    targetGpa: profile.targetGpa,
    dailyGoalHours: profile.dailyGoalHours,
    studyPreference: profile.studyPreference || 'morning',
    preferredStartTime: profile.preferredStartTime || '08:30 AM',
    breakIntervalMinutes: profile.breakIntervalMinutes || 10,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // New subject state
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('#0D9488');
  const [newSubjExamDate, setNewSubjExamDate] = useState('');

  // Diagnostics state
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formData.name.trim(),
      email: formData.email.trim(),
      university: formData.university.trim(),
      major: formData.major.trim(),
      yearOfStudy: formData.yearOfStudy.trim(),
      targetGpa: formData.targetGpa.trim(),
      dailyGoalHours: Number(formData.dailyGoalHours) || 4,
      studyPreference: formData.studyPreference as any,
      preferredStartTime: formData.preferredStartTime,
      breakIntervalMinutes: Number(formData.breakIntervalMinutes) || 10,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Add new course subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    addSubject({
      name: newSubjName.trim(),
      color: newSubjColor,
      examDate: newSubjExamDate || undefined,
    });

    setNewSubjName('');
    setNewSubjExamDate('');
  };

  // Diagnostics latency test
  const handleTestLatency = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await refreshAiStatus();
      const end = performance.now();
      setPingLatency(Math.round(end - start));
    } catch {
      setPingLatency(null);
    } finally {
      setIsPinging(false);
    }
  };

  // Import JSON trigger
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const ok = importDataJson(text);
        if (ok) {
          alert('StudyMate data imported successfully!');
        } else {
          alert('Failed to parse JSON backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const presetColors = ['#0D9488', '#2563EB', '#7C3AED', '#0891B2', '#D97706', '#E11D48', '#059669'];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Profile & Settings</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
              Preferences & Sync
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Personalize your academic goals, manage enrolled courses, and inspect server AI connectivity
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5 self-start sm:self-center">
            <Check className="w-3.5 h-3.5" />
            <span>Profile Saved!</span>
          </span>
        )}
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
            {formData.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{formData.name}</h2>
            <p className="text-xs text-slate-500">
              {formData.major} • {formData.university}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Student Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">College / University</label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degree Program & Major</label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Year of Study</label>
              <input
                type="text"
                value={formData.yearOfStudy}
                onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target GPA</label>
              <input
                type="text"
                value={formData.targetGpa}
                onChange={(e) => setFormData({ ...formData, targetGpa: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Study Target (Hours)</label>
              <input
                type="number"
                min="1"
                max="12"
                step="0.5"
                value={formData.dailyGoalHours}
                onChange={(e) => setFormData({ ...formData, dailyGoalHours: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Comfortable Daily Routine Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <label className="block font-semibold text-slate-800 text-xs">
                Comfortable Daily Study Routine & Chronotype
              </label>
              <p className="text-[11px] text-slate-500">
                StudyMate AI calibrates your weekly timetables and session timeslots to your peak cognitive energy hours.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, studyPreference: 'morning' })}
                className={`p-3 rounded-xl border text-left transition ${
                  formData.studyPreference === 'morning'
                    ? 'border-teal-500 bg-teal-50/70 text-teal-950 font-bold ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold">Morning Lark</span>
                </div>
                <p className="text-[10px] text-slate-500">07:00 AM – 12:00 PM</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, studyPreference: 'afternoon' })}
                className={`p-3 rounded-xl border text-left transition ${
                  formData.studyPreference === 'afternoon'
                    ? 'border-teal-500 bg-teal-50/70 text-teal-950 font-bold ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Coffee className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold">Afternoon</span>
                </div>
                <p className="text-[10px] text-slate-500">01:00 PM – 06:00 PM</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, studyPreference: 'night' })}
                className={`p-3 rounded-xl border text-left transition ${
                  formData.studyPreference === 'night'
                    ? 'border-teal-500 bg-teal-50/70 text-teal-950 font-bold ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold">Night Owl</span>
                </div>
                <p className="text-[10px] text-slate-500">07:00 PM – 12:00 AM</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, studyPreference: 'flexible' })}
                className={`p-3 rounded-xl border text-left transition ${
                  formData.studyPreference === 'flexible'
                    ? 'border-teal-500 bg-teal-50/70 text-teal-950 font-bold ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-4 h-4 text-teal-500" />
                  <span className="text-xs font-bold">Flexible</span>
                </div>
                <p className="text-[10px] text-slate-500">Micro-bursts</p>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Daily Start Time</label>
                <input
                  type="text"
                  value={formData.preferredStartTime}
                  onChange={(e) => setFormData({ ...formData, preferredStartTime: e.target.value })}
                  placeholder="e.g. 08:30 AM or 07:00 PM"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cognitive Break Interval ({formData.breakIntervalMinutes} Mins)
                </label>
                <select
                  value={formData.breakIntervalMinutes}
                  onChange={(e) => setFormData({ ...formData, breakIntervalMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800"
                >
                  <option value="5">5 Minutes (Short cognitive rest)</option>
                  <option value="10">10 Minutes (Standard buffer)</option>
                  <option value="15">15 Minutes (Extended recharge)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile & Schedule Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* Visual Study Streak & Milestone Journey Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Study Streak & Habit Consistency</h3>
          <p className="text-xs text-slate-500">
            Consecutive study day tracker and motivational celebration milestones
          </p>
        </div>

        {/* Embedded Interactive Streak Widget */}
        <StreakCounterWidget variant="full" />

        {/* Milestone Roadmap Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Milestone Achievement Roadmap</h4>
              <p className="text-xs text-slate-500">Earn motivational celebrations and cognitive perks</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              {streakData.unlockedMilestones.length} of {allMilestones.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allMilestones.map((m) => {
              const isUnlocked = streakData.unlockedMilestones.includes(m.days) || activeStreak >= m.days;

              return (
                <div
                  key={m.days}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-2 ${
                    isUnlocked
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-slate-200 bg-slate-50/50 opacity-70'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{m.icon}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isUnlocked
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        {m.days} Days
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900">{m.title}</h5>
                    <p className="text-[11px] text-slate-600 leading-snug">{m.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-amber-800">{m.badge}</span>
                    <button
                      type="button"
                      onClick={() => triggerMilestoneCelebration(m)}
                      className="text-teal-700 hover:text-teal-900 font-bold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      <span>{isUnlocked ? 'Replay' : 'Preview'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enrolled Subjects Manager */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Enrolled Courses & Exam Dates</h3>
          <p className="text-xs text-slate-500">
            Used across the AI Timetable generator, task checklists, and quiz system
          </p>
        </div>

        {/* Existing subjects list */}
        <div className="divide-y divide-slate-100">
          {profile.subjects.map((subj) => (
            <div key={subj.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: subj.color }} />
                <div>
                  <span className="font-semibold text-slate-800">{subj.name}</span>
                  {subj.code && <span className="text-slate-400 ml-1.5 font-mono">[{subj.code}]</span>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500">
                  {subj.examDate ? `Exam: ${subj.examDate}` : 'No exam date'}
                </span>

                {profile.subjects.length > 1 && (
                  <button
                    onClick={() => removeSubject(subj.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Remove Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add new subject inline form */}
        <form onSubmit={handleAddSubject} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <span className="block text-xs font-bold text-slate-800">Add New Course:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Course name (e.g. Molecular Genetics)"
              value={newSubjName}
              onChange={(e) => setNewSubjName(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
            />

            <input
              type="date"
              value={newSubjExamDate}
              onChange={(e) => setNewSubjExamDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800"
              title="Target Exam or Midterm Date"
            />

            <div className="flex items-center gap-1.5">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewSubjColor(color)}
                  className={`w-5 h-5 rounded-full transition ${
                    newSubjColor === color ? 'ring-2 ring-slate-800 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>
        </form>
      </div>

      {/* System Diagnostics & Persistence Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Architecture & AI Diagnostics</h3>
            <p className="text-xs text-slate-500">Live operational status of backend services</p>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${
              aiStatus.isConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {aiStatus.isConfigured ? '✨ Live API Connected' : '⚡ Demo Mode Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-semibold text-slate-700">AI Model Protocol:</span>
            <p className="font-mono text-teal-800 text-[11px] font-bold">gemini-3.8-flash</p>
            <p className="text-slate-500 text-[11px]">{aiStatus.message}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Server Latency:</span>
              <button
                onClick={handleTestLatency}
                disabled={isPinging}
                className="text-[10px] text-teal-700 font-semibold hover:underline"
              >
                {isPinging ? 'Pinging...' : 'Test Latency'}
              </button>
            </div>
            <p className="font-mono text-slate-800 text-[11px] font-bold">
              {pingLatency !== null ? `${pingLatency} ms` : 'Not tested'}
            </p>
            <p className="text-slate-500 text-[11px]">Express API proxy with zero client key exposure</p>
          </div>
        </div>

        {/* Data Persistence Tools */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const data = exportDataJson();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `StudyMate_Backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export JSON Backup</span>
            </button>

            <label className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset all tasks, study hours, and quizzes back to sample demo defaults?')) {
                resetToDemoData();
                alert('Reset complete!');
              }
            }}
            className="px-3 py-1.5 rounded-lg text-rose-700 border border-rose-200 hover:bg-rose-50 font-medium flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
