import React from "react";

function Card() {
  const cardData = [
    {
      title: "Innovation Nexus",
      description:
        "Born from a passion for technology and innovation, Sphere Hive emerged as a student-driven initiative to create a collaborative ecosystem where ideas transform into groundbreaking solutions.",
    },
    {
      title: "Our Mission",
      description:
        "To empower students with cutting-edge technology skills, foster entrepreneurial thinking, and build the next generation of tech leaders who stay ahead of the curves.",
    },
    {
      title: "What We Do?",
      description:
        "From hackathons to workshops, startup incubation to research projects, we provide a platform for students to explore, experiment, and excel in the rapidly evolving tech landscape.",
    },
  ];
  return (
    <div className="flex flex-wrap gap-8 ml-[120px] mt-[50px]">
      {cardData.map((item, index) => (
        <div
          key={index}
          className="card w-[400px] h-[270px] bg-[#0A090F] border border-white/15"
        >
          <div className="small-box w-[250px] h-[50px] bg-white/70 flex justify-center items-center">
            <h4 className="font-mono text-black">{item.title}</h4>
          </div>

          <p className="text-white font-mono px-[20px] mt-[40px]">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Card;
