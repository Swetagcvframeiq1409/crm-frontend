"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AppShell({ children }) {
  const { loggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loggedIn) router.replace("/login");
  }, [loggedIn, router]);

  if (!loggedIn) return null;

  return (
    <div className="flex h-full min-h-screen bg-[#F5F6F8]">
      <Sidebar />
      <main className="flex-1 ml-56 px-8 py-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}
