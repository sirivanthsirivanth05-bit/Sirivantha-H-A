import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI if API key exists
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
    aiClient = null;
  }
}

// Status & diagnostics endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const isKeyConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    aiConfigured: isKeyConfigured,
    model: 'gemini-3.8-flash',
    mode: isKeyConfigured ? 'live' : 'demo',
    message: isKeyConfigured
      ? 'Gemini 3.8 Flash is active and ready.'
      : 'StudyMate Offline Smart Engine is active in Demo Mode. (Add GEMINI_API_KEY in Secrets for live AI generation)',
  });
});

// AI Learning Assistant Q&A
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  const { question, subject = 'General Academics', mode = 'detailed' } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required.' });
  }

  // If live AI is available, call Gemini 3.8 Flash
  if (aiClient) {
    try {
      let promptInstruction = '';
      if (mode === 'simple') {
        promptInstruction = `Explain the following academic concept in very simple, intuitive terms suitable for a high school or college introductory student (EL15 / Explain Like I'm 15). Use real-world analogies, concise bullet points, and avoid excessive jargon.`;
      } else if (mode === 'practice') {
        promptInstruction = `Provide a concise explanation of this academic concept, followed immediately by 3 challenging practice multiple-choice questions with answers hidden behind a spoiler/reveal format, plus explanations.`;
      } else if (mode === 'steps') {
        promptInstruction = `Solve and break down this question or problem step-by-step. Number each step clearly, state the mathematical/logical rationale for each step, and highlight key formulas used.`;
      } else {
        promptInstruction = `Provide a comprehensive, student-friendly academic explanation. Include: 1) Core definition, 2) Key principles or formulas, 3) Real-world intuitive example/analogy, 4) Common misconceptions to avoid, and 5) Summary key takeaway.`;
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${promptInstruction}\n\nSubject: ${subject}\nQuestion: ${question}`,
        config: {
          systemInstruction:
            'You are StudyMate AI, an inspiring, patient, and world-class academic tutor and professor. Always respond using clean, beautifully formatted Markdown with headers, bold terms, and structured lists.',
        },
      });

      return res.json({
        answer: response.text || 'No response generated.',
        source: 'gemini-3.8-flash',
        isDemo: false,
      });
    } catch (error: any) {
      console.warn('Gemini API call failed, falling back to smart educational engine:', error?.message);
    }
  }

  // Fallback / Demo Mode: High quality structured academic response
  const demoResponse = getSmartDemoAnswer(question, subject, mode);
  return res.json({
    answer: demoResponse,
    source: 'StudyMate Offline Smart Engine (Demo Mode)',
    isDemo: true,
  });
});

// AI Study Planner Generator
app.post('/api/ai/plan', async (req: Request, res: Response) => {
  const {
    subjects,
    topics,
    dailyHours = 3,
    examDates,
    difficulty = 'balanced',
    chronotype = 'morning',
    preferredStartTime = '08:30 AM',
  } = req.body;

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ error: 'At least one subject is required.' });
  }

  if (aiClient) {
    try {
      const prompt = `Create an optimized, realistic, high-yield weekly study plan tailored to the student's comfortable daily routine.
Subjects: ${subjects.join(', ')}
Topics to focus on: ${topics || 'Core curriculum fundamentals and upcoming exams'}
Available study hours per day: ${dailyHours} hours
Upcoming exams or deadlines: ${JSON.stringify(examDates || {})}
Difficulty pacing: ${difficulty}
Student's Comfortable Daily Routine / Chronotype: ${chronotype} (Preferred study start time: ${preferredStartTime})
Note: ALL scheduled session timeslots in weeklySchedule MUST strictly fit their comfortable routine (${
        chronotype === 'morning'
          ? 'Morning window between 07:00 AM and 12:30 PM'
          : chronotype === 'afternoon'
          ? 'Afternoon window between 01:00 PM and 06:30 PM'
          : chronotype === 'night'
          ? 'Evening/Night window between 06:30 PM and 11:45 PM'
          : 'Flexible balanced windows across the day with cognitive breaks'
      }).

Return ONLY valid JSON matching this structure:
{
  "summary": "Short 2-sentence encouraging strategy overview adapted to their ${chronotype} routine",
  "dailyTargetHours": ${dailyHours},
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Main focus of the day",
      "sessions": [
        {
          "timeSlot": "e.g. 09:00 AM - 10:30 AM",
          "subject": "${subjects[0]}",
          "topic": "Specific subtopic",
          "durationMinutes": 90,
          "priority": "High",
          "technique": "Pomodoro (3x 25m focus + 5m break)"
        }
      ]
    }
  ],
  "quickTasks": [
    {
      "title": "Task title",
      "subject": "${subjects[0]}",
      "duration": 45,
      "priority": "High",
      "deadline": "This week"
    }
  ],
  "studyTips": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"]
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return res.json({ ...parsed, isDemo: false, source: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('AI plan generation error, returning smart schedule template:', err?.message);
    }
  }

  // Built-in intelligent timetable generator
  const generatedPlan = generateAlgorithmicPlan(subjects, topics, dailyHours, examDates, difficulty, chronotype);
  return res.json({ ...generatedPlan, isDemo: true, source: 'StudyMate Offline Smart Engine' });
});

