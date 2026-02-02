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
  refreshComments: () => Promise<void>;
  lastSynced: Date | null;
  isFromCache: boolean;
  isRefreshing: boolean;
  refreshError: string | null;
  hasPendingWrites: boolean;
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
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isFromCache, setIsFromCache] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [hasPendingWrites, setHasPendingWrites] = useState(false);
  const lastSyncedRef = useRef<Date | null>(null);
  const visibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Server-confirmation gate: after a successful refreshComments(), block ALL cached
  // onSnapshot updates until server-confirmed data (fromCache: false) arrives.
  // This prevents the Firestore real-time listener from overwriting fresh server
  // data with stale IndexedDB cache — which happens on iOS where the WebSocket
  // can take 10-30s to reconnect after the app wakes from background.
  const awaitingServerConfirmation = useRef<boolean>(false);

  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const fromCache = snapshot.metadata.fromCache;

        if (fromCache && awaitingServerConfirmation.current) {
          // Gate is active: refreshComments() successfully fetched from the server
          // but the real-time WebSocket hasn't reconnected yet. The cached
          // snapshot likely contains stale IndexedDB data, so skip updating
          // comments entirely — refreshComments() already set authoritative data.
          // The gate is cleared once onSnapshot delivers fromCache: false.
          setLoading(false);
          return;
        }

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

        if (fromCache) {
          setIsFromCache(true);
          setHasPendingWrites(snapshot.metadata.hasPendingWrites);
        } else {
          // Server-confirmed data — always trust this, and clear the gate.
          awaitingServerConfirmation.current = false;
          setIsFromCache(false);
          setHasPendingWrites(snapshot.metadata.hasPendingWrites);
          const now = new Date();
          setLastSynced(now);
          lastSyncedRef.current = now;
          setError(null);
          setRefreshError(null);
        }
      },
      (err) => {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const refreshComments = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    // Activate the gate immediately so any cached onSnapshot events that fire
    // during or after our server fetch are suppressed.
    awaitingServerConfirmation.current = true;

    const fetchFromServer = async () => {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'asc'));
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
      const now = new Date();
      setLastSynced(now);
      lastSyncedRef.current = now;
      setIsFromCache(false);
      setHasPendingWrites(false);
      setRefreshError(null);
      // Gate stays active — it will be cleared when onSnapshot delivers
      // server-confirmed data (fromCache: false).
    } catch (err) {
      console.error('Error refreshing comments from server:', err);
      setRefreshError('Failed to refresh from server. Check your connection and try again.');
      // Clear the gate on failure so cached onSnapshot events can resume —
      // stale data is better than frozen data when the server is unreachable.
      awaitingServerConfirmation.current = false;
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
          refreshComments();
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
  }, [refreshComments]);

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
    <CommentsContext.Provider value={{ comments, addComment, deleteComment, updateComment, getCommentsForNote, getCommentCountForNote, loading, error, refreshComments, lastSynced, isFromCache, isRefreshing, refreshError, hasPendingWrites }}>
      {children}
    </CommentsContext.Provider>
  );
};
