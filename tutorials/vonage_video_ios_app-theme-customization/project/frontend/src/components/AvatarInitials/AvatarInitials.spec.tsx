import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import AvatarInitials from './AvatarInitials';

describe('AvatarInitials', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render initials when given', () => {
    const initials = 'HI';
    render(<AvatarInitials initials={initials} />);

    expect(screen.getByText(initials)).toBeVisible();
    expect(screen.queryByTestId('PersonIcon')).not.toBeInTheDocument();
  });

  it('should render person avatar when no initials', () => {
    render(<AvatarInitials />);

    expect(screen.getByTestId('PersonIcon')).toBeVisible();
  });
});
