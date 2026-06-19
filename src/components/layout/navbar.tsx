"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { LanguageSwitcher } from "./language-switcher";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/user-menu";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useT } from "@/context/locale-context";
import { navLinks } from "@/data/services";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const { isLoggedIn, isLoading } = useAuth();
  const t = useT();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Map nav link labels to translation keys
  const navLabelKeys: Record<string, string> = {
    Home: t("nav_home"),
    Services: t("nav_services"),
    Store: t("nav_store"),
    About: t("nav_about"),
    Blog: t("nav_blog"),
    Contact: t("nav_contact"),
  };

  return (
    <>
      {/* Topbar */}
      <div className="bg-(--green-deep) text-white/75 text-center py-2 px-4 text-[12px] tracking-[0.06em]">
        🌿 {t("topbar_text")} &nbsp;·&nbsp;{" "}
        <span className="text-(--gold-light) font-medium">
          {t("topbar_offer")}
        </span>
        &nbsp;·&nbsp; {t("topbar_trust")}
      </div>

      <motion.header
        className={cn(
          "sticky top-0 z-30 bg-(--cream) border-b border-(--cream-dark) transition-shadow duration-300",
          scrolled && "shadow-[0_2px_20px_rgba(26,58,42,0.08)]",
        )}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="max-w-(--max-width) mx-auto px-6 lg:px-10 flex items-center justify-between h-18">
          <Logo />

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-7"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const label = navLabelKeys[link.label] ?? link.label;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-[14px] tracking-[0.02em] transition-colors duration-200 animated-underline",
                    isActive
                      ? "text-(--green-deep) font-medium"
                      : "text-(--text-body) hover:text-(--green-deep) font-normal",
                  )}
                >
                  {label}
                  {link.isNew && (
                    <span className="absolute -top-2.5 -right-4 text-[9px] bg-(--gold) text-white px-1.5 py-0.5 rounded-full font-semibold">
                      NEW
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 border border-(--cream-dark) hover:border-(--green-mid) text-(--text-body) hover:text-(--green-deep) px-4 h-9 rounded-full text-[13px] font-medium transition-all"
              aria-label={`${t("nav_cart")} — ${itemCount} items`}
            >
              <ShoppingBag size={15} />
              {t("nav_cart")}
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-(--gold) text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 9 ? "9+" : itemCount}
                </motion.span>
              )}
            </button>

            {/* Auth */}
            {!isLoading &&
              (isLoggedIn ? (
                <UserMenu />
              ) : (
                <Button variant="primary" size="sm" href="/login">
                  <LogIn size={14} /> {t("nav_signin")}
                </Button>
              ))}
          </div>

          {/* Mobile: lang + cart + hamburger */}
          <div className="lg:hidden flex items-center gap-1.5">
            <LanguageSwitcher />
            <button
              onClick={openCart}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-(--cream-dark) transition-colors"
              aria-label={t("nav_cart")}
            >
              <ShoppingBag size={19} className="text-(--green-deep)" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-(--gold) text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-(--cream-dark) transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-(--green-deep)" />
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
