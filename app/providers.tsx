"use client";

import * as React from "react";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { ApplicationProvider } from "@/lib/context/application-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ApplicationProvider>{children}</ApplicationProvider>
    </LanguageProvider>
  );
}
