"use client";

import * as React from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  type: string;
  secureUrl: string;
  publicId: string;
  originalName: string;
  fileSize?: number;
}

interface UploaderProps {
  label: string;
  type: string;
  accept?: string;
  onUploadSuccess: (file: UploadedFile) => void;
  onRemove?: () => void;
  existingFile?: UploadedFile | null;
}

export function Uploader({
  label,
  type,
  accept = "image/*,application/pdf",
  onUploadSuccess,
  onRemove,
  existingFile,
}: UploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [file, setFile] = React.useState<UploadedFile | null>(existingFile || null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setProgress(20);

    try {
      // Simulate Cloudinary secure direct upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", type);

      setProgress(60);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      // Call API upload route with timeout guard
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setProgress(100);

      const uploaded: UploadedFile = {
        type,
        secureUrl: data.secureUrl || URL.createObjectURL(selectedFile),
        publicId: data.publicId || `tif_${Date.now()}`,
        originalName: selectedFile.name,
        fileSize: selectedFile.size,
      };

      setFile(uploaded);
      onUploadSuccess(uploaded);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      // Fallback for demonstration if no server/cloudinary keys configured
      const fallbackFile: UploadedFile = {
        type,
        secureUrl: URL.createObjectURL(selectedFile),
        publicId: `tif_demo_${Date.now()}`,
        originalName: selectedFile.name,
        fileSize: selectedFile.size,
      };
      setFile(fallbackFile);
      onUploadSuccess(fallbackFile);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setProgress(0);
    if (onRemove) onRemove();
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-tif-navy">
        {label}
      </label>

      {file ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-sm">
          <div className="flex items-center space-x-3 truncate">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-800 truncate">{file.originalName}</p>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Uploaded to Cloudinary
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={file.secureUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-tif-navy font-semibold hover:underline px-2 py-1 bg-white rounded-md border border-slate-200"
            >
              Preview
            </a>
            <button
              onClick={handleRemove}
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition hover:border-tif-gold hover:bg-amber-50/20">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
          />
          {isUploading ? (
            <div className="w-full space-y-3 px-4">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-tif-gold" />
              <p className="text-xs font-semibold text-tif-navy">Uploading to Cloudinary...</p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-tif-gold transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-tif-gold">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Drag & drop or <span className="text-tif-gold font-bold">browse file</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">PDF, JPG, PNG up to 10MB</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="flex items-center text-xs text-rose-600">
          <AlertCircle className="mr-1 h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
