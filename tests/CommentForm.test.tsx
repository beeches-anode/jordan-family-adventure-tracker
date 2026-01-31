import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentForm } from '../components/CommentForm';

describe('CommentForm', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('unauthenticated state', () => {
    it('renders the auth form with name and password fields', () => {
      render(<CommentForm onSubmit={vi.fn()} />);

      expect(screen.getByTestId('comment-auth-form')).toBeInTheDocument();
      expect(screen.getByTestId('comment-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('comment-password-input')).toBeInTheDocument();
      expect(screen.getByTestId('comment-unlock-btn')).toBeInTheDocument();
    });

    it('shows error on incorrect password', async () => {
      const user = userEvent.setup();
      render(<CommentForm onSubmit={vi.fn()} />);

      await user.type(screen.getByTestId('comment-name-input'), 'Grandma');
      await user.type(screen.getByTestId('comment-password-input'), 'wrongpassword');
      await user.click(screen.getByTestId('comment-unlock-btn'));

      expect(screen.getByTestId('comment-auth-error')).toHaveTextContent('Incorrect password');
    });

    it('shows error when name is empty', async () => {
      const user = userEvent.setup();
      render(<CommentForm onSubmit={vi.fn()} />);

      await user.type(screen.getByTestId('comment-password-input'), 'trentharry2026');
      await user.click(screen.getByTestId('comment-unlock-btn'));

      expect(screen.getByTestId('comment-auth-error')).toHaveTextContent('Please enter your name');
    });

    it('unlocks the comment form on correct password and name', async () => {
      const user = userEvent.setup();
      render(<CommentForm onSubmit={vi.fn()} />);

      await user.type(screen.getByTestId('comment-name-input'), 'Grandma');
      await user.type(screen.getByTestId('comment-password-input'), 'trentharry2026');
      await user.click(screen.getByTestId('comment-unlock-btn'));

      expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      expect(screen.getByTestId('comment-input')).toBeInTheDocument();
    });

    it('stores auth state in sessionStorage and name in localStorage', async () => {
      const user = userEvent.setup();
      render(<CommentForm onSubmit={vi.fn()} />);

      await user.type(screen.getByTestId('comment-name-input'), 'Uncle Bob');
      await user.type(screen.getByTestId('comment-password-input'), 'trentharry2026');
      await user.click(screen.getByTestId('comment-unlock-btn'));

      expect(sessionStorage.setItem).toHaveBeenCalledWith('comment_authenticated', 'true');
      expect(localStorage.setItem).toHaveBeenCalledWith('comment_author_name', 'Uncle Bob');
    });

    it('pre-fills name from localStorage', () => {
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('Grandma');

      // Need to re-render with localStorage already set
      // Since the mock is in setup.ts, manually set the return value
      render(<CommentForm onSubmit={vi.fn()} />);

      expect(screen.getByTestId('comment-name-input')).toHaveValue('Grandma');
    });
  });

  describe('authenticated state', () => {
    beforeEach(() => {
      // Simulate already authenticated
      (sessionStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('true');
      (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('Grandma');
    });

    it('shows the comment input form', () => {
      render(<CommentForm onSubmit={vi.fn()} />);

      expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      expect(screen.getByTestId('comment-input')).toBeInTheDocument();
      expect(screen.getByTestId('comment-submit-btn')).toBeInTheDocument();
    });

    it('shows "Commenting as" with the author name', () => {
      render(<CommentForm onSubmit={vi.fn()} />);

      expect(screen.getByText('Grandma')).toBeInTheDocument();
      expect(screen.getByText(/Commenting as/)).toBeInTheDocument();
    });

    it('submits a comment with correct data', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn(() => Promise.resolve());
      render(<CommentForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('comment-input'), 'Great photo!');
      await user.click(screen.getByTestId('comment-submit-btn'));

      expect(onSubmit).toHaveBeenCalledWith('Grandma', 'Great photo!');
    });

    it('clears input after successful submission', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn(() => Promise.resolve());
      render(<CommentForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('comment-input'), 'Nice!');
      await user.click(screen.getByTestId('comment-submit-btn'));

      expect(screen.getByTestId('comment-input')).toHaveValue('');
    });

    it('disables submit button when input is empty', () => {
      render(<CommentForm onSubmit={vi.fn()} />);

      expect(screen.getByTestId('comment-submit-btn')).toBeDisabled();
    });

    it('does not submit on Enter key press (allows new lines)', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn(() => Promise.resolve());
      render(<CommentForm onSubmit={onSubmit} />);

      await user.type(screen.getByTestId('comment-input'), 'Line one{Enter}Line two');

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByTestId('comment-input')).toHaveValue('Line one\nLine two');
    });

    it('renders a textarea instead of a single-line input', () => {
      render(<CommentForm onSubmit={vi.fn()} />);

      const textarea = screen.getByTestId('comment-input');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('rows', '3');
    });

    it('shows change name button and allows name change', async () => {
      const user = userEvent.setup();
      render(<CommentForm onSubmit={vi.fn()} />);

      expect(screen.getByTestId('comment-change-name-btn')).toBeInTheDocument();

      await user.click(screen.getByTestId('comment-change-name-btn'));
      expect(screen.getByTestId('comment-change-name-input')).toBeInTheDocument();
    });
  });
});
