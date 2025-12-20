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
        <div className="absolute top-[101px] right-[41px] flex flex-col  pointer-events-auto">
          <div className="w-[50px] h-[50px] flex items-center justify-center border border-white bg-black">
            <i className="ri-donut-chart-fill text-white/70 text-2xl" />
          </div>

          {[
            {
              icon: "ri-instagram-line",
              link: "https://www.instagram.com/spherehive?igsh=YmdwNjViZDlvcHZp",
            },
            { icon: "ri-global-line", link: "https://spherehive.in/" },
            {
              icon: "ri-linkedin-fill",
              link: "https://www.linkedin.com/company/spherehive/",
            },
            { icon: "ri-twitter-x-fill", link: "https://twitter.com" },
          ].map(({ icon, link }, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="group w-[50px] h-[50px] flex items-center justify-center border border-white bg-black transition-all duration-300 hover:bg-white cursor-pointer relative">
                <i
                  className={`${icon} text-white/70 text-2xl transition-colors duration-300 group-hover:text-black relative z-10`}
                />
              </div>
            </a>
          ))}
        </div>

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
    </>
  );
}
