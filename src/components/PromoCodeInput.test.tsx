import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromoCodeInput from './PromoCodeInput';

// Mock fetch
global.fetch = vi.fn();

describe('PromoCodeInput', () => {
  const mockOnChange = vi.fn();
  const mockOnValidation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    // Mock feature flag
    process.env.NEXT_PUBLIC_ENABLE_PROMO_CODES = 'true';
  });

  it('renders nothing when feature flag is disabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_PROMO_CODES = 'false';
    const { container } = render(
      <PromoCodeInput
        value=""
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders input when feature flag is enabled', () => {
    process.env.NEXT_PUBLIC_ENABLE_PROMO_CODES = 'true';
    render(
      <PromoCodeInput
        value=""
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    );

    expect(screen.getByLabelText(/promo code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter promo code/i)).toBeInTheDocument();
  });

  it('converts input to uppercase and removes invalid characters', async () => {
    const user = userEvent.setup();
    render(
      <PromoCodeInput
        value=""
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    );

    const input = screen.getByLabelText(/promo code/i) as HTMLInputElement;
    await user.type(input, 'test-123!@#');

    // Check that onChange was called with uppercase, alphanumeric only
    expect(mockOnChange).toHaveBeenCalled();
    const calls = mockOnChange.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toBe('TEST123');
  });

  it('validates code when length >= 3', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    render(
      <PromoCodeInput
        value=""
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    );

    const input = screen.getByLabelText(/promo code/i);
    await user.type(input, 'TEST');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/promo-codes/validate?code=TEST')
      );
    });
  });

  it('shows error message when provided', () => {
    render(
      <PromoCodeInput
        value="INVALID"
        onChange={mockOnChange}
        onValidation={mockOnValidation}
        error="Invalid promo code"
      />
    );

    expect(screen.getByText(/invalid promo code/i)).toBeInTheDocument();
  });

  it('shows success message when code is valid', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    render(
      <PromoCodeInput
        value="TEST"
        onChange={mockOnChange}
        onValidation={mockOnValidation}
      />
    );

    // Wait for validation to complete
    await waitFor(() => {
      expect(mockOnValidation).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Check if success message appears
    await waitFor(() => {
      expect(screen.getByText(/✓ promo code applied/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

