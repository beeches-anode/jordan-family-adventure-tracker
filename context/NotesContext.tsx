import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  getDocsFromServer,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { Note, Photo } from '../types';

interface NotesContextType {
  notes: Note[];
  addNote: (author: 'Harry' | 'Trent', content: string, date: string, location?: string, photos?: Photo[]) => Promise<'confirmed' | 'pending'>;
  updateNote: (noteId: string, updates: { content?: string; date?: string }) => Promise<'confirmed' | 'pending'>;
  deleteNote: (noteId: string) => Promise<void>;
  getNotesForDate: (date: string) => Note[];
  loading: boolean;
  error: string | null;
  refreshError: string | null;
  hasPendingWrites: boolean;
  refreshNotes: () => Promise<void>;
  lastSynced: Date | null;
  isFromCache: boolean;
  isRefreshing: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isFromCache, setIsFromCache] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [hasPendingWrites, setHasPendingWrites] = useState(false);
  const lastSyncedRef = useRef<Date | null>(null);
  const visibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const notesData: Note[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            author: data.author,
            content: data.content,
            date: data.date,
            createdAt: data.createdAt?.toDate() || new Date(),
            location: data.location,
            timezone: data.timezone,
            photos: data.photos || [],
          };
        });
        setNotes(notesData);
        setLoading(false);
        setHasPendingWrites(snapshot.metadata.hasPendingWrites);

        const fromCache = snapshot.metadata.fromCache;
        setIsFromCache(fromCache);
        if (!fromCache) {
          const now = new Date();
          setLastSynced(now);
          lastSyncedRef.current = now;
          setError(null);
          setRefreshError(null);
        }
      },
      (err) => {
        console.error('Error fetching notes:', err);
        setError('Failed to load notes');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const refreshNotes = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshError(null);

    const fetchFromServer = async () => {
      const notesRef = collection(db, 'notes');
      const q = query(notesRef, orderBy('createdAt', 'desc'));
      const snapshot = await Promise.race([
        getDocsFromServer(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Server request timed out')), 10_000)
        ),
      ]);
      return snapshot;
    };

    try {
      let snapshot;
      try {
        snapshot = await fetchFromServer();
      } catch {
        // First attempt failed -- wait for WebSocket reconnection, then retry once
        await new Promise((resolve) => setTimeout(resolve, 2_000));
        snapshot = await fetchFromServer();
      }

      const notesData: Note[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          author: data.author,
          content: data.content,
          date: data.date,
          createdAt: data.createdAt?.toDate() || new Date(),
          location: data.location,
          timezone: data.timezone,
          photos: data.photos || [],
        };
      });
      setNotes(notesData);
      const now = new Date();
      setLastSynced(now);
      lastSyncedRef.current = now;
      setIsFromCache(false);
      setRefreshError(null);
    } catch (err) {
      console.error('Error refreshing notes from server:', err);
      setRefreshError('Failed to refresh from server. Check your connection and try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh when tab regains focus (with 30s throttle)
  // Delay by 1.5s to give iOS time to re-establish the Firestore WebSocket
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
        visibilityTimeoutRef.current = null;
      }

      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const last = lastSyncedRef.current;
        if (last && (now - last.getTime()) < 30_000) return;
        visibilityTimeoutRef.current = setTimeout(() => {
          visibilityTimeoutRef.current = null;
          refreshNotes();
        }, 1_500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [refreshNotes]);

  const addNote = async (
    author: 'Harry' | 'Trent',
    content: string,
    date: string,
    location?: string,
    photos?: Photo[]
  ): Promise<'confirmed' | 'pending'> => {
    const notesRef = collection(db, 'notes');
    // Capture the user's current timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let confirmed = false;
    const writePromise = addDoc(notesRef, {
      author,
      content,
      date,
      location,
      timezone,
      photos: photos || [],
      createdAt: serverTimestamp(),
    }).then(() => { confirmed = true; });
    // With persistentLocalCache the write is already committed locally.
    // Race against a timeout so the UI isn't blocked waiting for server confirmation.
    writePromise.catch(() => {});
    await Promise.race([
      writePromise,
      new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
    ]);
    return confirmed ? 'confirmed' : 'pending';
  };

  const updateNote = async (noteId: string, updates: { content?: string; date?: string }): Promise<'confirmed' | 'pending'> => {
    const noteRef = doc(db, 'notes', noteId);
    let confirmed = false;
    const writePromise = updateDoc(noteRef, updates).then(() => { confirmed = true; });
    writePromise.catch(() => {});
    await Promise.race([
      writePromise,
      new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
    ]);
    return confirmed ? 'confirmed' : 'pending';
  };

  const deleteNote = async (noteId: string): Promise<void> => {
    const noteRef = doc(db, 'notes', noteId);
    const writePromise = deleteDoc(noteRef);
    writePromise.catch(() => {});
    await Promise.race([
      writePromise,
      new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
    ]);
  };

  const getNotesForDate = (date: string): Note[] => {
    return notes.filter((note) => note.date === date);
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, getNotesForDate, loading, error, refreshError, hasPendingWrites, refreshNotes, lastSynced, isFromCache, isRefreshing }}>
      {children}
    </NotesContext.Provider>
  );
};
