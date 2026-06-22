import { renderHook } from '@testing-library/react';
import { useLocation, useParams } from 'react-router-dom';
import { describe, it, expect, vi, Mock } from 'vitest';
import useRoomName from '../useRoomName';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useLocation: vi.fn(),
}));

describe('useRoomName', () => {
  it('returns the room name from URL params when useLocationState is false', () => {
    (useParams as Mock).mockReturnValue(mockedRoomName);
    const { result } = renderHook(() => useRoomName({ useLocationState: false }));

    expect(result.current).toBe('test-room-name');
  });

  it('returns the room name from URL params when useLocationState is not provided which is a default behavior', () => {
    (useParams as Mock).mockReturnValue(mockedRoomName);
    const { result } = renderHook(() => useRoomName());

    expect(result.current).toBe('test-room-name');
  });

  it('returns the room name from location.state when useLocationState is set to true', () => {
    (useLocation as Mock).mockReturnValue({ state: { roomName: 'StateRoom' } });

    const { result } = renderHook(() => useRoomName({ useLocationState: true }));

    // Notice that the room name returned should be lower case
    expect(result.current).toBe('stateroom');
  });

  it('returns an empty string if both location.state and URL params are undefined', () => {
    (useParams as Mock).mockReturnValue({});
    (useLocation as Mock).mockReturnValue({ state: {} });

    const { result } = renderHook(() => useRoomName({ useLocationState: true }));

    expect(result.current).toBe('');
  });
});
