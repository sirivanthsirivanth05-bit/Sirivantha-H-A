import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Check,
  LayoutGrid,
  List,
  AlertCircle,
  X,
  ChevronRight,
  BookOpen,
  Sun,
  Moon,
  Coffee,
  Zap,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Priority, StudyTask, GeneratedPlan } from '../types';

export const PlannerView: React.FC = () => {
  const { profile, tasks, savedPlan, addTask, updateTask, deleteTask, toggleTask, savePlan } = useStudy();

  // Generator form states
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    profile.subjects.slice(0, 3).map((s) => s.name)
  );
  const [topicsFocus, setTopicsFocus] = useState(
    'Midterm review: Graph algorithms, Multivariable integration, and Virtual memory'
  );
  const [dailyHours, setDailyHours] = useState<number>(profile.dailyGoalHours || 4);
  const [difficultyPacing, setDifficultyPacing] = useState<string>('balanced');
  const [chronotype, setChronotype] = useState<string>(profile.studyPreference || 'morning');
  const [preferredTime, setPreferredTime] = useState<string>(profile.preferredStartTime || '08:30 AM');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  // Active view tabs: 'schedule' (timetable) vs 'tasks' (task board)
  const [plannerTab, setPlannerTab] = useState<'schedule' | 'tasks'>('schedule');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'kanban'>('list');

  // Task filtering states
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Task modal states (Add / Edit)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<{
    title: string;
    subject: string;
    durationMinutes: number;
    priority: Priority;
    dueDate: string;
    notes: string;
  }>({
    title: '',
    subject: profile.subjects[0]?.name || '',
    durationMinutes: 45,
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Toggle subject selection in generator
  const toggleSubject = (name: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  // Generate AI Timetable Plan
  const handleGeneratePlan = async () => {
    if (selectedSubjects.length === 0) {
      setGeneratorError('Please select at least one subject.');
      return;
    }
    setGeneratorError(null);
    setIsGenerating(true);

    try {
      const examDatesMap: Record<string, string> = {};
      profile.subjects.forEach((s) => {
        if (s.examDate) examDatesMap[s.name] = s.examDate;
      });

      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: selectedSubjects,
          topics: topicsFocus,
          dailyHours,
          examDates: examDatesMap,
          difficulty: difficultyPacing,
          chronotype,
          preferredStartTime: preferredTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study plan.');
      }

      const planData: GeneratedPlan = await response.json();
      savePlan(planData);
      setPlannerTab('schedule');
    } catch (err: any) {
      setGeneratorError(err?.message || 'Error communicating with study plan engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Open modal to add task
  const openAddTaskModal = () => {
    setEditingTaskId(null);
    setTaskForm({
      title: '',
      subject: profile.subjects[0]?.name || 'General',
      durationMinutes: 45,
      priority: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsTaskModalOpen(true);
  };

  // Open modal to edit existing task
  const openEditTaskModal = (task: StudyTask) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      subject: task.subject,
      durationMinutes: task.durationMinutes,
      priority: task.priority,
      dueDate: task.dueDate,
      notes: task.notes || '',
    });
    setIsTaskModalOpen(true);
  };

  // Save task from modal
  const handleSaveTaskModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: taskForm.title.trim(),
        subject: taskForm.subject,
        durationMinutes: Number(taskForm.durationMinutes) || 45,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        notes: taskForm.notes.trim(),
      });
    } else {
      addTask({
        title: taskForm.title.trim(),
        subject: taskForm.subject,
        durationMinutes: Number(taskForm.durationMinutes) || 45,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate,
        completed: false,
        notes: taskForm.notes.trim(),
      });
    }
    setIsTaskModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterSubject !== 'All' && t.subject !== filterSubject) return false;
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterStatus === 'active' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export Timetable as text file
  const handleExportTimetable = () => {
    let content = `STUDYMATE AI — WEEKLY STUDY TIMETABLE\n`;
    content += `Student: ${profile.name} (${profile.university})\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;

    if (savedPlan) {
      content += `STRATEGY OVERVIEW:\n${savedPlan.summary}\n\n`;
      savedPlan.weeklySchedule.forEach((day) => {
        content += `=== ${day.day.toUpperCase()} (${day.focus}) ===\n`;
        day.sessions.forEach((s) => {
          content += `  • [${s.timeSlot}] ${s.subject} (${s.durationMinutes}m) - Priority: ${s.priority}\n`;
          content += `    Topic: ${s.topic} | Technique: ${s.technique}\n`;
        });
        content += `\n`;
      });
    }

    content += `=== ACTIONABLE TASK LIST ===\n`;
    tasks.forEach((t) => {
      content += `  [${t.completed ? 'X' : ' '}] ${t.title} (${t.subject}, ${t.priority} Priority, Due: ${t.dueDate})\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyPlan_${profile.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const activeDaySchedule = savedPlan?.weeklySchedule?.find((s) => s.day === daysOfWeek[activeDayIndex]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Study Planner</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
              Intelligent Scheduling
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Generate balanced timetables, organize priorities, and conquer exam milestones
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setPlannerTab('schedule')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                plannerTab === 'schedule'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Timetable
            </button>
            <button
              onClick={() => setPlannerTab('tasks')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                plannerTab === 'tasks'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Task Management ({tasks.length})
            </button>
          </div>

          <button
            onClick={handleExportTimetable}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            title="Download or Print Study Timetable"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Timetable Generator Accordion / Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Timetable & Exam Strategy Generator</h3>
                <p className="text-xs text-slate-500">
                  Calculates spaced repetition intervals and distributes cognitive workload across your week
                </p>
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing Plan...' : 'Generate New Timetable'}</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {generatorError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generatorError}</span>
            </div>
          )}

          {/* Subject Selection Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Enrolled Subjects to Include:
            </label>
            <div className="flex flex-wrap gap-2">
              {profile.subjects.map((subj) => {
                const isSelected = selectedSubjects.includes(subj.name);
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => toggleSubject(subj.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 border-teal-400 font-semibold shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: subj.color }}
                    />
                    <span>{subj.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-teal-700" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topics and Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topics or High-Priority Areas to Cover:
              </label>
              <input
                type="text"
                value={topicsFocus}
                onChange={(e) => setTopicsFocus(e.target.value)}
                placeholder="e.g. Graph algorithms, Dynamic Programming, Integration by Parts"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Study Target ({dailyHours} Hours/Day):
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1h (Light)</span>
                <span>4h (Balanced)</span>
                <span>8h (Intensive)</span>
              </div>
            </div>
          </div>

          {/* Comfortable Daily Schedule & Chronotype Selector */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Comfortable Study Window & Chronotype Routine:
              </label>
              <span className="text-[11px] text-teal-700 font-medium">
                Timeslots will automatically adapt to your comfortable routine
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setChronotype('morning')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  chronotype === 'morning'
                    ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-bold ring-1 ring-teal-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Morning Lark</span>
                </div>
                <p className="text-[10px] text-slate-500">07:00 AM – 12:30 PM</p>
              </button>

              <button
                type="button"
                onClick={() => setChronotype('afternoon')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  chronotype === 'afternoon'
                    ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-bold ring-1 ring-teal-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                  <Coffee className="w-3.5 h-3.5 text-orange-500" />
                  <span>Afternoon</span>
                </div>
                <p className="text-[10px] text-slate-500">01:00 PM – 06:30 PM</p>
              </button>

              <button
                type="button"
                onClick={() => setChronotype('night')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  chronotype === 'night'
                    ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-bold ring-1 ring-teal-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Night Owl</span>
                </div>
                <p className="text-[10px] text-slate-500">07:00 PM – 11:45 PM</p>
              </button>

              <button
                type="button"
                onClick={() => setChronotype('flexible')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  chronotype === 'flexible'
                    ? 'bg-teal-50/80 border-teal-500 text-teal-950 font-bold ring-1 ring-teal-500'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                  <Zap className="w-3.5 h-3.5 text-teal-500" />
                  <span>Flexible</span>
                </div>
                <p className="text-[10px] text-slate-500">Distributed micro-blocks</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab 1: Weekly Timetable */}
      {plannerTab === 'schedule' && (
        <div className="space-y-4">
          {savedPlan && (
            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 flex items-start justify-between gap-4">
              <div>
                <p className="font-bold flex items-center gap-1.5 text-teal-900">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Active Timetable Strategy
                </p>
                <p className="text-teal-800 text-xs mt-0.5 leading-relaxed">{savedPlan.summary}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white font-mono border border-teal-300 text-teal-700 shrink-0">
                {savedPlan.source || 'StudyMate AI Engine'}
              </span>
            </div>
          )}

          {/* Day Tabs (Monday - Sunday) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {daysOfWeek.map((day, idx) => {
              const isActive = activeDayIndex === idx;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Day Schedule Sessions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{daysOfWeek[activeDayIndex]} Study Schedule</h3>
                <p className="text-xs text-slate-500">
                  Focus: {activeDaySchedule?.focus || 'Core curriculum synthesis and spaced active recall'}
                </p>
              </div>

              <button
                onClick={openAddTaskModal}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task to Day</span>
              </button>
            </div>

            {/* Sessions list */}
            {activeDaySchedule && activeDaySchedule.sessions.length > 0 ? (
              <div className="space-y-3">
                {activeDaySchedule.sessions.map((sess, sIdx) => {
                  const subjObj = profile.subjects.find((s) => s.name === sess.subject);
                  const isHigh = sess.priority === 'High';

                  return (
                    <div
                      key={sIdx}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: subjObj?.color || '#0D9488' }}
                          />
                          <span className="text-xs font-bold text-slate-900">{sess.subject}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {sess.timeSlot}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-slate-800">{sess.topic}</p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {sess.technique}
                          </span>
                          <span>Duration: {sess.durationMinutes} min</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {sess.priority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <CalendarDays className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No scheduled blocks generated for this day yet.</p>
                <button
                  onClick={handleGeneratePlan}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Timetable
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Tab 2: Task Management (List & Kanban) */}
      {plannerTab === 'tasks' && (
        <div className="space-y-4">
          {/* Controls: Search, Filters, View toggle, Add task button */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search tasks, formulas, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 sm:w-64"
              />

              {/* View mode toggle & Add Task button */}
              <div className="flex items-center gap-2">
                <div className="flex rounded-md p-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs">
                  <button
                    onClick={() => setTaskViewMode('list')}
                    className={`p-1.5 rounded transition ${
                      taskViewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTaskViewMode('kanban')}
                    className={`p-1.5 rounded transition ${
                      taskViewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                    }`}
                    title="Kanban Board View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={openAddTaskModal}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Task</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter:
              </span>

              {/* Subject filter */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
              >
                <option value="All">All Subjects</option>
                {profile.subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Priority filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>

              {/* Status filter */}
              <div className="flex rounded-md p-0.5 bg-slate-100 text-[11px]">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2 py-0.5 rounded ${filterStatus === 'all' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-2 py-0.5 rounded ${filterStatus === 'active' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-2 py-0.5 rounded ${filterStatus === 'completed' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-500'}`}
                >
                  Done
                </button>
              </div>

              {(filterSubject !== 'All' || filterPriority !== 'All' || filterStatus !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterSubject('All');
                    setFilterPriority('All');
                    setFilterStatus('all');
                    setSearchQuery('');
                  }}
                  className="text-xs text-teal-700 hover:underline font-medium ml-auto"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* List View */}
          {taskViewMode === 'list' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No matching tasks found. Click &apos;New Task&apos; to create one.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isHigh = task.priority === 'High';
                  const isMed = task.priority === 'Medium';
                  const subjObj = profile.subjects.find((s) => s.name === task.subject);

                  return (
                    <div
                      key={task.id}
                      className={`p-4 flex items-start justify-between gap-3 transition hover:bg-slate-50 ${
                        task.completed ? 'bg-slate-50/50' : ''
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
                          <h4
                            className={`text-xs font-semibold ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: subjObj?.color || '#0D9488' }}
                              />
                              {task.subject}
                            </span>
                            <span>•</span>
                            <span>Due: {task.dueDate}</span>
                            <span>•</span>
                            <span>{task.durationMinutes} mins</span>
                          </div>

                          {task.notes && (
                            <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 max-w-xl">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            isHigh
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isMed
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <button
                          onClick={() => openEditTaskModal(task)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Kanban Board View */}
          {taskViewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: High Priority / Urgent */}
              <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h4 className="text-xs font-bold text-slate-900">High Priority / Urgent</h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {filteredTasks.filter((t) => t.priority === 'High' && !t.completed).length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[200px]">
                  {filteredTasks
                    .filter((t) => t.priority === 'High' && !t.completed)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                          <button onClick={() => toggleTask(t.id)} className="text-slate-300 hover:text-teal-600">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>{t.subject}</span>
                          <span>{t.durationMinutes}m</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 2: In Progress / Medium Priority */}
              <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h4 className="text-xs font-bold text-slate-900">Medium & Standard</h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {filteredTasks.filter((t) => t.priority !== 'High' && !t.completed).length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[200px]">
                  {filteredTasks
                    .filter((t) => t.priority !== 'High' && !t.completed)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                          <button onClick={() => toggleTask(t.id)} className="text-slate-300 hover:text-teal-600">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>{t.subject}</span>
                          <span>{t.durationMinutes}m</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 3: Completed */}
              <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <h4 className="text-xs font-bold text-slate-900">Completed Archive</h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    {filteredTasks.filter((t) => t.completed).length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[200px]">
                  {filteredTasks
                    .filter((t) => t.completed)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-white/70 rounded-lg border border-slate-200 shadow-2xs space-y-2 opacity-80"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold line-through text-slate-400">{t.title}</p>
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>{t.subject}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingTaskId ? 'Edit Study Task' : 'Add New Academic Task'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Fast Fourier Transform (FFT)"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={taskForm.subject}
                    onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    {profile.subjects.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={taskForm.durationMinutes}
                    onChange={(e) => setTaskForm({ ...taskForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Study Notes / References</label>
                <textarea
                  rows={2}
                  placeholder="Key textbook chapters, problem numbers, or active recall triggers..."
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-xs"
                >
                  {editingTaskId ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
