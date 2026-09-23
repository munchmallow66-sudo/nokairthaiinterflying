import { NextResponse } from "next/server";
import JSZip from "jszip";
import jsPDF from "jspdf";
import { isAdminRequest } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function convertImageToPdfBuffer(imageBuffer: Buffer): Buffer {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const base64Img = imageBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64Img}`;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(dataUrl, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
  const arrayBuffer = pdf.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export async function GET() {
  return NextResponse.json(
    { message: "Thai Inter Flying Document ZIP API. Use POST method with documents array." },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateCheck = checkRateLimit(`zip_${getClientIp(req)}`, 3, 60 * 1000);
  if (!rateCheck.success) {
    return NextResponse.json({ error: "Too many ZIP requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { documents, appNumber = "TIF-Doc", studentName = "Cadet" } = body;

    if (!documents || !Array.isArray(documents) || documents.length === 0 || documents.length > 20) {
      return NextResponse.json({ error: "No documents provided" }, { status: 400 });
    }

    const zip = new JSZip();
    const cleanAppNum = (appNumber || "TIF-Doc").replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanName = (studentName || "Cadet").trim().replace(/[^a-zA-Z0-9\u0E00-\u0E7F_-]/g, "_");
    const zipName = `${cleanAppNum}_${cleanName}_Documents`;
    const folder = zip.folder(zipName) || zip;

    let addedCount = 0;
    let totalFetchedBytes = 0;
    const maxTotalBytes = 50 * 1024 * 1024;

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const rawUrl = doc.secureUrl || doc.url;
      if (!rawUrl) continue;

      // Force file extension in ZIP to always be .pdf
      let fileName = doc.originalName || `Document_${i + 1}.pdf`;
      if (!fileName.toLowerCase().endsWith(".pdf")) {
        fileName = fileName.replace(/(\.[a-zA-Z0-9]+)?$/, ".pdf");
      }

      try {
        if (rawUrl.startsWith("data:")) {
          const match = rawUrl.match(
            /^data:(image\/[a-zA-Z0-9.+-]+|application\/pdf);base64,([\s\S]+)$/
          );
          if (!match) continue;

          const estimatedBytes = Math.ceil((match[2].length * 3) / 4);
          if (estimatedBytes > 10 * 1024 * 1024 || totalFetchedBytes + estimatedBytes > maxTotalBytes) {
            continue;
          }

          const sourceBuffer = Buffer.from(match[2], "base64");
          totalFetchedBytes += sourceBuffer.length;
          const outputBuffer = match[1].startsWith("image/")
            ? convertImageToPdfBuffer(sourceBuffer)
            : sourceBuffer;
          folder.file(fileName, outputBuffer);
          addedCount++;
        } else {
          const parsedUrl = new URL(rawUrl);
          if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "res.cloudinary.com") {
            console.warn(`Skipped non-Cloudinary document URL: ${parsedUrl.hostname}`);
            continue;
          }
          // Attempt 1: Fetch raw PDF directly or via fl_attachment flag
          let pdfFetchedBuffer: Buffer | null = null;

          const urlsToTry: string[] = [];
          if (rawUrl.includes("cloudinary.com") && rawUrl.includes("/image/upload/")) {
            urlsToTry.push(rawUrl.replace("/image/upload/", "/image/upload/fl_attachment/"));
          }
          urlsToTry.push(rawUrl);

          for (const tryUrl of urlsToTry) {
            try {
              const res = await fetch(tryUrl, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                },
              });
              if (res.ok) {
                const contentType = res.headers.get("content-type") || "";
                const contentLength = Number(res.headers.get("content-length") || 0);
                if (contentLength > 10 * 1024 * 1024 || totalFetchedBytes + contentLength > maxTotalBytes) {
                  continue;
                }
                const arrayBuffer = await res.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                if (buffer.length > 10 * 1024 * 1024 || totalFetchedBytes + buffer.length > maxTotalBytes) {
                  continue;
                }
                totalFetchedBytes += buffer.length;

                if (contentType.includes("application/pdf") || buffer.toString("utf-8", 0, 4) === "%PDF") {
                  pdfFetchedBuffer = buffer;
                } else if (contentType.includes("image/") || rawUrl.toLowerCase().endsWith(".jpg") || rawUrl.toLowerCase().endsWith(".png")) {
                  // Valid image: convert to crisp PDF format
                  pdfFetchedBuffer = convertImageToPdfBuffer(buffer);
                } else {
                  pdfFetchedBuffer = buffer;
                }
                break;
              }
            } catch (e) {
              console.warn(`Attempt failed for ${tryUrl}:`, e);
            }
          }

          // Attempt 2: Fallback to rendered JPG from Cloudinary and package into valid PDF
          if (!pdfFetchedBuffer && rawUrl.includes("cloudinary.com")) {
            const jpgUrl = rawUrl.replace(/\.pdf$/i, ".jpg");
            try {
              const res = await fetch(jpgUrl);
              if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                const imgBuffer = Buffer.from(arrayBuffer);
                pdfFetchedBuffer = convertImageToPdfBuffer(imgBuffer);
              }
            } catch (e) {
              console.warn(`JPG fallback failed for ${jpgUrl}:`, e);
            }
          }

          if (pdfFetchedBuffer) {
            folder.file(fileName, pdfFetchedBuffer);
            addedCount++;
          }
        }
      } catch (fileErr) {
        console.error(`Failed to include file ${fileName} in zip:`, fileErr);
      }
    }

    if (addedCount === 0) {
      return NextResponse.json({ error: "Could not fetch any document files" }, { status: 404 });
    }

    const zipUint8Array = await zip.generateAsync({ type: "uint8array" });

    return new NextResponse(zipUint8Array.buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(zipName)}.zip"`,
        "Content-Length": zipUint8Array.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("ZIP Generation API Error:", error);
    return NextResponse.json({ error: "Failed to generate ZIP file: " + error.message }, { status: 500 });
  }
}
