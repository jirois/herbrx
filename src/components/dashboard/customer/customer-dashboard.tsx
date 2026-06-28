"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Bell,
  Pill,
  Calendar,
  ShoppingBag,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useSafetyAlerts, useConsultations } from "@/hooks/dashboard-hooks";

const mockAlerts = [
  {
    id: "1",
    severity: "DANGER",
    title: "Counterfeit Moringa Capsules Detected",
    productName: "SuperGreen Moringa 500mg",
    publishedAt: "2 hours ago",
  },
  {
    id: "2",
    severity: "WARNING",
    title: "St. John's Wort — Drug Interaction Warning",
    productName: "St. John\'s Wort Extract', publishedAt: '1 day ago",
  },
  {
    id: "3",
    severity: "INFO",
    title: "Recommended: New Turmeric Safety Guide",
    productName: "General Advisory",
    publishedAt: "3 days ago",
  },
];

const mockConsultations = [
  {
    id: "1",
    type: "HERBALIST",
    status: "CONFIRMED",
    scheduledAt: "Thu 26 Jun · 10:00 AM",
    practitioner: "Dr. Adaeze Okonkwo",
  },
  {
    id: "2",
    type: "PHARMACIST",
    status: "REQUESTED",
    scheduledAt: "Pending assignment",
    practitioner: "—",
  },
];

const severityColor: Record<string, string> = {
  DANGER: "bg-red-500/10 border-red-500/20 text-red-400",
  WARNING: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  INFO: "bg-blue-500/10 border-blue-500/20 text-blue-400",
};
const severityIcon: Record<string, string> = {
  DANGER: "🚨",
  WARNING: "⚠️",
  INFO: "ℹ️",
};

const statusBadge: Record<string, string> = {
  CONFIRMED: "bg-green-500/15 text-green-400",
  REQUESTED: "bg-amber-500/15 text-amber-400",
  COMPLETED: "bg-white/10 text-white/50",
};

interface Props {
  user: { firstName: string };
}

export function CustomerDashboard({ user }: Props) {
  const { data: alertsData } = useSafetyAlerts("ACTIVE");
  const { data: consultationsData } = useConsultations();

  const liveAlerts = alertsData?.alerts ?? mockAlerts;
  const liveConsultations =
    consultationsData?.consultations ?? mockConsultations;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-semibold text-white">
          {greeting}, {user.firstName} 👋
        </h1>
        <p className="text-[14px] text-white/45 font-light mt-1">
          Your Safe-Health Hub — stay informed, stay safe.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            icon: Pill,
            label: "Check Interactions",
            href: "/dashboard/customer/interactions",
            color: "text-purple-400",
            bg: "bg-purple-500/10 border-purple-500/20",
          },
          {
            icon: Calendar,
            label: "Book Consultation",
            href: "/dashboard/customer/consultations",
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
          },
          {
            icon: Bell,
            label: "Safety Alerts",
            href: "/dashboard/customer/alerts",
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
          },
          {
            icon: ShoppingBag,
            label: "My Orders",
            href: "/account/orders",
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/20",
          },
        ].map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link
              href={item.href}
              className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border text-center hover:bg-white/5 transition-all ${item.bg}`}
            >
              <item.icon size={22} className={item.color} />
              <span className="text-[13px] font-medium text-white/80">
                {item.label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-5">
        {/* Safety alerts feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" /> Active
              Safety Alerts
            </h2>
            <Link
              href="/dashboard/customer/alerts"
              className="text-[12px] text-(--green-pale) hover:text-white flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(liveAlerts as typeof mockAlerts).map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border ${severityColor[alert.severity]}`}
              >
                <span className="text-[20px] shrink-0 mt-0.5">
                  {severityIcon[alert.severity]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-white mb-0.5">
                    {alert.title}
                  </p>
                  <p className="text-[12px] opacity-70">{alert.productName}</p>
                </div>
                <span className="text-[11px] opacity-60 shrink-0 whitespace-nowrap">
                  {alert.publishedAt}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Interaction engine teaser */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 p-5 rounded-2xl bg-linear-to-br from-purple-900/40 to-[#1A1330] border border-purple-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <Pill size={18} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-white mb-1">
                  Herb × Drug Interaction Engine
                </h3>
                <p className="text-[13px] text-white/50 mb-3 leading-relaxed">
                  Enter your prescription medications to instantly check for
                  dangerous interactions with any herbal product.
                </p>
                <Link
                  href="/dashboard/customer/interactions"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-purple-300 hover:text-white transition-colors"
                >
                  Check interactions now <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Consultations sidebar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <Calendar size={16} className="text-blue-400" /> Consultations
            </h2>
            <Link
              href="/dashboard/customer/consultations"
              className="text-[12px] text-(--green-pale) hover:text-white flex items-center gap-1"
            >
              Book new <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3 mb-4">
            {(liveConsultations as typeof mockConsultations).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="bg-white/5 border border-white/8 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold text-white/70 uppercase tracking-wider">
                    {c.type}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusBadge[c.status]}`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-[14px] font-medium text-white mb-1">
                  {c.practitioner}
                </p>
                <p className="text-[12px] text-white/45 flex items-center gap-1.5">
                  <Clock size={11} /> {c.scheduledAt}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Telehealth CTA */}
          <div className="p-5 rounded-2xl bg-linear-to-br from-blue-900/30 to-[#0F1117] border border-blue-500/15">
            <p className="text-[13px] font-semibold text-white mb-1">
              Book a Micro-Consultation
            </p>
            <p className="text-[12px] text-white/45 mb-3 leading-relaxed">
              30-minute sessions with certified herbalists, naturopaths, and
              toxicologists.
            </p>
            <Link
              href="/dashboard/customer/consultations"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-300 hover:text-white transition-colors"
            >
              Browse practitioners <ArrowRight size={13} />
            </Link>
          </div>

          {/* Safe-use stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Herbs Checked", value: "12" },
              { label: "Interactions Found", value: "2" },
              { label: "Consultations", value: "3" },
              { label: "Alerts Read", value: "7" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/4 border border-white/[0.07] rounded-xl p-4 text-center"
              >
                <div className="text-[24px] font-serif font-semibold text-white">
                  {stat.value}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
