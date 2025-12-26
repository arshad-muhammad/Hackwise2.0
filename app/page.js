import React from "react";
import Home from "./Hero/page";
import AboutH from "./AboutH/page";
import AboutSH from "./AboutSH/page";
import Flow from "./Flow/page";
import Timeline from "./Timeline/page";
import Prizes from "./Prizes/page";
import Sponsors from "./Sponsors/page";
import Gallery from "./Gallery/page";
import TimerSection from "./components/TimerSection";

const page = () => {
  return (
    <>
      <Home />
      <TimerSection />
      <AboutH />
      <Flow />
      <Timeline />
      <Prizes />
      <Sponsors />
      <Gallery />
      <AboutSH />
    </>
  );
};

export default page;
