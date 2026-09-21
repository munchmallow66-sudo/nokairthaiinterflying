"use client";

import * as React from "react";
import {
  Settings,
  UserPlus,
  Users,
  ShieldCheck,
  Search,
  Trash2,
  Lock,
  Mail,
  Plus,
  KeyRound,
  CheckCircle2,
  Shield,
  Loader2,
  Radio,
  Power,
  Sparkles,
  AlertTriangle,
  Clock,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatDateTime } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string | Date;
}

interface AdmissionAdminState {
  isOpen: boolean;
  quota: number | null;
  acceptedCount: number;
  remaining: number | null;
  openedAt: string | Date | null;
  closedAt: string | Date | null;
}

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Admissions & Quota State
  const [admissionState, setAdmissionState] = React.useState<AdmissionAdminState | null>(null);
  const [isLoadingAdmission, setIsLoadingAdmission] = React.useState(true);
  const [isUpdatingAdmission, setIsUpdatingAdmission] = React.useState(false);
  const [customQuotaInput, setCustomQuotaInput] = React.useState<number>(1);

  // Fetch Admission Settings
  const fetchAdmissionState = React.useCallback(async () => {
    try {
      setIsLoadingAdmission(true);
      const res = await fetch("/api/admin/admissions");
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setAdmissionState(data.status);
          if (data.status.quota) {
            setCustomQuotaInput(data.status.quota);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load admission settings", err);
    } finally {
      setIsLoadingAdmission(false);
    }
  }, []);

  const handleToggleAdmission = async (action: "open" | "close", quotaVal = 1) => {
    const confirmMsg =
      action === "open"
        ? `ยืนยันการเปิดรับสมัครจำนวน ${quotaVal} คน ใช่หรือไม่?\n(ระบบจะตัดสิทธิ์และปิดรับสมัครอัตโนมัติทันทีเมื่อมีผู้สมัครส่งข้อมูลครบ)`
        : "ยืนยันการปิดระบบรับสมัครทันที ใช่หรือไม่?";

    if (!window.confirm(confirmMsg)) return;

    setIsUpdatingAdmission(true);
    try {
      const res = await fetch("/api/admin/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, quota: quotaVal }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        return;
      }
      alert(
        action === "open"
          ? `เปิดระบบรับสมัครจำนวน ${quotaVal} คน เรียบร้อยแล้ว!`
          : "ปิดระบบรับสมัครเรียบร้อยแล้ว!"
      );
      fetchAdmissionState();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsUpdatingAdmission(false);
    }
  };

  // Modal State
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formPassword, setFormPassword] = React.useState("");
  const [formRole, setFormRole] = React.useState("ADMIN");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch Admin Users
  const fetchUsers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load admin users", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
    fetchAdmissionState();
  }, [fetchUsers, fetchAdmissionState]);

  // Filtered users list
  const filteredUsers = users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("ADMIN");
    setAddModalOpen(true);
  };

  // Submit Add Staff
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPassword) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "เกิดข้อผิดพลาดในการสร้างบัญชี");
        return;
      }

      alert(t("alertStaffAddSuccess"));
      setAddModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Staff Account States
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [targetDeleteUser, setTargetDeleteUser] = React.useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteStaff = (user: AdminUser) => {
    if (user.email === "admin@tif.ac.th" || user.id === "admin-default") {
      alert(t("alertStaffDeleteDefaultErr"));
      return;
    }
    setTargetDeleteUser(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteStaff = async () => {
    if (!targetDeleteUser) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/users/${targetDeleteUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "เกิดข้อผิดพลาดในการลบบัญชี");
        return;
      }

      alert(t("alertStaffDeleteSuccess"));
      setDeleteModalOpen(false);
      setTargetDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-tif-gold animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">
              {t("settingsTag")}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display">
            {t("settingsTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            {t("settingsSub")}
          </p>
        </div>
        <div>
          <Button
            variant="gold"
            size="md"
            onClick={handleOpenAdd}
            className="shadow-lg font-bold"
          >
            <UserPlus className="mr-2 h-4 w-4" /> {t("addStaffBtn")}
          </Button>
        </div>
      </div>

      {/* Admissions & Quota Intake Control Panel */}
      <div className="p-6 lg:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tif-gold/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <Radio className="h-5 w-5 text-tif-gold animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider text-tif-gold">
                Live Admission & Quota Control
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-white font-display">
              ระบบควบคุมการรับสมัคร & โควตาที่นั่งอัตโนมัติ
            </h2>
            <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              ควบคุมการเปิด-ปิดรับสมัครบนหน้าเว็บไซต์แบบเรียลไทม์ และกำหนดโควตารับสมัคร (ระบบจะตัดสิทธิ์และสลับสถานะเป็น <strong>&ldquo;ปิดรับสมัคร&rdquo;</strong> อัตโนมัติทันทีที่มีผู้สมัครส่งสำเร็จครบตามจำนวน)
            </p>
          </div>

          {/* Current Status Badge */}
          <div className="shrink-0 flex items-center">
            {isLoadingAdmission ? (
              <div className="flex items-center space-x-2 text-slate-400 text-xs px-4 py-2 rounded-xl bg-slate-950 border border-slate-800">
                <Loader2 className="w-4 h-4 animate-spin text-tif-gold" />
                <span>กำลังโหลดสถานะ...</span>
              </div>
            ) : admissionState?.isOpen ? (
              <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-xs uppercase tracking-wide">กำลังเปิดรับสมัคร (OPEN)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wide">ปิดรับสมัครแล้ว (CLOSED)</span>
              </div>
            )}
          </div>
        </div>

        {/* Quota Metrics & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              โควตารอบปัจจุบัน
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-white">
                {admissionState?.quota ?? "ไม่จำกัด"}
              </span>
              <span className="text-xs text-slate-500">คน</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              จำนวนที่อนุญาตให้ส่งใบสมัครในรอบนี้
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              สมัครสำเร็จแล้ว
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {admissionState?.acceptedCount ?? 0}
              </span>
              <span className="text-xs text-slate-500">คน</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              นับตั้งแต่เปิดระบบรอบล่าสุด
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              ที่นั่งคงเหลือ (Remaining)
            </span>
            <div className="flex items-baseline space-x-2">
              <span
                className={`text-2xl font-bold font-mono ${
                  (admissionState?.remaining ?? 0) > 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {admissionState?.remaining ?? 0}
              </span>
              <span className="text-xs text-slate-500">ที่นั่ง</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {admissionState?.isOpen
                ? "พร้อมรับผู้สมัครใหม่"
                : "หมดโควตา / ปิดรับแล้ว"}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick 1-seat Reopen button */}
            <Button
              variant="gold"
              size="md"
              disabled={isUpdatingAdmission}
              onClick={() => handleToggleAdmission("open", 1)}
              className="font-bold text-xs shadow-gold hover:scale-105 transition-all"
            >
              {isUpdatingAdmission ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              เปิดรับสมัคร 1 คน (Auto-Close ทันทีเมื่อเต็ม)
            </Button>

            {/* Custom Quota Controls */}
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-xs text-slate-400 font-medium">โควตา:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={customQuotaInput}
                onChange={(e) => setCustomQuotaInput(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono focus:outline-none focus:border-tif-gold"
              />
              <span className="text-xs text-slate-500">คน</span>
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdatingAdmission}
                onClick={() => handleToggleAdmission("open", customQuotaInput)}
                className="text-xs font-semibold hover:border-tif-gold hover:text-tif-gold ml-1"
              >
                เปิดรับตามจำนวน
              </Button>
            </div>
          </div>

          <div>
            <Button
              variant="secondary"
              size="md"
              disabled={isUpdatingAdmission || !admissionState?.isOpen}
              onClick={() => handleToggleAdmission("close")}
              className={`text-xs font-bold transition-all ${
                admissionState?.isOpen
                  ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <Power className="w-4 h-4 mr-2" />
              ปิดระบบรับสมัครทันที (Force Close)
            </Button>
          </div>
        </div>

        {/* Timestamps Info */}
        {(admissionState?.openedAt || admissionState?.closedAt) && (
          <div className="mt-4 pt-3 border-t border-slate-800/40 flex flex-wrap items-center gap-6 text-[11px] text-slate-500">
            {admissionState?.openedAt && (
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>เปิดล่าสุด: {formatDateTime(admissionState.openedAt)}</span>
              </div>
            )}
            {admissionState?.closedAt && (
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ปิดล่าสุด: {formatDateTime(admissionState.closedAt)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">
              {t("staffTotal")}
            </p>
            <p className="text-3xl font-bold text-white mt-1 font-mono">
              {users.length}
            </p>
          </div>
          <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">
              {t("staffActiveCount")}
            </p>
            <p className="text-3xl font-bold text-emerald-400 mt-1 font-mono">
              {users.length}
            </p>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("staffSearchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tif-gold font-medium"
          />
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">{t("staffNameHeader")}</th>
                <th className="px-6 py-4">{t("staffEmailHeader")}</th>
                <th className="px-6 py-4">{t("staffRoleHeader")}</th>
                <th className="px-6 py-4">{t("staffCreatedHeader")}</th>
                <th className="px-6 py-4 text-right">{t("staffActionHeader")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-tif-gold" />
                    <span>กำลังโหลดข้อมูลผู้ดูแลระบบ...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-bold text-white">ไม่พบข้อมูลผู้ดูแลระบบ</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-xl bg-tif-gold/10 border border-tif-gold/30 text-tif-gold flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                          {user.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name || "Academy Administrator"}</p>
                          {user.email === "admin@tif.ac.th" && (
                            <span className="text-[10px] text-tif-gold font-mono">
                              System Primary Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-cyan-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 inline-flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {user.createdAt ? formatDateTime(user.createdAt) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.email !== "admin@tif.ac.th" && user.id !== "admin-default" ? (
                        <button
                          onClick={() => handleDeleteStaff(user)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-950 border border-slate-800 transition"
                          title="ลบบัญชีผู้ดูแลนี้"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono italic">
                          Protected
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={t("addStaffModalTitle")}
        description={t("addStaffModalDesc")}
      >
        <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              {t("staffNameLabel")}
            </label>
            <input
              type="text"
              required
              placeholder="เช่น Somchai Jaidee"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              {t("staffEmailLabel")}
            </label>
            <input
              type="email"
              required
              placeholder="เช่น staff@tif.ac.th"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              {t("staffPasswordLabel")}
            </label>
            <input
              type="password"
              required
              placeholder="กำหนดรหัสผ่านสำหรับเข้าสู่ระบบ"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              {t("staffRoleLabel")}
            </label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none font-medium"
            >
              <option value="ADMIN">ADMIN — สิทธิ์ผู้ดูแลระบบทั่วไป</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN — ผู้ดูแลระบบระดับสูง</option>
              <option value="HR">HR — ฝ่ายบุคคลและคัดเลือกศิษย์บิน</option>
              <option value="FINANCE">FINANCE — ฝ่ายการเงินและบัญชี</option>
              <option value="TRAINING_OFFICER">TRAINING_OFFICER — เจ้าหน้าที่การฝึกอบรม</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddModalOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="sm"
              disabled={isSubmitting}
              className="font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                t("saveStaffBtn")
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Staff Account Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteStaff}
        isLoading={isDeleting}
        title="ยืนยันการลบบัญชีผู้ใช้เจ้าหน้าที่"
        description="คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้เจ้าหน้าที่นี้ออกจากระบบ?"
        itemName={
          targetDeleteUser
            ? `${targetDeleteUser.name || "เจ้าหน้าที่"} (${targetDeleteUser.email}) - สิทธิ์: ${targetDeleteUser.role}`
            : undefined
        }
        confirmText="ยืนยันการลบบัญชี"
        cancelText="ยกเลิก"
        variant="danger"
      />
    </div>
  );
}
