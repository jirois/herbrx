import type {
  PaystackInitializeRequest,
  PaystackInitializeResponse,
  PaystackVerifyResponse,
} from '@/types'

const PAYSTACK_BASE = 'https://api.paystack.co'

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set')
  return key
}

function paystackHeaders() {
  return {
    Authorization: `Bearer ${getSecretKey()}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Initialize a Paystack transaction.
 * Amount must be in Naira — this function converts to kobo internally.
 */
export async function initializeTransaction(
  params: Omit<PaystackInitializeRequest, 'amount'> & { amount: number }
): Promise<PaystackInitializeResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: paystackHeaders(),
    body: JSON.stringify({
      ...params,
      amount: Math.round(params.amount * 100), // convert ₦ → kobo
      currency: 'NGN',
      channels: params.channels ?? ['card', 'bank', 'ussd', 'bank_transfer'],
    }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message ?? `Paystack init failed: ${res.status}`)
  }

  return res.json()
}

/**
 * Verify a Paystack transaction by reference.
 */
export async function verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: paystackHeaders() }
  )

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message ?? `Paystack verify failed: ${res.status}`)
  }

  return res.json()
}

/**
 * Generate a unique Paystack transaction reference.
 * Format: HRX-<timestamp-base36>-<random>
 */
export function generateReference(prefix = 'HRX'): string {
  const ts  = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `${prefix}-${ts}-${rnd}`
}

/**
 * Verify a Paystack webhook signature.
 * Call this in the webhook handler before processing.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || !signature) return false

  try {
    const encoder = new TextEncoder()
    
    // 1. Convert the incoming signature string directly into a byte buffer
    const sigBytes = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    )

    // 2. Import the secret key
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['verify'] // Explicitly use verify instead of sign
    )

    // 3. Let Web Crypto handle the constant-time safe signature verification
    return await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(rawBody)
    )
    
  } catch (err) {
    console.error('[Webhook Signature Verification Error]:', err)
    return false
  }

  // const encoder = new TextEncoder()
  // const key = await crypto.subtle.importKey(
  //   'raw',
  //   encoder.encode(secret),
  //   { name: 'HMAC', hash: 'SHA-512' },
  //   false,
  //   ['sign']
  // )
  // const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  // const hash = Array.from(new Uint8Array(sig))
  //   .map((b) => b.toString(16).padStart(2, '0'))
  //   .join('')

  // return hash === signature
}
