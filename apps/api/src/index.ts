import express from 'express'
import * as admin from 'firebase-admin'
import { PrismaClient } from '@prisma/client'
import { ApiResponse, ApiError } from '@myapp/shared'
import { createAuthMiddleware } from './middleware/auth.js'
import { createUsersRouter } from './routes/users.js'
import { createChatRouter } from './routes/chat.js'

const app = express()
const db = new PrismaClient()
const PORT = process.env.PORT || 8080

// Initialize Firebase Admin
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
}

if (!firebaseConfig.projectId || !firebaseConfig.privateKey || !firebaseConfig.clientEmail) {
  console.error('Missing Firebase credentials in environment variables')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig as any),
})

// Middleware
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Auth middleware for all API routes
app.use('/api', createAuthMiddleware(db))

// Routes
app.use('/api/users', createUsersRouter(db))
app.use('/api/chat', createChatRouter(db))

// 404 handler
app.use((req, res) => {
  const error: ApiError = {
    code: 'NOT_FOUND',
    message: 'Endpoint not found',
    status: 404,
  }
  res.status(404).json({ data: null, error })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  const error: ApiError = {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    status: 500,
  }
  res.status(500).json({ data: null, error })
})

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await db.$disconnect()
  process.exit(0)
})
