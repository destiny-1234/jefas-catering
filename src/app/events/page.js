'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'

const WHATSAPP_NUMBER = '09023087214' // TODO: replace with real number, same as Footer.js

export default function EventsPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    event_type: '',
    event_date: '',
    guest_count: '',
    location: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('event_services')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setServices(data)
      setLoading(false)
    }
    fetchServices()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.from('event_bookings').insert([form])

    if (error) {
      setError('Something went wrong. Please try again or WhatsApp us directly.')
      console.error(error)
    } else {
      setSubmitted(true)
      setForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        event_type: '',
        event_date: '',
        guest_count: '',
        location: '',
        message: '',
      })
    }
    setSubmitting(false)
  }

  const whatsappLinkForService = (serviceName) => {
    const text = encodeURIComponent(
      `Hi Jefas! I'd like to enquire about your "${serviceName}" service.`
    )
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Event Planning</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Full-service event planning to make your special day beautiful, memorable, and stress-free.
        </p>
      </div>

      {/* Services */}
      <div className="mb-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Our Event Services</h2>
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
        ) : services.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-2xl">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Services coming soon</h3>
            <p className="text-gray-500">
              Our event packages will be listed here shortly — meanwhile, tell us about your event below.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-red-200 transition"
              >
                <div className="relative bg-gray-50 h-48 flex items-center justify-center">
                  {service.image_url ? (
                    <Image src={service.image_url} alt={service.name} fill className="object-cover" />
                  ) : (
                    <span className="text-4xl">🎉</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    {service.price ? (
                      <span className="text-lg font-bold text-gray-900">
                        ₦{Number(service.price).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Contact for pricing</span>
                    )}
                  </div>
                  <a
                    href={whatsappLinkForService(service.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-full transition w-full"
                  >
                    <svg viewBox="0 0 32 32" className="w-4 h-4 fill-white">
                      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.837.744 5.5 2.04 7.81L0 32l8.4-2.02A15.9 15.9 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.24 13.24 0 0 1-6.76-1.853l-.485-.29-4.99 1.2 1.234-4.86-.316-.5A13.24 13.24 0 0 1 2.667 16C2.667 8.64 8.64 2.667 16 2.667S29.333 8.64 29.333 16 23.36 29.333 16 29.333zm7.27-9.837c-.397-.198-2.35-1.16-2.714-1.293-.364-.132-.63-.198-.895.198-.264.397-1.026 1.293-1.258 1.558-.232.264-.463.298-.86.1-.397-.199-1.676-.618-3.192-1.97-1.18-1.053-1.977-2.353-2.208-2.75-.232-.397-.025-.612.174-.81.178-.178.397-.463.596-.695.198-.232.264-.397.397-.662.132-.264.066-.496-.033-.695-.1-.198-.895-2.157-1.226-2.955-.323-.777-.65-.672-.895-.685-.232-.012-.496-.014-.76-.014-.264 0-.695.1-1.06.496-.363.397-1.39 1.358-1.39 3.31 0 1.953 1.423 3.84 1.622 4.106.198.264 2.8 4.276 6.786 5.994.948.409 1.688.654 2.264.837.951.303 1.817.26 2.502.157.763-.114 2.35-.96 2.682-1.888.33-.926.33-1.72.232-1.887-.1-.166-.363-.264-.76-.463z"/>
                    </svg>
                    Enquire on WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form */}
      <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Book Your Event
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Share your event details and we&apos;ll get back to you to start planning.
          </p>

          {submitted ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Booking request received!
              </h3>
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
                name="event_type"
                placeholder="Event Type (Wedding, Birthday, etc.)"
                value={form.event_type}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="date"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="guest_count"
                placeholder="Estimated Guest Count"
                value={form.guest_count}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                name="location"
                placeholder="Event Location"
                value={form.location}
                onChange={handleChange}
                className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <textarea
                name="message"
                placeholder="Tell us more about your event..."
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {error && (
                <p className="md:col-span-2 text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="md:col-span-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}