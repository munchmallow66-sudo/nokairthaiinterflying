import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ApplicationWithDetails } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";

export function exportApplicationsToExcel(applications: ApplicationWithDetails[]) {
  const data = applications.map((app) => ({
    "App Number": app.applicationNumber,
    "Student Name (EN)": `${app.student.firstNameEn} ${app.student.lastNameEn}`,
    "Student Name (TH)": `${app.student.firstNameTh} ${app.student.lastNameTh}`,
    "Course": app.course.name,
    "Branch": app.branch,
    "Status": app.status,
    "Phone": app.student.phone,
    "Email": app.student.user.email,
    "National ID": app.student.nationalId || "-",
    "GPAX": app.student.education?.gpax || "-",
    "Submitted Date": formatDate(app.createdAt),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

  XLSX.writeFile(workbook, `TIF_Student_Applications_${new Date().toISOString().split("T")[0]}.xlsx`);
}

export function exportApplicationsToPDF(applications: ApplicationWithDetails[]) {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.setTextColor(10, 35, 66);
  doc.text("Thai Inter Flying Aviation Academy - Student Applications Report", 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-GB")} | Total Records: ${applications.length}`, 14, 22);

  const tableColumn = ["App #", "Student Name", "Course", "Branch", "Phone", "Status", "Date"];
  const tableRows = applications.map((app) => [
    app.applicationNumber,
    `${app.student.firstNameEn} ${app.student.lastNameEn}`,
    app.course.code,
    app.branch,
    app.student.phone,
    app.status,
    formatDate(app.createdAt),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 28,
    theme: "striped",
    headStyles: { fillColor: [10, 35, 66], textColor: [200, 162, 74], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  doc.save(`TIF_Applications_Report_${new Date().toISOString().split("T")[0]}.pdf`);
}
