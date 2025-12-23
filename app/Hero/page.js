import React from "react";
// import Partner from "../components/PartnersCarousel";
import NavBar from "../components/CardNav.jsx";
import DecryptedText from "../components/DecryptedText.jsx";

export default function Home() {
  const navItems = [
    {
      label: "About",
      bgColor: "#ff7a1a",
      textColor: "#fff",
      links: [
        { label: "Our Story", href: "#", ariaLabel: "Learn about our story" },
        { label: "Team", href: "#", ariaLabel: "Meet our team" },
      ],
    },
    {
      label: "Events",
      bgColor: "#1a1a1a",
      textColor: "#fff",
      links: [
        { label: "Upcoming", href: "#", ariaLabel: "View upcoming events" },
        { label: "Past Events", href: "#", ariaLabel: "View past events" },
      ],
    },
    {
      label: "Resources",
      bgColor: "#2a2a2a",
      textColor: "#fff",
      links: [
        { label: "Blog", href: "#", ariaLabel: "Read our blog" },
        { label: "Docs", href: "#", ariaLabel: "View documentation" },
      ],
    },
  ];

  return (
    <section className="h-[100vh] w-full flex flex-col justify-center">
      {/* <NavBar
        logoAlt="HackWise Logo"
        items={navItems}
        baseColor="#fff"
        menuColor="#fff"
        buttonBgColor="#ff7a1a"
        buttonTextColor="#fff"
      /> */}
      <div className="roll-txt"></div>
      <div>
        <h5 className="text-white font-mono ml-[120px] z-10 text-xl relative top-50 ">
          Empowering the next wave of SaaS <br />
          innovators — turning bold ideas <br />
          into scalable impact.
        </h5>
        <button
          type="button"
          className="explore-btn cursor-pointer relative top-[230px] ml-40 text-white font-mono font-extralight px-[60px] py-3 border-2 rounded-[5px] border-orange-500 bg-black transition"
        >
          <DecryptedText text="Register Now" sequential />
        </button>
        <div className="box w-50 h-50 ml-[1089px] mt-[28px] border border-white/80 flex items-center justify-center">
          <img
            src="/assets/Hackloho.png"
            alt="Hero Image"
            className="h-40 w-40"
          />
        </div>
      </div>
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
    </section>
  );
}
