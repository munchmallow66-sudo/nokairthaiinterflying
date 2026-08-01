import { Plane, ShieldCheck, Award, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="pt-28 pb-16 space-y-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-tif-gold block">
          About Thai Inter Flying
        </span>
        <h1 className="text-4xl font-extrabold text-tif-navy font-display">
          Thailand&apos;s Elite Aviation Training Academy
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          Founded with a mission to produce high-precision commercial pilots, Thai Inter Flying delivers world-class flight training accredited by the Civil Aviation Authority of Thailand (CAAT).
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tif-navy text-tif-gold">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">CAAT Accreditation</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Approved Training Organization (ATO) compliant with ICAO standard safety & flight operational procedures.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tif-navy text-tif-gold">
            <Plane className="h-8 w-8 transform -rotate-45" />
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">Modern Fleet</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Equipped with Garmin G1000 Glass Cockpit Cessna 172 Skyhawks and Multi-Engine Diamond DA42 Twins.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tif-navy text-tif-gold">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-tif-navy font-display">Veteran Instructors</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Flight training led by former commercial airline captains from Airbus A320, A350, and Boeing 777 fleets.
          </p>
        </div>
      </div>
    </div>
  );
}
