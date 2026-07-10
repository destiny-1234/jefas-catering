'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled']
const PAGE_SIZE = 10

export default function AdminEventBookings() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  async function fetchBookings(pageNum) {
    setLoading(true)
    const from = (pageNum - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('event_bookings')
      .select('*', { count: 'exact' })
      .eq('admin_hidden', false)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!error) {
      setBookings(data)
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
      fetchBookings(1)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    fetchBookings(p)
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('event_bookings').update({ status }).eq('id', id)
    if (!error) fetchBookings(page)
  }

  const handleSoftDelete = async (id) => {
    if (!confirm('Remove this from your dashboard? The customer will still see it in their My Orders.')) return
    const { error } = await supabase.from('event_bookings').update({ admin_hidden: true }).eq('id', id)
    if (!error) fetchBookings(page)
  }

  const handlePermanentDelete = async (id) => {
    if (!confirm('Permanently delete this booking? This removes it everywhere, including the customer\'s My Orders. This cannot be undone.')) return
    const { error } = await supabase.from('event_bookings').delete().eq('id', id)
    if (!error) fetchBookings(page)
  }

  const statusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-gray-200 text-gray-600'
      default: return 'bg-yellow-100 text-yellow-700'
    }
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
          Event Bookings
        </h1>
        <p className="text-gray-500 text-sm mt-1">{totalCount} total booking{totalCount !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-2xl">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-gray-500">No event bookings yet.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 mb-8">
            {bookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-2xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{booking.customer_name}</h3>
                    <p className="text-sm text-gray-500">
                      {booking.customer_phone}
                      {booking.customer_email ? ` · ${booking.customer_email}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Event Type</p>
                    <p className="text-gray-700">{booking.event_type || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Date</p>
                    <p className="text-gray-700">{booking.event_date || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Guests</p>
                    <p className="text-gray-700">{booking.guest_count || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Location</p>
                    <p className="text-gray-700">{booking.location || '—'}</p>
                  </div>
                </div>

                {booking.message && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 mb-4">
                    {booking.message}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(booking.id, status)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                        booking.status === status
                          ? 'bg-red-600 text-white border-red-600'
                          : 'border-gray-300 text-gray-600 hover:border-red-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => handleSoftDelete(booking.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                  >
                    🗂 Delete (hide from dashboard)
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(booking.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition"
                  >
                    🗑 Permanently Delete
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Submitted {new Date(booking.created_at).toLocaleString()}
                </p>
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