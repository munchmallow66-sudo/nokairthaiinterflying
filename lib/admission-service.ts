import { getPrisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export interface AdmissionStatusResult {
  isOpen: boolean;
  quota: number | null;
  acceptedCount: number;
  remaining: number | null;
  openedAt: Date | null;
  closedAt: Date | null;
}

export class QuotaExceededError extends Error {
  constructor(message = "ขออภัย โควตารับสมัครเต็มแล้ว ระบบปิดรับสมัครเรียบร้อยแล้ว") {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export class AdmissionsClosedError extends Error {
  constructor(message = "ขณะนี้ปิดรับสมัครแล้ว / Admissions are currently closed.") {
    super(message);
    this.name = "AdmissionsClosedError";
  }
}

/**
 * Fetch or initialize the singleton admission setting row from the database.
 */
export async function getAdmissionSetting() {
  const prisma = getPrisma();
  try {
    let setting = await prisma.admissionSetting.findUnique({
      where: { id: "default" },
    });

    if (!setting) {
      const defaultIsOpen = process.env.NEXT_PUBLIC_ADMISSIONS_OPEN === "true";
      setting = await prisma.admissionSetting.create({
        data: {
          id: "default",
          isOpen: defaultIsOpen,
          quota: 1,
          acceptedCount: 0,
          openedAt: defaultIsOpen ? new Date() : null,
        },
      });
    }

    return setting;
  } catch (error) {
    console.error("Failed to query admissionSetting from DB:", error);
    return {
      id: "default",
      isOpen: process.env.NEXT_PUBLIC_ADMISSIONS_OPEN === "true",
      quota: 1,
      acceptedCount: 0,
      openedAt: null,
      closedAt: null,
      updatedAt: new Date(),
    };
  }
}

/**
 * Get the current real-time admission status for public and admin consumers.
 */
export async function getAdmissionStatus(): Promise<AdmissionStatusResult> {
  const setting = await getAdmissionSetting();

  const isEffectivelyOpen =
    Boolean(setting.isOpen) &&
    (setting.quota === null || setting.acceptedCount < setting.quota);

  const remaining =
    setting.quota !== null
      ? Math.max(0, setting.quota - setting.acceptedCount)
      : null;

  return {
    isOpen: isEffectivelyOpen,
    quota: setting.quota,
    acceptedCount: setting.acceptedCount,
    remaining,
    openedAt: setting.openedAt,
    closedAt: setting.closedAt,
  };
}

/**
 * Open admissions with a specific quota (default = 1). Resets accepted count for the new round.
 */
export async function openAdmissions(quota: number | null = 1) {
  const prisma = getPrisma();
  const now = new Date();

  return await prisma.admissionSetting.upsert({
    where: { id: "default" },
    update: {
      isOpen: true,
      quota,
      acceptedCount: 0,
      openedAt: now,
      closedAt: null,
    },
    create: {
      id: "default",
      isOpen: true,
      quota,
      acceptedCount: 0,
      openedAt: now,
      closedAt: null,
    },
  });
}

/**
 * Manually close admissions immediately.
 */
export async function closeAdmissions() {
  const prisma = getPrisma();
  const now = new Date();

  return await prisma.admissionSetting.upsert({
    where: { id: "default" },
    update: {
      isOpen: false,
      closedAt: now,
    },
    create: {
      id: "default",
      isOpen: false,
      quota: 1,
      acceptedCount: 0,
      closedAt: now,
    },
  });
}

/**
 * Atomically check and consume 1 quota slot inside a Prisma transaction.
 * If quota is filled or closed, throws an error to abort transaction.
 * If this application fills the quota, automatically sets isOpen = false and closedAt = now.
 */
export async function checkAndConsumeAdmissionQuota(tx: Prisma.TransactionClient) {
  let setting = await tx.admissionSetting.findUnique({
    where: { id: "default" },
  });

  if (!setting) {
    const defaultIsOpen = process.env.NEXT_PUBLIC_ADMISSIONS_OPEN === "true";
    setting = await tx.admissionSetting.create({
      data: {
        id: "default",
        isOpen: defaultIsOpen,
        quota: 1,
        acceptedCount: 0,
        openedAt: defaultIsOpen ? new Date() : null,
      },
    });
  }

  // Check if system is open
  if (!setting.isOpen) {
    throw new AdmissionsClosedError();
  }

  // Check quota limit
  if (setting.quota !== null && setting.acceptedCount >= setting.quota) {
    // If not marked closed yet, close it now
    await tx.admissionSetting.update({
      where: { id: "default" },
      data: { isOpen: false, closedAt: new Date() },
    });
    throw new QuotaExceededError(
      `ขออภัย โควตารับสมัครเต็มแล้ว (รับครบ ${setting.quota} ท่านแล้ว) ระบบปิดรับสมัครเรียบร้อยแล้ว`
    );
  }

  const nextAcceptedCount = setting.acceptedCount + 1;
  const isNowFull = setting.quota !== null && nextAcceptedCount >= setting.quota;

  // Increment acceptedCount and auto-close if quota met
  await tx.admissionSetting.update({
    where: { id: "default" },
    data: {
      acceptedCount: nextAcceptedCount,
      isOpen: isNowFull ? false : setting.isOpen,
      closedAt: isNowFull ? new Date() : setting.closedAt,
    },
  });

  return {
    acceptedCount: nextAcceptedCount,
    isNowFull,
    quota: setting.quota,
  };
}
