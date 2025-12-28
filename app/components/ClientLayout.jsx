"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isAdmin || isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="relative z-10 flex flex-col items-center w-full">
        {children}
      </main>
      <Footer />
    </>
  );
}

