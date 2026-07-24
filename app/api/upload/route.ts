import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    { message: "Thai Inter Flying Upload API. Use POST method with formData." },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate simulated Cloudinary payload response
    const publicId = `tif_cloudinary_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const mockSecureUrl = `https://res.cloudinary.com/tif-aviation/image/upload/v${Date.now()}/documents/${type}_${file.name.replace(/\s+/g, "_")}`;

    return NextResponse.json({
      success: true,
      secureUrl: mockSecureUrl,
      publicId: publicId,
      originalName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
