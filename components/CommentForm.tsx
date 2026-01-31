import React, { useState, useEffect, useRef } from 'react';

const COMMENT_PASSWORD = 'trentharry2026';
const COMMENT_SESSION_KEY = 'comment_authenticated';
const COMMENT_AUTHOR_KEY = 'comment_author_name';

interface CommentFormProps {
  onSubmit: (author: string, content: string) => Promise<void>;
}

export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(COMMENT_SESSION_KEY) === 'true';
  });
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem(COMMENT_AUTHOR_KEY) || '';
  });

  // Auth form state
  const [password, setPassword] = useState('');
  const [nameInput, setNameInput] = useState(() => {
    return localStorage.getItem(COMMENT_AUTHOR_KEY) || '';
  });
  const [passwordError, setPasswordError] = useState('');

  // Comment form state
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [changingName, setChangingName] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for comment auth events from other components
  useEffect(() => {
    const handleAuth = () => {
      setIsAuthenticated(true);
      setAuthorName(localStorage.getItem(COMMENT_AUTHOR_KEY) || '');
    };
    window.addEventListener('comment-authenticated', handleAuth);
    return () => window.removeEventListener('comment-authenticated', handleAuth);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== COMMENT_PASSWORD) {
      setPasswordError('Incorrect password');
      return;
    }
    if (!nameInput.trim()) {
      setPasswordError('Please enter your name');
      return;
    }
    const name = nameInput.trim();
    sessionStorage.setItem(COMMENT_SESSION_KEY, 'true');
    localStorage.setItem(COMMENT_AUTHOR_KEY, name);
    setIsAuthenticated(true);
    setAuthorName(name);
    setPasswordError('');
    setPassword('');
    window.dispatchEvent(new Event('comment-authenticated'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(authorName, content.trim());
      setContent('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChangeName = () => {
    setChangingName(true);
    setNameInput(authorName);
  };

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const name = nameInput.trim();
    localStorage.setItem(COMMENT_AUTHOR_KEY, name);
    setAuthorName(name);
    setChangingName(false);
  };

  // Unauthenticated: show password + name gate
  if (!isAuthenticated) {
    return (
      <form onSubmit={handleUnlock} className="mt-3" data-testid="comment-auth-form">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 mb-2">Enter the family password to comment</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); setPasswordError(''); }}
              placeholder="Your name"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              data-testid="comment-name-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              placeholder="Family password"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              data-testid="comment-password-input"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              data-testid="comment-unlock-btn"
            >
              Unlock
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-red-500 mt-1.5" data-testid="comment-auth-error">{passwordError}</p>
          )}
        </div>
      </form>
    );
  }

  // Authenticated: show comment input
  return (
    <div className="mt-3" data-testid="comment-form">
      {/* Author display */}
      <div className="flex items-center gap-2 mb-2">
        {changingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              data-testid="comment-change-name-input"
            />
            <button
              onClick={handleSaveName}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setChangingName(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">
              Commenting as <span className="font-semibold text-slate-700">{authorName}</span>
            </span>
            <button
              onClick={handleChangeName}
              className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
              data-testid="comment-change-name-btn"
            >
              change
            </button>
          </div>
        )}
      </div>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          disabled={isSubmitting}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
          data-testid="comment-input"
        />
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-3 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          data-testid="comment-submit-btn"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
          ) : showSuccess ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            'Post'
          )}
        </button>
      </form>
    </div>
  );
};
