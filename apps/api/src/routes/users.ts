import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { ApiResponse, ApiError } from '@myapp/shared'
import { AuthenticatedRequest } from '../middleware/auth.js'

export function createUsersRouter(db: PrismaClient) {
  const router = Router()

  // GET /api/users/me
  router.get('/me', async (req, res) => {
    try {
      const authReq = req as unknown as AuthenticatedRequest
      const user = await db.user.findUnique({
        where: { id: authReq.uid },
      })

      if (!user) {
        const error: ApiError = {
          code: 'NOT_FOUND',
          message: 'User not found',
          status: 404,
        }
        return res.status(404).json({ data: null, error })
      }

      const response: ApiResponse<any> = {
        data: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt.toISOString(),
        },
        error: null,
      }
      res.json(response)
    } catch (err) {
      const error: ApiError = {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user',
        status: 500,
      }
      res.status(500).json({ data: null, error })
    }
  })

  // PUT /api/users/me
  router.put('/me', async (req, res) => {
    try {
      const authReq = req as unknown as AuthenticatedRequest
      const { displayName } = req.body

      if (typeof displayName !== 'string' && displayName !== null) {
        const error: ApiError = {
          code: 'INVALID_INPUT',
          message: 'displayName must be a string or null',
          status: 400,
        }
        return res.status(400).json({ data: null, error })
      }

      const updated = await db.user.update({
        where: { id: authReq.uid },
        data: { displayName },
      })

      const response: ApiResponse<any> = {
        data: {
          id: updated.id,
          email: updated.email,
          displayName: updated.displayName,
          createdAt: updated.createdAt.toISOString(),
        },
        error: null,
      }
      res.json(response)
    } catch (err) {
      const error: ApiError = {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user',
        status: 500,
      }
      res.status(500).json({ data: null, error })
    }
  })

  return router
}
