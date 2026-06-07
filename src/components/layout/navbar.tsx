"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/data/services";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {/* Topbar */}
      <div className="bg-[var(--green-deep)] text-white/75 text-center py-2 px-4 text-[12px] tracking-[0.06em]">
        🌿 NAFDAC-Compliant Reviews &nbsp;·&nbsp;{" "}
        <span className="text-[var(--gold-light)] font-medium">
          Free consultation for first-time users
        </span>{" "}
        &nbsp;·&nbsp; Trusted by 2,000+ Nigerians
      </div>

      {/* Sticky header */}
      <motion.header
        className={cn(
          "sticky top-0 z-30 bg-[var(--cream)] border-b border-[var(--cream-dark)]",
          "transition-shadow duration-300",
          scrolled && "shadow-[0_2px_20px_rgba(26,58,42,0.08)]",
        )}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="max-w-[var(--max-width)] mx-auto px-6 lg:px-10 flex items-center justify-between h-[72px]">
          <Logo />

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-8"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-[14px] tracking-[0.02em] transition-colors duration-200 animated-underline",
                    isActive
                      ? "text-[var(--green-deep)] font-medium"
                      : "text-[var(--text-body)] hover:text-[var(--green-deep)] font-normal",
                  )}
                >
                  {link.label}
                  {link.isNew && (
                    <span className="absolute -top-2.5 -right-4 text-[9px] bg-[var(--gold)] text-white px-1.5 py-0.5 rounded-full font-semibold tracking-wide">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="outline" size="sm" href="/booking">
              Book Consultation
            </Button>
            <Button
              variant="primary"
              size="sm"
              href="/store"
              className="relative"
            >
              <ShoppingBag size={15} />
              Shop Now
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--gold)] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--cream-dark)] transition-colors"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            <Menu size={22} className="text-[var(--green-deep)]" />
          </button>
        </div>
      </motion.header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
