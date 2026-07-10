'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../../context/CartContext'

const categories = ['All', 'Flour', 'Sugar', 'Butter', 'Tools']

export default function ShopPage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
      } else {
        setProducts(data)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase())

  const handleAddToCart = (product) => {
    // Pass the product data and explicitly define the item type as 'product'
    addToCart(product, 'product')
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Shop</h1>
        <p className="text-gray-500 mt-2">
          Quality baking supplies, delivered to your door
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
              activeCategory === cat
                ? 'bg-red-600 text-white border-red-600'
                : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-gray-200 h-48 w-full" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-300 rounded-2xl">
          <div className="text-4xl mb-4">🛒</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No products yet</h3>
          <p className="text-gray-500">
            Check back soon — new baking supplies are on the way.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const outOfStock = Number(product.stock) <= 0
            const justAdded = addedId === product.id

            return (
              <div
                key={product.id}
                className={`group border rounded-2xl overflow-hidden transition ${
                  outOfStock
                    ? 'border-gray-200 opacity-60'
                    : 'border-gray-200 hover:shadow-xl hover:border-red-200'
                }`}
              >
                <div className="relative bg-gray-50 h-48 flex items-center justify-center">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className={`object-cover ${outOfStock ? 'grayscale' : ''}`}
                    />
                  ) : (
                    <span className="text-4xl">🧁</span>
                  )}
                  {outOfStock && (
                    <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Out of Stock
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-red-600 font-semibold mb-1">
                    {product.category || 'Uncategorized'}
                  </p>
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₦{Number(product.price).toLocaleString()}
                    </span>
                    <button
                      disabled={outOfStock}
                      onClick={() => handleAddToCart(product)}
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
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
