"use client";

import * as React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApplicationWithDetails } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  MessageSquare,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Award,
  Clock,
  Plus,
} from "lucide-react";

// Mock dataset for immediate demonstration & fallback
const SAMPLE_APPLICATIONS: ApplicationWithDetails[] = [
  {
    id: "app-101",
    applicationNumber: "TIF-2026-8812",
    branch: "Bangkok Headquarters",
    preferredStartDate: new Date("2026-09-01"),
    status: "SUBMITTED",
    createdAt: new Date("2026-07-24"),
    updatedAt: new Date("2026-07-24"),
    student: {
      id: "std-101",
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      firstNameEn: "Somchai",
      lastNameEn: "Jaidee",
      nickname: "Boy",
      phone: "0819998888",
      nationalId: "1100200345678",
      passport: "AA1234567",
      user: {
        email: "somchai@example.com",
      },
      address: {
        currentAddress: "123 Sukhumvit Road",
        province: "Bangkok",
        district: "Vadhana",
        subdistrict: "Klongtoey Nua",
        postalCode: "10110",
      },
      education: {
        school: "Triam Udom Suksa",
        university: "Chulalongkorn University",
        degree: "Bachelor of Aerospace Engineering",
        gpax: 3.65,
        graduationYear: 2024,
      },
      emergency: {
        name: "Somsak Jaidee",
        relationship: "Father",
        phone: "0812223333",
        address: "123 Sukhumvit Road, Bangkok",
      },
      parent: {
        fatherName: "Mr. Somsak Jaidee",
        motherName: "Mrs. Somjai Jaidee",
        occupation: "Airline Executive",
        phone: "0812223333",
      },
      medical: {
        height: 178,
        weight: 70,
        bloodType: "O",
        medicalConditions: "None",
        allergy: "None",
      },
      english: {
        toeicScore: 820,
        ieltsScore: 7.0,
        icaoLevel: 4,
      },
    },
    course: {
      id: "cpl-002",
      name: "Commercial Pilot License (CPL)",
      code: "CPL",
      price: 1250000,
      duration: "14 Months",
    },
    documents: [
      {
        id: "doc-1",
        type: "PASSPORT_PHOTO",
        secureUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
        publicId: "tif_photo_1",
        originalName: "Passport_Photo_Somchai.jpg",
        isVerified: true,
        uploadedAt: new Date(),
      },
      {
        id: "doc-2",
        type: "NATIONAL_ID",
        secureUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500",
        publicId: "tif_id_1",
        originalName: "National_ID_Card.pdf",
        isVerified: false,
        uploadedAt: new Date(),
      },
    ],
    payments: [],
    interviews: [],
    adminNotes: [
      {
        id: "note-1",
        content: "Initial application screening completed. Candidate meets English TOEIC score requirement.",
        createdAt: new Date("2026-07-24T10:00:00"),
        author: {
          name: "Training Officer Prasert",
          email: "prasert@thaiinterflying.com",
        },
      },
    ],
  },
  {
    id: "app-102",
    applicationNumber: "TIF-2026-4401",
    branch: "Don Mueang Flight Base",
    preferredStartDate: new Date("2026-09-15"),
    status: "DOCUMENT_VERIFIED",
    createdAt: new Date("2026-07-23"),
    updatedAt: new Date("2026-07-23"),
    student: {
      id: "std-102",
      firstNameTh: "กาญจนา",
      lastNameTh: "สุขุมวิท",
      firstNameEn: "Kanchana",
      lastNameEn: "Sukhumvit",
      phone: "0898887777",
      nationalId: "1100500123456",
      user: {
        email: "kanchana@example.com",
      },
      education: {
        school: "Mahidol Witayanusorn",
        degree: "High School Diploma",
        gpax: 3.85,
        graduationYear: 2025,
      },
      medical: {
        height: 165,
        weight: 52,
        bloodType: "A",
      },
      english: {
        toeicScore: 780,
      },
    },
    course: {
      id: "ppl-001",
      name: "Private Pilot License (PPL)",
      code: "PPL",
      price: 350000,
      duration: "4 Months",
    },
    documents: [],
    payments: [],
    interviews: [],
    adminNotes: [],
  },
];

