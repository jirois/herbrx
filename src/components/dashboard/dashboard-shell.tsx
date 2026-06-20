"use client";

import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Package,
  Banknote,
  AlertTriangle,
  Settings,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Sparkles,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  external?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Payments",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
      {
        href: "/dashboard/transactions",
        icon: CreditCard,
        label: "Transactions",
      },
      { href: "/dashboard/customers", icon: Users, label: "Customers" },
      { href: "/dashboard/settlements", icon: Banknote, label: "Settlements" },
      { href: "/dashboard/disputes", icon: AlertTriangle, label: "Disputes" },
    ],
  },
  {
    label: "Products",
    items: [
      { href: "/dashboard/products", icon: Package, label: "Products" },
      {
        href: "/store",
        icon: ShoppingBag,
        label: "Storefront",
        external: true,
      },
    ],
  },
];

interface DashboardShellProps {
  children: React.ReactNode;
  heading?: string;
  subheading?: string;
}

export function DashboardShell({
  children,
  heading,
  subheading,
}: DashboardShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSidebarOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, sidebarOpen]);

  const user = session?.user as
    | { firstName?: string; lastName?: string }
    | undefined;
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "HX";

  const Sidebar = (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full w-60 bg-[#161B27] border-r border-white/[0.07]",
        "flex flex-col z-50",
        "transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto lg:shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.07] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-(--green-mid) flex items-center justify-center font-serif italic font-semibold text-[14px] text-white">
            Hx
          </div>
          <div>
            <span className="font-serif text-[16px] font-semibold text-white block leading-none">
              HerbRx
            </span>
            <span className="text-[10px] text-white/35 tracking-wider uppercase block mt-0.5">
              Merchant
            </span>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white/40 hover:text-white p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] uppercase tracking-[0.14em] text-white/30 font-medium px-3 mb-2">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-(--green-mid) text-white shadow-[0_2px_8px_rgba(45,90,61,0.4)]"
                          : "text-white/55 hover:text-white hover:bg-white/6",
                      )}
                    >
                      <item.icon size={16} className="shrink-0" />
                      {item.label}
                      {item.external && (
                        <ChevronRight
                          size={12}
                          className="ml-auto opacity-40"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Command Centre */}
      <div className="mx-3 mb-3 p-3.5 rounded-xl bg-linear-to-br from-(--green-deep) to-[#0D2419] border border-(--green-mid)/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-(--gold-light)" />
          <span className="text-[12px] font-semibold text-white">
            Command Centre
          </span>
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed mb-2.5">
          Ask anything about your business in plain language.
        </p>
        <button className="w-full text-[11px] bg-(--green-mid)/30 hover:bg-(--green-mid)/50 text-(--gold-light) py-1.5 rounded-lg transition-colors font-medium">
          Coming Soon
        </button>
      </div>

      {/* User */}
      <div className="border-t border-white/[0.07] px-3 py-4 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/4 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-(--green-mid) flex items-center justify-center text-[12px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-white/40 truncate">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400"
            aria-label="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0F1117] text-white flex dashboard-root">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {Sidebar}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16border-b border-white/[0.07] bg-[#161B27] flex items-center gap-4 px-6 sticky top-0 z-20 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/50 hover:text-white"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Search trigger */}
          <div className="flex-1 max-w-90">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/[0.07] hover:border-white/15 text-white/40 hover:text-white/60 text-[13px] transition-all"
            >
              <Search size={14} />
              <span>Search transactions, customers…</span>
              <kbd className="ml-auto text-[10px] bg-white/[0.07] px-1.5 py-0.5 rounded font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/[0.07] hover:border-white/15 text-white/50 hover:text-white transition-all relative"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-(--gold)] rounded-full" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    key="notif"
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-full mt-2 w-[320px] bg-[#1E2535] border border-white/1 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-white">
                        Notifications
                      </span>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-white/40 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {[
                      {
                        icon: "💳",
                        title: "Payment received",
                        desc: "₦4,500 from Chioma Okafor",
                        time: "2 min ago",
                        unread: true,
                      },
                      {
                        icon: "📦",
                        title: "Order shipped",
                        desc: "ORD-0042 dispatched",
                        time: "1 hr ago",
                        unread: true,
                      },
                      {
                        icon: "⚠️",
                        title: "Payment failed",
                        desc: "ORD-0039 — card declined",
                        time: "3 hr ago",
                        unread: false,
                      },
                      {
                        icon: "🌿",
                        title: "New review published",
                        desc: "Moringa Gold Capsules",
                        time: "Yesterday",
                        unread: false,
                      },
                    ].map((n, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 hover:bg-white/4 cursor-pointer",
                          n.unread && "bg-white/2.5",
                        )}
                      >
                        <span className="text-[20px] shrink-0 mt-0.5">
                          {n.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-white flex items-center gap-2">
                            {n.title}
                            {n.unread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-(--gold) shrink-0" />
                            )}
                          </p>
                          <p className="text-[12px] text-white/45 truncate">
                            {n.desc}
                          </p>
                        </div>
                        <span className="text-[11px] text-white/30 shrink-0 mt-0.5">
                          {n.time}
                        </span>
                      </div>
                    ))}
                    <div className="px-4 py-2.5 border-t border-white/[0.07] text-center">
                      <button className="text-[12px] text-(--green-pale) hover:text-white transition-colors">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/dashboard/settings"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/7 hover:border-white/15 text-white/50 hover:text-white transition-all"
            >
              <Settings size={16} />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {(heading || subheading) && (
            <div className="mb-8">
              {heading && (
                <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-semibold text-white">
                  {heading}
                </h1>
              )}
              {subheading && (
                <p className="text-[14px] text-white/45 font-light mt-1">
                  {subheading}
                </p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              key="search-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-100"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              key="search-modal"
              initial={{ opacity: 0, scale: 0.97, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.18 }}
              className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-135 bg-[#1E2535] border border-white/10 rounded-2xl shadow-2xl z-101 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.07]">
                <Search size={18} className="text-white/40 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search transactions, customers, products…"
                  className="flex-1 bg-transparent text-[15px] text-white placeholder:text-white/30 outline-none"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-white/30 hover:text-white text-[12px] border border-white/10 px-2 py-1 rounded font-mono"
                >
                  ESC
                </button>
              </div>
              <div className="py-3 px-4">
                <p className="text-[11px] uppercase tracking-widest text-white/25 font-medium mb-3">
                  Quick Links
                </p>
                {[
                  {
                    icon: CreditCard,
                    label: "Transactions",
                    href: "/dashboard/transactions",
                  },
                  {
                    icon: Users,
                    label: "Customers",
                    href: "/dashboard/customers",
                  },
                  {
                    icon: Package,
                    label: "Products",
                    href: "/dashboard/products",
                  },
                  { icon: TrendingUp, label: "Analytics", href: "/dashboard" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/6 text-white/60 hover:text-white transition-all"
                  >
                    <item.icon size={16} className="text-white/30" />
                    <span className="text-[13px]">{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
