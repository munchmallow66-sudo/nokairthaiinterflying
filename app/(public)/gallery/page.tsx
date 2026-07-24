import Image from "next/image";

const GALLERY_ITEMS = [
  {
    title: "Cessna 172 Skyhawk Glass Cockpit",
    category: "Aircraft Fleet",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Diamond DA42 Twin-Engine",
    category: "Multi-Engine Fleet",
    img: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "FNPT II Full Flight Simulator",
    category: "Simulators",
    img: "https://images.unsplash.com/photo-1519074069444-1ba4e479a0b1?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Solo Flight Graduation Ceremony",
    category: "Cadets",
    img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
  },
];

export default function GalleryPage() {
  return (
    <div className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
          Fleet & Campus
        </span>
        <h1 className="text-4xl font-extrabold text-tif-navy font-display">
          Academy Photo Gallery
        </h1>
        <p className="text-slate-600">
          Experience flight training facilities, training aircraft, flight simulators, and student life at TIF.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {GALLERY_ITEMS.map((item, idx) => (
          <div key={idx} className="glass-card rounded-2xl overflow-hidden group">
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              <img
                src={item.img}
                alt={item.title}
                className="h-full w-full object-cover group-hover:scale-110 transition duration-300 opacity-90"
              />
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold text-tif-gold uppercase">{item.category}</span>
              <h4 className="text-sm font-bold text-tif-navy font-display mt-1">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
