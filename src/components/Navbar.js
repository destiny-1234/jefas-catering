'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const router = useRouter()
  const { cartCount } = useCart()
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setChecking(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
  }

  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/cakes', label: 'Cakes' },
    { href: '/events', label: 'Events' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <Link href="/" className="flex items-center gap-2 sm:gap-3" onClick={() => setMenuOpen(false)}>
          <Image
            src="/jefas-logo.png"
            alt="Jefas Catering and Events"
            width={44}
            height={44}
            style={{ height: 'auto' }}
          />
          <span className="text-lg sm:text-xl font-bold text-red-600 hidden xs:block">
            Jefas Catering & Events
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-red-600">
              {link.label}
            </Link>
          ))}

          <Link href="/cart" className="relative hover:text-red-600">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {!checking && (
            user ? (
              <div className="flex items-center gap-4">
                <Link href="/account/orders" className="hover:text-red-600">
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-full transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/account/login"
                className="bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700 transition"
              >
                Log In / Sign Up
              </Link>
            )
          )}
        </div>

        {/* Mobile: cart icon + hamburger */}
        <div className="flex items-center gap-4 lg:hidden">
          <Link href="/cart" className="relative text-gray-700" onClick={() => setMenuOpen(false)}>
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="text-gray-700 w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          >
            <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-gray-700 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-1 text-sm font-medium text-gray-700">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 hover:text-red-600 border-b border-gray-50"
            >
              {link.label}
            </Link>
          ))}

          {!checking && (
            user ? (
              <>
                <Link
                  href="/account/orders"
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 hover:text-red-600 border-b border-gray-50"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-3 text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-full transition text-left"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/account/login"
                onClick={() => setMenuOpen(false)}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition text-center"
              >
                Log In / Sign Up
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  )
}