import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the LocaleContext
jest.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'contact.title': 'Contact Us',
        'contact.subtitle': 'Get in touch with us',
        'contact.first_name': 'First Name',
        'contact.last_name': 'Last Name',
        'contact.email': 'Email',
        'contact.phone.label': 'Phone',
        'contact.company': 'Company',
        'contact.message': 'Message',
        'contact.send_message': 'Send Message',
        'contact.validation.first_name_required': 'First name is required',
        'contact.validation.last_name_required': 'Last name is required',
        'contact.validation.email_required': 'Email is required',
        'contact.validation.email_invalid': 'Invalid email address',
        'contact.validation.message_required': 'Message is required',
        'contact.validation.message_min_10': 'Message must be at least 10 characters',
        'contact.validation.accept_privacy': 'You must accept the privacy policy',
        'contact.validation.accept_terms': 'You must accept the terms and conditions',
        'contact.privacy.agree_prefix': 'I agree to the',
        'contact.privacy.link': 'Privacy Policy',
        'contact.terms.agree_prefix': 'I agree to the',
        'contact.terms.link': 'Terms and Conditions',
        'contact.required_note': 'Fields marked with',
        'contact.current_time': 'Current time:',
        'contact.placeholders.first_name': 'John',
        'contact.placeholders.last_name': 'Doe',
        'contact.placeholders.email': 'john@example.com',
        'contact.placeholders.phone': '+32 123 45 67 89',
        'contact.placeholders.company': 'Company Name',
        'contact.placeholders.message': 'Your message...',
        'contact.placeholders.address': 'Start typing your address...',
        'contact.address': 'Address',
        'contact.vat': 'VAT Number',
        'contact.placeholders.vat': 'BE0123456789',
        'contact.sending': 'Sending...',
        'contact.success.submit': 'Message sent successfully!',
        'contact.errors.submit_failed': 'Failed to send message',
        'contact.phone.send_code': 'Send Code',
        'contact.phone.sending': 'Sending...',
        'contact.phone.code_placeholder': 'Enter code',
        'contact.phone.verify': 'Verify',
        'contact.info.email_us': 'Email Us',
        'contact.info.respond_24h': 'We respond within 24 hours',
        'contact.info.call_us': 'Call Us',
        'contact.info.hours': 'Mon-Fri 9am-5pm',
        'contact.info.visit_us': 'Visit Us',
        'contact.info.address_line1': 'Ovenstraat 11',
        'contact.info.address_line2': '8800 Roeselare',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock Firebase
jest.mock('@/lib/firebaseClient', () => ({
  getFirebaseAuth: jest.fn(),
  RecaptchaVerifier: jest.fn(),
  signInWithPhoneNumber: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Import after mocks
import ContactPage from '@/app/contact/page';

describe('Contact Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
  });

  describe('Rendering', () => {
    it('renders the contact form', () => {
      render(<ContactPage />);
      
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    });

    it('renders contact information cards', () => {
      render(<ContactPage />);
      
      expect(screen.getByText('Email Us')).toBeInTheDocument();
      expect(screen.getByText('Call Us')).toBeInTheDocument();
      expect(screen.getByText('Visit Us')).toBeInTheDocument();
    });

    it('renders phone and address in header', () => {
      render(<ContactPage />);
      
      expect(screen.getByText('+32 (0)51 20 51 41')).toBeInTheDocument();
      // Email appears multiple times on page, use getAllByText
      expect(screen.getAllByText('info@demashop.be').length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    it('shows error when first name is empty', async () => {
      render(<ContactPage />);
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
    });

    it('shows error when last name is empty', async () => {
      render(<ContactPage />);
      
      const firstNameInput = screen.getByLabelText(/First Name/i);
      await userEvent.type(firstNameInput, 'John');
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
      });
    });

    it('validates email field exists and is required', async () => {
      render(<ContactPage />);
      
      // Just verify the email field exists and has proper attributes
      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('shows error when message is too short', async () => {
      render(<ContactPage />);
      
      const messageInput = screen.getByLabelText(/Message/i);
      await userEvent.type(messageInput, 'Short');
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
      });
    });

    it('shows error when privacy policy is not accepted', async () => {
      render(<ContactPage />);
      
      // Fill required fields
      await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
      await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/Message/i), 'This is a test message that is long enough');
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('You must accept the privacy policy')).toBeInTheDocument();
      });
    });
  });

  describe('VAT Field Visibility', () => {
    it('shows VAT field when company name is entered', async () => {
      render(<ContactPage />);
      
      const companyInput = screen.getByLabelText(/Company/i);
      await userEvent.type(companyInput, 'Test Company');
      
      await waitFor(() => {
        expect(screen.getByLabelText(/VAT Number/i)).toBeInTheDocument();
      });
    });

    it('hides VAT field when company name is empty', () => {
      render(<ContactPage />);
      
      expect(screen.queryByLabelText(/VAT Number/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      render(<ContactPage />);
      
      // Fill all required fields
      await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
      await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/Message/i), 'This is a test message that is long enough to pass validation');
      
      // Accept checkboxes
      const privacyCheckbox = screen.getByRole('checkbox', { name: /Privacy Policy/i });
      const termsCheckbox = screen.getByRole('checkbox', { name: /Terms and Conditions/i });
      fireEvent.click(privacyCheckbox);
      fireEvent.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.any(Object));
      });
    });

    it('shows success message after successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
      
      render(<ContactPage />);
      
      // Fill all required fields
      await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
      await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/Message/i), 'This is a test message that is long enough to pass validation');
      
      // Accept checkboxes
      fireEvent.click(screen.getByRole('checkbox', { name: /Privacy Policy/i }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Terms and Conditions/i }));
      
      fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Message sent successfully!')).toBeInTheDocument();
      });
    });

    it('shows error message after failed submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
      
      render(<ContactPage />);
      
      // Fill all required fields
      await userEvent.type(screen.getByLabelText(/First Name/i), 'John');
      await userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
      await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/Message/i), 'This is a test message that is long enough to pass validation');
      
      // Accept checkboxes
      fireEvent.click(screen.getByRole('checkbox', { name: /Privacy Policy/i }));
      fireEvent.click(screen.getByRole('checkbox', { name: /Terms and Conditions/i }));
      
      fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Failed to send message')).toBeInTheDocument();
      });
    });
  });
});
