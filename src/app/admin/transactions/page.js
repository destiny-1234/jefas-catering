'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

const PAGE_SIZE = 10

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfWeek(d) {
  const x = startOfDay(d)
  const day = x.getDay()
  x.setDate(x.getDate() - day)
  return x
}
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1)
}

export default function AdminTransactions() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/admin/login')
        return
      }
      setChecking(false)
      fetchOrders()
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function fetchOrders() {
    setLoading(true)
    // Fetch ALL paid, non-hidden orders so revenue totals are accurate — pagination is only applied to the display table below
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid')
      .eq('admin_hidden', false)
      .order('created_at', { ascending: false })
    if (!error) setOrders(data)
    setLoading(false)
  }

  if (checking || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    )
  }

  const now = new Date()
  const dayStart = startOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)
  const yearStart = startOfYear(now)

  const sumSince = (since) =>
    orders
      .filter((o) => new Date(o.created_at) >= since)
      .reduce((sum, o) => sum + Number(o.total), 0)

  const dailyRevenue = sumSince(dayStart)
  const weeklyRevenue = sumSince(weekStart)
  const monthlyRevenue = sumSince(monthStart)
  const yearlyRevenue = sumSince(yearStart)
  const allTimeRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)

  // Per-customer breakdown
  const customerTotals = {}
  orders.forEach((o) => {
    const key = o.customer_email || 'Unknown'
    if (!customerTotals[key]) {
      customerTotals[key] = { name: o.customer_name, email: key, total: 0, orders: 0 }
    }
    customerTotals[key].total += Number(o.total)
    customerTotals[key].orders += 1
  })
  const customerList = Object.values(customerTotals).sort((a, b) => b.total - a.total)

  const totalPages = Math.max(1, Math.ceil(customerList.length / PAGE_SIZE))
  const pagedCustomers = customerList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
  }

  const statCards = [
    { label: 'Today', value: dailyRevenue },
    { label: 'This Week', value: weeklyRevenue },
    { label: 'This Month', value: monthlyRevenue },
    { label: 'This Year', value: yearlyRevenue },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/admin" className="text-sm text-red-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
          Transactions
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Revenue from paid shop orders — {orders.length} total transaction{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Revenue Stat Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="border border-gray-200 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">
              ₦{stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-14 text-center">
        <p className="text-red-700 text-sm font-medium mb-1">All-Time Revenue</p>
        <p className="text-3xl font-bold text-red-700">₦{allTimeRevenue.toLocaleString()}</p>
      </div>

      {/* Per-Customer Breakdown */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Revenue by Customer
      </h2>
      {customerList.length === 0 ? (
        <p className="text-gray-500">No paid transactions yet.</p>
      ) : (
        <>
          <div className="border border-gray-200 rounded-2xl overflow-x-auto mb-8">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium text-right">Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {pagedCustomers.map((c) => (
                  <tr key={c.email} className="border-t border-gray-100">
                    <td className="px-5 py-4 text-gray-900">{c.name || '—'}</td>
                    <td className="px-5 py-4 text-gray-600">{c.email}</td>
                    <td className="px-5 py-4 text-gray-600">{c.orders}</td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">
                      ₦{c.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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