"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building2,
  Navigation,
  MessageCircle,
  Facebook,
  CheckCircle2,
  ArrowRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export default function ContactPage() {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    details: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({ name: "", phone: "", email: "", details: "" });
    setSubmitted(false);
  };

  const quickActions = [
    {
      icon: Phone,
      title: t("quickCallTitle"),
      sub: t("quickCallSub"),
      href: `tel:${t("phoneContact").replace(/\s/g, "")}`,
      value: t("phoneContact"),
      external: false,
    },
    {
      icon: Mail,
      title: t("quickEmailTitle"),
      sub: t("quickEmailSub"),
      href: `mailto:${t("emailContact")}`,
      value: t("emailContact"),
      external: false,
    },
    {
      icon: MapPin,
      title: t("quickVisitTitle"),
      sub: t("quickVisitSub"),
      href: "https://www.google.com/maps/place/Thai+Inter+Flying+:+Head+Office/@13.8714909,100.5625718,19.71z/data=!4m14!1m7!3m6!1s0x30e28335fa661691:0x1779548a71fbc777!2z4Lit4Liy4LiE4Liy4LijIOC4i-C4tS7guJ7guLUu4LiX4Liy4Lin4LmA4Lin4Lit4Lij4LmMIOC4meC4reC4o-C5jOC4mOC4m-C4suC4o-C5jOC4hA!8m2!3d13.871577!4d100.5627457!16s%2Fg%2F11f621x5fq!3m5!1s0x30e282d686362ca5:0xaeb72ec8119c4679!8m2!3d13.8716668!4d100.5627239!16s%2Fg%2F11dxmmdqgh",
      value: "Bangkok 10210",
      external: true,
    },
    {
      icon: Clock,
      title: t("quickHoursTitle"),
      sub: t("quickHoursSub"),
      href: "#office-hours",
      value: "08:30 - 17:30",
      external: false,
    },
  ];

  const contactDetails = [
    {
      icon: MapPin,
      label: t("campusLocationLabel"),
      value: t("headquartersAddress"),
    },
    {
      icon: Phone,
      label: t("hotlinePhoneLabel"),
      value: t("phoneContact"),
    },
    {
      icon: Mail,
      label: t("emailInquiryLabel"),
      value: t("emailContact"),
    },
    {
      icon: Clock,
      label: t("workingHoursLabel"),
      value: t("officeHours"),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f5f5f5] pb-20">
      {/* Hero Header Section */}
      <section className="relative bg-[#f5f5f5] pt-24 pb-12 lg:pt-28 lg:pb-16 overflow-hidden">
        {/* Background Radial Aviation Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-[#f5f5f5] to-[#f5f5f5] z-0 pointer-events-none" />

        {/* Animated Radar Circle BG Overlay */}
        <div className="absolute -right-32 -top-32 w-[600px] h-[600px] rounded-full border border-tif-navy/10 pointer-events-none animate-radar-sweep flex items-center justify-center">
          <div className="w-[450px] h-[450px] rounded-full border border-dashed border-tif-navy/15" />
          <div className="w-[300px] h-[300px] rounded-full border border-tif-navy/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-tif-gold shadow-[0_0_10px_#C8A24A]" />
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-tif-navy font-display tracking-tight mb-4">
            {t("contactPageTitle")}
          </h1>
          <p className="text-slate-600 text-base font-light leading-relaxed max-w-2xl mx-auto">
            {t("contactPageSub")}
          </p>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full -mt-6 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <a
                key={idx}
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noreferrer" : undefined}
                className="glass-card rounded-2xl p-5 border border-slate-200 hover:border-tif-gold/50 hover:shadow-luxury transition-all duration-300 group bg-white shadow-md flex flex-col space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-tif-navy text-tif-gold border border-tif-gold/30 group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  {action.external && (
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-tif-gold group-hover:translate-x-1 transition-all" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-tif-navy font-display">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {action.sub}
                  </p>
                  <p className="text-xs font-semibold text-tif-goldDark mt-1.5 truncate">
                    {action.value}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Main Content: Contact Info + Map (Left) & Form (Right) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Details + Map */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact Info Card */}
            <div className="glass-card rounded-3xl p-7 border border-slate-200 bg-white shadow-md space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="p-3 rounded-2xl bg-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-tif-navy font-display">
                    {t("contactInfoTitle")}
                  </h3>
                  <p className="text-xs text-tif-goldDark font-semibold">
                    {t("contactInfoSub")}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {contactDetails.map((detail, idx) => {
                  const Icon = detail.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-start space-x-4 group/item"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-tif-navy shrink-0 group-hover/item:border-tif-gold group-hover/item:bg-amber-50 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-tif-goldDark uppercase tracking-wider block mb-0.5">
                          {detail.label}
                        </span>
                        <span className="text-sm text-slate-700 leading-relaxed block font-medium">
                          {detail.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Social Connect */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-tif-navy uppercase tracking-wider mb-3">
                  {t("connectWithUs")}
                </p>
                <div className="flex space-x-3">
                  <a
                    href="https://line.me/R/ti/p/@225ytkzg"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Line</span>
                  </a>
                  <a
                    href="https://web.facebook.com/thaiinterflying"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Map Card */}
            <div className="glass-card rounded-3xl p-7 border border-slate-200 bg-white shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-tif-navy font-display">
                    {t("findUsTitle")}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl bg-tif-navy text-tif-gold border border-tif-gold/40">
                  <Navigation className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 h-80 bg-slate-100 shadow-inner">
                <iframe
                  src="https://www.google.com/maps?q=13.8716668,100.5627239&z=18&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Thai Inter Flying Academy Location"
                />
              </div>

              <a
                href="https://www.google.com/maps/place/Thai+Inter+Flying+:+Head+Office/@13.8714909,100.5625718,19.71z/data=!4m14!1m7!3m6!1s0x30e28335fa661691:0x1779548a71fbc777!2z4Lit4Liy4LiE4Liy4LijIOC4i-C4tS7guJ7guLUu4LiX4Liy4Lin4LmA4Lin4Lit4Lij4LmMIOC4meC4reC4o-C5jOC4mOC4m-C4suC4o-C5jOC4hA!8m2!3d13.871577!4d100.5627457!16s%2Fg%2F11f621x5fq!3m5!1s0x30e282d686362ca5:0xaeb72ec8119c4679!8m2!3d13.8716668!4d100.5627239!16s%2Fg%2F11dxmmdqgh"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 p-3 rounded-xl bg-slate-100 border border-slate-300 text-tif-navy text-xs font-bold hover:bg-tif-navy hover:text-white transition-colors"
              >
                <Navigation className="h-4 w-4" />
                <span>{t("getDirections")}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-3xl p-8 border border-slate-200 bg-white shadow-md space-y-6 relative overflow-hidden">
              {/* Decorative gradient corner */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-tif-gold/10 to-transparent rounded-full pointer-events-none" />

              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 relative">
                <div className="p-3 rounded-2xl bg-tif-navy text-tif-gold border border-tif-gold/40 shrink-0">
                  <Send className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-tif-navy font-display">
                    {t("sendInquiryTitle")}
                  </h3>
                  <p className="text-xs text-tif-goldDark font-semibold">
                    {t("sendInquirySub")}
                  </p>
                </div>
              </div>

              {submitted ? (
                /* Success State */
                <div className="py-12 text-center space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center animate-gold-pulse">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-extrabold text-tif-navy font-display">
                      {t("inquirySuccessTitle")}
                    </h4>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      {t("inquirySuccessDesc")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                    className="border-tif-navy/30 text-tif-navy hover:bg-tif-navy hover:text-white font-bold"
                  >
                    {t("sendAnotherInquiry")}
                  </Button>
                </div>
              ) : (
                /* Form State */
                <form onSubmit={handleSubmit} className="space-y-5 relative">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-tif-navy flex items-center">
                        <User className="h-3 w-3 mr-1.5 text-tif-gold" />
                        {t("yourNameLabel")}
                        <span className="text-rose-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Somchai Jaidee"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-tif-gold focus:ring-2 focus:ring-tif-gold/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-tif-navy flex items-center">
                        <Phone className="h-3 w-3 mr-1.5 text-tif-gold" />
                        {t("yourPhoneLabel")}
                        <span className="text-rose-500 ml-1">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="0812345678"
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-tif-gold focus:ring-2 focus:ring-tif-gold/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-tif-navy flex items-center">
                      <Mail className="h-3 w-3 mr-1.5 text-tif-gold" />
                      {t("yourEmailLabel")}
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="somchai@example.com"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-tif-gold focus:ring-2 focus:ring-tif-gold/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-tif-navy flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1.5 text-tif-gold" />
                      {t("inquiryDetailsLabel")}
                      <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.details}
                      onChange={(e) =>
                        setFormData({ ...formData, details: e.target.value })
                      }
                      placeholder="Type your inquiry details..."
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-tif-gold focus:ring-2 focus:ring-tif-gold/20 transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-slate-400 font-medium">
                      {t("formRequiredHint")}
                    </p>
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="font-bold shadow-gold relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <span>{t("submitInquiryButton")}</span>
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}