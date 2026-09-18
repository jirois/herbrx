"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  LogIn,
  LayoutDashboard,
  User,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/services";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { user, isLoggedIn, isLoading, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

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

            {/* Account */}
            {!isLoading && (
              <div className="px-4 pt-5 pb-1 border-b border-(--cream-dark)">
                {isLoggedIn && user ? (
                  <>
                    <div className="flex items-center gap-3 px-2 pb-4">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name ?? "User avatar"}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-(--green-deep) text-white text-[14px] font-semibold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-(--text-dark) truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[12px] text-(--text-muted) truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <ul className="space-y-1 pb-3">
                      {[
                        {
                          href: "/dashboard",
                          icon: <LayoutDashboard size={17} />,
                          label: "Dashboard",
                        },
                        {
                          href: "/account",
                          icon: <User size={17} />,
                          label: "My Account",
                        },
                        {
                          href: "/account/orders",
                          icon: <Package size={17} />,
                          label: "My Orders",
                        },
                        {
                          href: "/account/settings",
                          icon: <Settings size={17} />,
                          label: "Settings",
                        },
                      ].map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-(--text-body) hover:bg-(--green-pale)/40 hover:text-(--green-deep) transition-colors"
                          >
                            <span className="text-(--text-muted)">
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={() => {
                            onClose();
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={17} />
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </>
                ) : (
                  <div className="pb-4">
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 w-full bg-(--green-deep) hover:bg-(--green-mid) text-white text-[14px] font-medium px-4 py-3 rounded-xl transition-colors"
                    >
                      <LogIn size={16} /> Sign In
                    </Link>
                    <p className="text-center text-[12px] text-(--text-muted) mt-2.5">
                      New to HerbRx?{" "}
                      <Link
                        href="/register"
                        onClick={onClose}
                        className="text-(--green-deep) font-medium hover:underline"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            )}

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
