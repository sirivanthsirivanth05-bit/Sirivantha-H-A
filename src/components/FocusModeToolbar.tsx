import React, { useState, useEffect } from 'react';
import {
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Calendar,
  Layers,
  Compass,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface FocusModeToolbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const FocusModeToolbar: React.FC<FocusModeToolbarProps> = ({
  currentView,
  onNavigate,
}) => {
  const {
    isFocusMode,
    toggleFocusMode,
    ambientSound,
    setAmbientSound,
    pomodoro,
    activeStreak,
  } = useStudy();

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSoundMenu, setShowSoundMenu] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ambientSoundOptions: {
    id: 'none' | 'rain' | 'whitenoise' | 'binaural';
    label: string;
    description: string;
    icon: string;
  }[] = [
    { id: 'none', label: 'Muted', description: 'Complete silence', icon: '🔇' },
    { id: 'rain', label: 'Gentle Rain', description: 'Soft pink-filtered precipitation', icon: '🌧️' },
    { id: 'whitenoise', label: 'Warm White Noise', description: 'Static masking frequencies', icon: '📻' },
    { id: 'binaural', label: '10Hz Alpha Waves', description: 'Binaural tone for deep study state', icon: '🧠' },
  ];

  const focusViews = [
    { id: 'assistant', label: 'AI Tutor', icon: Sparkles },
    { id: 'quizzes', label: 'Practice Quiz', icon: HelpCircle },
    { id: 'resources', label: 'Reading Desk', icon: BookOpen },
    { id: 'planner', label: 'Timetable', icon: Calendar },
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
  ];

  if (!isFocusMode) return null;

  return (
    <div className="sticky top-4 z-40 mb-6 transition-all duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl px-4 py-3 text-white flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Focus Mode Badge & Quick View Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Focus Mode
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  (Distraction-Free)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Sidebar & footer hidden
              </span>
            </div>
          </div>

          {/* Quick study views */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto max-w-full">
            {focusViews.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center / Right: Pomodoro + Ambient Sound + Fullscreen + Exit */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Integrated Pomodoro Clock */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                pomodoro.mode === 'work'
                  ? 'bg-teal-500/20 text-teal-300'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {pomodoro.mode}
            </span>

            <span className="font-mono font-bold text-sm tracking-widest text-teal-300">
              {formatTimer(pomodoro.timeLeft)}
            </span>

            <button
              onClick={pomodoro.isRunning ? pomodoro.pause : pomodoro.start}
              className="p-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition ml-1"
              title={pomodoro.isRunning ? 'Pause Pomodoro' : 'Start Pomodoro'}
            >
              {pomodoro.isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>

            <button
              onClick={pomodoro.reset}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Reset Pomodoro"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Ambient Focus Audio Synthesizer */}
          <div className="relative">
            <button
              onClick={() => setShowSoundMenu(!showSoundMenu)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
                ambientSound !== 'none'
                  ? 'bg-teal-950/80 border-teal-500/60 text-teal-300 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Ambient soundscapes (Rain, White Noise, Alpha Waves)"
            >
              {ambientSound === 'none' ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Headphones className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              )}
              <span className="hidden sm:inline">
                {ambientSound === 'none' ? 'Sound' : ambientSoundOptions.find((s) => s.id === ambientSound)?.label}
              </span>
            </button>

            {/* Ambient Sound Dropdown */}
            {showSoundMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 text-slate-200 animate-fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-1">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                    Ambient Focus Audio
                  </span>
                  <span className="text-[10px] text-slate-400">Web Audio API</span>
                </div>
                <div className="space-y-1">
                  {ambientSoundOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setAmbientSound(opt.id);
                        setShowSoundMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition ${
                        ambientSound === opt.id
                          ? 'bg-teal-600 text-white font-medium'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{opt.icon}</span>
                        <div>
                          <div>{opt.label}</div>
                          <div
                            className={`text-[10px] ${
                              ambientSound === opt.id ? 'text-teal-100' : 'text-slate-400'
                            }`}
                          >
                            {opt.description}
                          </div>
                        </div>
                      </div>
                      {ambientSound === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit Focus Mode Button */}
          <button
            onClick={toggleFocusMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:border-rose-500/60 border border-slate-700 text-slate-200 hover:text-rose-200 text-xs font-semibold transition group shadow-sm"
            title="Exit Focus Mode (or press Escape)"
          >
            <Minimize2 className="w-3.5 h-3.5 group-hover:scale-110 transition" />
            <span>Exit Focus</span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-slate-700/80 text-slate-300 font-mono">
              Esc
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
