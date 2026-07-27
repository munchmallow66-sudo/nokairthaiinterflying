import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { message: "Thai Inter Flying Cloudinary Upload API. Use POST method with formData or json." },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let fileBuffer: Buffer | null = null;
    let fileName = "document";
    let type = "documents";
    let fileSize = 0;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      type = (formData.get("type") as string) || "documents";

      if (file) {
        fileName = file.name;
        fileSize = file.size;
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      }
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      type = body.type || "documents";
      fileName = body.fileName || "document";
      if (body.base64) {
        const parts = body.base64.split(",");
        const base64Str = parts.length === 2 ? parts[1] : parts[0];
        fileBuffer = Buffer.from(base64Str, "base64");
        fileSize = fileBuffer.length;
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let secureUrl = "";
    let publicId = "";

    try {
      // Upload directly to Cloudinary CDN in dedicated folders per document type
      const folderName = `tif_cadet_${type.toLowerCase()}`;
      const result = await uploadToCloudinary(fileBuffer, folderName, "auto");
      secureUrl = result.url;
      publicId = result.public_id;
    } catch (cloudinaryErr: any) {
      console.warn("Cloudinary upload warning:", cloudinaryErr);
      const base64Str = fileBuffer.toString("base64");
      const mimeType = fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
      secureUrl = `data:${mimeType};base64,${base64Str}`;
      publicId = `tif_fallback_${Date.now()}`;
    }

    return NextResponse.json({
      success: true,
      secureUrl: secureUrl,
      publicId: publicId,
      originalName: fileName,
      fileSize: fileSize,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
