'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/admin/login')
      } else {
        setUser(data.user)
        setChecking(false)
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Checking access...</p>
      </div>
    )
  }

  const sections = [
    { href: '/admin/products', icon: '🛒', title: 'Shop Products', desc: 'Add, edit, or remove baking supplies' },
    { href: '/admin/cakes', icon: '🎂', title: 'Cake Gallery', desc: 'Manage custom cake designs' },
    { href: '/admin/events', icon: '🎉', title: 'Event Services', desc: 'Manage event packages' },
    { href: '/admin/cake-orders', icon: '📋', title: 'Cake Order Requests', desc: 'View customer cake requests' },
    { href: '/admin/event-bookings', icon: '📅', title: 'Event Bookings', desc: 'View event booking requests' },
    { href: '/admin/messages', icon: '✉️', title: 'Contact Messages', desc: 'View messages from customers' },
    { href: '/admin/users', icon: '👤', title: 'Customer Accounts', desc: 'View and manage registered customers' },
    { href: '/admin/delivery-zones', icon: '🚚', title: 'Delivery Zones', desc: 'Set delivery fees by area' },
    { href: '/admin/shop-orders', icon: '🛒', title: 'Shop Orders', desc: 'View and manage customer purchases' },
{ href: '/admin/transactions', icon: '💰', title: 'Transactions', desc: 'Revenue by day, week, month, year' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Logged in as {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-full transition"
        >
          Log Out
        </button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-red-200 transition"
          >
            <div className="text-3xl mb-3">{section.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{section.title}</h3>
            <p className="text-gray-500 text-sm">{section.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}