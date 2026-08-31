import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { User } from '@myapp/shared'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await api.users.getMe()
      if (response.error) {
        setError(response.error.message)
      } else {
        setProfile(response.data as User | null)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '20px', padding: '10px', background: '#ffe0e0', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {profile ? (
        <div style={{ marginBottom: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          <h2>Profile</h2>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Display Name:</strong> {profile.displayName || 'Not set'}</p>
          <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      ) : (
        <div style={{ color: '#666' }}>Profile data not available</div>
      )}

      <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h2>Chat</h2>
        <p style={{ color: '#666' }}>Chat functionality coming soon...</p>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
        <p>Current User: {user?.email}</p>
        <p>API Base: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}</p>
      </div>
    </div>
  )
}
