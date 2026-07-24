"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Calendar,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n/language-context";

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const adminNavItems = [
    { name: t("adminNavDashboard"), href: "/admin", icon: LayoutDashboard },
    { name: t("adminNavApplications"), href: "/admin/applications", icon: FileText },
    { name: t("adminNavCRM"), href: "/admin/crm", icon: Users },
    { name: t("adminNavPayments"), href: "/admin/payments", icon: CreditCard },
    { name: t("adminNavInterviews"), href: "/admin/interviews", icon: Calendar },
    { name: t("adminNavAuditLogs"), href: "/admin/audit-logs", icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-tif-navyDark text-slate-300 min-h-screen border-r border-tif-gold/20 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="p-6 border-b border-tif-gold/20 flex items-center justify-between">
          <Link href="/">
            <BrandLogo size="sm" variant="light" />
          </Link>
          <LanguageSwitcher variant="glass" className="scale-90" />
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-tif-navy text-tif-gold font-semibold border-l-4 border-tif-gold shadow-md"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-tif-gold" : "text-slate-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-3 rounded-xl bg-tif-navy/60 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-tif-gold/20 text-tif-gold flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Academy Admin</p>
              <p className="text-[10px] text-slate-400">admin@thaiinterflying.com</p>
            </div>
          </div>
          <Link href="/" className="text-slate-400 hover:text-rose-400 p-1">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
