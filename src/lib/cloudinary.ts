import { v2 as cloudinary } from 'cloudinary'

// Standard, explicit env vars (preferred — matches Cloudinary's own docs):
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
//
// Falls back to a single CLOUDINARY_URL ("cloudinary://key:secret@cloud_name")
// if that's what's set instead — cloudinary.config() auto-parses it from env
// when no explicit args are passed, so nothing else to do there.
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey    = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

export const isCloudinaryConfigured = Boolean(
  (cloudName && apiKey && apiSecret) || process.env.CLOUDINARY_URL
)

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true })
} else if (process.env.NODE_ENV !== 'production') {
  // Loud in dev, silent in prod (avoid leaking config state into logs there)
  console.warn(
    '[Cloudinary] Not configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, ' +
    'and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) to enable document uploads.'
  )
}

export default cloudinary
