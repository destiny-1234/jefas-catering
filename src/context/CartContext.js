'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const CartContext = createContext(null)

function getCartKey(userId) {
  return userId ? `jefas_cart_${userId}` : 'jefas_cart_guest'
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [userId, setUserId] = useState(null)
  const [loaded, setLoaded] = useState(false)

  // Track auth state and load the correct cart whenever the logged-in user changes
  useEffect(() => {
    let currentUserId = null

    async function loadCartFor(uid) {
      try {
        const key = getCartKey(uid)
        const saved = localStorage.getItem(key)
        setCart(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error('Failed to load cart:', e)
        setCart([])
      } finally {
        setLoaded(true)
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      currentUserId = data.user?.id || null
      setUserId(currentUserId)
      loadCartFor(currentUserId)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id || null
      if (newUserId !== currentUserId) {
        currentUserId = newUserId
        setUserId(newUserId)
        loadCartFor(newUserId)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Save cart to the correct key whenever it changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(getCartKey(userId), JSON.stringify(cart))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, loaded, userId])

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity,
        },
      ]
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}