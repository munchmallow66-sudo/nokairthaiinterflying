"use client";

import * as React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, XCircle, FileText, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const SAMPLE_PAYMENTS = [
  {
    id: "pay-1",
    appNum: "TIF-2026-8812",
    student: "Somchai Jaidee",
    course: "Commercial Pilot License (CPL)",
    amount: 350000,
    invoiceNo: "INV-2026-0091",
    receiptNo: "RCT-2026-0091",
    status: "VERIFIED",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
    date: new Date("2026-07-24"),
  },
  {
    id: "pay-2",
    appNum: "TIF-2026-4401",
    student: "Kanchana Sukhumvit",
    course: "Private Pilot License (PPL)",
    amount: 100000,
    invoiceNo: "INV-2026-0092",
    receiptNo: null,
    status: "PENDING",
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500",
    date: new Date("2026-07-24"),
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState(SAMPLE_PAYMENTS);

  const handleVerify = (id: string) => {
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
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-tif-navy font-display">
          Payments, Invoices & Financial Slips
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review bank transfer slips, generate tax invoices, and issue student tuition receipts
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-tif-navy text-xs font-semibold uppercase text-tif-gold">
            <tr>
              <th className="px-4 py-3.5">Invoice #</th>
              <th className="px-4 py-3.5">App Number & Student</th>
              <th className="px-4 py-3.5">Course</th>
              <th className="px-4 py-3.5">Amount</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Slip Upload</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((pay) => (
              <tr key={pay.id} className="hover:bg-slate-50">
                <td className="px-4 py-3.5 font-bold text-tif-navy">{pay.invoiceNo}</td>
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-slate-800 block">{pay.student}</span>
                  <span className="text-xs text-slate-400">{pay.appNum}</span>
                </td>
                <td className="px-4 py-3.5 text-xs font-medium text-slate-700">{pay.course}</td>
                <td className="px-4 py-3.5 font-bold text-slate-900">{formatCurrency(pay.amount)}</td>
                <td className="px-4 py-3.5">
                  <Badge variant={pay.status === "VERIFIED" ? "success" : "gold"}>
                    {pay.status}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <a
                    href={pay.slipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-tif-gold font-bold hover:underline flex items-center"
                  >
                    View Transfer Slip <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </td>
                <td className="px-4 py-3.5 text-right">
                  {pay.status === "PENDING" ? (
                    <Button size="sm" variant="gold" onClick={() => handleVerify(pay.id)}>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve Payment
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold">Receipt #{pay.receiptNo}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
