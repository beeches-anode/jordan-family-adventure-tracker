
import React from 'react';
import { NotesList } from './NotesList';
import { NoteForm } from './NoteForm';

interface DayDeepDiveProps {
  currentDate: Date;
}

interface DeepDiveContent {
  title: string;
  summary: string;
  lat: number;
  lng: number;
  localZoom: number;
  sections: {
    heading: string;
    content: string;
    icon: string;
  }[];
  funFact: string;
}

export const DayDeepDive: React.FC<DayDeepDiveProps> = ({ currentDate }) => {
  const getContent = (date: Date): DeepDiveContent => {
    const d = date.getDate();
    const m = date.getMonth(); // 0 = Jan, 1 = Feb

    // January Content
    if (m === 0) {
      if (d === 23) return {
        title: "Day 1: En Route to South America",
        summary: "The adventure begins! Trent and Harry are traveling from Brisbane to Lima today via Sydney and Santiago—a 30+ hour journey across the Pacific and the Andes.",
        lat: -33.946, lng: 151.177, localZoom: 10,
        sections: [
          { heading: "Flight 1: BNE → SYD", content: "LA5901 departs Brisbane at 5:00am, arriving Sydney at 7:35am (1hr 35min). Operated by Qantas on a Boeing 737-800. Domestic terminals.", icon: "✈️" },
          { heading: "Flight 2: SYD → SCL", content: "LA810 departs Sydney at 11:10am from Terminal 1 International, arriving Santiago at 9:50am local (12hr 40min). Boeing 787-9 Dreamliner with lunch and dinner service.", icon: "🌏" },
          { heading: "Flight 3: SCL → LIM", content: "LA640 departs Santiago at 1:40pm from Terminal 2 INTL, arriving Lima at 3:30pm local (3hr 50min). Airbus A320. Final leg to Peru!", icon: "🛬" }
        ],
        funFact: "Today's journey covers over 14,000km—that's more than a third of the way around the Earth in a single day!"
      };
      if (d === 24) return {
        title: "The City of Kings: Lima",
        summary: "Trent and Harry are currently exploring Lima, Peru's vibrant coastal capital. Founded by Spanish conquistador Francisco Pizarro in 1535, it sits dramatically atop cliffs overlooking the Pacific.",
        lat: -12.115, lng: -77.042, localZoom: 13,
        sections: [
          { heading: "Culinary Capital", content: "Lima is the 'Gastronomic Capital of the World.' They'll likely be trying Ceviche—fresh fish cured in citrus juices. It's so important that it has its own national holiday!", icon: "🍋" },
          { heading: "Colonial Grandeur", content: "In the Historic Centre, they'll see the Plaza de Armas. Much of the architecture is Baroque, featuring unique enclosed wooden balconies that were a status symbol in the 1700s.", icon: "🏛️" },
          { heading: "Miraflores", content: "This modern coastal district is famous for 'El Malecón', a clifftop walkway perfect for watching paragliders float over the ocean.", icon: "🌊" }
        ],
        funFact: "Lima is built in a desert! It's the second largest desert city in the world after Cairo, Egypt."
      };
      if (d === 25) return {
        title: "Cusco: The Naval of the World",
        summary: "At 3,400m altitude, Cusco was the heart of the Incan Empire. Today, the boys are resting and attending a mandatory briefing at Casa Intrepid for their upcoming trek @ 5:00pm local (8:00am tomorrow in Brisbane).",
        lat: -13.522, lng: -71.967, localZoom: 14,
        sections: [
          { heading: "Incan Engineering", content: "In Cusco's streets, they'll see massive stones fitted so perfectly that you can't slide a piece of paper between them—all done without mortar.", icon: "🧱" },
          { heading: "The Sacred Leaf", content: "They'll be drinking Coca tea today. In Incan culture, the coca leaf is sacred and helps the body manage the thinner air at this high altitude.", icon: "🍃" }
        ],
        funFact: "Cusco's streets were originally designed in the shape of a Puma—a sacred animal representing the earthly realm in Incan mythology."
      };
      if (d === 26) return {
        title: "Inca Trail Day 1: The First Steps",
        summary: "The trek begins at Km 82. Today is a 12km introduction to the trail as they walk along the Urubamba River through eucalyptus groves and subtropical landscape.",
        lat: -13.228, lng: -72.308, localZoom: 13,
        sections: [
          { heading: "Trail Stats", content: "Distance: 12km | Starting Alt: 2,688m | Ending Alt: 3,100m. A moderate first day to get the rhythm of the trail.", icon: "📈" },
          { heading: "Llactapata Ruins", content: "They will pass the first major Inca site, Llactapata, which was once an important agricultural and rest station for travelers to Machu Picchu.", icon: "🏛️" },
          { heading: "Veronica Peak", content: "The snow-capped Veronica Peak (5,893m) towers over the valley today, providing a stunning backdrop to the first campsite at Wayllabamba.", icon: "🏔️" }
        ],
        funFact: "The Inca Trail was built 500 years ago as a pilgrimage route, and much of the original stone paving is still visible today."
      };
      if (d === 27) return {
        title: "Inca Trail Day 2: The High Pass",
        summary: "This is the most challenging day. The boys are climbing 1,127m to reach the highest point of the entire trek: Dead Woman's Pass.",
        lat: -13.242, lng: -72.485, localZoom: 14,
        sections: [
          { heading: "The Summit", content: "At 4,200m, 'Warmiwanusca' (Dead Woman's Pass) offers spectacular views of the valley. It's a steep 5-hour ascent followed by a descent into the cloud forest.", icon: "🧗" },
          { heading: "Trail Stats", content: "Distance: 12km | Highest Point: 4,200m | Elevation Gain: +1,127m. Today tests their endurance and acclimatization.", icon: "📈" },
          { heading: "Pacaymayo Valley", content: "Tonight's camp is at 3,650m in the Pacaymayo Valley, where they'll recover from the high-altitude climb with a hot meal in their tent.", icon: "⛺" }
        ],
        funFact: "The pass is named 'Dead Woman' because the mountain silhouette from the valley looks like a woman reclining and looking at the sky."
      };
      if (d === 28) return {
        title: "Inca Trail Day 3: Cloud Forests",
        summary: "The longest day in terms of distance (15km), but arguably the most beautiful. They'll cross two more passes and visit multiple dramatic Incan ruins.",
        lat: -13.208, lng: -72.502, localZoom: 13,
        sections: [
          { heading: "Archaeological Marvels", content: "They will explore Sayacmarca ('Inaccessible Town') perched on a cliff, and Phuyupatamarca ('Town Above the Clouds'), often shrouded in mist.", icon: "🗿" },
          { heading: "Trail Stats", content: "Distance: 15km | Highest Point: 3,980m | Descent: -1,350m. Much of today involves walking down original Inca stone steps.", icon: "📈" },
          { heading: "Winay Wayna", content: "Tonight's camp is near the stunning Winay Wayna ruins. The name means 'Forever Young' in Quechua, named after a beautiful orchid that grows here.", icon: "🌸" }
        ],
        funFact: "The Incas used Phuyupatamarca as a sacred water site; the original ritual stone fountains still flow with water today!"
      };
      if (d === 29) return {
        title: "Inca Trail Day 4: Machu Picchu",
        summary: "The final 6km. A 4:00am wake-up call (7:00pm Brisbane) leads them to the Sun Gate for their first view of the 'Lost City of the Incas.'",
        lat: -13.163, lng: -72.545, localZoom: 15,
        sections: [
          { heading: "The Sun Gate", content: "Intipunku (the Sun Gate) was the fortress entrance to Machu Picchu. Arriving here on foot is one of the world's most iconic travel experiences.", icon: "☀️" },
          { heading: "The Citadel", content: "They'll have a guided tour of the main temples, including the Intihuatana stone (astronomical clock) and the Temple of the Condor.", icon: "🏛️" },
          { heading: "Return to Cusco", icon: "🚂", content: "After exploring, they take the scenic Vistadome train back toward Cusco for a well-earned shower (~10:00am tomorrow in Brisbane)." }
        ],
        funFact: "Machu Picchu is so well-built that the stones 'dance' during earthquakes and fall back into place, preventing the walls from collapsing."
      };
      if (d === 30) return {
        title: "Amazon Arrival: Puerto Maldonado",
        summary: "From the high Andes to the humid lowlands. The boys fly to PEM @ 11:50am (2:50am tomorrow in Brisbane) to begin their 3-night Amazonian immersion.",
        lat: -12.593, lng: -69.186, localZoom: 11,
        sections: [
          { heading: "River Journey", content: "They'll travel 2 hours up the Madre de Dios river by motorized canoe to reach their lodge, deep within the Tambopata National Reserve.", icon: "🛶" },
          { heading: "Biodiversity", content: "Tambopata is one of the most biodiverse places on Earth. One single tree here can be home to more species of ants than the entire British Isles!", icon: "🐜" },
          { heading: "The Lodge", content: "Posada Amazonas is a community-owned lodge. It features open-air rooms that allow the sounds and scents of the jungle to drift inside.", icon: "🏠" }
        ],
        funFact: "Puerto Maldonado is known as the 'Biodiversity Capital of Peru' and is the gateway to some of the world's most remote rainforests."
      };
      if (d === 31) return {
        title: "Amazon Day 2: The Giant Otters",
        summary: "A full day of jungle exploration starting at 5:30am local (8:30pm tonight in Brisbane). Highlights include searching for the rare Giant River Otter.",
        lat: -12.8, lng: -69.3, localZoom: 11,
        sections: [
          { heading: "Oxbow Lake", content: "They'll paddle quietly across Tres Chimbadas lake to spot Giant Otters—the world's largest otters, growing up to 1.8m!", icon: "🛶" },
          { heading: "Clay Lick", content: "At dawn, hundreds of colorful macaws and parrots gather at 'clay licks' to eat mineral-rich clay to detoxify their diet.", icon: "🦜" },
          { heading: "Night Walk", content: "Tonight, they might go on a night walk to spot nocturnal creatures like tarantulas and frogs.", icon: "🔦" }
        ],
        funFact: "Giant River Otters are highly social and are often called 'River Wolves' because of their complex family pack structures."
      };
    }

    // February Content
    if (m === 1) {
      if (d === 1) return {
        title: "Amazon Day 3: Jungle Culture",
        summary: "Final full day in the rainforest. Today is about understanding the connection between the forest and the local Ese Eja community.",
        lat: -12.85, lng: -69.25, localZoom: 12,
        sections: [
          { heading: "Medicinal Garden", content: "They'll visit an ethnobotanical center to learn how indigenous people use forest plants for medicine.", icon: "🌿" },
          { heading: "Local Farm", content: "A visit to a traditional Amazonian farm reveals how cacao, coffee, and tropical fruits are grown sustainably.", icon: "🍍" },
          { heading: "Piranha Fishing", content: "They might try their hand at fishing for piranhas in the river—strictly catch-and-release!", icon: "🎣" }
        ],
        funFact: "The Ayahuasca vine, found here, is considered a master teacher plant by Amazonian shamans."
      };
      if (d === 2 || d === 3) return {
        title: "Buenos Aires: The Paris of the South",
        summary: "They've crossed into Argentina! Landing @ 2:50am local (3:50pm today in Brisbane), today is for recovery and meeting the group @ 6:00pm (7:00am tomorrow in Brisbane).",
        lat: -34.603, lng: -58.381, localZoom: 13,
        sections: [
          { heading: "Tango Roots", content: "Tango was born in the late 1800s in the immigrant neighborhoods of BA, particularly La Boca.", icon: "💃" },
          { heading: "Steak & Malbec", content: "Tonight's group dinner will likely feature a world-class Argentine steak paired with a rich Malbec wine.", icon: "🍷" },
          { heading: "San Telmo", content: "This is the oldest neighborhood in the city, known for its cobblestone streets and bohemian atmosphere.", icon: "🏙️" }
        ],
        funFact: "Avenida 9 de Julio in Buenos Aires is the widest avenue in the world, boasting up to 14 lanes of traffic!"
      };
      if (d === 4) return {
        title: "Patagonia Arrival: El Chaltén",
        summary: "A flight south followed by a scenic 3-hour bus ride @ 12:30pm (1:30am tomorrow in Brisbane). The trekking capital of Argentina awaits.",
        lat: -49.333, lng: -72.883, localZoom: 13,
        sections: [
          { heading: "Chaltén Town", content: "Founded only in 1985, El Chaltén is a small village that serves as the gateway to the Fitz Roy massif.", icon: "🏘️" },
          { heading: "The Name", content: "The Tehuelche name for Mount Fitz Roy is 'Chaltén', which means 'Smoking Mountain'.", icon: "☁️" },
          { heading: "Wildlife", content: "During the drive, they'll be on the lookout for guanacos (wild llamas) and soaring condors.", icon: "🦅" }
        ],
        funFact: "El Chaltén is the youngest town in Argentina, established largely to secure the border region with Chile."
      };
      if (d === 5) return {
        title: "Patagonia Hike: Loma del Pliegue Tumbado",
        summary: "The first major Patagonian hike. Today is an 18-20km round trip offering a 360-degree panoramic view of the entire region.",
        lat: -49.34, lng: -72.93, localZoom: 12,
        sections: [
          { heading: "Trail Stats", content: "Distance: 20km | Elevation Gain: 1,100m | Duration: 8-10 hours. A challenging but rewarding climb.", icon: "📈" },
          { heading: "360-Degree Views", content: "This hike summits a ridge providing views of both Fitz Roy and Cerro Torre simultaneously.", icon: "👀" },
          { heading: "Lake Viedma", content: "To the south, they will see the vast turquoise waters of Lake Viedma, fed by the massive Viedma Glacier.", icon: "🌊" }
        ],
        funFact: "The wind at the summit here can be so strong that hikers often have to crouch down to avoid being pushed over!"
      };
      if (d === 6) return {
        title: "The Signature Hike: Laguna de los Tres",
        summary: "The iconic Patagonia experience. A 25km trek taking them to the base of the jagged granite spires of Mount Fitz Roy.",
        lat: -49.27, lng: -72.98, localZoom: 13,
        sections: [
          { heading: "The Killer Section", content: "The final 1km is a steep 400m ascent over loose scree. It's brutal, but the payoff is the most famous view in Patagonia.", icon: "🧗" },
          { heading: "Trail Stats", content: "Distance: 25km | Elevation Gain: 800m+ | Highest Point: 1,200m.", icon: "📈" },
          { heading: "Fitz Roy View", content: "At the summit, Mount Fitz Roy (3,405m) towers directly above the lake.", icon: "🏔️" }
        ],
        funFact: "The skyline of Mount Fitz Roy is the inspiration for the logo of the famous 'Patagonia' clothing brand."
      };
      if (d === 7) return {
        title: "Glacial Kayak: Rio de las Vueltas",
        summary: "An active recovery day. Today the boys trade their boots for paddles as they navigate glacial waters starting this morning (~9:00pm tonight in Brisbane).",
        lat: -49.37, lng: -72.85, localZoom: 12,
        sections: [
          { heading: "The Paddle", content: "A 12km downstream journey through Class I rapids in freezing glacial meltwater.", icon: "🛶" },
          { heading: "Unique Perspective", content: "Kayaking offers a view of the mountains from the water that most hikers never see.", icon: "🏔️" },
          { heading: "Estancia Finish", content: "The journey ends at a traditional Patagonian estancia (ranch).", icon: "🐎" }
        ],
        funFact: "The Rio de las Vueltas is fed by the melting ice of the Fitz Roy massif, making the water incredibly pure—but very cold!"
      };
      if (d === 8) return {
        title: "Heading South: El Calafate",
        summary: "A 3-hour drive @ 1:00pm local (2:00am tomorrow in Brisbane) takes them to El Calafate, gateway to the Southern Ice Field.",
        lat: -50.33, lng: -72.26, localZoom: 13,
        sections: [
          { heading: "Calafate Berry", content: "The town is named after the calafate berry. Local legend says if you eat it, you'll return to Patagonia.", icon: "🫐" },
          { heading: "Avenida Libertador", content: "The main street is filled with handicraft shops and parrillas (steakhouses).", icon: "🥩" },
          { heading: "Lago Argentino", content: "The town sits on the shore of the largest lake in Argentina, filled with 'glacial flour'.", icon: "🌊" }
        ],
        funFact: "El Calafate was originally just a stop for wool traders; today it is one of the most visited destinations in South America."
      };
      if (d === 9) return {
        title: "The Moving Giant: Perito Moreno",
        summary: "One of the few glaciers in the world still advancing. This massive wall of blue ice is a bucket-list experience for today.",
        lat: -50.47, lng: -73.04, localZoom: 12,
        sections: [
          { heading: "The Walkways", content: "They'll explore 5.5km of metal walkways providing views of the 70-meter-high front face.", icon: "🚶" },
          { heading: "Thunderous Calving", content: "Every few minutes, massive chunks of ice break off with a sound like a cannon blast.", icon: "❄️" },
          { heading: "Blue Ice", content: "The ice looks blue because it's so compressed it absorbs all colors except blue.", icon: "💎" }
        ],
        funFact: "The Perito Moreno glacier is larger than the entire city of Buenos Aires."
      };
      if (d === 10) return {
        title: "Patagonia Finale: El Calafate Free Day",
        summary: "A final day for the boys to choose their own adventure. They might go ice trekking or visit the Laguna Nimez bird reserve.",
        lat: -50.32, lng: -72.28, localZoom: 14,
        sections: [
          { heading: "Laguna Nimez", content: "Just outside town, this reserve is home to flamingos and black-necked swans.", icon: "🦩" },
          { heading: "Glaciarium", content: "A world-class ice museum that explains the science of the Patagonian ice fields.", icon: "🧊" },
          { heading: "Estancia Visit", content: "A chance to visit a working ranch, see sheep shearing, and enjoy a traditional barbecue.", icon: "🐑" }
        ],
        funFact: "The Southern Patagonian Ice Field is the third largest expanse of continental ice in the world."
      };
      if (d === 11) return {
        title: "Return to Buenos Aires",
        summary: "The Patagonia portion ends today as the boys fly back to BA @ 10:30am local (11:30pm tonight in Brisbane).",
        lat: -34.558, lng: -58.416, localZoom: 13,
        sections: [
          { heading: "The Long Flight", content: "It's a 2,700km journey from the tip of the continent back to the urban sprawl of Buenos Aires.", icon: "✈️" },
          { heading: "Post-Tour Life", content: "The G Adventures tour ends today. They have 2 more nights in BA to explore.", icon: "🎒" },
          { heading: "Recoleta", content: "They might visit the famous Recoleta Cemetery, where Eva Peron is buried.", icon: "🏛️" }
        ],
        funFact: "Buenos Aires is the birthplace of Pope Francis—you can even take a tour of the neighborhood where he grew up!"
      };
      if (d === 12) return {
        title: "BA Exploration: La Boca & Palermo",
        summary: "Their final full day. A chance to see the colorful streets of La Boca and the trendy avenues of Palermo.",
        lat: -34.634, lng: -58.363, localZoom: 14,
        sections: [
          { heading: "El Caminito", content: "They'll visit the most colorful street in the world, filled with street tango dancers.", icon: "🎨" },
          { heading: "La Bombonera", content: "They'll walk past the legendary stadium of the Boca Juniors football club.", icon: "⚽" },
          { heading: "Palermo Soho", content: "A trendy hub of fashion and world-class cafes—perfect for some final souvenir shopping.", icon: "🛍️" }
        ],
        funFact: "La Boca's colorful houses were originally painted with leftover paint from the shipyard nearby."
      };
      if (d === 13) return {
        title: "South America Farewell",
        summary: "The final day in South America. Flight to Santiago @ 9:05pm local (10:05am tomorrow in Brisbane).",
        lat: -34.558, lng: -58.416, localZoom: 14,
        sections: [
          { heading: "Packing Up", content: "Organizing the gear that's seen 23 days of travel across mountains and jungles.", icon: "📦" },
          { heading: "Final Malbec", content: "One last toast to a successful adventure before the long journey home.", icon: "🍷" },
          { heading: "The Crossing", content: "The first leg is a short hop over the Andes to Chile, preparing for the 14-hour flight.", icon: "✈️" }
        ],
        funFact: "The flight from Buenos Aires to Santiago crosses directly over Aconcagua, the highest mountain in the West."
      };
      if (d === 14) return {
        title: "Crossing the Date Line",
        summary: "High above the Pacific. Crossing the Date Line westward today @ 1:30am local from SCL (4:30pm today in Brisbane).",
        lat: -30, lng: -140, localZoom: 2,
        sections: [
          { heading: "In the Air", content: "A 14-hour journey from Santiago to Sydney.", icon: "☁️" },
          { heading: "Time Travel", content: "By crossing the Date Line, they skip ahead a full day, landing on Sunday morning.", icon: "⏳" }
        ],
        funFact: "Because they cross the date line, this will be the shortest Valentine's Day of their lives!"
      };
      if (d === 15) return {
        title: "Welcome Home to Brisbane!",
        summary: "After 23 days, Trent and Harry are back in Queensland. Arrival @ BNE 9:40am Brisbane time.",
        lat: -27.470, lng: 153.026, localZoom: 12,
        sections: [
          { heading: "Final Arrival", content: "Touchdown at 9:40am on Sunday. From the Amazon to the Brisbane River!", icon: "🏠" },
          { heading: "The Total Stats", content: "Estimated: 150km+ walked, 4,200m peak elevation, 25,000km+ flown.", icon: "📊" }
        ],
        funFact: "The boys traveled enough distance to have circled the globe more than halfway!"
      };
    }

    // Default Fallback
    return {
      title: "Adventure in Progress",
      summary: "Tracking the journey through South America.",
      lat: -15, lng: -60, localZoom: 3,
      sections: [{ heading: "Transit", content: "Moving between locations.", icon: "📍" }],
      funFact: "The Amazon River is so long that it has no bridges across it."
    };
  };

  const content = getContent(currentDate);

  // Format date for notes (ISO format: "2026-01-25")
  const dateStr = currentDate.toISOString().split('T')[0];

  // Map URLs
  const continentalMapUrl = `https://maps.google.com/maps?q=${content.lat},${content.lng}&z=3&t=m&output=embed`;
  const localMapUrl = `https://maps.google.com/maps?q=${content.lat},${content.lng}&z=${content.localZoom}&t=k&output=embed`;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-indigo-900 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-3 font-serif italic tracking-tight">{content.title}</h2>
          <p className="text-indigo-100/90 leading-relaxed text-lg max-w-2xl">{content.summary}</p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {content.sections.map((section, idx) => (
          <div key={idx} className="space-y-3 group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-indigo-100 group-hover:scale-110 transition-transform duration-300">
              {section.icon}
            </div>
            <h4 className="text-indigo-900 font-bold uppercase tracking-wider text-xs">{section.heading}</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Continental Context</h5>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">Zoom 3x</span>
            </div>
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
               <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                loading="lazy" 
                allowFullScreen 
                src={continentalMapUrl}>
              </iframe>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local Explorer</h5>
              <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Satellite</span>
            </div>
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
              <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                loading="lazy" 
                allowFullScreen 
                src={localMapUrl}>
              </iframe>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 m-8 mt-0 p-6 rounded-2xl border border-amber-100 flex items-start gap-4">
        <div className="text-3xl">💡</div>
        <div>
          <h5 className="font-bold text-amber-900 text-sm mb-1 uppercase tracking-tight">Did you know?</h5>
          <p className="text-amber-800/80 text-sm italic font-medium leading-snug">"{content.funFact}"</p>
        </div>
      </div>

      {/* Journal Notes Section */}
      <div className="px-8 pb-8 space-y-6">
        <NotesList date={dateStr} />
        <NoteForm date={dateStr} location={content.title} />
      </div>
    </div>
  );
};
