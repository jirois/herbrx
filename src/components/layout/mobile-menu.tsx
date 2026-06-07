"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/services";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "fixed top-0 right-0 bottom-0 w-75 z-50 lg:hidden",
              "bg-(--cream) flex flex-col",
              "shadow-[-8px_0_40px_rgba(26,58,42,0.15)]",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-(--cream-dark)">
              <span className="font-serif text-[18px] font-semibold text-(--green-deep)">
                Menu
              </span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-(--cream-dark) transition-colors"
                aria-label="Close menu"
              >
                <X size={18} className="text-(--text-body)" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="space-y-1">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl",
                          "text-[15px] font-medium transition-all duration-200",
                          isActive
                            ? "bg-(--green-deep) text-white"
                            : "text-(--text-body) hover:bg-(--green-pale)/40 hover:text-(--green-deep)",
                        )}
                      >
                        {link.label}
                        {link.isNew && (
                          <span className="text-[10px] bg-(--gold) text-white px-2 py-0.5 rounded-full font-medium tracking-wide">
                            New
                          </span>
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>

            {/* CTA footer */}
            <div className="px-6 py-6 border-t border-(--cream-dark) space-y-3">
              <Button
                variant="outline"
                size="md"
                href="/booking"
                className="w-full justify-center"
              >
                Book Consultation
              </Button>
              <Button
                variant="primary"
                size="md"
                href="/store"
                className="w-full justify-center"
              >
                Shop Now
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
