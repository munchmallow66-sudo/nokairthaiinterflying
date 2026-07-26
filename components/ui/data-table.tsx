"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationWithDetails } from "@/types";
import { exportApplicationsToExcel, exportApplicationsToPDF } from "@/lib/export";
import { formatDate } from "@/lib/utils";

import { useLanguage } from "@/lib/i18n/language-context";

interface DataTableProps {
  data: ApplicationWithDetails[];
  onSelectApplication: (app: ApplicationWithDetails) => void;
  onEditApplication?: (app: ApplicationWithDetails) => void;
  onDeleteApplication?: (id: string) => void;
  onRefresh?: () => void;
}

export function DataTable({ data, onSelectApplication, onEditApplication, onDeleteApplication }: DataTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [sortField, setSortField] = React.useState<string>("createdAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 8;

  // Filter logic
  const filteredData = React.useMemo(() => {
    return data.filter((app) => {
      const nameMatch =
        `${app.student.firstNameEn} ${app.student.lastNameEn} ${app.student.firstNameTh} ${app.student.lastNameTh}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const emailMatch = app.student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const appNumMatch = app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = app.student.phone?.includes(searchTerm);
      const searchMatches = nameMatch || emailMatch || appNumMatch || phoneMatch;

      const statusMatches = statusFilter === "ALL" || app.status === statusFilter;

      return searchMatches && statusMatches;
    });
  }, [data, searchTerm, statusFilter]);

  // Sort logic
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal: any = a.createdAt;
      let bVal: any = b.createdAt;

      if (sortField === "appNum") {
        aVal = a.applicationNumber;
        bVal = b.applicationNumber;
      } else if (sortField === "name") {
        aVal = a.student.firstNameEn;
        bVal = b.student.firstNameEn;
      } else if (sortField === "status") {
        aVal = a.status;
        bVal = b.status;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Submitted
          </span>
        );
      case "DOCUMENT_VERIFIED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Docs Verified
          </span>
        );
      case "INTERVIEW_SCHEDULED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Interview Scheduled
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-tif-gold/10 text-tif-gold border border-tif-gold/30">
            Accepted
          </span>
        );
      case "PAID":
      case "ENROLLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {status === "ENROLLED" ? "Enrolled" : "Fee Paid"}
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-tif-gold focus:outline-none"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 border border-slate-800 rounded-xl px-3 py-2 bg-slate-950/60 text-xs">
            <Filter className="h-3.5 w-3.5 text-tif-gold" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-medium text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">{t("filterStatusAll")}</option>
              <option value="SUBMITTED" className="bg-slate-900 text-slate-200">Submitted</option>
              <option value="DOCUMENT_VERIFIED" className="bg-slate-900 text-slate-200">Docs Verified</option>
              <option value="INTERVIEW_SCHEDULED" className="bg-slate-900 text-slate-200">Interview Scheduled</option>
              <option value="ACCEPTED" className="bg-slate-900 text-slate-200">Accepted</option>
              <option value="PAID" className="bg-slate-900 text-slate-200">Fee Paid (1,500 THB)</option>
            </select>
          </div>

          {/* Export Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportApplicationsToExcel(sortedData)}
            className="text-xs bg-slate-950/60 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:text-white rounded-xl"
          >
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
            {t("exportExcelBtn")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportApplicationsToPDF(sortedData)}
            className="text-xs bg-slate-950/60 border-slate-800 text-slate-300 hover:border-rose-500/50 hover:text-white rounded-xl"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5 text-rose-400" />
            {t("exportPdfBtn")}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th
                  onClick={() => handleSort("appNum")}
                  className="cursor-pointer px-5 py-4 hover:text-tif-gold transition"
                >
                  <div className="flex items-center">
                    {t("appNumberHeader")} <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="cursor-pointer px-5 py-4 hover:text-tif-gold transition"
                >
                  <div className="flex items-center">
                    {t("studentNameHeader")} <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th className="px-5 py-4">เบอร์โทรศัพท์ (Phone)</th>
                <th className="px-5 py-4">ค่าสมัคร (1,500 THB)</th>
                <th
                  onClick={() => handleSort("status")}
                  className="cursor-pointer px-5 py-4 hover:text-tif-gold transition"
                >
                  <div className="flex items-center">
                    {t("statusHeader")} <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="cursor-pointer px-5 py-4 hover:text-tif-gold transition"
                >
                  <div className="flex items-center">
                    {t("dateHeader")} <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th className="px-5 py-4 text-right">{t("actionHeader")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedData.length > 0 ? (
                paginatedData.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => onSelectApplication(app)}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-tif-gold">
                      {app.applicationNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-100">
                          {app.student.firstNameEn} {app.student.lastNameEn} ({app.student.firstNameTh} {app.student.lastNameTh})
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">{app.student.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-mono">
                      {app.student.phone || "-"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-400 font-mono">
                      1,500 THB
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectApplication(app)}
                          className="text-xs bg-slate-950/60 border-slate-800 hover:border-tif-gold/50 text-slate-200 rounded-xl"
                        >
                          Inspect
                        </Button>
                        {onEditApplication && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditApplication(app)}
                            className="text-xs bg-slate-900 border-slate-800 text-tif-gold hover:border-tif-gold rounded-xl"
                          >
                            Edit
                          </Button>
                        )}
                        {onDeleteApplication && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onDeleteApplication(app.id)}
                            className="text-xs rounded-xl"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No application records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-2">
        <p>
          Showing <span className="font-semibold text-slate-200">{paginatedData.length}</span> of{" "}
          <span className="font-semibold text-slate-200">{sortedData.length}</span> applications
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="bg-slate-900 border-slate-800 text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="bg-slate-900 border-slate-800 text-slate-300 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
