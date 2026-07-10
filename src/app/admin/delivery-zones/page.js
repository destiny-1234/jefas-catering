'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabaseClient'

const emptyForm = { name: '', fee: '', display_order: '' }
const PAGE_SIZE = 10

export default function AdminDeliveryZones() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  async function fetchZones(pageNum) {
    setLoading(true)
    const from = (pageNum - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error, count } = await supabase
      .from('delivery_zones')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: true })
      .range(from, to)

    if (!error) {
      setZones(data)
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
      fetchZones(1)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setPage(p)
    fetchZones(p)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name,
      fee: Number(form.fee) || 0,
      display_order: Number(form.display_order) || 0,
    }

    let result
    if (editingId) {
      result = await supabase.from('delivery_zones').update(payload).eq('id', editingId)
    } else {
      result = await supabase.from('delivery_zones').insert([payload])
    }

    if (result.error) {
      setError('Something went wrong. Please try again.')
      console.error(result.error)
    } else {
      resetForm()
      fetchZones(page)
    }
    setSaving(false)
  }

  const handleEdit = (zone) => {
    setForm({
      name: zone.name || '',
      fee: zone.fee ?? '',
      display_order: zone.display_order ?? '',
    })
    setEditingId(zone.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this delivery zone? This cannot be undone.')) return
    const { error } = await supabase.from('delivery_zones').delete().eq('id', id)
    if (!error) fetchZones(page)
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
      <div className="mb-10">
        <Link href="/admin" className="text-sm text-red-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
          Delivery Zones
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Set the delivery fee customers pay based on their location. {totalCount} zone{totalCount !== 1 ? 's' : ''} total.
        </p>
      </div>

      {/* Form */}
      <div className="bg-gray-50 rounded-3xl p-8 mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {editingId ? 'Edit Zone' : 'Add New Zone'}
        </h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-5">
          <input
            type="text"
            name="name"
            required
            placeholder="Zone Name (e.g. Lekki / Ajah)"
            value={form.name}
            onChange={handleChange}
            className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="number"
            name="fee"
            required
            placeholder="Fee (₦)"
            value={form.fee}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="number"
            name="display_order"
            placeholder="Display Order (e.g. 1, 2, 3...)"
            value={form.display_order}
            onChange={handleChange}
            className="md:col-span-3 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {error && <p className="md:col-span-3 text-red-600 text-sm">{error}</p>}

          <div className="md:col-span-3 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Update Zone' : 'Add Zone'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Zones List */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        All Zones ({totalCount})
      </h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : zones.length === 0 ? (
        <p className="text-gray-500">No delivery zones added yet.</p>
      ) : (
        <>
          <div className="border border-gray-200 rounded-2xl overflow-x-auto mb-8">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Zone</th>
                  <th className="px-5 py-3 font-medium">Fee</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.id} className="border-t border-gray-100">
                    <td className="px-5 py-4 text-gray-500">{zone.display_order}</td>
                    <td className="px-5 py-4 text-gray-900 font-medium">{zone.name}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {zone.fee === 0 ? 'Free' : `₦${Number(zone.fee).toLocaleString()}`}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(zone)}
                        className="text-xs border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-full transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(zone.id)}
                        className="text-xs border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full transition"
                      >
                        Delete
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