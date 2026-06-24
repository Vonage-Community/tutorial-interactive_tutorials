import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useRightPanel from '../useRightPanel';

describe('useRightPanel hook', () => {
  it('should initialize with activeTab "closed" and unreadCount 0', () => {
    const { result } = renderHook(() => useRightPanel());

    expect(result.current.rightPanelState.activeTab).toBe('closed');
    expect(result.current.rightPanelState.unreadCount).toBe(0);
  });

  it('should toggle participant list visibility', () => {
    const { result } = renderHook(() => useRightPanel());

    act(() => {
      result.current.toggleParticipantList();
    });

    expect(result.current.rightPanelState.activeTab).toBe('participant-list');

    act(() => {
      result.current.toggleParticipantList();
    });

    expect(result.current.rightPanelState.activeTab).toBe('closed');
  });

  it('should toggle chat visibility and reset unreadCount', () => {
    const { result } = renderHook(() => useRightPanel());

    act(() => {
      result.current.toggleChat();
    });

    expect(result.current.rightPanelState.activeTab).toBe('chat');
    expect(result.current.rightPanelState.unreadCount).toBe(0);

    act(() => {
      result.current.incrementUnreadCount();
    });

    expect(result.current.rightPanelState.unreadCount).toBe(0);
  });

  it('should increment unreadCount when activeTab is not "chat"', () => {
    const { result } = renderHook(() => useRightPanel());

    act(() => {
      result.current.incrementUnreadCount();
    });

    expect(result.current.rightPanelState.unreadCount).toBe(1);

    act(() => {
      result.current.incrementUnreadCount();
    });

    expect(result.current.rightPanelState.unreadCount).toBe(2);
  });

  it('should close the right panel', () => {
    const { result } = renderHook(() => useRightPanel());

    act(() => {
      result.current.toggleChat();
    });

    expect(result.current.rightPanelState.activeTab).toBe('chat');

    act(() => {
      result.current.closeRightPanel();
    });

    expect(result.current.rightPanelState.activeTab).toBe('closed');
  });

  it('should toggle report issue tab visibility', () => {
    const { result } = renderHook(() => useRightPanel());

    act(() => {
      result.current.toggleReportIssue();
    });

    expect(result.current.rightPanelState.activeTab).toBe('issues');

    act(() => {
      result.current.toggleReportIssue();
    });

    expect(result.current.rightPanelState.activeTab).toBe('closed');
  });
});
