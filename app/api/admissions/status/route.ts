import { NextResponse } from "next/server";
import { getAdmissionStatus } from "@/lib/admission-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const status = await getAdmissionStatus();
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    console.error("Failed to fetch admission status:", error);
    return NextResponse.json(
      {
        success: false,
        isOpen: process.env.NEXT_PUBLIC_ADMISSIONS_OPEN === "true",
        quota: 1,
        acceptedCount: 0,
        remaining: 0,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
