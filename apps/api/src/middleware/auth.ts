import { Request, Response, NextFunction } from 'express'
import * as admin from 'firebase-admin'
import { PrismaClient } from '@prisma/client'
import { ApiResponse, ApiError } from '@myapp/shared'

export interface AuthenticatedRequest extends Request {
  uid: string
  email: string
}

export function createAuthMiddleware(db: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      const error: ApiError = {
        code: 'AUTH_MISSING',
        message: 'Missing authorization header',
        status: 401,
      }
      return res.status(401).json({ data: null, error })
    }

    const token = authHeader.slice(7)
    try {
      const decoded = await admin.auth().verifyIdToken(token)
      const uid = decoded.uid
      const email = decoded.email || ''

      if (!email) {
        const error: ApiError = {
          code: 'AUTH_INVALID',
          message: 'Token missing email claim',
          status: 401,
        }
        return res.status(401).json({ data: null, error })
      }

      // Upsert user on first login
      await db.user.upsert({
        where: { id: uid },
        update: {},
        create: {
          id: uid,
          email,
          displayName: decoded.name || null,
        },
      })

      // Attach to request for downstream handlers
      ;(req as AuthenticatedRequest).uid = uid
      ;(req as AuthenticatedRequest).email = email

      next()
    } catch (err) {
      const error: ApiError = {
        code: 'AUTH_INVALID',
        message: 'Invalid or expired token',
        status: 401,
      }
      return res.status(401).json({ data: null, error })
    }
  }
}
