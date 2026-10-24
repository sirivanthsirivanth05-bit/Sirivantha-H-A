import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Clock,
  CheckCircle2,
  Award,
  Flame,
  Sparkles,
  TrendingUp,
  Plus,
  BookOpen,
  Calendar,
  AlertCircle,
  X,
  Target,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { formatMinutes } from '../utils/formatters';

export const ProgressView: React.FC = () => {
  const { profile, tasks, sessions, quizHistory, activeStreak, achievements, addSession, pomodoro } = useStudy();

  // Recommendations state
  const [recommendations, setRecommendations] = useState<string[]>([
    'Dedicate 45 minutes of active recall on Calculus Integrals before moving to new material.',
    'Your retention is highest in 25-minute Pomodoro bursts followed by 5-minute cognitive breaks.',
    'Schedule a self-testing quiz 48 hours after learning a new topic to leverage the spaced repetition curve.',
  ]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);

  // Manual session logger modal
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [logForm, setLogForm] = useState<{
    subject: string;
    durationMinutes: number;
    technique: string;
    notes: string;
  }>({
    subject: profile.subjects[0]?.name || 'General',
    durationMinutes: 60,
    technique: 'Active Recall',
    notes: '',
  });

  // Calculate totals
  const totalSessionMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0) + pomodoro.totalWorkMinutesCompleted;
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const avgQuizScore =
    quizHistory.length > 0
      ? Math.round(quizHistory.reduce((acc, q) => acc + q.percentage, 0) / quizHistory.length)
      : 85;

  // Fetch updated AI recommendations
  const fetchRecommendations = async () => {
    setIsLoadingRecs(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            weeklyHours: Math.round(totalSessionMinutes / 60),
            completedTasks: completedTasksCount,
            avgQuizScore,
          },
          weakSubjects: profile.subjects.slice(0, 2).map((s) => s.name),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
        }
      }
    } catch {
      // Keep existing default recommendations
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleSaveLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    addSession({
      subject: logForm.subject,
      durationMinutes: Number(logForm.durationMinutes) || 60,
      technique: logForm.technique,
      notes: logForm.notes.trim(),
    });
    setIsLogModalOpen(false);
  };

  // Mock days of week study effort
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekHours = [3.5, 4.2, 2.8, 4.0, 3.2, 2.5, 3.8];
  const maxHour = Math.max(...weekHours, profile.dailyGoalHours);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Progress & Analytics</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
              Performance Insights
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track study velocity, retention metrics, formative assessment growth, and cognitive milestones
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Offline Study Session</span>
        </button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Study Time</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatMinutes(totalSessionMinutes)}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across all recorded courses</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Tasks Completed</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {completedTasksCount} <span className="text-sm font-normal text-slate-400">/ {tasks.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}% completion velocity
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Learning Streak</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeStreak} Days</div>
          <p className="text-[11px] text-orange-600 font-semibold mt-1">Consistent Daily Scholar</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Average Quiz Accuracy</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{avgQuizScore}%</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {quizHistory.length} assessments completed
          </p>
        </div>
      </div>

      {/* Main Grid: Chart & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Weekly Chart & Subject Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Interactive Bar Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Weekly Study Consistency</h3>
                <p className="text-xs text-slate-500">Recorded hours vs {profile.dailyGoalHours}h daily target</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-xs bg-teal-600 inline-block" />
                <span>Study Hours</span>
              </div>
            </div>

            <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {weekDays.map((day, idx) => {
                const hours = weekHours[idx];
                const heightPercent = Math.round((hours / maxHour) * 100);
                const isTargetMet = hours >= profile.dailyGoalHours;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono font-semibold text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition">
                      {hours}h
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-md h-full flex items-end relative overflow-hidden">
                      <div
                        className="absolute w-full border-b border-dashed border-amber-400 z-10"
                        style={{ bottom: `${(profile.dailyGoalHours / maxHour) * 100}%` }}
                      />
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 group-hover:brightness-110 ${
                          isTargetMet ? 'bg-teal-600' : 'bg-teal-500/80'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 mt-2">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject Mastery & Time Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Subject Time Allocation & Mastery</h3>
            <p className="text-xs text-slate-500 mb-4">Balance of hours dedicated across your active courses</p>

            <div className="space-y-4">
              {profile.subjects.map((s, idx) => {
                // Estimate subject hours from sessions
                const subjSessions = sessions.filter((sess) => sess.subject === s.name);
                const mins = subjSessions.reduce((acc, sess) => acc + sess.durationMinutes, 0) || (idx + 1) * 75;
                const percent = Math.min(100, Math.round((mins / 400) * 100));

                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="font-semibold text-slate-800">{s.name}</span>
                        {s.code && <span className="text-[10px] text-slate-400">({s.code})</span>}
                      </div>
                      <span className="font-mono text-slate-600 font-semibold">{formatMinutes(mins)}</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Recommendations & Milestone Badges */}
        <div className="space-y-6">
          {/* AI Pedagogical Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Recommendations</h3>
              </div>
              <button
                onClick={fetchRecommendations}
                disabled={isLoadingRecs}
                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 disabled:opacity-50"
              >
                {isLoadingRecs ? 'Analyzing...' : 'Refresh'}
              </button>
            </div>

            <div className="space-y-2.5">
              {recommendations.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  className="p-3 rounded-lg border border-teal-100 bg-teal-50/40 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Achievements / Gamification Badges */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Academic Achievements</h3>
            </div>

            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-lg border text-xs flex items-center gap-3 transition ${
                    ach.unlocked
                      ? 'border-amber-200 bg-amber-50/30 text-slate-800'
                      : 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-xl shrink-0">{ach.icon}</span>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ach.title}</span>
                      {ach.unlocked ? (
                        <span className="text-[10px] text-amber-700 font-bold">Unlocked</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">In Progress</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Study Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Offline Study Session</h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLogSession} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={logForm.subject}
                  onChange={(e) => setLogForm({ ...logForm, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                >
                  {profile.subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={logForm.durationMinutes}
                    onChange={(e) => setLogForm({ ...logForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technique Used</label>
                  <select
                    value={logForm.technique}
                    onChange={(e) => setLogForm({ ...logForm, technique: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    <option value="Active Recall">Active Recall</option>
                    <option value="Pomodoro">Pomodoro Sprints</option>
                    <option value="Feynman Technique">Feynman Explanation</option>
                    <option value="Problem Solving">Problem Solving</option>
                    <option value="Spaced Retrieval">Spaced Retrieval</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Notes</label>
                <textarea
                  rows={2}
                  placeholder="Topics reviewed, problems solved, or key insights..."
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-xs"
                >
                  Record Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
