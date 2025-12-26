import React from "react";
import DecryptedText from "../components/DecryptedText";

const Timeline = () => {
  const schedule = [
    {
      day: "Day 1",
      events: [
        { time: "08:00 AM", title: "Registration & Check-in", description: "Get your badges and swag kits." },
        { time: "10:00 AM", title: "Opening Ceremony", description: "Keynote speakers and hackathon kickoff." },
        { time: "11:00 AM", title: "Hacking Begins", description: "Start building your projects!" },
        { time: "01:00 PM", title: "Lunch Break", description: "Fuel up for the day." },
        { time: "06:00 PM", title: "Mentoring Session", description: "Get feedback from industry experts." },
        { time: "09:00 PM", title: "Dinner", description: "Keep the energy high." },
      ]
    },
    {
      day: "Day 2",
      events: [
        { time: "12:00 AM", title: "Midnight Snack", description: "Late night refreshments." },
        { time: "08:00 AM", title: "Breakfast", description: "Rise and shine." },
        { time: "11:00 AM", title: "Submission Deadline", description: "Upload your projects." },
        { time: "12:00 PM", title: "Judging Round 1", description: "Present your work to judges." },
        { time: "03:00 PM", title: "Final Presentations", description: "Top teams present on stage." },
        { time: "05:00 PM", title: "Closing Ceremony", description: "Winners announced and prizes distributed." },
      ]
    }
  ];

  return (
    <section id="timeline" className="section-container border-t border-white/10">
      <div className="w-full flex justify-center mb-16">
        <div className="inline-block border border-white/20 bg-[#0A090F] px-8 py-4">
          <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider text-center">
            Event Timeline
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {schedule.map((day, dayIndex) => (
          <div key={dayIndex} className="relative">
            <h2 className="text-2xl font-hackwise text-orange-500 mb-8 border-b border-white/10 pb-2">
              {day.day}
            </h2>
            <div className="space-y-8 pl-4 border-l border-white/10 ml-2">
              {day.events.map((event, index) => (
                <div key={index} className="relative pl-8 group">
                  {/* Dot */}
                  <div className="absolute -left-[21px] top-1 w-4 h-4 bg-[#0A090F] border border-orange-500/50 rounded-full group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300" />
                  
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-orange-500 text-sm">{event.time}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors font-sans">
                      {event.title}
                    </h3>
                    <p className="text-white/60 text-sm font-sans">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Timeline;

