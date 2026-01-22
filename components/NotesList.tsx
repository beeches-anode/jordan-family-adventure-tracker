import React from 'react';
import { useNotes } from '../context/NotesContext';

interface NotesListProps {
  date: string;
}

const formatTimeInZone = (date: Date, timezone: string): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
};

const getShortTimezone = (timezone: string): string => {
  // Convert IANA timezone to friendly short name
  const mapping: Record<string, string> = {
    'America/Lima': 'Lima',
    'America/Bogota': 'Lima', // Same timezone
    'America/Argentina/Buenos_Aires': 'Buenos Aires',
    'America/Buenos_Aires': 'Buenos Aires',
    'Australia/Brisbane': 'Brisbane',
  };
  return mapping[timezone] || timezone.split('/').pop()?.replace('_', ' ') || timezone;
};

export const NotesList: React.FC<NotesListProps> = ({ date }) => {
  const { getNotesForDate, loading, error } = useNotes();
  const notesForDate = getNotesForDate(date).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-red-200">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (notesForDate.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="text-lg">📔</span> Journal Entries
        </h4>
        <div className="text-center py-6 text-slate-400">
          <p className="text-lg mb-1">No notes for this day yet</p>
          <p className="text-sm">Be the first to add a journal entry!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="text-lg">📔</span> Journal Entries ({notesForDate.length})
      </h4>

      <div className="space-y-4">
        {notesForDate.map((note) => (
          <div
            key={note.id}
            className="bg-slate-50 rounded-xl p-4 border border-slate-100 transition-all hover:border-slate-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  note.author === 'Harry'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {note.author}
              </span>
              <div className="text-right text-xs">
                <div className="text-slate-500">
                  {formatTimeInZone(note.createdAt, note.timezone || 'UTC')} {getShortTimezone(note.timezone || 'UTC')}
                </div>
                <div className="text-slate-400">
                  {formatTimeInZone(note.createdAt, 'Australia/Brisbane')} Brisbane
                </div>
              </div>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
