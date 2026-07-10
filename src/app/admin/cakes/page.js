'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../../lib/supabaseClient'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  flavor: '',
}

export default function AdminCakes() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [cakes, setCakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/admin/login')
        return
      }
      setChecking(false)
      fetchCakes()
    }
    init()
  }, [router])

  async function fetchCakes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('cakes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCakes(data)
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (uploadError) {
      setError('Image upload failed. Please try again.')
      console.error(uploadError)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    setForm((prev) => ({ ...prev, image_url: data.publicUrl }))
    setUploading(false)
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
      ...form,
      price: form.price ? Number(form.price) : null,
    }

    let result
    if (editingId) {
      result = await supabase.from('cakes').update(payload).eq('id', editingId)
    } else {
      result = await supabase.from('cakes').insert([payload])
    }

    if (result.error) {
      setError('Something went wrong. Please try again.')
      console.error(result.error)
    } else {
      resetForm()
      fetchCakes()
    }
    setSaving(false)
  }

  const handleEdit = (cake) => {
    setForm({
      name: cake.name || '',
      description: cake.description || '',
      price: cake.price || '',
      image_url: cake.image_url || '',
      flavor: cake.flavor || '',
    })
    setEditingId(cake.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this cake? This cannot be undone.')) return
    const { error } = await supabase.from('cakes').delete().eq('id', id)
    if (!error) fetchCakes()
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Checking access...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-10">
        <Link href="/admin" className="text-sm text-red-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
          Cake Gallery
        </h1>
      </div>

      {/* Form */}
      <div className="bg-gray-50 rounded-3xl p-8 mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {editingId ? 'Edit Cake' : 'Add New Cake'}
        </h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
          <input
            type="text"
            name="name"
            required
            placeholder="Cake Name"
            value={form.name}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="text"
            name="flavor"
            placeholder="Flavor"
            value={form.flavor}
            onChange={handleChange}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="number"
            name="price"
            placeholder="Starting Price (₦, optional)"
            value={form.price}
            onChange={handleChange}
            className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cake Photo
            </label>
            <div className="flex items-center gap-4">
              {form.image_url && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                  <Image src={form.image_url} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium px-5 py-3 rounded-xl transition">
                {uploading ? 'Uploading...' : form.image_url ? 'Change Photo' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {error && <p className="md:col-span-2 text-red-600 text-sm">{error}</p>}

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Update Cake' : 'Add Cake'}
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

      {/* Cakes List */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        All Cakes ({cakes.length})
      </h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : cakes.length === 0 ? (
        <p className="text-gray-500">No cakes added yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cakes.map((cake) => (
            <div key={cake.id} className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="relative bg-gray-50 h-40">
                {cake.image_url ? (
                  <Image src={cake.image_url} alt={cake.name} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-3xl">🎂</div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{cake.name}</h3>
                {cake.flavor && (
                  <p className="text-xs uppercase tracking-wide text-red-600 font-semibold mb-1">
                    {cake.flavor}
                  </p>
                )}
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{cake.description}</p>
                {cake.price && (
                  <p className="font-bold text-gray-900 mb-4">
                    ₦{Number(cake.price).toLocaleString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cake)}
                    className="flex-1 text-sm border border-gray-300 hover:bg-gray-100 rounded-lg py-2 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cake.id)}
                    className="flex-1 text-sm border border-red-200 text-red-600 hover:bg-red-50 rounded-lg py-2 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}