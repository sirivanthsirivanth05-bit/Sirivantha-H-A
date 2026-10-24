import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  Award,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { QuizQuestion, QuizResult } from '../types';
import { getGradeLetter } from '../utils/formatters';

export const QuizView: React.FC = () => {
  const { profile, quizHistory, saveQuizResult, aiStatus } = useStudy();

  // Quiz state machine: 'config' | 'active' | 'results' | 'history'
  const [quizState, setQuizState] = useState<'config' | 'active' | 'results' | 'history'>('config');

  // Configuration options
  const [selectedSubject, setSelectedSubject] = useState<string>(
    profile.subjects[0]?.name || 'Data Structures & Algorithms'
  );
  const [topicFocus, setTopicFocus] = useState<string>('Graph Algorithms & Tree Traversal');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Active quiz playing states
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [activeQuizResult, setActiveQuizResult] = useState<QuizResult | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && quizState === 'active') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, quizState]);

  // Launch Quiz from server
  const handleStartQuiz = async (useAi: boolean) => {
    setIsLoadingQuiz(true);
    setQuizError(null);

    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          topic: topicFocus,
          count: questionCount,
          difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve quiz questions.');
      }

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions generated. Please try another topic.');
      }

      setQuestions(data.questions);
      setUserAnswers(new Array(data.questions.length).fill(-1));
      setCurrentQuestionIndex(0);
      setElapsedSeconds(0);
      setIsTimerActive(true);
      setQuizState('active');
    } catch (err: any) {
      setQuizError(err?.message || 'Error generating quiz.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Select an option for current question
  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = optionIndex;
      return updated;
    });
  };

  // Submit quiz and calculate grade
  const handleSubmitQuiz = () => {
    setIsTimerActive(false);

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    const result: QuizResult = {
      id: 'quiz-' + Date.now(),
      subject: selectedSubject,
      topic: topicFocus,
      difficulty,
      score: correctCount,
      total: questions.length,
      percentage,
      timeSpentSeconds: elapsedSeconds,
      date: new Date().toISOString(),
      questions,
      userAnswers,
    };

    setActiveQuizResult(result);
    saveQuizResult(result);
    setQuizState('results');

    // Trigger celebratory confetti if score >= 80%
    if (percentage >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0D9488', '#2563EB', '#F59E0B', '#10B981'],
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Practice Quiz System</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
              Formative Self-Testing
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Adaptive multiple-choice exams with detailed justifications, concept tags, and historical performance tracking
          </p>
        </div>

        <div className="flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs self-start sm:self-center">
          <button
            onClick={() => setQuizState('config')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              quizState === 'config' || quizState === 'active' || quizState === 'results'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quiz Assessment
          </button>
          <button
            onClick={() => setQuizState('history')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              quizState === 'history'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History & Grades ({quizHistory.length})
          </button>
        </div>
      </div>

      {/* STATE 1: Configuration Form */}
      {quizState === 'config' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configure Practice Assessment</h2>
              <p className="text-xs text-slate-500">
                Select your academic domain, difficulty pacing, and topic scope
              </p>
            </div>
          </div>

          {quizError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {quizError}
            </div>
          )}

          <div className="space-y-4 text-xs">
            {/* Subject selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Academic Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-teal-500"
              >
                {profile.subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.code || 'Core'})
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Target Subtopic or Concept</label>
              <input
                type="text"
                value={topicFocus}
                onChange={(e) => setTopicFocus(e.target.value)}
                placeholder="e.g. Dijkstra vs Bellman-Ford, Double Integrals in Polar Coordinates"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Difficulty & Count */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Difficulty Pacing</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-1.5 rounded-lg font-semibold border text-center transition ${
                        difficulty === diff
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Question Count</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`py-1.5 rounded-lg font-semibold border text-center transition ${
                        questionCount === num
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleStartQuiz(true)}
                disabled={isLoadingQuiz}
                className="flex-1 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoadingQuiz ? 'Generating Questions...' : 'Start Practice Assessment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: Active Quiz Gameplay */}
      {quizState === 'active' && questions.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Header bar: Progress + Timer */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <p className="text-[11px] text-slate-400">{selectedSubject}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>{formatTimer(elapsedSeconds)}</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to exit? Your progress on this quiz will be lost.')) {
                    setQuizState('config');
                  }
                }}
                className="text-slate-400 hover:text-slate-600 font-medium"
              >
                Quit
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%`,
              }}
            />
          </div>

          {/* Current Question Card */}
          {(() => {
            const currentQ = questions[currentQuestionIndex];
            const currentAnswer = userAnswers[currentQuestionIndex];

            return (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
                <div className="space-y-2">
                  {currentQ.concept && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {currentQ.concept}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                {/* Multiple choice options */}
                <div className="space-y-2.5">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = currentAnswer === optIdx;
                    const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`w-full p-3.5 rounded-lg border text-left text-xs font-medium flex items-center gap-3 transition ${
                          isSelected
                            ? 'bg-teal-50/70 border-teal-500 text-teal-950 font-semibold shadow-xs ring-1 ring-teal-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {questions.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        onClick={() => setCurrentQuestionIndex(dotIdx)}
                        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition ${
                          currentQuestionIndex === dotIdx
                            ? 'bg-teal-600 ring-2 ring-teal-200'
                            : userAnswers[dotIdx] !== -1
                            ? 'bg-slate-400'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={userAnswers.includes(-1)}
                      className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 shadow-xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Submit Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* STATE 3: Quiz Results & Formative Explanations */}
      {quizState === 'results' && activeQuizResult && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Summary Score Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-teal-50 text-teal-600">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span
                className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase border ${
                  getGradeLetter(activeQuizResult.percentage).color
                }`}
              >
                Grade: {getGradeLetter(activeQuizResult.percentage).letter}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                {activeQuizResult.percentage}% Score
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You correctly answered{' '}
                <span className="font-bold text-slate-800">
                  {activeQuizResult.score} of {activeQuizResult.total}
                </span>{' '}
                questions in {formatTimer(activeQuizResult.timeSpentSeconds)}.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => setQuizState('config')}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Take Another Quiz</span>
              </button>
              <button
                onClick={() => setQuizState('history')}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              >
                <span>View All Past Quizzes</span>
              </button>
            </div>
          </div>

          {/* Detailed Question-by-Question Review with Explanations */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Formative Question Review & Explanations</h3>

            {activeQuizResult.questions.map((q, idx) => {
              const userChoice = activeQuizResult.userAnswers[idx];
              const isCorrect = userChoice === q.correctIndex;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border shadow-xs space-y-3 ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-400">Question {idx + 1}</span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{q.question}</h4>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  {/* Options list */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isUserSelection = userChoice === oIdx;
                      const isCorrectChoice = q.correctIndex === oIdx;

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            isCorrectChoice
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                              : isUserSelection && !isCorrect
                              ? 'bg-rose-50 border-rose-300 text-rose-950 line-through'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrectChoice && (
                            <span className="text-[10px] text-emerald-700 font-bold">✓ Correct Answer</span>
                          )}
                          {isUserSelection && !isCorrect && (
                            <span className="text-[10px] text-rose-700 font-bold">Your Choice</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Card */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                      Academic Explanation:
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STATE 4: Past Quiz History Log */}
      {quizState === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Quiz History & Mastery Records</h3>
              <p className="text-xs text-slate-500">Track accuracy trends across all academic subjects</p>
            </div>

            <button
              onClick={() => setQuizState('config')}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {quizHistory.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No quiz attempts recorded yet.
              </div>
            ) : (
              quizHistory.map((q) => {
                const grade = getGradeLetter(q.percentage);

                return (
                  <div key={q.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{q.subject}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-xs text-slate-600">{q.topic}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Difficulty: {q.difficulty}</span>
                        <span>•</span>
                        <span>{new Date(q.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Time: {formatTimer(q.timeSpentSeconds)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-base font-extrabold text-slate-900">{q.percentage}%</span>
                        <p className="text-[10px] text-slate-400">
                          {q.score}/{q.total} correct
                        </p>
                      </div>

                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold border ${grade.color}`}
                      >
                        {grade.letter}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
