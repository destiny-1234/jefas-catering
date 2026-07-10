'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setResetError('Something went wrong. Please try again.')
    } else {
      setResetSent(true)
    }
    setResetLoading(false)
  }

  if (showForgot) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full bg-gray-50 rounded-3xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Reset Password
          </h1>
          <p className="text-gray-500 text-center mb-8 text-sm">
            Enter your admin email and we&apos;ll send you a reset link.
          </p>

          {resetSent ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-gray-700 font-medium">Check your email!</p>
              <p className="text-gray-500 text-sm mt-1">
                We&apos;ve sent a password reset link to {resetEmail}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="grid gap-5">
              <input
                type="email"
                required
                placeholder="Your admin email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
              <button
                type="submit"
                disabled={resetLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <button
            onClick={() => {
              setShowForgot(false)
              setResetSent(false)
              setResetError(null)
            }}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-6"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full bg-gray-50 rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Admin Login
        </h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Jefas Catering & Events — Management Dashboard
        </p>

        <form onSubmit={handleLogin} className="grid gap-5">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <button
          onClick={() => setShowForgot(true)}
          className="w-full text-center text-sm text-red-600 hover:underline mt-4"
        >
          Forgot password?
        </button>
      </div>
    </div>
  )
}