'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../../context/CartContext'

export default function CartPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart()
  const [zones, setZones] = useState([])
  const [selectedZoneId, setSelectedZoneId] = useState('')
  const [loadingZones, setLoadingZones] = useState(true)

  useEffect(() => {
    async function fetchZones() {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('display_order', { ascending: true })
      if (!error) setZones(data)
      setLoadingZones(false)
    }
    fetchZones()
  }, [])

  const selectedZone = zones.find((z) => z.id === selectedZoneId)
  const deliveryFee = selectedZone ? Number(selectedZone.fee) : 0
  const grandTotal = cartTotal + deliveryFee

  const handleCheckout = () => {
    if (!selectedZoneId) {
      alert('Please select a delivery zone before checking out.')
      return
    }
    sessionStorage.setItem(
      'jefas_checkout_delivery',
      JSON.stringify({ zoneName: selectedZone.name, fee: deliveryFee })
    )
    router.push('/checkout')
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">
          Looks like you haven&apos;t added any baking supplies yet.
        </p>
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
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">Your Cart</h1>
      <div className="grid md:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => {
            const maxStockReached = item.quantity >= (item.stock || 0)

            return (
              <div
                key={`${item.id}-${item.type}`}
                className="flex items-center gap-4 border border-gray-200 rounded-2xl p-4"
              >
                <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                  {item.image || item.image_url ? (
                    <Image
                      src={item.image || item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl">
                      {item.type === 'cake' ? '🎂' : '🧁'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-gray-500 text-sm">
                    ₦{Number(item.price).toLocaleString()} each
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {/* Minus Button */}
                    <button
                      onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    {/* Plus Button capped at max available stock */}
                    <button
                      onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                      disabled={maxStockReached}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                    {maxStockReached && (
                      <span className="text-xs text-red-500 font-medium">Max stock reached</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 mb-2">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id, item.type)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-5">Order Summary</h2>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Zone
            </label>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              disabled={loadingZones}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="">
                {loadingZones ? 'Loading zones...' : 'Select delivery zone'}
              </option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}{' '}
                  {zone.fee === 0 ? '(Free)' : `— ₦${Number(zone.fee).toLocaleString()}`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>{selectedZoneId ? `₦${deliveryFee.toLocaleString()}` : '—'}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-3">
              <span>Total</span>
              <span>₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
