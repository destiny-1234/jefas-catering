import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-red-50 to-white py-24 px-6 text-center overflow-hidden">
        <div className="max-w-3xl mx-auto">
         <Image src="/jefas-logo.png" alt="Jefas Catering and Events" width={40} height={40} style={{ height: 'auto' }} />
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Jefas <span className="text-red-600">Catering & Events</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-10">
            Custom cakes, unforgettable events, and premium baking supplies —
            crafted with care, delivered with excellence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/cakes"
              className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition shadow-md"
            >
              Order a Cake
            </Link>
            <Link
              href="/events"
              className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-red-50 transition"
            >
              Plan an Event
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
          <p className="text-gray-500 mt-2">Everything you need, all in one place</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group border border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl hover:border-red-200 transition">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🎂
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Custom Cakes</h3>
            <p className="text-gray-600 mb-5">
              Beautifully designed cakes for birthdays, weddings, and every celebration.
            </p>
            <Link href="/cakes" className="text-red-600 font-semibold group-hover:underline">
              View Cakes →
            </Link>
          </div>
          <div className="group border border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl hover:border-red-200 transition">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🎉
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Event Planning</h3>
            <p className="text-gray-600 mb-5">
              Full-service event planning to make your special day stress-free.
            </p>
            <Link href="/events" className="text-red-600 font-semibold group-hover:underline">
              Explore Events →
            </Link>
          </div>
          <div className="group border border-gray-200 rounded-2xl p-8 text-center hover:shadow-xl hover:border-red-200 transition">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🛒
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Baking Supplies</h3>
            <p className="text-gray-600 mb-5">
              Shop quality flour, sugar, butter, and baking tools online.
            </p>
            <Link href="/shop" className="text-red-600 font-semibold group-hover:underline">
              Visit Shop →
            </Link>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="bg-red-600 text-white text-center py-16 px-6">
        <h2 className="text-3xl font-bold mb-4">
          Ready to make your event unforgettable?
        </h2>
        <p className="text-red-100 mb-8 max-w-lg mx-auto">
          Reach out today and let&apos;s start planning something beautiful together.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-red-50 transition shadow-md"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  )
}