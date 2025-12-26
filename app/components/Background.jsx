import Image from "next/image";

export default function Background() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#0A090F] -z-50 pointer-events-none overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 w-full h-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 border-x border-white/5">
        <div className="h-full w-full flex justify-between">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-px h-full bg-white/5" />
          ))}
        </div>
      </div>

      {/* Floating Elements (Optional - kept minimal for cleanliness) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,26,0.1),transparent_50%)]" />
    </div>
  );
}
