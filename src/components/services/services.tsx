"use client";
import { ServiceCard } from "./service-card";
import { SectionTitle } from "@/components/ui/section-title";
import {
  HerbShieldIcon,
  HerbalConsultationIcon,
  ResearchLeafIcon,
  ComplianceIcon,
  ProductReviewIcon,
  SafetyAlertIcon,
} from "@/components/icons";

export function Services() {
  return (
    <section className="bg-(--cream) py-20 lg:py-24" id="services">
      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
        <SectionTitle
          tag="What We Do"
          title="Our Services"
          subtitle="From safety reviews to expert consultancy, we provide every tool you need to navigate herbal wellness with confidence."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export const services = [
  {
    id: "safety-reviews",
    icon: HerbShieldIcon,
    title: "Safety Reviews",
    description:
      "Independent, science-backed evaluation of herbal products circulating in Nigeria — no sponsorships, no bias.",
    linkText: "Learn more",
    href: "/services/safety-reviews",
  },
  {
    id: "expert-consultation",
    icon: HerbalConsultationIcon,
    title: "Expert Consultation",
    description:
      "One-on-one sessions with our herbal pharmacists to build safe, personalised remedy plans for your health.",
    linkText: "Book a session",
    href: "/booking",
    highlight: true,
  },
  {
    id: "educational-resources",
    icon: ResearchLeafIcon,
    title: "Educational Resources",
    description:
      "Guides, articles, and video content explaining herbal benefits, risks, and best practices in your language.",
    linkText: "Explore resources",
    href: "/resources",
  },
  {
    id: "producer-consultancy",
    icon: ComplianceIcon,
    title: "Producer Consultancy",
    description:
      "Help herbal brand owners improve formulation, labelling, and NAFDAC compliance for better product safety.",
    linkText: "For producers",
    href: "/services/producers",
  },
  {
    id: "product-submission",
    icon: ProductReviewIcon,
    title: "Product Submission",
    description:
      "Submit your herbal product for a professional review and receive a detailed safety and efficacy report.",
    linkText: "Submit now",
    href: "/submit",
  },
  {
    id: "safety-alerts",
    icon: SafetyAlertIcon,
    title: "Safety Alerts",
    description:
      "Subscribe to receive immediate alerts when harmful or counterfeit herbal products are identified in the market.",
    linkText: "Subscribe",
    href: "/alerts",
  },
];
