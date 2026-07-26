"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen bg-tif-navyDark text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tif-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-block p-3 rounded-2xl bg-slate-900/60 border border-tif-gold/30 shadow-xl backdrop-blur-md mb-2">
            <BrandLogo size="lg" variant="light" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-tif-gold" />
            <h1 className="text-xl font-bold font-display text-white tracking-wide">
              Officer Portal Login
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            ระบบเข้าสู่ระบบสำหรับเจ้าหน้าที่และผู้ดูแลระบบ Thai Inter Flying
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 border border-tif-gold/20 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-300 text-sm animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                อีเมลเจ้าหน้าที่ / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4 text-tif-gold/80" />
                </div>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tif.ac.th"
                  className="pl-10 bg-slate-950/60 border-slate-800 focus:border-tif-gold text-slate-100 placeholder:text-slate-600 rounded-xl h-11"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                รหัสผ่าน / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4 text-tif-gold/80" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-slate-950/60 border-slate-800 focus:border-tif-gold text-slate-100 placeholder:text-slate-600 rounded-xl h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                disabled={isLoading}
                className="w-full justify-center h-11 font-semibold rounded-xl text-base shadow-lg shadow-tif-gold/10"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <span className="animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>เข้าสู่ระบบ (Sign In)</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Test Account Info Banner */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 text-xs space-y-1">
              <p className="text-tif-gold font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> บัญชีทดสอบ (Demo Account):
              </p>
              <div className="text-slate-400 font-mono text-[11px] leading-tight">
                <div>Email: <span className="text-slate-200">admin@tif.ac.th</span></div>
                <div>Pass: <span className="text-slate-200">!Admin_TIF@8649.</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} Thai Inter Flying Aviation Academy. Security & Access Control.
        </p>
      </div>
    </div>
  );
}
