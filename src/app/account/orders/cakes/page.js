'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabaseClient'

const PAGE_SIZE = 10

export default function MyCakeOrders() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [userId, setUserId] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  async function fetchOrders(uid, pageNum) {
    setLoading(true)
    const from = (pageNum - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('cake_orders')
      .select('*', { count: 'exact' })
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (!error) {
      setOrders(data)
      setTotalCount(count || 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/account/login')
        return
      }
      setUserId(data.user.id)
      setChecking(false)
      fetchOrders(data.user.id, 1)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    fetchOrders(userId, p)
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
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/account/orders" className="text-sm text-red-600 hover:underline">
        ← Back to My Orders
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-2">
        🎂 Cake Orders
      </h1>
      <p className="text-gray-500 text-sm mb-10">{totalCount} request{totalCount !== 1 ? 's' : ''} total</p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-sm">You haven&apos;t requested a custom cake yet.</p>
      ) : (
        <>
          <div className="grid gap-4 mb-8">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {order.flavor || 'Custom Cake'} {order.size ? `— ${order.size}` : ''}
                  </h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Delivery date: {order.delivery_date || 'Not specified'}
                </p>
                {order.message && (
                  <p className="text-sm text-gray-600 mt-2">{order.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Submitted {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

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
        </>
      )}
    </div>
  )
}