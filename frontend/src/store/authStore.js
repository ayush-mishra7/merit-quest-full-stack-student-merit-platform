import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const auth = data.data;
          set({
            user: {
              id: auth.userId,
              email: auth.email,
              firstName: auth.firstName,
              lastName: auth.lastName,
              role: auth.role,
              institutionId: auth.institutionId,
              studentId: auth.studentId,
            },
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message =
            error.response?.data?.message || 'Login failed. Please try again.';
          return { success: false, message };
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', payload);
          const auth = data.data;
          set({
            user: {
              id: auth.userId,
              email: auth.email,
              firstName: auth.firstName,
              lastName: auth.lastName,
              role: auth.role,
              institutionId: auth.institutionId,
              studentId: auth.studentId,
            },
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const message =
            error.response?.data?.message || 'Registration failed.';
          return { success: false, message };
        }
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          const u = data.data;
          set({
            user: {
              id: u.userId,
              email: u.email,
              firstName: u.firstName,
              lastName: u.lastName,
              role: u.role,
              institutionId: u.institutionId,
              studentId: u.studentId,
            },
          });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'mq-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
