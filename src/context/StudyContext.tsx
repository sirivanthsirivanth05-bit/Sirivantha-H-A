import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentProfile,
  StudyTask,
  StudySession,
  QuizResult,
  ResourceItem,
  GeneratedPlan,
  Achievement,
  StreakMilestone,
  StreakData,
} from '../types';

interface StudyContextType {
  profile: StudentProfile;
  tasks: StudyTask[];
  sessions: StudySession[];
  quizHistory: QuizResult[];
  resources: ResourceItem[];
  savedPlan: GeneratedPlan | null;
  achievements: Achievement[];
  activeStreak: number;
  streakData: StreakData;
  activeMilestoneCelebration: StreakMilestone | null;
  nextMilestone: StreakMilestone | null;
  allMilestones: StreakMilestone[];
  recordActivityToday: (customDate?: string) => void;
  triggerMilestoneCelebration: (milestone: StreakMilestone) => void;
  closeMilestoneCelebration: () => void;
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (val: boolean) => void;
  ambientSound: 'none' | 'rain' | 'whitenoise' | 'binaural';
  setAmbientSound: (sound: 'none' | 'rain' | 'whitenoise' | 'binaural') => void;
  aiStatus: {
    isConfigured: boolean;
    mode: 'live' | 'demo';
    model: string;
    message: string;
  };
  pomodoro: {
    timeLeft: number;
    isRunning: boolean;
    mode: 'work' | 'break';
    totalWorkMinutesCompleted: number;
    start: () => void;
    pause: () => void;
    reset: () => void;
    switchMode: (mode: 'work' | 'break') => void;
  };
  addTask: (task: Omit<StudyTask, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addSession: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
  saveQuizResult: (result: Omit<QuizResult, 'id' | 'date'>) => void;
  toggleBookmarkResource: (id: string) => void;
  addCustomResource: (resource: Omit<ResourceItem, 'id' | 'isBookmarked' | 'isCustom'>) => void;
  deleteCustomResource: (id: string) => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  addSubject: (subject: { name: string; color: string; examDate?: string }) => void;
  removeSubject: (id: string) => void;
  savePlan: (plan: GeneratedPlan) => void;
  resetToDemoData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  refreshAiStatus: () => Promise<void>;
}

const STORAGE_KEY_PREFIX = 'studymate_v1_';

const INITIAL_PROFILE: StudentProfile = {
  name: 'Alex Rivera',
  email: 'alex.rivera@stanford.edu',
  university: 'Stanford University',
  major: 'Computer Science & Mathematics',
  yearOfStudy: 'Junior (3rd Year)',
  targetGpa: '3.92',
  dailyGoalHours: 4,
  studyPreference: 'morning',
  preferredStartTime: '08:30 AM',
  breakIntervalMinutes: 10,
  subjects: [
    { id: 'subj-1', name: 'Data Structures & Algorithms', code: 'CS 106B', color: '#0D9488', examDate: '2026-10-29' },
    { id: 'subj-2', name: 'Calculus III & Linear Algebra', code: 'MATH 51', color: '#2563EB', examDate: '2026-11-04' },
    { id: 'subj-3', name: 'Operating Systems Architecture', code: 'CS 110', color: '#7C3AED', examDate: '2026-11-12' },
    { id: 'subj-4', name: 'Database Management Systems', code: 'CS 145', color: '#0891B2', examDate: '2026-11-20' },
    { id: 'subj-5', name: 'Physics: Electromagnetism', code: 'PHYS 41', color: '#D97706', examDate: '2026-11-28' },
  ],
};

const INITIAL_TASKS: StudyTask[] = [
  {
    id: 't-1',
    title: 'Implement Dijkstra & A* Pathfinding Algorithms in C++',
    subject: 'Data Structures & Algorithms',
    durationMinutes: 90,
    priority: 'High',
    dueDate: '2026-10-25',
    completed: false,
    notes: 'Focus on binary min-heap priority queue optimization and edge relaxation.',
    createdAt: '2026-10-23T10:00:00Z',
  },
  {
    id: 't-2',
    title: 'Calculus Problem Set 6: Multiple Integrals & Green’s Theorem',
    subject: 'Calculus III & Linear Algebra',
    durationMinutes: 75,
    priority: 'High',
    dueDate: '2026-10-25',
    completed: true,
    notes: 'Reviewed curl and divergence applications; finished questions 1-14.',
    createdAt: '2026-10-23T12:00:00Z',
  },
  {
    id: 't-3',
    title: 'Review Virtual Memory Paging & TLB Hit Rate Mechanics',
    subject: 'Operating Systems Architecture',
    durationMinutes: 60,
    priority: 'Medium',
    dueDate: '2026-10-26',
    completed: false,
    notes: 'Read Tanenbaum Chapter 3 and draw page directory table diagrams.',
    createdAt: '2026-10-24T08:30:00Z',
  },
  {
    id: 't-4',
    title: 'Design B+ Tree Indexing Simulation for Database Lab',
    subject: 'Database Management Systems',
    durationMinutes: 45,
    priority: 'Medium',
    dueDate: '2026-10-27',
    completed: false,
    notes: 'Compare node splitting vs merging overhead in ACID transactions.',
    createdAt: '2026-10-24T09:15:00Z',
  },
  {
    id: 't-5',
    title: 'Maxwell Equations Concept Map & Gauss Law Practice',
    subject: 'Physics: Electromagnetism',
    durationMinutes: 40,
    priority: 'Low',
    dueDate: '2026-10-28',
    completed: true,
    notes: 'Summary cheat-sheet created for electric flux through spherical surfaces.',
    createdAt: '2026-10-22T14:00:00Z',
  },
];

const INITIAL_SESSIONS: StudySession[] = [
  { id: 's-1', subject: 'Data Structures & Algorithms', durationMinutes: 90, timestamp: '2026-10-20T14:00:00Z', technique: 'Pomodoro' },
  { id: 's-2', subject: 'Calculus III & Linear Algebra', durationMinutes: 120, timestamp: '2026-10-21T10:30:00Z', technique: 'Active Recall' },
  { id: 's-3', subject: 'Operating Systems Architecture', durationMinutes: 75, timestamp: '2026-10-22T15:00:00Z', technique: 'Feynman Technique' },
  { id: 's-4', subject: 'Data Structures & Algorithms', durationMinutes: 105, timestamp: '2026-10-23T11:00:00Z', technique: 'Pomodoro' },
  { id: 's-5', subject: 'Calculus III & Linear Algebra', durationMinutes: 90, timestamp: '2026-10-24T09:00:00Z', technique: 'Spaced Repetition' },
];

const INITIAL_QUIZ_HISTORY: QuizResult[] = [
  {
    id: 'q-res-1',
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Algorithms & Trees',
    difficulty: 'Medium',
    score: 5,
    total: 5,
    percentage: 100,
    timeSpentSeconds: 145,
    date: '2026-10-22T16:30:00Z',
    questions: [],
    userAnswers: [0, 0, 0, 0, 0],
  },
  {
    id: 'q-res-2',
    subject: 'Calculus III & Linear Algebra',
    topic: 'Eigenvalues & Coordinate Transforms',
    difficulty: 'Hard',
    score: 4,
    total: 5,
    percentage: 80,
    timeSpentSeconds: 210,
    date: '2026-10-23T18:00:00Z',
    questions: [],
    userAnswers: [0, 1, 0, 0, 0],
  },
  {
    id: 'q-res-3',
    subject: 'Operating Systems Architecture',
    topic: 'Concurrency & Deadlocks',
    difficulty: 'Medium',
    score: 4,
    total: 5,
    percentage: 80,
    timeSpentSeconds: 160,
    date: '2026-10-24T08:00:00Z',
    questions: [],
    userAnswers: [0, 0, 2, 0, 0],
  },
];

const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'VisuAlgo — Visualizing Data Structures and Algorithms',
    subject: 'Data Structures & Algorithms',
    category: 'Interactive Simulator',
    url: 'https://visualgo.net',
    description: 'Animated step-by-step visualizations of Dijkstra, BFS, DFS, AVL trees, and sorting algorithms.',
    tags: ['Interactive', 'Visual', 'Graphs', 'Trees'],
    isBookmarked: true,
  },
  {
    id: 'res-2',
    title: 'Paul’s Online Math Notes — Calculus III & Linear Algebra',
    subject: 'Calculus III & Linear Algebra',
    category: 'Cheat Sheet',
    url: 'https://tutorial.math.lamar.edu',
    description: 'Comprehensive cheat sheets, worked examples, and practice problems for multi-variable calculus.',
    tags: ['Cheat Sheet', 'Formulas', 'Calculus'],
    isBookmarked: true,
  },
  {
    id: 'res-3',
    title: 'MIT OpenCourseWare: Introduction to Algorithms (6.006)',
    subject: 'Data Structures & Algorithms',
    category: 'Video Course',
    url: 'https://ocw.mit.edu',
    description: 'Renowned MIT lecture series with Erik Demaine covering dynamic programming, amortized analysis, and graph traversal.',
    tags: ['MIT', 'Lectures', 'Core CS'],
    isBookmarked: false,
  },
  {
    id: 'res-4',
    title: '3Blue1Brown — Essence of Linear Algebra',
    subject: 'Calculus III & Linear Algebra',
    category: 'Video Course',
    url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
    description: 'Intuitive geometric visualizations explaining determinants, eigenvectors, dot products, and transformations.',
    tags: ['Visual', 'Intuitive', 'Matrix'],
    isBookmarked: true,
  },
  {
    id: 'res-5',
    title: 'Operating Systems: Three Easy Pieces (OSTEP)',
    subject: 'Operating Systems Architecture',
    category: 'Documentation',
    url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    description: 'The golden standard textbook for virtualization, concurrency, and persistence with practical coding projects.',
    tags: ['Free Book', 'Virtual Memory', 'Threads'],
    isBookmarked: false,
  },
  {
    id: 'res-6',
    title: 'Stanford CS145 Database Lecture Notes & SQL Playground',
    subject: 'Database Management Systems',
    category: 'Documentation',
    url: 'https://web.stanford.edu/class/cs145/',
    description: 'Relational algebra, normal forms (BCNF, 3NF), index tuning, and distributed query optimization.',
    tags: ['SQL', 'Indexes', 'ACID'],
    isBookmarked: false,
  },
  {
    id: 'res-7',
    title: 'PhET Interactive Simulations — Electromagnetism & Circuits',
    subject: 'Physics: Electromagnetism',
    category: 'Interactive Simulator',
    url: 'https://phet.colorado.edu',
    description: 'Interactive HTML5 lab simulations exploring electric charges, magnetic fields, and Faraday law.',
    tags: ['Physics', 'Simulations', 'STEM'],
    isBookmarked: true,
  },
  {
    id: 'res-8',
    title: 'LeetCode Curated Blind 75 Algorithm Bank',
    subject: 'Data Structures & Algorithms',
    category: 'Practice Bank',
    url: 'https://leetcode.com',
    description: 'High-yield algorithmic coding challenges categorized by patterns (Sliding Window, Two Pointers, Topo Sort).',
    tags: ['Interview Prep', 'Coding', 'Practice'],
    isBookmarked: false,
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', title: 'Plan Architect', description: 'Generated a personalized AI weekly study timetable', icon: '📅', unlocked: true, progress: 1, maxProgress: 1 },
  { id: 'ach-2', title: 'Consistent Scholar', description: 'Maintain an active 5-day study streak', icon: '🔥', unlocked: true, progress: 5, maxProgress: 5 },
  { id: 'ach-3', title: 'Quiz Ace', description: 'Score 100% on any practice academic quiz', icon: '🏆', unlocked: true, progress: 1, maxProgress: 1 },
  { id: 'ach-4', title: 'Deep Work Master', description: 'Complete 10 focused Pomodoro study sessions', icon: '⏳', unlocked: false, progress: 5, maxProgress: 10 },
  { id: 'ach-5', title: 'Knowledge Explorer', description: 'Ask the AI Assistant 5 academic questions', icon: '💡', unlocked: false, progress: 3, maxProgress: 5 },
];

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    title: 'Habit Igniter',
    badge: 'Bronze Flame',
    icon: '🔥',
    color: '#D97706',
    description: 'You built the initial spark! 3 consecutive days of proactive study.',
    rewardQuote: 'The secret of getting ahead is getting started. — Mark Twain',
  },
  {
    days: 5,
    title: 'Consistent Scholar',
    badge: 'Silver Torch',
    icon: '⚡',
    color: '#0D9488',
    description: '5 straight days of focus. Your neuro-synaptic pathways are solidifying!',
    rewardQuote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit. — Will Durant',
  },
  {
    days: 7,
    title: 'Week Warrior',
    badge: 'Gold Beacon',
    icon: '🏆',
    color: '#EAB308',
    description: 'A full 7-day week of unbroken academic dedication! You defeated procrastination.',
    rewardQuote: 'Small disciplines repeated with consistency every day lead to great achievements. — John C. Maxwell',
  },
  {
    days: 10,
    title: 'Discipline Titan',
    badge: 'Emerald Crest',
    icon: '💎',
    color: '#059669',
    description: '10 days strong! You have outpaced 95% of average study consistency.',
    rewardQuote: 'Discipline is the bridge between goals and accomplishment. — Jim Rohn',
  },
  {
    days: 14,
    title: 'Fortnight Master',
    badge: 'Sapphire Phoenix',
    icon: '🦅',
    color: '#2563EB',
    description: 'Two full unbroken weeks. Spaced repetition is now an instinctive superpower.',
    rewardQuote: 'Motivation gets you going, but discipline keeps you growing.',
  },
  {
    days: 21,
    title: 'Habit Champion',
    badge: 'Amethyst Crown',
    icon: '👑',
    color: '#9333EA',
    description: '21 Days! Neuroscientists agree your study routine is now second nature.',
    rewardQuote: 'Champions do not become champions in the ring. They are merely recognized there.',
  },
  {
    days: 30,
    title: 'Academic Legend',
    badge: 'Diamond Legend',
    icon: '🌟',
    color: '#0891B2',
    description: '30-Day streak milestone achieved. True dedication, academic grit, and excellence.',
    rewardQuote: 'Perseverance is not a long race; it is many short races one after another.',
  },
];

