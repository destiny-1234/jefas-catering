import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-red-50 py-16 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Meet Jefas
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          From custom cakes to unforgettable events — built on passion, trusted by
          families across Lagos.
        </p>
      </section>

      {/* Story Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative w-full h-80 bg-gray-100 rounded-2xl overflow-hidden">
          <Image
            src="/jefas-founder1.jpeg"
            alt="Jefas Catering and Events founder"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Jefas Catering and Events began with a simple love for baking and a
            passion for bringing people together. What started as cakes made for
            family and friends soon grew into a trusted name for celebrations across
            Lagos — from birthdays and weddings to milestone events that deserved
            something truly special.
          </p>
          <p className="text-gray-600">
            Today, Jefas Catering and Events has grown into a full-service brand —
            crafting custom cakes, planning unforgettable events, and supplying
            quality baking ingredients to home bakers and businesses alike. Every
            order, big or small, is handled with the same care, creativity, and
            attention to detail that the business was built on.
          </p>
        </div>
      </section>

      {/* Values / What We Stand For */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">What We Stand For</h2>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ❤️
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Made with Love</h3>
            <p className="text-gray-600 text-sm">
              Every cake and event is treated like it&apos;s for our own family.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✨
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quality First</h3>
            <p className="text-gray-600 text-sm">
              Only the best ingredients and attention to detail, every single time.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🤝
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Customer Trust</h3>
            <p className="text-gray-600 text-sm">
              Your special moments deserve someone reliable — that&apos;s our promise.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600 text-white text-center py-16 px-6">
        <h2 className="text-2xl font-bold mb-4">
          Let&apos;s create something special together
        </h2>
        <Link
          href="/contact"
          className="inline-block bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-red-50 transition"
        >
          Get in Touch
        </Link>
      </section>
    </div>
  )
}
