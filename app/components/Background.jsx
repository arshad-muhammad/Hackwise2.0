import Image from "next/image";

export default function Background() {
  return (
    <>
      {/* MAIN WRAPPER */}
      <div className="absolute w-full min-h-[500vh] bg-[#0A090F] -z-10 overflow-hidden">
        {/* Vertical Lines */}
        <div className="absolute inset-0 px-[90px] flex justify-between pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-px h-full bg-white/10" />
          ))}
        </div>

        {/* SH logo box */}
        <div className="absolute top-[101px] left-[41px] w-[50px] h-[50px] border border-white ">
          <Image
            src="/assets/logo.png"
            alt="SphereHive-Logo"
            width={50}
            height={50}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Social Icons */}

        {/* Horizontal Lines & Orange Squares */}
        <div className="absolute top-[150px] left-[90px] right-[90px] border-t border-white/15" />
        <div className="absolute top-[330px] left-[90px] right-[90px] border-t border-white/15" />

        <div className="absolute top-[170px] left-[110px] flex flex-col gap-[120px]">
          <div className="w-[11px] h-[11px] bg-orange-500" />
          <div className="w-[11px] h-[11px] bg-orange-500" />
        </div>

        <div className="absolute top-[170px] right-[110px] flex flex-col gap-[120px]">
          <div className="w-[11px] h-[11px] bg-orange-500" />
          <div className="w-[11px] h-[11px] bg-orange-500" />
        </div>
      </div>
      <div className="about">
        <div className="absolute top-190 left-[90px] right-[90px] border-t border-white/15" />

        <div className="absolute top-225 left-[90px] right-[90px] border-t border-white/15" />
      </div>
    </>
  );
}
