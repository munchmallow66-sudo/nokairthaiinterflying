"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Megaphone,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Bell,
  X,
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useLanguage } from "@/lib/i18n/language-context";

interface Announcement {
  id: string;
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  badge?: string | null;
  type: "TEXT" | "IMAGE" | "HYBRID";
  isActive: boolean;
  priority: number;
  createdAt: string;
}

export function AnnouncementSection() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        const data = await res.json();
        if (data.success && Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements);
        }
      } catch (err) {
        console.error("Failed to load homepage announcements:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, []);

  if (loading || announcements.length === 0) {
    return null; // Gracefully hidden when no active announcements exist
  }

  return (
    <section className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      <ScrollReveal direction="up" distance={30}>
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
          {/* Subtle decorative background glow */}
          <div className="ambient-orb absolute top-0 right-0 -mt-28 -mr-28 w-[32rem] h-[32rem] bg-[radial-gradient(closest-side,rgba(200,162,74,0.10),transparent_100%)]" />
          <div className="ambient-orb absolute bottom-0 left-0 -mb-28 -ml-28 w-[32rem] h-[32rem] bg-[radial-gradient(closest-side,rgba(59,130,246,0.10),transparent_100%)]" />

          {/* Section Header */}
          <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-tif-gold/10 border border-tif-gold/30 text-tif-gold flex items-center justify-center shadow-inner">
                <Megaphone className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
                  {t("announcementSectionTitle")}
                  <Sparkles className="h-4 w-4 text-tif-gold" />
                </h2>
                <p className="text-xs text-slate-400">
                  {t("announcementSectionSub")}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-tif-gold/10 text-tif-gold border border-tif-gold/30">
              {announcements.length} {t("latestAnnouncementsCount")}
            </span>
          </div>

          {/* Announcements Grid / List */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((item) => {
              const isImageOnly = item.type === "IMAGE" && item.imageUrl;

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-tif-gold/50 transition-all duration-300 overflow-hidden shadow-xl hover:-translate-y-1"
                >
                  <div>
                    {/* Image Banner Display */}
                    {item.imageUrl && (
                      <div
                        className="relative h-48 sm:h-52 w-full overflow-hidden cursor-pointer bg-slate-900"
                        onClick={() => setSelectedImage(item.imageUrl || null)}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        {item.badge && (
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-tif-gold text-tif-navyDark shadow-md">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content Section */}
                    {!isImageOnly && (
                      <div className="p-5 space-y-2.5">
                        {!item.imageUrl && item.badge && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-tif-gold/10 text-tif-gold border border-tif-gold/30 mb-1">
                            {item.badge}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-white font-display group-hover:text-tif-gold transition-colors leading-snug">
                          {item.title}
                        </h3>
                        {item.content && (
                          <p className="text-xs text-slate-300 leading-relaxed line-clamp-4 font-light">
                            {item.content}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Action Button */}
                  {item.linkUrl && (
                    <div className="p-4 bg-slate-950/90 border-t border-slate-800/60 mt-auto">
                      <a
                        href={item.linkUrl}
                        target={item.linkUrl.startsWith("http") ? "_blank" : "_self"}
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-tif-navyDark bg-tif-gold hover:bg-tif-goldHover transition shadow-md group/btn"
                      >
                        <span>{t("readMoreBtn")}</span>
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 p-2 shadow-2xl border border-slate-800">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:text-tif-gold border border-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Announcement full size preview"
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
