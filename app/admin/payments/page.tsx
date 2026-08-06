"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  Download,
  Plus,
  Trash2,
  Edit3,
  LayoutGrid,
  List,
  Eye,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate, isPdfFile } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/lib/i18n/language-context";
import { useApplicationContext } from "@/lib/context/application-context";

const SAMPLE_PAYMENTS = [
  {
    id: "pay-1",
    appNum: "TIF-2026-8812",
    student: "Somchai Jaidee (สมชาย ใจดี)",
    feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,800 บาท",
    amount: 1800,
    invoiceNo: "INV-2026-0091",
    receiptNo: "RCT-2026-0091",
    status: "VERIFIED",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
    date: new Date("2026-07-24"),
  },
  {
    id: "pay-2",
    appNum: "TIF-2026-4401",
    student: "Kanchana Sukhumvit (กาญจนา สุขุมวิท)",
    feeType: "ค่าสมัครเรียนการบินออนไลน์ 1,800 บาท",
    amount: 1800,
    invoiceNo: "INV-2026-0092",
    receiptNo: null,
    status: "PENDING",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
    date: new Date("2026-07-24"),
  },
];

export default function PaymentsPage() {
  const { t } = useLanguage();
  const { applications: ctxApps, updateApplication } = useApplicationContext();
  const [payments, setPayments] = React.useState<any[]>([]);
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedPay, setSelectedPay] = React.useState<any>(null);
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");

  const [viewSlipModalOpen, setViewSlipModalOpen] = React.useState(false);
  const [viewingPay, setViewingPay] = React.useState<any>(null);

  const handleOpenViewSlip = (pay: any) => {
    setViewingPay(pay);
    setViewSlipModalOpen(true);
  };

  // Form states
  const [formAppNum, setFormAppNum] = React.useState("");
  const [formStudent, setFormStudent] = React.useState("");
  const [formAmount, setFormAmount] = React.useState(1800);
  const [formStatus, setFormStatus] = React.useState("PENDING");

  const fetchPayments = React.useCallback(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const uniqueMap = new Map();
          data.forEach((item: any) => {
            const key = item.invoiceNo || item.appNum || item.id;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, item);
            }
          });
          setPayments(Array.from(uniqueMap.values()));
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
    const targetPay = payments.find((p) => p.id === id);
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

    // Synchronize application status instantly
    const targetAppNum = targetPay?.appNum;
    if (targetAppNum) {
      const targetApp = ctxApps.find(
        (a) => a.applicationNumber === targetAppNum || a.id === targetAppNum
      );
      if (targetApp) {
        const openHouseStatusText = (targetApp as any).joinOpenHouse === false
          ? "ไม่ประสงค์เข้าร่วมงาน Open House"
          : "เตรียมเข้าร่วมงาน Open House";

        updateApplication(targetApp.id, {
          status: "OPEN_HOUSE_ATTENDED",
          adminNotes: [
            {
              id: `note_${Date.now()}`,
              content: `อนุมัติสลิปการชำระเงิน 1,800 บาทเรียบร้อยแล้ว (สถานะ: ${openHouseStatusText})`,
              createdAt: new Date(),
              author: { name: "Finance Admin", email: "admin@tif.ac.th" },
            },
            ...(targetApp.adminNotes || []),
          ],
        });
      }
    }

    try {
      await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "VERIFIED", appNum: targetAppNum }),
      });
      fetchPayments();
    } catch (e) {
      console.error("Verify error:", e);
    }
  };

  const handleOpenAdd = () => {
    setFormAppNum(`TIF-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormStudent("");
    setFormAmount(1800);
    setFormStatus("PENDING");
    setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    if (!formStudent.trim()) {
      alert("กรุณากรอกชื่อผู้ชำระเงิน");
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appNum: formAppNum,
          student: formStudent,
          amount: formAmount,
          status: formStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddModalOpen(false);
        fetchPayments();
        alert("เพิ่มสลิปการชำระเงินเรียบร้อยแล้ว");
      } else {
        alert("เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถเพิ่มข้อมูลได้"));
      }
    } catch (err) {
      console.error("Add payment error:", err);
      alert("เกิดข้อผิดพลาดในการเพิ่มรายการชำระเงิน");
    }
  };

  const handleOpenEdit = (pay: any) => {
    setSelectedPay(pay);
    setFormAppNum(pay.appNum);
    setFormStudent(pay.student);
    setFormAmount(pay.amount);
    setFormStatus(pay.status);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPay) return;

    if ((formStatus === "VERIFIED" || formStatus === "APPROVED") && formAppNum) {
      const targetApp = ctxApps.find(
        (a) => a.applicationNumber === formAppNum || a.id === formAppNum
      );
      if (targetApp) {
        updateApplication(targetApp.id, {
          status: "APPLICATION_FEE_PAID",
          adminNotes: [
            {
              id: `note_${Date.now()}`,
              content: "อนุมัติสลิปการชำระเงิน 1,800 บาทเรียบร้อยแล้ว (สถานะ: ชำระค่าสมัครแล้ว)",
              createdAt: new Date(),
              author: { name: "Finance Admin", email: "admin@tif.ac.th" },
            },
            ...(targetApp.adminNotes || []),
          ],
        });
      }
    }

    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPay.id,
          appNum: formAppNum,
          student: formStudent,
          amount: formAmount,
          status: formStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        fetchPayments();
        alert("บันทึกการแก้ไขสลิปเรียบร้อยแล้ว");
      } else {
        alert("เกิดข้อผิดพลาดในการแก้ไข: " + (data.error || "ไม่สามารถแก้ไขได้"));
      }
    } catch (err) {
      console.error("Edit payment error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกการแก้ไข");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณต้องการลบรายการชำระเงินนี้ใช่หรือไม่?")) return;

    // Optimistic UI update
    setPayments((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/payments?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchPayments();
        alert("ลบรายการชำระเงินเรียบร้อยแล้ว");
      } else {
        alert("เกิดข้อผิดพลาดในการลบ: " + (data.error || "ไม่สามารถลบได้"));
        fetchPayments();
      }
    } catch (err) {
      console.error("Delete payment error:", err);
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      fetchPayments();
    }
  };

  const totalVerified = payments
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display">
            {t("paymentsTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            {t("paymentsSub")}
          </p>
        </div>
        <div>
          <Button variant="gold" size="md" onClick={handleOpenAdd} className="shadow-lg font-semibold">
            <Plus className="mr-2 h-4 w-4" /> {t("addSlipBtn")}
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
            <p className="text-xs text-slate-400 font-semibold uppercase">{t("verifiedRevenueTotal")}</p>
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
              {payments.filter((p) => p.status === "PENDING").length} {t("itemsCountUnit")}
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
              {payments.filter((p) => p.status === "VERIFIED").length} {t("itemsCountUnit")}
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: View Switcher */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white font-display flex items-center">
          <CreditCard className="mr-2 h-4 w-4 text-tif-gold" /> รายการสลิปชำระเงินค่าสมัคร
        </h3>

        <div className="flex items-center space-x-1 border border-slate-800 rounded-xl p-1 bg-slate-950/60">
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "cards"
                ? "bg-tif-gold text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Executive Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === "table"
                ? "bg-tif-gold text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "cards" ? (
        /* Executive Slip Cards Layout */
        <div className="space-y-4">
          {payments.map((pay) => (
            <div
              key={pay.id}
              className="group relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:border-tif-gold/50 hover:bg-slate-900 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left: Thumbnail & Invoice Details */}
              <div className="flex items-center space-x-4 min-w-0">
                <div
                  onClick={() => handleOpenViewSlip(pay)}
                  className="relative h-16 w-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 cursor-pointer group-hover:border-tif-gold/60 transition-all flex items-center justify-center"
                >
                  {isPdfFile(pay.slipUrl) ? (
                    <div className="flex flex-col items-center justify-center text-rose-400">
                      <FileText className="h-7 w-7 text-rose-500" />
                    </div>
                  ) : (
                    <img
                      src={pay.slipUrl}
                      alt="Payment Slip Thumbnail"
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-tif-gold">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-tif-gold px-2.5 py-0.5 rounded-md bg-tif-gold/10 border border-tif-gold/20">
                      {pay.invoiceNo}
                    </span>
                    {pay.receiptNo && (
                      <span className="font-mono text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        {pay.receiptNo}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDate(pay.date)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-tif-gold transition-colors truncate">
                    {pay.student}
                  </h3>

                  <p className="text-xs text-slate-400 font-mono">
                    ใบสมัคร: <span className="text-slate-200">{pay.appNum}</span> • {pay.feeType}
                  </p>
                </div>
              </div>

              {/* Right: Fee Amount, Status & Actions */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <span className="text-base font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    {formatCurrency(pay.amount)}
                  </span>
                  <div>
                    {pay.status === "VERIFIED" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Verified (อนุมัติแล้ว)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Pending Slip (รออนุมัติ)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenViewSlip(pay)}
                    className="h-8 px-3 text-xs bg-slate-950 border-slate-800 text-slate-200 hover:border-tif-gold hover:text-white rounded-xl"
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5 text-tif-gold" /> {t("viewFullSlip")}
                  </Button>

                  {pay.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => handleVerify(pay.id)}
                      className="h-8 px-3 text-xs font-semibold shadow-md"
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> อนุมัติสลิป
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(pay)}
                    className="h-8 px-2.5 bg-slate-950 border-slate-800 text-tif-gold hover:border-tif-gold rounded-xl"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(pay.id)}
                    className="h-8 px-2.5 rounded-xl"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Fixed Width Table Layout with Mobile Scroll Support */
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 min-w-[700px] border-collapse">
              <thead className="bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="w-[15%] px-3 py-3">{t("invoiceNoLabel")}</th>
                  <th className="w-[30%] px-3 py-3">{t("studentNameHeader")}</th>
                  <th className="w-[15%] px-3 py-3">{t("amountHeader")}</th>
                  <th className="w-[15%] px-3 py-3">{t("statusHeader")}</th>
                  <th className="w-[12%] px-3 py-3">{t("slipHeader")}</th>
                  <th className="w-[13%] px-3 py-3 text-right">{t("actionHeader")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-3 font-mono font-bold text-tif-gold truncate">
                      {pay.invoiceNo}
                    </td>
                    <td className="px-3 py-3">
                      <div className="min-w-0 truncate">
                        <p className="font-semibold text-slate-100 truncate">{pay.student}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{pay.appNum}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-bold text-emerald-400 font-mono truncate">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="px-3 py-3 truncate">
                      {pay.status === "VERIFIED" ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 truncate">
                      <button
                        type="button"
                        onClick={() => handleOpenViewSlip(pay)}
                        className="text-xs text-tif-gold font-semibold hover:underline flex items-center cursor-pointer"
                      >
                        <Eye className="mr-1 h-3 w-3" /> ดูสลิป
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {pay.status === "PENDING" && (
                          <button
                            onClick={() => handleVerify(pay.id)}
                            title="อนุมัติสลิป"
                            className="p-1.5 rounded-lg bg-tif-gold text-slate-950 font-bold hover:bg-amber-400 transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(pay)}
                          title="แก้ไข"
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-tif-gold hover:border-tif-gold transition"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pay.id)}
                          title="ลบ"
                          className="p-1.5 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Slip Inspector Modal */}
      <Modal
        isOpen={viewSlipModalOpen}
        onClose={() => setViewSlipModalOpen(false)}
        title={`ตรวจสอบสลิปโอนเงิน (${viewingPay?.appNum || ""})`}
        description={`ผู้ชำระเงิน: ${viewingPay?.student || ""} | ยอดเงิน: 1,800 THB`}
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

            {/* Slip Image / PDF Viewer */}
            <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-xl min-h-[300px] max-h-[70vh] overflow-hidden flex justify-center items-center">
              {isPdfFile(viewingPay.slipUrl) ? (
                <iframe
                  src={viewingPay.slipUrl}
                  title="Payment Slip PDF"
                  className="w-full h-[60vh] rounded-xl border border-slate-800 bg-white"
                />
              ) : (
                <img
                  src={viewingPay.slipUrl}
                  alt="Uploaded Payment Slip"
                  className="max-w-full h-auto object-contain rounded-lg shadow-md"
                />
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              {viewingPay.status === "PENDING" && (
                <Button
                  variant="gold"
                  onClick={() => {
                    handleVerify(viewingPay.id);
                    setViewSlipModalOpen(false);
                    alert(`อนุมัติสลิป 1,800 บาท เรียบร้อยแล้ว`);
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
        title="เพิ่มรายการชำระเงินค่าสมัคร 1,800 บาท"
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
