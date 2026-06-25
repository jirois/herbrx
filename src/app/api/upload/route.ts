import { NextRequest }  from 'next/server'
import { requireAuth, created, badRequest, serverError } from '@/lib/api-helpers'

/**
 * POST /api/upload
 * Accepts a multipart/form-data file and returns a CDN URL.
 *
 * Production: wire to Cloudinary or AWS S3.
 * Development: returns a mock URL so the rest of the flow works.
 *
 * Body (FormData):
 *   file    — the file to upload
 *   folder  — optional subfolder: 'coa' | 'verification' | 'general'
 */
export async function POST(req: NextRequest) {
  const {  error } = await requireAuth(req)
  if (error) return error

  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const folder   = (formData.get('folder') as string) ?? 'general'

    if (!file) return badRequest('No file provided')

    const maxSize = 10 * 1024 * 1024 // 10 MB
    if (file.size > maxSize) return badRequest('File too large (max 10 MB)')

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return badRequest('Invalid file type. Allowed: PDF, JPEG, PNG, WEBP')
    }

    // ── Production: upload to Cloudinary ─────────────────────────────────
    // const cloudinary = require('cloudinary').v2
    // const bytes  = await file.arrayBuffer()
    // const buffer = Buffer.from(bytes)
    // const result = await new Promise((resolve, reject) => {
    //   cloudinary.uploader.upload_stream(
    //     { folder: `herbrx/${folder}`, resource_type: 'auto' },
    //     (err: any, res: any) => err ? reject(err) : resolve(res)
    //   ).end(buffer)
    // }) as any
    // return created({ url: result.secure_url, publicId: result.public_id })

    // ── Development: return a mock URL ────────────────────────────────────
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const mockUrl  = `https://cdn.herbrx.ng/${folder}/${Date.now()}-${safeName}`

    return created({ url: mockUrl, name: file.name, size: file.size })
  } catch (e) {
    return serverError(e)
  }
}
