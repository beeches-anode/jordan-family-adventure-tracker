import React, { useState } from 'react';
import { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
  isJournalOwner: boolean;
  onDelete: (commentId: string) => void;
}

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getAuthorInitial = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

// Generate a consistent color from the author name
const getAuthorColor = (name: string): { bg: string; text: string; badge: string } => {
  const colors = [
    { bg: 'bg-violet-100', text: 'text-violet-700', badge: 'bg-violet-500' },
    { bg: 'bg-rose-100', text: 'text-rose-700', badge: 'bg-rose-500' },
    { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-500' },
    { bg: 'bg-teal-100', text: 'text-teal-700', badge: 'bg-teal-500' },
    { bg: 'bg-sky-100', text: 'text-sky-700', badge: 'bg-sky-500' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', badge: 'bg-fuchsia-500' },
    { bg: 'bg-orange-100', text: 'text-orange-700', badge: 'bg-orange-500' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', badge: 'bg-cyan-500' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const CommentItem: React.FC<CommentItemProps> = ({ comment, isJournalOwner, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const colors = getAuthorColor(comment.author);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex gap-2.5 py-2.5 group" data-testid="comment-item">
      {/* Author avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full ${colors.badge} text-white flex items-center justify-center text-xs font-bold`}>
        {getAuthorInitial(comment.author)}
      </div>

      {/* Comment body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={`text-xs font-semibold ${colors.text}`} data-testid="comment-author">
            {comment.author}
          </span>
          <span className="text-xs text-slate-400" data-testid="comment-time">
            {getRelativeTime(comment.createdAt)}
          </span>
          {isJournalOwner && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {deleting ? '...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-1.5 py-0.5 text-xs bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-0.5 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete comment"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-0.5 break-words" data-testid="comment-content">
          {comment.content}
        </p>
      </div>
    </div>
  );
};
