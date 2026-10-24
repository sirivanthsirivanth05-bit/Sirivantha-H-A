import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  HelpCircle,
  Menu,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenPresentationGuide: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenPresentationGuide,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { profile, activeStreak, aiStatus, pomodoro, isFocusMode, toggleFocusMode } = useStudy();
  const [showPomodoroDropdown, setShowPomodoroDropdown] = useState(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/30 transition shadow-inner">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">StudyMate</span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  AI
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 font-medium">Smart Learning Assistant</p>
            </div>
          </button>
        </div>

        {/* Center / Right: Pomodoro, AI Status, Presentation Guide, Streak & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Pomodoro Pill */}
          <div className="relative">
            <div
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                pomodoro.isRunning
                  ? 'bg-teal-950/70 border-teal-500/50 text-teal-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              onClick={() => setShowPomodoroDropdown(!showPomodoroDropdown)}
              title="Click to manage Pomodoro Focus Timer"
            >
              {pomodoro.mode === 'work' ? (
                <Brain className={`w-3.5 h-3.5 ${pomodoro.isRunning ? 'text-teal-400 animate-pulse' : 'text-slate-400'}`} />
              ) : (
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-mono font-bold text-xs tracking-wide">
                {formatTimer(pomodoro.timeLeft)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  pomodoro.isRunning ? pomodoro.pause() : pomodoro.start();
                }}
                className="p-1 rounded hover:bg-slate-700/60 transition"
              >
                {pomodoro.isRunning ? <Pause className="w-3 h-3 text-teal-300" /> : <Play className="w-3 h-3 text-teal-400" />}
              </button>
            </div>

            {/* Pomodoro Dropdown */}
            {showPomodoroDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-3 z-40 text-slate-200 text-xs animate-fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="font-semibold text-white">Pomodoro Focus Timer</span>
                  <span className="text-[10px] text-teal-400 font-medium">
                    {pomodoro.totalWorkMinutesCompleted}m studied
                  </span>
                </div>
                <div className="flex gap-1.5 mb-3">
                  <button
                    onClick={() => pomodoro.switchMode('work')}
                    className={`flex-1 py-1 px-2 rounded text-center transition font-medium ${
                      pomodoro.mode === 'work'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Focus (25m)
                  </button>
                  <button
                    onClick={() => pomodoro.switchMode('break')}
                    className={`flex-1 py-1 px-2 rounded text-center transition font-medium ${
                      pomodoro.mode === 'break'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Break (5m)
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => (pomodoro.isRunning ? pomodoro.pause() : pomodoro.start())}
                    className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    {pomodoro.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {pomodoro.isRunning ? 'Pause' : 'Start Focus'}
                  </button>
                  <button
                    onClick={() => pomodoro.reset()}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Focus Mode Toggle Button */}
          <button
            onClick={toggleFocusMode}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              isFocusMode
                ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-sm ring-1 ring-teal-500/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={isFocusMode ? 'Exit Focus Mode (Esc)' : 'Enter Distraction-Free Focus Mode (hides sidebar & footer)'}
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5 text-teal-300" /> : <Maximize2 className="w-3.5 h-3.5 text-teal-400" />}
            <span className="hidden sm:inline">{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</span>
          </button>

          {/* AI Status Badge */}
          <button
            onClick={onOpenPresentationGuide}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
              aiStatus.isConfigured
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-slate-800/80 border-slate-700 text-teal-300 hover:bg-slate-800'
            }`}
            title="Click to view AI Engine Architecture and Status"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden lg:inline">{aiStatus.isConfigured ? 'Gemini 3.8 Flash' : 'Demo Engine'}</span>
            <span className="lg:hidden">AI</span>
          </button>

          {/* Active Streak */}
          <div
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-300 text-xs font-semibold"
            title="Active 5-day study streak!"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>{activeStreak}d</span>
          </div>

          {/* Professor Demo Guide button */}
          <button
            onClick={onOpenPresentationGuide}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition"
            title="Open professor evaluation guide & demo checklist"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Demo Guide</span>
          </button>

          {/* Profile Quick Avatar */}
          <button
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-lg border transition ${
              currentView === 'profile'
                ? 'border-teal-500 bg-slate-800 text-white'
                : 'border-slate-800 hover:border-slate-700 bg-slate-800/50 text-slate-300'
            }`}
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center">
              {profile.name.charAt(0)}
            </div>
            <span className="hidden lg:inline text-xs font-medium text-slate-200">
              {profile.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
