import React, { useState } from 'react';
import { useComments } from '../context/CommentsContext';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';

interface CommentSectionProps {
  noteId: string;
  isJournalOwner: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ noteId, isJournalOwner }) => {
  const { getCommentsForNote, addComment, deleteComment } = useComments();
  const [expanded, setExpanded] = useState(false);

  const comments = getCommentsForNote(noteId);
  const commentCount = comments.length;

  const handleAddComment = async (author: string, content: string) => {
    await addComment(noteId, author, content);
    // Auto-expand when a comment is posted
    if (!expanded) setExpanded(true);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-100" data-testid="comment-section">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-500 transition-colors"
        data-testid="comment-toggle"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span data-testid="comment-count">
          {commentCount === 0
            ? 'Add a comment'
            : commentCount === 1
            ? '1 comment'
            : `${commentCount} comments`}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-2" data-testid="comment-list">
          {/* Comments list */}
          {comments.length > 0 && (
            <div className="divide-y divide-slate-100">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isJournalOwner={isJournalOwner}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}

          {/* Comment form */}
          <CommentForm onSubmit={handleAddComment} />
        </div>
      )}
    </div>
  );
};
