import { NextResponse } from "next/server";
import { getAdmissionStatus } from "@/lib/admission-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const status = await getAdmissionStatus();
    const forceRefresh = new URL(req.url).searchParams.has("refresh");
    return NextResponse.json(
      { success: true, ...status },
      {
        headers: forceRefresh
          ? { "Cache-Control": "private, no-store" }
          : {
              "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
              "Vercel-CDN-Cache-Control": "public, max-age=60",
            },
      }
    );
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
