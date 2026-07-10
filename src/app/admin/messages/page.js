'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

const PAGE_SIZE = 10

export default function AdminMessages() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  async function fetchMessages(pageNum) {
    setLoading(true)
    const from = (pageNum - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .eq('admin_hidden', false)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!error) {
      setMessages(data)
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
      fetchMessages(1)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    fetchMessages(p)
  }

  const handleSoftDelete = async (id) => {
    if (!confirm('Remove this message from your dashboard?')) return
    const { error } = await supabase.from('contact_messages').update({ admin_hidden: true }).eq('id', id)
    if (!error) fetchMessages(page)
  }

  const handlePermanentDelete = async (id) => {
    if (!confirm('Permanently delete this message? This cannot be undone.')) return
    const { error } = await supabase.from('contact_messages').delete().eq('id', id)
    if (!error) fetchMessages(page)
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Checking access...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/admin" className="text-sm text-red-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
          Contact Messages
        </h1>
        <p className="text-gray-500 text-sm mt-1">{totalCount} total message{totalCount !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-2xl">
          <div className="text-4xl mb-4">✉️</div>
          <p className="text-gray-500">No messages yet.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 mb-8">
            {messages.map((msg) => (
              <div key={msg.id} className="border border-gray-200 rounded-2xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{msg.name}</h3>
                    <p className="text-sm text-gray-500">
                      {msg.email}
                      {msg.phone ? ` · ${msg.phone}` : ''}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>

                {msg.subject && (
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    Subject: {msg.subject}
                  </p>
                )}

                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mb-4">
                  {msg.message}
                </p>

                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => handleSoftDelete(msg.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                  >
                    🗂 Delete (hide from dashboard)
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(msg.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    🗑 Permanently Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  )
}