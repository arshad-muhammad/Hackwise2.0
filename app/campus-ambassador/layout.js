export const metadata = {
  title: "Campus Ambassador Program | Hackwise 2.0 - Join as CA",
  description: "Become a Campus Ambassador for Hackwise 2.0! Earn rewards, LORs, cash prizes, and lead Sphere Hive clubs at your college. Join the elite CA program and represent Hackwise 2.0 at your campus.",
  keywords: [
    "Campus Ambassador",
    "CA Program",
    "Hackwise 2.0 Campus Ambassador",
    "Student Ambassador",
    "College Ambassador",
    "Hackathon Ambassador",
    "KVGCE Campus Ambassador",
    "Sphere Hive Club",
    "Student Leadership",
    "LOR Letter of Recommendation",
    "Hackathon CA",
    "Campus Representative",
    "Student Marketing",
    "Tech Ambassador",
    "Hackathon Promotion",
    "Student Rewards",
    "College Club Leadership",
    "Hackwise Ambassador",
    "Student Opportunities",
    "Tech Community",
    "Campus Outreach",
    "Student Network",
    "Hackathon Organizer",
    "Tech Event Ambassador",
  ],
  openGraph: {
    title: "Campus Ambassador Program | Hackwise 2.0",
    description: "Join as a Campus Ambassador for Hackwise 2.0. Earn rewards, LORs, cash prizes, and lead Sphere Hive clubs. Represent Hackwise at your college!",
    url: "https://hackwise.spherehive.in/campus-ambassador",
    siteName: "Hackwise 2.0",
    images: [
      {
        url: "/assets/Hackloho.png",
        width: 1200,
        height: 630,
        alt: "Hackwise 2.0 Campus Ambassador Program",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Ambassador Program | Hackwise 2.0",
    description: "Join as a Campus Ambassador for Hackwise 2.0. Earn rewards, LORs, cash prizes, and lead Sphere Hive clubs!",
    images: ["/assets/Hackloho.png"],
  },
  alternates: {
    canonical: "https://hackwise.spherehive.in/campus-ambassador",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function CampusAmbassadorLayout({ children }) {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Hackwise 2.0 Campus Ambassador Program",
            "description": "Join as a Campus Ambassador for Hackwise 2.0. Earn rewards, LORs, cash prizes, and lead Sphere Hive clubs at your college.",
            "url": "https://hackwise.spherehive.in/campus-ambassador",
            "logo": "https://hackwise.spherehive.in/assets/Hackloho.png",
            "sameAs": [
              "https://hackwise.spherehive.in"
            ],
            "offers": {
              "@type": "Offer",
              "name": "Campus Ambassador Program",
              "description": "Become a Campus Ambassador and earn rewards, LORs, cash prizes, and leadership opportunities",
              "category": "Student Program",
              "price": "0",
              "priceCurrency": "INR"
            },
            "audience": {
              "@type": "EducationalAudience",
              "educationalRole": "student"
            }
          }),
        }}
      />
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is the Campus Ambassador Program?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The Campus Ambassador Program allows students to represent Hackwise 2.0 at their college, promote the hackathon, and earn rewards including cash prizes, LORs, and leadership opportunities."
                }
              },
              {
                "@type": "Question",
                "name": "What are the benefits of being a Campus Ambassador?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Campus Ambassadors can earn cash prizes, goodies, Letters of Recommendation (LORs), join the Organising Team, open and lead Sphere Hive clubs at their college as President, and gain valuable networking and leadership experience."
                }
              },
              {
                "@type": "Question",
                "name": "How is CA performance calculated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Performance is calculated based on verified registrations through referral links, completed and approved tasks, early task submissions (bonus points), and overall leaderboard ranking."
                }
              }
            ]
          }),
        }}
      />
      {children}
    </>
  );
}

