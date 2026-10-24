import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Award,
  Play,
  Check,
  TrendingUp,
  Zap,
  Maximize2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { formatMinutes, getDaysRemaining } from '../utils/formatters';
import { StreakCounterWidget } from '../components/StreakCounterWidget';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { profile, tasks, sessions, quizHistory, activeStreak, pomodoro, toggleTask, addTask, toggleFocusMode } = useStudy();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(profile.subjects[0]?.name || '');
  const [newTaskDuration, setNewTaskDuration] = useState('45');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Computations
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Study hours logged today (from Pomodoro + manual sessions)
  const todayMinutes = pomodoro.totalWorkMinutesCompleted;
  const dailyGoalMinutes = profile.dailyGoalHours * 60;
  const dailyProgressPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  // Average quiz score
  const avgQuizScore =
    quizHistory.length > 0
      ? Math.round(quizHistory.reduce((acc, q) => acc + q.percentage, 0) / quizHistory.length)
      : 85;

  // Upcoming exams sorted by date
  const upcomingExams = profile.subjects
    .filter((s) => s.examDate)
    .map((s) => ({
      ...s,
      daysInfo: getDaysRemaining(s.examDate),
    }))
    .sort((a, b) => (a.daysInfo.days || 99) - (b.daysInfo.days || 99));

  // Quick Add Task submission
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      subject: newTaskSubject || profile.subjects[0]?.name || 'General',
      durationMinutes: Number(newTaskDuration) || 45,
      priority: newTaskPriority,
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
      notes: 'Added via Quick Dashboard entry',
    });

    setNewTaskTitle('');
    setShowQuickAdd(false);
  };

  // Weekly study hours data for visual SVG chart (Mon-Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const mockWeeklyHours = [3.5, 4.2, 2.8, 4.0, 3.2, 2.5, 3.8]; // hours
  const maxWeeklyHour = Math.max(...mockWeeklyHours, profile.dailyGoalHours);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white border border-slate-800 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Learning Copilot Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {profile.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            You are enrolled in <span className="font-semibold text-white">{profile.subjects.length} subjects</span> at{' '}
            <span className="font-semibold text-teal-300">{profile.university}</span>. Next upcoming milestone is{' '}
            <span className="text-amber-300 font-semibold underline decoration-amber-400/50">
              {upcomingExams[0]?.name || 'Finals Preparation'}
            </span>{' '}
            in {upcomingExams[0]?.daysInfo?.label || '5 days'}. Let&apos;s conquer your study goals!
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-teal-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Comfortable Routine: <strong className="text-white capitalize">{profile.studyPreference || 'Morning'}</strong> ({profile.preferredStartTime || '08:30 AM'} peak focus)</span>
            </span>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('planner')}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Open AI Study Planner
            </button>
            <button
              onClick={() => onNavigate('assistant')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              Ask Academic Question
            </button>
            <button
              onClick={() => onNavigate('quizzes')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-4 h-4 text-teal-400" />
              Take Practice Quiz
            </button>
            <button
              onClick={toggleFocusMode}
              className="px-4 py-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Hide sidebar and footer for distraction-free reading and study"
            >
              <Maximize2 className="w-4 h-4 text-teal-300" />
              Focus Mode
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Summary Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Study Time */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Today&apos;s Focus Time</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{formatMinutes(todayMinutes)}</span>
            <span className="text-xs text-slate-400 font-medium">/ {profile.dailyGoalHours}h target</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Goal progress</span>
              <span className="font-semibold text-teal-700">{dailyProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Completed Tasks */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Tasks Completed</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {completedTasksCount} <span className="text-sm font-normal text-slate-400">/ {totalTasksCount}</span>
            </span>
            <span className="text-xs text-blue-700 font-semibold">{taskCompletionRate}% rate</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Completion progress</span>
              <span className="font-semibold text-blue-700">{taskCompletionRate}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Active Streak */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Active Study Streak</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeStreak} Days</span>
            <span className="text-xs font-semibold text-orange-600">🔥 Top 10% Consistency</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-1 pt-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400">{day}</span>
                <div
                  className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[9px] ${
                    i < 5 ? 'bg-orange-500 text-white font-bold' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {i < 5 ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metric 4: Average Quiz Score */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Quiz Accuracy</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{avgQuizScore}%</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Grade A
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>+8% gain after active recall testing</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks & Schedule on Left (2 cols), Upcoming Exams & Progress Chart on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today&apos;s Academic Tasks</h2>
                <p className="text-xs text-slate-500">Prioritized checklist based on exam proximity</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showQuickAdd ? 'Cancel' : 'Add Task'}</span>
                </button>
                <button
                  onClick={() => onNavigate('planner')}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span>Full Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Add Task Form */}
            {showQuickAdd && (
              <form onSubmit={handleAddTask} className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
                <input
                  type="text"
                  placeholder="Task title (e.g. Master Page Replacement Algorithms)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    {profile.subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                    <option value="90">90 Minutes</option>
                  </select>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            )}

            {/* Task list items */}
            <div className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No study tasks yet. Click &apos;Add Task&apos; or generate an AI timetable!
                </div>
              ) : (
                tasks.map((task) => {
                  const subjectObj = profile.subjects.find((s) => s.name === task.subject);
                  const isHigh = task.priority === 'High';
                  const isMed = task.priority === 'Medium';

                  return (
                    <div
                      key={task.id}
                      className={`p-4 flex items-start justify-between gap-3 transition hover:bg-slate-50/70 ${
                        task.completed ? 'bg-slate-50/40 opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                            task.completed
                              ? 'bg-teal-600 border-teal-600 text-white'
                              : 'border-slate-300 hover:border-teal-500 bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div className="space-y-1">
                          <p
                            className={`text-xs font-medium leading-snug ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: subjectObj?.color || '#0D9488' }}
                              />
                              {task.subject}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {task.durationMinutes}m
                            </span>
                            {task.notes && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400 truncate max-w-xs">{task.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isMed
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive Weekly Hours SVG Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Weekly Study Effort & Consistency</h3>
                <p className="text-xs text-slate-500">Daily hours logged vs 4-hour target goal</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="w-3 h-3 rounded-xs bg-teal-600 inline-block" />
                  <span>Hours Studied</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="w-3 h-1 bg-amber-500 inline-block" />
                  <span>Daily Goal ({profile.dailyGoalHours}h)</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {daysOfWeek.map((day, idx) => {
                const hours = mockWeeklyHours[idx];
                const heightPercent = Math.round((hours / maxWeeklyHour) * 100);
                const isTargetMet = hours >= profile.dailyGoalHours;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono font-semibold text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition">
                      {hours}h
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-md h-full flex items-end relative overflow-hidden">
                      {/* Target threshold indicator line */}
                      <div
                        className="absolute w-full border-b border-dashed border-amber-400 z-10"
                        style={{ bottom: `${(profile.dailyGoalHours / maxWeeklyHour) * 100}%` }}
                      />
                      {/* Bar fill */}
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
        </div>

        {/* Right Column: Study Streak, Upcoming Exams & Quick Launch */}
        <div className="space-y-6">
          {/* Visual Study Streak Counter Widget */}
          <StreakCounterWidget variant="full" />

          {/* Upcoming Exams Countdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Exams</h3>
              </div>
              <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">
                Fall 2026
              </span>
            </div>

            <div className="space-y-3">
              {upcomingExams.map((exam) => {
                const days = exam.daysInfo.days;
                const isUrgent = days <= 7;

                return (
                  <div
                    key={exam.id}
                    className={`p-3 rounded-lg border transition ${
                      isUrgent
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: exam.color }}
                          />
                          <span className="text-xs font-bold text-slate-900">{exam.code || exam.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{exam.name}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded shrink-0 border ${
                          isUrgent
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {exam.daysInfo.label}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Exam Date: {exam.examDate}</span>
                      <button
                        onClick={() => onNavigate('quizzes')}
                        className="text-teal-700 hover:text-teal-900 font-semibold"
                      >
                        Review Quiz →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Study Launcher */}
          <div className="bg-gradient-to-br from-slate-900 to-teal-950 rounded-xl p-5 text-white border border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Cognitive Focus Boost
              </span>
              <Sparkles className="w-4 h-4 text-teal-300" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white mb-1">Need an Exam Revision Sprint?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Launch a 25-minute Pomodoro timer or have StudyMate AI generate an optimized exam timetable.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  pomodoro.switchMode('work');
                  pomodoro.start();
                }}
                className="w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start 25m Pomodoro Sprint</span>
              </button>

              <button
                onClick={() => onNavigate('planner')}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Generate Weekly AI Schedule</span>
              </button>
            </div>
          </div>

          {/* Academic Tip of the Day */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-teal-900">
              <AlertCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>Evidence-Based Study Principle</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              &quot;Testing yourself after studying increases long-term retention by up to 50% compared to
              passively re-reading notes (Roediger & Karpicke, Science).&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
