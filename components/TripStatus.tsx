
import React from 'react';
import { WeatherDisplay } from './WeatherDisplay';

interface TripStatusProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}

interface StatusDetail {
  loc: string;
  act: string;
  icon: string;
  details: string[];
  lodging?: string;
  transit?: string;
}

export const TripStatus: React.FC<TripStatusProps> = ({ currentDate, onDateChange, minDate, maxDate }) => {
  const getStatus = (date: Date): StatusDetail => {
    const d = date.getDate();
    const m = date.getMonth(); // 0 = Jan, 1 = Feb

    if (m === 0) { // January
      if (d === 23) return { 
        loc: 'Lima, Peru', 
        act: 'Arrival & Check-in', 
        icon: '✈️', 
        details: [
          'Arrival in Lima (LIM) @ 3:30pm local time (6:30am, 24 Jan, Brisbane time)', 
          'Transfer to lodge office to store main luggage',
          'Check-in at Hampton by Hilton San Isidro'
        ],
        lodging: 'Hampton by Hilton San Isidro',
        transit: 'LA5901 -> LA810 -> LA640'
      };
      if (d === 24) return { 
        loc: 'Lima, Peru', 
        act: 'Exploring the Coast', 
        icon: '🌊', 
        details: ['Walking tour of Miraflores district', 'Historic Centre architectural visit', 'Traditional Ceviche tasting'],
        lodging: 'Hampton by Hilton San Isidro'
      };
      if (d === 25) return { 
        loc: 'Cusco, Peru', 
        act: 'Altitude Acclimatization', 
        icon: '🏔️', 
        details: [
          'Flight to Cusco (LA2238) @ 10:15am local time (1:15am, 26 Jan, Brisbane time)', 
          'Arrive Cusco (CUZ) @ 11:40am local time (2:40am, 26 Jan, Brisbane time)',
          'Mandatory trek briefing @ 5:00pm local time (8:00am, 26 Jan, Brisbane time)'
        ],
        lodging: 'Inkarri Cusco Hotel',
        transit: 'LA2238 (LIM -> CUZ)'
      };
      if (d >= 26 && d <= 28) return { 
        loc: 'Inca Trail', 
        act: 'Hiking to Machu Picchu', 
        icon: '🥾', 
        details: [
          `Day ${d-25} of the Inca Trail (GGXI)`, 
          d === 26 ? 'Pickup from hotel @ 5:15am local time (8:15pm, 26 Jan, Brisbane time)' : '',
          d === 27 ? "Cross Dead Woman's Pass (4200m) @ ~11:00am local time (2:00am, 28 Jan, Brisbane time)" : '',
          d === 28 ? 'Descending through Phuyupatamarca cloud forest' : '',
          'Camping at designated trek sites'
        ].filter(Boolean),
        lodging: 'Trek Camp Sites'
      };
      if (d === 29) return { 
        loc: 'Machu Picchu', 
        act: 'The Grand Finale!', 
        icon: '🏛️', 
        details: [
          'Arrive at Sun Gate @ ~7:30am local time (10:30pm, 29 Jan, Brisbane time)', 
          'Guided tour of the Citadel and Intihuatana', 
          'Return to Cusco via Vistadome Train (Arrive ~7:00pm local time, 10:00am 30 Jan, Brisbane time)'
        ],
        lodging: 'Inkarri Cusco Hotel',
        transit: 'Vistadome Train'
      };
      if (d === 30) return { 
        loc: 'Amazon Jungle', 
        act: 'Wildlife Spotting', 
        icon: '🦜', 
        details: [
          'Flight to Puerto Maldonado @ 11:50am local time (2:50am, 31 Jan, Brisbane time)', 
          'Meet lodge rep at airport (PEM) @ 1:00pm local time (4:00am, 31 Jan, Brisbane time)', 
          'Motorized canoe to Posada Amazonas @ 2:00pm local time (5:00am, 31 Jan, Brisbane time)'
        ],
        lodging: 'Posada Amazonas Lodge',
        transit: 'LA2358 (CUZ -> PEM)'
      };
      if (d === 31) return { 
        loc: 'Amazon Jungle', 
        act: 'River Canoe Expedition', 
        icon: '🛶', 
        details: [
          'Dawn wildlife activities @ 5:30am local time (8:30pm, 31 Jan, Brisbane time)',
          'Tres Chimbadas Oxbow Lake exploration', 
          'Parrot clay lick observation @ 10:30am local time (1:30am, 1 Feb, Brisbane time)'
        ],
        lodging: 'Posada Amazonas Lodge'
      };
    } else if (m === 1) { // February
      if (d === 1) return { 
        loc: 'Amazon Jungle', 
        act: 'Ethnobotanical Walk', 
        icon: '🌿', 
        details: [
          'Early mammal search @ 5:00am local time (8:00pm, 1 Feb, Brisbane time)',
          'Community medicinal garden visit', 
          'Sunset river exploration @ 5:30pm local time (8:30am, 2 Feb, Brisbane time)'
        ],
        lodging: 'Posada Amazonas Lodge'
      };
      if (d === 2) return { 
        loc: 'Buenos Aires, ARG', 
        act: 'Border Crossing', 
        icon: '✈️', 
        details: [
          'Depart lodge @ 7:00am local time (10:00pm, 2 Feb, Brisbane time)', 
          'Flight PEM -> LIM @ 12:45pm local time (3:45am, 3 Feb, Brisbane time)',
          'Flight LIM -> EZE @ 8:25pm local time (11:25am, 3 Feb, Brisbane time)'
        ],
        lodging: 'Up America Plaza',
        transit: 'LA2261 & LA2375'
      };
      if (d === 3) return { 
        loc: 'Buenos Aires', 
        act: 'Tour Welcome Meeting', 
        icon: '🥩', 
        details: [
          'Arrive in Buenos Aires (EZE) @ 2:50am local time (3:50pm, 3 Feb, Brisbane time)', 
          'G Adventures Welcome Meeting @ 6:00pm local time (7:00am, 4 Feb, Brisbane time)',
          'Introductory group dinner in the city'
        ],
        lodging: 'Up America Plaza'
      };
      if (d === 4) return { 
        loc: 'El Chalten', 
        act: 'Arrival in Patagonia', 
        icon: '🏔️', 
        details: [
          'Domestic flight (AEP) @ 9:00am local time (10:00pm, 4 Feb, Brisbane time)', 
          'Arrive El Calafate (FTE) @ 12:00pm local time (1:00am, 5 Feb, Brisbane time)',
          'Bus to El Chalten @ 12:30pm local time (1:30am, 5 Feb, Brisbane time)'
        ],
        lodging: 'El Chalten (G Adventures)',
        transit: 'Domestic Flight & Bus'
      };
      if (d === 5) return { 
        loc: 'El Chalten', 
        act: 'Loma del Pliegue Hike', 
        icon: '🥾', 
        details: [
          'Trek to 1100m elevation',
          '360 degree panoramic views of the massif', 
          'Guanaco and Condor spotting'
        ],
        lodging: 'El Chalten'
      };
      if (d === 6) return { 
        loc: 'El Chalten', 
        act: 'Laguna de los Tres', 
        icon: '🏔️', 
        details: [
          'Signature 25km Fitz Roy hike',
          'Steep final climb @ ~11:00am local time (12:00am, 7 Feb, Brisbane time)',
          'Mount Fitz Roy (3405m) observation'
        ],
        lodging: 'El Chalten'
      };
      if (d === 7) return { 
        loc: 'El Chalten', 
        act: 'Rio de las Vueltas Kayak', 
        icon: '🛶', 
        details: [
          'Kayak activity @ 10:00am local time (11:00pm, 7 Feb, Brisbane time)',
          '12km downstream glacial river paddle',
          'Active recovery session'
        ],
        lodging: 'El Chalten'
      };
      if (d === 8) return { 
        loc: 'El Calafate', 
        act: 'Transit South', 
        icon: '🏙️', 
        details: [
          'Bus to Calafate @ 1:00pm local time (2:00am, 9 Feb, Brisbane time)', 
          'Arrive Calafate @ 4:00pm local time (5:00am, 9 Feb, Brisbane time)',
          'Calafate Berry tasting in town'
        ],
        lodging: 'El Calafate'
      };
      if (d === 9) return { 
        loc: 'Perito Moreno', 
        act: 'Glacier Walkways', 
        icon: '❄️', 
        details: [
          'Depart for Glacier @ 9:00am local time (10:00pm, 9 Feb, Brisbane time)',
          'Pasarelas walkways exploration @ 10:45am local time (11:45pm, 9 Feb, Brisbane time)',
          'Viewing the 70m high ice face'
        ],
        lodging: 'El Calafate'
      };
      if (d === 10) return { 
        loc: 'El Calafate', 
        act: 'Optional Bird Reserve', 
        icon: '🦩', 
        details: ['Laguna Nimez wetland visit', 'Spotting flamingos and black-necked swans', 'Farewell Patagonia dinner'],
        lodging: 'El Calafate'
      };
      if (d === 11) return { 
        loc: 'Buenos Aires', 
        act: 'Return to the Capital', 
        icon: '✈️', 
        details: [
          'Flight to BA @ 10:30am local time (11:30pm, 11 Feb, Brisbane time)', 
          'Arrive Buenos Aires @ 1:30pm local time (2:30am, 12 Feb, Brisbane time)',
          'End of official G Adventures tour'
        ],
        lodging: 'Up America Plaza',
        transit: 'FTE -> AEP (Flight)'
      };
      if (d === 12) return { 
        loc: 'Buenos Aires', 
        act: 'San Telmo & Tango', 
        icon: '💃', 
        details: ['San Telmo Sunday market', 'La Boca colorful streets', 'Evening Tango performance'],
        lodging: 'Up America Plaza'
      };
      if (d === 13) return { 
        loc: 'Buenos Aires', 
        act: 'Departure Transit', 
        icon: '✈️', 
        details: [
          'Final day exploration in Palermo Soho', 
          'Flight to Santiago (LA424) @ 9:05pm local time (10:05am, 14 Feb, Brisbane time)'
        ],
        transit: 'LA424 (AEP -> SCL)'
      };
      if (d === 14) return { 
        loc: 'In Transit', 
        act: 'Over the Pacific', 
        icon: '☁️', 
        details: [
          'Flight Santiago to Sydney (LA809) @ 1:30am local time (2:30pm, 14 Feb, Brisbane time)',
          'Crossing International Date Line (skipping ahead 1 day)'
        ],
        transit: 'LA809 (SCL -> SYD)'
      };
      if (d === 15) return { 
        loc: 'Brisbane, AU', 
        act: 'Welcome Home!', 
        icon: '🏠', 
        details: [
          'Arrive in Sydney @ 6:15am Brisbane time (6:15am, 15 Feb, Brisbane time)', 
          'Flight Sydney to Brisbane (LA4824) @ 9:10am Brisbane time (9:10am, 15 Feb, Brisbane time)', 
          'Final Landing BNE @ 9:40am Brisbane time (9:40am, 15 Feb, Brisbane time)'
        ],
        transit: 'LA4824 (SYD -> BNE)'
      };
    }
    return { 
      loc: 'En Route', 
      act: 'Adventure Awaits', 
      icon: '📍', 
      details: ['Check travel docs for details'] 
    };
  };

  const currentDayOffset = Math.ceil((currentDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const currentDayNumber = currentDayOffset + 1;

  const handlePrevDay = () => {
    if (currentDayOffset > 0) {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      onDateChange(newDate);
    }
  };

  const handleNextDay = () => {
    if (currentDayNumber < totalDays) {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      onDateChange(newDate);
    }
  };

  const status = getStatus(currentDate);
  const isPeru = currentDate.getMonth() === 0;

  return (
    <div className="space-y-6">
      {/* Location Card (Current Status) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Current Status</h3>
        <div className="flex items-start gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl text-3xl shrink-0">
            {status.icon}
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800 leading-tight">{status.loc}</p>
            <p className="text-indigo-600 font-semibold text-sm mt-1">{status.act}</p>
          </div>
        </div>
      </div>

      {/* New Day Navigation Indicator (Moved from Header) */}
      <div className="flex items-center justify-center gap-4 py-2 border-y border-slate-100">
        <button 
          onClick={handlePrevDay}
          disabled={currentDayOffset === 0}
          className={`p-2 rounded-full transition-colors ${currentDayOffset === 0 ? 'text-slate-300' : 'text-red-500 hover:bg-red-50'}`}
          aria-label="Previous Day"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="text-center">
          <span className="text-xl font-black text-slate-800 tracking-tight">Day {currentDayNumber}</span>
          <span className="text-slate-400 text-sm font-bold ml-1">/ {totalDays}</span>
        </div>

        <button 
          onClick={handleNextDay}
          disabled={currentDayNumber === totalDays}
          className={`p-2 rounded-full transition-colors ${currentDayNumber === totalDays ? 'text-slate-300' : 'text-red-500 hover:bg-red-50'}`}
          aria-label="Next Day"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Daily Dossier Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 text-md font-bold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Daily Dossier
        </h3>
        
        <ul className="space-y-3 mb-6">
          {status.details.map((item, i) => {
            const brisbaneRegex = /\(([^)]*Brisbane time[^)]*)\)/;
            const match = item.match(brisbaneRegex);
            
            if (match) {
              const brisbanePart = match[0];
              const parts = item.split(brisbanePart);
              return (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>
                    {parts[0]}
                    <span className="text-indigo-500 italic font-medium">
                      {brisbanePart}
                    </span>
                    {parts.slice(1).join(brisbanePart)}
                  </span>
                </li>
              );
            }
            
            return (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                <span className="text-indigo-400 mt-1">•</span>
                {item}
              </li>
            );
          })}
        </ul>

        <div className="pt-6 border-t border-slate-50 space-y-4">
          {status.lodging && (
            <div className="flex items-start gap-3">
              <span className="text-xl">🏨</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Accomodation</p>
                <p className="text-sm font-semibold text-slate-700">{status.lodging}</p>
              </div>
            </div>
          )}
          
          {status.transit && (
            <div className="flex items-start gap-3">
              <span className="text-xl">💺</span>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Transit</p>
                <p className="text-sm font-semibold text-slate-700">{status.transit}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="text-xl">🕒</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Local Timezone</p>
              <p className="text-sm font-semibold text-slate-700">{isPeru ? 'GMT-5 (Peru)' : 'GMT-3 (Arg)'}</p>
              <p className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                {isPeru ? '15 hours behind Brisbane' : '13 hours behind Brisbane'}
              </p>
            </div>
          </div>

          <WeatherDisplay date={currentDate.toISOString().split('T')[0]} />
        </div>
      </div>

      {/* Travellers Footer */}
      <div className="px-6 py-4 bg-slate-100 rounded-xl flex justify-between items-center text-xs">
        <span className="text-slate-500 font-medium">Tracking:</span>
        <span className="font-bold text-slate-700">Trent & Harry Jordan</span>
      </div>
    </div>
  );
};
