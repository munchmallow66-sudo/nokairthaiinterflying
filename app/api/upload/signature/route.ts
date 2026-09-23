import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { UPLOADABLE_DOC_TYPES } from "@/lib/document-review";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const EXTRA_UPLOAD_TYPES = new Set(["ANNOUNCEMENTS", "APPLICATION_FEE_SLIP"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`upload_signature_${ip}`, 20, 60 * 1000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: `อัปโหลดไฟล์ถี่เกินไป กรุณารออีก ${rateCheck.resetInSeconds} วินาที` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const type = (body?.type || "").toString().trim().toUpperCase();
    const fileSize = Number(body?.fileSize || 0);
    const mimeType = (body?.mimeType || "").toString().toLowerCase();

    if (!UPLOADABLE_DOC_TYPES.has(type) && !EXTRA_UPLOAD_TYPES.has(type)) {
      return NextResponse.json({ error: "Unsupported upload type" }, { status: 400 });
    }
    if (type === "ANNOUNCEMENTS" && !(await isAdminRequest())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File size exceeds the 5MB limit" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary environment variables are incomplete");
      return NextResponse.json({ error: "Upload service is not configured" }, { status: 503 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder =
      type === "APPLICATION_FEE_SLIP"
        ? "tif_slips"
        : `tif_cadet_${type.toLowerCase()}`;
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      apiSecret
    );

    return NextResponse.json(
      { cloudName, apiKey, timestamp, folder, signature },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Upload signature error:", error);
    return NextResponse.json({ error: "Unable to authorize upload" }, { status: 500 });
  }
}