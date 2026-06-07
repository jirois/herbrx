import Link from "next/link";
import { Logo } from "@/components/layout/logo";

const footerCols = [
  {
    heading: "Services",
    links: [
      { label: "Safety Reviews", href: "/services/safety-reviews" },
      { label: "Consultations", href: "/booking" },
      { label: "Submit a Product", href: "/submit" },
      { label: "Producer Help", href: "/services/producers" },
      { label: "Safety Alerts", href: "/alerts" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About HerbRx", href: "/about" },
      { label: "Our Team", href: "/about#team" },
      { label: "Blog", href: "/blog" },
      { label: "Press", href: "/press" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Herb Directory", href: "/herbs" },
      { label: "Safety Guides", href: "/guides" },
      { label: "FAQ", href: "/faq" },
      { label: "Store", href: "/store" },
      { label: "Newsletter", href: "/#newsletter" },
    ],
  },
];

const socials = [
  { label: "Twitter / X", icon: "𝕏", href: "https://x.com/herbrxng" },
  {
    label: "LinkedIn",
    icon: "in",
    href: "https://linkedin.com/company/herbrx",
  },
  { label: "Facebook", icon: "f", href: "https://facebook.com/herbrxng" },
  { label: "Instagram", icon: "◎", href: "https://instagram.com/herbrxng" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-(--text-dark) pt-16">
      <div className="max-w-(--max-width) mx-auto px-6 lg:px-10">
        {/* Main columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12 pb-12 border-b border-white/8">
          {/* Brand column */}
          <div>
            <Logo light className="mb-5" />
            <p className="text-[14px] text-white/45 leading-relaxed font-light max-w-65 mb-5">
              Combining time-tested herbal wisdom with modern research to
              deliver safe, effective natural remedies for Nigerians.
            </p>

            {/* NAFDAC badge */}
            <div className="inline-flex items-center gap-2 bg-white/6 border border-white/10 rounded-lg px-3.5 py-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50] shrink-0" />
              <span className="text-[12px] text-white/50">
                NAFDAC-Compliant Standards
              </span>
            </div>

            {/* Social links */}
            <div className="flex gap-2.5 flex-wrap mt-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 bg-white/[8 rounded-lg flex items-center justify-center text-white/50 text-[14px] font-semibold hover:bg-(--green-mid) hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footerCols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[11px] font-medium text-white/35 uppercase tracking-[0.12em] mb-5">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-white/60 font-light hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <p className="text-[13px] text-white/30">
            &copy; {year} HerbRx. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-6" aria-label="Legal navigation">
            {[
              ["Privacy Policy", "/privacy"],
              ["Terms of Use", "/terms"],
              ["Cookie Policy", "/cookies"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] text-white/30 hover:text-white/60 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
