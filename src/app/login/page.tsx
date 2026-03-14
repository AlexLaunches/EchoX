'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: '#111', border: '1px solid #222',
        borderRadius: 12, padding: 40, width: '100%', maxWidth: 400
      }}>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>EchoX</h1>
        <p style={{ color: '#555', marginBottom: 32, fontSize: 14 }}>Sign in to your dashboard</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', backgroundColor: '#1a1a1a', color: '#fff',
              border: '1px solid #333', borderRadius: 8, padding: '10px 14px',
              fontSize: 14, boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ color: '#888', fontSize: 13, display: 'block', marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', backgroundColor: '#1a1a1a', color: '#fff',
              border: '1px solid #333', borderRadius: 8, padding: '10px 14px',
              fontSize: 14, boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', backgroundColor: '#1d9bf0', color: '#fff',
            border: 'none', borderRadius: 8, padding: '12px',
            fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  )
}
