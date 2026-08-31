import { initializeApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'DEMO_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
}

let auth: Auth

try {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
} catch (error) {
  console.error('Firebase initialization error:', error)
  throw new Error(
    'Firebase config missing. Set VITE_FIREBASE_* env vars in .env'
  )
}

export { auth }
