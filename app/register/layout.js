export const metadata = {
  title: "Register for Hackwise 2.0 | Team Registration | National Hackathon",
  description: "Register your team for Hackwise 2.0 - National Level Hackathon at KVGCE. Build SaaS products, compete for ₹60,000 prize pool, and get hired. Register now!",
  keywords: [
    "Hackwise 2.0 Registration",
    "Hackathon Registration",
    "Team Registration",
    "KVGCE Hackathon",
    "National Hackathon Registration",
    "SaaS Hackathon",
    "Coding Competition Registration",
    "Hackathon 2026",
    "Student Hackathon",
    "Tech Competition",
    "Programming Contest",
    "Hackathon Sign Up",
    "Register Hackathon",
    "Hackathon Team",
  ],
  openGraph: {
    title: "Register for Hackwise 2.0 | Team Registration",
    description: "Register your team for Hackwise 2.0 - National Level Hackathon. Build SaaS products, compete for ₹60,000 prize pool!",
    url: "https://hackwise.spherehive.in/register",
    siteName: "Hackwise 2.0",
    images: [
      {
        url: "/assets/Hackloho.png",
        width: 1200,
        height: 630,
        alt: "Hackwise 2.0 Registration",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Register for Hackwise 2.0 | Team Registration",
    description: "Register your team for Hackwise 2.0 - National Level Hackathon. Build SaaS products, compete for ₹60,000 prize pool!",
    images: ["/assets/Hackloho.png"],
  },
  alternates: {
    canonical: "https://hackwise.spherehive.in/register",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterLayout({ children }) {
  return (
    <>
      {/* Structured Data for Registration */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Hackwise 2.0 Registration",
            "description": "Register your team for Hackwise 2.0 - National Level Hackathon",
            "url": "https://hackwise.spherehive.in/register",
            "startDate": "2026-04-04",
            "endDate": "2026-04-05",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "eventStatus": "https://schema.org/EventScheduled",
            "location": {
              "@type": "Place",
              "name": "KVG College of Engineering",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Sullia",
                "addressRegion": "Karnataka",
                "addressCountry": "IN"
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": "Sphere Hive",
              "url": "https://hackwise.spherehive.in"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "url": "https://hackwise.spherehive.in/register",
              "validFrom": "2025-01-01"
            },
            "audience": {
              "@type": "EducationalAudience",
              "educationalRole": "student"
            }
          }),
        }}
      />
      {children}
    </>
  );
}

