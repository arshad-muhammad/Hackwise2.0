import { Geist, Geist_Mono, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Background from "./components/Background";
import Loader from "./components/Loader";
import ClientLayout from "./components/ClientLayout";
import { Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://hackwise.spherehive.in"),
  title: "Hackwise 2.0 | National Level Hackathon at KVGCE",
  description:
    "Hackwise 2.0 is a national-level 24-hour hackathon in April 4-5, 2026 at KVG College of Engineering by Sphere Hive. Build, innovate, and compete with top student developers.",
  keywords: [
    "Hackwise",
    "Hackwise 2.0",
    "Sphere Hive",
    "KVGCE",
    "KVG College of Engineering",
    "Hackathon",
    "Sullia Hackathon",
    "Karnataka Hackathon",
    "Bangalore Hackathon",
    "Bengaluru Hackathon",
    "Hackathon in Bangalore",
    "SaaS",
    "SaaS Development",
    "Software as a Service",
    "Cloud Computing",
    "Microservices",
    "API Development",
    "Pre Placement Hackathon",
    "Hackathon 2026",
    "Coding Competition",
    "Student Innovation",
    "Tech Event",
    "Startup",
    "Hackathon Job",
    "Recruitment",
    "Web Development",
    "AI Hackathon",
    "April 4",
  "April 5",
  "January 14",
  "February 28",
  ],
  authors: [{ name: "Sphere Hive" }],
  creator: "Sphere Hive",
  publisher: "KVG College of Engineering",
  icons: {
    icon: "/assets/logo.ico",
    shortcut: "/assets/logo.ico",
    apple: "/assets/logo.png",
  },
  openGraph: {
    title: "Hackwise 2.0 | National Level Hackathon - April 4-5, 2026",
    description:
      "Empowering the next wave of innovators. Join us at KVGCE for a 24-hour coding sprint on April 4-5, 2026.",
    siteName: "Hackwise 2.0",
    images: [
      {
        url: "/assets/Hackloho.png",
        width: 800,
        height: 600,
        alt: "Hackwise 2.0 Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  youtube: {
    card: "summary_large_image",
    title: "Hackwise 2.0 | April 4-5, 2026",
    description: "Empowering the next wave of innovators. Online: Jan 14 - Feb 28. Finale: April 4-5, 2026.",
    images: ["/assets/Hackloho.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${robotoMono.variable} ${spaceGrotesk.variable} ${inter.variable} font-sans antialiased relative bg-[#0A090F] text-white overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Loader />
        {/* Background for ALL pages */}
        <Background />

        <ClientLayout>
          {children}
        </ClientLayout>
        
        <Analytics />
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </body>
    </html>
  );
}
