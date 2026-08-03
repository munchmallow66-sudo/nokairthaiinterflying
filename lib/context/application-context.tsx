"use client";

import * as React from "react";
import { ApplicationWithDetails } from "@/types";

const STORAGE_KEY = "tif_global_applications_database_v2";

export const INITIAL_SAMPLE_APPLICATIONS: ApplicationWithDetails[] = [
  {
    id: "app-3939",
    applicationNumber: "TIF-2026-3939",
    branch: "Bangkok Headquarters",
    preferredStartDate: new Date("2026-09-01"),
    status: "SUBMITTED",
    createdAt: new Date(),
    updatedAt: new Date(),
    student: {
      id: "std-3939",
      firstNameTh: "ศุภโชค",
      lastNameTh: "สัจจะธรรม",
      firstNameEn: "Suphachok",
      lastNameEn: "Sajjatham",
      nickname: "Save",
      phone: "0891234567",
      nationalId: "1100500123456",
      passport: "AA9876543",
      user: {
        email: "student3939@example.com",
      },
      address: {
        currentAddress: "99/1 ถนนวิภาวดีรังสิต",
        province: "Bangkok",
        district: "Don Mueang",
        subdistrict: "Sanam Bihn",
        postalCode: "10210",
      },
      education: {
        school: "บดินทรเดชา",
        university: "มหาวิทยาลัยเกษตรศาสตร์",
        degree: "วิศวกรรมศาสตรบัณฑิต",
        gpax: 3.52,
        graduationYear: 2024,
      },
      emergency: {
        name: "สมศักดิ์ สัจจะธรรม",
        relationship: "บิดา",
        phone: "0898889999",
        address: "กรุงเทพมหานคร",
      },
      parent: {
        fatherName: "นายสมศักดิ์ สัจจะธรรม",
        motherName: "นางสมศรี สัจจะธรรม",
        occupation: "ธุรกิจส่วนตัว",
        phone: "0898889999",
      },
      medical: {
        height: 175,
        weight: 68,
        bloodType: "O",
        medicalConditions: "ไม่มี",
        allergy: "ไม่มี",
      },
      english: {
        toeicScore: 810,
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
        id: "doc-3939-1",
        type: "PASSPORT_PHOTO",
        secureUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
        publicId: "tif_photo_3939",
        originalName: "Passport_Photo_1Inch.jpg",
        isVerified: false,
        uploadedAt: new Date(),
      },
      {
        id: "doc-3939-2",
        type: "NATIONAL_ID",
        secureUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
        publicId: "tif_id_3939",
        originalName: "National_ID_Certified.jpg",
        isVerified: false,
        uploadedAt: new Date(),
      },
      {
        id: "doc-3939-3",
        type: "TRANSCRIPT",
        secureUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800",
        publicId: "tif_transcript_3939",
        originalName: "Degree_Transcript.pdf",
        isVerified: false,
        uploadedAt: new Date(),
      },
    ],
    payments: [],
    interviews: [],
    adminNotes: [],
  },
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
        secureUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
        publicId: "tif_photo_1",
        originalName: "Passport_Photo_1Inch_Somchai.jpg",
        isVerified: true,
        uploadedAt: new Date("2026-07-24T09:15:00"),
      },
      {
        id: "doc-2",
        type: "NATIONAL_ID",
        secureUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
        publicId: "tif_id_1",
        originalName: "Certified_Thai_National_ID.jpg",
        isVerified: false,
        uploadedAt: new Date("2026-07-24T09:16:00"),
      },
      {
        id: "doc-3",
        type: "TRANSCRIPT",
        secureUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800",
        publicId: "tif_transcript_1",
        originalName: "Bachelor_Degree_Transcript.jpg",
        isVerified: true,
        uploadedAt: new Date("2026-07-24T09:20:00"),
      },
      {
        id: "doc-4",
        type: "TOEIC",
        secureUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800",
        publicId: "tif_toeic_1",
        originalName: "Official_TOEIC_Score_820.jpg",
        isVerified: true,
        uploadedAt: new Date("2026-07-24T09:22:00"),
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
    status: "DOCS_PASSED",
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
    documents: [
      {
        id: "doc-201",
        type: "PASSPORT_PHOTO",
        secureUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
        publicId: "tif_photo_2",
        originalName: "Kanchana_Photo_1Inch.jpg",
        isVerified: true,
        uploadedAt: new Date("2026-07-23T14:10:00"),
      },
      {
        id: "doc-202",
        type: "NATIONAL_ID",
        secureUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
        publicId: "tif_id_2",
        originalName: "Kanchana_National_ID_Card.jpg",
        isVerified: true,
        uploadedAt: new Date("2026-07-23T14:12:00"),
      },
    ],
    payments: [],
    interviews: [],
    adminNotes: [],
  },
  {
    id: "app-103",
    applicationNumber: "TIF-2026-9043",
    branch: "Bangkok Headquarters",
    preferredStartDate: new Date("2026-10-01"),
    status: "APPLICATION_FEE_PAID",
    createdAt: new Date("2026-07-22"),
    updatedAt: new Date("2026-07-22"),
    student: {
      id: "std-103",
      firstNameTh: "ณัฐพงษ์",
      lastNameTh: "กิตติศักดิ์",
      firstNameEn: "Nattapong",
      lastNameEn: "Kittisak",
      phone: "0823334444",
      nationalId: "1100700987654",
      user: {
        email: "nattapong@example.com",
      },
      education: {
        school: "Suankularb Wittayalai",
        university: "Kasetsart University",
        degree: "Bachelor of Engineering",
        gpax: 3.42,
        graduationYear: 2023,
      },
      english: {
        toeicScore: 850,
      },
    },
    course: {
      id: "cpl-002",
      name: "Commercial Pilot License (CPL)",
      code: "CPL",
      price: 1250000,
      duration: "14 Months",
    },
    documents: [],
    payments: [
      {
        id: "pay-103",
        amount: 1800,
        slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
        invoiceNo: "INV-2026-0091",
        receiptNo: "RCT-2026-0091",
        status: "VERIFIED",
        createdAt: new Date("2026-07-22T11:00:00"),
      },
    ],
    interviews: [],
    adminNotes: [],
  },
  {
    id: "app-104",
    applicationNumber: "TIF-2026-1092",
    branch: "Don Mueang Flight Base",
    preferredStartDate: new Date("2026-09-01"),
    status: "MEDICAL_CHECK_CLASS_1",
    createdAt: new Date("2026-07-20"),
    updatedAt: new Date("2026-07-20"),
    student: {
      id: "std-104",
      firstNameTh: "ธนกร",
      lastNameTh: "วงศ์",
      firstNameEn: "Thanakorn",
      lastNameEn: "Wong",
      phone: "0871112222",
      nationalId: "1100900554433",
      user: {
        email: "thanakorn@example.com",
      },
      education: {
        school: "Assumption College",
        university: "Thammasat University",
        degree: "Bachelor of Business",
        gpax: 3.55,
        graduationYear: 2024,
      },
      english: {
        toeicScore: 890,
        icaoLevel: 5,
      },
    },
    course: {
      id: "cpl-002",
      name: "Commercial Pilot License (CPL)",
      code: "CPL",
      price: 1250000,
      duration: "14 Months",
    },
    documents: [],
    payments: [],
    interviews: [
      {
        id: "int-104",
        scheduledAt: new Date("2026-07-25T10:00:00"),
        location: "TIF DMK Base Room 101",
        interviewer: "Capt. Thanawat",
        passed: true,
        result: "Passed with distinction",
      },
    ],
    adminNotes: [],
  },
];

