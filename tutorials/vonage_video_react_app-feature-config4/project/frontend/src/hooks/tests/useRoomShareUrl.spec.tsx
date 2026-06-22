import { renderHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi, vitest, Mock } from 'vitest';
import { useNavigate, useLocation } from 'react-router-dom';
import useRoomShareUrl from '../useRoomShareUrl';

const mockedParams = { roomName: 'test-room-name' };
const mockNavigate = vi.fn();

vitest.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useParams: () => mockedParams,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
  };
});

describe('useRoomShareUrl', () => {
  beforeAll(() => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      origin: 'https://example.com',
    } as unknown as Location);
  });
  it('should return link to waiting room', () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useLocation as Mock).mockReturnValue({
      state: mockedParams,
    });
    const hook = renderHook(() => useRoomShareUrl());
    expect(hook.result.current).toBe('https://example.com/waiting-room/test-room-name');
  });
});
