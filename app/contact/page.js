import ContactContent from "./ContactContent";

export const metadata = {
  title: "Contact Us | Hackwise 2.0",
  description: "Get in touch with the Hackwise 2.0 team at Sphere Hive. Inquiries about registration, sponsorship, or general information.",
  keywords: ["contact Hackwise", "help desk", "Sphere Hive contact", "hackathon support"],
  openGraph: {
    title: "Contact Us | Hackwise 2.0",
    description: "Get in touch with the Hackwise 2.0 team at Sphere Hive.",
    images: ["/assets/Hackloho.png"],
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