// AI Quiz Generator
app.post('/api/ai/quiz', async (req: Request, res: Response) => {
  const { subject = 'Computer Science', topic = 'Algorithms', count = 5, difficulty = 'Medium' } = req.body;

  if (aiClient) {
    try {
      const prompt = `Generate a ${count}-question multiple choice quiz on the subject "${subject}", specifically covering topic "${topic}" at ${difficulty} difficulty level.
Return ONLY a valid JSON array of questions matching this schema:
[
  {
    "id": 1,
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear explanation of why this answer is correct and why other options are incorrect.",
    "concept": "Core concept tested"
  }
]`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '[]';
      const questions = JSON.parse(text);
      return res.json({
        subject,
        topic,
        difficulty,
        questions,
        isDemo: false,
        source: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.warn('AI Quiz generation error, returning curated question set:', err?.message);
    }
  }

  const fallbackQuestions = getCuratedQuizQuestions(subject, topic, count, difficulty);
  return res.json({
    subject,
    topic,
    difficulty,
    questions: fallbackQuestions,
    isDemo: true,
    source: 'StudyMate Curated Academic Bank',
  });
});

// Performance Recommendations
app.post('/api/ai/recommendations', async (req: Request, res: Response) => {
  const { stats, weakSubjects = [] } = req.body;

  if (aiClient) {
    try {
      const prompt = `Based on the following student statistics:
Weekly hours: ${stats?.weeklyHours || 12}
Completed tasks: ${stats?.completedTasks || 18}
Average quiz score: ${stats?.avgQuizScore || 78}%
Weakest areas: ${weakSubjects.join(', ') || 'Calculus Integrals, Data Structures'}
Provide 3 concise, highly actionable, encouraging academic recommendations to optimize memory retention and exam readiness.
Return ONLY a JSON array of strings, e.g. ["Recommendation 1", "Recommendation 2", "Recommendation 3"]`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const recommendations = JSON.parse(response.text?.trim() || '[]');
      return res.json({ recommendations, isDemo: false });
    } catch (e) {
      // fallback below
    }
  }

  const defaultRecs = [
    `Dedicate 45 minutes of active recall on ${weakSubjects[0] || 'your lowest scoring subject'} before moving to new material.`,
    'Your retention is highest in 25-minute Pomodoro bursts followed by 5-minute cognitive breaks.',
    'Schedule a self-testing quiz 48 hours after learning a new topic to leverage the spaced repetition curve.',
  ];
  return res.json({ recommendations: defaultRecs, isDemo: true });
});

// Helper: Smart Algorithmic Plan generator
function generateAlgorithmicPlan(
  subjects: string[],
  topics: string,
  dailyHours: number,
  examDates: any,
  difficulty: string,
  chronotype: string = 'morning'
) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  let times = ['08:00 AM - 09:30 AM', '10:00 AM - 11:30 AM', '11:45 AM - 01:15 PM'];
  if (chronotype === 'afternoon') {
    times = ['01:00 PM - 02:30 PM', '03:00 PM - 04:30 PM', '05:00 PM - 06:30 PM'];
  } else if (chronotype === 'night') {
    times = ['07:00 PM - 08:30 PM', '09:00 PM - 10:30 PM', '10:45 PM - 12:15 AM'];
  } else if (chronotype === 'flexible') {
    times = ['09:00 AM - 10:30 AM', '02:00 PM - 03:30 PM', '07:30 PM - 09:00 PM'];
  }

  const weeklySchedule = days.map((day, idx) => {
    const isWeekend = day === 'Saturday' || day === 'Sunday';
    const daySubjects = isWeekend
      ? [subjects[idx % subjects.length]]
      : [subjects[idx % subjects.length], subjects[(idx + 1) % subjects.length]];

    const sessions = daySubjects.slice(0, Math.max(1, Math.floor(dailyHours / 1.5))).map((subj, sIdx) => ({
      timeSlot: times[sIdx % times.length],
      subject: subj,
      topic: topics ? `${subj}: Key Practice & ${topics.slice(0, 30)}` : `${subj}: Deep Dive & Problem Solving`,
      durationMinutes: 90,
      priority: sIdx === 0 ? 'High' : 'Medium',
      technique: 'Spaced Retrieval + 3x 25m Pomodoro Focus',
    }));

    return {
      day,
      focus: isWeekend ? 'Synthesis, Practice Quizzes & Weekly Review' : `Core Mastery: ${daySubjects.join(' & ')}`,
      sessions,
    };
  });

  const quickTasks = subjects.flatMap((subj, index) => [
    {
      id: `task-gen-${index}-1`,
      title: `${subj}: Solve 5 practice exam problems`,
      subject: subj,
      duration: 45,
      priority: 'High',
      deadline: 'Tomorrow',
      completed: false,
    },
    {
      id: `task-gen-${index}-2`,
      title: `${subj}: Active recall flashcards & formula summary`,
      subject: subj,
      duration: 30,
      priority: 'Medium',
      deadline: 'In 3 days',
      completed: false,
    },
  ]);

  return {
    summary: `Structured ${dailyHours}-hour daily schedule balancing active recall, spaced repetition, and targeted practice for ${subjects.join(', ')}.`,
    dailyTargetHours: dailyHours,
    weeklySchedule,
    quickTasks: quickTasks.slice(0, 6),
    studyTips: [
      'Active Recall beats passive re-reading: always quiz yourself before looking at lecture slides.',
      'Protect the first 90 minutes of your morning for your highest-priority or most challenging subject.',
      'Use the Feynman Technique: explain complex formulas or code in simple everyday words.',
      'Take a 10-minute movement break every 50 minutes to restore cognitive neurotransmitters.',
    ],
  };
}

// Helper: Curated Quiz Bank for offline/demo robustness
function getCuratedQuizQuestions(subject: string, topic: string, count: number, difficulty: string) {
  const bank = [
    {
      id: 1,
      question: 'Which algorithmic paradigm does Dijkstra’s shortest path algorithm employ on graphs with non-negative edge weights?',
      options: ['Greedy Strategy', 'Divide and Conquer', 'Dynamic Programming with memoization', 'Brute-force Backtracking'],
      correctIndex: 0,
      explanation: 'Dijkstra’s algorithm is fundamentally a greedy algorithm: at each step it extracts the unvisited vertex with the minimum tentative distance using a priority queue.',
      concept: 'Greedy Graph Algorithms',
    },
    {
      id: 2,
      question: 'What is the average and worst-case time complexity of QuickSelect to find the k-th smallest element in an array of size n?',
      options: ['O(n) average, O(n²) worst-case', 'O(n log n) average, O(n²) worst-case', 'O(1) average, O(n) worst-case', 'O(n²) in all cases'],
      correctIndex: 0,
      explanation: 'QuickSelect partitions the array like QuickSort but only recurses into one partition, yielding O(n) average time complexity and O(n²) worst-case with poor pivots.',
      concept: 'Selection Algorithms',
    },
    {
      id: 3,
      question: 'In Calculus, what is the integral of ln(x) dx?',
      options: ['x·ln(x) - x + C', '1/x + C', 'x²·ln(x) + C', 'e^x + C'],
      correctIndex: 0,
      explanation: 'Using Integration by Parts with u = ln(x) (du = 1/x dx) and dv = dx (v = x): ∫ln(x)dx = u·v - ∫v du = x·ln(x) - ∫x·(1/x)dx = x·ln(x) - x + C.',
      concept: 'Integration by Parts',
    },
    {
      id: 4,
      question: 'In Computer Architecture, which cache mapping technique allows any memory block to be placed in any cache line?',
      options: ['Fully Associative Mapping', 'Direct-Mapped', '2-Way Set Associative', 'Index Hash Inversion'],
      correctIndex: 0,
      explanation: 'Fully associative cache mapping allows any block to reside anywhere in the cache, minimizing conflict misses at the expense of needing parallel tag comparators.',
      concept: 'Memory Hierarchy & Cache Design',
    },
    {
      id: 5,
      question: 'In Object-Oriented Design, what does the "L" in SOLID design principles represent?',
      options: [
        'Liskov Substitution Principle',
        'Linear Interface Segregation',
        'Layered Architecture Standard',
        'Late Binding Polymorphism',
      ],
      correctIndex: 0,
      explanation: 'Liskov Substitution Principle (LSP) states that objects of a superclass should be replaceable with objects of a subclass without altering the correctness of the program.',
      concept: 'Software Architecture & SOLID',
    },
    {
      id: 6,
      question: 'What is the primary role of ATP synthase in cellular respiration?',
      options: [
        'Synthesizing ATP by utilizing the proton gradient across the inner mitochondrial membrane',
        'Splitting glucose directly into pyruvate during glycolysis',
        'Transporting electrons from Cytochrome C to oxygen',
        'Pumping protons against their electrochemical gradient into the matrix',
      ],
      correctIndex: 0,
      explanation: 'ATP synthase acts as a molecular turbine, utilizing the potential energy of the proton gradient created by the electron transport chain to phosphorylate ADP into ATP.',
      concept: 'Cellular Bioenergetics',
    },
    {
      id: 7,
      question: 'Which of the following database isolation levels completely prevents dirty reads, non-repeatable reads, and phantom reads?',
      options: ['Serializable', 'Repeatable Read', 'Read Committed', 'Read Uncommitted'],
      correctIndex: 0,
      explanation: 'Serializable is the highest isolation level in SQL/ACID databases. It ensures transactions behave as if executed sequentially, eliminating dirty, non-repeatable, and phantom reads.',
      concept: 'Database Transactions & ACID',
    },
  ];

  return bank.slice(0, Math.min(count, bank.length));
}

// Helper: Smart Demo Answer for Assistant
function getSmartDemoAnswer(question: string, subject: string, mode: string) {
  const qLower = question.toLowerCase();

  if (qLower.includes('dijkstra') || qLower.includes('shortest path')) {
    if (mode === 'simple') {
      return `### 💡 Dijkstra's Algorithm — Explained Simply
Imagine you are navigating an unfamiliar city with multiple road intersections.
- You start at intersection **A**.
- You look at all direct roads out of A and write down the shortest distance to each neighbor.
- You pick the closest intersection you haven't visited yet, lock it in as solved, and inspect *its* roads.
- If going through that new intersection gives a shorter route to another spot, you update your notes.
- You repeat this until you reach your destination.

**Why it works:** Because all road lengths are positive, once you pick the nearest unexplored intersection, no detour through a farther road could ever make it shorter!`;
    }
    return `### 🗺️ Dijkstra’s Shortest Path Algorithm

#### 1. Core Definition
Dijkstra's algorithm is an optimal graph search algorithm that finds the shortest path between a designated source node and all other nodes in a weighted graph with **non-negative edge weights**.

#### 2. Key Principles & Invariants
- **Greedy Choice Property:** At each iteration, the unvisited vertex with the minimum tentative distance is marked as "visited" (finalized).
- **Relaxation Step:** For an edge $(u, v)$ with weight $w$:
  $$\\text{if } \\text{dist}[u] + w < \\text{dist}[v] \\implies \\text{dist}[v] = \\text{dist}[u] + w$$
- **Data Structure:** Implemented efficiently using a **Min-Heap (Priority Queue)**.

#### 3. Complexity
- **Time Complexity:** $\\mathcal{O}((V + E) \\log V)$ using a binary min-heap.
- **Space Complexity:** $\\mathcal{O}(V)$ to maintain distance arrays and the priority queue.

#### 4. Common Misconceptions
- **Negative weights:** Dijkstra fails if negative edge weights exist (it will get stuck in negative cycles or produce suboptimal paths). In that case, use **Bellman-Ford** or **Johnson’s Algorithm**.

#### 5. Quick Practice Question
> *What happens if you run Dijkstra on a graph containing a directed edge with weight -2?*
> *(Answer: The greedy assumption breaks because a later negative edge can invalidate previously finalized distances.)*`;
  }

  if (qLower.includes('integral') || qLower.includes('calculus') || qLower.includes('derivative')) {
    return `### 📐 Calculus Concept: Integration by Parts

#### 1. Core Formula
Integration by parts is the integration counterpart to the Product Rule of differentiation:
$$\\int u \\, dv = u v - \\int v \\, du$$

#### 2. Strategy: The LIATE Rule for choosing $u$
Select $u$ in this priority order:
1. **L** - Logarithmic functions (e.g., $\\ln x$)
2. **I** - Inverse trigonometric functions (e.g., $\\arctan x$)
3. **A** - Algebraic / polynomial functions (e.g., $x^2, 3x$)
4. **T** - Trigonometric functions (e.g., $\\sin x, \\cos x$)
5. **E** - Exponential functions (e.g., $e^x$)

#### 3. Worked Example: $\\int x e^x dx$
1. Let $u = x \\implies du = dx$
2. Let $dv = e^x dx \\implies v = e^x$
3. Apply formula:
   $$\\int x e^x dx = x e^x - \\int e^x dx = x e^x - e^x + C = e^x(x - 1) + C$$

#### 4. Exam Tip
Double check your result by differentiating $e^x(x - 1) + C$ using product rule:
$$\\frac{d}{dx}[e^x(x - 1)] = e^x(x - 1) + e^x(1) = x e^x \\quad \\checkmark$$`;
  }

  // Generic comprehensive response
  return `### 🎓 Academic Breakdown: ${question}

**Subject Focus:** ${subject}

#### 1. Executive Summary
Understanding **${question}** requires connecting the foundational theoretical principles with practical applications. In academic study, breaking down this topic into component definitions and systematic examples yields the highest retention.

#### 2. Core Concepts & Definitions
- **Foundational Concept:** The underlying mechanism relies on verified principles established in ${subject}.
- **Analytical Framework:** We model the problem by breaking inputs into known variables, identifying constraints, and applying canonical theorems.

#### 3. Intuitive Analogy
Think of this concept like a well-organized library indexing system: instead of searching every shelf randomly, hierarchical categorization allows you to locate exact information in logarithmic time.

#### 4. High-Yield Study Tips
1. **Active Retrieval:** Write down the 3 core principles from memory without looking at notes.
2. **Formula / Rule Synthesis:** Practice 2 variations with edge-case numbers.
3. **Feynman Validation:** Teach the concept out loud in 60 seconds.`;
}

// Dev vs Production Setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyMate AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
