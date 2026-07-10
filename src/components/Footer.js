'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.from('newsletter_subscribers').insert([{ email }])

    if (error) {
      if (error.code === '23505') {
        // unique constraint violation — already subscribed
        setSubscribed(true)
        setEmail('')
      } else {
        setError('Something went wrong. Please try again.')
        console.error(error)
      }
    } else {
      setSubscribed(true)
      setEmail('')
    }
    setSubmitting(false)
  }

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 px-6 mt-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Image src="/jefas-logo.png" alt="Jefas Catering and Events" width={40} height={40} style={{ height: 'auto' }} />
            <span className="text-white font-bold">Jefas Catering & Events</span>
          </div>
          <p className="text-sm text-gray-400">
            Custom cakes, event planning, and premium baking supplies — crafted with care.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-red-400">Shop</Link></li>
            <li><Link href="/cakes" className="hover:text-red-400">Custom Cakes</Link></li>
            <li><Link href="/events" className="hover:text-red-400">Event Planning</Link></li>
            <li><Link href="/about" className="hover:text-red-400">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-red-400">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📞 +234 902 308 7214</li>
            <li>✉️ jefascatering27@gmail.com</li>
            <li>📍 Lagos, Nigeria</li>
          </ul>
          <div className="flex gap-4 mt-4">
            <a href="#" aria-label="Instagram" className="hover:text-red-400">Instagram</a>
            <a href="#" aria-label="Facebook" className="hover:text-red-400">Facebook</a>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
          <p className="text-sm text-gray-400 mb-4">
            Get promos and baking tips straight to your inbox.
          </p>
          {subscribed ? (
            <p className="text-red-400 text-sm font-medium">Thanks for subscribing! 🎉</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="px-4 py-2 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-full transition disabled:opacity-60"
              >
                {submitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Jefas Catering & Events. All rights reserved.
        {' · '}
        <Link href="/admin/login" className="text-gray-600 hover:text-gray-400">
          Admin
        </Link>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/2349023087214"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.837.744 5.5 2.04 7.81L0 32l8.4-2.02A15.9 15.9 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.24 13.24 0 0 1-6.76-1.853l-.485-.29-4.99 1.2 1.234-4.86-.316-.5A13.24 13.24 0 0 1 2.667 16C2.667 8.64 8.64 2.667 16 2.667S29.333 8.64 29.333 16 23.36 29.333 16 29.333zm7.27-9.837c-.397-.198-2.35-1.16-2.714-1.293-.364-.132-.63-.198-.895.198-.264.397-1.026 1.293-1.258 1.558-.232.264-.463.298-.86.1-.397-.199-1.676-.618-3.192-1.97-1.18-1.053-1.977-2.353-2.208-2.75-.232-.397-.025-.612.174-.81.178-.178.397-.463.596-.695.198-.232.264-.397.397-.662.132-.264.066-.496-.033-.695-.1-.198-.895-2.157-1.226-2.955-.323-.777-.65-.672-.895-.685-.232-.012-.496-.014-.76-.014-.264 0-.695.1-1.06.496-.363.397-1.39 1.358-1.39 3.31 0 1.953 1.423 3.84 1.622 4.106.198.264 2.8 4.276 6.786 5.994.948.409 1.688.654 2.264.837.951.303 1.817.26 2.502.157.763-.114 2.35-.96 2.682-1.888.33-.926.33-1.72.232-1.887-.1-.166-.363-.264-.76-.463z"/>
        </svg>
      </a>
    </footer>
  )
}