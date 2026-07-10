'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

const PAGE_SIZE = 10

export default function AdminUsers() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  async function fetchUsers(pageNum) {
    setLoading(true)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch(`/api/admin/users?page=${pageNum}&perPage=${PAGE_SIZE}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const result = await res.json()

    if (!res.ok) {
      setError(result.error || 'Failed to load users.')
    } else {
      setUsers(result.users)
      setTotalCount(result.totalCount || 0)
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
      fetchUsers(1)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    fetchUsers(p)
  }

  const handleDelete = async (userId, email) => {
    if (!confirm(`Delete account for ${email}? This cannot be undone.`)) return

    setDeletingId(userId)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (res.ok) {
      fetchUsers(page)
    } else {
      alert('Failed to delete user.')
    }
    setDeletingId(null)
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
          Customer Accounts
        </h1>
        <p className="text-gray-500 text-sm mt-1">{totalCount} total customer{totalCount !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading customers...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : users.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-gray-300 rounded-2xl">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-gray-500">No customer accounts yet.</p>
        </div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-2xl overflow-x-auto mb-8">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="px-5 py-4 text-gray-900">
                      {user.user_metadata?.full_name || '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{user.email}</td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={deletingId === user.id}
                        className="text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-full text-xs font-medium transition disabled:opacity-50"
                      >
                        {deletingId === user.id ? 'Deleting...' : '🗑 Delete'}
                      </button>
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