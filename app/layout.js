import { Geist, Geist_Mono, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Background from "./components/Background";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Roboto_Mono } from "next/font/google";

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
  title: "HackWise 2.0",
  description: "Empowering the next wave of SaaS innovators",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${robotoMono.variable} ${spaceGrotesk.variable} ${inter.variable} font-sans antialiased relative bg-[#0A090F] text-white overflow-x-hidden`}
        suppressHydrationWarning
      >
        {/* Background for ALL pages */}
        <Background />

        {/* Global Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="relative z-10 flex flex-col items-center w-full">
        {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
