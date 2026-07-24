"use client";

import { FullApplicationInput } from "@/schemas/application-schema";

export async function submitStudentApplication(formData: FullApplicationInput) {
  try {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to submit application");
    }

    return await res.json();
  } catch (error: any) {
    console.error("Submission action error:", error);
    throw error;
  }
}
