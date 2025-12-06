export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0A090F]">
      {/* Vertical Lines */}
      <div className="absolute inset-0 px-[90px] flex justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-px h-full bg-white/10" />
        ))}
      </div>

      {/* SH logo box at top-left */}
      <div className="absolute top-[101px] left-[41px] w-[50px] h-[50px] border border-white ">
        <img
          src="/assets/logo.png"
          alt="SphereHive-Logo"
          width={80}
          height={80}
        />
      </div>

      {/* SH Social Icons at top-right */}
      <div className="sh-social absolute top-[101px] right-[41px] flex flex-col">
        {/* Main menu icon (NO hover) */}
        <div
          className="w-[50px] h-[50px] flex items-center justify-center
                    border border-white bg-black"
        >
          <i className="ri-donut-chart-fill text-white/70 text-2xl" />
        </div>

        {/* Social icons with DIFFERENT links */}
        {[
          {
            icon: "ri-instagram-line",
            link: "https://www.instagram.com/spherehive?igsh=YmdwNjViZDlvcHZp",
          },
          {
            icon: "ri-global-line",
            link: "https://spherehive.in/",
          },
          {
            icon: "ri-linkedin-fill",
            link: "https://www.linkedin.com/company/spherehive/",
          },
          {
            icon: "ri-twitter-x-fill",
            link: "https://twitter.com",
          },
        ].map(({ icon, link }, i) => (
          <a
            key={i}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <div
              className="group w-[50px] h-[50px] flex items-center justify-center
                   border border-white bg-black
                   transition-all duration-300
                   hover:bg-white"
            >
              <i
                className={`${icon} text-white/70 text-2xl
                      transition-all duration-300
                      group-hover:text-black`}
              />
            </div>
          </a>
        ))}
      </div>

      {/* Horizontal Lines */}
      <div className="roll-txt top-[150px] left-[90px]">
        <div className="absolute top-[150px] left-[90px] right-[90px] border-t border-white/15" />
        {/* Horizontal line with paired vertical boxes */}
        <div className="relative mt-[150px] mx-[90px]">
          {/* LEFT vertical pair */}
          <div className="absolute top-[19px] left-[19px] flex flex-col gap-[180px]">
            <div className="w-[15px] h-[15px] bg-orange-500" />
            <div className="w-[15px] h-[15px] bg-orange-500" />
          </div>

          {/* RIGHT vertical pair (in front of the first) */}
          <div className="absolute top-[19px] right-[19px] flex flex-col gap-[180px]">
            <div className="w-[15px] h-[15px] bg-orange-500" />
            <div className="w-[15px] h-[15px]  bg-orange-500" />
          </div>
        </div>

        {/* Bottom line */}
        <div className="absolute top-[400px] left-[90px] right-[90px] border-t border-white/15" />
      </div>
    </div>
  );
}
