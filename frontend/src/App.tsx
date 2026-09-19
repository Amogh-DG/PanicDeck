import React from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ErrorAlert } from './components/ErrorAlert';

import { LandingView } from './views/LandingView';
import { LoginView } from './views/LoginView';
import { OverviewView } from './views/OverviewView';
import { NotesView } from './views/NotesView';
import { QuizzesView } from './views/QuizzesView';
import { WeakTopicsView } from './views/WeakTopicsView';
import { CoverageView } from './views/CoverageView';
import { PastPapersView } from './views/PastPapersView';

const MainApp: React.FC = () => {
  const { currentView, isLoggedIn } = useStudy();

  if (!isLoggedIn) {
    if (currentView === 'landing') {
      return (
        <>
          <LandingView />
          <LoadingOverlay />
          <ErrorAlert />
        </>
      );
    }
    return (
      <>
        <LoginView />
        <LoadingOverlay />
        <ErrorAlert />
      </>
    );
  }

  if (currentView === 'landing') {
    return (
      <>
        <LandingView />
        <LoadingOverlay />
        <ErrorAlert />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col transition-colors duration-200">
      <Sidebar />
      <Header />

      <div className="md:pl-64 flex-1 flex flex-col w-full min-w-0">
        <main className="w-full max-w-5xl lg:max-w-6xl mx-auto pt-20 pb-20 md:pb-12 px-4 sm:px-6 md:px-8 flex-1 box-border">
          {currentView === 'overview' && <OverviewView />}
          {currentView === 'notes' && <NotesView />}
          {currentView === 'quizzes' && <QuizzesView />}
          {currentView === 'weak_topics' && <WeakTopicsView />}
          {currentView === 'coverage' && <CoverageView />}
          {currentView === 'past_papers' && <PastPapersView />}
        </main>
      </div>

      <BottomNav />
      <LoadingOverlay />
      <ErrorAlert />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StudyProvider>
      <MainApp />
    </StudyProvider>
  );
};

export default App;
