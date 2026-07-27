"use client";

import * as React from "react";
import { ApplicationWithDetails } from "@/types";

const STORAGE_KEY = "tif_global_applications_database_v2";

export const INITIAL_SAMPLE_APPLICATIONS: ApplicationWithDetails[] = [
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

const ApplicationContext = React.createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = React.useState<ApplicationWithDetails[]>(INITIAL_SAMPLE_APPLICATIONS);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // 1. Load persisted data from localStorage & fetch server database records on mount
  React.useEffect(() => {
    let initialApps = INITIAL_SAMPLE_APPLICATIONS;
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialApps = parsed;
          setApplications(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load global ApplicationContext cache:", err);
    } finally {
      setIsInitialized(true);
    }

    // Fetch real applications from server DB and merge
    fetch("/api/applications")
      .then((res) => (res.ok ? res.json() : []))
      .then((dbApps) => {
        if (Array.isArray(dbApps) && dbApps.length > 0) {
          setApplications((prev) => {
            const merged = [...prev];
            dbApps.forEach((dbApp: any) => {
              const exists = merged.some(
                (a) => a.id === dbApp.id || a.applicationNumber === dbApp.applicationNumber
              );
              if (!exists) {
                merged.unshift(dbApp);
              }
            });
            return merged;
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
  };

  const deleteApplication = (appId: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== appId));
  };

  const addApplication = (newApp: ApplicationWithDetails) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const resetToSampleData = () => {
    setApplications(INITIAL_SAMPLE_APPLICATIONS);
    try {
      localStorage.removeItem(STORAGE_KEY);
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
