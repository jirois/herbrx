"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminApi, useAdminUsers } from "@/hooks/dashboard-hooks";
import {
  Search,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
  Package,
  ShoppingBag,
  BadgeCheck,
  Eye,
  X,
  AlertTriangle,
  Activity,
  Loader2,
  Lock,
  Unlock,
  BadgeAlert,
} from "lucide-react";
import type { UserRole } from "@/types";

// ── Types ───────
type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  lastActive: string;
  // Customer specific
  orders?: number;
  totalSpend?: number;
  // Producer specific
  businessName?: string;
  tier?: "UNVERIFIED" | "VERIFIED";
  productCount?: number;
  // Flags
  flagCount: number;
  notes: string;
}

// // ── Mock data ───────
// const INITIAL_USERS: ManagedUser[] = [
//   {
//     id: "u1",
//     firstName: "Amaka",
//     lastName: "Okafor",
//     email: "amaka.okafor@gmail.com",
//     phone: "+234 803 456 7890",
//     role: "CUSTOMER",
//     status: "ACTIVE",
//     emailVerified: true,
//     createdAt: "2024-03-12",
//     lastActive: "2 hours ago",
//     orders: 7,
//     totalSpend: 42500,
//     flagCount: 0,
//     notes: "",
//   },
//]

// ── Config ───────
const roleConfig: Record<
  UserRole,
  { badge: string; label: string; icon: React.ReactNode }
> = {
  CUSTOMER: {
    badge: "bg-[var(--green-mid)]/20 text-[var(--green-pale)]",
    label: "Customer",
    icon: <ShoppingBag size={11} />,
  },
  PRODUCER: {
    badge: "bg-amber-500/20 text-amber-300",
    label: "Producer",
    icon: <Package size={11} />,
  },
  ADMIN: {
    badge: "bg-red-500/20 text-red-300",
    label: "Admin",
    icon: <Shield size={11} />,
  },
};

const statusConfig: Record<
  UserStatus,
  { badge: string; dot: string; label: string }
> = {
  ACTIVE: {
    badge: "bg-green-500/15 text-green-400",
    dot: "bg-green-400",
    label: "Active",
  },
  SUSPENDED: {
    badge: "bg-amber-500/15 text-amber-400",
    dot: "bg-amber-400",
    label: "Suspended",
  },
  BANNED: {
    badge: "bg-red-500/15 text-red-400",
    dot: "bg-red-400",
    label: "Banned",
  },
};

function initials(u: ManagedUser) {
  return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
}

const inputCls =
  "w-full h-10 px-3.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-[var(--green-mid)] transition-all";
const labelCls =
  "block text-[12px] font-medium text-white/50 mb-1.5 uppercase tracking-wider";

