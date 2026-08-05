import { NextResponse } from "next/server";
import JSZip from "jszip";
import jsPDF from "jspdf";

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
  try {
    const body = await req.json();
    const { documents, appNumber = "TIF-Doc", studentName = "Cadet" } = body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: "No documents provided" }, { status: 400 });
    }

    const zip = new JSZip();
    const cleanAppNum = (appNumber || "TIF-Doc").replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanName = (studentName || "Cadet").trim().replace(/[^a-zA-Z0-9\u0E00-\u0E7F_-]/g, "_");
    const zipName = `${cleanAppNum}_${cleanName}_Documents`;
    const folder = zip.folder(zipName) || zip;

    let addedCount = 0;

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
          const parts = rawUrl.split(",");
          const mimeType = parts[0];
          const base64Data = parts[1];

          if (base64Data) {
            if (mimeType.includes("image/")) {
              // Convert base64 image to real PDF document
              const imgBuffer = Buffer.from(base64Data, "base64");
              const pdfBuffer = convertImageToPdfBuffer(imgBuffer);
              folder.file(fileName, pdfBuffer);
            } else {
              folder.file(fileName, base64Data, { base64: true });
            }
            addedCount++;
          }
        } else {
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
                const arrayBuffer = await res.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

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
