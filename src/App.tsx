/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudyProvider } from './context/StudyContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PresentationModal } from './components/PresentationModal';
import { StreakCelebrationModal } from './components/StreakCelebrationModal';
import { FocusModeToolbar } from './components/FocusModeToolbar';
import { useStudy } from './context/StudyContext';

import { DashboardView } from './views/DashboardView';
import { PlannerView } from './views/PlannerView';
import { AssistantView } from './views/AssistantView';
import { QuizView } from './views/QuizView';
import { ResourcesView } from './views/ResourcesView';
import { ProgressView } from './views/ProgressView';
import { ProfileView } from './views/ProfileView';
import { LandingView } from './views/LandingView';

function AppContent() {
  const { isFocusMode, activeMilestoneCelebration, activeStreak, closeMilestoneCelebration } = useStudy();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div
      className={`min-h-screen text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-500 selection:text-white transition-colors duration-300 ${
        isFocusMode ? 'bg-slate-900/5' : 'bg-slate-50'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenPresentationGuide={() => setIsPresentationOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div
        className={`flex-1 flex w-full mx-auto transition-all duration-300 ${
          isFocusMode ? 'max-w-5xl justify-center px-4 sm:px-6' : 'max-w-7xl'
        }`}
      >
        {/* Responsive Sidebar - Hidden in Focus Mode for distraction-free study */}
        {!isFocusMode && (
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 min-w-0 transition-all duration-300 ${
            isFocusMode ? 'py-4 sm:py-6 w-full' : 'p-4 sm:p-6 lg:p-8 overflow-y-auto'
          }`}
        >
          {/* Floating distraction-free Focus Mode HUD bar */}
          {isFocusMode && (
            <FocusModeToolbar currentView={currentView} onNavigate={setCurrentView} />
          )}

          {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} />}
          {currentView === 'planner' && <PlannerView />}
          {currentView === 'assistant' && <AssistantView />}
          {currentView === 'quizzes' && <QuizView />}
          {currentView === 'resources' && <ResourcesView />}
          {currentView === 'progress' && <ProgressView />}
          {currentView === 'profile' && <ProfileView />}
          {currentView === 'landing' && (
            <LandingView
              onNavigate={setCurrentView}
              onOpenPresentationGuide={() => setIsPresentationOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Footer - Hidden in Focus Mode for distraction-free study */}
      {!isFocusMode && (
        <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">StudyMate AI</span>
              <span>—</span>
              <span>Your Personal Smart Learning Assistant</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <button
                onClick={() => setCurrentView('landing')}
                className="hover:text-teal-700 transition"
              >
                About & Pedagogy
              </button>
              <button
                onClick={() => setIsPresentationOpen(true)}
                className="hover:text-teal-700 transition font-medium"
              >
                Professor Evaluation Guide
              </button>
              <span>v1.0.0</span>
            </div>
          </div>
        </footer>
      )}

      {/* Professor Demo Guide Modal */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        onNavigate={setCurrentView}
      />

      {/* Motivational Milestone Celebration Modal */}
      <StreakCelebrationModal
        milestone={activeMilestoneCelebration}
        currentStreak={activeStreak}
        onClose={closeMilestoneCelebration}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}
