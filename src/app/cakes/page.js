'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../../context/CartContext'

export default function CakesPage() {
  const { addToCart } = useCart()
  const [cakes, setCakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState(null)
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    flavor: '',
    size: '',
    delivery_date: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCakes() {
      const { data, error } = await supabase
        .from('cakes')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setCakes(data)
      setLoading(false)
    }
    fetchCakes()
  }, [])

  const handleAddToCart = (cake) => {
    // Explicitly pass the item data and the type 'cake' to match the context logic
    addToCart(cake, 'cake')
    setAddedId(cake.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from('cake_orders').insert([form])
    if (error) {
      setError('Something went wrong. Please try again or WhatsApp us directly.')
      console.error(error)
    } else {
      setSubmitted(true)
      setForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        flavor: '',
        size: '',
        delivery_date: '',
        message: '',
      })
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Custom Cakes</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Beautifully crafted cakes for birthdays, weddings, and every celebration worth savoring.
        </p>
      </div>

      {/* Gallery */}
      <div className="mb-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Our Cake Gallery</h2>
        <p className="text-gray-500 text-sm mb-6">
          Ready-made designs available to buy now — or request something fully custom below.
        </p>
        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-200 h-48 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : cakes.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-2xl">
            <div className="text-4xl mb-4">🎂</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Gallery coming soon</h3>
            <p className="text-gray-500">
              Cake designs will be added here shortly — meanwhile, tell us what you have in mind below.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {cakes.map((cake) => {
              const outOfStock = Number(cake.stock) <= 0
              const justAdded = addedId === cake.id
              return (
                <div
                  key={cake.id}
                  className={`group border rounded-2xl overflow-hidden transition ${
                    outOfStock
                      ? 'border-gray-200 opacity-60'
                      : 'border-gray-200 hover:shadow-xl hover:border-red-200'
                  }`}
                >
                  <div className="relative bg-gray-50 h-48 flex items-center justify-center">
                    {cake.image_url ? (
                      <Image
                        src={cake.image_url}
                        alt={cake.name}
                        fill
                        className={`object-cover ${outOfStock ? 'grayscale' : ''}`}
                      />
                    ) : (
                      <span className="text-4xl">🎂</span>
                    )}
                    {outOfStock && (
                      <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{cake.name}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{cake.description}</p>
                    {cake.price ? (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ₦{Number(cake.price).toLocaleString()}
                        </span>
                        <button
                          disabled={outOfStock}
                          onClick={() => handleAddToCart(cake)}
                          className={`text-sm px-4 py-2 rounded-full font-medium transition ${
                            outOfStock
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : justAdded
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          {outOfStock ? 'Out of Stock' : justAdded ? 'Added ✓' : 'Add to Cart'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        Contact us for pricing — inspiration only
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Order Form */}
      <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Request a Custom Cake
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Have something specific in mind? Tell us and we&apos;ll get back to you shortly.
          </p>
          {submitted ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Request received!</h3>
              <p className="text-gray-500">
                Thank you — we&apos;ll reach out to confirm details shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
              <input
                type="text"
                name="customer_name"
                required
                placeholder="Full Name"
                value={form.customer_name}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="tel"
                name="customer_phone"
                required
                placeholder="Phone Number"
                value={form.customer_phone}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="email"
                name="customer_email"
                placeholder="Email (optional)"
                value={form.customer_email}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="flavor"
                placeholder="Preferred Flavor"
                value={form.flavor}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="size"
                placeholder="Size / Servings"
                value={form.size}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="date"
                name="delivery_date"
                value={form.delivery_date}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <textarea
                name="message"
                placeholder="Tell us more about your design idea..."
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {error && <p className="md:col-span-2 text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="md:col-span-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
