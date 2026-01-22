import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { Note, Photo } from '../types';

interface NotesContextType {
  notes: Note[];
  addNote: (author: 'Harry' | 'Trent', content: string, date: string, location?: string, photos?: Photo[]) => Promise<void>;
  getNotesForDate: (date: string) => Note[];
  loading: boolean;
  error: string | null;
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

  useEffect(() => {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
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
        setError(null);
      },
      (err) => {
        console.error('Error fetching notes:', err);
        setError('Failed to load notes');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addNote = async (
    author: 'Harry' | 'Trent',
    content: string,
    date: string,
    location?: string,
    photos?: Photo[]
  ): Promise<void> => {
    const notesRef = collection(db, 'notes');
    // Capture the user's current timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await addDoc(notesRef, {
      author,
      content,
      date,
      location,
      timezone,
      photos: photos || [],
      createdAt: serverTimestamp(),
    });
  };

  const getNotesForDate = (date: string): Note[] => {
    return notes.filter((note) => note.date === date);
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, getNotesForDate, loading, error }}>
      {children}
    </NotesContext.Provider>
  );
};
