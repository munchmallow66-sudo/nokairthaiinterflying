"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApplicationWithDetails, PILOT_WORKFLOW_STEPS } from "@/types";
import { formatDate, formatCurrency, isPdfFile, createBlobUrlFromBase64Pdf, getCloudinaryPdfThumbnail } from "@/lib/utils";
import { downloadAllDocumentsAsZip } from "@/lib/export";
import {
  User,
  FileText,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Award,
  Clock,
  Plus,
  ShieldCheck,
  Eye,
  ExternalLink,
  XCircle,
  Image as ImageIcon,
  FileCheck,
  ZoomIn,
  Download,
  MapPin,
  GraduationCap,
  Stethoscope,
  PhoneCall,
  Edit3,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { useApplicationContext } from "@/lib/context/application-context";

function safeDateToInputString(d: Date | string | null | undefined): string {
  if (!d) return "";
  try {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toISOString().slice(0, 10);
  } catch (e) {
    return "";
  }
}

function DocumentPreviewBox({ doc }: { doc: { secureUrl: string; originalName: string } }) {
  const isPdf = isPdfFile(doc.secureUrl, doc.originalName);
  const isCloudinaryPdf = isPdf && doc.secureUrl?.includes("cloudinary.com");
  const [viewMode, setViewMode] = React.useState<"image" | "pdf">("pdf");
  const [targetUrl, setTargetUrl] = React.useState<string>(doc.secureUrl);

  React.useEffect(() => {
    let activeBlobUrl: string | null = null;
    if (doc.secureUrl?.startsWith("data:application/pdf;base64,")) {
      activeBlobUrl = createBlobUrlFromBase64Pdf(doc.secureUrl);
      if (activeBlobUrl) {
        setTargetUrl(activeBlobUrl);
      }
    } else {
      setTargetUrl(doc.secureUrl);
    }
    return () => {
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [doc.secureUrl]);

  const cloudinaryJpgUrl = isCloudinaryPdf ? getCloudinaryPdfThumbnail(doc.secureUrl) : null;

  return (
    <div className="relative bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-2xl min-h-[350px] max-h-[75vh] overflow-auto flex flex-col justify-center items-center">
      {isPdf && isCloudinaryPdf && (
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px]">
          <span className="text-slate-400 font-medium flex items-center">
            <FileText className="mr-1.5 h-3.5 w-3.5 text-rose-400" /> เอกสาร PDF (Cloudinary Document)
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setViewMode("image")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                viewMode === "image"
                  ? "bg-tif-gold text-slate-950 shadow"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              ดูภาพคมชัด (High-Res Preview)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pdf")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                viewMode === "pdf"
                  ? "bg-tif-gold text-slate-950 shadow"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              กรอบ PDF (PDF Frame)
            </button>
          </div>
        </div>
      )}

      {isPdf ? (
        viewMode === "image" && cloudinaryJpgUrl ? (
          <div className="relative w-full flex flex-col items-center justify-center space-y-2">
            <img
              src={cloudinaryJpgUrl}
              alt={doc.originalName}
              className="max-w-full max-h-[65vh] h-auto object-contain rounded-xl shadow-lg border border-slate-800"
            />
            <p className="text-[11px] text-slate-400 font-mono">
              ภาพตัวอย่างความละเอียดสูงจากเอกสาร PDF (หน้า 1)
            </p>
          </div>
        ) : (
          <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center space-y-2">
            <iframe
              src={targetUrl}
              title={doc.originalName}
              className="w-full h-[60vh] rounded-xl border border-slate-800 bg-white shadow-inner"
            />
            <div className="text-[11px] text-slate-400 text-center flex items-center gap-2">
              <span>หากเบราว์เซอร์บล็อกกรอบ iframe</span>
              <a
                href={doc.secureUrl}
                target="_blank"
                rel="noreferrer"
                className="text-tif-gold hover:underline font-bold"
              >
                คลิกที่นี่เพื่อเปิดไฟล์ PDF ในหน้าต่างใหม่ ↗
              </a>
            </div>
          </div>
        )
      ) : (
        <img
          src={doc.secureUrl}
          alt={doc.originalName}
          className="max-w-full max-h-[70vh] h-auto object-contain rounded-lg shadow-md"
        />
      )}
    </div>
  );
}

export default function StudentApplicationsPage() {
  const { t } = useLanguage();
  const {
    applications,
    updateApplication,
    toggleDocVerification,
    rejectDocument,
    replaceDocument,
    addExtraDocument,
    deleteApplication,
    addApplication,
    resetToSampleData,
  } = useApplicationContext();

  const [selectedApp, setSelectedApp] = React.useState<ApplicationWithDetails | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);

  const handleDownloadAllDocs = async () => {
    if (!selectedApp || !selectedApp.documents || selectedApp.documents.length === 0) {
      alert("ไม่พบเอกสารสำหรับดาวน์โหลด");
      return;
    }
    setIsDownloadingZip(true);
    try {
      const studentName = `${selectedApp.student?.firstNameTh || ""} ${selectedApp.student?.lastNameTh || ""}`.trim() || "Cadet";
      await downloadAllDocumentsAsZip(selectedApp.documents, selectedApp.applicationNumber, studentName);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const currentStepIndex = React.useMemo(() => {
    if (!selectedApp) return -1;
    return PILOT_WORKFLOW_STEPS.findIndex((s) => s.key === selectedApp.status);
  }, [selectedApp]);

  // Sync selectedApp with latest global context state & close drawer if deleted
  React.useEffect(() => {
    if (selectedApp) {
      const latest = applications.find(
        (a) => a.id === selectedApp.id || a.applicationNumber === selectedApp.applicationNumber
      );
      if (latest) {
        setSelectedApp(latest);
      } else {
        setDrawerOpen(false);
        setSelectedApp(null);
      }
    }
  }, [applications, selectedApp?.id]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = React.useState(false);
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [newNoteContent, setNewNoteContent] = React.useState("");
  const [activeDetailTab, setActiveDetailTab] = React.useState<"personal" | "academic" | "medical" | "documents" | "notes">("personal");

  const [docModalOpen, setDocModalOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<any>(null);

  // Document Correction States
  const [rejectDocModalOpen, setRejectDocModalOpen] = React.useState(false);
  const [targetRejectDoc, setTargetRejectDoc] = React.useState<any>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const [replaceDocModalOpen, setReplaceDocModalOpen] = React.useState(false);
  const [targetReplaceDoc, setTargetReplaceDoc] = React.useState<any>(null);
  const [newDocUrl, setNewDocUrl] = React.useState("");
  const [newDocName, setNewDocName] = React.useState("");

  const [addExtraDocModalOpen, setAddExtraDocModalOpen] = React.useState(false);
  const [extraDocType, setExtraDocType] = React.useState("PASSPORT");
  const [extraDocUrl, setExtraDocUrl] = React.useState("");
  const [extraDocName, setExtraDocName] = React.useState("");

  // Document Review Decision (Pass / Fail with comment)
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [reviewDecision, setReviewDecision] = React.useState<"PASS" | "FAIL">("PASS");
  const [reviewComment, setReviewComment] = React.useState("");

  const handleOpenDocModal = (doc: any) => {
    setSelectedDoc(doc);
    setDocModalOpen(true);
  };

  const handleToggleDocVerification = (docId: string, verifiedStatus: boolean) => {
    if (!selectedApp) return;
    toggleDocVerification(selectedApp.id, docId, verifiedStatus);
  };

  // 1. Request Re-upload (Reject document with remark)
  const handleOpenRejectDocModal = (doc: any) => {
    setTargetRejectDoc(doc);
    setRejectReason("รูปภาพไม่ชัดเจน กรุณาถ่ายฉบับจริงแล้วอัปโหลดใหม่");
    setRejectDocModalOpen(true);
  };

  const handleConfirmRejectDoc = () => {
    if (!selectedApp || !targetRejectDoc || !rejectReason.trim()) return;
    rejectDocument(selectedApp.id, targetRejectDoc.id, rejectReason);
    setRejectDocModalOpen(false);
    alert(`แจ้งปฏิเสธเอกสาร "${targetRejectDoc.originalName}" เรียบร้อยแล้ว ระบบได้ปรับสถานะใบสมัครเป็น "รอส่งเอกสาร"`);
  };

  // 2. Admin Replace Document File
  const handleOpenReplaceDocModal = (doc: any) => {
    setTargetReplaceDoc(doc);
    setNewDocUrl(doc.secureUrl || "");
    setNewDocName(doc.originalName || "");
    setReplaceDocModalOpen(true);
  };

  const handleConfirmReplaceDoc = () => {
    if (!selectedApp || !targetReplaceDoc || !newDocUrl.trim()) return;
    replaceDocument(selectedApp.id, targetReplaceDoc.id, newDocUrl, newDocName);
    setReplaceDocModalOpen(false);
    alert(`อัปเดตเปลี่ยนรูปเอกสารเรียบร้อยแล้ว`);
  };

  // 3. Delete Document
  const handleDeleteDoc = (docId: string, docName: string) => {
    if (!selectedApp) return;
    if (!confirm(`คุณต้องการลบเอกสาร "${docName}" ใช่หรือไม่?`)) return;
    updateApplication(selectedApp.id, {
      documents: selectedApp.documents.filter((d) => d.id !== docId),
    });
  };

  // 4. Add Extra Document
  const handleConfirmAddExtraDoc = () => {
    if (!selectedApp || !extraDocUrl.trim()) return;
    addExtraDocument(selectedApp.id, extraDocType, extraDocUrl, extraDocName);
    setAddExtraDocModalOpen(false);
    setExtraDocUrl("");
    setExtraDocName("");
  };

  const [interviewDate, setInterviewDate] = React.useState("2026-07-30T10:00");
  const [interviewerName, setInterviewerName] = React.useState("Capt. Thanawat (Chief Flight Instructor)");
  const [interviewLocation, setInterviewLocation] = React.useState("TIF Headquarters Room 302");

  const handleSelectApp = (app: ApplicationWithDetails) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  const [writtenExamModalOpen, setWrittenExamModalOpen] = React.useState(false);

  const handlePassWrittenExam = () => {
    if (!selectedApp) return;
    const congratRemark = "🎉 ขอแสดงความยินดีด้วย! ท่านผ่านการสอบข้อเขียน (Written Exam) คัดเลือกนักบินเรียบร้อยแล้ว และได้รับสิทธิ์เข้าสู่ขั้นตอนสอบสัมภาษณ์ต่อไป";
    updateApplication(selectedApp.id, {
      status: "WRITTEN_EXAM_PASSED",
      remarks: congratRemark,
      adminNotes: [
        {
          id: `note_${Date.now()}`,
          content: congratRemark,
          createdAt: new Date(),
          author: { name: "Exam Committee", email: "exam@tif.ac.th" },
        },
        ...(selectedApp.adminNotes || []),
      ],
    });
    setWrittenExamModalOpen(false);
    alert("บันทึกผลการสอบ: ผ่านการสอบข้อเขียน เรียบร้อยแล้ว!");
  };

  const handleFailWrittenExam = () => {
    if (!selectedApp) return;
    const thankYouRemark = "สถาบันไทย อินเตอร์ ไฟลอิ้ง ขอขอบพระคุณอย่างยิ่งที่ท่านให้ความสนใจและตั้งใจเข้าร่วมการสอบคัดเลือกนักบินในครั้งนี้ แม้ว่าผลการสอบในครั้งนี้จะยังไม่ผ่านเกณฑ์การคัดเลือก แต่สถาบันขอขอบคุณและเป็นกำลังใจให้ท่านในการเดินทางตามฝันสายการบินต่อไป และหวังเป็นอย่างยิ่งว่าจะได้มีโอกาสต้อนรับท่านอีกครั้งในโอกาสถัดไป";
    updateApplication(selectedApp.id, {
      status: "REJECTED",
      remarks: thankYouRemark,
      adminNotes: [
        {
          id: `note_${Date.now()}`,
          content: "ผลสอบข้อเขียน: ไม่ผ่านเกณฑ์ (บันทึกข้อความขอบคุณและให้กำลังใจ)",
          createdAt: new Date(),
          author: { name: "Exam Committee", email: "exam@tif.ac.th" },
        },
        ...(selectedApp.adminNotes || []),
      ],
    });
    setWrittenExamModalOpen(false);
    alert("บันทึกผลการสอบ: ไม่ผ่านการสอบข้อเขียน (ส่งข้อความขอบคุณเรียบร้อยแล้ว)");
  };

  const [interviewResultModalOpen, setInterviewResultModalOpen] = React.useState(false);

  const handlePassInterview = () => {
    if (!selectedApp) return;
    const congratRemark = "ขอแสดงความยินดีด้วย! ท่านผ่านการสอบสัมภาษณ์ (Panel Interview) คัดเลือกนักบินเรียบร้อยแล้ว และได้รับสิทธิ์เข้าสู่ขั้นตอนการตรวจสุขภาพนักบิน Class 1 ต่อไป";
    updateApplication(selectedApp.id, {
      status: "INTERVIEW_PASSED",
      remarks: congratRemark,
      adminNotes: [
        {
          id: `note_${Date.now()}`,
          content: congratRemark,
          createdAt: new Date(),
          author: { name: "Interview Committee", email: "interview@tif.ac.th" },
        },
        ...(selectedApp.adminNotes || []),
      ],
    });
    setInterviewResultModalOpen(false);
    alert("บันทึกผลการสอบสัมภาษณ์: ผ่านการสัมภาษณ์ เรียบร้อยแล้ว!");
  };

  const handleFailInterview = () => {
    if (!selectedApp) return;
    const thankYouRemark = "สถาบันไทย อินเตอร์ ไฟลอิ้ง ขอขอบพระคุณอย่างยิ่งที่ท่านให้ความสนใจและตั้งใจเข้าร่วมการสอบสัมภาษณ์คัดเลือกนักบินในครั้งนี้ แม้ว่าผลการสัมภาษณ์ในครั้งนี้จะยังไม่ผ่านเกณฑ์การคัดเลือก แต่คณะกรรมการขอขอบคุณและเป็นกำลังใจให้ท่านในการเดินทางตามฝันสายการบินต่อไป และหวังเป็นอย่างยิ่งว่าจะได้มีโอกาสต้อนรับท่านอีกครั้งในโอกาสถัดไป";
    updateApplication(selectedApp.id, {
      status: "REJECTED",
      remarks: thankYouRemark,
      adminNotes: [
        {
          id: `note_${Date.now()}`,
          content: "ผลสอบสัมภาษณ์: ไม่ผ่านเกณฑ์ (บันทึกข้อความขอบคุณและให้กำลังใจ)",
          createdAt: new Date(),
          author: { name: "Interview Committee", email: "interview@tif.ac.th" },
        },
        ...(selectedApp.adminNotes || []),
      ],
    });
    setInterviewResultModalOpen(false);
    alert("บันทึกผลการสอบสัมภาษณ์: ไม่ผ่านการสัมภาษณ์ (ส่งข้อความขอบคุณเรียบร้อยแล้ว)");
  };

  const handleUpdateStatus = (newStatus: any) => {
    if (!selectedApp) return;
    if (newStatus === "WRITTEN_EXAM_PASSED") {
      setWrittenExamModalOpen(true);
      return;
    }
    if (newStatus === "INTERVIEW_PASSED") {
      setInterviewResultModalOpen(true);
      return;
    }
    updateApplication(selectedApp.id, { status: newStatus });
  };

  const handleAddNote = () => {
    if (!selectedApp || !newNoteContent.trim()) return;

    const newNote = {
      id: `note_${Date.now()}`,
      content: newNoteContent,
      createdAt: new Date(),
      author: {
        name: "Admin User",
        email: "admin@tif.ac.th",
      },
    };

    updateApplication(selectedApp.id, {
      adminNotes: [newNote, ...(selectedApp.adminNotes || [])],
    });
    setNewNoteContent("");
    setNoteModalOpen(false);
  };

  const handleScheduleInterview = () => {
    if (!selectedApp) return;

    const newInterview = {
      id: `int_${Date.now()}`,
      scheduledAt: new Date(interviewDate),
      location: interviewLocation,
      interviewer: interviewerName,
    };

    updateApplication(selectedApp.id, {
      status: "INTERVIEW_SCHEDULED" as any,
      interviews: [...selectedApp.interviews, newInterview],
    });
    setInterviewModalOpen(false);
  };

  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingApp, setEditingApp] = React.useState<ApplicationWithDetails | null>(null);

  // Form states for Edit/Add
  const [editTab, setEditTab] = React.useState<
    "personal" | "address" | "course" | "education" | "family" | "medical"
  >("personal");

  // Personal Info
  const [formFirstNameTh, setFormFirstNameTh] = React.useState("");
  const [formLastNameTh, setFormLastNameTh] = React.useState("");
  const [formFirstNameEn, setFormFirstNameEn] = React.useState("");
  const [formLastNameEn, setFormLastNameEn] = React.useState("");
  const [formNickname, setFormNickname] = React.useState("");
  const [formGender, setFormGender] = React.useState("");
  const [formBirthday, setFormBirthday] = React.useState("");
  const [formNationalId, setFormNationalId] = React.useState("");
  const [formPassport, setFormPassport] = React.useState("");

  // Contact & Address
  const [formPhone, setFormPhone] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formLineId, setFormLineId] = React.useState("");
  const [formFacebook, setFormFacebook] = React.useState("");
  const [formCurrentAddress, setFormCurrentAddress] = React.useState("");
  const [formProvince, setFormProvince] = React.useState("");
  const [formDistrict, setFormDistrict] = React.useState("");
  const [formSubdistrict, setFormSubdistrict] = React.useState("");
  const [formPostalCode, setFormPostalCode] = React.useState("");

  // Course & Status
  const [formCourseName, setFormCourseName] = React.useState("Commercial Pilot License (CPL)");
  const [formBranch, setFormBranch] = React.useState("Bangkok Headquarters");
  const [formStatus, setFormStatus] = React.useState("SUBMITTED");

  // Education
  const [formSchool, setFormSchool] = React.useState("");
  const [formUniversity, setFormUniversity] = React.useState("");
  const [formDegree, setFormDegree] = React.useState("");
  const [formGpax, setFormGpax] = React.useState<number | string>("");
  const [formGraduationYear, setFormGraduationYear] = React.useState<number | string>("");

  // Parents & Emergency
  const [formFatherName, setFormFatherName] = React.useState("");
  const [formMotherName, setFormMotherName] = React.useState("");
  const [formParentOccupation, setFormParentOccupation] = React.useState("");
  const [formParentPhone, setFormParentPhone] = React.useState("");
  const [formEmergencyName, setFormEmergencyName] = React.useState("");
  const [formEmergencyRelationship, setFormEmergencyRelationship] = React.useState("");
  const [formEmergencyPhone, setFormEmergencyPhone] = React.useState("");
  const [formEmergencyAddress, setFormEmergencyAddress] = React.useState("");

  // Medical & English
  const [formHeight, setFormHeight] = React.useState<number | string>("");
  const [formWeight, setFormWeight] = React.useState<number | string>("");
  const [formBloodType, setFormBloodType] = React.useState("");
  const [formMedicalConditions, setFormMedicalConditions] = React.useState("");
  const [formAllergy, setFormAllergy] = React.useState("");
  const [formToeicScore, setFormToeicScore] = React.useState<number | string>("");
  const [formIeltsScore, setFormIeltsScore] = React.useState<number | string>("");
  const [formIcaoLevel, setFormIcaoLevel] = React.useState<number | string>("");

  const handleOpenAdd = () => {
    setFormFirstNameTh("");
    setFormLastNameTh("");
    setFormFirstNameEn("");
    setFormLastNameEn("");
    setFormNickname("");
    setFormGender("Male");
    setFormBirthday("");
    setFormNationalId("");
    setFormPassport("");
    setFormPhone("");
    setFormEmail("");
    setFormLineId("");
    setFormFacebook("");
    setFormCurrentAddress("");
    setFormProvince("");
    setFormDistrict("");
    setFormSubdistrict("");
    setFormPostalCode("");
    setFormCourseName("Commercial Pilot License (CPL)");
    setFormBranch("Bangkok Headquarters");
    setFormStatus("SUBMITTED");
    setFormSchool("");
    setFormUniversity("");
    setFormDegree("");
    setFormGpax("");
    setFormGraduationYear("");
    setFormFatherName("");
    setFormMotherName("");
    setFormParentOccupation("");
    setFormParentPhone("");
    setFormEmergencyName("");
    setFormEmergencyRelationship("");
    setFormEmergencyPhone("");
    setFormEmergencyAddress("");
    setFormHeight("");
    setFormWeight("");
    setFormBloodType("O");
    setFormMedicalConditions("");
    setFormAllergy("");
    setFormToeicScore("");
    setFormIeltsScore("");
    setFormIcaoLevel("");
    setAddModalOpen(true);
  };

  const handleOpenEdit = (app: ApplicationWithDetails) => {
    setEditingApp(app);
    setEditTab("personal");

    setFormFirstNameTh(app.student.firstNameTh || "");
    setFormLastNameTh(app.student.lastNameTh || "");
    setFormFirstNameEn(app.student.firstNameEn || "");
    setFormLastNameEn(app.student.lastNameEn || "");
    setFormNickname(app.student.nickname || "");
    setFormGender(app.student.gender || "Male");
    setFormBirthday(safeDateToInputString(app.student.birthday));
    setFormNationalId(app.student.nationalId || "");
    setFormPassport(app.student.passport || "");

    setFormPhone(app.student.phone || "");
    setFormEmail(app.student.user?.email || "");
    setFormLineId(app.student.lineId || "");
    setFormFacebook(app.student.facebook || "");
    setFormCurrentAddress(app.student.address?.currentAddress || "");
    setFormProvince(app.student.address?.province || "");
    setFormDistrict(app.student.address?.district || "");
    setFormSubdistrict(app.student.address?.subdistrict || "");
    setFormPostalCode(app.student.address?.postalCode || "");

    setFormCourseName(app.course?.name || "Commercial Pilot License (CPL)");
    setFormBranch(app.branch || "Bangkok Headquarters");
    setFormStatus(app.status || "SUBMITTED");

    setFormSchool(app.student.education?.school || "");
    setFormUniversity(app.student.education?.university || "");
    setFormDegree(app.student.education?.degree || "");
    setFormGpax(app.student.education?.gpax ?? "");
    setFormGraduationYear(app.student.education?.graduationYear ?? "");

    setFormFatherName(app.student.parent?.fatherName || "");
    setFormMotherName(app.student.parent?.motherName || "");
    setFormParentOccupation(app.student.parent?.occupation || "");
    setFormParentPhone(app.student.parent?.phone || "");
    setFormEmergencyName(app.student.emergency?.name || "");
    setFormEmergencyRelationship(app.student.emergency?.relationship || "");
    setFormEmergencyPhone(app.student.emergency?.phone || "");
    setFormEmergencyAddress(app.student.emergency?.address || "");

    setFormHeight(app.student.medical?.height ?? "");
    setFormWeight(app.student.medical?.weight ?? "");
    setFormBloodType(app.student.medical?.bloodType || "O");
    setFormMedicalConditions(app.student.medical?.medicalConditions || "");
    setFormAllergy(app.student.medical?.allergy || "");
    setFormToeicScore(app.student.english?.toeicScore ?? "");
    setFormIeltsScore(app.student.english?.ieltsScore ?? "");
    setFormIcaoLevel(app.student.english?.icaoLevel ?? "");

    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingApp) return;

    const updatedApp: ApplicationWithDetails = {
      ...editingApp,
      status: formStatus as any,
      branch: formBranch,
      course: {
        ...editingApp.course,
        name: formCourseName,
      },
      student: {
        ...editingApp.student,
        firstNameTh: formFirstNameTh,
        lastNameTh: formLastNameTh,
        firstNameEn: formFirstNameEn,
        lastNameEn: formLastNameEn,
        nickname: formNickname,
        gender: formGender,
        birthday: formBirthday ? new Date(formBirthday) : null,
        phone: formPhone,
        nationalId: formNationalId,
        passport: formPassport,
        lineId: formLineId,
        facebook: formFacebook,
        user: {
          ...editingApp.student.user,
          email: formEmail,
        },
        address: {
          currentAddress: formCurrentAddress,
          province: formProvince,
          district: formDistrict,
          subdistrict: formSubdistrict,
          postalCode: formPostalCode,
        },
        education: {
          school: formSchool,
          university: formUniversity,
          degree: formDegree,
          gpax: formGpax !== "" ? Number(formGpax) : 3.5,
          graduationYear: formGraduationYear !== "" ? Number(formGraduationYear) : 2025,
        },
        emergency: {
          name: formEmergencyName,
          relationship: formEmergencyRelationship,
          phone: formEmergencyPhone,
          address: formEmergencyAddress,
        },
        parent: {
          fatherName: formFatherName,
          motherName: formMotherName,
          occupation: formParentOccupation,
          phone: formParentPhone,
        },
        medical: {
          height: formHeight !== "" ? Number(formHeight) : 175,
          weight: formWeight !== "" ? Number(formWeight) : 68,
          bloodType: formBloodType,
          medicalConditions: formMedicalConditions,
          allergy: formAllergy,
        },
        english: {
          toeicScore: formToeicScore !== "" ? Number(formToeicScore) : null,
          ieltsScore: formIeltsScore !== "" ? Number(formIeltsScore) : null,
          icaoLevel: formIcaoLevel !== "" ? Number(formIcaoLevel) : null,
        },
      },
    };

    updateApplication(editingApp.id, updatedApp);
    setEditModalOpen(false);
    alert(t("saveChangesAlert"));
  };

  const handleSaveNew = () => {
    if (!formFirstNameEn || !formPhone || !formEmail) {
      alert("กรุณากรอกชื่อ, เบอร์โทรศัพท์ และอีเมล");
      return;
    }

    const newApp: ApplicationWithDetails = {
      id: `app_${Date.now()}`,
      applicationNumber: `TIF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      branch: "Bangkok Headquarters",
      status: formStatus as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      student: {
        id: `std_${Date.now()}`,
        firstNameTh: formFirstNameTh || "สมชาย",
        lastNameTh: formLastNameTh || "ใจดี",
        firstNameEn: formFirstNameEn,
        lastNameEn: formLastNameEn || "",
        nickname: formNickname || "",
        gender: formGender || "Male",
        birthday: formBirthday ? new Date(formBirthday) : new Date(),
        age: 25,
        nationality: "Thai",
        religion: "Buddhism",
        phone: formPhone,
        nationalId: formNationalId || "-",
        passport: formPassport || "-",
        lineId: formLineId || "-",
        facebook: formFacebook || "-",
        user: {
          email: formEmail,
        },
        address: {
          currentAddress: formCurrentAddress || "Bangkok",
          province: formProvince || "Bangkok",
          district: formDistrict || "Chatuchak",
          subdistrict: formSubdistrict || "Chomphon",
          postalCode: formPostalCode || "10900",
        },
        education: {
          school: formSchool || "Institution",
          university: formUniversity || "University",
          degree: formDegree || "Bachelor Degree",
          gpax: formGpax !== "" ? Number(formGpax) : 3.5,
          graduationYear: formGraduationYear !== "" ? Number(formGraduationYear) : 2025,
        },
        parent: {
          fatherName: formFatherName || "-",
          motherName: formMotherName || "-",
          occupation: formParentOccupation || "-",
          phone: formParentPhone || formPhone,
        },
        emergency: {
          name: formEmergencyName || "-",
          relationship: formEmergencyRelationship || "-",
          phone: formEmergencyPhone || formPhone,
          address: formEmergencyAddress || "-",
        },
        medical: {
          height: formHeight !== "" ? Number(formHeight) : 175,
          weight: formWeight !== "" ? Number(formWeight) : 68,
          bloodType: formBloodType || "O",
          medicalConditions: formMedicalConditions || "-",
          allergy: formAllergy || "-",
        },
        english: {
          toeicScore: formToeicScore !== "" ? Number(formToeicScore) : 750,
          ieltsScore: formIeltsScore !== "" ? Number(formIeltsScore) : 6.5,
          icaoLevel: formIcaoLevel !== "" ? Number(formIcaoLevel) : 4,
        },
      },
      course: {
        id: "cadet-001",
        name: "Cadet Student Program",
        code: "CADET",
        price: 1800,
        duration: "Initial Entry",
      },
      documents: [],
      payments: [],
      interviews: [],
      adminNotes: [],
    };

    addApplication(newApp);
    setAddModalOpen(false);
    alert(t("createSuccessAlert"));
  };

  // 5. Document Review Decision (Pass → ready for payment, Fail → rejected with comment)
  const handleOpenReviewModal = (decision: "PASS" | "FAIL") => {
    if (!selectedApp) return;

    if (decision === "PASS") {
      const newNote = {
        id: `note_${Date.now()}`,
        content: `[ผ่านการตรวจเอกสาร]: เอกสารครบถ้วนและถูกต้อง อนุมัติเข้าสู่ขั้นตอนชำระค่าสมัคร 1,800 บาท (Step 5)`,
        createdAt: new Date(),
        author: {
          name: "Admin User",
          email: "admin@tif.ac.th",
        },
      };

      const updatedAppData = {
        ...selectedApp,
        status: "APPLICATION_FEE_PAID" as any,
        documents: (selectedApp.documents || []).map((d) => ({
          ...d,
          isVerified: true,
          isRejected: false,
        })),
        adminNotes: [newNote, ...(selectedApp.adminNotes || [])],
      };

      updateApplication(selectedApp.id, updatedAppData);
      setSelectedApp(updatedAppData);

      alert("อนุมัติผ่านการตรวจเอกสารเรียบร้อยแล้ว — ระบบได้เปิดหน้าชำระค่าสมัคร 1,800 บาทใน Step 5 ให้ผู้สมัครเรียบร้อยแล้ว");
    } else {
      setReviewDecision("FAIL");
      setReviewComment("เอกสารไม่ครบถ้วน/ไม่ถูกต้อง กรุณาตรวจสอบและส่งใหม่");
      setReviewModalOpen(true);
    }
  };

  const handleConfirmReview = () => {
    if (!selectedApp) return;
    if (reviewDecision === "FAIL" && !reviewComment.trim()) {
      alert("กรุณาระบุเหตุผล/คำแนะนำสำหรับผู้สมัคร");
      return;
    }

    const newNote = {
      id: `note_${Date.now()}`,
      content: `[ไม่ผ่านการตรวจเอกสาร]: ${reviewComment}`,
      createdAt: new Date(),
      author: {
        name: "Admin User",
        email: "admin@tif.ac.th",
      },
    };

    const updatedAppData = {
      ...selectedApp,
      status: "REJECTED" as any,
      adminNotes: [newNote, ...(selectedApp.adminNotes || [])],
    };

    updateApplication(selectedApp.id, updatedAppData);
    setSelectedApp(updatedAppData);

    setReviewModalOpen(false);
    alert("แจ้งปฏิเสธเอกสารเรียบร้อยแล้ว — ระบบได้แสดงคำแนะนำให้ผู้สมัครแก้ไขแล้ว");
  };

  const handleDeleteApp = (id: string) => {
    if (window.confirm("คุณต้องการลบข้อมูลใบสมัครนี้ออกจากระบบใช่หรือไม่? (Action cannot be undone)")) {
      deleteApplication(id);
      if (selectedApp?.id === id) {
        setDrawerOpen(false);
        setSelectedApp(null);
      }
      alert("ลบข้อมูลใบสมัครเรียบร้อยแล้ว");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display">
            {t("adminStudentAppTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            {t("adminStudentAppSub")}
          </p>
        </div>
        <div>
          <Button variant="gold" size="md" onClick={handleOpenAdd} className="shadow-lg shadow-tif-gold/10 font-semibold">
            <Plus className="mr-2 h-4 w-4" /> {t("addCadetBtn")}
          </Button>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        data={applications}
        onSelectApplication={handleSelectApp}
        onEditApplication={handleOpenEdit}
        onDeleteApplication={handleDeleteApp}
      />

      {/* Detailed Student Profile & Comprehensive Tabbed Drawer Inspector */}
      {selectedApp && (
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={`ข้อมูลผู้สมัคร: ${selectedApp.student.firstNameTh} ${selectedApp.student.lastNameTh} (${selectedApp.applicationNumber})`}
          size="xl"
        >
          {(() => {
            const remarksText = selectedApp.remarks || "";
            const explicitChoice = (selectedApp as any).joinOpenHouse;

            const isExplicitYes =
              explicitChoice === true ||
              (explicitChoice === undefined &&
                (remarksText.includes("ลงทะเบียนเข้าร่วมงาน Open House") ||
                  remarksText.includes("มีความประสงค์เข้าร่วม") ||
                  (remarksText.includes("เข้าร่วมงาน Open House") && !remarksText.includes("ไม่ประสงค์"))));

            const isExplicitNo =
              explicitChoice === false ||
              (explicitChoice === undefined &&
                (remarksText.includes("ไม่ประสงค์เข้าร่วม") ||
                  remarksText.includes("ไม่เข้าร่วม") ||
                  (selectedApp.adminNotes || []).some((n) => n.content?.includes("ไม่ประสงค์เข้าร่วม"))));

            const hasOpenHouseYes = isExplicitYes;
            const hasOpenHouseNo = isExplicitNo && !isExplicitYes;

            return (
              <div className="space-y-5 text-slate-200">
                {/* Header Profile Summary & Action Bar */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-tif-gold/20 to-amber-500/10 border border-tif-gold/40 text-tif-gold flex items-center justify-center font-bold text-lg shrink-0 font-mono shadow-md">
                        {selectedApp.student.firstNameEn ? selectedApp.student.firstNameEn.slice(0, 2).toUpperCase() : "ST"}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className="text-lg font-bold text-white font-display tracking-tight">
                            {selectedApp.student.firstNameTh} {selectedApp.student.lastNameTh}
                          </h3>
                          {selectedApp.student.nickname && (
                            <span className="text-xs text-slate-400 font-normal bg-slate-800/80 px-2 py-0.5 rounded-md">({selectedApp.student.nickname})</span>
                          )}
                          <span className="text-xs font-semibold text-tif-gold bg-tif-gold/10 px-2.5 py-0.5 rounded-full border border-tif-gold/30">
                            {selectedApp.course?.name || "CPL"}
                          </span>
                          {hasOpenHouseYes && (
                            <span className="text-xs font-bold text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-700/60 flex items-center gap-1 shadow-sm">
                              <Calendar className="h-3 w-3 text-purple-400" /> เข้าร่วม Open House (12 ก.ย.)
                            </span>
                          )}
                          {hasOpenHouseNo && (
                            <span className="text-xs font-medium text-slate-400 bg-slate-950/90 px-2.5 py-0.5 rounded-full border border-slate-800">
                              ไม่เข้าร่วม Open House
                            </span>
                          )}
                        </div>
                    <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                      <span>{selectedApp.student.firstNameEn} {selectedApp.student.lastNameEn}</span>
                      <span>•</span>
                      <span className="text-slate-300">{selectedApp.student.user?.email || selectedApp.student.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEdit(selectedApp)}
                    className="bg-slate-950 border-slate-800 text-xs text-tif-gold hover:border-tif-gold hover:bg-slate-900"
                  >
                    <Edit3 className="mr-1.5 h-3.5 w-3.5" /> แก้ไขข้อมูล
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setInterviewModalOpen(true)}
                    className="bg-slate-950 border-slate-800 text-xs text-purple-300 hover:border-purple-500 hover:bg-slate-900"
                  >
                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-purple-400" /> นัดสัมภาษณ์
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteApp(selectedApp.id)}
                    className="text-xs"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> ลบใบสมัคร
                  </Button>
                </div>
              </div>

              {/* 17-Step Pilot Admission Workflow Pipeline & Stepper */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-tif-gold animate-pulse" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      ความคืบหน้าขั้นตอนการรับสมัคร (13 ขั้นตอนนักบิน)
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400 font-medium">ขั้นตอนปัจจุบัน:</span>
                    <span className="text-xs font-extrabold text-tif-gold bg-tif-gold/10 px-3 py-1 rounded-full border border-tif-gold/30 font-mono">
                      {currentStepIndex >= 0 ? `${currentStepIndex + 1} / ${PILOT_WORKFLOW_STEPS.length} (${Math.round(((currentStepIndex + 1) / PILOT_WORKFLOW_STEPS.length) * 100)}%)` : selectedApp.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-tif-gold via-amber-400 to-emerald-400 h-full transition-all duration-500 rounded-full shadow-lg shadow-tif-gold/20"
                    style={{ width: `${currentStepIndex >= 0 ? Math.max(((currentStepIndex + 1) / PILOT_WORKFLOW_STEPS.length) * 100, 6) : 0}%` }}
                  />
                </div>

                {/* Quick Step Advance Controls & Dropdown Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-xs text-slate-400 font-semibold shrink-0">เปลี่ยนสถานะ:</span>
                    <select
                      value={selectedApp.status}
                      onChange={(e) => handleUpdateStatus(e.target.value as any)}
                      className="bg-slate-950 text-xs font-bold text-slate-100 border border-slate-700 rounded-xl px-3 py-2 focus:border-tif-gold focus:outline-none cursor-pointer w-full max-w-[320px] truncate"
                    >
                      {PILOT_WORKFLOW_STEPS.map((s) => (
                        <option key={s.key} value={s.key} className="bg-slate-900 text-slate-200">
                          {s.step}. {s.titleTh} ({s.titleEn})
                        </option>
                      ))}
                      <option value="REJECTED" className="bg-slate-900 text-rose-400">❌ ปฏิเสธการสมัคร (Rejected)</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentStepIndex <= 0}
                      onClick={() => {
                        if (currentStepIndex > 0) {
                          handleUpdateStatus(PILOT_WORKFLOW_STEPS[currentStepIndex - 1].key);
                        }
                      }}
                      className="text-xs bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" /> ขั้นก่อนหน้า
                    </Button>

                    <Button
                      size="sm"
                      variant="gold"
                      disabled={currentStepIndex < 0 || currentStepIndex >= PILOT_WORKFLOW_STEPS.length - 1}
                      onClick={() => {
                        if (currentStepIndex >= 0 && currentStepIndex < PILOT_WORKFLOW_STEPS.length - 1) {
                          handleUpdateStatus(PILOT_WORKFLOW_STEPS[currentStepIndex + 1].key);
                        }
                      }}
                      className="text-xs font-bold shadow-md shadow-tif-gold/10"
                    >
                      อนุมัติขั้นถัดไป <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>

                    {selectedApp.documents && selectedApp.documents.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadAllDocs}
                        disabled={isDownloadingZip}
                        className="text-xs font-semibold border-slate-700 text-slate-200 hover:text-tif-gold hover:border-tif-gold bg-slate-950"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5 text-tif-gold" />
                        {isDownloadingZip ? "บีบอัด ZIP..." : "ดาวน์โหลดเอกสาร (ZIP)"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* 17 Steps Pipeline Visual Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2 pt-1 max-h-[220px] overflow-y-auto pr-1">
                  {PILOT_WORKFLOW_STEPS.map((stepDef, idx) => {
                    const isPassed = currentStepIndex >= 0 && idx < currentStepIndex;
                    const isCurrent = currentStepIndex >= 0 && idx === currentStepIndex;

                    return (
                      <button
                        key={stepDef.key}
                        type="button"
                        onClick={() => handleUpdateStatus(stepDef.key)}
                        className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[64px] ${
                          isCurrent
                            ? "bg-tif-gold/20 border-tif-gold text-white font-bold ring-2 ring-tif-gold/30 shadow-lg shadow-tif-gold/20 scale-[1.02]"
                            : isPassed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/20"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isCurrent ? "bg-tif-gold text-slate-950" : isPassed ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-400"
                          }`}>
                            #{stepDef.step}
                          </span>
                          {isPassed ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <Sparkles className="h-3 w-3 text-tif-gold shrink-0 animate-pulse" />
                          ) : null}
                        </div>
                        <p className="text-[10px] font-medium leading-tight line-clamp-2">
                          {stepDef.titleTh}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Written Exam Result Action Box for Admin */}
                {(selectedApp.status === "WRITTEN_EXAM" || selectedApp.status === "WRITTEN_EXAM_PASSED" || (selectedApp.status === "REJECTED" && (selectedApp.remarks?.includes("ข้อเขียน") || (selectedApp.remarks?.includes("สอบ") && !selectedApp.remarks?.includes("สัมภาษณ์"))))) && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-purple-200 text-xs flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-purple-400" /> การประกาศผลสอบข้อเขียน (Step 9: ประกาศผลสอบ)
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {selectedApp.status === "WRITTEN_EXAM_PASSED"
                          ? "สถานะปัจจุบัน: ผ่านการสอบข้อเขียนเรียบร้อยแล้ว (สามารถปรับเปลี่ยนผลได้)"
                          : selectedApp.status === "REJECTED"
                          ? "สถานะปัจจุบัน: ไม่ผ่านการสอบข้อเขียน (สามารถปรับเปลี่ยนผลเป็นผ่านได้)"
                          : "เลือกผลการสอบข้อเขียนคัดเลือกนักบิน:"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={handlePassWrittenExam}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 px-3"
                      >
                        ✓ ผ่านการสอบข้อเขียน
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleFailWrittenExam}
                        className="bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-700 font-bold text-xs py-1.5 px-3"
                      >
                        💙 ไม่ผ่าน (ส่งคำขอบคุณ)
                      </Button>
                    </div>
                  </div>
                )}

                {/* Interview Result Action Box for Admin */}
                {(selectedApp.status === "INTERVIEW_SCHEDULED" || selectedApp.status === "INTERVIEW_PASSED" || (selectedApp.status === "REJECTED" && selectedApp.remarks?.includes("สัมภาษณ์"))) && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-purple-200 text-xs flex items-center gap-1.5">
                        <User className="h-4 w-4 text-purple-400" /> การประกาศผลสอบสัมภาษณ์ (Step 11: ประกาศผลสัมภาษณ์)
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {selectedApp.status === "INTERVIEW_PASSED"
                          ? "สถานะปัจจุบัน: ผ่านการสอบสัมภาษณ์เรียบร้อยแล้ว (สามารถปรับเปลี่ยนผลได้)"
                          : selectedApp.status === "REJECTED"
                          ? "สถานะปัจจุบัน: ไม่ผ่านการสอบสัมภาษณ์ (สามารถปรับเปลี่ยนผลเป็นผ่านได้)"
                          : "เลือกผลการสอบสัมภาษณ์คัดเลือกนักบิน:"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={handlePassInterview}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 px-3"
                      >
                        ✓ ผ่านการสัมภาษณ์
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleFailInterview}
                        className="bg-blue-900/80 hover:bg-blue-800 text-blue-200 border border-blue-700 font-bold text-xs py-1.5 px-3"
                      >
                        💙 ไม่ผ่าน (ส่งคำขอบคุณ)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation Menu */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveDetailTab("personal")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeDetailTab === "personal"
                    ? "bg-tif-gold text-slate-950 font-bold border border-tif-gold shadow-md"
                    : "text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <User className="h-4 w-4" />
                <span>1. ข้อมูลส่วนตัว & ที่อยู่</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab("academic")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeDetailTab === "academic"
                    ? "bg-tif-gold text-slate-950 font-bold border border-tif-gold shadow-md"
                    : "text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>2. การศึกษา & ภาษาอังกฤษ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab("medical")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeDetailTab === "medical"
                    ? "bg-tif-gold text-slate-950 font-bold border border-tif-gold shadow-md"
                    : "text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                <span>3. สุขภาพ & บุคคลติดต่อ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab("documents")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeDetailTab === "documents"
                    ? "bg-tif-gold text-slate-950 font-bold border border-tif-gold shadow-md"
                    : "text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>4. เอกสารแนบ ({selectedApp.documents?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDetailTab("notes")}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  activeDetailTab === "notes"
                    ? "bg-tif-gold text-slate-950 font-bold border border-tif-gold shadow-md"
                    : "text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>5. โน้ตเจ้าหน้าที่ ({selectedApp.adminNotes?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: Personal & Contact Profile */}
            {activeDetailTab === "personal" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Open House RSVP Status Card */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                    <Calendar className="mr-2 h-4 w-4 text-tif-gold" /> การลงทะเบียนงาน Open House (12 กันยายน 2569)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                      hasOpenHouseYes
                        ? "bg-purple-950/40 border-purple-800/80 text-purple-200"
                        : hasOpenHouseNo
                        ? "bg-slate-950/60 border-slate-800 text-slate-400"
                        : "bg-slate-950/60 border-slate-800 text-amber-300"
                    }`}>
                      <div>
                        <span className="text-slate-400 text-[11px] block mb-1">สถานะความประสงค์เข้าร่วมงาน</span>
                        <div className="flex items-center space-x-2">
                          {hasOpenHouseYes ? (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="font-bold text-emerald-300 text-sm">✓ ประสงค์เข้าร่วมงาน Open House</span>
                            </>
                          ) : hasOpenHouseNo ? (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                              <span className="font-bold text-slate-400 text-sm">ไม่ประสงค์เข้าร่วมงาน Open House</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                              <span className="font-semibold text-amber-300 text-sm">ยังไม่ได้ระบุ (รอแนบสลิปชำระเงิน)</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">ปรับความประสงค์ (Admin):</span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              updateApplication(selectedApp.id, {
                                joinOpenHouse: true,
                              });
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                              hasOpenHouseYes
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-slate-800 text-slate-400 hover:bg-purple-900/40 hover:text-purple-300 border border-slate-700"
                            }`}
                          >
                            ✓ เข้าร่วม
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              updateApplication(selectedApp.id, {
                                joinOpenHouse: false,
                              });
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                              hasOpenHouseNo
                                ? "bg-rose-900/80 text-rose-300 border border-rose-700 shadow-sm"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700"
                            }`}
                          >
                            ✕ ไม่เข้าร่วม
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px] block">กำหนดการและสถานที่</span>
                      <p className="font-medium text-slate-200 text-xs">
                        12 ก.ย. 2026 (09:00 - 15:00 น.) ณ Best Western Plus Wanda Grand Hotel ( Ballroom A )
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                    <User className="mr-2 h-4 w-4 text-tif-gold" /> ข้อมูลส่วนบุคคล (Personal Details)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] block">ชื่อ-นามสกุล (ภาษาไทย)</span>
                      <span className="font-semibold text-white text-sm">
                        {selectedApp.student.firstNameTh} {selectedApp.student.lastNameTh}
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] block">Full Name (English)</span>
                      <span className="font-semibold text-white font-mono text-sm">
                        {selectedApp.student.firstNameEn} {selectedApp.student.lastNameEn}
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] block">เลขบัตรประชาชน (National ID)</span>
                      <span className="font-semibold text-tif-gold font-mono text-sm">{selectedApp.student.nationalId || "-"}</span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] block">เลขหนังสือเดินทาง (Passport No.)</span>
                      <span className="font-semibold text-white font-mono">{selectedApp.student.passport || "-"}</span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] block">วันเกิด / อายุ</span>
                      <span className="font-medium text-slate-200">
                        {selectedApp.student.birthday ? formatDate(selectedApp.student.birthday) : "-"} ({selectedApp.student.age || 25} ปี)
                      </span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] block">เพศ / สัญชาติ / ศาสนา</span>
                      <span className="font-medium text-slate-200">
                        {selectedApp.student.gender || "Male"} / {selectedApp.student.nationality || "Thai"} / {selectedApp.student.religion || "Buddhism"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                    <Phone className="mr-2 h-4 w-4 text-tif-gold" /> ช่องทางการติดต่อ (Contact Channels)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] block">เบอร์โทรศัพท์</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">{selectedApp.student.phone}</span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] block">อีเมล (Email)</span>
                      <span className="font-semibold text-white font-mono truncate block">{selectedApp.student.user?.email}</span>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 text-[11px] block">Line ID / Facebook</span>
                      <span className="font-medium text-slate-300 font-mono">
                        {selectedApp.student.lineId || "-"} / {selectedApp.student.facebook || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                    <MapPin className="mr-2 h-4 w-4 text-tif-gold" /> ที่อยู่ปัจจุบัน (Residential Address)
                  </h4>
                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    <p className="font-semibold text-white">
                      {selectedApp.student.address?.currentAddress || "123 Sukhumvit Road"}
                    </p>
                    <p className="text-slate-400 mt-1 font-mono">
                      แขวง/ตำบล: <span className="text-slate-200">{selectedApp.student.address?.subdistrict || "Klongtoey Nua"}</span> | 
                      เขต/อำเภอ: <span className="text-slate-200">{selectedApp.student.address?.district || "Vadhana"}</span> | 
                      จังหวัด: <span className="text-slate-200">{selectedApp.student.address?.province || "Bangkok"}</span> | 
                      รหัสไปรษณีย์: <span className="text-tif-gold font-bold">{selectedApp.student.address?.postalCode || "10110"}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Academic & English */}
            {activeDetailTab === "academic" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                      <GraduationCap className="mr-2 h-4 w-4 text-tif-gold" /> ประวัติการศึกษา (Education)
                    </h4>
                    <div className="text-xs space-y-2 text-slate-300">
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">โรงเรียนเดิม / สถาบัน</span>
                        <span className="text-white font-semibold">{selectedApp.student.education?.school || "Triam Udom Suksa School"}</span>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">มหาวิทยาลัย / วุฒิการศึกษา</span>
                        <span className="text-white font-semibold">{selectedApp.student.education?.university || "Chulalongkorn University"}</span>
                        <span className="text-slate-400 block text-[11px] mt-0.5">{selectedApp.student.education?.degree || "Bachelor Degree"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 text-[11px] block">เกรดเฉลี่ย (GPAX)</span>
                          <span className="text-emerald-400 font-bold font-mono text-sm">{selectedApp.student.education?.gpax || "3.65"}</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 text-[11px] block">ปีที่จบ</span>
                          <span className="text-white font-semibold font-mono text-sm">{selectedApp.student.education?.graduationYear || 2024}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                      <Award className="mr-2 h-4 w-4 text-tif-gold" /> ผลสอบภาษาอังกฤษ (English Proficiency)
                    </h4>
                    <div className="text-xs space-y-2 text-slate-300">
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400 font-medium">คะแนน TOEIC</span>
                        <span className="text-tif-gold font-bold font-mono text-base">{selectedApp.student.english?.toeicScore || "820"} คะแนน</span>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400 font-medium">คะแนน IELTS</span>
                        <span className="text-white font-bold font-mono text-base">{selectedApp.student.english?.ieltsScore || "7.0"}</span>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400 font-medium">ระดับ ICAO Standard</span>
                        <span className="text-emerald-400 font-bold font-mono text-base">Level {selectedApp.student.english?.icaoLevel || "4"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Medical & Emergency Contact */}
            {activeDetailTab === "medical" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                      <Stethoscope className="mr-2 h-4 w-4 text-tif-gold" /> ข้อมูลสุขภาพและเวชศาสตร์การบิน
                    </h4>
                    <div className="text-xs space-y-2 text-slate-300">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 text-[11px] block">ส่วนสูง / น้ำหนัก</span>
                          <span className="text-white font-semibold font-mono">{selectedApp.student.medical?.height || 178} cm / {selectedApp.student.medical?.weight || 70} kg</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 text-[11px] block">กรุ๊ปเลือด</span>
                          <span className="text-rose-400 font-bold font-mono text-base">Type {selectedApp.student.medical?.bloodType || "O"}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">โรคประจำตัว / ประวัติแพ้ยา</span>
                        <span className="text-slate-200 font-medium">
                          โรคประจำตัว: {selectedApp.student.medical?.medicalConditions || "ไม่มี"} | แพ้ยา: {selectedApp.student.medical?.allergy || "ไม่มี"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center border-b border-slate-800 pb-2">
                      <PhoneCall className="mr-2 h-4 w-4 text-tif-gold" /> บุคคลติดต่อฉุกเฉิน & ผู้ปกครอง
                    </h4>
                    <div className="text-xs space-y-2 text-slate-300">
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">ผู้ติดต่อฉุกเฉิน</span>
                        <span className="text-white font-semibold">{selectedApp.student.emergency?.name || "Somsak Jaidee"} ({selectedApp.student.emergency?.relationship || "Father"})</span>
                        <span className="text-emerald-400 font-mono font-bold block mt-0.5">{selectedApp.student.emergency?.phone || "0812223333"}</span>
                      </div>
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        <span className="text-slate-400 text-[11px] block">ผู้ปกครอง (บิดา/มารดา)</span>
                        <span className="text-white font-medium block">บิดา: {selectedApp.student.parent?.fatherName || "Mr. Somsak Jaidee"}</span>
                        <span className="text-white font-medium block">มารดา: {selectedApp.student.parent?.motherName || "Mrs. Somjai Jaidee"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Submitted Documents */}
            {activeDetailTab === "documents" && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center font-display">
                      <FileText className="mr-2 h-4 w-4 text-tif-gold" /> เอกสารแนบ 9 ขั้นตอน / Submitted Documents
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ตรวจสอบความถูกต้อง อนุมัติ แจ้งขอเอกสารใหม่ หรืออัปโหลดไฟล์ใหม่แทนผู้สมัคร
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedApp.documents && selectedApp.documents.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadAllDocs}
                        disabled={isDownloadingZip}
                        className="text-xs font-semibold border-slate-700 text-slate-200 hover:text-tif-gold hover:border-tif-gold"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5 text-tif-gold" />
                        {isDownloadingZip ? "กำลังบีบอัด ZIP..." : "ดาวน์โหลดเอกสารทั้งหมด (ZIP)"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => setAddExtraDocModalOpen(true)}
                      className="text-xs font-semibold"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> เพิ่มเอกสารแนบเพิ่มเติม
                    </Button>
                    <Badge variant={selectedApp.status === "DOCUMENT_VERIFIED" ? "success" : "gold"}>
                      {selectedApp.status === "DOCUMENT_VERIFIED" ? "เอกสารครบถ้วน" : "รอตรวจสอบ"}
                    </Badge>
                  </div>
                </div>

                {/* Document Review Decision Bar — Pass / Fail with comment */}
                {(selectedApp.status === "SUBMITTED" || selectedApp.status === "DOCS_UNDER_REVIEW" || selectedApp.status === "WAITING_DOCUMENTS" || selectedApp.status === "DOCS_PASSED") && (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <ShieldCheck className="h-4 w-4 text-tif-gold" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        สรุปผลการตรวจเอกสารเบื้องต้น (Document Review Decision)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      หลังตรวจสอบเอกสารทั้งหมดแล้ว ให้กดปุ่มเพื่ออัปเดตสถานะให้ผู้สมัครทราบ:
                      <br />
                      <strong className="text-emerald-400">ผ่านการตรวจสอบ</strong> = เปิดหน้าชำระค่าสมัคร 1,800 บาทใน Step 5 ให้ผู้สมัคร |
                      <strong className="text-rose-400"> ไม่ผ่าน</strong> = แสดงคำแนะนำ/เหตุผลให้ผู้สมัครแก้ไข
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={() => handleOpenReviewModal("PASS")}
                        className="flex-1 font-bold bg-emerald-600 hover:bg-emerald-700 border-emerald-500"
                      >
                        <CheckCircle2 className="mr-1.5 h-4 w-4" /> ผ่านการตรวจสอบ → เปิดหน้าชำระเงิน (Step 5)
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleOpenReviewModal("FAIL")}
                        className="flex-1 font-bold"
                      >
                        <XCircle className="mr-1.5 h-4 w-4" /> ไม่ผ่าน → แจ้งเหตุผล/คำแนะนำ
                      </Button>
                    </div>
                  </div>
                )}

                {/* Already reviewed status indicator */}
                {(selectedApp.status === "APPLICATION_FEE_PAID" || selectedApp.status === "DOCUMENT_VERIFIED" || selectedApp.status === "REJECTED") && (
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    selectedApp.status === "APPLICATION_FEE_PAID" || selectedApp.status === "DOCUMENT_VERIFIED"
                      ? "bg-emerald-950/30 border-emerald-800"
                      : "bg-rose-950/30 border-rose-800"
                  }`}>
                    <div className={`flex items-center gap-2 font-bold text-xs ${
                      selectedApp.status === "APPLICATION_FEE_PAID" || selectedApp.status === "DOCUMENT_VERIFIED" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {selectedApp.status === "APPLICATION_FEE_PAID" || selectedApp.status === "DOCUMENT_VERIFIED" ? (
                        <><CheckCircle2 className="h-4 w-4" /> ผ่านการตรวจเอกสารเรียบร้อยแล้ว — เปิดหน้าชำระค่าสมัคร 1,800 บาทใน Step 5 แล้ว</>
                      ) : (
                        <><XCircle className="h-4 w-4" /> ไม่ผ่านการตรวจเอกสาร — ได้แจ้งเหตุผลให้ผู้สมัครแล้ว</>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      หากต้องการเปลี่ยนผล สามารถกดปุ่มด้านล่างเพื่อตรวจสอบใหม่
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReviewModal("PASS")}
                      className="text-xs font-semibold border-slate-700 text-slate-300 hover:border-tif-gold"
                    >
                      ตรวจสอบใหม่ (Re-review Step 5)
                    </Button>
                  </div>
                )}

                {selectedApp.documents && selectedApp.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedApp.documents.map((doc) => {
                      const docTypeLabels: Record<string, string> = {
                        // Candidate Application Form keys
                        APPLICATION_FEE_SLIP: "สลิปชำระเงินค่าสมัคร 1,800 บาท",
                        PHOTO_1_INCH: "รูปถ่าย 1 นิ้ว (Passport Photo 1\")",
                        PHOTO_2_INCH: "รูปถ่าย 2 นิ้ว (Passport Photo 2\")",
                        NATIONAL_ID_CERTIFIED: "สำเนาบัตรประชาชน (รับรองสำเนาถูกต้อง)",
                        TRANSCRIPT_CERTIFIED: "สำเนาวุฒิการศึกษา (รับรองสำเนาถูกต้อง)",
                        HOUSE_REGISTRATION_CERTIFIED: "สำเนาทะเบียนบ้าน (รับรองสำเนาถูกต้อง)",
                        MEDICAL_CERTIFICATE_CLASS_1: "ใบสำคัญแพทย์ Class 1 (Medical Cert)",
                        CRIMINAL_RECORD_CHECK: "ผลตรวจสอบประวัติอาชญากรรม (ถ้ามี)",
                        MILITARY_SERVICE_EXEMPTION: "ใบสำคัญแสดงการขอยกเว้นการรับราชการทหาร (สด.8 หรือ สด.43)",

                        // General / Admin keys
                        PASSPORT_PHOTO: "รูปถ่าย 1.5 นิ้ว",
                        NATIONAL_ID: "สำเนาบัตรประชาชน",
                        TRANSCRIPT: "สำเนาวุฒิการศึกษา",
                        TOEIC: "ผลสอบภาษาอังกฤษ (TOEIC / IELTS)",
                        TOEIC_SCORE: "ผลสอบภาษาอังกฤษ (TOEIC / IELTS)",
                        MEDICAL_CERT: "ใบรับรองแพทย์เวชศาสตร์การบิน",
                        HOUSE_REGISTRATION: "สำเนาทะเบียนบ้าน",
                        PASSPORT: "หนังสือเดินทาง (Passport)",
                        OTHER: "ผลตรวจประวัติอาชญากรรม",
                      };
                      const label = docTypeLabels[doc.type] || doc.type;

                      return (
                        (() => {
                          const isDocPassedOverall =
                            (selectedApp.status as string) !== "SUBMITTED" &&
                            (selectedApp.status as string) !== "DOCS_UNDER_REVIEW" &&
                            (selectedApp.status as string) !== "REJECTED";
                          const isDocVerified = doc.isVerified || (isDocPassedOverall && !doc.isRejected);

                          return (
                            <div
                              key={doc.id}
                              className={`group relative overflow-hidden rounded-xl border p-3.5 transition-all flex flex-col justify-between space-y-3 ${
                                doc.isRejected
                                  ? "bg-rose-950/20 border-rose-800/80 hover:border-rose-600"
                                  : isDocVerified
                                  ? "bg-slate-950/80 border-emerald-900/60 hover:border-emerald-500/50"
                                  : "bg-slate-950/80 border-slate-800 hover:border-tif-gold/50"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-900 text-tif-gold border border-slate-800">
                                    {label}
                                  </span>
                                  {doc.isRejected ? (
                                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded flex items-center border border-rose-500/30">
                                      <XCircle className="mr-1 h-3 w-3" /> ให้ส่งใหม่
                                    </span>
                                  ) : isDocVerified ? (
                                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center border border-emerald-500/20">
                                      <CheckCircle2 className="mr-1 h-3 w-3" /> Verified
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded flex items-center border border-amber-500/20">
                                      <Clock className="mr-1 h-3 w-3" /> Pending
                                    </span>
                                  )}
                                </div>

                                <div
                                  onClick={() => handleOpenDocModal(doc)}
                                  className="relative h-36 w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group-hover:opacity-95 transition-all flex items-center justify-center"
                                >
                                  {isPdfFile(doc.secureUrl, doc.originalName) ? (
                                    doc.secureUrl?.includes("cloudinary.com") ? (
                                      <div className="relative w-full h-full">
                                        <img
                                          src={getCloudinaryPdfThumbnail(doc.secureUrl) || doc.secureUrl}
                                          alt={doc.originalName}
                                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-rose-950/90 border border-rose-500/40 text-[9px] font-bold text-rose-300 flex items-center shadow">
                                          <FileText className="mr-1 h-3 w-3 text-rose-400" /> PDF
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center p-3 text-center space-y-2 bg-slate-950/90 w-full h-full">
                                        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                          <FileText className="h-8 w-8" />
                                        </div>
                                        <span className="text-[11px] font-bold text-rose-300 font-mono tracking-tight">
                                          PDF Document
                                        </span>
                                      </div>
                                    )
                                  ) : (
                                    <img
                                      src={doc.secureUrl}
                                      alt={doc.originalName}
                                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-slate-900/90 text-tif-gold text-xs font-semibold px-3 py-1.5 rounded-lg border border-tif-gold/40 flex items-center shadow-lg">
                                      <Eye className="mr-1.5 h-3.5 w-3.5" /> {isPdfFile(doc.secureUrl, doc.originalName) ? "เปิดดูไฟล์ PDF" : "คลิกดูรูปใหญ่"}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-[11px] text-slate-400 truncate font-mono">{doc.originalName}</p>

                                {/* Rejection Warning Remark */}
                                {doc.isRejected && doc.rejectReason && (
                                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-300 leading-tight">
                                    <strong>ระบุสาเหตุ:</strong> {doc.rejectReason}
                                  </div>
                                )}
                              </div>

                              {/* Document Action Controls */}
                              <div className="pt-2.5 border-t border-slate-800/80 flex flex-col space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDocModal(doc)}
                                    className="text-[11px] text-tif-gold font-semibold hover:underline flex items-center"
                                  >
                                    <ZoomIn className="mr-1 h-3.5 w-3.5" /> {isPdfFile(doc.secureUrl, doc.originalName) ? "เปิดดู PDF" : "ขยายดูรูป"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleDocVerification(doc.id, !isDocVerified)}
                                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition ${
                                      isDocVerified
                                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-slate-800 hover:text-slate-300"
                                        : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
                                    }`}
                                  >
                                    {isDocVerified ? "✓ อนุมัติแล้ว" : "อนุมัติรูปนี้"}
                                  </button>
                                </div>

                            <div className="flex items-center justify-between gap-1 pt-1">
                              <button
                                type="button"
                                onClick={() => handleOpenReplaceDocModal(doc)}
                                className="text-[10px] px-2 py-1 rounded-lg font-medium bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 flex items-center"
                              >
                                <Edit3 className="mr-1 h-3 w-3" /> เปลี่ยนรูปแทน
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRejectDocModal(doc)}
                                className="text-[10px] px-2 py-1 rounded-lg font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center"
                              >
                                <XCircle className="mr-1 h-3 w-3" /> แจ้งให้ส่งใหม่
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteDoc(doc.id, doc.originalName)}
                                className="text-[10px] px-2 py-1 rounded-lg font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  );
                })}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
                    <ImageIcon className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">ยังไม่มีเอกสารแนบในระบบ</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Internal CRM Admin Notes */}
            {activeDetailTab === "notes" && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center">
                    <MessageSquare className="mr-1.5 h-4 w-4 text-tif-gold" /> ประวัติบันทึกของเจ้าหน้าที่ (Internal Notes)
                  </h4>
                  <Button size="sm" variant="gold" onClick={() => setNoteModalOpen(true)} className="text-xs font-semibold">
                    <Plus className="mr-1 h-3.5 w-3.5" /> เพิ่มบันทึกใหม่
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedApp.adminNotes && selectedApp.adminNotes.length > 0 ? (
                    selectedApp.adminNotes.map((note) => (
                      <div key={note.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-2">
                        <p className="text-slate-200 leading-relaxed font-medium">{note.content}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/60">
                          <span>เจ้าหน้าที่: {note.author.name || note.author.email}</span>
                          <span>{formatDate(note.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 italic rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
                      ยังไม่มีประวัติบันทึกสำหรับผู้สมัครรายนี้
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          );
        })()}
        </Drawer>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        title={t("scheduleInterviewTitle")}
        description={t("scheduleInterviewSub")}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">{t("scheduledDateTime")}</label>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">{t("chiefInterviewer")}</label>
            <input
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">{t("interviewLocation")}</label>
            <input
              value={interviewLocation}
              onChange={(e) => setInterviewLocation(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white"
            />
          </div>
          <Button variant="gold" className="w-full mt-4" onClick={handleScheduleInterview}>
            {t("confirmScheduleBtn")}
          </Button>
        </div>
      </Modal>

      {/* Add Admin Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title={t("addNoteModalTitle")}
      >
        <div className="space-y-4">
          <textarea
            rows={4}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder={t("noteContentPlaceholder")}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white"
          />
          <Button variant="gold" className="w-full" onClick={handleAddNote}>
            {t("saveNoteBtn")}
          </Button>
        </div>
      </Modal>

      {/* Edit Application Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={t("editModalTitle")}
        description={t("editModalSub")}
      >
        <div className="space-y-4 text-xs">
          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 p-1.5 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => setEditTab("personal")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                editTab === "personal"
                  ? "bg-slate-800 text-tif-gold border border-slate-700 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("editTabPersonal")}
            </button>
            <button
              type="button"
              onClick={() => setEditTab("address")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                editTab === "address"
                  ? "bg-slate-800 text-tif-gold border border-slate-700 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("editTabAddress")}
            </button>
            <button
              type="button"
              onClick={() => setEditTab("course")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                editTab === "course"
                  ? "bg-slate-800 text-tif-gold border border-slate-700 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("editTabCourse")}
            </button>
            <button
              type="button"
              onClick={() => setEditTab("education")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                editTab === "education"
                  ? "bg-slate-800 text-tif-gold border border-slate-700 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("editTabEducation")}
            </button>
            <button
              type="button"
              onClick={() => setEditTab("family")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                editTab === "family"
                  ? "bg-slate-800 text-tif-gold border border-slate-700 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("editTabFamily")}
            </button>
            <button
              type="button"
              onClick={() => setEditTab("medical")}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                editTab === "medical"
                  ? "bg-slate-800 text-tif-gold border border-slate-700 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("editTabMedical")}
            </button>
          </div>

          {/* TAB 1: PERSONAL INFO */}
          {editTab === "personal" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">ชื่อ (ภาษาไทย) *</label>
                  <input
                    value={formFirstNameTh}
                    onChange={(e) => setFormFirstNameTh(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">นามสกุล (ภาษาไทย) *</label>
                  <input
                    value={formLastNameTh}
                    onChange={(e) => setFormLastNameTh(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">First Name (English) *</label>
                  <input
                    value={formFirstNameEn}
                    onChange={(e) => setFormFirstNameEn(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Last Name (English) *</label>
                  <input
                    value={formLastNameEn}
                    onChange={(e) => setFormLastNameEn(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">ชื่อเล่น (Nickname)</label>
                  <input
                    value={formNickname}
                    onChange={(e) => setFormNickname(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">เพศ (Gender)</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-medium"
                  >
                    <option value="Male">ชาย (Male)</option>
                    <option value="Female">หญิง (Female)</option>
                    <option value="Other">อื่นๆ (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-300">วันเกิด (Birthday)</label>
                  <input
                    type="date"
                    value={formBirthday}
                    onChange={(e) => setFormBirthday(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">เลขบัตรประชาชน (National ID)</label>
                  <input
                    value={formNationalId}
                    onChange={(e) => setFormNationalId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">เลขหนังสือเดินทาง (Passport No.)</label>
                  <input
                    value={formPassport}
                    onChange={(e) => setFormPassport(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADDRESS & CONTACT */}
          {editTab === "address" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">เบอร์โทรศัพท์มือถือ *</label>
                  <input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">อีเมล (Email) *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Line ID</label>
                  <input
                    value={formLineId}
                    onChange={(e) => setFormLineId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">Facebook Profile</label>
                  <input
                    value={formFacebook}
                    onChange={(e) => setFormFacebook(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300">ที่อยู่ปัจจุบัน (Current Address)</label>
                <input
                  value={formCurrentAddress}
                  onChange={(e) => setFormCurrentAddress(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">แขวง / ตำบล</label>
                  <input
                    value={formSubdistrict}
                    onChange={(e) => setFormSubdistrict(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">เขต / อำเภอ</label>
                  <input
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">จังหวัด</label>
                  <input
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300">รหัสไปรษณีย์ (Postal Code)</label>
                <input
                  value={formPostalCode}
                  onChange={(e) => setFormPostalCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 3: COURSE & STATUS */}
          {editTab === "course" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="font-semibold text-slate-300">หลักสูตรการบินที่เลือก (Flight Course)</label>
                <select
                  value={formCourseName}
                  onChange={(e) => setFormCourseName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-medium"
                >
                  <option value="Commercial Pilot License (CPL)">Commercial Pilot License (CPL)</option>
                  <option value="Private Pilot License (PPL)">Private Pilot License (PPL)</option>
                  <option value="Airline Transport Pilot (ATPL)">Airline Transport Pilot (ATPL)</option>
                  <option value="Flight Instructor (FI)">Flight Instructor (FI)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300">ศูนย์ฝึกบินที่เลือก (Training Base)</label>
                <select
                  value={formBranch}
                  onChange={(e) => setFormBranch(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-medium"
                >
                  <option value="Bangkok Headquarters">Bangkok Headquarters (สำนักงานใหญ่)</option>
                  <option value="Hua Hin Flying Base">Hua Hin Flying Base (ศูนย์ฝึกบินหัวหิน)</option>
                  <option value="Chiang Mai Airfield">Chiang Mai Airfield (ศูนย์ฝึกบินเชียงใหม่)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300">สถานะใบสมัคร (Application Status - 13 ขั้นตอน)</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-medium"
                >
                  {PILOT_WORKFLOW_STEPS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.step}. {s.titleTh} ({s.titleEn})
                    </option>
                  ))}
                  <option value="REJECTED" className="text-rose-400">❌ ปฏิเสธการสมัคร (Rejected)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATION */}
          {editTab === "education" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="font-semibold text-slate-300">โรงเรียน / สถาบันการศึกษาระดับมัธยม</label>
                <input
                  value={formSchool}
                  onChange={(e) => setFormSchool(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">มหาวิทยาลัย (University)</label>
                <input
                  value={formUniversity}
                  onChange={(e) => setFormUniversity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">วุฒิการศึกษา (Degree / Major)</label>
                <input
                  value={formDegree}
                  onChange={(e) => setFormDegree(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">เกรดเฉลี่ยสะสม (GPAX)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formGpax}
                    onChange={(e) => setFormGpax(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">ปีที่สำเร็จการศึกษา (Graduation Year)</label>
                  <input
                    type="number"
                    value={formGraduationYear}
                    onChange={(e) => setFormGraduationYear(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PARENTS & EMERGENCY */}
          {editTab === "family" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">ชื่อ-นามสกุล บิดา (Father&apos;s Name)</label>
                  <input
                    value={formFatherName}
                    onChange={(e) => setFormFatherName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">ชื่อ-นามสกุล มารดา (Mother&apos;s Name)</label>
                  <input
                    value={formMotherName}
                    onChange={(e) => setFormMotherName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">อาชีพผู้ปกครอง (Parent Occupation)</label>
                  <input
                    value={formParentOccupation}
                    onChange={(e) => setFormParentOccupation(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">เบอร์โทรศัพท์ผู้ปกครอง (Parent Phone)</label>
                  <input
                    value={formParentPhone}
                    onChange={(e) => setFormParentPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <hr className="border-slate-800/80 my-2" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">ชื่อผู้ติดต่อฉุกเฉิน (Emergency Contact)</label>
                  <input
                    value={formEmergencyName}
                    onChange={(e) => setFormEmergencyName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">ความสัมพันธ์ (Relationship)</label>
                  <input
                    value={formEmergencyRelationship}
                    onChange={(e) => setFormEmergencyRelationship(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300">เบอร์ติดต่อฉุกเฉิน (Emergency Phone)</label>
                <input
                  value={formEmergencyPhone}
                  onChange={(e) => setFormEmergencyPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 6: MEDICAL & ENGLISH */}
          {editTab === "medical" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">ส่วนสูง (Height cm)</label>
                  <input
                    type="number"
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">น้ำหนัก (Weight kg)</label>
                  <input
                    type="number"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">หมู่เลือด (Blood Type)</label>
                  <select
                    value={formBloodType}
                    onChange={(e) => setFormBloodType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-medium"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300">โรคประจำตัว (Medical Conditions)</label>
                <input
                  value={formMedicalConditions}
                  onChange={(e) => setFormMedicalConditions(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">ประวัติการแพ้ยา/อาหาร (Allergies)</label>
                <input
                  value={formAllergy}
                  onChange={(e) => setFormAllergy(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
                />
              </div>

              <hr className="border-slate-800/80 my-2" />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">คะแนน TOEIC</label>
                  <input
                    type="number"
                    value={formToeicScore}
                    onChange={(e) => setFormToeicScore(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">คะแนน IELTS</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formIeltsScore}
                    onChange={(e) => setFormIeltsScore(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300">ระดับ ICAO Level</label>
                  <input
                    type="number"
                    value={formIcaoLevel}
                    onChange={(e) => setFormIcaoLevel(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          <Button variant="gold" className="w-full mt-4 font-bold" onClick={handleSaveEdit}>
            {t("saveApplicationBtn")}
          </Button>
        </div>
      </Modal>

      {/* Add Application Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={t("addCadetTitle")}
        description={t("addCadetDesc")}
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300">ชื่อ (ภาษาไทย) *</label>
              <input
                placeholder="สมชาย"
                value={formFirstNameTh}
                onChange={(e) => setFormFirstNameTh(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">นามสกุล (ภาษาไทย) *</label>
              <input
                placeholder="ใจดี"
                value={formLastNameTh}
                onChange={(e) => setFormLastNameTh(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300">First Name (EN) *</label>
              <input
                placeholder="Somchai"
                value={formFirstNameEn}
                onChange={(e) => setFormFirstNameEn(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Last Name (EN) *</label>
              <input
                placeholder="Jaidee"
                value={formLastNameEn}
                onChange={(e) => setFormLastNameEn(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300">เบอร์โทรศัพท์ *</label>
              <input
                placeholder="0819998888"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">อีเมล *</label>
              <input
                type="email"
                placeholder="somchai@example.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300">เลขบัตรประชาชน (13 หลัก)</label>
            <input
              placeholder="1100200345678"
              value={formNationalId}
              onChange={(e) => setFormNationalId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
            />
          </div>

          <Button variant="gold" className="w-full mt-4" onClick={handleSaveNew}>
            {t("confirmCreateCadetBtn")}
          </Button>
        </div>
      </Modal>

      {/* Document Inspector & Preview Modal */}
      <Modal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        title={`ตรวจสอบรูปภาพเอกสาร (Document Inspector)`}
        description={`ผู้สมัคร: ${selectedApp?.student.firstNameTh || ""} ${selectedApp?.student.lastNameTh || ""} (${selectedApp?.applicationNumber || ""})`}
      >
        {selectedDoc && (
          <div className="space-y-4 text-xs text-slate-200">
            {/* Header info */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">ชื่อไฟล์เอกสาร</span>
                <span className="text-tif-gold font-bold text-xs truncate max-w-[240px] block">
                  {selectedDoc.originalName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">สถานะการตรวจสอบ</span>
                {selectedDoc.isVerified ? (
                  <span className="font-bold text-emerald-400 flex items-center justify-end">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> อนุมัติแล้ว (Verified)
                  </span>
                ) : (
                  <span className="font-bold text-amber-400 flex items-center justify-end">
                    <Clock className="mr-1 h-3.5 w-3.5" /> รอตรวจสอบ (Pending)
                  </span>
                )}
              </div>
            </div>

            {/* Document Image or PDF Display Box */}
            <DocumentPreviewBox doc={selectedDoc} />

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <a
                href={selectedDoc.secureUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-300 hover:text-tif-gold flex items-center font-medium bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl hover:border-tif-gold/50"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-tif-gold" />{" "}
                {isPdfFile(selectedDoc.secureUrl, selectedDoc.originalName) ? "เปิดไฟล์ PDF ในหน้าต่างใหม่" : "เปิดไฟล์ภาพขนาดจริง"}
              </a>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={selectedDoc.isVerified ? "outline" : "gold"}
                  onClick={() => {
                    handleToggleDocVerification(selectedDoc.id, !selectedDoc.isVerified);
                    alert(
                      !selectedDoc.isVerified
                        ? "อนุมัติเอกสารนี้เรียบร้อยแล้ว (Verified)"
                        : "ยกเลิกการอนุมัติเอกสารเรียบร้อยแล้ว"
                    );
                  }}
                  className="font-bold"
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  {selectedDoc.isVerified ? "ยกเลิกการอนุมัติ" : "อนุมัติเอกสารถูกต้อง (Approve)"}
                </Button>

                <Button variant="outline" size="sm" onClick={() => setDocModalOpen(false)}>
                  ปิดหน้าต่าง (Close)
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* REQUEST RE-UPLOAD / REJECT DOCUMENT MODAL */}
      <Modal
        isOpen={rejectDocModalOpen}
        onClose={() => setRejectDocModalOpen(false)}
        title="แจ้งให้ผู้สมัครส่งเอกสารใหม่ (Request Re-upload)"
        description="ระบุเหตุผลที่ปฏิเสธรูปภาพหรือเอกสารฉบับนี้ เพื่อแจ้งให้ผู้สมัครทราบและส่งใหม่"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              เอกสารที่ปฏิเสธ: <span className="text-tif-gold font-mono">{targetRejectDoc?.originalName}</span>
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="เช่น รูปภาพไม่ชัดเจน, แนบเอกสารผิดใบ, หรือถ่ายไม่ครบถ้วน..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRejectDocModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="gold" size="sm" onClick={handleConfirmRejectDoc} className="bg-amber-500 hover:bg-amber-600 font-bold">
              ยืนยันปฏิเสธ & แจ้งส่งใหม่
            </Button>
          </div>
        </div>
      </Modal>

      {/* ADMIN REPLACE DOCUMENT MODAL */}
      <Modal
        isOpen={replaceDocModalOpen}
        onClose={() => setReplaceDocModalOpen(false)}
        title="เจ้าหน้าที่เปลี่ยนรูปเอกสารแทน (Replace Document File)"
        description="อัปโหลดหรือระบุ URL รูปภาพเอกสารฉบับใหม่ที่ถูกต้องเข้าไปแทนที่รูปเดิม"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">ชื่อเอกสาร / รายละเอียด</label>
            <input
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="เช่น Corrected_Transcript_2026.jpg"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">URL รูปภาพ / ไฟล์เอกสารใหม่ *</label>
            <input
              value={newDocUrl}
              onChange={(e) => setNewDocUrl(e.target.value)}
              placeholder="https://... หรือชื่อไฟล์รูปภาพ"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white font-mono focus:border-tif-gold focus:outline-none"
            />
          </div>

          {newDocUrl && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="text-[10px] text-slate-400 block font-semibold">ตัวอย่างเอกสารใหม่</span>
              {isPdfFile(newDocUrl) ? (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-lg border border-slate-800 text-rose-400 space-y-1">
                  <FileText className="h-8 w-8 text-rose-500" />
                  <span className="text-xs font-bold text-rose-300">ไฟล์ PDF</span>
                </div>
              ) : (
                <img src={newDocUrl} alt="Preview" className="h-32 mx-auto rounded border border-slate-800 object-cover" />
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setReplaceDocModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="gold" size="sm" onClick={handleConfirmReplaceDoc} className="font-bold">
              บันทึกการเปลี่ยนรูปเอกสาร
            </Button>
          </div>
        </div>
      </Modal>

      {/* ADD EXTRA DOCUMENT MODAL */}
      <Modal
        isOpen={addExtraDocModalOpen}
        onClose={() => setAddExtraDocModalOpen(false)}
        title="เพิ่มเอกสารแนบเพิ่มเติม (Add Extra Document)"
        description="อัปโหลดเอกสารประกอบอื่นๆ เพิ่มเติมเข้าสู่ระบบของผู้สมัครรายนี้"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">ประเภทเอกสาร (Document Type)</label>
            <select
              value={extraDocType}
              onChange={(e) => setExtraDocType(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none font-medium"
            >
              <option value="NATIONAL_ID_CERTIFIED">สำเนาบัตรประชาชน (Certified National ID)</option>
              <option value="TRANSCRIPT_CERTIFIED">สำเนาวุฒิการศึกษา (Certified Transcript)</option>
              <option value="HOUSE_REGISTRATION_CERTIFIED">สำเนาทะเบียนบ้าน (Certified House Registration)</option>
              <option value="MEDICAL_CERTIFICATE_CLASS_1">ใบสำคัญแพทย์ CLASS 1 / ใบรับรองแพทย์เวชศาสตร์การบิน</option>
              <option value="PHOTO_1_INCH">รูปถ่าย 1.5 นิ้ว (1.5-Inch Photo)</option>
              <option value="CRIMINAL_RECORD_CHECK">ผลตรวจประวัติอาชญากรรม (Criminal Record Check)</option>
              <option value="MILITARY_SERVICE_EXEMPTION">ใบสำคัญแสดงการขอยกเว้นการรับราชการทหาร (สด.8 / สด.43)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">ชื่อไฟล์เอกสาร</label>
            <input
              value={extraDocName}
              onChange={(e) => setExtraDocName(e.target.value)}
              placeholder="เช่น Medical_Class_1_Official.jpg"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">URL รูปภาพ / ไฟล์เอกสาร *</label>
            <input
              value={extraDocUrl}
              onChange={(e) => setExtraDocUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white font-mono focus:border-tif-gold focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setAddExtraDocModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="gold" size="sm" onClick={handleConfirmAddExtraDoc} className="font-bold">
              เพิ่มเอกสารเข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </Modal>

      {/* DOCUMENT REVIEW DECISION MODAL (Pass / Fail with comment) */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={
          reviewDecision === "PASS"
            ? "ยืนยันผลการตรวจเอกสาร: ผ่าน (Approved)"
            : "ยืนยันผลการตรวจเอกสาร: ไม่ผ่าน (Rejected)"
        }
        description={
          reviewDecision === "PASS"
            ? "เอกสารครบถ้วนและถูกต้อง ระบบจะเปิดหน้าชำระค่าสมัคร 1,800 บาทให้ผู้สมัคร"
            : "กรุณาระบุเหตุผล/คำแนะนำที่ต้องการให้ผู้สมัครทราบและแก้ไข"
        }
      >
        <div className="space-y-4 text-xs">
          {/* Decision indicator */}
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${
            reviewDecision === "PASS"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}>
            {reviewDecision === "PASS" ? (
              <><CheckCircle2 className="h-4 w-4" /> ผ่านการตรวจเอกสาร — เปิดหน้าชำระค่าสมัคร 1,800 บาท</>
            ) : (
              <><XCircle className="h-4 w-4" /> ไม่ผ่านการตรวจเอกสาร — แจ้งเหตุผลให้ผู้สมัครแก้ไข</>
            )}
          </div>

          {/* Comment / Reason field */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              {reviewDecision === "PASS"
                ? "หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                : "เหตุผล / คำแนะนำสำหรับผู้สมัคร *"}
            </label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder={
                reviewDecision === "PASS"
                  ? "เช่น เอกสารครบถ้วนถูกต้อง สามารถชำระค่าสมัครได้"
                  : "เช่น สำเนาบัตรประชาชนไม่ชัดเจน กรุณาอัปโหลดใหม่, ขาดใบรับรองแพทย์, รูปถ่ายไม่ตรงกับเงื่อนไข..."
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button
              size="sm"
              variant="gold"
              onClick={handleConfirmReview}
              className={`font-bold ${
                reviewDecision === "PASS"
                  ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-500"
                  : "bg-rose-600 hover:bg-rose-700 border-rose-500"
              }`}
            >
              {reviewDecision === "PASS" ? "ยืนยัน: ผ่านการตรวจเอกสาร" : "ยืนยัน: ไม่ผ่าน + ส่งคำแนะนำ"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* WRITTEN EXAM DECISION MODAL */}
      <Modal
        isOpen={writtenExamModalOpen}
        onClose={() => setWrittenExamModalOpen(false)}
        title={`📝 ประกาศผลสอบข้อเขียน — ${selectedApp?.student?.firstNameTh || ""} ${selectedApp?.student?.lastNameTh || ""}`}
        description="เลือกผลการสอบข้อเขียนคัดเลือกนักบินประจำโครงการ:"
        maxWidth="md"
        variant="light"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <p className="text-slate-600 leading-relaxed font-medium">
            กรุณาเลือกผลการสอบข้อเขียนของผู้สมัคร ระบบจะอัปเดตสถานะและแสดงข้อความแจ้งผลไปยังหน้าติดตามสถานะของผู้สมัครทันที:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Option 1: PASS */}
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 🟢 ผ่านการสอบข้อเขียน
                </span>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  ผู้สมัครสอบผ่านเกณฑ์มาตรฐานการคัดเลือกนักบิน และได้รับสิทธิ์เข้าสู่ขั้นตอนสอบสัมภาษณ์ (Interview) ต่อไป
                </p>
              </div>
              <Button
                size="sm"
                onClick={handlePassWrittenExam}
                className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs py-2.5"
              >
                ✓ ยืนยัน: ผ่านการสอบข้อเขียน
              </Button>
            </div>

            {/* Option 2: FAIL / NOT PASSED (Gentle & Respectful Encouragement) */}
            <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/80 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" /> ขอบคุณและเป็นกำลังใจ (ไม่ผ่าน)
                </span>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  ผู้สมัครไม่ผ่านเกณฑ์การสอบข้อเขียน ระบบจะแสดงข้อความขอบคุณอย่างสุภาพ ให้กำลังใจ และขอบคุณความตั้งใจเข้าร่วมโครงการ
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleFailWrittenExam}
                className="w-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs py-2.5"
              >
                ยืนยัน: ส่งข้อความขอบคุณ & เป็นกำลังใจ
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* INTERVIEW DECISION MODAL */}
      <Modal
        isOpen={interviewResultModalOpen}
        onClose={() => setInterviewResultModalOpen(false)}
        title={`ประกาศผลสอบสัมภาษณ์ — ${selectedApp?.student?.firstNameTh || ""} ${selectedApp?.student?.lastNameTh || ""}`}
        description="เลือกผลการสอบสัมภาษณ์คัดเลือกนักบินประจำโครงการ:"
        maxWidth="md"
        variant="light"
      >
        <div className="space-y-4 text-xs text-slate-800">
          <p className="text-slate-600 leading-relaxed font-medium">
            กรุณาเลือกผลการสอบสัมภาษณ์ของผู้สมัคร ระบบจะอัปเดตสถานะและแสดงข้อความแจ้งผลไปยังหน้าติดตามสถานะของผู้สมัครทันที:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Option 1: PASS */}
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> ผ่านการสอบสัมภาษณ์
                </span>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  ผู้สมัครสอบผ่านการสัมภาษณ์และได้รับสิทธิ์เข้าสู่ขั้นตอนการตรวจสุขภาพนักบิน Class 1 เวชศาสตร์การบินต่อไป
                </p>
              </div>
              <Button
                size="sm"
                onClick={handlePassInterview}
                className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs py-2.5"
              >
                ✓ ยืนยัน: ผ่านการสอบสัมภาษณ์
              </Button>
            </div>

            {/* Option 2: FAIL / NOT PASSED (Gentle & Respectful Encouragement) */}
            <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/80 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-blue-950 text-sm flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" /> ขอบคุณและเป็นกำลังใจ (ไม่ผ่าน)
                </span>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  ผู้สมัครไม่ผ่านเกณฑ์การสอบสัมภาษณ์ ระบบจะแสดงข้อความขอบคุณอย่างสุภาพ ให้กำลังใจ และขอบคุณความตั้งใจเข้าร่วมโครงการ
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleFailInterview}
                className="w-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs py-2.5"
              >
                ยืนยัน: ส่งข้อความขอบคุณ & เป็นกำลังใจ
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
