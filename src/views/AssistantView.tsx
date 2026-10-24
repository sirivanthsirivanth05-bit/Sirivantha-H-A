import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Bookmark,
  Cpu,
  Layers,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { MarkdownView } from '../components/MarkdownView';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  subject?: string;
  mode?: string;
  timestamp: string;
  source?: string;
  isDemo?: boolean;
}

export const AssistantView: React.FC = () => {
  const { profile, aiStatus, isFocusMode, toggleFocusMode } = useStudy();

  const [question, setQuestion] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(profile.subjects[0]?.name || 'Computer Science');
  const [activeMode, setActiveMode] = useState<'detailed' | 'simple' | 'practice' | 'steps'>('detailed');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pre-seeded academic conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      content: `### 👋 Welcome to your StudyMate AI Tutor!
I am your personal smart learning assistant. I can help you:
- **Break down complex concepts** from Computer Science, Mathematics, Physics, Biology, and more.
- **Simplify dense topics** with everyday analogies and plain-language explanations.
- **Solve problems step-by-step** with mathematical formulas and clear justifications.
- **Generate self-testing practice questions** to reinforce your active recall.

Ask any academic question or pick one of the sample prompt chips below to get started!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: aiStatus.isConfigured ? 'Gemini 3.8 Flash' : 'StudyMate Smart Engine',
      isDemo: !aiStatus.isConfigured,
    },
  ]);

  const promptSuggestions = [
    { title: "Dijkstra's Shortest Path", subject: 'Data Structures & Algorithms', mode: 'simple' as const },
    { title: "Integration by Parts: ∫ x·e^x dx", subject: 'Calculus III & Linear Algebra', mode: 'steps' as const },
    { title: 'Virtual Memory & TLB Paging', subject: 'Operating Systems Architecture', mode: 'detailed' as const },
    { title: 'Photosynthesis Light vs Dark Reactions', subject: 'General Academics', mode: 'practice' as const },
  ];

  const handleSend = async (customPrompt?: string, customMode?: any, customSubj?: string) => {
    const qToSend = (customPrompt || question).trim();
    if (!qToSend || isLoading) return;

    const modeToSend = customMode || activeMode;
    const subjToSend = customSubj || selectedSubject;

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      content: qToSend,
      subject: subjToSend,
      mode: modeToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qToSend,
          subject: subjToSend,
          mode: modeToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer from AI tutor.');
      }

      const data = await response.json();
      const botMessage: Message = {
        id: 'msg-' + Date.now() + '-bot',
        sender: 'assistant',
        content: data.answer || 'No response generated.',
        subject: subjToSend,
        mode: modeToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        isDemo: data.isDemo,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: 'msg-' + Date.now() + '-err',
        sender: 'assistant',
        content: `### ⚠️ Connection Notice\nUnable to reach server. Please ensure the local dev server is running. (${err.message})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Error Fallback',
        isDemo: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Title & Engine Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Learning Assistant</h1>
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold border flex items-center gap-1 ${
                aiStatus.isConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <Cpu className="w-3 h-3" />
              {aiStatus.isConfigured ? 'Gemini 3.8 Flash' : 'Demo Mode (Offline Smart Engine)'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Interactive academic tutoring with concept simplification, step-by-step math solver, and practice generation
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {!isFocusMode && (
            <button
              onClick={toggleFocusMode}
              className="px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Enter distraction-free study space (hides sidebar & footer)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Focus Reading</span>
            </button>
          )}

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'm-welcome',
                  sender: 'assistant',
                  content: 'Chat history cleared. What topic or concept would you like to review next?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  source: 'StudyMate Engine',
                },
              ])
            }
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Mode Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">Tutor Strategy:</span>

            <button
              onClick={() => setActiveMode('detailed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                activeMode === 'detailed'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Comprehensive Breakdown
            </button>

            <button
              onClick={() => setActiveMode('simple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                activeMode === 'simple'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              💡 Explain Simply (ELI15)
            </button>

            <button
              onClick={() => setActiveMode('steps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                activeMode === 'steps'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🔢 Step-by-Step Solver
            </button>

            <button
              onClick={() => setActiveMode('practice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                activeMode === 'practice'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🎯 Generate Practice Check
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white text-slate-800"
            >
              {profile.subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="General Academics">General Academics</option>
            </select>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Try asking:</span>
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.title, item.mode, item.subject)}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 text-slate-700 text-[11px] whitespace-nowrap transition"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto`}
            >
              {/* Header meta */}
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-600">{isUser ? 'You' : 'StudyMate AI'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.subject && (
                  <>
                    <span>•</span>
                    <span className="text-teal-700 font-medium">{msg.subject}</span>
                  </>
                )}
                {msg.source && (
                  <>
                    <span>•</span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                        msg.isDemo
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {msg.source}
                    </span>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-5 rounded-2xl shadow-xs border ${
                  isUser
                    ? 'bg-slate-900 text-white border-slate-800 rounded-tr-xs'
                    : 'bg-white text-slate-800 border-slate-200 rounded-tl-xs w-full'
                }`}
              >
                {isUser ? (
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    <MarkdownView content={msg.content} />

                    {/* Action Bar for Assistant Messages */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-teal-600" />
                              <span className="text-teal-600 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Response</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSend(`Can you simplify the previous explanation: "${msg.content.slice(0, 100)}..." in even simpler terms with a fun analogy?`, 'simple')}
                          className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition"
                        >
                          <span>💡 Simplify Further</span>
                        </button>

                        <button
                          onClick={() => handleSend(`Generate 3 practice multiple choice questions based on: "${msg.content.slice(0, 100)}..."`, 'practice')}
                          className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1 transition"
                        >
                          <span>🎯 Quiz Me on This</span>
                        </button>
                      </div>

                      {msg.isDemo && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Demo Mode Active
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs text-slate-600">
                StudyMate AI is synthesizing explanation and verifying academic references...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form Fixed / Bottom */}
      <div className="sticky bottom-4 max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="bg-white rounded-2xl shadow-lg border border-slate-300 p-2 sm:p-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500"
        >
          <div className="p-2 text-teal-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask any concept question, code explanation, or math problem (e.g. How does Quicksort partitioning work?)..."
            className="flex-1 text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 disabled:hover:bg-teal-600 shrink-0"
          >
            <span>Ask Tutor</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
