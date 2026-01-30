import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNotes } from '../context/NotesContext';
import { Photo } from '../types';

const SESSION_KEY = 'journal_authenticated';

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

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onPhotoClick }) => {
  if (!photos || photos.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {photos.map((photo, index) => (
        <button
          key={index}
          onClick={() => onPhotoClick(photo)}
          className="relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <img
            src={photo.url}
            alt={`Photo ${index + 1}`}
            className="w-24 h-24 object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
};

interface LightboxProps {
  photo: Photo;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ photo, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
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
      <img
        src={photo.url}
        alt="Full size"
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export const NotesList: React.FC<NotesListProps> = ({ date }) => {
  const { getNotesForDate, deleteNote, loading, error } = useNotes();
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const notesForDate = getNotesForDate(date).sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  useEffect(() => {
    const authenticated = sessionStorage.getItem(SESSION_KEY) === 'true';
    setIsAuthenticated(authenticated);

    const handleAuth = () => setIsAuthenticated(true);
    window.addEventListener('journal-authenticated', handleAuth);
    return () => window.removeEventListener('journal-authenticated', handleAuth);
  }, []);

  const handleDelete = async (noteId: string) => {
    setDeletingNoteId(noteId);
    try {
      await deleteNote(noteId);
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeletingNoteId(null);
      setConfirmDeleteId(null);
    }
  };

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
              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <div className="text-slate-500">
                    {formatTimeInZone(note.createdAt, note.timezone || 'UTC')} {getShortTimezone(note.timezone || 'UTC')}
                  </div>
                  <div className="text-slate-400">
                    {formatTimeInZone(note.createdAt, 'Australia/Brisbane')} Brisbane
                  </div>
                </div>
                {isAuthenticated && (
                  <div className="relative">
                    {confirmDeleteId === note.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(note.id)}
                          disabled={deletingNoteId === note.id}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {deletingNoteId === note.id ? '...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(note.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Delete note"
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {note.content && (
              <div className="text-slate-700 leading-relaxed prose prose-sm prose-slate max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 last:mb-0">{children}</ul>,
                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                  }}
                >
                  {note.content}
                </ReactMarkdown>
              </div>
            )}
            {note.photos && note.photos.length > 0 && (
              <PhotoGallery
                photos={note.photos}
                onPhotoClick={(photo) => setLightboxPhoto(photo)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
      )}
    </div>
  );
};
