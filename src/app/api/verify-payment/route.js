export async function POST(request) {
  try {
    const { reference, expectedAmount } = await request.json()

    if (!reference) {
      return Response.json({ error: 'Missing payment reference' }, { status: 400 })
    }

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const result = await res.json()

    if (!result.status || result.data?.status !== 'success') {
      return Response.json({ verified: false, reason: 'Payment not successful' }, { status: 400 })
    }

    if (result.data.currency !== 'NGN') {
      return Response.json({ verified: false, reason: 'Currency mismatch' }, { status: 400 })
    }

    // Paystack returns amount in kobo; convert expected amount to kobo for comparison
    const expectedKobo = Math.round(expectedAmount * 100)
    const amountMatches = Math.abs(result.data.amount - expectedKobo) < 100 // small tolerance

    if (!amountMatches) {
      return Response.json({ verified: false, reason: 'Amount mismatch' }, { status: 400 })
    }

    return Response.json({ verified: true })
  } catch (err) {
    console.error('Payment verification error:', err)
    return Response.json({ verified: false, error: 'Verification failed' }, { status: 500 })
  }
}