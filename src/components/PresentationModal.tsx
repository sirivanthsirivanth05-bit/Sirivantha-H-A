import React from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CalendarCheck,
  Award,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { aiStatus, resetToDemoData, toggleFocusMode } = useStudy();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Professor & Evaluation Demonstration Guide</h2>
              <p className="text-xs text-slate-300">
                StudyMate AI — Architecture, Educational Pedagogy & Live Testing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Executive Overview */}
          <div className="p-4 rounded-lg bg-teal-50/60 border border-teal-100 flex flex-col md:flex-row gap-4 items-start">
            <div className="p-2 bg-teal-600 text-white rounded-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs md:text-sm text-slate-700 space-y-1">
              <p className="font-semibold text-teal-950">
                Project Goal: Cognitive Enhancement for College Students
              </p>
              <p className="text-slate-600 leading-relaxed">
                StudyMate AI bridges evidence-based learning science (Cognitive Load Theory, Active Recall,
                and Spaced Retrieval) with modern Generative AI to provide personalized study timetables,
                adaptive concept explanations, and structured formative practice quizzes.
              </p>
            </div>
          </div>

          {/* AI Connectivity Status */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">AI Model & Connectivity Diagnostics</h3>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                  aiStatus.isConfigured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {aiStatus.isConfigured ? '✨ Live: Gemini 3.8 Flash' : '⚡ Demo Mode: Offline Smart Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-2">
              {aiStatus.isConfigured
                ? 'Server is actively connected to the Gemini 3.8 Flash API using server-side @google/genai SDK.'
                : 'StudyMate is running in transparent Demo Mode with high-fidelity algorithmic study planning, curated question banks, and instant academic breakdowns. No external dependencies can break during a presentation.'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Full-Stack Architecture: React 19 Client + Express Proxy Server (No Client-side Keys)</span>
            </div>
          </div>

          {/* 1-Click Interactive Demonstration Steps */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-teal-600" />
              Interactive Demo Checklist for Presentation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div
                onClick={() => {
                  onNavigate('dashboard');
                  onClose();
                }}
                className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-teal-700 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  1. Student Dashboard & Metrics
                </div>
                <p className="text-slate-500">
                  Inspect weekly hours bar chart, today&apos;s checklist, upcoming exams countdown, and active streak.
                </p>
              </div>

              <div
                onClick={() => {
                  onNavigate('planner');
                  onClose();
                }}
                className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-teal-700 mb-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
                  2. AI Study Planner
                </div>
                <p className="text-slate-500">
                  Generate a structured daily & weekly timetable. Toggle between List & Kanban task views.
                </p>
              </div>

              <div
                onClick={() => {
                  onNavigate('assistant');
                  onClose();
                }}
                className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-teal-700 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  3. AI Academic Tutor
                </div>
                <p className="text-slate-500">
                  Ask college doubts with one-click simplification (ELI15), step-by-step math solver, or practice questions.
                </p>
              </div>

              <div
                onClick={() => {
                  onNavigate('quizzes');
                  onClose();
                }}
                className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-teal-700 mb-1">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  4. Practice Quiz System
                </div>
                <p className="text-slate-500">
                  Take a 5-question adaptive multiple-choice exam with timer, real-time score grading, and answer explanations.
                </p>
              </div>

              <div
                onClick={() => {
                  onNavigate('resources');
                  onClose();
                }}
                className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-teal-700 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  5. Curated Resources & Bookmarks
                </div>
                <p className="text-slate-500">
                  Search academic cheat sheets, video courses, interactive simulators, and add custom syllabus links.
                </p>
              </div>

              <div
                onClick={() => {
                  onNavigate('progress');
                  onClose();
                }}
                className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-teal-700 mb-1">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  6. Analytics & AI Recommendations
                </div>
                <p className="text-slate-500">
                  Review study streaks, subject mastery distribution, performance recommendations, and achievements.
                </p>
              </div>

              <div
                onClick={() => {
                  onNavigate('profile');
                  onClose();
                }}
                className="p-3 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50/30 transition cursor-pointer group bg-gradient-to-r from-orange-50/50 to-amber-50/50 border-orange-200"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-orange-700 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  7. Study Streak & Chronotype Routines
                </div>
                <p className="text-slate-600">
                  Daily streak counter, comfortable student schedules (Morning, Afternoon, Night Owl), and triumphant fanfare confetti celebration.
                </p>
              </div>

              <div
                onClick={() => {
                  toggleFocusMode();
                  onClose();
                }}
                className="p-3 border border-teal-300 rounded-lg hover:border-teal-600 hover:bg-teal-50/60 transition cursor-pointer group bg-gradient-to-r from-teal-50/70 to-emerald-50/70"
              >
                <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-teal-700 mb-1">
                  <span className="p-1 rounded bg-teal-600 text-white text-[10px]">ESC</span>
                  8. Focus Mode (Distraction-Free)
                </div>
                <p className="text-slate-600">
                  Toggles away the sidebar and footer for concentrated reading/studying. Features integrated Pomodoro HUD, ambient focus audio (Rain, White Noise, Alpha Beats), and Fullscreen.
                </p>
              </div>
            </div>
          </div>

          {/* Presentation Reset Button */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Reset all demo tasks, quizzes, and profile to fresh initial state?')) {
                  resetToDemoData();
                  alert('Demo state reset successfully!');
                }
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-md flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Demo to Fresh Presentation State
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition"
            >
              Close & Return to App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
