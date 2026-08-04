"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { TranslationKey } from "@/lib/i18n/translations";

interface GalleryItem {
  titleKey: TranslationKey;
  catKey: TranslationKey;
  img: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    titleKey: "galTitle1",
    catKey: "galCatAircraft",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleKey: "galTitle2",
    catKey: "galCatMulti",
    img: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleKey: "galTitle3",
    catKey: "galCatSim",
    img: "https://images.unsplash.com/photo-1519074069444-1ba4e479a0b1?auto=format&fit=crop&w=800&q=80",
  },
  {
    titleKey: "galTitle4",
    catKey: "galCatCadets",
    img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
  },
];

export default function GalleryPage() {
  const { t } = useLanguage();

  return (
    <div className="pt-28 pb-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
          {t("galleryEyebrow")}
        </span>
        <h1 className="text-4xl font-extrabold text-tif-navy font-display">
          {t("galleryTitle")}
        </h1>
        <p className="text-slate-600">
          {t("galleryDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {GALLERY_ITEMS.map((item, idx) => (
          <div key={idx} className="glass-card rounded-2xl overflow-hidden group">
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              <img
                src={item.img}
                alt={t(item.titleKey)}
                className="h-full w-full object-cover group-hover:scale-110 transition duration-300 opacity-90"
              />
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold text-tif-gold uppercase">{t(item.catKey)}</span>
              <h4 className="text-sm font-bold text-tif-navy font-display mt-1">{t(item.titleKey)}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

