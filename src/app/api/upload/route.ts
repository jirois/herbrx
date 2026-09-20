import { NextRequest }  from 'next/server'
import { requireAuth, created, badRequest, serverError } from '@/lib/api-helpers'
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary'
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

// Cloudinary's SDK can't run on the Edge runtime.
export const runtime = 'nodejs'

/**
 * POST /api/upload
 * Accepts a multipart/form-data file and uploads it to Cloudinary.
 *
 * This route previously returned a fabricated `https://cdn.herbrx.ng/...`
 * URL with no upload ever happening — a leftover placeholder from before
 * Cloudinary was wired up, which is exactly why any link saved from it was
 * dead on arrival. Nothing in the app currently calls this route directly
 * (uploads go through /api/upload/document instead), but it's fixed here
 * too rather than left as a trap for the next thing that calls it.
 *
 * Body (FormData):
 *   file    — the file to upload
 *   folder  — optional subfolder: 'coa' | 'verification' | 'general'
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
    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const folderInput = (formData.get('folder') as string) ?? 'general'
    const folder = (['coa', 'verification', 'general'] as const).includes(folderInput as never)
      ? folderInput
      : 'general'

    if (!file) return badRequest('No file provided')

    const maxSize = 10 * 1024 * 1024 // 10 MB
    if (file.size > maxSize) return badRequest('File too large (max 10 MB)')

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return badRequest('Invalid file type. Allowed: PDF, JPEG, PNG, WEBP')
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const userId = (session!.user as { id?: string }).id ?? 'anon'
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 60)

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `herbrx/${folder}`,
          resource_type: 'auto',
          public_id: `${userId}-${Date.now()}-${safeName}`,
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

    return created({ url: result.secure_url, name: file.name, size: file.size, public_id: result.public_id })
  } catch (e) {
    return serverError(e)
  }
}
