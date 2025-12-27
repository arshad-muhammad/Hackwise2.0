import AccommodationContent from "./AccommodationContent";

export const metadata = {
  title: "Accommodation | Hackwise 2.0",
  description: "Stay tuned for accommodation details for Hackwise 2.0 at KVG College of Engineering. Logistics and stay information coming soon.",
  keywords: ["hackathon accommodation", "stay at KVGCE", "Hackwise logistics", "hackathon logistics"],
  openGraph: {
    title: "Accommodation | Hackwise 2.0",
    description: "Stay tuned for accommodation details for Hackwise 2.0 at KVG College of Engineering.",
    images: ["/assets/Hackloho.png"],
  },
};

export default function AccommodationPage() {
  return <AccommodationContent />;
}
