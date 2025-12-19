import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next-auth
const mockSignIn = jest.fn();
jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'callbackUrl') return '/account';
      if (key === 'error') return null;
      return null;
    },
  }),
}));

import LoginPage from '@/app/login/page';

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the login form', () => {
      render(<LoginPage />);
      
      expect(screen.getByText('DemaShop')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign in$/i })).toBeInTheDocument();
    });

    it('renders Google sign in button', () => {
      render(<LoginPage />);
      
      expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    });

    it('renders register link', () => {
      render(<LoginPage />);
      
      expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
    });

    it('renders forgot password link', () => {
      render(<LoginPage />);
      
      expect(screen.getByText(/Forgot your password/i)).toBeInTheDocument();
    });

    it('renders remember me checkbox', () => {
      render(<LoginPage />);
      
      expect(screen.getByLabelText(/Remember me/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('allows typing in email field', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/Email address/i);
      await userEvent.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('allows typing in password field', async () => {
      render(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/Password/i);
      await userEvent.type(passwordInput, 'password123');
      
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('Form Submission', () => {
    it('calls signIn with credentials on form submit', async () => {
      mockSignIn.mockResolvedValue({ ok: true });
      
      render(<LoginPage />);
      
      await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Sign in$/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('redirects to callback URL on successful login', async () => {
      mockSignIn.mockResolvedValue({ ok: true });
      
      render(<LoginPage />);
      
      await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
      
      fireEvent.click(screen.getByRole('button', { name: /Sign in$/i }));
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/account');
      });
    });

    it('shows error message on failed login', async () => {
      mockSignIn.mockResolvedValue({ error: 'Invalid credentials' });
      
      render(<LoginPage />);
      
      await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/Password/i), 'wrongpassword');
      
      fireEvent.click(screen.getByRole('button', { name: /Sign in$/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));
      
      render(<LoginPage />);
      
      await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/Password/i), 'password123');
      
      fireEvent.click(screen.getByRole('button', { name: /Sign in$/i }));
      
      // Button should be disabled during loading
      const submitButton = screen.getByRole('button', { name: '' }); // Loading state has no text
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Google Sign In', () => {
    it('calls signIn with google provider when Google button is clicked', async () => {
      render(<LoginPage />);
      
      const googleButton = screen.getByText(/Sign in with Google/i);
      fireEvent.click(googleButton);
      
      expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/account' });
    });
  });
});
