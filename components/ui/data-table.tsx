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
  LayoutGrid,
  List,
  Eye,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
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
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");
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
            {t("statusSubmitted")}
          </span>
        );
      case "DOCUMENT_VERIFIED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {t("statusDocsVerified")}
          </span>
        );
      case "INTERVIEW_SCHEDULED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            {t("statusInterviewScheduled")}
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-tif-gold/10 text-tif-gold border border-tif-gold/30">
            {t("statusAccepted")}
          </span>
        );
      case "PAID":
      case "ENROLLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {status === "ENROLLED" ? t("statusEnrolled") : t("statusPaid")}
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            {t("statusRejected")}
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
              <option value="PAID" className="bg-slate-900 text-slate-200">Fee Paid (1,800 THB)</option>
            </select>
          </div>

          {/* View Mode Toggle Switch */}
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
              <span>Cards</span>
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
              <span>Table</span>
            </button>
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

      {/* Main Content Area */}
      {viewMode === "cards" ? (
        /* Executive Cards List Layout */
        <div className="space-y-3">
          {paginatedData.length > 0 ? (
            paginatedData.map((app) => (
              <div
                key={app.id}
                onClick={() => onSelectApplication(app)}
                className="group relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 shadow-xl hover:border-tif-gold/50 hover:bg-slate-900 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Avatar & Personal Details */}
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="h-12 w-12 rounded-xl bg-tif-gold/10 border border-tif-gold/30 text-tif-gold flex items-center justify-center font-bold text-sm shrink-0 font-mono group-hover:scale-105 transition-transform">
                    {app.student.firstNameEn ? app.student.firstNameEn.slice(0, 2).toUpperCase() : "ST"}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-tif-gold px-2 py-0.5 rounded-md bg-tif-gold/10 border border-tif-gold/20">
                        {app.applicationNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDate(app.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-tif-gold transition-colors truncate">
                      {app.student.firstNameEn} {app.student.lastNameEn} ({app.student.firstNameTh} {app.student.lastNameTh})
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                      <span className="flex items-center"><Phone className="mr-1 h-3 w-3 text-slate-500" />{app.student.phone || "-"}</span>
                      <span className="flex items-center"><Mail className="mr-1 h-3 w-3 text-slate-500" />{app.student.user?.email || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Right / Middle: Badges & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      1,800 THB
                    </span>
                    <div>{getStatusBadge(app.status)}</div>
                  </div>

                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectApplication(app)}
                      className="h-8 px-3 text-xs bg-slate-950 border-slate-800 text-slate-200 hover:border-tif-gold hover:text-white rounded-xl"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5 text-tif-gold" /> {t("viewDetailBtn")}
                    </Button>
                    {onEditApplication && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditApplication(app)}
                        className="h-8 px-3 text-xs bg-slate-950 border-slate-800 text-tif-gold hover:border-tif-gold rounded-xl"
                      >
                        <Edit3 className="mr-1.5 h-3.5 w-3.5" /> {t("editBtn")}
                      </Button>
                    )}
                    {onDeleteApplication && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDeleteApplication(app.id)}
                        className="h-8 px-3 text-xs rounded-xl"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {t("deleteBtn")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-slate-500 text-sm">
              {t("noAppsFound")}
            </div>
          )}
        </div>
      ) : (
        /* Fixed-Width 100% Fit Table Layout */
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-xl">
          <div className="w-full">
            <table className="w-full text-left text-xs text-slate-300 table-fixed border-collapse">
              <thead className="bg-slate-950/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th
                    onClick={() => handleSort("appNum")}
                    className="w-[15%] cursor-pointer px-3 py-3 hover:text-tif-gold transition"
                  >
                    <div className="flex items-center">
                      {t("appNumberHeader")} <ArrowUpDown className="ml-1 h-3 w-3 opacity-60" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("name")}
                    className="w-[32%] cursor-pointer px-3 py-3 hover:text-tif-gold transition"
                  >
                    <div className="flex items-center">
                      {t("studentNameHeader")} <ArrowUpDown className="ml-1 h-3 w-3 opacity-60" />
                    </div>
                  </th>
                  <th className="w-[16%] px-3 py-3">{t("phoneLabel")}</th>
                  <th className="w-[10%] px-3 py-3">{t("appFeeHeader")}</th>
                  <th
                    onClick={() => handleSort("status")}
                    className="w-[14%] cursor-pointer px-3 py-3 hover:text-tif-gold transition"
                  >
                    <div className="flex items-center">
                      {t("statusHeader")} <ArrowUpDown className="ml-1 h-3 w-3 opacity-60" />
                    </div>
                  </th>
                  <th className="w-[13%] px-3 py-3 text-right">{t("actionHeader")}</th>
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
                      <td className="px-3 py-3 font-mono font-bold text-tif-gold truncate">
                        {app.applicationNumber}
                      </td>
                      <td className="px-3 py-3">
                        <div className="min-w-0 truncate">
                          <p className="font-semibold text-slate-100 truncate">
                            {app.student.firstNameEn} {app.student.lastNameEn} ({app.student.firstNameTh})
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{app.student.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-300 font-mono truncate">
                        {app.student.phone || "-"}
                      </td>
                      <td className="px-3 py-3 font-semibold text-emerald-400 font-mono truncate">
                        1,800
                      </td>
                      <td className="px-3 py-3">{getStatusBadge(app.status)}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectApplication(app)}
                            title={t("viewDetailBtn")}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 hover:border-tif-gold hover:text-tif-gold transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {onEditApplication && (
                            <button
                              onClick={() => onEditApplication(app)}
                              title={t("editBtn")}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-tif-gold hover:border-tif-gold transition"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {onDeleteApplication && (
                            <button
                              onClick={() => onDeleteApplication(app.id)}
                              title={t("deleteBtn")}
                              className="p-1.5 rounded-lg bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                      {t("noAppsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-2">
        <p>
          {t("showingAppsText")} <span className="font-semibold text-slate-200">{paginatedData.length}</span> {t("ofText")}{" "}
          <span className="font-semibold text-slate-200">{sortedData.length}</span> {t("appsUnitText")}
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
            {t("pageText")} {currentPage} {t("ofText")} {totalPages}
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
