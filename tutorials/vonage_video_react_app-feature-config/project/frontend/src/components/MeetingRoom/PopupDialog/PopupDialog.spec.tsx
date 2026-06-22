import { describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PopupDialog, { DialogProps, DialogTexts } from './PopupDialog';

describe('PopupDialog', () => {
  const mockHandleClose = vi.fn();
  const mockHandleActionClick = vi.fn();

  const mockDialogText: DialogTexts = {
    title: 'Confirmation',
    contents: 'Are you sure you want to proceed?',
    primaryActionText: 'Confirm',
    secondaryActionText: 'Cancel',
  };

  const defaultProps: DialogProps = {
    isOpen: true,
    handleClose: mockHandleClose,
    handleActionClick: mockHandleActionClick,
    actionText: mockDialogText,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog with the correct text', () => {
    render(<PopupDialog {...defaultProps} />);
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render the dialog if it has not been opened', () => {
    render(<PopupDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Confirmation')).not.toBeInTheDocument();
  });

  it('auto-focuses the Confirm button', () => {
    render(<PopupDialog {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toHaveFocus();
  });

  it('closes the component when the Cancel button is clicked', () => {
    render(<PopupDialog {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('executes the primary action when the Confirm button is clicked', () => {
    render(<PopupDialog {...defaultProps} />);

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    expect(mockHandleActionClick).toHaveBeenCalledTimes(1);
  });
});
