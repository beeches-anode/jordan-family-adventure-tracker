import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentSection } from '../components/CommentSection';
import { Comment } from '../types';

// Mock the CommentsContext
const mockAddComment = vi.fn(() => Promise.resolve());
const mockDeleteComment = vi.fn(() => Promise.resolve());
const mockUpdateComment = vi.fn(() => Promise.resolve());
let mockComments: Comment[] = [];

vi.mock('../context/CommentsContext', () => ({
  useComments: () => ({
    comments: mockComments,
    addComment: mockAddComment,
    deleteComment: mockDeleteComment,
    updateComment: mockUpdateComment,
    getCommentsForNote: (noteId: string) => mockComments.filter(c => c.noteId === noteId),
    getCommentCountForNote: (noteId: string) => mockComments.filter(c => c.noteId === noteId).length,
    loading: false,
    error: null,
  }),
}));

describe('CommentSection', () => {
  beforeEach(() => {
    mockComments = [];
    mockAddComment.mockClear();
    mockDeleteComment.mockClear();
    mockUpdateComment.mockClear();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('renders the toggle button with "Add a comment" when no comments', () => {
    render(<CommentSection noteId="note-1" isJournalOwner={false} />);

    expect(screen.getByTestId('comment-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('comment-count')).toHaveTextContent('Add a comment');
  });

  it('shows "1 comment" when there is one comment', () => {
    mockComments = [
      { id: 'c1', noteId: 'note-1', author: 'Grandma', content: 'Great!', createdAt: new Date() },
    ];

    render(<CommentSection noteId="note-1" isJournalOwner={false} />);

    expect(screen.getByTestId('comment-count')).toHaveTextContent('1 comment');
  });

  it('shows "3 comments" when there are three comments', () => {
    mockComments = [
      { id: 'c1', noteId: 'note-1', author: 'Grandma', content: 'Great!', createdAt: new Date() },
      { id: 'c2', noteId: 'note-1', author: 'Uncle Bob', content: 'Nice', createdAt: new Date() },
      { id: 'c3', noteId: 'note-1', author: 'Mum', content: 'Love it', createdAt: new Date() },
    ];

    render(<CommentSection noteId="note-1" isJournalOwner={false} />);

    expect(screen.getByTestId('comment-count')).toHaveTextContent('3 comments');
  });

  it('only counts comments for the specific note', () => {
    mockComments = [
      { id: 'c1', noteId: 'note-1', author: 'Grandma', content: 'Great!', createdAt: new Date() },
      { id: 'c2', noteId: 'note-2', author: 'Uncle Bob', content: 'Nice', createdAt: new Date() },
    ];

    render(<CommentSection noteId="note-1" isJournalOwner={false} />);

    expect(screen.getByTestId('comment-count')).toHaveTextContent('1 comment');
  });

  it('is collapsed by default', () => {
    render(<CommentSection noteId="note-1" isJournalOwner={false} />);

    expect(screen.queryByTestId('comment-list')).not.toBeInTheDocument();
  });

  it('expands when toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<CommentSection noteId="note-1" isJournalOwner={false} />);

    await user.click(screen.getByTestId('comment-toggle'));

    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
  });

  it('collapses when toggle is clicked again', async () => {
    const user = userEvent.setup();
    render(<CommentSection noteId="note-1" isJournalOwner={false} />);

    await user.click(screen.getByTestId('comment-toggle'));
    expect(screen.getByTestId('comment-list')).toBeInTheDocument();

    await user.click(screen.getByTestId('comment-toggle'));
    expect(screen.queryByTestId('comment-list')).not.toBeInTheDocument();
  });

  it('shows comment items when expanded', async () => {
    const user = userEvent.setup();
    mockComments = [
      { id: 'c1', noteId: 'note-1', author: 'Grandma', content: 'Amazing trip!', createdAt: new Date() },
      { id: 'c2', noteId: 'note-1', author: 'Dad', content: 'Stay safe!', createdAt: new Date() },
    ];

    render(<CommentSection noteId="note-1" isJournalOwner={false} />);
    await user.click(screen.getByTestId('comment-toggle'));

    const items = screen.getAllByTestId('comment-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('Amazing trip!')).toBeInTheDocument();
    expect(screen.getByText('Stay safe!')).toBeInTheDocument();
  });

  it('shows the comment form when expanded', async () => {
    const user = userEvent.setup();
    render(<CommentSection noteId="note-1" isJournalOwner={false} />);
    await user.click(screen.getByTestId('comment-toggle'));

    // Should show either the auth form or the comment form
    const authForm = screen.queryByTestId('comment-auth-form');
    const commentForm = screen.queryByTestId('comment-form');
    expect(authForm || commentForm).toBeTruthy();
  });
});