// ── User detail modal ─────
function UserDetailModal({
  user,
  onStatusChange,
  onClose,
}: {
  user: ManagedUser;
  onStatusChange: (id: string, status: UserStatus, note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(user.notes);
  const [saving, setSaving] = useState(false);
  const [targetStatus, setTargetStatus] = useState<UserStatus | null>(null);

  const rc = roleConfig[user.role];
  const sc = statusConfig[user.status];

  async function changeStatus(status: UserStatus) {
    setSaving(true);
    setTargetStatus(status);
    await new Promise((r) => setTimeout(r, 900));
    onStatusChange(user.id, status, note);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-[#1A2030] border border-white/10 rounded-2xl w-full max-w-lg my-4 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-5 border-b border-white/[0.07]">
          <div className="w-12 h-12 rounded-full bg-(--green-mid)/30 flex items-center justify-center font-bold text-[15px] text-white shrink-0">
            {initials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-[16px] font-semibold text-white">
                {user.firstName} {user.lastName}
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${rc.badge}`}
              >
                {rc.icon} {rc.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${sc.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{" "}
                {sc.label}
              </span>
            </div>
            <p className="text-[13px] text-white/40">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Mail size={12} />, label: "Email", value: user.email },
              {
                icon: <Phone size={12} />,
                label: "Phone",
                value: user.phone ?? "Not provided",
              },
              {
                icon: <Calendar size={12} />,
                label: "Joined",
                value: user.createdAt,
              },
              {
                icon: <Activity size={12} />,
                label: "Last Active",
                value: user.lastActive,
              },
              ...(user.role === "CUSTOMER"
                ? [
                    {
                      icon: <ShoppingBag size={12} />,
                      label: "Orders",
                      value: String(user.orders ?? 0),
                    },
                    {
                      icon: <ShoppingBag size={12} />,
                      label: "Total Spend",
                      value: `₦${(user.totalSpend ?? 0).toLocaleString()}`,
                    },
                  ]
                : []),
              ...(user.role === "PRODUCER"
                ? [
                    {
                      icon: <Package size={12} />,
                      label: "Business",
                      value: user.businessName ?? "—",
                    },
                    {
                      icon: <BadgeCheck size={12} />,
                      label: "Tier",
                      value: user.tier ?? "UNVERIFIED",
                    },
                    {
                      icon: <Package size={12} />,
                      label: "Products",
                      value: String(user.productCount ?? 0),
                    },
                  ]
                : []),
              {
                icon: <AlertTriangle size={12} />,
                label: "Flags",
                value: String(user.flagCount),
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white/4 border border-white/6 rounded-xl p-3"
              >
                <div className="flex items-center gap-1.5 text-white/30 text-[10px] uppercase tracking-wider mb-0.5">
                  {f.icon} {f.label}
                </div>
                <p className="text-[13px] font-medium text-white">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Admin note */}
          <div>
            <label className={labelCls}>Admin Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal notes about this user (not visible to user)…"
              rows={3}
              className={`${inputCls} h-auto py-3 resize-none`}
            />
          </div>

          {/* Status actions */}
          <div>
            <label className={labelCls}>Account Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  status: "ACTIVE" as UserStatus,
                  icon: <Unlock size={13} />,
                  cls: "border-green-500/25 text-green-400 hover:bg-green-500/15",
                  label: "Activate",
                },
                {
                  status: "SUSPENDED" as UserStatus,
                  icon: <Lock size={13} />,
                  cls: "border-amber-500/25 text-amber-400 hover:bg-amber-500/15",
                  label: "Suspend",
                },
                {
                  status: "BANNED" as UserStatus,
                  icon: <UserX size={13} />,
                  cls: "border-red-500/25 text-red-400 hover:bg-red-500/15",
                  label: "Ban",
                },
              ].map((a) => {
                const isCurrent = user.status === a.status;
                return (
                  <button
                    key={a.status}
                    onClick={() => changeStatus(a.status)}
                    disabled={isCurrent || saving}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-[12px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isCurrent ? "bg-white/8 border-white/15 text-white" : `bg-white/4 ${a.cls}`}`}
                  >
                    {saving && targetStatus === a.status ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      a.icon
                    )}
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ─────
export function UsersManagementPage() {
  const { data, loading } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  // Optimistic local overrides applied on top of fetched data after a status
  // change, keyed by user id — avoids copying fetched data into its own
  // state just to mutate it (which would need an effect + setState).
  const [overrides, setOverrides] = useState<
    Record<string, { status: UserStatus; notes: string }>
  >({});

  const users = useMemo<ManagedUser[]>(() => {
    if (!data?.users) return [];
    return (
      data.users as unknown as Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | null;
        role: UserRole;
        status: UserStatus;
        statusNote?: string | null;
        emailVerified: boolean;
        createdAt: string;
        businessName?: string | null;
        tier?: "UNVERIFIED" | "VERIFIED" | null;
        productCount?: number;
        orders?: number;
        totalSpend?: number;
        flagCount: number;
      }>
    ).map((u) => {
      const override = overrides[u.id];
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone ?? undefined,
        role: u.role,
        status: override?.status ?? u.status,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        lastActive: "—", // no session-activity tracking yet
        orders: u.orders,
        totalSpend: u.totalSpend,
        businessName: u.businessName ?? undefined,
        tier: u.tier ?? undefined,
        productCount: u.productCount,
        flagCount: u.flagCount,
        notes: override?.notes ?? u.statusNote ?? "",
      };
    });
  }, [data, overrides]);

  function handleStatusChange(id: string, status: UserStatus, note: string) {
    setOverrides((prev) => ({ ...prev, [id]: { status, notes: note } }));

    // Sync to API
    adminApi
      .changeUserStatus({
        userId: id,
        action: status === "ACTIVE" ? "ACTIVATE" : status,
        note,
      })
      .catch(() => {});

    setSelectedUser(null);
  }

  const filtered = users.filter((u) => {
    const name =
      `${u.firstName} ${u.lastName} ${u.email} ${u.businessName ?? ""}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const totalCustomers = users.filter((u) => u.role === "CUSTOMER").length;
  const totalProducers = users.filter((u) => u.role === "PRODUCER").length;
  const suspendedBanned = users.filter((u) => u.status !== "ACTIVE").length;
  const verifiedProducers = users.filter(
    (u) => u.role === "PRODUCER" && u.tier === "VERIFIED",
  ).length;

  if (loading && users.length === 0) {
    return (
      <DashboardShell
        heading="User Management"
        subheading="View, filter, and manage all platform users — customers, producers, and admins."
      >
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-(--green-pale)" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      heading="User Management"
      subheading="View, filter, and manage all platform users — customers, producers, and admins."
    >
      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onStatusChange={handleStatusChange}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          {
            label: "Total Customers",
            value: String(totalCustomers),
            color: "text-[var(--green-pale)]",
            bg: "bg-[var(--green-mid)]/10 border-[var(--green-mid)]/20",
          },
          {
            label: "Total Producers",
            value: String(totalProducers),
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/15",
          },
          {
            label: "Verified Producers",
            value: String(verifiedProducers),
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/15",
          },
          {
            label: "Suspended / Banned",
            value: String(suspendedBanned),
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/15",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl border p-5 ${k.bg}`}
          >
            <div className={`text-[26px] font-serif font-semibold ${k.color}`}>
              {k.value}
            </div>
            <div className="text-[12px] text-white/40 mt-0.5">{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/8 rounded-xl text-[14px] text-white placeholder:text-white/30 outline-none focus:border-(--green-mid) transition-colors"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {(["ALL", "CUSTOMER", "PRODUCER", "ADMIN"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${roleFilter === r ? "bg-(--green-mid) text-white border-(--green-mid)" : "border-white/[0.07] text-white/45 hover:text-white bg-white/4"}`}
            >
              {r === "ALL"
                ? "All Roles"
                : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
          <div className="w-px bg-white/8 mx-1" />
          {(["ALL", "ACTIVE", "SUSPENDED", "BANNED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all ${statusFilter === s ? "bg-(--green-mid) text-white border-(--green-mid)" : "border-white/[0.07] text-white/45 hover:text-white bg-white/4"}`}
            >
              {s === "ALL"
                ? "All Status"
                : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white/2 border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/6 text-[11px] text-white/30 uppercase tracking-wider">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Activity</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-white/30 text-[14px]">
            No users match your filter
          </div>
        )}

        {filtered.map((user, i) => {
          const rc = roleConfig[user.role];
          const sc = statusConfig[user.status];

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
            >
              {/* User info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-(--green-mid)/25 flex items-center justify-center text-[12px] font-bold text-white shrink-0">
                  {initials(user)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14px] font-medium text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    {user.flagCount > 0 && (
                      <BadgeAlert size={13} className="text-red-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[12px] text-white/40 truncate">
                    {user.businessName ? user.businessName : user.email}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="hidden sm:block">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${rc.badge}`}
                >
                  {rc.icon} {rc.label}
                </span>
                {user.role === "PRODUCER" && user.tier === "VERIFIED" && (
                  <span className="ml-1 inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                    <BadgeCheck size={9} className="mr-0.5" /> V
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="hidden sm:block">
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>

              {/* Last active */}
              <div className="hidden sm:block">
                <p className="text-[12px] text-white/40">{user.lastActive}</p>
                {!user.emailVerified && (
                  <p className="text-[10px] text-amber-400 mt-0.5">
                    Email unverified
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="w-8 h-8 rounded-lg bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
                  title="View / Edit"
                >
                  <Eye size={14} />
                </button>
                {user.status === "ACTIVE" ? (
                  <button
                    onClick={() =>
                      handleStatusChange(user.id, "SUSPENDED", user.notes)
                    }
                    className="w-8 h-8 rounded-lg bg-white/6 hover:bg-amber-500/20 flex items-center justify-center text-white/40 hover:text-amber-400 transition-all"
                    title="Suspend"
                  >
                    <Lock size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleStatusChange(user.id, "ACTIVE", user.notes)
                    }
                    className="w-8 h-8 rounded-lg bg-white/6 hover:bg-green-500/20 flex items-center justify-center text-white/40 hover:text-green-400 transition-all"
                    title="Activate"
                  >
                    <Unlock size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[12px] text-white/25 mt-3">
        Showing {filtered.length} of {users.length} users
      </p>
    </DashboardShell>
  );
}
