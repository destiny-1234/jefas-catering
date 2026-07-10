'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../../context/CartContext'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartTotal, clearCart } = useCart()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const [delivery, setDelivery] = useState({ zoneName: '', fee: 0 })
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/account/login?redirect=/checkout')
        return
      }
      setUser(data.user)
      setForm((prev) => ({
        ...prev,
        email: data.user.email || '',
        name: data.user.user_metadata?.full_name || '',
      }))

      const savedDelivery = sessionStorage.getItem('jefas_checkout_delivery')
      if (savedDelivery) {
        setDelivery(JSON.parse(savedDelivery))
      }

      setChecking(false)
    }
    init()
  }, [router])

  const grandTotal = cartTotal + Number(delivery.fee || 0)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePayment = (e) => {
    e.preventDefault()
    setError(null)

    if (!form.name || !form.phone || !form.email) {
      setError('Please fill in all your details.')
      return
    }
    if (typeof window.PaystackPop === 'undefined') {
      setError('Payment system is still loading. Please wait a moment and try again.')
      return
    }

    setProcessing(true)

    const reference = `jefas-${Date.now()}`

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: form.email,
      amount: Math.round(grandTotal * 100), // Paystack expects amount in kobo
      currency: 'NGN',
      ref: reference,
      metadata: {
        custom_fields: [
          { display_name: 'Name', variable_name: 'name', value: form.name },
          { display_name: 'Phone', variable_name: 'phone', value: form.phone },
        ],
      },
      callback: function (response) {
        verifyAndSaveOrder(response.reference)
      },
      onClose: function () {
        setProcessing(false)
      },
    })

    handler.openIframe()
  }

  const verifyAndSaveOrder = async (reference) => {
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, expectedAmount: grandTotal }),
      })
      const result = await res.json()

      if (!res.ok || !result.verified) {
        setError('Payment verification failed. If you were charged, please contact us on WhatsApp.')
        setProcessing(false)
        return
      }

      const { error: insertError } = await supabase.from('orders').insert([
        {
          user_id: user.id,
          items: cart,
          subtotal: cartTotal,
          delivery_fee: Number(delivery.fee || 0),
          total: grandTotal,
          delivery_zone: delivery.zoneName,
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          payment_reference: reference,
          payment_status: 'paid',
        },
      ])

      if (insertError) {
        console.error(insertError)
        setError(
          'Payment succeeded but saving your order failed. Please contact us on WhatsApp with your payment reference: ' +
            reference
        )
        setProcessing(false)
        return
      }

      clearCart()
      sessionStorage.removeItem('jefas_checkout_delivery')
      router.push('/checkout/success')
    } catch (err) {
      console.error(err)
      setError('Something went wrong verifying your payment. Please contact us on WhatsApp.')
      setProcessing(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Loading checkout...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <Link
          href="/shop"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          Browse Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Customer Details */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-5">Your Details</h2>
          <form onSubmit={handlePayment} className="grid gap-4">
            <input
              type="text"
              name="name"
              required
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="tel"
              name="phone"
              required
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={processing}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
            >
              {processing ? 'Processing...' : `Pay ₦${grandTotal.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-5">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span>{item.name} × {item.quantity}</span>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery ({delivery.zoneName || 'N/A'})</span>
              <span>₦{Number(delivery.fee || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-3">
              <span>Total</span>
              <span>₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}