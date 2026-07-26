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
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Award,
  Clock,
  Plus,
  ShieldCheck,
} from "lucide-react";

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
          email: "prasert@tif.ac.th",
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

import { useLanguage } from "@/lib/i18n/language-context";

export default function StudentApplicationsPage() {
  const { t } = useLanguage();
  const [applications, setApplications] = React.useState<ApplicationWithDetails[]>(SAMPLE_APPLICATIONS);
  const [selectedApp, setSelectedApp] = React.useState<ApplicationWithDetails | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = React.useState(false);
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [newNoteContent, setNewNoteContent] = React.useState("");

  const [interviewDate, setInterviewDate] = React.useState("2026-07-30T10:00");
  const [interviewerName, setInterviewerName] = React.useState("Capt. Thanawat (Chief Flight Instructor)");
  const [interviewLocation, setInterviewLocation] = React.useState("TIF Headquarters Room 302");

  React.useEffect(() => {
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
        email: "admin@tif.ac.th",
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

  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingApp, setEditingApp] = React.useState<ApplicationWithDetails | null>(null);

  // Form states for Edit/Add
  const [formFirstNameTh, setFormFirstNameTh] = React.useState("");
  const [formLastNameTh, setFormLastNameTh] = React.useState("");
  const [formFirstNameEn, setFormFirstNameEn] = React.useState("");
  const [formLastNameEn, setFormLastNameEn] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formNationalId, setFormNationalId] = React.useState("");
  const [formStatus, setFormStatus] = React.useState("SUBMITTED");

  const handleOpenAdd = () => {
    setFormFirstNameTh("");
    setFormLastNameTh("");
    setFormFirstNameEn("");
    setFormLastNameEn("");
    setFormPhone("");
    setFormEmail("");
    setFormNationalId("");
    setFormStatus("SUBMITTED");
    setAddModalOpen(true);
  };

  const handleOpenEdit = (app: ApplicationWithDetails) => {
    setEditingApp(app);
    setFormFirstNameTh(app.student.firstNameTh || "");
    setFormLastNameTh(app.student.lastNameTh || "");
    setFormFirstNameEn(app.student.firstNameEn || "");
    setFormLastNameEn(app.student.lastNameEn || "");
    setFormPhone(app.student.phone || "");
    setFormEmail(app.student.user?.email || "");
    setFormNationalId(app.student.nationalId || "");
    setFormStatus(app.status || "SUBMITTED");
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingApp) return;

    const updatedApp: ApplicationWithDetails = {
      ...editingApp,
      status: formStatus as any,
      student: {
        ...editingApp.student,
        firstNameTh: formFirstNameTh,
        lastNameTh: formLastNameTh,
        firstNameEn: formFirstNameEn,
        lastNameEn: formLastNameEn,
        phone: formPhone,
        nationalId: formNationalId,
        user: {
          ...editingApp.student.user,
          email: formEmail,
        },
      },
    };

    setApplications(applications.map((a) => (a.id === editingApp.id ? updatedApp : a)));
    if (selectedApp?.id === editingApp.id) {
      setSelectedApp(updatedApp);
    }
    setEditModalOpen(false);
    alert("อัปเดตข้อมูลใบสมัครเรียบร้อยแล้ว");
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
        lastNameEn: formLastNameEn,
        phone: formPhone,
        nationalId: formNationalId || "-",
        user: {
          email: formEmail,
        },
        address: {
          currentAddress: "Bangkok",
          province: "Bangkok",
          district: "Chatuchak",
          subdistrict: "Chomphon",
          postalCode: "10900",
        },
        education: {
          school: "Institution",
          degree: "Bachelor Degree",
          gpax: 3.5,
          graduationYear: 2025,
        },
        medical: {
          height: 175,
          weight: 68,
          bloodType: "O",
        },
        english: {
          toeicScore: 750,
        },
      },
      course: {
        id: "cadet-001",
        name: "Cadet Student Program",
        code: "CADET",
        price: 1500,
        duration: "Initial Entry",
      },
      documents: [],
      payments: [],
      interviews: [],
      adminNotes: [],
    };

    setApplications([newApp, ...applications]);
    setAddModalOpen(false);
    alert("เพิ่มใบสมัครใหม่เรียบร้อยแล้ว");
  };

  const handleDeleteApp = (id: string) => {
    if (window.confirm("คุณต้องการลบข้อมูลใบสมัครนี้ออกจากระบบใช่หรือไม่? (Action cannot be undone)")) {
      setApplications(applications.filter((a) => a.id !== id));
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
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tif-gold/10 text-tif-gold border border-tif-gold/30">
              {t("adminCadetManagementTag")}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display">
            {t("adminStudentAppTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            ตรวจสอบข้อมูลใบสมัครเรียนการบินออนไลน์ ค่าสมัคร 1,500 บาท และเอกสารประกอบ
          </p>
        </div>
        <div>
          <Button variant="gold" size="md" onClick={handleOpenAdd} className="shadow-lg shadow-tif-gold/10 font-semibold">
            <Plus className="mr-2 h-4 w-4" /> เพิ่มใบสมัครใหม่ (Add Cadet)
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

      {/* Detailed Student Profile Drawer */}
      {selectedApp && (
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={`Application Details (${selectedApp.applicationNumber})`}
          size="xl"
        >
          <div className="space-y-6 text-slate-200">
            {/* Header Status & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Current Status</span>
                <span className="text-lg font-bold text-tif-gold uppercase tracking-wide">
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
                  onClick={() => handleOpenEdit(selectedApp)}
                  className="bg-slate-900 border-slate-800 text-tif-gold"
                >
                  Edit Data
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInterviewModalOpen(true)}
                  className="bg-slate-900 border-slate-800 text-slate-200"
                >
                  <Calendar className="mr-1 h-3.5 w-3.5 text-purple-400" /> Schedule Interview
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteApp(selectedApp.id)}
                >
                  Delete App
                </Button>
              </div>
            </div>

            {/* Quick Profile Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center">
                  <User className="mr-1.5 h-4 w-4 text-tif-gold" /> Personal Identity
                </h4>
                <p className="text-sm font-semibold text-white">
                  {selectedApp.student.firstNameEn} {selectedApp.student.lastNameEn} ({selectedApp.student.firstNameTh} {selectedApp.student.lastNameTh})
                </p>
                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <p className="flex items-center"><Phone className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> {selectedApp.student.phone}</p>
                  <p className="flex items-center"><Mail className="mr-1.5 h-3.5 w-3.5 text-slate-500" /> {selectedApp.student.user?.email}</p>
                  <p>National ID: {selectedApp.student.nationalId || "-"}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center">
                  <FileText className="mr-1.5 h-4 w-4 text-tif-gold" /> ค่าสมัครเรียน / Application Fee
                </h4>
                <p className="text-sm font-bold text-white">ค่าสมัครเรียนการบินออนไลน์</p>
                <p className="text-xs text-slate-400">สถาบันการบิน Thai Inter Flying</p>
                <p className="text-xs font-semibold text-emerald-400">ค่าธรรมเนียม: 1,500 THB</p>
              </div>
            </div>

            {/* Official TIF Application Document Checklist */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center font-display">
                  <FileText className="mr-2 h-4 w-4 text-tif-gold" /> รายการเอกสาร / Application Document Checklist
                </h4>
                <Badge variant={selectedApp.status === "DOCUMENT_VERIFIED" ? "success" : "gold"}>
                  {selectedApp.status === "DOCUMENT_VERIFIED" ? "เอกสารครบถ้วน (Complete)" : "รอตรวจสอบ (Pending)"}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="flex items-center font-medium">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                    Application Online / Completed Online Application
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Submitted</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="flex items-center font-medium">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                    ชำระค่าสมัคร 1,500 บาท / Application Fee Payment Completed (THB 1,500)
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">THB 1,500 Paid</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="flex items-center font-medium">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                    ตรวจสอบสลิปการชำระเงินค่าสมัคร / Payment Slip Verified
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Slip Verified</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2 h-3.5 w-3.5 accent-tif-gold rounded" />
                    รูปถ่าย 1&quot; จำนวน 12 รูป / 1&quot; Inch (12 Photographs)
                  </span>
                  <span className="text-slate-400 font-medium">12 Photos Attached</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2 h-3.5 w-3.5 accent-tif-gold rounded" />
                    สำเนาบัตรประชาชน (รับรองสำเนาถูกต้อง) / Certified Copy of National ID Card
                  </span>
                  <span className="text-emerald-400 font-bold">Verified</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
                  <span className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2 h-3.5 w-3.5 accent-tif-gold rounded" />
                    สำเนาวุฒิการศึกษา (รับรองสำเนาถูกต้อง) / Certified Copy of Educational Qualification
                  </span>
                  <span className="text-emerald-400 font-bold">Verified</span>
                </div>
              </div>
            </div>

            {/* Internal CRM Admin Notes */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-tif-gold uppercase tracking-wider flex items-center">
                  <MessageSquare className="mr-1.5 h-4 w-4 text-tif-gold" /> Internal CRM & Faculty Notes
                </h4>
                <Button size="sm" variant="outline" onClick={() => setNoteModalOpen(true)} className="text-xs bg-slate-900 border-slate-800 text-slate-200">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Note
                </Button>
              </div>

              <div className="space-y-2">
                {selectedApp.adminNotes.length > 0 ? (
                  selectedApp.adminNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
                      <p className="text-slate-200 leading-relaxed">{note.content}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                        <span>By: {note.author.name || note.author.email}</span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No notes added yet.</p>
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
            <label className="text-xs font-semibold text-slate-300 uppercase">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">Chief Interviewer</label>
            <input
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">Interview Location / Zoom</label>
            <input
              value={interviewLocation}
              onChange={(e) => setInterviewLocation(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white"
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
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white"
          />
          <Button variant="gold" className="w-full" onClick={handleAddNote}>
            Save CRM Note
          </Button>
        </div>
      </Modal>

      {/* Edit Application Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="แก้ไขข้อมูลใบสมัครเรียน (Edit Cadet Application)"
        description="แก้ไขรายละเอียดข้อมูลส่วนบุคคลและสถานะของผู้สมัคร"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300">ชื่อ (ภาษาไทย)</label>
              <input
                value={formFirstNameTh}
                onChange={(e) => setFormFirstNameTh(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">นามสกุล (ภาษาไทย)</label>
              <input
                value={formLastNameTh}
                onChange={(e) => setFormLastNameTh(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300">First Name (EN)</label>
              <input
                value={formFirstNameEn}
                onChange={(e) => setFormFirstNameEn(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">Last Name (EN)</label>
              <input
                value={formLastNameEn}
                onChange={(e) => setFormLastNameEn(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300">เบอร์โทรศัพท์ (Phone)</label>
              <input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">อีเมล (Email)</label>
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
              <label className="font-semibold text-slate-300">เลขบัตรประชาชน (National ID)</label>
              <input
                value={formNationalId}
                onChange={(e) => setFormNationalId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300">สถานะการสมัคร (Status)</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white font-medium"
              >
                <option value="SUBMITTED">Submitted (ยื่นใบสมัครแล้ว)</option>
                <option value="DOCUMENT_VERIFIED">Docs Verified (ตรวจเอกสารแล้ว)</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled (นัดสัมภาษณ์แล้ว)</option>
                <option value="ACCEPTED">Accepted (อนุมัติผลการสมัคร)</option>
                <option value="PAID">Paid (ชำระค่าสมัคร 1,500 บาทแล้ว)</option>
                <option value="REJECTED">Rejected (ปฏิเสธ)</option>
              </select>
            </div>
          </div>

          <Button variant="gold" className="w-full mt-4" onClick={handleSaveEdit}>
            บันทึกการแก้ไขข้อมูล (Save Changes)
          </Button>
        </div>
      </Modal>

      {/* Add Application Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="เพิ่มใบสมัครเรียนใหม่ (Add New Cadet Application)"
        description="กรอกข้อมูลผู้สมัครเรียนเพื่อบันทึกเข้าสู่ระบบของเจ้าหน้าที่"
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
            ยืนยันบันทึกใบสมัครใหม่ (Create Application)
          </Button>
        </div>
      </Modal>
    </div>
  );
}
