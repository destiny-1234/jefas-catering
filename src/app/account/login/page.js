'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

const ADMIN_EMAIL = 'jefascatering27@gmail.com'

export default function CustomerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Forgot password flow state
  const [forgotStep, setForgotStep] = useState(null) // null | 'request' | 'verify'
  const [resetEmail, setResetEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (email.trim().toLowerCase() === ADMIN_EMAIL) {
      setError('This email is reserved for admin use. Please use the Admin Login page instead.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    if (data.user?.email?.toLowerCase() === ADMIN_EMAIL) {
      await supabase.auth.signOut()
      setError('This email is reserved for admin use. Please use the Admin Login page instead.')
      setLoading(false)
      return
    }

    router.push('/account/orders')
  }

  const handleRequestCode = async (e) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError(null)

    if (resetEmail.trim().toLowerCase() === ADMIN_EMAIL) {
      setResetError('This email is reserved for admin use. Please use the Admin Login page instead.')
      setResetLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail)

    if (error) {
      setResetError('Something went wrong. Please try again.')
      setResetLoading(false)
      return
    }

    setForgotStep('verify')
    setResetLoading(false)
  }

  const handleVerifyAndReset = async (e) => {
    e.preventDefault()
    setResetError(null)

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.')
      return
    }

    setResetLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: resetEmail,
      token: code,
      type: 'recovery',
    })

    if (verifyError) {
      setResetError('Invalid or expired code. Please request a new one.')
      setResetLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      setResetError(updateError.message)
      setResetLoading(false)
      return
    }

    setResetSuccess(true)
    setResetLoading(false)
    setTimeout(() => {
      setForgotStep(null)
      setResetSuccess(false)
      setResetEmail('')
      setCode('')
      setNewPassword('')
      setConfirmPassword('')
    }, 2500)
  }

  // Forgot password UI
  if (forgotStep) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full bg-gray-50 rounded-3xl p-8">
          {forgotStep === 'request' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Reset Password
              </h1>
              <p className="text-gray-500 text-center mb-8 text-sm">
                Enter your email and we&apos;ll send you a verification code.
              </p>
              <form onSubmit={handleRequestCode} className="grid gap-5">
                <input
                  type="email"
                  required
                  placeholder="Your email"
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
                  {resetLoading ? 'Sending...' : 'Send Code'}
                </button>
              </form>
            </>
          )}

          {forgotStep === 'verify' && (
            resetSuccess ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-700 font-medium">Password updated successfully!</p>
                <p className="text-gray-500 text-sm mt-1">You can now log in with your new password.</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Enter Verification Code
                </h1>
                <p className="text-gray-500 text-center mb-8 text-sm">
                  We sent a 8-digit code to {resetEmail}. Enter it below with your new password.
                </p>
                <form onSubmit={handleVerifyAndReset} className="grid gap-5">
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="8-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-xl tracking-widest"
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />

                  {resetError && <p className="text-red-600 text-sm">{resetError}</p>}

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
                  >
                    {resetLoading ? 'Updating...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )
          )}

          <button
            onClick={() => {
              setForgotStep(null)
              setResetError(null)
              setResetSuccess(false)
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
          Welcome Back
        </h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Log in to view or track your orders.
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
          onClick={() => setForgotStep('request')}
          className="w-full text-center text-sm text-red-600 hover:underline mt-4"
        >
          Forgot password?
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/account/signup" className="text-red-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
