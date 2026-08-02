"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { ShieldAlert } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // If on /admin/login page, bypass sidebar and auth check
  const isLoginPage = pathname === "/admin/login";

  React.useEffect(() => {
    if (isLoginPage) {
      setIsChecking(false);
      return;
    }

    // Check admin session
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/admin-session");
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace("/admin/login");
        }
      } catch (err) {
        setIsAuthenticated(false);
        router.replace("/admin/login");
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-slate-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-tif-gold border-t-transparent rounded-full" />
          <p className="text-sm font-medium text-slate-400">Verifying Officer Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#070D1B] text-slate-100 selection:bg-tif-gold selection:text-slate-950">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">{children}</main>
    </div>
  );
}
