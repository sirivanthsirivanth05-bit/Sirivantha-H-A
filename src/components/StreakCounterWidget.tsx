import React from 'react';
import {
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  Zap,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface StreakCounterWidgetProps {
  variant?: 'compact' | 'full' | 'detailed';
  onShowCelebration?: () => void;
}

export const StreakCounterWidget: React.FC<StreakCounterWidgetProps> = ({
  variant = 'full',
  onShowCelebration,
}) => {
  const {
    streakData,
    activeStreak,
    recordActivityToday,
    nextMilestone,
    triggerMilestoneCelebration,
    allMilestones,
  } = useStudy();

  const isTodayActive = streakData.activityDates.includes(new Date().toISOString().split('T')[0]);

  // Generate 7-day display: past 6 days + today
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.toISOString().split('T')[0];
    const isCompleted = streakData.activityDates.includes(isoDate);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const isToday = i === 6;

    return {
      date: isoDate,
      dayLabel,
      isCompleted,
      isToday,
    };
  });

  const nextGoalDays = nextMilestone ? nextMilestone.days : 7;
  const progressPercent = Math.min(100, Math.round((activeStreak / nextGoalDays) * 100));

  const handleCheckIn = () => {
    recordActivityToday();
  };

  const handleTestMilestone = () => {
    if (onShowCelebration) {
      onShowCelebration();
    } else {
      const milestoneToPreview = nextMilestone || allMilestones[1] || allMilestones[0];
      triggerMilestoneCelebration(milestoneToPreview);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs">
        <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
          <Flame className="w-4 h-4 fill-white" />
        </div>
        <div>
          <span className="font-extrabold text-sm">{activeStreak} Days</span>
          <p className="text-[10px] text-orange-700 font-medium">Study Streak</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Top Header: Flame Badge + Current Streak */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-sm">
              <Flame className="w-6 h-6 fill-white animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeStreak} Days
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase bg-orange-50 text-orange-700 border border-orange-200">
                {activeStreak >= 5 ? '🔥 Hot Streak' : 'Building Momentum'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Longest streak: <span className="font-semibold text-slate-700">{streakData.longestStreak} days</span> • Daily consistency tracker
            </p>
          </div>
        </div>

        {/* Check-in CTA */}
        <button
          onClick={handleCheckIn}
          disabled={isTodayActive}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            isTodayActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs'
          }`}
        >
          {isTodayActive ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Checked in Today</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Check-in Today</span>
            </>
          )}
        </button>
      </div>

      {/* 7-Day Activity Calendar Dots */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">7-Day Study Chain:</span>
          <span className="text-[11px] text-teal-700 font-semibold">
            {last7Days.filter((d) => d.isCompleted).length} of 7 days active
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {last7Days.map((day, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition ${
                day.isCompleted
                  ? 'bg-orange-500/10 border border-orange-200 text-orange-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-400'
              } ${day.isToday ? 'ring-2 ring-teal-500' : ''}`}
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase">{day.dayLabel}</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  day.isCompleted ? 'bg-orange-500 text-white shadow-2xs' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {day.isCompleted ? (
                  <Flame className="w-3 h-3 fill-white" />
                ) : (
                  <span className="text-[9px]">•</span>
                )}
              </div>
              <span className="text-[9px] text-slate-400">{day.isToday ? 'Today' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone Progress Bar */}
      {nextMilestone && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-slate-800">
                Next Milestone: {nextMilestone.days}-Day {nextMilestone.title}
              </span>
            </div>
            <span className="font-bold text-teal-700">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 via-amber-400 to-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{nextMilestone.days - activeStreak} days remaining to reach {nextMilestone.badge}</span>
            <button
              onClick={handleTestMilestone}
              className="text-[10px] font-bold text-teal-700 hover:text-teal-900 underline inline-flex items-center gap-0.5"
            >
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>Preview Celebration</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
