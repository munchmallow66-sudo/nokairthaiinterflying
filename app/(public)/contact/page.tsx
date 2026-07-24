"use client";

import { MapPin, Phone, Mail, Clock, Send, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 min-h-[calc(100vh-160px)] flex flex-col justify-center">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
          {t("contactPageTitle")}
        </h1>
        <p className="text-slate-300 text-base font-light leading-relaxed max-w-2xl mx-auto">
          {t("contactPageSub")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 glass-card-dark-glow rounded-3xl p-8 border border-tif-gold/30 shadow-2xl space-y-7 relative overflow-hidden group">
          <div className="flex items-center space-x-3 pb-5 border-b border-slate-700/60">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-tif-gold/30 to-tif-navy text-tif-gold border border-tif-gold/40 shadow-inner">
              <Building2 className="h-6 w-6 filter drop-shadow-[0_0_6px_rgba(200,162,74,0.5)]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white font-display">{t("academyCampusTitle")}</h3>
              <p className="text-xs text-tif-gold">Thai Inter Flying Aviation Academy</p>
            </div>
          </div>

          <div className="space-y-6 text-sm">
            <div className="flex items-start space-x-4 group/item">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-tif-gold/20 text-tif-gold shrink-0 group-hover/item:border-tif-gold transition-colors">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-tif-gold/80 uppercase tracking-wider block mb-0.5">Campus Location</span>
                <span className="text-slate-200 leading-relaxed block font-medium">{t("headquartersAddress")}</span>
              </div>
            </div>

            <div className="flex items-start space-x-4 group/item">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-tif-gold/20 text-tif-gold shrink-0 group-hover/item:border-tif-gold transition-colors">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-tif-gold/80 uppercase tracking-wider block mb-0.5">Hotline Phone</span>
                <span className="text-slate-200 font-medium block">{t("phoneContact")}</span>
              </div>
            </div>

            <div className="flex items-start space-x-4 group/item">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-tif-gold/20 text-tif-gold shrink-0 group-hover/item:border-tif-gold transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-tif-gold/80 uppercase tracking-wider block mb-0.5">Email Inquiry</span>
                <span className="text-slate-200 font-medium block">{t("emailContact")}</span>
              </div>
            </div>

            <div className="flex items-start space-x-4 group/item">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-tif-gold/20 text-tif-gold shrink-0 group-hover/item:border-tif-gold transition-colors">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-tif-gold/80 uppercase tracking-wider block mb-0.5">Working Hours</span>
                <span className="text-slate-200 font-medium block">{t("officeHours")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form Card */}
        <div className="lg:col-span-7 glass-card-dark-glow rounded-3xl p-8 border border-tif-gold/30 shadow-2xl space-y-6 relative group">
          <div className="pb-4 border-b border-slate-700/60">
            <h3 className="text-xl font-extrabold text-white font-display">{t("sendInquiryTitle")}</h3>
            <p className="text-xs text-slate-400 mt-1">Fill in the details below to request admission counseling.</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-tif-gold/90">{t("yourNameLabel")}</label>
                <input
                  type="text"
                  placeholder="Somchai Jaidee"
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-tif-gold focus:ring-1 focus:ring-tif-gold transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-tif-gold/90">{t("yourPhoneLabel")}</label>
                <input
                  type="text"
                  placeholder="0812345678"
                  className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-tif-gold focus:ring-1 focus:ring-tif-gold transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-tif-gold/90">{t("yourEmailLabel")}</label>
              <input
                type="email"
                placeholder="somchai@example.com"
                className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-tif-gold focus:ring-1 focus:ring-tif-gold transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-tif-gold/90">{t("inquiryDetailsLabel")}</label>
              <textarea
                rows={4}
                placeholder="Type your inquiry details..."
                className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-tif-gold focus:ring-1 focus:ring-tif-gold transition-all resize-none"
              />
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full font-bold shadow-[0_0_20px_rgba(200,162,74,0.3)] relative overflow-hidden group mt-2"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>{t("submitInquiryButton")}</span>
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
