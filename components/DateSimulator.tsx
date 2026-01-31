
import React from 'react';

interface DateSimulatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}

export const DateSimulator: React.FC<DateSimulatorProps> = ({ 
  currentDate, 
  onDateChange, 
  minDate, 
  maxDate 
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    const newDate = new Date(minDate);
    newDate.setDate(minDate.getDate() + val);
    onDateChange(newDate);
  };

  const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const totalDaysDiff = Math.round((stripTime(maxDate).getTime() - stripTime(minDate).getTime()) / (1000 * 60 * 60 * 24));
  const currentDayOffset = Math.round((stripTime(currentDate).getTime() - stripTime(minDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white/10 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl flex items-center gap-3 sm:gap-6 border border-white/10 shadow-inner group">
      <div className="flex items-center gap-3 sm:gap-6 border-r border-white/20 pr-3 sm:pr-6">
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold tracking-tighter text-indigo-300">Local Date</p>
          <p className="font-bold text-white whitespace-nowrap tabular-nums">{formatDate(currentDate)}</p>
        </div>
      </div>
      
      <div className="flex-1 min-w-[160px] flex flex-col justify-center relative pt-4">
        {/* Instructional Tooltip */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-indigo-400 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
            <span>↔️</span> Slide to explore the trip
          </span>
        </div>

        {/* The Slider */}
        <input 
          type="range" 
          min="0" 
          max={totalDaysDiff} 
          value={currentDayOffset} 
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-indigo-900/40 rounded-lg appearance-none cursor-pointer accent-white hover:accent-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          aria-label="Simulate Trip Date"
        />
        
        {/* Visual Cue Labels */}
        <div className="flex justify-between w-full mt-1 px-0.5">
          <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Start</span>
          <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">End</span>
        </div>
      </div>
    </div>
  );
};
