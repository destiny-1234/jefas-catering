import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const resendApiKey = process.env.RESEND_API_KEY

const ADMIN_EMAIL = 'jefascatering27@gmail.com'
const FROM_ADDRESS = 'Jefas Catering & Events <onboarding@resend.dev>'

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

export async function POST(request) {
  const admin = await verifyAdmin(request)
  if (!admin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subject, message, recipients } = await request.json()

  if (!subject || !message) {
    return Response.json({ error: 'Subject and message are required' }, { status: 400 })
  }
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return Response.json({ error: 'No recipients selected' }, { status: 400 })
  }

  // Validate the requested recipients are actual subscribers (defense against arbitrary email injection)
  const supabaseAdmin = createClient(supabaseUrl, serviceKey)
  const { data: validSubs, error: fetchError } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('email')
    .in('email', recipients)

  if (fetchError) {
    return Response.json({ error: fetchError.message }, { status: 500 })
  }

  const validEmails = validSubs.map((s) => s.email)

  if (validEmails.length === 0) {
    return Response.json({ error: 'No valid subscribers in the selected list' }, { status: 400 })
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #171717;">
      <h2 style="color: #dc2626; margin-bottom: 16px;">${subject}</h2>
      <div style="color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
        — Jefas Catering & Events
      </p>
    </div>
  `

  let sentCount = 0
  let failedCount = 0

  for (const email of validEmails) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [email],
          subject,
          html,
        }),
      })

      if (res.ok) {
        sentCount += 1
      } else {
        failedCount += 1
        console.error('Failed to send to', email, await res.text())
      }
    } catch (err) {
      failedCount += 1
      console.error('Error sending to', email, err)
    }
  }

  return Response.json({ sentCount, failedCount, total: validEmails.length })
}
