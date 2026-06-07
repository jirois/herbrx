import React from "react";
import {
  ShieldCheck,
  Stethoscope,
  BookOpen,
  Leaf,
  Factory,
  BadgeCheck,
  ClipboardCheck,
  BellRing,
  Microscope,
  Languages,
  MapPinned,
  Pill,
  FlaskConical,
  Droplets,
} from "lucide-react";

type IconWrapperProps = {
  children: React.ReactNode;
};

function IconWrapper({ children }: IconWrapperProps) {
  return (
    <div
      className="
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-2xl
        bg-[#C8DABB]
        text-[#1A3A2A]
        transition-all
        duration-300
        group-hover:scale-110
      "
    >
      {children}
    </div>
  );
}

/* ==============================
   SERVICES
================================ */

export function HerbShieldIcon() {
  return (
    <IconWrapper>
      <ShieldCheck className="h-7 w-7" />
    </IconWrapper>
  );
}

export function HerbalConsultationIcon() {
  return (
    <IconWrapper>
      <Stethoscope className="h-7 w-7" />
    </IconWrapper>
  );
}

export function ResearchLeafIcon() {
  return (
    <IconWrapper>
      <div className="relative">
        <BookOpen className="h-7 w-7" />
        <Leaf className="absolute -right-2 -top-2 h-4 w-4 text-[#2D5A3D]" />
      </div>
    </IconWrapper>
  );
}

export function ComplianceIcon() {
  return (
    <IconWrapper>
      <div className="relative">
        <Factory className="h-7 w-7" />
        <BadgeCheck className="absolute -right-2 -top-2 h-4 w-4 text-[#B8832A]" />
      </div>
    </IconWrapper>
  );
}

export function ProductReviewIcon() {
  return (
    <IconWrapper>
      <ClipboardCheck className="h-7 w-7" />
    </IconWrapper>
  );
}

export function SafetyAlertIcon() {
  return (
    <IconWrapper>
      <BellRing className="h-7 w-7" />
    </IconWrapper>
  );
}

/* ==============================
   TRUST BAR
================================ */

export function NigeriaIcon() {
  return <MapPinned className="h-5 w-5" />;
}

export function ScienceIcon() {
  return <Microscope className="h-5 w-5" />;
}

export function LanguageIcon() {
  return <Languages className="h-5 w-5" />;
}

export function HerbIcon() {
  return <Leaf className="h-5 w-5" />;
}

export function VerifiedIcon() {
  return <BadgeCheck className="h-5 w-5" />;
}

/* ==============================
   PRODUCTS
================================ */

export function TeaBlendIcon() {
  return (
    <IconWrapper>
      <Leaf className="h-8 w-8" />
    </IconWrapper>
  );
}

export function CapsuleIcon() {
  return (
    <IconWrapper>
      <Pill className="h-8 w-8" />
    </IconWrapper>
  );
}

export function TinctureIcon() {
  return (
    <IconWrapper>
      <FlaskConical className="h-8 w-8" />
    </IconWrapper>
  );
}

export function TopicalIcon() {
  return (
    <IconWrapper>
      <Droplets className="h-8 w-8" />
    </IconWrapper>
  );
}

/* ==============================
   HERO
================================ */

export function HeroVerificationIcon() {
  return (
    <div className="relative flex items-center justify-center">
      <Leaf
        className="
          h-24
          w-24
          text-[#4A7C59]
        "
      />

      <ShieldCheck
        className="
          absolute
          bottom-0
          right-0
          h-10
          w-10
          rounded-full
          bg-white
          p-1
          text-[#1A3A2A]
          shadow-lg
        "
      />
    </div>
  );
}
