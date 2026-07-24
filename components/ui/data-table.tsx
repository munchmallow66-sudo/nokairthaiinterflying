"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  SlidersHorizontal,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApplicationWithDetails } from "@/types";
import { exportApplicationsToExcel, exportApplicationsToPDF } from "@/lib/export";
import { formatDate } from "@/lib/utils";

interface DataTableProps {
  data: ApplicationWithDetails[];
  onSelectApplication: (app: ApplicationWithDetails) => void;
  onRefresh?: () => void;
}

export function DataTable({ data, onSelectApplication }: DataTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [courseFilter, setCourseFilter] = React.useState<string>("ALL");
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
      const emailMatch = app.student.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const appNumMatch = app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = app.student.phone.includes(searchTerm);
      const searchMatches = nameMatch || emailMatch || appNumMatch || phoneMatch;

      const statusMatches = statusFilter === "ALL" || app.status === statusFilter;
      const courseMatches = courseFilter === "ALL" || app.course.id === courseFilter;

      return searchMatches && statusMatches && courseMatches;
    });
  }, [data, searchTerm, statusFilter, courseFilter]);

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
      } else if (sortField === "course") {
        aVal = a.course.name;
        bVal = b.course.name;
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
        return <Badge variant="info">Submitted</Badge>;
      case "DOCUMENT_VERIFIED":
        return <Badge variant="success">Docs Verified</Badge>;
      case "INTERVIEW_SCHEDULED":
        return <Badge variant="gold">Interview Scheduled</Badge>;
      case "INTERVIEW_PASSED":
        return <Badge variant="success">Interview Passed</Badge>;
      case "ACCEPTED":
        return <Badge variant="gold">Accepted</Badge>;
      case "PAID":
        return <Badge variant="success">Paid</Badge>;
      case "ENROLLED":
        return <Badge variant="success">Enrolled Pilot</Badge>;
      case "REJECTED":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Email, Phone, National ID or App #"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-tif-navy focus:outline-none focus:ring-1 focus:ring-tif-navy"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="DOCUMENT_VERIFIED">Docs Verified</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PAID">Paid</option>
              <option value="ENROLLED">Enrolled</option>
            </select>
          </div>

          {/* Export Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportApplicationsToExcel(sortedData)}
            className="text-xs"
          >
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportApplicationsToPDF(sortedData)}
            className="text-xs"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
            PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-tif-navy text-xs font-semibold uppercase tracking-wider text-tif-gold">
            <tr>
              <th
                onClick={() => handleSort("appNum")}
                className="cursor-pointer px-4 py-3.5 hover:text-white"
              >
                <div className="flex items-center">
                  App Number <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("name")}
                className="cursor-pointer px-4 py-3.5 hover:text-white"
              >
                <div className="flex items-center">
                  Student Name <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("course")}
                className="cursor-pointer px-4 py-3.5 hover:text-white"
              >
                <div className="flex items-center">
                  Course <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                </div>
              </th>
              <th className="px-4 py-3.5">Branch</th>
              <th
                onClick={() => handleSort("status")}
                className="cursor-pointer px-4 py-3.5 hover:text-white"
              >
                <div className="flex items-center">
                  Status <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                </div>
              </th>
              <th
                onClick={() => handleSort("createdAt")}
                className="cursor-pointer px-4 py-3.5 hover:text-white"
              >
                <div className="flex items-center">
                  Date <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                </div>
              </th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => onSelectApplication(app)}
                >
                  <td className="px-4 py-3.5 font-semibold text-tif-navy">
                    {app.applicationNumber}
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-medium text-slate-800">
                        {app.student.firstNameEn} {app.student.lastNameEn}
                      </p>
                      <p className="text-xs text-slate-400">{app.student.user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-slate-700">{app.course.code}</span>
                    <p className="text-xs text-slate-400 truncate max-w-[150px]">
                      {app.course.name}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{app.branch}</td>
                  <td className="px-4 py-3.5">{getStatusBadge(app.status)}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApplication(app);
                      }}
                      className="text-xs"
                    >
                      View Detail
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  No application records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 px-2">
        <p>
          Showing <span className="font-semibold text-slate-800">{paginatedData.length}</span> of{" "}
          <span className="font-semibold text-slate-800">{sortedData.length}</span> applications
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
