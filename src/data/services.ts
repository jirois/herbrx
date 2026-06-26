import {
     HerbShieldIcon,
  HerbalConsultationIcon,
  ResearchLeafIcon,
  ComplianceIcon,
  ProductReviewIcon,
  SafetyAlertIcon,
  NigeriaIcon,
  ScienceIcon,
  LanguageIcon,
  HerbIcon,
  VerifiedIcon,
  WhyItemNigeriaIcon,
  WhyItemLocaltrustIcon,
  WhyItemScienceIcon,
  WhyItemVerifyIcon
} from '@/components/icons'
import type { Service, Testimonial, Stat, NavLink, TrustItem } from '@/types'

export const services: Service[] =[
    {
    id: 'safety-reviews',
    icon: HerbShieldIcon,
    title: 'Safety Reviews',
    description: 'Independent, science-backed evaluation of herbal products circulating in Nigeria — no sponsorships, no bias.',
    linkText: 'Learn more',
    href: '/services/safety-reviews',
  },
  {
    id: 'expert-consultation',
    icon: HerbalConsultationIcon,
    title: 'Expert Consultation',
    description: 'One-on-one sessions with our herbal pharmacists to build safe, personalised remedy plans for your health.',
    linkText: 'Book a session',
    href: '/booking',
    highlight: true,
  },
  {
    id: 'educational-resources',
    icon: ResearchLeafIcon,
    title: 'Educational Resources',
    description: 'Guides, articles, and video content explaining herbal benefits, risks, and best practices in your language.',
    linkText: 'Explore resources',
    href: '/resources',
  },
  {
    id: 'producer-consultancy',
    icon: ComplianceIcon,
    title: 'Producer Consultancy',
    description: 'Help herbal brand owners improve formulation, labelling, and NAFDAC compliance for better product safety.',
    linkText: 'For producers',
    href: '/services/producers',
  },
  {
    id: 'product-submission',
    icon: ProductReviewIcon,
    title: 'Product Submission',
    description: 'Submit your herbal product for a professional review and receive a detailed safety and efficacy report.',
    linkText: 'Submit now',
    href: '/submit',
  },
  {
    id: 'safety-alerts',
    icon: SafetyAlertIcon,
    title: 'Safety Alerts',
    description: 'Subscribe to receive immediate alerts when harmful or counterfeit herbal products are identified in the market.',
    linkText: 'Subscribe',
    href: '/alerts',
  },

]

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote: "Before HerbRx, I never knew how risky some local herbs could be. Their expert tips gave me confidence to use the right blends for my health. It's like having a herbal pharmacist on my phone.",
    author: 'Ifeoma Adaeze',
    location: 'Enugu',
    role: 'A New Believer',
    initials: 'IA',
    avatarBg: '#C8DABB',
    avatarColor: '#2D5A3D',
  },
  {
    id: 't2',
    quote: 'The consultancy from HerbRx helped me clean up my production process and label my products better. Customers trust me more now. My sales have literally doubled.',
    author: 'Sani Yusuf',
    location: 'Kaduna',
    role: 'Local Herbal Producer',
    initials: 'SY',
    avatarBg: '#F5E8CE',
    avatarColor: '#B8832A',
  },
  {
    id: 't3',
    quote: "HerbRx stands out — it's clean, science-backed, and deeply Nigerian. I even shared their liver detox guide with my mum, and she has been feeling so much better.",
    author: 'Ngozi Eze',
    location: 'Lagos',
    role: 'Wellness Enthusiast',
    initials: 'NE',
    avatarBg: '#C2DDD5',
    avatarColor: '#1A6B5A',
  },
  {
    id: 't4',
    quote: "HerbRx stands out — it's clean, science-backed, and deeply Nigerian. I even shared their liver detox guide with my mum, and she has been feeling so much better.",
    author: 'Francis Ademola',
    location: 'Lagos',
    role: 'Wellness Enthusiast',
    initials: 'NE',
    avatarBg: '#C2DDD5',
    avatarColor: '#1A6B5A',
  },
]

export const stats: Stat[] = [
  { value: 2000, suffix: '+', label: 'Nigerians Served' },
  { value: 150, suffix: '+', label: 'Herbs Reviewed' },
  { value: 4, suffix: '', label: 'Languages Spoken' },
  { value: 98, suffix: '%', label: 'Safe-use Rate' },
]

export const navLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Store', href: '/store', isNew: true },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export const trustItems: TrustItem[] = [
  { icon: NigeriaIcon, label: 'Made for Nigerians' },
  { icon: ScienceIcon, label: 'Evidence-Based Reviews' },
  { icon: LanguageIcon, label: 'English · Igbo · Yoruba · Hausa · Pidgin' },
  { icon: HerbIcon, label: '150+ Herbs Reviewed' },
  { icon: VerifiedIcon, label: 'NAFDAC-Compliant Standards' },
]

export const whyItems = [
  {
    icon: WhyItemScienceIcon,
    title: 'Science + Tradition',
    desc: 'Verified herbal knowledge meets modern safety standards — every claim is evidence-based.',
  },
  {
    icon: WhyItemLocaltrustIcon,
    title: 'Local & Trusted',
    desc: 'We speak your language — English, Igbo, Yoruba, Hausa, and Pidgin.',
  },
  {
    icon: WhyItemVerifyIcon,
    title: 'We Verify',
    desc: 'Our reviews are unbiased and driven purely by herbal science — never by sponsorships.',
  },
  {
    icon: WhyItemNigeriaIcon,
    title: 'Made for Nigerians',
    desc: 'Every guide, review, and service is tailored to local health needs and realities.',
  },
]
