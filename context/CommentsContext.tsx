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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase-config';
import { Comment } from '../types';

interface CommentsContextType {
  comments: Comment[];
  addComment: (noteId: string, author: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  getCommentsForNote: (noteId: string) => Comment[];
  getCommentCountForNote: (noteId: string) => number;
  loading: boolean;
  error: string | null;
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined);

export const useComments = (): CommentsContextType => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error('useComments must be used within a CommentsProvider');
  }
  return context;
};

interface CommentsProviderProps {
  children: ReactNode;
}

export const CommentsProvider: React.FC<CommentsProviderProps> = ({ children }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const commentsData: Comment[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            noteId: data.noteId,
            author: data.author,
            content: data.content,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setComments(commentsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addComment = useCallback(async (noteId: string, author: string, content: string): Promise<void> => {
    // Optimistically add to local state so UI updates immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: Comment = {
      id: tempId,
      noteId,
      author,
      content,
      createdAt: new Date(),
    };
    setComments(prev => [...prev, optimisticComment]);

    const commentsRef = collection(db, 'comments');
    const writePromise = addDoc(commentsRef, {
      noteId,
      author,
      content,
      createdAt: serverTimestamp(),
    });
    // Same pattern as NotesContext: don't block UI on server confirmation
    writePromise.catch(() => {});
    await Promise.race([
      writePromise,
      new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
    ]);
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    // Optimistically remove from local state so UI updates immediately
    setComments(prev => prev.filter(c => c.id !== commentId));

    const commentRef = doc(db, 'comments', commentId);
    const writePromise = deleteDoc(commentRef);
    writePromise.catch(() => {});
    await Promise.race([
      writePromise,
      new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
    ]);
  }, []);

  const updateComment = useCallback(async (commentId: string, content: string): Promise<void> => {
    // Optimistically update local state so UI updates immediately
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, content } : c));

    const commentRef = doc(db, 'comments', commentId);
    const writePromise = updateDoc(commentRef, { content });
    writePromise.catch(() => {});
    await Promise.race([
      writePromise,
      new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
    ]);
  }, []);

  const getCommentsForNote = useCallback((noteId: string): Comment[] => {
    return comments.filter((c) => c.noteId === noteId);
  }, [comments]);

  const getCommentCountForNote = useCallback((noteId: string): number => {
    return comments.filter((c) => c.noteId === noteId).length;
  }, [comments]);

  return (
    <CommentsContext.Provider value={{ comments, addComment, deleteComment, updateComment, getCommentsForNote, getCommentCountForNote, loading, error }}>
      {children}
    </CommentsContext.Provider>
  );
};
