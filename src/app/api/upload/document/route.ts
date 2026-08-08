import { NextRequest } from 'next/server'
import { requireAuth, created, badRequest, serverError } from '@/lib/api-helpers'
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary'
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

// Cloudinary's SDK talks directly to Cloudinary's HTTP API using the server-side
// API secret — it can't run on the Edge runtime, so pin this route to Node.
export const runtime = 'nodejs'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_FOLDERS = ['verification', 'coa', 'general'] as const

/**
 * POST /api/upload/document
 *
 * Accepts a multipart/form-data file, uploads it to Cloudinary via a signed
 * server-side request (the API secret never touches the client), and returns
 * the hosted document details so the caller can persist them.
 *
 * Body (FormData):
 *   file    — the file to upload (PDF, JPEG, PNG, or WEBP; max 10 MB)
 *   folder  — optional subfolder: 'verification' | 'coa' | 'general'
 *
 * Response: { url, public_id, format }
 */
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error

  if (!isCloudinaryConfigured) {
    return serverError(
      new Error('Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET')
    )
  }

  try {
    const formData    = await req.formData()
    const file         = formData.get('file') as File | null
    const folderInput = (formData.get('folder') as string) ?? 'verification'
    const folder = (ALLOWED_FOLDERS as readonly string[]).includes(folderInput)
      ? folderInput
      : 'general'

    if (!file) return badRequest('No file provided')
    if (file.size > MAX_SIZE) return badRequest('File too large (max 10 MB)')
    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest('Invalid file type. Allowed: PDF, JPEG, PNG, WEBP')
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const userId = (session!.user as { id?: string }).id ?? 'anon'
    const safeOriginalName = file.name
      .replace(/\.[^/.]+$/, '')       // strip extension — Cloudinary adds its own
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60)

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `herbrx/${folder}`,
          resource_type: 'auto', // handles both images and PDFs
          public_id: `${userId}-${Date.now()}-${safeOriginalName}`,
          overwrite: false,
          use_filename: false,
        },
        (err: UploadApiErrorResponse | undefined, res: UploadApiResponse | undefined) => {
          if (err || !res) reject(err ?? new Error('Cloudinary upload failed'))
          else resolve(res)
        },
      )
      stream.end(buffer)
    })

    return created({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
    })
  } catch (e) {
    return serverError(e)
  }
}
