'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

export default function MyOrdersDashboard() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({
    shop: { count: 0, total: 0 },
    cakes: { count: 0, total: 0 },
    events: { count: 0, total: 0 },
  })

  async function fetchSummary(userId) {
    setLoading(true)
    const [{ data: shop }, { data: cakes }, { data: events }] = await Promise.all([
      supabase.from('orders').select('total').eq('user_id', userId),
      supabase.from('cake_orders').select('id').eq('user_id', userId),
      supabase.from('event_bookings').select('id').eq('user_id', userId),
    ])

    const shopTotal = (shop || []).reduce((sum, o) => sum + Number(o.total), 0)

    setSummary({
      shop: { count: (shop || []).length, total: shopTotal },
      cakes: { count: (cakes || []).length, total: 0 },
      events: { count: (events || []).length, total: 0 },
    })
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/account/login')
        return
      }
      setUser(data.user)
      setChecking(false)
      fetchSummary(data.user.id)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Checking access...</p>
      </div>
    )
  }

  const cards = [
    {
      href: '/account/orders/shop',
      icon: '🛒',
      title: 'Shop Orders',
      count: summary.shop.count,
      totalLabel: `₦${summary.shop.total.toLocaleString()} spent`,
    },
    {
      href: '/account/orders/cakes',
      icon: '🎂',
      title: 'Cake Orders',
      count: summary.cakes.count,
      totalLabel: `${summary.cakes.count} request${summary.cakes.count !== 1 ? 's' : ''}`,
    },
    {
      href: '/account/orders/events',
      icon: '🎉',
      title: 'Event Bookings',
      count: summary.events.count,
      totalLabel: `${summary.events.count} booking${summary.events.count !== 1 ? 's' : ''}`,
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Logged in as {user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-full transition"
        >
          Log Out
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading your dashboard...</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-red-200 transition"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">{card.count}</p>
              <p className="text-gray-500 text-sm">{card.totalLabel}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}