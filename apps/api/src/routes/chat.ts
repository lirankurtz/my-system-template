import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { ApiResponse, ApiError } from '@myapp/shared'
import { AuthenticatedRequest } from '../middleware/auth.js'

export function createChatRouter(db: PrismaClient) {
  const router = Router()

  // GET /api/chat/rooms
  router.get('/rooms', async (req, res) => {
    try {
      const authReq = req as unknown as AuthenticatedRequest
      const rooms = await db.room.findMany({
        where: {
          members: {
            some: { userId: authReq.uid },
          },
        },
        include: {
          members: true,
        },
      })

      const response: ApiResponse<any[]> = {
        data: rooms.map((room) => ({
          id: room.id,
          name: room.name,
          createdAt: room.createdAt.toISOString(),
          memberCount: room.members.length,
        })),
        error: null,
      }
      res.json(response)
    } catch (err) {
      const error: ApiError = {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch rooms',
        status: 500,
      }
      res.status(500).json({ data: null, error })
    }
  })

  // GET /api/chat/rooms/:id/messages
  router.get('/rooms/:id/messages', async (req, res) => {
    try {
      const authReq = req as unknown as AuthenticatedRequest
      const { id } = req.params

      // Check if user is a member of the room
      const membership = await db.roomMember.findUnique({
        where: { userId_roomId: { userId: authReq.uid, roomId: id } },
      })

      if (!membership) {
        const error: ApiError = {
          code: 'FORBIDDEN',
          message: 'Not a member of this room',
          status: 403,
        }
        return res.status(403).json({ data: null, error })
      }

      const messages = await db.message.findMany({
        where: { roomId: id },
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      })

      const response: ApiResponse<any[]> = {
        data: messages.map((msg) => ({
          id: msg.id,
          roomId: msg.roomId,
          userId: msg.userId,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
          user: {
            id: msg.user.id,
            email: msg.user.email,
            displayName: msg.user.displayName,
          },
        })),
        error: null,
      }
      res.json(response)
    } catch (err) {
      const error: ApiError = {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch messages',
        status: 500,
      }
      res.status(500).json({ data: null, error })
    }
  })

  // POST /api/chat/rooms/:id/messages
  router.post('/rooms/:id/messages', async (req, res) => {
    try {
      const authReq = req as unknown as AuthenticatedRequest
      const { id } = req.params
      const { content } = req.body

      if (!content || typeof content !== 'string') {
        const error: ApiError = {
          code: 'INVALID_INPUT',
          message: 'content is required and must be a string',
          status: 400,
        }
        return res.status(400).json({ data: null, error })
      }

      // Check if user is a member of the room
      const membership = await db.roomMember.findUnique({
        where: { userId_roomId: { userId: authReq.uid, roomId: id } },
      })

      if (!membership) {
        const error: ApiError = {
          code: 'FORBIDDEN',
          message: 'Not a member of this room',
          status: 403,
        }
        return res.status(403).json({ data: null, error })
      }

      const message = await db.message.create({
        data: {
          roomId: id,
          userId: authReq.uid,
          content,
        },
        include: { user: true },
      })

      const response: ApiResponse<any> = {
        data: {
          id: message.id,
          roomId: message.roomId,
          userId: message.userId,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          user: {
            id: message.user.id,
            email: message.user.email,
            displayName: message.user.displayName,
          },
        },
        error: null,
      }
      res.status(201).json(response)
    } catch (err) {
      const error: ApiError = {
        code: 'INTERNAL_ERROR',
        message: 'Failed to send message',
        status: 500,
      }
      res.status(500).json({ data: null, error })
    }
  })

  return router
}
