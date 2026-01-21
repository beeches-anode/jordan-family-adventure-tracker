
import React, { useState } from 'react';
import { TripStatus } from './components/TripStatus';
import { DayDeepDive } from './components/DayDeepDive';
import { DateSimulator } from './components/DateSimulator';
import { TRIP_START_DATE, TRIP_END_DATE } from './constants';

const App: React.FC = () => {
  const [simulatedDate, setSimulatedDate] = useState<Date>(() => {
    return new Date(TRIP_START_DATE);
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-indigo-800 text-white py-6 px-4 shadow-xl sticky top-0 z-50">
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
          
          <DateSimulator 
            currentDate={simulatedDate} 
            onDateChange={setSimulatedDate} 
            minDate={TRIP_START_DATE} 
            maxDate={TRIP_END_DATE}
          />
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
    </div>
  );
};

export default App;
