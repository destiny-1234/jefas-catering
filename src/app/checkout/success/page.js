import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        Order Placed Successfully!
      </h1>
      <p className="text-gray-500 mb-10">
        Thank you for your order — we&apos;ve received your payment and will begin
        preparing it for delivery. You can track your order status anytime from
        My Orders.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/account/orders"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full transition"
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="border-2 border-red-600 text-red-600 font-semibold px-8 py-3 rounded-full hover:bg-red-50 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}