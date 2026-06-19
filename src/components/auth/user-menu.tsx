"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  LogOut,
  ChevronDown,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  if (!user) return null;

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-(--cream-dark) transition-colors"
        aria-label="Account menu"
        aria-expanded={open}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "User avatar"}
            className="w-8 h-8 rounded-full object-cover"
            width={32}
            height={32}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-(--green-deep) text-white text-[13px] font-semibold flex items-center justify-center shrink-0">
            {initials}
          </div>
        )}
        <span className="text-[13px] font-medium text-(--text-dark) max-w-22.5 truncate hidden lg:block">
          {user.firstName}
        </span>
        <ChevronDown
          size={13}
          className={`text-(--text-muted) transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_32px_rgba(26,58,42,0.14)] border border-(--cream-dark) py-2 z-50"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-(--cream-dark)">
              <p className="text-[13px] font-semibold text-(--text-dark) truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-(--text-muted) truncate">
                {user.email}
              </p>
            </div>

            <div className="py-1">
              {[
                {
                  href: "/dashboard",
                  icon: <LayoutDashboard size={15} />,
                  label: "Merchant Dashboard",
                },
                {
                  href: "/account",
                  icon: <User size={15} />,
                  label: "My Account",
                },
                {
                  href: "/account/orders",
                  icon: <Package size={15} />,
                  label: "My Orders",
                },
                {
                  href: "/account/settings",
                  icon: <Settings size={15} />,
                  label: "Settings",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-(--text-body) hover:bg-(--cream) hover:text-(--green-deep) transition-colors"
                >
                  <span className="text-(--text-muted)">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-(--cream-dark) py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
