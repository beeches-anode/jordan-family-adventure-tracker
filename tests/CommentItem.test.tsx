import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentItem } from '../components/CommentItem';
import { Comment } from '../types';

const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'comment-1',
  noteId: 'note-1',
  author: 'Grandma',
  content: 'What a wonderful adventure!',
  createdAt: new Date(),
  ...overrides,
});

describe('CommentItem', () => {
  it('renders author name, content, and timestamp', () => {
    const comment = makeComment();
    render(<CommentItem comment={comment} isJournalOwner={false} onDelete={vi.fn()} />);

    expect(screen.getByTestId('comment-author')).toHaveTextContent('Grandma');
    expect(screen.getByTestId('comment-content')).toHaveTextContent('What a wonderful adventure!');
    expect(screen.getByTestId('comment-time')).toBeInTheDocument();
  });

  it('shows relative time "just now" for recent comments', () => {
    const comment = makeComment({ createdAt: new Date() });
    render(<CommentItem comment={comment} isJournalOwner={false} onDelete={vi.fn()} />);

    expect(screen.getByTestId('comment-time')).toHaveTextContent('just now');
  });

  it('shows relative time for older comments', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const comment = makeComment({ createdAt: twoHoursAgo });
    render(<CommentItem comment={comment} isJournalOwner={false} onDelete={vi.fn()} />);

    expect(screen.getByTestId('comment-time')).toHaveTextContent('2h ago');
  });

  it('renders the author initial in the avatar', () => {
    const comment = makeComment({ author: 'Uncle Steve' });
    render(<CommentItem comment={comment} isJournalOwner={false} onDelete={vi.fn()} />);

    // The avatar should contain "U" for "Uncle Steve"
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('does not show delete button when not journal owner and not own comment', () => {
    const comment = makeComment();
    render(<CommentItem comment={comment} isJournalOwner={false} onDelete={vi.fn()} />);

    expect(screen.queryByTitle('Delete comment')).not.toBeInTheDocument();
  });

  it('shows delete button when journal owner', () => {
    const comment = makeComment();
    render(<CommentItem comment={comment} isJournalOwner={true} onDelete={vi.fn()} />);

    expect(screen.getByTitle('Delete comment')).toBeInTheDocument();
  });

  it('shows confirmation dialog when delete is clicked', async () => {
    const user = userEvent.setup();
    const comment = makeComment();
    render(<CommentItem comment={comment} isJournalOwner={true} onDelete={vi.fn()} />);

    await user.click(screen.getByTitle('Delete comment'));

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onDelete when delete is confirmed', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const comment = makeComment({ id: 'comment-42' });
    render(<CommentItem comment={comment} isJournalOwner={true} onDelete={onDelete} />);

    await user.click(screen.getByTitle('Delete comment'));
    await user.click(screen.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith('comment-42');
  });

  it('cancels deletion when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const comment = makeComment();
    render(<CommentItem comment={comment} isJournalOwner={true} onDelete={onDelete} />);

    await user.click(screen.getByTitle('Delete comment'));
    await user.click(screen.getByText('Cancel'));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByTitle('Delete comment')).toBeInTheDocument();
  });

  it('generates consistent colors for the same author name', () => {
    const { container: container1 } = render(
      <CommentItem comment={makeComment({ author: 'Mum' })} isJournalOwner={false} onDelete={vi.fn()} />
    );
    const { container: container2 } = render(
      <CommentItem comment={makeComment({ author: 'Mum' })} isJournalOwner={false} onDelete={vi.fn()} />
    );

    const avatar1 = container1.querySelector('[class*="rounded-full"]');
    const avatar2 = container2.querySelector('[class*="rounded-full"]');
    expect(avatar1?.className).toBe(avatar2?.className);
  });

  // --- Own-comment edit/delete tests ---

  it('shows edit and delete buttons for own comments', () => {
    const comment = makeComment({ author: 'Peter' });
    render(
      <CommentItem
        comment={comment}
        isJournalOwner={false}
        currentAuthor="Peter"
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByTitle('Edit comment')).toBeInTheDocument();
    expect(screen.getByTitle('Delete comment')).toBeInTheDocument();
  });

  it('matches author name case-insensitively', () => {
    const comment = makeComment({ author: 'peter' });
    render(
      <CommentItem
        comment={comment}
        isJournalOwner={false}
        currentAuthor="Peter"
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByTitle('Edit comment')).toBeInTheDocument();
  });

  it('does not show edit button for other peoples comments', () => {
    const comment = makeComment({ author: 'Grandma' });
    render(
      <CommentItem
        comment={comment}
        isJournalOwner={false}
        currentAuthor="Peter"
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.queryByTitle('Edit comment')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete comment')).not.toBeInTheDocument();
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    const comment = makeComment({ author: 'Peter', content: 'Original text' });
    render(
      <CommentItem
        comment={comment}
        isJournalOwner={false}
        currentAuthor="Peter"
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    await user.click(screen.getByTitle('Edit comment'));

    expect(screen.getByTestId('comment-edit-form')).toBeInTheDocument();
    expect(screen.getByTestId('comment-edit-input')).toHaveValue('Original text');
  });

  it('saves edited comment when Save is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn(() => Promise.resolve());
    const comment = makeComment({ id: 'comment-99', author: 'Peter', content: 'Original' });
    render(
      <CommentItem
        comment={comment}
        isJournalOwner={false}
        currentAuthor="Peter"
        onDelete={vi.fn()}
        onEdit={onEdit}
      />
    );

    await user.click(screen.getByTitle('Edit comment'));
    const textarea = screen.getByTestId('comment-edit-input');
    await user.clear(textarea);
    await user.type(textarea, 'Updated text');
    await user.click(screen.getByTestId('comment-edit-save-btn'));

    expect(onEdit).toHaveBeenCalledWith('comment-99', 'Updated text');
  });

  it('cancels edit and restores original content', async () => {
    const user = userEvent.setup();
    const comment = makeComment({ author: 'Peter', content: 'Original text' });
    render(
      <CommentItem
        comment={comment}
        isJournalOwner={false}
        currentAuthor="Peter"
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    await user.click(screen.getByTitle('Edit comment'));
    const textarea = screen.getByTestId('comment-edit-input');
    await user.clear(textarea);
    await user.type(textarea, 'Changed text');
    await user.click(screen.getByTestId('comment-edit-cancel-btn'));

    // Should be back to displaying the original content
    expect(screen.getByTestId('comment-content')).toHaveTextContent('Original text');
    expect(screen.queryByTestId('comment-edit-form')).not.toBeInTheDocument();
  });

  it('does not show edit button when onEdit is not provided', () => {
    const comment = makeComment({ author: 'Peter' });
    render(
      <CommentItem
        comment={comment}
        isJournalOwner={false}
        currentAuthor="Peter"
        onDelete={vi.fn()}
      />
    );

    // Should show delete (own comment) but not edit (no onEdit handler)
    expect(screen.queryByTitle('Edit comment')).not.toBeInTheDocument();
    expect(screen.getByTitle('Delete comment')).toBeInTheDocument();
  });

  it('allows own comment deletion even when not journal owner', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn(() => Promise.resolve());
    const comment = makeComment({ id: 'comment-5', author: 'Peter' });
    render(
      <CommentItem
        comment={comment}
        isJournalOwner={false}
        currentAuthor="Peter"
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByTitle('Delete comment'));
    await user.click(screen.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith('comment-5');
  });
});
