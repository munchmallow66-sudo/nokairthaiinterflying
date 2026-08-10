"use client";

import * as React from "react";
import { ApplicationWithDetails } from "@/types";

const STORAGE_KEY = "tif_global_applications_database_v2";

export const INITIAL_SAMPLE_APPLICATIONS: ApplicationWithDetails[] = [
  {
    id: "app-3939",
    applicationNumber: "TIF-2026-3939",
    password: "A!o165",
    branch: "Bangkok Headquarters",
    preferredStartDate: new Date("2026-09-01"),
    status: "SUBMITTED",
    joinOpenHouse: false,
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
    joinOpenHouse: true,
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
    joinOpenHouse: false,
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
    joinOpenHouse: true,
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
    joinOpenHouse: true,
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
  announceRejection: (
    appId: string,
    stage: "WRITTEN_EXAM" | "INTERVIEW",
    message: string,
    note: any,
    extraFields?: Partial<ApplicationWithDetails>
  ) => void;
  toggleDocVerification: (appId: string, docId: string, verifiedStatus: boolean) => void;
  rejectDocument: (appId: string, docId: string, reason: string) => void;
  replaceDocument: (appId: string, docId: string, newUrl: string, newName?: string) => void;
  addExtraDocument: (appId: string, type: string, url: string, name: string) => void;
  deleteDocument: (appId: string, docId: string) => void;
  verifyAllDocuments: (appId: string) => void;
  deleteApplication: (appId: string) => Promise<void>;
  addApplication: (newApp: ApplicationWithDetails) => void;
  resetToSampleData: () => void;
}

// Deletes used to be recorded here as a per-device tombstone list and filtered
// out at load time, which meant a delete only ever "took" in the browser that
// performed it. The DB is now the sole authority on what exists; the key is
// only referenced to clear it off clients that still carry one, since a stale
// tombstone would keep hiding applications that are still live.
const LEGACY_DELETED_KEY = "tif_deleted_application_ids_v1";

const ApplicationContext = React.createContext<ApplicationContextType | undefined>(undefined);

/**
 * Overlays local edits onto the authoritative server list. Rows are keyed off
 * the server response alone: an application the server does not return no
 * longer exists, so it must not survive the merge. (Re-adding local-only rows
 * here is what used to resurrect deleted applications after a refetch.)
 */
function mergeWithServer(
  prev: ApplicationWithDetails[],
  dbApps: any[]
): ApplicationWithDetails[] {
  const prevMap = new Map<string, any>();
  prev.forEach((app) => {
    if (app.id) prevMap.set(app.id, app);
    if (app.applicationNumber) prevMap.set(app.applicationNumber, app);
  });

  return dbApps.map((dbApp: any) => {
    const localApp = prevMap.get(dbApp.id) || prevMap.get(dbApp.applicationNumber);
    if (!localApp) return dbApp;

    return {
      ...dbApp,
      ...localApp,
      // The DB is the authority on the tracking password — it is what
      // /api/track verifies against. Local only fills in for a row the server
      // has no password for (a just-submitted app on the applicant's own
      // browser), otherwise a cache written while the column was still NULL
      // would keep shadowing the real value in the admin panel.
      password: dbApp.password || localApp.password || null,
      joinOpenHouse: localApp.joinOpenHouse !== undefined ? localApp.joinOpenHouse : dbApp.joinOpenHouse,
      remarks: localApp.remarks || dbApp.remarks,
      status: localApp.status || dbApp.status,
      documents: localApp.documents && localApp.documents.length > 0 ? localApp.documents : dbApp.documents,
      payments: localApp.payments && localApp.payments.length > 0 ? localApp.payments : dbApp.payments,
    };
  });
}

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = React.useState<ApplicationWithDetails[]>([]);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Re-reads the authoritative list. Throws on a bad response so callers can
  // tell "the server says this list is empty" apart from "the server did not
  // answer" — only the former may clear rows off the screen.
  const refetchApplications = React.useCallback(async () => {
    const res = await fetch("/api/applications");
    if (!res.ok) {
      throw new Error(`Failed to load applications (${res.status})`);
    }
    const dbApps = await res.json();
    if (!Array.isArray(dbApps)) {
      throw new Error("Unexpected applications payload from server");
    }
    setApplications((prev) => mergeWithServer(prev, dbApps));
  }, []);

  // 1. Clear legacy tombstones, load the local cache, then sync with Server DB
  React.useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_DELETED_KEY);
    } catch (e) {}

    // Load initial local cache while fetching server
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData !== null) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApplications(parsed);
        } else {
          setApplications(INITIAL_SAMPLE_APPLICATIONS);
        }
      } else {
        setApplications(INITIAL_SAMPLE_APPLICATIONS);
      }
    } catch (err) {
      setApplications(INITIAL_SAMPLE_APPLICATIONS);
    }
    setIsInitialized(true);

    refetchApplications().catch((err) =>
      console.warn("Failed to fetch applications from DB:", err)
    );
  }, [refetchApplications]);

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
    if (!appId) return;
    const cleanId = appId.trim().toLowerCase();
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId ||
        app.applicationNumber === appId ||
        (app.id && app.id.toLowerCase() === cleanId) ||
        (app.applicationNumber && app.applicationNumber.toLowerCase() === cleanId)
          ? { ...app, ...updatedFields, updatedAt: new Date() }
          : app
      )
    );
    try {
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, ...updatedFields }),
      }).catch((e) => console.warn("API sync error:", e));
    } catch (e) {}
  };

  // A step 8 (written exam) rejection is announced as step 9, and a step 10
  // (interview) rejection as step 11. Kept separate from updateApplication so
  // the ANNOUNCE_REJECTION action reaches the API without leaking into the
  // local application object, and so the consolation email fires exactly once.
  const announceRejection = (
    appId: string,
    stage: "WRITTEN_EXAM" | "INTERVIEW",
    message: string,
    note: any,
    extraFields?: Partial<ApplicationWithDetails>
  ) => {
    if (!appId) return;
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId || app.applicationNumber === appId
          ? {
              ...app,
              ...extraFields,
              status: "REJECTED" as any,
              remarks: message,
              adminNotes: [note, ...(app.adminNotes || [])],
              updatedAt: new Date(),
            }
          : app
      )
    );
    try {
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: appId,
          ...extraFields,
          status: "REJECTED",
          remarks: message,
          adminNotes: [note],
          action: "ANNOUNCE_REJECTION",
          stage,
        }),
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
    const targetApp = applications.find((a) => a.id === appId);
    const targetDoc = targetApp?.documents?.find((d) => d.id === docId);
    const newNote = {
      id: `note_${Date.now()}`,
      content: `[แจ้งเอกสารผิด]: ปฏิเสธเอกสาร "${targetDoc?.originalName || docId}" - เหตุผล: ${reason}`,
      createdAt: new Date(),
      author: {
        name: "Admin Officer",
        email: "admin@tif.ac.th",
      },
    };

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const updatedDocs = app.documents?.map((d) =>
          d.id === docId ? { ...d, isVerified: false, isRejected: true, rejectReason: reason } : d
        );

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
        body: JSON.stringify({
          id: appId,
          status: "WAITING_DOCUMENTS",
          action: "REJECT_DOC",
          docId,
          reason,
          adminNotes: [newNote],
        }),
      }).catch((e) => console.warn("API sync error:", e));
    } catch (e) {}
  };

  const deleteDocument = (appId: string, docId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          documents: (app.documents || []).filter((d) => d.id !== docId),
          updatedAt: new Date(),
        };
      })
    );
    try {
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, action: "DELETE_DOC", docId }),
      }).catch((e) => console.warn("API sync error:", e));
    } catch (e) {}
  };

  const verifyAllDocuments = (appId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          documents: (app.documents || []).map((d) => ({
            ...d,
            isVerified: true,
            isRejected: false,
            rejectReason: undefined,
          })),
          updatedAt: new Date(),
        };
      })
    );
    try {
      fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, action: "VERIFY_ALL_DOCS" }),
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

  // Rejects if the application is still in the DB afterwards. Callers must let
  // that rejection surface rather than reporting success, otherwise the admin
  // is told a row is gone while every other browser still loads it.
  const deleteApplication = async (appId: string) => {
    if (!appId) throw new Error("Missing application id");

    // Snapshot before the optimistic removal so a failed delete can be undone.
    const snapshot = applications;
    setApplications((prev) => prev.filter((app) => app.id !== appId && app.applicationNumber !== appId));

    try {
      const res = await fetch(`/api/applications?id=${encodeURIComponent(appId)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.error || `Delete failed with status ${res.status}`);
      }
    } catch (err) {
      setApplications(snapshot);
      throw err;
    }

    // Re-read rather than trusting the optimistic removal, so the list matches
    // what other browsers will load.
    try {
      await refetchApplications();
    } catch (err) {
      // The delete itself is confirmed; only the follow-up read failed, so the
      // list may be marginally stale until the next load.
      console.warn("Applications refetch after delete failed:", err);
    }
  };

  const addApplication = (newApp: ApplicationWithDetails) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const resetToSampleData = () => {
    setApplications(INITIAL_SAMPLE_APPLICATIONS);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_DELETED_KEY);
    } catch (e) {}
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        updateApplication,
        announceRejection,
        toggleDocVerification,
        rejectDocument,
        replaceDocument,
        addExtraDocument,
        deleteDocument,
        verifyAllDocuments,
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