export default function StudentApplicationsPage() {
  const [applications, setApplications] = React.useState<ApplicationWithDetails[]>(SAMPLE_APPLICATIONS);
  const [selectedApp, setSelectedApp] = React.useState<ApplicationWithDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = React.useState(false);
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [newNoteContent, setNewNoteContent] = React.useState("");

  // Interview modal form
  const [interviewDate, setInterviewDate] = React.useState("2026-07-30T10:00");
  const [interviewerName, setInterviewerName] = React.useState("Capt. Thanawat (Chief Flight Instructor)");
  const [interviewLocation, setInterviewLocation] = React.useState("TIF Headquarters Room 302");

  React.useEffect(() => {
    // Fetch live applications from API route
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApplications(data);
        }
      })
      .catch((err) => console.error("Error loading applications:", err));
  }, []);

  const handleSelectApp = (app: ApplicationWithDetails) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  const handleUpdateStatus = (newStatus: any) => {
    if (!selectedApp) return;

    const updated = applications.map((a) => (a.id === selectedApp.id ? { ...a, status: newStatus } : a));
    setApplications(updated);
    setSelectedApp({ ...selectedApp, status: newStatus });
  };

  const handleAddNote = () => {
    if (!selectedApp || !newNoteContent.trim()) return;

    const newNote = {
      id: `note_${Date.now()}`,
      content: newNoteContent,
      createdAt: new Date(),
      author: {
        name: "Admin User",
        email: "admin@thaiinterflying.com",
      },
    };

    const updatedApp = {
      ...selectedApp,
      adminNotes: [newNote, ...selectedApp.adminNotes],
    };

    setApplications(applications.map((a) => (a.id === selectedApp.id ? updatedApp : a)));
    setSelectedApp(updatedApp);
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

    const updatedApp = {
      ...selectedApp,
      status: "INTERVIEW_SCHEDULED" as any,
      interviews: [...selectedApp.interviews, newInterview],
    };

    setApplications(applications.map((a) => (a.id === selectedApp.id ? updatedApp : a)));
    setSelectedApp(updatedApp);
    setInterviewModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-tif-navy font-display">
            Student Management & Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global search, document verification, interview scheduling, and status tracking
          </p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable data={applications} onSelectApplication={handleSelectApp} />

      {/* Detailed Student Profile Drawer */}
      {selectedApp && (
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={`Application Details (${selectedApp.applicationNumber})`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Header Status & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">Current Status</span>
                <span className="text-lg font-bold text-tif-navy uppercase tracking-wide">
                  {selectedApp.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => handleUpdateStatus("DOCUMENT_VERIFIED")}
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Verify Docs
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInterviewModalOpen(true)}
                >
                  <Calendar className="mr-1 h-3.5 w-3.5 text-purple-600" /> Schedule Interview
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus("ACCEPTED")}
                >
                  Accept Admission
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleUpdateStatus("REJECTED")}
                >
                  Reject
                </Button>
              </div>
            </div>

            {/* Quick Profile Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <h4 className="text-xs font-bold text-tif-navy uppercase tracking-wider flex items-center">
                  <User className="mr-1.5 h-4 w-4 text-tif-gold" /> Personal Identity
                </h4>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedApp.student.firstNameEn} {selectedApp.student.lastNameEn} ({selectedApp.student.firstNameTh} {selectedApp.student.lastNameTh})
                </p>
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="flex items-center"><Phone className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> {selectedApp.student.phone}</p>
                  <p className="flex items-center"><Mail className="mr-1.5 h-3.5 w-3.5 text-slate-400" /> {selectedApp.student.user.email}</p>
                  <p>National ID: {selectedApp.student.nationalId || "-"}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <h4 className="text-xs font-bold text-tif-navy uppercase tracking-wider flex items-center">
                  <Award className="mr-1.5 h-4 w-4 text-tif-gold" /> Program & Branch
                </h4>
                <p className="text-sm font-bold text-tif-navy">{selectedApp.course.name}</p>
                <p className="text-xs text-slate-500">Branch: {selectedApp.branch}</p>
                <p className="text-xs font-semibold text-emerald-700">Tuition: {formatCurrency(selectedApp.course.price)}</p>
              </div>
            </div>

            {/* Official TIF Application Document Checklist (รายการเอกสารการสมัคร) */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-tif-navy uppercase tracking-wider flex items-center font-display">
                  <FileText className="mr-2 h-5 w-5 text-tif-gold" /> รายการเอกสาร / Application Document Checklist
                </h4>
                <Badge variant={selectedApp.status === "DOCUMENT_VERIFIED" ? "success" : "gold"}>
                  {selectedApp.status === "DOCUMENT_VERIFIED" ? "เอกสารครบถ้วน (Complete)" : "รอตรวจสอบ (Pending)"}
                </Badge>
              </div>

              {/* Checklist Items Grid matching physical TIF form */}
              <div className="space-y-2 text-xs text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="flex items-center font-medium">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                    Application Online / Completed Online Application
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">Submitted</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="flex items-center font-medium">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                    ชำระค่าสมัคร 1,500 บาท / Application Fee Payment Completed (THB 1,500)
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">THB 1,500 Paid</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="flex items-center font-medium">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                    ตรวจสอบสลิปการชำระเงินค่าสมัคร / Payment Slip Verified
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">Slip Verified</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2 h-3.5 w-3.5 accent-tif-navy rounded" />
                    รูปถ่าย 1&quot; จำนวน 12 รูป / 1&quot; Inch (12 Photographs)
                  </span>
                  <span className="text-slate-500 font-medium">12 Photos Attached</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2 h-3.5 w-3.5 accent-tif-navy rounded" />
                    รูปถ่าย 2&quot; จำนวน 12 รูป / 2&quot; Inch (12 Photographs)
                  </span>
                  <span className="text-slate-500 font-medium">12 Photos Attached</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2 h-3.5 w-3.5 accent-tif-navy rounded" />
                    สำเนาบัตรประชาชน (รับรองสำเนาถูกต้อง) / Certified Copy of National ID Card
                  </span>
                  <span className="text-emerald-600 font-bold">Verified</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2 h-3.5 w-3.5 accent-tif-navy rounded" />
                    สำเนาวุฒิการศึกษา (รับรองสำเนาถูกต้อง) / Certified Copy of Educational Qualification
                  </span>
                  <span className="text-emerald-600 font-bold">Verified</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2 h-3.5 w-3.5 accent-tif-navy rounded" />
                    สำเนาทะเบียนบ้าน (รับรองสำเนาถูกต้อง) / Certified Copy of House Registration
                  </span>
                  <span className="text-emerald-600 font-bold">Verified</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60 bg-amber-50/50 p-1.5 rounded">
                  <div>
                    <span className="flex items-center font-semibold text-tif-navy">
                      <input type="checkbox" className="mr-2 h-3.5 w-3.5 accent-tif-navy rounded" />
                      Medical Certificate Class 1 / Class 1 Aviation Medical Certificate
                    </span>
                    <span className="text-[10px] text-amber-700 block ml-5 italic">
                      *(ปรึกษากับทีมใหญ่ว่าควรยื่นเลยหรือไม่)
                    </span>
                  </div>
                  <span className="text-amber-700 font-bold text-[10px]">Review Required</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center">
                    <input type="checkbox" className="mr-2 h-3.5 w-3.5 accent-tif-navy rounded" />
                    ผลตรวจประวัติอาชญากรรม (ถ้ามี) / Criminal Record Check Result (if any)
                  </span>
                  <span className="text-slate-400 text-[10px]">Optional</span>
                </div>
              </div>

              {/* Application Document Verification Results */}
              <div className="p-4 bg-slate-100/80 rounded-xl space-y-3">
                <h5 className="text-xs font-bold text-tif-navy uppercase">
                  ผลการตรวจสอบเอกสารการสมัคร / Application Document Verification
                </h5>
                <div className="flex items-center space-x-6 text-xs font-medium text-slate-800">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="verificationResult" defaultChecked className="accent-emerald-600 h-4 w-4" />
                    <span>เอกสารครบถ้วน / Complete Documentation</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="verificationResult" className="accent-rose-600 h-4 w-4" />
                    <span>ต้องส่งเอกสารเพิ่มเติม / Additional Documents Required</span>
                  </label>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                    หมายเหตุ / Remarks
                  </label>
                  <input
                    placeholder="พิมพ์หมายเหตุเพิ่มเติม..."
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-tif-navy"
                  />
                </div>
              </div>

              {/* Cloudinary Documents File Attachments */}
              {selectedApp.documents.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 block mb-2">Uploaded Cloudinary Files:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedApp.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white text-xs">
                        <span className="font-medium text-slate-800 truncate max-w-[140px]">{doc.originalName}</span>
                        <a href={doc.secureUrl} target="_blank" rel="noreferrer" className="text-tif-gold font-bold text-[11px] hover:underline">
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Internal CRM Admin Notes */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-tif-navy uppercase tracking-wider flex items-center">
                  <MessageSquare className="mr-1.5 h-4 w-4 text-tif-gold" /> Internal CRM & Faculty Notes
                </h4>
                <Button size="sm" variant="outline" onClick={() => setNoteModalOpen(true)} className="text-xs">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Note
                </Button>
              </div>

              <div className="space-y-2">
                {selectedApp.adminNotes.length > 0 ? (
                  selectedApp.adminNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg text-xs">
                      <p className="text-slate-800 leading-relaxed">{note.content}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <span>By: {note.author.name || note.author.email}</span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No notes added yet.</p>
                )}
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        title="Schedule Aviation Interview"
        description="Select date, time, and location for candidate interview"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase">Chief Interviewer</label>
            <input
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase">Interview Location / Zoom</label>
            <input
              value={interviewLocation}
              onChange={(e) => setInterviewLocation(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>
          <Button variant="gold" className="w-full mt-4" onClick={handleScheduleInterview}>
            Confirm Interview & Notify Candidate
          </Button>
        </div>
      </Modal>

      {/* Add Admin Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title="Add Internal CRM Note"
      >
        <div className="space-y-4">
          <textarea
            rows={4}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Type internal remarks, background check details, or call notes..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          />
          <Button variant="gold" className="w-full" onClick={handleAddNote}>
            Save CRM Note
          </Button>
        </div>
      </Modal>
    </div>
  );
}
