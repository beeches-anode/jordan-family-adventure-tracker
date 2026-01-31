
import React, { useState } from 'react';
import { TripStatus } from './components/TripStatus';
import { DayDeepDive } from './components/DayDeepDive';
import { DateSimulator } from './components/DateSimulator';
import { JournalView } from './components/JournalView';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import { SyncStatusBar } from './components/SyncStatusBar';
import { NotesProvider } from './context/NotesContext';
import { WeatherProvider } from './context/WeatherContext';
import { TRIP_START_DATE, TRIP_END_DATE } from './constants';

const App: React.FC = () => {
  const [simulatedDate, setSimulatedDate] = useState<Date>(() => {
    return new Date(TRIP_START_DATE);
  });
  const [showJournal, setShowJournal] = useState(false);

  return (
    <NotesProvider>
    <WeatherProvider currentDate={simulatedDate}>
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-indigo-800 text-white py-4 sm:py-6 px-4 shadow-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Jordan Family Adventure</h1>
              <p className="text-indigo-200 text-sm font-medium">Tracking Trent & Harry's Journey across South America</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <SyncStatusBar />
            <button
              onClick={() => setShowJournal(true)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="hidden sm:inline">Journal</span>
            </button>
            <div className="w-full sm:w-auto">
              <DateSimulator
                currentDate={simulatedDate}
                onDateChange={setSimulatedDate}
                minDate={TRIP_START_DATE}
                maxDate={TRIP_END_DATE}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Status & High-Level Itinerary */}
        <div className="lg:col-span-1 space-y-6">
          <TripStatus 
            currentDate={simulatedDate} 
            onDateChange={setSimulatedDate}
            minDate={TRIP_START_DATE}
            maxDate={TRIP_END_DATE}
          />
        </div>

        {/* Deep Dive Content Area */}
        <div className="lg:col-span-2">
          <DayDeepDive currentDate={simulatedDate} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
        <p className="mb-2">Exploring Peru & Argentina • January 23 - February 15, 2026</p>
        <p className="font-semibold text-slate-500 italic">"Adventures are the best way to learn."</p>
      </footer>

      {/* Journal Modal */}
      {showJournal && (
        <JournalView
          onClose={() => setShowJournal(false)}
          onNavigateToDate={setSimulatedDate}
        />
      )}

      {/* PWA Update Notification */}
      <PWAUpdatePrompt />
    </div>
    </WeatherProvider>
    </NotesProvider>
  );
};

export default App;
