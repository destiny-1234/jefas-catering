import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const ADMIN_EMAIL = 'jefascatering27@gmail.com'

async function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(supabaseUrl, anonKey)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) return null
  if (data.user.email !== ADMIN_EMAIL) return null

  return data.user
}

export async function GET(request) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = parseInt(searchParams.get('perPage') || '10', 10)

  const supabaseAdmin = createClient(supabaseUrl, serviceKey)
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const allCustomers = data.users.filter((u) => u.email !== ADMIN_EMAIL)
  const totalCount = allCustomers.length
  const start = (page - 1) * perPage
  const pagedCustomers = allCustomers.slice(start, start + perPage)

  return Response.json({ users: pagedCustomers, totalCount })
}

export async function DELETE(request) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = await request.json()
  if (!userId) {
    return Response.json({ error: 'Missing userId' }, { status: 400 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}