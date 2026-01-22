"use client";
import { usePathname } from "next/navigation";
import Head from "next/head";

export default function SEOHead({ 
  title, 
  description, 
  keywords = [], 
  image = "/assets/Hackloho.png",
  noindex = false 
}) {
  const pathname = usePathname();
  const baseUrl = "https://hackwise.spherehive.in";
  const canonicalUrl = `${baseUrl}${pathname}`;
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;

  return (
    <>
      {/* Primary Meta Tags */}
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Hackwise 2.0" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
    </>
  );
}

