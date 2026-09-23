"use client";

export interface DirectUploadResult {
  secureUrl: string;
  publicId: string;
  originalName: string;
  fileSize: number;
}

interface UploadSignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Upload directly from the browser to Cloudinary so file bytes bypass Vercel. */
export async function uploadFileToCloudinary(
  file: File,
  type: string,
  signal?: AbortSignal
): Promise<DirectUploadResult> {
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File size must be between 1 byte and 5MB");
  }

  const signatureRes = await fetch("/api/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }),
    signal,
  });
  const signed = (await signatureRes.json().catch(() => null)) as
    | (UploadSignatureResponse & { error?: string })
    | null;

  if (!signatureRes.ok || !signed?.signature) {
    throw new Error(signed?.error || "Unable to authorize upload");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("folder", signed.folder);
  formData.append("signature", signed.signature);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/auto/upload`,
    { method: "POST", body: formData, signal }
  );
  const uploaded = await uploadRes.json().catch(() => null);

  if (!uploadRes.ok || !uploaded?.secure_url || !uploaded?.public_id) {
    throw new Error(uploaded?.error?.message || "Cloudinary upload failed");
  }

  return {
    secureUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
    originalName: file.name,
    fileSize: file.size,
  };
}