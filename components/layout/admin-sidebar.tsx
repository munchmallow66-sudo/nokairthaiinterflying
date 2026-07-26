"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Calendar,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n/language-context";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = React.useState<{ name: string; email: string; role: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/admin-session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin-logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  const adminNavItems = [
    { name: t("adminNavDashboard"), href: "/admin", icon: LayoutDashboard },
    { name: t("adminNavApplications"), href: "/admin/applications", icon: FileText, badge: "Live" },
    { name: t("adminNavCRM"), href: "/admin/crm", icon: Users },
    { name: t("adminNavPayments"), href: "/admin/payments", icon: CreditCard },
    { name: t("adminNavInterviews"), href: "/admin/interviews", icon: Calendar },
    { name: t("adminNavAuditLogs"), href: "/admin/audit-logs", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 text-slate-300 min-h-screen border-r border-slate-800/80 flex flex-col justify-between shrink-0 backdrop-blur-xl relative z-20">
      <div>
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin" className="block">
            <BrandLogo size="sm" variant="light" />
          </Link>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-6 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-display">
            {t("commandCenter")}
          </span>
        </div>

        {/* Navigation */}
        <nav className="px-3 space-y-1">
          {adminNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-slate-900 text-tif-gold border border-tif-gold/30 shadow-lg shadow-tif-gold/5"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                      isActive ? "text-tif-gold" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Link to Main Website */}
        <div className="px-3 pt-6">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition"
          >
            <span className="flex items-center space-x-2">
              <ShieldCheck className="h-3.5 w-3.5 text-tif-gold" />
              <span>{t("publicWebsite")}</span>
            </span>
            <ExternalLink className="h-3 w-3 text-slate-500" />
          </Link>
        </div>
      </div>

      {/* User Footer Profile & Language Switcher */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
            <Globe className="h-3.5 w-3.5 text-tif-gold" />
            <span>{t("languageSelectLabel")}</span>
          </span>
          <LanguageSwitcher variant="minimal" className="scale-90 origin-right" />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center space-x-2.5 truncate">
            <div className="h-8 w-8 rounded-xl bg-tif-gold/10 border border-tif-gold/30 text-tif-gold flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Academy Admin"}
              </p>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                {user?.email || "admin@tif.ac.th"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={t("signOut")}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
