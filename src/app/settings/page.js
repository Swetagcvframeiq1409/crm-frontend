"use client";

import AppShell from "@/components/layout/AppShell";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";

function formatRole(role) {
  if (!role) return "";
  return role
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <Header title="Settings" subtitle="Account settings and preferences" />

      <div className="flex flex-col gap-4">
        <section className="rounded-lg border border-[#E3E5EA] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#171A21]">Profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280]">Name</p>
              <p className="mt-1 text-sm font-medium text-[#171A21]">{user?.name ?? "Not available"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280]">Email</p>
              <p className="mt-1 text-sm font-medium text-[#171A21]">{user?.email ?? "Not available"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[#6B7280]">Role</p>
              <p className="mt-1 text-sm font-medium text-[#171A21]">{formatRole(user?.role) || "Not available"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#E3E5EA] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#171A21]">Preferences</h2>
          <p className="mt-3 text-sm text-[#6B7280]">Coming soon</p>
        </section>
      </div>
    </AppShell>
  );
}
