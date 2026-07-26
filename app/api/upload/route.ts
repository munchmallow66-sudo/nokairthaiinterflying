import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { message: "Thai Inter Flying Cloudinary Upload API. Use POST method with formData." },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "payment_slips";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let secureUrl = "";
    let publicId = "";

    try {
      // 1. Upload directly to Cloudinary CDN
      const result = await uploadToCloudinary(buffer, `tif_cadet_${type}`, "auto");
      secureUrl = result.url;
      publicId = result.public_id;
    } catch (cloudinaryErr) {
      console.warn("Cloudinary direct upload fallback to Data URL:", cloudinaryErr);
      const base64Str = buffer.toString("base64");
      const mimeType = file.type || "image/png";
      secureUrl = `data:${mimeType};base64,${base64Str}`;
      publicId = `tif_local_${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      secureUrl: secureUrl,
      publicId: publicId,
      originalName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