interface ApplicationContextType {
  applications: ApplicationWithDetails[];
  updateApplication: (appId: string, updatedFields: Partial<ApplicationWithDetails>) => void;
  toggleDocVerification: (appId: string, docId: string, verifiedStatus: boolean) => void;
  rejectDocument: (appId: string, docId: string, reason: string) => void;
  replaceDocument: (appId: string, docId: string, newUrl: string, newName?: string) => void;
  addExtraDocument: (appId: string, type: string, url: string, name: string) => void;
  deleteApplication: (appId: string) => void;
  addApplication: (newApp: ApplicationWithDetails) => void;
  resetToSampleData: () => void;
}

const DELETED_KEY = "tif_deleted_application_ids_v1";

const ApplicationContext = React.createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = React.useState<ApplicationWithDetails[]>([]);
  const [deletedIds, setDeletedIds] = React.useState<string[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // 1. Load persisted data & deleted tombstones from localStorage, then fetch server DB
  React.useEffect(() => {
    let currentDeleted: string[] = [];
    try {
      const savedDeleted = localStorage.getItem(DELETED_KEY);
      if (savedDeleted) {
        const parsed = JSON.parse(savedDeleted);
        if (Array.isArray(parsed)) {
          currentDeleted = parsed;
          setDeletedIds(parsed);
        }
      }
    } catch (e) {}

    let initialApps = INITIAL_SAMPLE_APPLICATIONS.filter(
      (app) => !currentDeleted.includes(app.id) && !currentDeleted.includes(app.applicationNumber)
    );

    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData !== null) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed)) {
          initialApps = parsed.filter(
            (app: any) => !currentDeleted.includes(app.id) && !currentDeleted.includes(app.applicationNumber)
          );
        }
      }
    } catch (err) {
      console.error("Failed to load global ApplicationContext cache:", err);
    }

    setApplications(initialApps);
    setIsInitialized(true);

    // Fetch real applications from server DB and merge cleanly
    fetch("/api/applications")
      .then((res) => (res.ok ? res.json() : []))
      .then((dbApps) => {
        if (Array.isArray(dbApps) && dbApps.length > 0) {
          setApplications((prev) => {
            const merged = [...prev];
            dbApps.forEach((dbApp: any) => {
              const isDeleted = currentDeleted.includes(dbApp.id) || currentDeleted.includes(dbApp.applicationNumber);
              if (!isDeleted) {
                const exists = merged.some(
                  (a) => a.id === dbApp.id || a.applicationNumber === dbApp.applicationNumber
                );
                if (!exists) {
                  merged.unshift(dbApp);
                }
              }
            });
            return merged.filter((a) => !currentDeleted.includes(a.id) && !currentDeleted.includes(a.applicationNumber));
          });
        }
      })
      .catch((err) => console.warn("Failed to fetch applications from DB:", err));
  }, []);

  // 2. Persist applications state to localStorage whenever modified
  React.useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (err) {
      console.error("Failed to save global ApplicationContext cache:", err);
    }
  }, [applications, isInitialized]);

  const updateApplication = (appId: string, updatedFields: Partial<ApplicationWithDetails>) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, ...updatedFields, updatedAt: new Date() } : app))
    );
    try {
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, ...updatedFields }),
      }).catch((e) => console.warn("API sync error:", e));
    } catch (e) {}
  };

  const toggleDocVerification = (appId: string, docId: string, verifiedStatus: boolean) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const updatedDocs = app.documents?.map((d) =>
          d.id === docId ? { ...d, isVerified: verifiedStatus, isRejected: false, rejectReason: undefined } : d
        );
        return { ...app, documents: updatedDocs, updatedAt: new Date() };
      })
    );
    try {
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, docId, action: "TOGGLE_DOC_VERIFY", verifiedStatus }),
      }).catch((e) => console.warn("API sync error:", e));
    } catch (e) {}
  };

  const rejectDocument = (appId: string, docId: string, reason: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const targetDoc = app.documents?.find((d) => d.id === docId);
        const updatedDocs = app.documents?.map((d) =>
          d.id === docId ? { ...d, isVerified: false, isRejected: true, rejectReason: reason } : d
        );

        const newNote = {
          id: `note_${Date.now()}`,
          content: `[แจ้งเอกสารผิด]: ปฏิเสธเอกสาร "${targetDoc?.originalName || docId}" - เหตุผล: ${reason}`,
          createdAt: new Date(),
          author: {
            name: "Admin Officer",
            email: "admin@tif.ac.th",
          },
        };

        return {
          ...app,
          status: "WAITING_DOCUMENTS" as any,
          documents: updatedDocs,
          adminNotes: [newNote, ...(app.adminNotes || [])],
          updatedAt: new Date(),
        };
      })
    );
    try {
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: "WAITING_DOCUMENTS" }),
      }).catch((e) => console.warn("API sync error:", e));
    } catch (e) {}
  };

  const replaceDocument = (appId: string, docId: string, newUrl: string, newName?: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const updatedDocs = app.documents?.map((d) =>
          d.id === docId
            ? {
                ...d,
                secureUrl: newUrl,
                originalName: newName || d.originalName,
                isVerified: false,
                isRejected: false,
                rejectReason: undefined,
              }
            : d
        );
        return { ...app, documents: updatedDocs, updatedAt: new Date() };
      })
    );
    try {
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, action: "REPLACE_DOC", docId, newUrl, newName }),
      }).catch((e) => console.warn("API sync error:", e));
    } catch (e) {}
  };

  const addExtraDocument = (appId: string, type: string, url: string, name: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const newDoc = {
          id: `doc_${Date.now()}`,
          type: type as any,
          secureUrl: url,
          publicId: `tif_extra_${Date.now()}`,
          originalName: name,
          isVerified: false,
          isRejected: false,
          uploadedAt: new Date(),
        };
        return { ...app, documents: [...(app.documents || []), newDoc], updatedAt: new Date() };
      })
    );
    try {
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, action: "ADD_EXTRA_DOC", type, url, name }),
      }).catch((e) => console.warn("API sync error:", e));
    } catch (e) {}
  };

  const deleteApplication = (appId: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    const appNum = targetApp?.applicationNumber;

    // 1. Remove from state immediately
    setApplications((prev) => prev.filter((app) => app.id !== appId && app.applicationNumber !== appId));

    // 2. Track deleted ID in state and tombstone localStorage (Context7 principle)
    setDeletedIds((prev) => {
      const updated = Array.from(new Set([...prev, appId, ...(appNum ? [appNum] : [])]));
      try {
        localStorage.setItem(DELETED_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Delete from backend DB via API
    try {
      fetch(`/api/applications?id=${appId}`, {
        method: "DELETE",
      }).catch((e) => console.warn("API delete error:", e));
    } catch (e) {}
  };

  const addApplication = (newApp: ApplicationWithDetails) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const resetToSampleData = () => {
    setApplications(INITIAL_SAMPLE_APPLICATIONS);
    setDeletedIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DELETED_KEY);
    } catch (e) {}
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        updateApplication,
        toggleDocVerification,
        rejectDocument,
        replaceDocument,
        addExtraDocument,
        deleteApplication,
        addApplication,
        resetToSampleData,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplicationContext() {
  const context = React.useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplicationContext must be used within an ApplicationProvider");
  }
  return context;
}
