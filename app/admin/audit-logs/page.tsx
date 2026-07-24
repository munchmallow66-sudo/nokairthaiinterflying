import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Terminal, Lock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const AUDIT_LOGS = [
  {
    id: "aud-1",
    user: "Somchai Jaidee (Student)",
    action: "CREATE_APPLICATION",
    resource: "Application (TIF-2026-8812)",
    ip: "182.52.10.45",
    date: new Date("2026-07-24T09:12:00"),
  },
  {
    id: "aud-2",
    user: "Admin Officer (admin@thaiinterflying.com)",
    action: "VERIFY_DOCUMENT",
    resource: "Document (PASSPORT_PHOTO)",
    ip: "203.150.20.12",
    date: new Date("2026-07-24T10:05:00"),
  },
  {
    id: "aud-3",
    user: "Finance Officer (finance@thaiinterflying.com)",
    action: "APPROVE_PAYMENT",
    resource: "Payment (INV-2026-0091)",
    ip: "203.150.20.14",
    date: new Date("2026-07-24T11:30:00"),
  },
];

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-tif-navy font-display">
          Security & Compliance Audit Trail
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete logging of user access, document verification, payments, and system mutations
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-tif-navy text-xs font-semibold uppercase text-tif-gold">
            <tr>
              <th className="px-4 py-3.5">Timestamp</th>
              <th className="px-4 py-3.5">User Principal</th>
              <th className="px-4 py-3.5">Action Event</th>
              <th className="px-4 py-3.5">Target Resource</th>
              <th className="px-4 py-3.5">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {AUDIT_LOGS.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                  {formatDateTime(log.date)}
                </td>
                <td className="px-4 py-3.5 font-semibold text-slate-800">{log.user}</td>
                <td className="px-4 py-3.5">
                  <Badge variant="secondary">{log.action}</Badge>
                </td>
                <td className="px-4 py-3.5 text-xs text-tif-navy font-medium">{log.resource}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
