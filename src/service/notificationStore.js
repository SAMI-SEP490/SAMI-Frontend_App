import { create } from 'zustand';
import { getMyNotifications } from './api/notification';

export const useNotificationStore = create((set, get) => ({
  unreadCount: 0,
  
  // Set count manually
  setUnreadCount: (count) => set({ unreadCount: count }),

  // Decrease count (e.g. when reading one)
  decreaseCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  // Mark all as read (reset to 0)
  markAllAsReadLocal: () => set({ unreadCount: 0 }),

  // Fetch from API
  fetchUnreadCount: async () => {
    try {
      const res = await getMyNotifications();
      const list = res || []; 
      // Count items where is_read is false/0/null
      const unread = list.filter(n => !n.is_read).length;
      set({ unreadCount: unread });
    } catch (error) {
      console.log('Failed to fetch unread count', error);
    }
  }
}));
