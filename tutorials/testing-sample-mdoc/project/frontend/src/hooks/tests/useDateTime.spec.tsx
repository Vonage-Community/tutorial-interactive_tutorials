import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useDateTime from '../useDateTime';

describe('useDateTime', () => {
  it('converts 21:12 to "9:12 PM"', () => {
    const rawDate = new Date('June 27, 2024 21:12:00');
    vi.setSystemTime(rawDate);
    const { result } = renderHook(() => useDateTime());

    expect(result.current.time).toBe('9:12 PM');
  });

  it('converts 0:15 to "12:15 AM"', () => {
    const rawDate = new Date('June 27, 2024 0:15:00');
    vi.setSystemTime(rawDate);
    const { result } = renderHook(() => useDateTime());

    expect(result.current.time).toBe('12:15 AM');
  });

  it('uses the correct date format', () => {
    const rawDate = new Date('June 27, 2024 03:24:00');
    vi.setSystemTime(rawDate);
    const { result } = renderHook(() => useDateTime());

    expect(result.current.date).toBe('Thu, Jun 27');
  });
});
