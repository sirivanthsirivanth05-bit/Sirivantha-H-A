import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Award,
  Sparkles,
  X,
  Share2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StreakMilestone } from '../types';

interface StreakCelebrationModalProps {
  milestone: StreakMilestone | null;
  currentStreak: number;
  onClose: () => void;
}

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  milestone,
  currentStreak,
  onClose,
}) => {
  useEffect(() => {
    if (milestone) {
      // Launch celebratory multi-stage confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#EF4444', '#0D9488', '#3B82F6', '#8B5CF6'],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [milestone]);

  if (!milestone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden text-center text-slate-800 p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Floating Glowing Badge with Flame */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-300 blur-lg opacity-60 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg border-4 border-white">
            <Flame className="w-12 h-12 fill-white animate-bounce" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-slate-900 text-yellow-300 border-2 border-white shadow-xs">
            <Sparkles className="w-4 h-4 fill-yellow-300" />
          </div>
        </div>

        {/* Milestone Headline */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-extrabold uppercase tracking-wider">
            <span>🎉 Streak Milestone Unlocked</span>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            {currentStreak}-Day Streak!
          </h2>

          <p className="text-sm font-bold text-amber-700">
            {milestone.title} • {milestone.badge}
          </p>

          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            {milestone.description}
          </p>
        </div>

        {/* Motivational Quote Card */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 italic relative">
          <span className="text-2xl font-serif text-amber-400 absolute -top-1 left-3 leading-none">“</span>
          <p className="pt-1.5 px-2 font-medium leading-relaxed">{milestone.rewardQuote}</p>
        </div>

        {/* Cognitive Habit Achievement Perk */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Neural Habit Strength</p>
              <p className="text-[11px] text-slate-500">
                Cognitive momentum index: +{currentStreak * 12}% consistency boost
              </p>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-teal-600 hover:from-orange-600 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Keep The Momentum Going!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
