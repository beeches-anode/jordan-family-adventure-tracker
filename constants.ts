
// Use component constructor (local midnight) instead of ISO string (UTC midnight)
// to avoid timezone bugs where getDate() and toISOString() disagree
export const TRIP_START_DATE = new Date(2026, 0, 23);
export const TRIP_END_DATE = new Date(2026, 1, 15);

/** Parses a "YYYY-MM-DD" string as local midnight (not UTC).
 *  This is the inverse of toLocalDateString and avoids the timezone bug where
 *  new Date("2026-01-31") creates UTC midnight, which shifts to the previous
 *  day in timezones west of UTC. */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Formats a Date as "YYYY-MM-DD" using local time (not UTC). */
export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const KNOWLEDGE_BASE = `
# Jordan Family South America Trip 2026 - Master Travel Documents
Travellers: Trent Jordan & Harry Jordan
Booking ID: 7839815 | PNR: IVUWEP / MKYUUT

## Complete Flight Schedule (ALL DETAILS)
- **Jan 23: Brisbane to Lima Transit**
  * LA5901: BNE (5:00am) -> SYD (7:35am) [1h 35m] Boeing 737-800, operated by Qantas
  * LA810: SYD (11:10am) -> SCL (9:50am) [12h 40m] Boeing 787-9, Terminal 1 Intl -> Terminal 2 Intl
  * LA640: SCL (1:40pm) -> LIM (3:30pm) [3h 50m] Airbus A320, Terminal 2 Intl
  * Arrival in Lima: 3:30pm. Stay: Hampton by Hilton San Isidro.

- **Jan 25: Lima to Cusco**
  * LA2238: LIM (10:15am) -> CUZ (11:40am) [1h 25m]
  * Arrival in Cusco: 11:40am. Acclimatization at Inkarri Cusco Hotel.

- **Jan 29: Machu Picchu to Cusco**
  * Vistadome Train: Departs Aguas Calientes afternoon -> Ollantaytambo -> Van to Cusco.
  * Arrival in Cusco: ~7:00pm. Stay: Inkarri Cusco Hotel.

- **Jan 30: Cusco to Amazon**
  * LA2358: CUZ (11:50am) -> PEM (12:55pm) [1h 5m]
  * Arrival in Puerto Maldonado: 12:55pm. Meet lodge rep at airport by 1:00pm.

- **Feb 2: Amazon to Buenos Aires**
  * LA2261: PEM (12:45pm) -> LIM (2:20pm) [1h 35m]
  * 6-hour layover in Lima.
  * LA2375: LIM (8:25pm) -> EZE (2:50am+1) [4h 25m]
  * Arrival in Buenos Aires: Feb 3rd @ 2:50am. Stay: Up America Plaza.

- **Feb 4: Buenos Aires to Patagonia**
  * Flight (Domestic AEP): ~9:00am -> El Calafate (FTE) [~3h]
  * Arrival in El Calafate: ~12:00pm.
  * Bus: El Calafate (12:30pm) -> El Chalten (3:30pm). Stay: El Chalten.

- **Feb 7: El Chalten to El Calafate**
  * Transfer: El Chalten -> El Calafate (~3h). Stay: Posta Sur, El Calafate.

- **Feb 10: El Calafate to Buenos Aires**
  * Flight: El Calafate (FTE) -> Buenos Aires (AEP/EZE) [~3h]
  * Arrival in Buenos Aires: afternoon. Stay: Up America Plaza.

- **Feb 13: Buenos Aires to Santiago (Return Leg)**
  * LA424: AEP (9:05pm) -> SCL (11:18pm/11:21pm) [~2h 15m]
  * Arrival in Santiago: 11:18pm.

- **Feb 14: Santiago to Sydney**
  * LA809: SCL (1:30am) -> SYD (6:15am+1) [14h 45m]
  * Crosses International Date Line.

- **Feb 15: Sydney to Brisbane (Final Leg)**
  * LA4824: SYD (9:10am) -> BNE (9:40am) [1h 30m]
  * **Final Arrival in Brisbane: 9:40am on Sunday, 15 February 2026.**

## Detailed Itinerary Highlights

[PERU]
- Jan 23-25: Lima (Miraflores, Historic Centre).
- Jan 25: Mandatory 5pm briefing at Casa Intrepid, Cusco.
- Jan 26-29: Inca Trail (GGXI). Day 2 crosses Dead Woman's Pass (4200m). Arrive Machu Picchu Jan 29.
- Jan 30 - Feb 2: Amazon Jungle (GGHA). Posada Amazonas Lodge. Wildlife: Giant otters, macaws, monkeys.

[ARGENTINA]
- Feb 3: Welcome meeting G Adventures (SACC) @ 6:00pm in Buenos Aires.
- Feb 5: Loma del Pliegue Tumbado Hike (360 views).
- Feb 6: Laguna de los Tres (Fitz Roy viewpoint). Signature Hike.
- Feb 7: Free day in El Chaltén (optional: Laguna Torre or Chorrillo del Salto), transfer to El Calafate.
- Feb 8: Perito Moreno Glacier visit (included, optional boat ride).
- Feb 9: Free day in El Calafate (Laguna Nimez, Estancia, souvenir shops).
- Feb 10: Flight back to Buenos Aires from El Calafate.
- Feb 12: Buenos Aires free day (San Telmo, La Boca, Tango).

## Response Guidelines
- ALWAYS use specific flight numbers (e.g., LA4824) and exact times (e.g., 9:40am) if they are in the dossier.
- Never say "I don't know the flight times." They are all right here in the Knowledge Base.
- Be warm and informative. If someone asks "When do they land?", give the date, time, and the flight number.
`;
