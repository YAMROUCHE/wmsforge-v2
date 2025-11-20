import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import {
  NotificationProvider,
  useNotifications,
  type NotificationType,
} from './NotificationContext';

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  describe('useNotifications hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useNotifications());
      }).toThrow('useNotifications must be used within a NotificationProvider');

      console.error = originalError;
    });

    it('should provide initial state', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('addNotification', () => {
    it('should add a notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'success',
          title: 'Success',
          message: 'Operation completed',
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toMatchObject({
        type: 'success',
        title: 'Success',
        message: 'Operation completed',
        read: false,
      });
      expect(result.current.notifications[0].id).toBeTruthy();
      expect(result.current.notifications[0].timestamp).toBeInstanceOf(Date);
    });

    it('should add multiple notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'success',
          title: 'First',
          message: 'Message 1',
        });
        result.current.addNotification({
          type: 'error',
          title: 'Second',
          message: 'Message 2',
        });
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications[0].title).toBe('Second'); // Most recent first
      expect(result.current.notifications[1].title).toBe('First');
    });

    it('should generate unique IDs for each notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'First',
          message: 'Message 1',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Second',
          message: 'Message 2',
        });
      });

      const id1 = result.current.notifications[0].id;
      const id2 = result.current.notifications[1].id;

      expect(id1).not.toBe(id2);
    });

    it('should auto-remove notification after 10 seconds', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Auto-remove',
          message: 'Will be removed',
        });
      });

      expect(result.current.notifications).toHaveLength(1);

      // Fast-forward 10 seconds
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('should support notification with action', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      const actionCallback = vi.fn();

      act(() => {
        result.current.addNotification({
          type: 'warning',
          title: 'Warning',
          message: 'Action required',
          action: {
            label: 'Undo',
            onClick: actionCallback,
          },
        });
      });

      expect(result.current.notifications[0].action).toBeDefined();
      expect(result.current.notifications[0].action?.label).toBe('Undo');

      // Test action callback
      act(() => {
        result.current.notifications[0].action?.onClick();
      });

      expect(actionCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Unread',
          message: 'Mark me as read',
        });
      });

      const notificationId = result.current.notifications[0].id;
      expect(result.current.notifications[0].read).toBe(false);
      expect(result.current.unreadCount).toBe(1);

      act(() => {
        result.current.markAsRead(notificationId);
      });

      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it('should not affect other notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'First',
          message: 'Message 1',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Second',
          message: 'Message 2',
        });
      });

      const firstId = result.current.notifications[1].id;

      act(() => {
        result.current.markAsRead(firstId);
      });

      expect(result.current.notifications[1].read).toBe(true);
      expect(result.current.notifications[0].read).toBe(false);
      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'First',
          message: 'Message 1',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Second',
          message: 'Message 2',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Third',
          message: 'Message 3',
        });
      });

      expect(result.current.unreadCount).toBe(3);

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications.every((n) => n.read)).toBe(true);
    });

    it('should work with empty notification list', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('removeNotification', () => {
    it('should remove a specific notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'First',
          message: 'Message 1',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Second',
          message: 'Message 2',
        });
      });

      expect(result.current.notifications).toHaveLength(2);

      const firstId = result.current.notifications[1].id;

      act(() => {
        result.current.removeNotification(firstId);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Second');
    });

    it('should update unread count when removing unread notification', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'Unread',
          message: 'Will be removed',
        });
      });

      expect(result.current.unreadCount).toBe(1);

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.removeNotification(notificationId);
      });

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('clearAll', () => {
    it('should clear all notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'First',
          message: 'Message 1',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Second',
          message: 'Message 2',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Third',
          message: 'Message 3',
        });
      });

      expect(result.current.notifications).toHaveLength(3);

      act(() => {
        result.current.clearAll();
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('unreadCount', () => {
    it('should correctly count unread notifications', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.addNotification({
          type: 'info',
          title: 'First',
          message: 'Message 1',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Second',
          message: 'Message 2',
        });
        result.current.addNotification({
          type: 'info',
          title: 'Third',
          message: 'Message 3',
        });
      });

      expect(result.current.unreadCount).toBe(3);

      act(() => {
        result.current.markAsRead(result.current.notifications[0].id);
      });

      expect(result.current.unreadCount).toBe(2);

      act(() => {
        result.current.markAsRead(result.current.notifications[1].id);
      });

      expect(result.current.unreadCount).toBe(1);
    });
  });

  describe('notification types', () => {
    const types: NotificationType[] = ['success', 'error', 'warning', 'info'];

    types.forEach((type) => {
      it(`should handle ${type} notification type`, () => {
        const { result } = renderHook(() => useNotifications(), { wrapper });

        act(() => {
          result.current.addNotification({
            type,
            title: `${type} title`,
            message: `${type} message`,
          });
        });

        expect(result.current.notifications[0].type).toBe(type);
      });
    });
  });
});
