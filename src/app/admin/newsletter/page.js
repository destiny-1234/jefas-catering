'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

const PAGE_SIZE = 10

export default function AdminNewsletter() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [subscribers, setSubscribers] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  async function fetchSubscribers(pageNum) {
    setLoading(true)
    const from = (pageNum - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!error) {
      setSubscribers(data)
      setTotalCount(count || 0)
    }
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
      fetchSubscribers(1)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    fetchSubscribers(p)
  }

  const toggleOne = (email) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(email)) next.delete(email)
      else next.add(email)
      return next
    })
  }

  const toggleSelectAllOnPage = () => {
    const pageEmails = subscribers.map((s) => s.email)
    const allSelected = pageEmails.every((e) => selected.has(e))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        pageEmails.forEach((e) => next.delete(e))
      } else {
        pageEmails.forEach((e) => next.add(e))
      }
      return next
    })
  }

  const handleDeleteSubscriber = async (email) => {
    if (!confirm(`Remove ${email} from the newsletter list?`)) return
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('email', email)
    if (!error) {
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(email)
        return next
      })
      fetchSubscribers(page)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (selected.size === 0) {
      setError('Select at least one subscriber to send to.')
      return
    }
    if (!confirm(`Send this email to ${selected.size} selected subscriber${selected.size !== 1 ? 's' : ''}?`)) return

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
      body: JSON.stringify({ subject, message, recipients: Array.from(selected) }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to send newsletter.')
    } else {
      setResult(data)
      setSubject('')
      setMessage('')
      setSelected(new Set())
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

  const pageEmails = subscribers.map((s) => s.email)
  const allOnPageSelected = pageEmails.length > 0 && pageEmails.every((e) => selected.has(e))

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/admin" className="text-sm text-red-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
          Newsletter
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount} subscriber{totalCount !== 1 ? 's' : ''} · {selected.size} selected
        </p>
      </div>

      {totalCount === 0 && !loading ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-2xl">
          <div className="text-4xl mb-4">📧</div>
          <p className="text-gray-500">No subscribers yet. Once people sign up via the footer, you can message them here.</p>
        </div>
      ) : (
        <>
          {/* Subscriber List */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Subscribers</h2>
              <button
                onClick={toggleSelectAllOnPage}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                {allOnPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : (
              <div className="border border-gray-200 rounded-2xl overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-500">
                    <tr>
                      <th className="px-4 py-3 w-10"></th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Subscribed</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(sub.email)}
                            onChange={() => toggleOne(sub.email)}
                            className="w-4 h-4 accent-red-600"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-900">{sub.email}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteSubscriber(sub.email)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Compose */}
          <div className="bg-gray-50 rounded-3xl p-8">
            <h2 className="font-semibold text-gray-900 mb-5">Compose Message</h2>
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
                  Sent to {result.sentCount} of {result.total} selected subscribers
                  {result.failedCount > 0 ? ` (${result.failedCount} failed)` : ''}.
                </p>
              )}

              <button
                type="submit"
                disabled={sending || selected.size === 0}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                {sending ? 'Sending...' : `Send to ${selected.size} Selected`}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
