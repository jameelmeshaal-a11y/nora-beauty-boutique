import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItem {
  product_id: string
  quantity: number
  variant_id?: string
}

interface CheckoutRequest {
  items: CartItem[]
  shipping_address: string
  phone: string
  notes?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: CheckoutRequest = await req.json()
    
    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty or invalid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.shipping_address || body.shipping_address.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid shipping address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.phone || body.phone.length < 9) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate quantities
    for (const item of body.items) {
      if (!item.product_id || typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 100) {
        return new Response(
          JSON.stringify({ error: 'Invalid item quantity or product ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get product IDs from request
    const productIds = body.items.map(item => item.product_id)

    // Fetch actual product prices from database (server-side validation)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, name_ar, price, in_stock, is_active')
      .in('id', productIds)

    if (productsError) {
      console.error('Products fetch error:', productsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch product information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid products found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a map of product prices for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]))

    // Validate all products exist and are available
    const orderItems: { product_id: string; product_name: string; price: number; quantity: number }[] = []
    let calculatedTotal = 0

    for (const item of body.items) {
      const product = productMap.get(item.product_id)
      
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product not found: ${item.product_id}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!product.is_active) {
        return new Response(
          JSON.stringify({ error: `Product is not available: ${product.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!product.in_stock) {
        return new Response(
          JSON.stringify({ error: `Product is out of stock: ${product.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Use server-side price (NEVER trust client price)
      const itemTotal = product.price * item.quantity
      calculatedTotal += itemTotal

      orderItems.push({
        product_id: item.product_id,
        product_name: product.name_ar || product.name,
        price: product.price, // Server-side price
        quantity: item.quantity
      })
    }

    console.log(`Creating order for user ${user.id} with total: ${calculatedTotal}`)

    // Create the order with server-calculated total
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total: calculatedTotal, // Server-calculated total
        shipping_address: body.shipping_address,
        phone: body.phone,
        notes: body.notes || null,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      // Attempt to clean up the order if items insertion fails
      await supabase.from('orders').delete().eq('id', order.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create order items' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Order ${order.id} created successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        total: calculatedTotal,
        message: 'Order created successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
