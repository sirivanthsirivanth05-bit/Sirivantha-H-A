import React from 'react';
import {
  GraduationCap,
  Sparkles,
  CalendarDays,
  HelpCircle,
  BookOpen,
  LineChart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  Brain,
  Award,
  Zap,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface LandingViewProps {
  onNavigate: (view: string) => void;
  onOpenPresentationGuide: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onOpenPresentationGuide }) => {
  const { aiStatus, profile } = useStudy();

  const features = [
    {
      id: 'dashboard',
      icon: GraduationCap,
      title: 'Student Dashboard',
      description:
        'Personalized command center tracking today’s study tasks, exam countdowns, active streaks, and daily focus targets.',
      badge: 'Core Hub',
    },
    {
      id: 'planner',
      icon: CalendarDays,
      title: 'AI Study Planner',
      description:
        'Generates balanced weekly timetables using spaced repetition algorithms. Manage tasks with List and Kanban board views.',
      badge: 'Spaced Repetition',
    },
    {
      id: 'assistant',
      icon: Sparkles,
      title: 'AI Academic Tutor',
      description:
        'Ask college-level doubts across STEM & Humanities. Features 1-click simplification (ELI15), step-by-step solver, and practice checks.',
      badge: aiStatus.isConfigured ? 'Gemini 3.8 Flash' : 'Smart Engine',
    },
    {
      id: 'quizzes',
      icon: HelpCircle,
      title: 'Practice Quiz System',
      description:
        'Self-testing MCQ engine with question timer, instantaneous grade evaluation, confetti celebrations, and concept explanations.',
      badge: 'Formative Assessment',
    },
    {
      id: 'resources',
      icon: BookOpen,
      title: 'Learning Resource Library',
      description:
        'Curated cheat sheets, MIT OCW lectures, interactive simulators, plus the ability to save custom course syllabus and Drive links.',
      badge: 'Curated STEM',
    },
    {
      id: 'progress',
      icon: LineChart,
      title: 'Progress & Analytics',
      description:
        'Interactive weekly study charts, subject time allocation breakdown, unlockable achievements, and tailored AI recommendations.',
      badge: 'Cognitive Velocity',
    },
  ];

  return (
    <div className="space-y-12 py-4 animate-fade-in text-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>StudyMate AI • Full-Stack Educational Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Study Smarter, Not Harder with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
              Personalized AI Guidance
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            StudyMate AI is an interactive smart learning assistant built for college students. It combines
            evidence-based cognitive learning science (Active Recall, Spaced Repetition, and Cognitive Load Theory)
            with modern AI to generate study schedules, explain dense academic concepts, and test knowledge through
            formative practice quizzes.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition"
            >
              <span>Enter Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenPresentationGuide}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-700 transition"
            >
              <GraduationCap className="w-4 h-4 text-teal-400" />
              <span>Professor & Demo Guide</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Zero Mock Static Data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Full-Stack Express + Gemini 3.8 Flash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Local Storage Persistence</span>
            </div>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Core Features Showcase Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Designed for Real Student Needs
          </h2>
          <p className="text-xs text-slate-500">
            Every module addresses concrete student struggles: procrastination, dense textbook jargon, exam cramming, and tracking retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.id)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-500/60 p-6 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Educational Pedagogy & Cognitive Science Section */}
      <div className="rounded-2xl bg-slate-900 text-white p-8 border border-slate-800 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Pedagogical Rationale
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Grounded in Modern Cognitive Learning Science
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike static information pages or superficial flashcards, StudyMate AI implements the three proven principles of high-yield academic retention:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold">
              <Brain className="w-4 h-4" />
              <span>1. Spaced Repetition</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Timetable generator schedules review sessions at expanding intervals to disrupt the Ebbinghaus forgetting curve.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold">
              <Award className="w-4 h-4" />
              <span>2. Formative Testing Effect</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Immediate self-testing quizzes force neurological memory retrieval, strengthening synaptic pathways by up to 50%.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold">
              <Clock className="w-4 h-4" />
              <span>3. Cognitive Pacing (Pomodoro)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              25-minute uninterrupted work sprints paired with 5-minute cognitive rests prevent attention degradation and decision fatigue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
