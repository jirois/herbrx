import { ComponentType } from "react"

export interface Product {
    id: string
    name: string
    type: string
    price: number
    unit: string
    emoji: string
    gradientFrom: string
    gradientTo: string
    badge: 'Bestseller' | 'Verified' | 'New' | 'Limited'
    badgeVariant: 'gold' | "green" | "teal"
    rating: number
    reviews: number
    inStock: boolean
    slug: string;
    shortDesc: string
    tags: string[]
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