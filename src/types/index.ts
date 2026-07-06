import { ComponentType } from "react"

export interface Product {
  id: string
  name: string
  type: string
  price: number
  originalPrice?: number
  unit: string
  emoji: string
  gradientFrom: string
  gradientTo: string
  badge: 'Bestseller' | 'Verified' | 'New' | 'Limited'
  badgeVariant: 'gold' | 'green' | 'teal'
  rating: number
  reviews: number
  inStock: boolean
  stockCount?: number
  slug: string
  shortDesc: string
  longDesc?: string
  ingredients?: string[]
  howToUse?: string
  warnings?: string[]
  tags: string[]
  category: string
  images?: string[]
  featured?: boolean
}
export interface Service {
    id: string;
    icon: ComponentType;
    title: string;
    description: string;
    linkText: string;
    href: string;
    highlight?: boolean
}

export interface Testimonial{
    id: string
    quote: string;
    author: string;
    location: string;
    role: string;
    initials: string;
    avatarBg: string;
    avatarColor: string;
}

export interface Stat {
    value: number;
    suffix: string;
    label: string;
    prefix?: string;
}

export interface NavLink {
    label: string;
    href: string;
    isNew?: boolean;
}

export interface TrustItem {
    icon: ComponentType;
    label: string;
}

// ── Cart ─────
export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

// ── Order ───
export interface OrderCustomer {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
}

export interface Order {
  id: string
  paystackRef?: string
  paystackTxId?: number
  items: CartItem[]
  customer: OrderCustomer
  subtotal: number
  shipping: number
  total: number
  paymentMethod: 'card' | 'transfer' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed'
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
}

// ── Paystack ────
export interface PaystackInitializeRequest {
  email: string
  amount: number           // in kobo
  reference: string
  metadata: PaystackMetadata
  callback_url?: string
  channels?: string[]
}

export interface PaystackMetadata {
  orderId: string
  customerId?: string
  customer_name: string
  items_summary: string
  cancel_action?: string
}

export interface PaystackInitializeResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    status: 'success' | 'failed' | 'abandoned'
    reference: string
    amount: number
    paid_at: string
    channel: string
    customer: {
      email: string
      first_name: string
      last_name: string
    }
    metadata: PaystackMetadata
  }
}

// ── Auth / User ─────
export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  phone?: string
  image?: string
  createdAt: string
}

export interface AuthSession {
  user: User
  expires: string
}

// ── RBAC ─────
export type UserRole = 'CUSTOMER' | 'PRODUCER' | 'ADMIN'

// ── Producer ───────
export type ProducerTier = 'UNVERIFIED' | 'VERIFIED'
export type ProductStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'FLAGGED' | 'BANNED'
export type BatchStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'

export interface ProducerProfile {
  id: string
  businessName: string
  businessEmail?: string
  rcNumber?: string
  nafdacNumber?: string
  tier: ProducerTier
  verifiedAt?: string
}

export interface ProducerProduct {
  id: string
  name: string
  description?: string
  category?: string
  status: ProductStatus
  flagReason?: string
  createdAt: string
  batchSubmissions: BatchSubmission[]
}

export interface BatchSubmission {
  id: string
  batchNo: string
  coaFileUrl: string
  labName?: string
  testedAt?: string
  reviewStatus: BatchStatus
  reviewNotes?: string
  createdAt: string
}

// ── Customer ────────────
export interface SavedMedication {
  id: string
  name: string
  dose?: string
  frequency?: string
}

export type ConsultationType = 'HERBALIST' | 'NATUROPATH' | 'TOXICOLOGIST' | 'PHARMACIST'
export type ConsultationStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface Consultation {
  id: string
  type: ConsultationType
  status: ConsultationStatus
  scheduledAt?: string
  notes?: string
  meetingUrl?: string
  createdAt: string
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'DANGER'

export interface SafetyAlert {
  id: string
  title: string
  body: string
  severity: AlertSeverity
  productName?: string
  batchNo?: string
  status: 'ACTIVE' | 'RESOLVED'
  publishedAt: string
}

// ── Admin ────────────
export interface AdminAction {
  id: string
  action: string
  targetType: string
  targetId: string
  reason?: string
  createdAt: string
}
