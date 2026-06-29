import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormSubmitted from './FormSubmitted';

describe('FormSubmitted', () => {
  it('should display a success message with the ticket number and track progress link', () => {
    // Mock the handleCloseFormSubmitted function
    const mockHandleClose = vi.fn();

    const mockTicketResponse = {
      message: 'Your issue has been submitted successfully!',
      ticketUrl: 'http://example.com',
    };

    // Render the component with mock props
    render(
      <FormSubmitted
        handleCloseFormSubmitted={mockHandleClose}
        ticketResponse={mockTicketResponse}
      />
    );

    // Check if the success message and ticket number are displayed
    expect(screen.queryByTestId('thank-you-text')).toBeInTheDocument();
    expect(screen.queryByTestId('track-progress-text')).toBeInTheDocument();

    // Check if the link is correct
    const link = screen.queryByTestId('track-progress-text');
    expect(link).toHaveAttribute('href', mockTicketResponse.ticketUrl);
  });

  it('should display an error message when there is no ticket number', () => {
    // Mock the handleCloseFormSubmitted function
    const mockHandleClose = vi.fn();

    const mockTicketResponse = {
      message: 'There was an error submitting your feedback.',
      ticketUrl: '',
    };

    // Render the component with mock props
    render(
      <FormSubmitted
        handleCloseFormSubmitted={mockHandleClose}
        ticketResponse={mockTicketResponse}
      />
    );

    // Check if the error message is displayed
    expect(screen.queryByTestId('error-text')).toBeInTheDocument();
  });
});
