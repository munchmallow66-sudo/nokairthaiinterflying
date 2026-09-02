import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ApplicationWithDetails } from "@/types";
import { formatDate } from "@/lib/utils";
import { genderExportLabel } from "@/lib/gender";
import { openHouseExportLabel } from "@/lib/open-house";

export function exportApplicationsToExcel(applications: ApplicationWithDetails[]) {
  const data = applications.map((app) => ({
    "App Number": app?.applicationNumber || "-",
    "Student Name (EN)": `${app?.student?.firstNameEn || "-"} ${app?.student?.lastNameEn || ""}`.trim(),
    "Student Name (TH)": `${app?.student?.firstNameTh || "-"} ${app?.student?.lastNameTh || ""}`.trim(),
    // Normalised rather than passed through: Student.gender is free-form text,
    // so raw values would break a pivot table or a COUNTIF on this column.
    "Gender": genderExportLabel(app?.student?.gender),
    "Course": app?.course?.name || "-",
    "Branch": app?.branch || "-",
    "Status": app?.status || "-",
    // Three states, not two: "Not answered" means the applicant has not reached
    // the fee-payment step where the question is put to them.
    "Open House": openHouseExportLabel(app || {}),
    "Phone": app?.student?.phone || "-",
    "Email": app?.student?.user?.email || "-",
    "National ID": app?.student?.nationalId || "-",
    "GPAX": app?.student?.education?.gpax ?? "-",
    "Submitted Date": formatDate(app?.createdAt),
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
    app?.applicationNumber || "-",
    `${app?.student?.firstNameEn || "-"} ${app?.student?.lastNameEn || ""}`.trim(),
    app?.course?.code || app?.course?.name || "-",
    app?.branch || "-",
    app?.student?.phone || "-",
    app?.status || "-",
    formatDate(app?.createdAt),
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

export async function downloadAllDocumentsAsZip(
  documents: { secureUrl: string; originalName: string; type?: string }[],
  appNumber: string = "TIF-Doc",
  studentName: string = "Cadet"
): Promise<boolean> {
  if (!documents || documents.length === 0) {
    if (typeof window !== "undefined") {
      alert("ไม่พบเอกสารสำหรับดาวน์โหลด");
    }
    return false;
  }

  try {
    // 1. Primary: Server-side API route (bypasses browser CORS restrictions completely)
    const response = await fetch("/api/admin/documents/download-zip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documents,
        appNumber,
        studentName,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const cleanAppNum = (appNumber || "TIF-Doc").replace(/[^a-zA-Z0-9_-]/g, "");
      const cleanName = (studentName || "Cadet").trim().replace(/[^a-zA-Z0-9\u0E00-\u0E7F_-]/g, "_");
      const zipFileName = `${cleanAppNum}_${cleanName}_Documents.zip`;

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return true;
    }

    // 2. Fallback: Client-side JSZip
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const cleanAppNum = (appNumber || "TIF-Doc").replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanName = (studentName || "Cadet").trim().replace(/[^a-zA-Z0-9\u0E00-\u0E7F_-]/g, "_");
    const zipName = `${cleanAppNum}_${cleanName}_Documents`;
    const folder = zip.folder(zipName) || zip;

    let addedCount = 0;

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const rawUrl = doc.secureUrl;
      if (!rawUrl) continue;

      const fileName = doc.originalName || `Document_${i + 1}.pdf`;

      try {
        if (rawUrl.startsWith("data:")) {
          const parts = rawUrl.split(",");
          const base64Data = parts[1];
          if (base64Data) {
            folder.file(fileName, base64Data, { base64: true });
            addedCount++;
          }
        } else {
          // Open direct download link if CORS fetch fails
          const a = document.createElement("a");
          a.href = rawUrl;
          a.download = fileName;
          a.target = "_blank";
          a.click();
          addedCount++;
        }
      } catch (fileErr) {
        console.error(`Error processing file ${fileName} for zip:`, fileErr);
      }
    }

    if (addedCount === 0) {
      if (typeof window !== "undefined") {
        alert("ไม่สามารถดาวน์โหลดไฟล์เอกสารได้ กรุณาลองใหม่อีกครั้ง");
      }
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to generate ZIP archive:", err);
    if (typeof window !== "undefined") {
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร");
    }
    return false;
  }
}



