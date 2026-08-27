export const API_ROUTES = {
  users: {
    me: { method: 'GET', path: '/api/users/me' },
    update: { method: 'PUT', path: '/api/users/me' },
  },
  chat: {
    rooms: { method: 'GET', path: '/api/chat/rooms' },
    messages: { method: 'GET', path: '/api/chat/rooms/:id/messages' },
    send: { method: 'POST', path: '/api/chat/rooms/:id/messages' },
  },
} as const
