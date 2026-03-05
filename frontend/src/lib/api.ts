/**
 * Centralized API client with automatic auth token injection and error handling.
 *
 * Usage:
 *   import api from '@/lib/api';
 *   const { data } = await api.post('/chat', { message: 'Hello' });
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── Base URL ──────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: Attach Bearer Token ─────────────────────────
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('chikitsak-access-token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ── Response Interceptor: Standardize Envelope Handling ───────────────
api.interceptors.response.use(
    (response) => {
        // The backend now always returns { status: "success" | "error", data, message, confidence? }
        const envelope = response.data;

        if (envelope && typeof envelope === 'object' && 'status' in envelope) {
            if (envelope.status === 'error') {
                // If the backend sent an "error" status, treat it as a rejection
                return Promise.reject({
                    response: {
                        status: response.status,
                        data: envelope
                    }
                });
            }
            // For success, we return the whole envelope to the caller so they can access data/confidence/message
            return response;
        }
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('chikitsak-access-token');
                localStorage.removeItem('chikitsak-refresh-token');
                localStorage.removeItem('chikitsak-profile');

                // Redirect to login with current path for return-to
                const currentPath = window.location.pathname;
                if (!currentPath.startsWith('/login') && !currentPath.startsWith('/signup')) {
                    // Force a hard redirect to clear state and ensure clean login
                    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                }
            }
        }
        return Promise.reject(error);
    },
);

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Extract a user-friendly error message from an Axios error.
 */
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        // Backend may send { detail: "..." } or { message: "..." }
        if (data?.detail) return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        if (data?.message) return data.message;
        if (data?.error) return data.error;
        if (error.response?.status === 401) return 'Session expired. Please log in again.';
        if (error.response?.status === 403) return 'You do not have permission to perform this action.';
        if (error.response?.status === 404) return 'The requested resource was not found.';
        if (error.response?.status === 409) return 'This resource already exists.';
        if (error.response?.status === 422) return 'Please check your input and try again.';
        if (error.response?.status === 500) return 'Server error. Please try again later.';
        if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.';
        if (!error.response) return 'Cannot connect to the server. Please make sure the backend is running.';
        return `Error (${error.response.status}): ${error.response.statusText}`;
    }
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred.';
}

/**
 * Post a multipart/form-data request (e.g., file uploads).
 */
export async function postFormData<T = unknown>(url: string, formData: FormData) {
    return api.post<T>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}

export default api;
