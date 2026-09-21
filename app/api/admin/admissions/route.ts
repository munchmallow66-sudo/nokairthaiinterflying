import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "@/lib/auth";
import {
  getAdmissionSetting,
  getAdmissionStatus,
  openAdmissions,
  closeAdmissions,
} from "@/lib/admission-service";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  return sessionToken ? await verifyAdminSessionToken(sessionToken) : null;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const setting = await getAdmissionSetting();
    const status = await getAdmissionStatus();
    return NextResponse.json({
      success: true,
      setting,
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admission setting" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, quota } = body;

    let updatedSetting;
    if (action === "open") {
      const quotaNum = quota !== undefined && quota !== null ? Math.max(1, Number(quota)) : 1;
      updatedSetting = await openAdmissions(quotaNum);
    } else if (action === "close") {
      updatedSetting = await closeAdmissions();
    } else {
      return NextResponse.json(
        { error: "Invalid action. Expected 'open' or 'close'" },
        { status: 400 }
      );
    }

    // Optional audit log
    try {
      const prisma = getPrisma();
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: action === "open" ? "ADMISSION_OPENED" : "ADMISSION_CLOSED",
          resource: "AdmissionSetting",
          payload: JSON.stringify({ action, quota, updatedSetting }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation skipped:", auditErr);
    }

    const status = await getAdmissionStatus();
    return NextResponse.json({
      success: true,
      setting: updatedSetting,
      status,
    });
  } catch (error: any) {
    console.error("Failed to update admission status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update admission status" },
      { status: 500 }
    );
  }
}
