import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';

const JOURNAL_PASSWORD = 'jordan2024';
const SESSION_KEY = 'journal_authenticated';

interface NoteFormProps {
  date: string;
  location?: string;
}

export const NoteForm: React.FC<NoteFormProps> = ({ date, location }) => {
  const { addNote } = useNotes();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [author, setAuthor] = useState<'Harry' | 'Trent'>('Harry');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const authenticated = sessionStorage.getItem(SESSION_KEY) === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === JOURNAL_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await addNote(author, content.trim(), date, location);
      setContent('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="text-lg">🔒</span> Add a Journal Entry
        </h4>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Enter password to write notes
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              placeholder="Password"
              className={`w-full px-4 py-3 rounded-xl border ${
                passwordError
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-200 bg-white'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-2">Incorrect password</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Unlock Journal
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="text-lg">📝</span> Add a Journal Entry
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Who's writing?</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAuthor('Harry')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                author === 'Harry'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              Harry
            </button>
            <button
              type="button"
              onClick={() => setAuthor('Trent')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                author === 'Trent'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              Trent
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Your note</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening on your adventure today?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all ${
              isSubmitting || !content.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post Note'}
          </button>

          {showSuccess && (
            <span className="text-emerald-600 font-medium animate-in fade-in">
              Note posted!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
