"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, DollarSign, ExternalLink, ShieldCheck, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

import { Modal } from "@/components/ui/modal";
import { Plus, Trash2, Edit3 } from "lucide-react";

const SAMPLE_PAYMENTS = [
  {
    id: "pay-1",
    appNum: "TIF-2026-8812",
    student: "Somchai Jaidee (สมชาย ใจดี)",
    feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,500 บาท",
    amount: 1500,
    invoiceNo: "INV-2026-0091",
    receiptNo: "RCT-2026-0091",
    status: "VERIFIED",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
    date: new Date("2026-07-24"),
  },
  {
    id: "pay-2",
    appNum: "TIF-2026-4401",
    student: "Kanchana Sukhumvit (กาญจนา สุขุมวิท)",
    feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,500 บาท",
    amount: 1500,
    invoiceNo: "INV-2026-0092",
    receiptNo: null,
    status: "PENDING",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
    date: new Date("2026-07-24"),
  },
];

import { useLanguage } from "@/lib/i18n/language-context";

export default function PaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = React.useState<any[]>(SAMPLE_PAYMENTS);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedPay, setSelectedPay] = React.useState<any>(null);

  const [viewSlipModalOpen, setViewSlipModalOpen] = React.useState(false);
  const [viewingPay, setViewingPay] = React.useState<any>(null);

  const handleOpenViewSlip = (pay: any) => {
    setViewingPay(pay);
    setViewSlipModalOpen(true);
  };

  // Form states
  const [formAppNum, setFormAppNum] = React.useState("");
  const [formStudent, setFormStudent] = React.useState("");
  const [formAmount, setFormAmount] = React.useState(1500);
  const [formStatus, setFormStatus] = React.useState("PENDING");

  const fetchPayments = React.useCallback(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPayments(data);
        }
      })
      .catch((err) => console.error("Error fetching payments:", err));
  }, []);

  React.useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 3000);
    return () => clearInterval(interval);
  }, [fetchPayments]);

  const handleVerify = async (id: string) => {
    setPayments(
      payments.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "VERIFIED",
              receiptNo: `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            }
          : p
      )
    );
    try {
      await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "VERIFIED" }),
      });
    } catch (e) {}
  };

  const handleOpenAdd = () => {
    setFormAppNum(`TIF-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormStudent("");
    setFormAmount(1500);
    setFormStatus("PENDING");
    setAddModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formStudent) {
      alert("กรุณากรอกชื่อผู้ชำระเงิน");
      return;
    }

    const newPay = {
      id: `pay_${Date.now()}`,
      appNum: formAppNum,
      student: formStudent,
      feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,500 บาท",
      amount: formAmount,
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      receiptNo: formStatus === "VERIFIED" ? `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}` : null,
      status: formStatus,
      slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
      date: new Date(),
    };

    setPayments([newPay, ...payments]);
    setAddModalOpen(false);
    alert("เพิ่มสลิปการชำระเงินเรียบร้อยแล้ว");
  };

  const handleOpenEdit = (pay: any) => {
    setSelectedPay(pay);
    setFormAppNum(pay.appNum);
    setFormStudent(pay.student);
    setFormAmount(pay.amount);
    setFormStatus(pay.status);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedPay) return;
    setPayments(
      payments.map((p) =>
        p.id === selectedPay.id
          ? {
              ...p,
              appNum: formAppNum,
              student: formStudent,
              amount: formAmount,
              status: formStatus,
              receiptNo: formStatus === "VERIFIED" && !p.receiptNo ? `RCT-2026-${Math.floor(1000 + Math.random() * 9000)}` : p.receiptNo,
            }
          : p
      )
    );
    setEditModalOpen(false);
    alert("บันทึกการแก้ไขสลิปเรียบร้อยแล้ว");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("คุณต้องการลบรายการชำระเงินนี้ใช่หรือไม่?")) {
      setPayments(payments.filter((p) => p.id !== id));
      alert("ลบรายการชำระเงินเรียบร้อยแล้ว");
    }
  };

  const totalVerified = payments
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {t("financialControlTag")}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display">
            จัดการและตรวจสอบการชำระเงินค่าสมัคร 1,500 บาท
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            ตรวจสอบสลิปโอนเงิน อนุมัติใบเสร็จรับเงิน และแก้ไขข้อมูลการชำระค่าธรรมเนียมสมัครเรียน
          </p>
        </div>
        <div>
          <Button variant="gold" size="md" onClick={handleOpenAdd} className="shadow-lg font-semibold">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มสลิปการชำระเงิน (Add Slip)
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">ยอดรวมค่าสมัครที่อนุมัติ</p>
            <p className="text-2xl font-bold text-white font-display">{formatCurrency(totalVerified)}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">{t("pendingSlips")}</p>
            <p className="text-2xl font-bold text-white font-display">
              {payments.filter((p) => p.status === "PENDING").length} รายการ
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-tif-gold/10 text-tif-gold border border-tif-gold/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">{t("verifiedCount")}</p>
            <p className="text-2xl font-bold text-white font-display">
              {payments.filter((p) => p.status === "VERIFIED").length} รายการ
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">{t("invoiceNoLabel")}</th>
                <th className="px-5 py-4">{t("studentNameHeader")}</th>
                <th className="px-5 py-4">รายละเอียดค่าสมัคร</th>
                <th className="px-5 py-4">จำนวนเงิน</th>
                <th className="px-5 py-4">{t("statusHeader")}</th>
                <th className="px-5 py-4">สลิปโอนเงิน</th>
                <th className="px-5 py-4 text-right">{t("actionHeader")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-tif-gold">{pay.invoiceNo}</td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-100 block">{pay.student}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{pay.appNum}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-300 font-medium">{pay.feeType}</td>
                  <td className="px-5 py-4 font-bold text-emerald-400 font-mono">{formatCurrency(pay.amount)}</td>
                  <td className="px-5 py-4">
                    {pay.status === "VERIFIED" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Pending Slip
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleOpenViewSlip(pay)}
                      className="text-xs text-tif-gold font-semibold hover:underline flex items-center cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-tif-gold/50"
                    >
                      {t("viewFullSlip")} <ExternalLink className="ml-1 h-3 w-3" />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {pay.status === "PENDING" && (
                        <Button size="sm" variant="gold" onClick={() => handleVerify(pay.id)}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> อนุมัติสลิป
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(pay)}
                        className="text-xs bg-slate-900 border-slate-800 text-tif-gold hover:border-tif-gold rounded-xl"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(pay.id)}
                        className="text-xs rounded-xl"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Slip Inspector Modal */}
      <Modal
        isOpen={viewSlipModalOpen}
        onClose={() => setViewSlipModalOpen(false)}
        title={`ตรวจสอบสลิปโอนเงิน (${viewingPay?.appNum || ""})`}
        description={`ผู้ชำระเงิน: ${viewingPay?.student || ""} | ยอดเงิน: 1,500 THB`}
      >
        {viewingPay && (
          <div className="space-y-4 text-xs text-slate-200">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">เลขที่ใบแจ้งหนี้</span>
                <span className="text-tif-gold font-bold text-sm">{viewingPay.invoiceNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">สถานะ</span>
                <span className={`font-bold ${viewingPay.status === "VERIFIED" ? "text-emerald-400" : "text-amber-400"}`}>
                  {viewingPay.status === "VERIFIED" ? "Verified (อนุมัติแล้ว)" : "Pending (รอตรวจสอบ)"}
                </span>
              </div>
            </div>

            {/* Slip Image Viewer */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xl max-h-[450px] overflow-auto flex justify-center items-center">
              <img
                src={viewingPay.slipUrl}
                alt="Uploaded Payment Slip"
                className="max-w-full h-auto object-contain rounded-lg shadow-md"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              {viewingPay.status === "PENDING" && (
                <Button
                  variant="gold"
                  onClick={() => {
                    handleVerify(viewingPay.id);
                    setViewSlipModalOpen(false);
                    alert(`อนุมัติสลิป 1,500 บาท เรียบร้อยแล้ว`);
                  }}
                  className="font-bold shadow-md"
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> อนุมัติสลิปโอนเงินนี้ (Approve Slip)
                </Button>
              )}
              <Button variant="outline" onClick={() => setViewSlipModalOpen(false)}>
                ปิดหน้าต่าง (Close)
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Payment Slip Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="เพิ่มรายการชำระเงินค่าสมัคร 1,500 บาท"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300">หมายเลขใบสมัคร (App Number)</label>
            <input
              value={formAppNum}
              onChange={(e) => setFormAppNum(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-300">ชื่อผู้สมัคร / ผู้ชำระเงิน *</label>
            <input
              placeholder="สมชาย ใจดี"
              value={formStudent}
              onChange={(e) => setFormStudent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-300">จำนวนเงินค่าสมัคร (บาท)</label>
            <input
              type="number"
              value={formAmount}
              onChange={(e) => setFormAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-300">สถานะการชำระเงิน</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-medium"
            >
              <option value="PENDING">Pending Slip (รอตรวจสอบสลิป)</option>
              <option value="VERIFIED">Verified (ตรวจสอบและอนุมัติสลิปแล้ว)</option>
            </select>
          </div>
          <Button variant="gold" className="w-full mt-4" onClick={handleSaveAdd}>
            บันทึกรายการชำระเงิน (Save Payment)
          </Button>
        </div>
      </Modal>

      {/* Edit Payment Slip Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="แก้ไขรายการชำระเงิน"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300">หมายเลขใบสมัคร</label>
            <input
              value={formAppNum}
              onChange={(e) => setFormAppNum(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-300">ชื่อผู้สมัคร / ผู้ชำระเงิน</label>
            <input
              value={formStudent}
              onChange={(e) => setFormStudent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-300">จำนวนเงิน (บาท)</label>
            <input
              type="number"
              value={formAmount}
              onChange={(e) => setFormAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-300">สถานะการชำระเงิน</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-medium"
            >
              <option value="PENDING">Pending Slip (รอตรวจสอบสลิป)</option>
              <option value="VERIFIED">Verified (ตรวจสอบและอนุมัติสลิปแล้ว)</option>
            </select>
          </div>
          <Button variant="gold" className="w-full mt-4" onClick={handleSaveEdit}>
            บันทึกการแก้ไข (Save Changes)
          </Button>
        </div>
      </Modal>
    </div>
  );
}