const INITIAL_STREAK_DATA: StreakData = {
  currentStreak: 5,
  longestStreak: 7,
  lastActiveDate: '2026-10-24',
  activityDates: [
    '2026-10-20',
    '2026-10-21',
    '2026-10-22',
    '2026-10-23',
    '2026-10-24',
  ],
  unlockedMilestones: [3, 5],
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

// Web Audio synthesizer for milestone fanfare celebration
function playFanfareChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.45);
      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.45);
    });
  } catch (e) {
    // Ignore audio permission errors
  }
}

// Web Audio synthesizer for chime
function playChime(isWork: boolean) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isWork) {
      // Pleasant completed work sound
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else {
      // Break over sound
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    // Ignore audio permission errors
  }
}

// Web Audio synthesizer for ambient focus sounds (Rain, White Noise, Alpha Beats)
let ambientAudioCtx: AudioContext | null = null;
let ambientNodes: any[] = [];

function stopAmbientSound() {
  if (ambientNodes.length > 0) {
    ambientNodes.forEach((node) => {
      try {
        node.stop?.();
        node.disconnect?.();
      } catch (e) {
        // ignore
      }
    });
    ambientNodes = [];
  }
}

function startAmbientSound(type: 'none' | 'rain' | 'whitenoise' | 'binaural') {
  stopAmbientSound();
  if (type === 'none') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!ambientAudioCtx) {
      ambientAudioCtx = new AudioContextClass();
    }
    if (ambientAudioCtx.state === 'suspended') {
      ambientAudioCtx.resume();
    }

    const ctx = ambientAudioCtx;

    if (type === 'whitenoise') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.035, ctx.currentTime);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noiseNode.start();
      ambientNodes = [noiseNode, filter, gain];
    } else if (type === 'rain') {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.12;
      }
      const rainSource = ctx.createBufferSource();
      rainSource.buffer = buffer;
      rainSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.Q.setValueAtTime(0.6, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.055, ctx.currentTime);

      rainSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      rainSource.start();
      ambientNodes = [rainSource, filter, gain];
    } else if (type === 'binaural') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.frequency.setValueAtTime(200, ctx.currentTime);
      osc2.frequency.setValueAtTime(210, ctx.currentTime); // 10Hz Alpha focus difference

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.045, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      ambientNodes = [osc1, osc2, gain];
    }
  } catch (err) {
    console.warn('Ambient sound synthesis error:', err);
  }
}

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe localStorage helper
  const loadLocal = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveLocal = (key: string, val: any) => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
    } catch {
      // storage full or quota exceeded
    }
  };

  const [profile, setProfile] = useState<StudentProfile>(() => loadLocal('profile', INITIAL_PROFILE));
  const [tasks, setTasks] = useState<StudyTask[]>(() => loadLocal('tasks', INITIAL_TASKS));
  const [sessions, setSessions] = useState<StudySession[]>(() => loadLocal('sessions', INITIAL_SESSIONS));
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>(() => loadLocal('quizzes', INITIAL_QUIZ_HISTORY));
  const [resources, setResources] = useState<ResourceItem[]>(() => loadLocal('resources', INITIAL_RESOURCES));
  const [savedPlan, setSavedPlan] = useState<GeneratedPlan | null>(() => loadLocal('savedPlan', null));
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadLocal('achievements', INITIAL_ACHIEVEMENTS));
  const [streakData, setStreakData] = useState<StreakData>(() => loadLocal('streakData', INITIAL_STREAK_DATA));
  const [activeMilestoneCelebration, setActiveMilestoneCelebration] = useState<StreakMilestone | null>(null);

  const activeStreak = streakData.currentStreak;
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > activeStreak) || null;

  const recordActivityToday = (customDate?: string) => {
    const today = customDate || new Date().toISOString().split('T')[0];
    setStreakData((prev) => {
      const alreadyHas = prev.activityDates.includes(today);
      const updatedDates = alreadyHas ? prev.activityDates : Array.from(new Set([...prev.activityDates, today])).sort();

      // Calculate consecutive days backwards from today
      let streak = 0;
      const checkDate = new Date(today + 'T12:00:00Z');
      while (true) {
        const iso = checkDate.toISOString().split('T')[0];
        if (updatedDates.includes(iso)) {
          streak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      const newLongest = Math.max(prev.longestStreak, streak);

      // Check for newly unlocked milestone
      const reachedMilestone = STREAK_MILESTONES.find(
        (m) => streak >= m.days && !prev.unlockedMilestones.includes(m.days)
      );

      let newUnlocked = prev.unlockedMilestones;
      if (reachedMilestone) {
        newUnlocked = [...newUnlocked, reachedMilestone.days];
        playFanfareChime();
        setActiveMilestoneCelebration(reachedMilestone);
      }

      return {
        currentStreak: streak,
        longestStreak: newLongest,
        lastActiveDate: today,
        activityDates: updatedDates,
        unlockedMilestones: newUnlocked,
      };
    });
  };

  const triggerMilestoneCelebration = (milestone: StreakMilestone) => {
    playFanfareChime();
    setActiveMilestoneCelebration(milestone);
  };

  const closeMilestoneCelebration = () => {
    setActiveMilestoneCelebration(null);
  };

  // Focus Mode state and Ambient Sound
  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => loadLocal('isFocusMode', false));
  const [ambientSound, setAmbientSoundState] = useState<'none' | 'rain' | 'whitenoise' | 'binaural'>('none');

  const toggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev;
      saveLocal('isFocusMode', next);
      return next;
    });
  };

  const setFocusMode = (val: boolean) => {
    setIsFocusMode(val);
    saveLocal('isFocusMode', val);
  };

  const setAmbientSound = (sound: 'none' | 'rain' | 'whitenoise' | 'binaural') => {
    setAmbientSoundState(sound);
    startAmbientSound(sound);
  };

  // Keyboard shortcut: Escape exits focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
        saveLocal('isFocusMode', false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Clean up ambient audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const [aiStatus, setAiStatus] = useState<{
    isConfigured: boolean;
    mode: 'live' | 'demo';
    model: string;
    message: string;
  }>({
    isConfigured: false,
    mode: 'demo',
    model: 'gemini-3.8-flash',
    message: 'Checking AI engine connection...',
  });

  // Pomodoro timer state
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [totalWorkMinutes, setTotalWorkMinutes] = useState<number>(() => loadLocal('pomodoroMinutes', 75));

  // Fetch AI status from server
  const refreshAiStatus = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setAiStatus({
          isConfigured: data.aiConfigured,
          mode: data.mode,
          model: data.model || 'gemini-3.8-flash',
          message: data.message,
        });
      }
    } catch (e) {
      setAiStatus({
        isConfigured: false,
        mode: 'demo',
        model: 'gemini-3.8-flash',
        message: 'StudyMate Offline Smart Engine is active in Demo Mode.',
      });
    }
  };

  useEffect(() => {
    refreshAiStatus();
  }, []);

  // Save changes to local storage
  useEffect(() => { saveLocal('profile', profile); }, [profile]);
  useEffect(() => { saveLocal('tasks', tasks); }, [tasks]);
  useEffect(() => { saveLocal('sessions', sessions); }, [sessions]);
  useEffect(() => { saveLocal('quizzes', quizHistory); }, [quizHistory]);
  useEffect(() => { saveLocal('resources', resources); }, [resources]);
  useEffect(() => { saveLocal('savedPlan', savedPlan); }, [savedPlan]);
  useEffect(() => { saveLocal('achievements', achievements); }, [achievements]);
  useEffect(() => { saveLocal('streakData', streakData); }, [streakData]);
  useEffect(() => { saveLocal('pomodoroMinutes', totalWorkMinutes); }, [totalWorkMinutes]);

  // Pomodoro countdown timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed current cycle
      if (timerMode === 'work') {
        playChime(true);
        setTotalWorkMinutes((prev) => prev + 25);
        recordActivityToday();
        // Add automatically to study sessions
        const newSession: StudySession = {
          id: 'sess-' + Date.now(),
          subject: profile.subjects[0]?.name || 'General Study',
          durationMinutes: 25,
          timestamp: new Date().toISOString(),
          technique: 'Pomodoro',
          notes: 'Completed 25m focused Pomodoro sprint',
        };
        setSessions((prev) => [newSession, ...prev]);
        setTimerMode('break');
        setTimeLeft(5 * 60);
      } else {
        playChime(false);
        setTimerMode('work');
        setTimeLeft(25 * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, timerMode, profile.subjects]);

  // Task actions
  const addTask = (newTask: Omit<StudyTask, 'id' | 'createdAt'>) => {
    const task: StudyTask = {
      ...newTask,
      id: 't-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<StudyTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            recordActivityToday();
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  // Session actions
  const addSession = (session: Omit<StudySession, 'id' | 'timestamp'>) => {
    const s: StudySession = {
      ...session,
      id: 'sess-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setSessions((prev) => [s, ...prev]);
    recordActivityToday();
  };

  // Quiz actions
  const saveQuizResult = (result: Omit<QuizResult, 'id' | 'date'>) => {
    const res: QuizResult = {
      ...result,
      id: 'q-' + Date.now(),
      date: new Date().toISOString(),
    };
    setQuizHistory((prev) => [res, ...prev]);
    recordActivityToday();

    // Check achievement for 100% quiz
    if (result.percentage === 100) {
      setAchievements((prev) =>
        prev.map((a) => (a.id === 'ach-3' ? { ...a, unlocked: true } : a))
      );
    }
  };

  // Resource actions
  const toggleBookmarkResource = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isBookmarked: !r.isBookmarked } : r))
    );
  };

  const addCustomResource = (res: Omit<ResourceItem, 'id' | 'isBookmarked' | 'isCustom'>) => {
    const item: ResourceItem = {
      ...res,
      id: 'c-res-' + Date.now(),
      isBookmarked: true,
      isCustom: true,
    };
    setResources((prev) => [item, ...prev]);
  };

  const deleteCustomResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  // Profile actions
  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addSubject = (subj: { name: string; color: string; examDate?: string }) => {
    const newSubj = {
      id: 'subj-' + Date.now(),
      name: subj.name,
      color: subj.color,
      examDate: subj.examDate,
    };
    setProfile((prev) => ({ ...prev, subjects: [...prev.subjects, newSubj] }));
  };

  const removeSubject = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
  };

  const savePlan = (plan: GeneratedPlan) => {
    setSavedPlan(plan);
    // Add quick tasks from the generated plan into active task list
    if (plan.quickTasks && plan.quickTasks.length > 0) {
      const planTasks: StudyTask[] = plan.quickTasks.map((qt, i) => ({
        id: `plan-t-${Date.now()}-${i}`,
        title: qt.title,
        subject: qt.subject,
        durationMinutes: qt.duration || 45,
        priority: qt.priority || 'Medium',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        completed: false,
        createdAt: new Date().toISOString(),
      }));
      setTasks((prev) => [...planTasks, ...prev]);
    }
    // Unlock achievement
    setAchievements((prev) =>
      prev.map((a) => (a.id === 'ach-1' ? { ...a, unlocked: true } : a))
    );
  };

  const resetToDemoData = () => {
    setProfile(INITIAL_PROFILE);
    setTasks(INITIAL_TASKS);
    setSessions(INITIAL_SESSIONS);
    setQuizHistory(INITIAL_QUIZ_HISTORY);
    setResources(INITIAL_RESOURCES);
    setSavedPlan(null);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setStreakData(INITIAL_STREAK_DATA);
    setActiveMilestoneCelebration(null);
    setIsFocusMode(false);
    setAmbientSoundState('none');
    stopAmbientSound();
    setTotalWorkMinutes(75);
    setTimeLeft(25 * 60);
    setIsRunning(false);
    setTimerMode('work');
  };

  const exportDataJson = () => {
    const data = {
      profile,
      tasks,
      sessions,
      quizHistory,
      resources,
      savedPlan,
      achievements,
      streakData,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.sessions) setSessions(parsed.sessions);
      if (parsed.quizHistory) setQuizHistory(parsed.quizHistory);
      if (parsed.resources) setResources(parsed.resources);
      if (parsed.streakData) setStreakData(parsed.streakData);
      if (parsed.savedPlan !== undefined) setSavedPlan(parsed.savedPlan);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StudyContext.Provider
      value={{
        profile,
        tasks,
        sessions,
        quizHistory,
        resources,
        savedPlan,
        achievements,
        activeStreak,
        streakData,
        activeMilestoneCelebration,
        nextMilestone,
        allMilestones: STREAK_MILESTONES,
        recordActivityToday,
        triggerMilestoneCelebration,
        closeMilestoneCelebration,
        isFocusMode,
        toggleFocusMode,
        setFocusMode,
        ambientSound,
        setAmbientSound,
        aiStatus,
        pomodoro: {
          timeLeft,
          isRunning,
          mode: timerMode,
          totalWorkMinutesCompleted: totalWorkMinutes,
          start: () => setIsRunning(true),
          pause: () => setIsRunning(false),
          reset: () => {
            setIsRunning(false);
            setTimeLeft(timerMode === 'work' ? 25 * 60 : 5 * 60);
          },
          switchMode: (newMode: 'work' | 'break') => {
            setTimerMode(newMode);
            setIsRunning(false);
            setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
          },
        },
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addSession,
        saveQuizResult,
        toggleBookmarkResource,
        addCustomResource,
        deleteCustomResource,
        updateProfile,
        addSubject,
        removeSubject,
        savePlan,
        resetToDemoData,
        exportDataJson,
        importDataJson,
        refreshAiStatus,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
