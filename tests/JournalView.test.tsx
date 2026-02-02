import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JournalView } from '../components/JournalView';
import { Note, Comment } from '../types';

// --- Mock data ---

const mockNotes: Note[] = [
  {
    id: 'note-1',
    author: 'Trent',
    content: 'We visited the clay lick today.',
    date: '2026-02-01',
    createdAt: new Date('2026-02-01T12:32:00Z'),
    location: 'Amazon Day 3: Jungle Culture',
    timezone: 'America/Lima',
  },
  {
    id: 'note-2',
    author: 'Harry',
    content: 'Spotted a bluish-fronted jacamar!',
    date: '2026-02-01',
    createdAt: new Date('2026-02-01T14:00:00Z'),
    location: 'Amazon Day 3: Jungle Culture',
    timezone: 'America/Lima',
  },
  {
    id: 'note-3',
    author: 'Trent',
    content: 'Breakfast buffet at the lodge.',
    date: '2026-01-31',
    createdAt: new Date('2026-01-31T10:00:00Z'),
    timezone: 'America/Lima',
  },
];

let mockComments: Comment[] = [];

// --- Mocks ---

vi.mock('../context/NotesContext', () => ({
  useNotes: () => ({
    notes: mockNotes,
    loading: false,
    error: null,
    getNotesForDate: () => [],
  }),
}));

const mockAddComment = vi.fn(() => Promise.resolve());
const mockDeleteComment = vi.fn(() => Promise.resolve());
const mockUpdateComment = vi.fn(() => Promise.resolve());

vi.mock('../context/CommentsContext', () => ({
  useComments: () => ({
    comments: mockComments,
    addComment: mockAddComment,
    deleteComment: mockDeleteComment,
    updateComment: mockUpdateComment,
    getCommentsForNote: (noteId: string) => mockComments.filter((c) => c.noteId === noteId),
    getCommentCountForNote: (noteId: string) => mockComments.filter((c) => c.noteId === noteId).length,
    loading: false,
    error: null,
  }),
}));

const defaultProps = {
  onClose: vi.fn(),
  onNavigateToDate: vi.fn(),
};

describe('JournalView — comment integration', () => {
  beforeEach(() => {
    mockComments = [];
    mockAddComment.mockClear();
    mockDeleteComment.mockClear();
    mockUpdateComment.mockClear();
    sessionStorage.clear();
    localStorage.clear();
    // Reset mock implementations so mockReturnValue from one test doesn't leak into the next
    (sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReset();
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReset();
    defaultProps.onClose.mockClear();
    defaultProps.onNavigateToDate.mockClear();
  });

  it('renders a CommentSection toggle for every note', () => {
    render(<JournalView {...defaultProps} />);

    const toggles = screen.getAllByTestId('comment-toggle');
    expect(toggles).toHaveLength(mockNotes.length);
  });

  it('shows "Add a comment" on notes with zero comments', () => {
    render(<JournalView {...defaultProps} />);

    const counts = screen.getAllByTestId('comment-count');
    counts.forEach((count) => {
      expect(count).toHaveTextContent('Add a comment');
    });
  });

  it('shows correct comment count when comments exist', () => {
    mockComments = [
      { id: 'c1', noteId: 'note-1', author: 'Grandma', content: 'Amazing!', createdAt: new Date() },
      { id: 'c2', noteId: 'note-1', author: 'Dad', content: 'Stay safe', createdAt: new Date() },
    ];

    render(<JournalView {...defaultProps} />);

    const toggles = screen.getAllByTestId('comment-count');
    // note-1 should show "2 comments", note-2 and note-3 should show "Add a comment"
    const texts = toggles.map((t) => t.textContent);
    expect(texts.filter((t) => t === '2 comments')).toHaveLength(1);
    expect(texts.filter((t) => t === 'Add a comment')).toHaveLength(2);
  });

  it('expands to show comment form when toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<JournalView {...defaultProps} />);

    const toggles = screen.getAllByTestId('comment-toggle');
    await user.click(toggles[0]);

    expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    // Should show either auth form or comment form
    const authForm = screen.queryByTestId('comment-auth-form');
    const commentForm = screen.queryByTestId('comment-form');
    expect(authForm || commentForm).toBeTruthy();
  });

  it('shows existing comments when expanded', async () => {
    mockComments = [
      { id: 'c1', noteId: 'note-1', author: 'Grandma', content: 'What a trip!', createdAt: new Date() },
    ];

    const user = userEvent.setup();
    render(<JournalView {...defaultProps} />);

    const toggles = screen.getAllByTestId('comment-toggle');
    await user.click(toggles[0]);

    expect(screen.getByText('What a trip!')).toBeInTheDocument();
  });

  it('shows auth form for unauthenticated users when expanded', async () => {
    const user = userEvent.setup();
    render(<JournalView {...defaultProps} />);

    const toggles = screen.getAllByTestId('comment-toggle');
    await user.click(toggles[0]);

    expect(screen.getByTestId('comment-auth-form')).toBeInTheDocument();
  });

  it('passes isJournalOwner=true when session is authenticated', async () => {
    // Simulate authenticated session
    (sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('true');

    mockComments = [
      { id: 'c1', noteId: 'note-1', author: 'Grandma', content: 'Nice!', createdAt: new Date() },
    ];

    const user = userEvent.setup();
    render(<JournalView {...defaultProps} />);

    const toggles = screen.getAllByTestId('comment-toggle');
    await user.click(toggles[0]);

    // Journal owner should see delete button on any comment
    expect(screen.getByTitle('Delete comment')).toBeInTheDocument();
  });

  it('does not show delete button when not authenticated (isJournalOwner=false)', async () => {
    mockComments = [
      { id: 'c1', noteId: 'note-1', author: 'Grandma', content: 'Nice!', createdAt: new Date() },
    ];

    const user = userEvent.setup();
    render(<JournalView {...defaultProps} />);

    const toggles = screen.getAllByTestId('comment-toggle');
    await user.click(toggles[0]);

    // Non-owner, non-author should NOT see delete button
    expect(screen.queryByTitle('Delete comment')).not.toBeInTheDocument();
  });

  it('groups notes by date with correct headers', () => {
    render(<JournalView {...defaultProps} />);

    // Two date groups: 2026-02-01 and 2026-01-31
    expect(screen.getByText(/February 1, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/January 31, 2026/)).toBeInTheDocument();
  });

  it('renders all note content in the journal', () => {
    render(<JournalView {...defaultProps} />);

    expect(screen.getByText(/We visited the clay lick today/)).toBeInTheDocument();
    expect(screen.getByText(/Spotted a bluish-fronted jacamar/)).toBeInTheDocument();
    expect(screen.getByText(/Breakfast buffet at the lodge/)).toBeInTheDocument();
  });

  it('each note card contains its own CommentSection', async () => {
    const user = userEvent.setup();
    render(<JournalView {...defaultProps} />);

    // All 3 notes should have a comment section
    const sections = screen.getAllByTestId('comment-section');
    expect(sections).toHaveLength(3);

    // Each section should have its own toggle
    sections.forEach((section) => {
      expect(within(section).getByTestId('comment-toggle')).toBeInTheDocument();
    });
  });
});
