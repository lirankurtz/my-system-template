import { auth } from './firebase'
import type { ApiResponse, ApiError } from '@myapp/shared'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const token = await auth.currentUser?.getIdToken()

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = (await response.json()) as ApiResponse<T>

    if (!response.ok && !data.error) {
      const error: ApiError = {
        code: 'UNKNOWN_ERROR',
        message: `HTTP ${response.status}`,
        status: response.status,
      }
      return { data: null, error }
    }

    return data
  } catch (err) {
    const error: ApiError = {
      code: 'NETWORK_ERROR',
      message: err instanceof Error ? err.message : 'Network request failed',
      status: 0,
    }
    return { data: null, error }
  }
}

export const api = {
  users: {
    getMe: () => apiRequest('GET', '/api/users/me'),
    update: (data: unknown) => apiRequest('PUT', '/api/users/me', data),
  },
  chat: {
    getRooms: () => apiRequest('GET', '/api/chat/rooms'),
    getMessages: (roomId: string) =>
      apiRequest('GET', `/api/chat/rooms/${roomId}/messages`),
    sendMessage: (roomId: string, content: string) =>
      apiRequest('POST', `/api/chat/rooms/${roomId}/messages`, { content }),
  },
}
