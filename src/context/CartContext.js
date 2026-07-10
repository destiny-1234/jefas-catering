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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id || null
      if (uid !== currentUserId) {
        currentUserId = uid
        setUserId(uid)
        loadCartFor(uid)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Save cart to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (!loaded) return
    try {
      const key = getCartKey(userId)
      localStorage.setItem(key, JSON.stringify(cart))
    } catch (e) {
      console.error('Failed to save cart:', e)
    }
  }, [cart, userId, loaded])

  // 1. Add item to cart with stock validation and item type distinction
  const addToCart = (item, type = 'product') => {
    setCart((prevCart) => {
      // Find item matching both ID and type (since a cake and product could theoretically share an ID)
      const existingItem = prevCart.find((i) => i.id === item.id && i.type === type)

      if (existingItem) {
        // Enforce stock ceiling limit
        if (existingItem.quantity >= (item.stock || 0)) {
          alert(`Sorry, only ${item.stock} available in stock!`)
          return prevCart
        }
        return prevCart.map((i) =>
          i.id === item.id && i.type === type
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }

      // New item validation
      if ((item.stock || 0) <= 0) {
        alert('This item is currently out of stock!')
        return prevCart
      }

      // Preserve relevant item fields along with quantity, type, and max stock capacity
      return [
        ...prevCart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image || item.image_url,
          stock: item.stock,
          type,
          quantity: 1,
        },
      ]
    })
  }

  // 2. Modify item quantity while strictly obeying stock constraints
  const updateQuantity = (id, type, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id && item.type === type) {
          // Enforce 1 as minimum floor and item.stock as maximum ceiling
          const cappedQuantity = Math.min(Math.max(1, newQuantity), item.stock || 0)
          
          if (newQuantity > (item.stock || 0)) {
            alert(`Sorry, only ${item.stock} items available in stock!`)
          }
          
          return { ...item, quantity: cappedQuantity }
        }
        return item
      })
    )
  }

  // 3. Remove an item entirely from the cart
  const removeFromCart = (id, type) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.type === type)))
  }

  // 4. Clear the whole cart (used after successful checkout)
  const clearCart = () => {
    setCart([])
  }

  // Calculate cart metrics dynamically
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
