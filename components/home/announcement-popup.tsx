"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { X, Megaphone, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

export function AnnouncementPopup() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    async function fetchActiveAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        const data = await res.json();
        if (data.success && Array.isArray(data.announcements) && data.announcements.length > 0) {
          setAnnouncements(data.announcements);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Failed to load active popup announcements:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveAnnouncements();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!mounted || pathname !== "/" || loading || !isOpen || announcements.length === 0) {
    return null;
  }

  const currentItem = announcements[currentIndex];
  const isImageOnly = currentItem.type === "IMAGE" && Boolean(currentItem.imageUrl);

  const modalContent = isImageOnly ? (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Rectangular Sharp-Cornered Announcement Poster Modal Frame */}
      <div className="relative w-auto max-w-[580px] max-h-[72vh] bg-slate-900 border border-slate-700/80 rounded-none shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center">
        
        {/* Top Gold Shimmer Border Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-tif-gold to-transparent z-20" />

        {/* Close Button (กากบาทปิด X) */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close Announcement Popup"
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-slate-950/90 text-slate-300 hover:text-white hover:bg-rose-600/80 border border-slate-700 transition-all duration-200 shadow-xl group"
        >
          <X className="h-4.5 w-4.5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Image Display - Fits natural rectangular poster shape */}
        <div className="relative max-h-[72vh] w-auto overflow-hidden flex items-center justify-center bg-slate-950">
          {currentItem.linkUrl ? (
            <a
              href={currentItem.linkUrl}
              target={currentItem.linkUrl.startsWith("http") ? "_blank" : "_self"}
              rel="noreferrer"
              onClick={handleClose}
              className="block max-h-[72vh] w-auto text-center group cursor-pointer"
            >
              <img
                src={currentItem.imageUrl!}
                alt={currentItem.title || "Announcement"}
                className="max-h-[72vh] w-auto max-w-full object-contain mx-auto block group-hover:scale-[1.01] transition-transform duration-300"
              />
            </a>
          ) : (
            <img
              src={currentItem.imageUrl!}
              alt={currentItem.title || "Announcement"}
              className="max-h-[72vh] w-auto max-w-full object-contain mx-auto block"
            />
          )}
        </div>

        {/* Carousel dots if multiple announcements */}
        {announcements.length > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center items-center space-x-2 z-20">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-6 bg-tif-gold" : "w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}

        {/* Link button if link exists */}
        {currentItem.linkUrl && (
          <div className="absolute bottom-3 right-3 z-20 hidden sm:block">
            <a
              href={currentItem.linkUrl}
              target={currentItem.linkUrl.startsWith("http") ? "_blank" : "_self"}
              rel="noreferrer"
              onClick={handleClose}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[11px] font-extrabold text-tif-navyDark bg-tif-gold hover:bg-tif-goldHover transition shadow-xl group"
            >
              <span>ดูรายละเอียด</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        )}

      </div>
    </div>
  ) : (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Wide Horizontal (แนวยาว) Landscape Modal Card */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-none shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-300">
        
        {/* Top Gold Shimmer Border Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-tif-gold to-transparent z-20" />

        {/* Close Button (กากบาทปิด X) */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close Announcement Popup"
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-950/90 text-slate-300 hover:text-white hover:bg-rose-600/80 border border-slate-700 transition-all duration-200 shadow-xl group"
        >
          <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {/* Horizontal Split Grid (แนวยาว) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[320px] sm:min-h-[360px]">
          
          {/* Left Column (5/12): Image Banner / Visual Section */}
          <div className="lg:col-span-5 relative bg-slate-950 min-h-[200px] lg:min-h-full flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
            {currentItem.imageUrl ? (
              <>
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  className="w-full h-full object-cover object-center absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
                {currentItem.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-tif-gold text-tif-navyDark shadow-xl uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      {currentItem.badge}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="relative z-10 p-8 text-center space-y-3">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-tif-gold/10 border border-tif-gold/30 text-tif-gold flex items-center justify-center shadow-inner">
                  <Megaphone className="h-8 w-8 animate-bounce" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-tif-gold/20 text-tif-gold border border-tif-gold/40">
                  {currentItem.badge || "ประกาศสำคัญ"}
                </span>
                <p className="text-xs text-slate-400 font-mono">Thai Inter Flying Academy</p>
              </div>
            )}
          </div>

          {/* Right Column (7/12): Content & Actions Section */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-900/90 backdrop-blur-xl">
            
            {/* Header Badge & Title */}
            <div className="space-y-3 pr-8">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-tif-gold/10 text-tif-gold border border-tif-gold/30">
                  SPECIAL ANNOUNCEMENT
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-display tracking-tight leading-snug">
                {currentItem.title}
              </h2>

              {currentItem.content && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {currentItem.content}
                </p>
              )}
            </div>

            {/* Carousel navigation dots (if multiple items exist) */}
            {announcements.length > 1 && (
              <div className="flex items-center space-x-2 pt-2">
                {announcements.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "w-8 bg-tif-gold" : "w-2 bg-slate-700 hover:bg-slate-500"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition text-center"
              >
                ปิดหน้าต่าง (Close)
              </button>

              {currentItem.linkUrl ? (
                <a
                  href={currentItem.linkUrl}
                  target={currentItem.linkUrl.startsWith("http") ? "_blank" : "_self"}
                  rel="noreferrer"
                  onClick={handleClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-xs font-extrabold text-tif-navyDark bg-tif-gold hover:bg-tif-goldHover transition-all duration-200 shadow-lg shadow-tif-gold/10 hover:scale-[1.02] group"
                >
                  <span>ดูรายละเอียดเพิ่มเติม</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <Button
                  onClick={handleClose}
                  variant="gold"
                  size="sm"
                  className="w-full sm:w-auto font-bold px-6"
                >
                  รับทราบ
                </Button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
