export type Priority = 'High' | 'Medium' | 'Low';

export interface SubjectItem {
  id: string;
  name: string;
  code?: string;
  color: string; // e.g. '#0D9488', '#3B82F6', etc.
  examDate?: string;
  instructor?: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  priority: Priority;
  dueDate: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export type ChronotypePreference = 'morning' | 'afternoon' | 'night' | 'flexible';

export interface StudentProfile {
  name: string;
  email: string;
  university: string;
  major: string;
  yearOfStudy: string;
  targetGpa: string;
  dailyGoalHours: number;
  studyPreference: ChronotypePreference;
  preferredStartTime: string;
  breakIntervalMinutes: number;
  subjects: SubjectItem[];
}

export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  timestamp: string;
  technique: string;
  notes?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  concept?: string;
}

export interface QuizResult {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  date: string;
  questions: QuizQuestion[];
  userAnswers: number[]; // index of choice selected
}

export type ResourceCategory =
  | 'Cheat Sheet'
  | 'Video Course'
  | 'Interactive Simulator'
  | 'Documentation'
  | 'Practice Bank';

export interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  category: ResourceCategory;
  url: string;
  description: string;
  tags: string[];
  isBookmarked: boolean;
  isCustom?: boolean;
}

export interface TimetableSession {
  timeSlot: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  priority: Priority;
  technique: string;
}

export interface DaySchedule {
  day: string;
  focus: string;
  sessions: TimetableSession[];
}

export interface GeneratedPlan {
  summary: string;
  dailyTargetHours: number;
  weeklySchedule: DaySchedule[];
  quickTasks: Array<{
    title: string;
    subject: string;
    duration: number;
    priority: Priority;
    deadline: string;
  }>;
  studyTips: string[];
  source?: string;
  isDemo?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface StreakMilestone {
  days: number;
  title: string;
  badge: string;
  icon: string;
  color: string;
  description: string;
  rewardQuote: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  activityDates: string[];
  unlockedMilestones: number[];
}
