import React, { useState, useRef, useEffect } from 'react';
import { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
  isJournalOwner: boolean;
  currentAuthor?: string;
  onDelete: (commentId: string) => Promise<void>;
  onEdit?: (commentId: string, newContent: string) => Promise<void>;
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

export const CommentItem: React.FC<CommentItemProps> = ({ comment, isJournalOwner, currentAuthor, onDelete, onEdit }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const colors = getAuthorColor(comment.author);

  const isOwnComment = currentAuthor
    ? currentAuthor.toLowerCase() === comment.author.toLowerCase()
    : false;
  const canDelete = isJournalOwner || isOwnComment;
  const canEdit = isOwnComment && !!onEdit;

  useEffect(() => {
    if (editing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [editing]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !onEdit) return;
    setSaving(true);
    try {
      await onEdit(comment.id, editContent.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setEditing(false);
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
          {(canDelete || canEdit) && !editing && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                    data-testid="comment-confirm-delete-btn"
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
                <>
                  {canEdit && (
                    <button
                      onClick={() => setEditing(true)}
                      className="p-0.5 text-slate-400 hover:text-indigo-500 transition-colors"
                      title="Edit comment"
                      data-testid="comment-edit-btn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="p-0.5 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete comment"
                      data-testid="comment-delete-btn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        {editing ? (
          <div className="mt-1" data-testid="comment-edit-form">
            <textarea
              ref={editTextareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              disabled={saving}
              className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50 resize-none"
              data-testid="comment-edit-input"
            />
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || saving}
                className="px-2.5 py-1 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="comment-edit-save-btn"
              >
                {saving ? '...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                data-testid="comment-edit-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 mt-0.5 break-words whitespace-pre-wrap" data-testid="comment-content">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
};
