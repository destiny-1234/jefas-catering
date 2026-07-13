'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

export default function AdminNewsletter() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function fetchSubscriberCount() {
    setLoading(true)
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
    if (!error) setSubscriberCount(count || 0)
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/admin/login')
        return
      }
      setChecking(false)
      fetchSubscriberCount()
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!confirm(`Send this email to all ${subscriberCount} subscriber${subscriberCount !== 1 ? 's' : ''}?`)) return

    setSending(true)
    setResult(null)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch('/api/send-newsletter', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, message }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to send newsletter.')
    } else {
      setResult(data)
      setSubject('')
      setMessage('')
    }
    setSending(false)
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Checking access...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/admin" className="text-sm text-red-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
          Newsletter
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading ? 'Loading...' : `${subscriberCount} subscriber${subscriberCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      {subscriberCount === 0 && !loading ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-2xl">
          <div className="text-4xl mb-4">📧</div>
          <p className="text-gray-500">No subscribers yet. Once people sign up via the footer, you can message them here.</p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-3xl p-8">
          <form onSubmit={handleSend} className="grid gap-5">
            <input
              type="text"
              required
              placeholder="Subject (e.g. New cake flavors this week!)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <textarea
              required
              rows={8}
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {result && (
              <p className="text-green-700 text-sm bg-green-50 border border-green-100 rounded-xl p-3">
                Sent to {result.sentCount} of {result.total} subscribers
                {result.failedCount > 0 ? ` (${result.failedCount} failed)` : ''}.
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
            >
              {sending ? 'Sending...' : `Send to ${subscriberCount} Subscriber${subscriberCount !== 1 ? 's' : ''}`}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
