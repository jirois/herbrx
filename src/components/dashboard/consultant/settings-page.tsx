"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { useConsultantProfile, consultantApi } from "@/hooks/dashboard-hooks";
import { strongPassword } from "@/lib/vaildation";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  User,
  CalendarOff,
} from "lucide-react";

const cardCls = "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5";
const inputCls =
  "w-full h-11 px-4 bg-white/6 border border-white/10 rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none focus:border-(--green-mid) transition-colors";

function ConsultantSettingsForm({
  profile,
  mutate,
}: {
  profile: {
    bio?: unknown;
    worksWeekends?: unknown;
    mustResetPassword?: unknown;
  };
  mutate: () => Promise<unknown> | unknown;
}) {
  const [bio, setBio] = useState(
    typeof profile.bio === "string" ? profile.bio : "",
  );
  const [worksWeekends, setWorksWeekends] = useState(
    typeof profile.worksWeekends === "boolean" ? profile.worksWeekends : true,
  );
  const [bioSaving, setBioSaving] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  const [currentPasswordNote, setCurrentPasswordNote] = useState(
    profile.mustResetPassword === true,
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  async function saveBio() {
    setBioSaving(true);
    setBioError(null);
    setBioSaved(false);
    try {
      await consultantApi.updateProfile({ bio, worksWeekends });
      await mutate();
      setBioSaved(true);
      setTimeout(() => setBioSaved(false), 3000);
    } catch (e) {
      setBioError(
        e instanceof Error ? e.message : "Couldn't save your changes.",
      );
    } finally {
      setBioSaving(false);
    }
  }

  async function savePassword() {
    setPwError(null);
    setPwSaved(false);

    const validationError = strongPassword(newPassword);
    if (validationError) {
      setPwError(validationError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords don't match.");
      return;
    }

    setPwSaving(true);
    try {
      await consultantApi.updateProfile({ newPassword });
      await mutate();
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPasswordNote(false);
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (e) {
      setPwError(
        e instanceof Error ? e.message : "Couldn't update your password.",
      );
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bio & availability */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-white/50" />
          <h3 className="text-[14px] font-semibold text-white">Profile</h3>
        </div>

        <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
          Bio
        </p>
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell clients a little about your practice and experience…"
          className={`${inputCls} h-auto py-3 resize-none mb-4`}
        />

        <label className="flex items-center gap-2.5 text-[13px] text-white/70 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={worksWeekends}
            onChange={(e) => setWorksWeekends(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/6 accent-(--green-mid)"
          />
          <CalendarOff size={14} className="text-white/40" />
          Available for weekend consultations
        </label>

        {bioError && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-300">{bioError}</p>
          </div>
        )}

        <button
          onClick={saveBio}
          disabled={bioSaving}
          className="h-10 px-5 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-50 text-white text-[13px] font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          {bioSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : bioSaved ? (
            <CheckCircle2 size={14} />
          ) : null}
          {bioSaving ? "Saving…" : bioSaved ? "Saved" : "Save Changes"}
        </button>
      </div>

      {/* Password */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={15} className="text-white/50" />
          <h3 className="text-[14px] font-semibold text-white">Password</h3>
        </div>

        {currentPasswordNote && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <AlertTriangle
              size={14}
              className="text-amber-400 shrink-0 mt-0.5"
            />
            <p className="text-[12px] text-amber-300">
              You&apos;re still using the temporary password you were given. Set
              a new one below.
            </p>
          </div>
        )}

        <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
          New Password
        </p>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters, upper & lowercase, one number"
          className={`${inputCls} mb-4`}
        />

        <p className="text-[11px] text-white/35 uppercase tracking-wider mb-1.5">
          Confirm New Password
        </p>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          className={`${inputCls} mb-4`}
        />

        {pwError && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-300">{pwError}</p>
          </div>
        )}

        <button
          onClick={savePassword}
          disabled={pwSaving || !newPassword || !confirmPassword}
          className="h-10 px-5 bg-(--green-mid) hover:bg-(--green-light) disabled:opacity-50 text-white text-[13px] font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          {pwSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : pwSaved ? (
            <CheckCircle2 size={14} />
          ) : null}
          {pwSaving
            ? "Updating…"
            : pwSaved
              ? "Password Updated"
              : "Update Password"}
        </button>
      </div>
    </div>
  );
}

export function ConsultantSettingsPage() {
  const { data, loading, error, mutate } = useConsultantProfile();

  if (loading && !data) {
    return (
      <DashboardShell heading="Settings" subheading="Loading your profile…">
        <div className="p-8 text-center text-white/40 text-[13px]">
          <Loader2 size={18} className="animate-spin inline-block mr-2" />
          Loading…
        </div>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell heading="Settings" subheading="Something went wrong">
        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/10 text-[13px] text-red-300">
          Couldn&apos;t load your profile. {error ?? "Please refresh."}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      heading="Settings"
      subheading="Manage your bio, availability, and password."
    >
      <ConsultantSettingsForm
        key={String(data.profile?.id ?? "consultant-profile")}
        profile={data.profile}
        mutate={mutate}
      />
    </DashboardShell>
  );
}
