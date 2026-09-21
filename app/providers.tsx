"use client";

import * as React from "react";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { ApplicationProvider } from "@/lib/context/application-context";
import { AdmissionsProvider } from "@/lib/admissions";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AdmissionsProvider>
        <ApplicationProvider>{children}</ApplicationProvider>
      </AdmissionsProvider>
    </LanguageProvider>
  );
}
