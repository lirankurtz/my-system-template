import { createUsersRouter } from '../routes/users.js'
import { createChatRouter } from '../routes/chat.js'

// Basic smoke tests to verify routes are exported correctly
console.log('Testing users router...')
if (typeof createUsersRouter !== 'function') {
  throw new Error('createUsersRouter should be a function')
}

console.log('Testing chat router...')
if (typeof createChatRouter !== 'function') {
  throw new Error('createChatRouter should be a function')
}

console.log('✓ All tests passed!')
