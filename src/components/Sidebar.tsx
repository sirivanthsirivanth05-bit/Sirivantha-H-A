import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  HelpCircle,
  BookOpen,
  LineChart,
  User,
  Flame,
  Award,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { tasks, activeStreak, pomodoro } = useStudy();

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'AI Study Planner', icon: CalendarDays, badge: pendingTasksCount },
    { id: 'assistant', label: 'AI Learning Tutor', icon: Sparkles, highlight: true },
    { id: 'quizzes', label: 'Practice Quizzes', icon: HelpCircle },
    { id: 'resources', label: 'Learning Resources', icon: BookOpen },
    { id: 'progress', label: 'Progress & Analytics', icon: LineChart },
    { id: 'profile', label: 'Profile & Settings', icon: User },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-20 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-20 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-3.5 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition group ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-teal-400 group-hover:text-teal-300'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-teal-700 text-white' : 'bg-slate-800 text-teal-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.highlight && !isActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom card: Study Streak & Productivity summary */}
        <div className="p-3.5 border-t border-slate-800">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>{activeStreak}-Day Streak</span>
              </div>
              <span className="text-[10px] text-teal-400 font-medium">On Track</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Today: {pomodoro.totalWorkMinutesCompleted}m focused study completed.
            </p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-400 h-1.5 rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((pomodoro.totalWorkMinutesCompleted / 240) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
