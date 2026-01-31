import React, { useState, useMemo } from 'react';
import { useNotes } from '../context/NotesContext';
import { Note, Photo } from '../types';
import { PhotoLightbox } from './PhotoLightbox';

interface JournalViewProps {
  onClose: () => void;
  onNavigateToDate: (date: Date) => void;
}

type AuthorFilter = 'All' | 'Harry' | 'Trent';

interface GroupedNotes {
  date: string;
  location?: string;
  notes: Note[];
}

const formatDateHeader = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTimeInZone = (date: Date, timezone: string): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
};

const getShortTimezone = (timezone: string): string => {
  const mapping: Record<string, string> = {
    'America/Lima': 'Lima',
    'America/Bogota': 'Lima',
    'America/Argentina/Buenos_Aires': 'BA',
    'America/Buenos_Aires': 'BA',
    'Australia/Brisbane': 'BNE',
  };
  return mapping[timezone] || timezone.split('/').pop()?.replace('_', ' ') || timezone;
};

export const JournalView: React.FC<JournalViewProps> = ({ onClose, onNavigateToDate }) => {
  const { notes, loading, error } = useNotes();
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>('All');
  const [lightboxState, setLightboxState] = useState<{ photos: Photo[]; index: number } | null>(null);

  const filteredNotes = useMemo(() => {
    if (authorFilter === 'All') return notes;
    return notes.filter((note) => note.author === authorFilter);
  }, [notes, authorFilter]);

  const groupedNotes = useMemo((): GroupedNotes[] => {
    const groups: Record<string, GroupedNotes> = {};

    // Sort notes by date descending, then by createdAt ascending within each day
    const sortedNotes = [...filteredNotes].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    sortedNotes.forEach((note) => {
      if (!groups[note.date]) {
        groups[note.date] = {
          date: note.date,
          location: note.location,
          notes: [],
        };
      }
      groups[note.date].notes.push(note);
      if (note.location && !groups[note.date].location) {
        groups[note.date].location = note.location;
      }
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredNotes]);

  const handleDateClick = (dateStr: string) => {
    const date = new Date(dateStr);
    onNavigateToDate(date);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-indigo-900 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Adventure Journal</h2>
                <p className="text-indigo-200 text-sm">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Author Filter */}
          <div className="flex gap-2 mt-4">
            {(['All', 'Harry', 'Trent'] as AuthorFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setAuthorFilter(filter)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  authorFilter === filter
                    ? 'bg-white text-indigo-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-600">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && groupedNotes.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">No journal entries yet</p>
              <p className="text-sm">Add notes from the day view to see them here.</p>
            </div>
          )}

          {!loading && !error && groupedNotes.length > 0 && (
            <div className="space-y-8">
              {groupedNotes.map((group) => (
                <div key={group.date}>
                  {/* Date Header */}
                  <button
                    onClick={() => handleDateClick(group.date)}
                    className="group flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
                  >
                    <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-semibold text-sm">
                      {formatDateHeader(group.date)}
                    </div>
                    {group.location && (
                      <span className="text-slate-500 text-sm flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {group.location}
                      </span>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </button>

                  {/* Notes for this date */}
                  <div className="space-y-3 ml-4 border-l-2 border-slate-100 pl-4">
                    {group.notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
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
                              {formatTimeInZone(note.createdAt, 'Australia/Brisbane')} BNE
                            </div>
                          </div>
                        </div>
                        {note.content && (
                          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                            {note.content}
                          </p>
                        )}
                        {note.photos && note.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {note.photos.map((photo, photoIndex) => (
                              <button
                                key={photoIndex}
                                onClick={() => setLightboxState({ photos: note.photos!, index: photoIndex })}
                                className="relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <img
                                  src={photo.url}
                                  alt={`Photo ${photoIndex + 1}`}
                                  className="w-16 h-16 object-cover"
                                  loading="lazy"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxState && (
        <PhotoLightbox
          photos={lightboxState.photos}
          initialIndex={lightboxState.index}
          onClose={() => setLightboxState(null)}
          zIndex={60}
        />
      )}
    </div>
  );
};
