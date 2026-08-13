import { ComponentType } from "react"

export interface Product {
 id: string;
  slug: string;

  name: string;
  category: string;
  type: string;

  price: number;
  originalPrice?: number | null;

  imageUrl?: string | null;
  emoji?: string;

  shortDesc: string;
  longDesc: string;

  ingredients: string[];
  warnings: string[];

  nafdacNo?: string | null;

  inStock: boolean;
  stockCount: number;

  rating: number;
  reviews: number;

  featured: boolean;

  howToUse?: string

 badge: 'Bestseller' | 'Verified' | 'New' | 'Limited'
  badgeVariant: 'gold' | 'green' | 'teal'

  unit: string;

  gradientFrom: string;
  gradientTo: string;

  tags: string[];

  producer?: string;

  createdAt: string;
  updatedAt: string;
  
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
  role?: string
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

// Store Product
export interface StoreProduct {
  id: string;
  slug: string;

  name: string;
  category: string;
  type?: string;

  price: number;
  originalPrice?: number | null;

  imageUrl?: string | null;
  emoji?: string;

  producer?: string;


  description?: string;

  inStock?: boolean;
  stockCount?: number;
  rating: number;
  reviews: number

  unit?: string;
  badge?: 'Bestseller' | 'Verified' | 'New' | 'Limited' | null;
  badgeVariant?: 'gold' | 'green' | 'teal' | null;
  tags?: string[];
  featured?: boolean;

}

export interface RelatedProduct {
  id: string;
  slug: string;

  name: string;
  category: string;

  price: number;

  imageUrl?: string | null;
  emoji?: string;

  badge?: 'Bestseller' | 'Verified' | 'New' | 'Limited' | null;
  badgeVariant?: 'gold' | 'green' | 'teal' | null;
}

export interface StoreProductDetail {
  id: string;
  slug: string;

  name: string;
  category: string;

  type: string;

  price: number;
  originalPrice?: number | null;

  imageUrl?: string | null;

  emoji?: string;

  shortDesc: string;

  longDesc: string;

  ingredients: string[];

  warnings: string[];

  nafdacNo?: string | null;

  howToUse?: string;

  stockCount: number;

  inStock: boolean;

  rating: number | 0
  
  reviewCount: number | 0

   unit?: string;
  badge?: 'Bestseller' | 'Verified' | 'New' | 'Limited' | null;
  badgeVariant?: 'gold' | 'green' | 'teal' | null;
  tags?: string[];

  producer?: string;

  relatedProducts: RelatedProduct[];
}

export interface StoreProductsResponse {
  products: StoreProduct[];
}

export interface StoreProductResponse {
  product: StoreProductDetail;
}