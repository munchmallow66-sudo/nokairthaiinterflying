"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Plane,
  LockKeyhole,
  Fingerprint,
  ChevronRight,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@tif.ac.th");
  const [password, setPassword] = React.useState("!Admin_TIF@8649.");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [focusedField, setFocusedField] = React.useState<"email" | "password" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      }

      // Successful login
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tif-navyDark text-slate-100 flex relative overflow-hidden">
      {/* ================================================================ */}
      {/* LEFT PANEL — Brand & Security Showcase                          */}
      {/* ================================================================ */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Deep navy gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-tif-navyDark via-[#0A1F3D] to-[#040B1A]" />

        {/* Animated grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,162,74,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200,162,74,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Radar sweep accent — top right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 pointer-events-none">
          <div className="absolute inset-0 rounded-full border border-tif-gold/10" />
          <div className="absolute inset-8 rounded-full border border-tif-gold/8" />
          <div className="absolute inset-16 rounded-full border border-tif-gold/6" />
          <div className="absolute inset-0 animate-radar-sweep origin-center">
            <div className="absolute top-1/2 left-1/2 w-1/2 h-px bg-gradient-to-r from-tif-gold/40 to-transparent" />
          </div>
        </div>

        {/* Gold glow orb — bottom left */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-tif-gold/8 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 space-y-8">
          {/* Brand Logo */}
          <div className="inline-flex items-center gap-3 p-3 pr-5 rounded-2xl bg-slate-900/40 border border-tif-gold/20 backdrop-blur-md">
            <BrandLogo size="md" variant="light" />
          </div>

          {/* Headline */}
          <div className="space-y-5 max-w-md">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-tif-gold/50" />
              <span className="text-[11px] font-bold tracking-[0.25em] text-tif-gold uppercase font-display">
                Officer Portal
              </span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold font-display leading-[1.15] text-white tracking-tight">
              Command Center
              <span className="block text-tif-gold gold-gradient-text mt-1">
                Access Control
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              ระบบเข้าสู่ระบบสำหรับเจ้าหน้าที่และผู้ดูแลระบบ
              <br />
              Thai Inter Flying Aviation Academy
            </p>
          </div>
        </div>

        {/* Aviation visual — center plane silhouette */}
        <div className="relative z-10 flex items-center justify-center py-8">
          <div className="relative">
            {/* Concentric rings */}
            <div className="absolute inset-0 -m-16 rounded-full border border-tif-gold/8" />
            <div className="absolute inset-0 -m-8 rounded-full border border-tif-gold/12" />
            {/* Plane icon */}
            <div className="relative w-28 h-28 rounded-3xl bg-slate-900/60 border border-tif-gold/25 flex items-center justify-center backdrop-blur-md shadow-2xl">
              <Plane className="h-12 w-12 text-tif-gold animate-plane-float" />
            </div>
            {/* Orbiting dot */}
            <div className="absolute inset-0 -m-16 animate-radar-sweep pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-tif-gold/60 shadow-[0_0_8px_rgba(200,162,74,0.6)]" />
            </div>
          </div>
        </div>

        {/* Security trust badges — bottom */}
        <div className="relative z-10 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: LockKeyhole, label: "SSL Encrypted", sub: "256-bit" },
              { icon: Fingerprint, label: "Officer Auth", sub: "Verified" },
              { icon: ShieldCheck, label: "Access Control", sub: "Secured" },
            ].map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-3.5 space-y-2 backdrop-blur-md hover:border-tif-gold/30 transition-colors"
                >
                  <Icon className="h-4 w-4 text-tif-gold" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-200 leading-tight">
                      {badge.label}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                      {badge.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer line */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
            <p className="text-[10px] text-slate-500 font-mono">
              © {new Date().getFullYear()} TIF Academy
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* RIGHT PANEL — Login Form                                        */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle background accents for right panel */}
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-tif-gold/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

        {/* Mobile brand header (visible only on small screens) */}
        <div className="lg:hidden absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="inline-flex items-center gap-2 p-2.5 pr-4 rounded-xl bg-slate-900/60 border border-tif-gold/25 backdrop-blur-md">
            <BrandLogo size="sm" variant="light" />
          </div>
        </div>

        <div className="w-full max-w-md relative z-10 lg:mt-0 mt-24">
          {/* Form Header */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-tif-gold/10 border border-tif-gold/30 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-tif-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-display text-white tracking-wide leading-none">
                  Officer Sign In
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 font-mono uppercase tracking-wider">
                  Secure Authentication
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบจัดการใบสมัคร
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/70 border border-tif-gold/15 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-300 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-200 text-xs uppercase tracking-wider mb-0.5">
                    Authentication Failed
                  </p>
                  <span className="text-red-300/90">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  <span>อีเมลเจ้าหน้าที่ / Email</span>
                  {focusedField === "email" && (
                    <span className="text-[9px] text-tif-gold font-mono normal-case tracking-normal animate-in fade-in slide-in-from-left-1">
                      ● focused
                    </span>
                  )}
                </label>
                <div
                  className={`relative group transition-all duration-200 ${
                    focusedField === "email" ? "scale-[1.01]" : ""
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail
                      className={`h-4 w-4 transition-colors ${
                        focusedField === "email" ? "text-tif-gold" : "text-slate-500"
                      }`}
                    />
                  </div>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="admin@tif.ac.th"
                    className={`pl-10 bg-slate-950/50 text-slate-100 placeholder:text-slate-600 rounded-xl h-12 transition-all duration-200 ${
                      focusedField === "email"
                        ? "border-tif-gold ring-1 ring-tif-gold/30 shadow-[0_0_0_3px_rgba(200,162,74,0.08)]"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  <span>รหัสผ่าน / Password</span>
                  {focusedField === "password" && (
                    <span className="text-[9px] text-tif-gold font-mono normal-case tracking-normal animate-in fade-in slide-in-from-left-1">
                      ● focused
                    </span>
                  )}
                </label>
                <div
                  className={`relative group transition-all duration-200 ${
                    focusedField === "password" ? "scale-[1.01]" : ""
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock
                      className={`h-4 w-4 transition-colors ${
                        focusedField === "password" ? "text-tif-gold" : "text-slate-500"
                      }`}
                    />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••••••"
                    className={`pl-10 pr-11 bg-slate-950/50 text-slate-100 placeholder:text-slate-600 rounded-xl h-12 transition-all duration-200 ${
                      focusedField === "password"
                        ? "border-tif-gold ring-1 ring-tif-gold/30 shadow-[0_0_0_3px_rgba(200,162,74,0.08)]"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-tif-gold transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  disabled={isLoading}
                  className="w-full justify-center h-12 font-semibold rounded-xl text-base shadow-lg shadow-tif-gold/15 group"
                >
                  {isLoading ? (
                    <span className="flex items-center space-x-2.5">
                      <span className="animate-spin h-4 w-4 border-2 border-tif-navyDark border-t-transparent rounded-full" />
                      <span>กำลังตรวจสอบ...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>เข้าสู่ระบบ</span>
                      <span className="text-tif-navyDark/70 font-normal">/</span>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800/80" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-900/80 px-3 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                  Demo Access
                </span>
              </div>
            </div>

            {/* Demo Account Info — refined */}
            <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-tif-gold font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5" /> Test Account
                </p>
                <span className="text-[9px] text-slate-600 font-mono">READ-ONLY</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-900/60">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-200">admin@tif.ac.th</span>
                </div>
                <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-900/60">
                  <span className="text-slate-500">Pass</span>
                  <span className="text-slate-200">!Admin_TIF@8649.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-6 flex items-center justify-between text-[10px] text-slate-600">
            <span className="font-mono">v2.0 • Secure Portal</span>
            <Link
              href="/"
              className="flex items-center gap-1 text-slate-500 hover:text-tif-gold transition-colors"
            >
              <span>Public Site</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}