'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.from('contact_messages').insert([form])

    if (error) {
      setError('Something went wrong. Please try again or WhatsApp us directly.')
      console.error(error)
    } else {
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Contact Us</h1>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Have a question, or ready to start planning? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-gray-50 rounded-3xl p-8">
          {submitted ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Message sent!
              </h3>
              <p className="text-gray-500">
                Thank you for reaching out — we&apos;ll get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5">
              <input
                type="text"
                name="name"
                required
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="grid sm:grid-cols-2 gap-5">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <textarea
                name="message"
                required
                placeholder="Your message..."
                value={form.message}
                onChange={handleChange}
                rows={5}
                className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info + Map */}
        <div className="flex flex-col gap-8">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-lg shrink-0">
                📞
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Phone</h4>
                <p className="text-gray-600 text-sm">+234 902 308 7214</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-lg shrink-0">
                ✉️
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Email</h4>
                <p className="text-gray-600 text-sm">jefascatering27@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-lg shrink-0">
                📍
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Location</h4>
                <p className="text-gray-600 text-sm">Lagos, Nigeria</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-200 h-72 md:h-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.3528688294255!2d3.2902764743752995!3d6.6029967222357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b9051a3c357d5%3A0xfb34ea690aac6393!2sJefas%20Catering%20And%20Events!5e0!3m2!1sen!2sng!4v1783456716476!5m2!1sen!2sng"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Jefas Catering and Events Location"
            />
          </div>
        </div>
      </div>
    </div>
  )
}