import React from 'react';
import GalleryClient from './GalleryClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Hackwise 2.0 Gallery | Captured Moments',
  description:
    'Explore the official Hackwise 2.0 gallery — cinematic photos & videos from Sphere Hive’s national-level hackathon. Relive the energy, the grind, and the wins.',
  keywords: [
    'Hackwise 2.0 gallery',
    'Hackwise gallery',
    'Sphere Hive gallery',
    'Hackathon photos',
    'Hackathon videos',
    'Hackwise captured moments',
    'Hackwise 2.0 moments',
    'National level hackathon',
    'KVGCE hackathon',
    'Hackwise winners',
  ],
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'Hackwise 2.0 Gallery | Captured Moments',
    description:
      'Cinematic photos & videos from Hackwise 2.0 — captured moments, winners, and the hustle behind the builds.',
    url: '/gallery',
    type: 'website',
    siteName: 'Hackwise 2.0',
    images: [
      {
        url: '/assets/group-photo-placeholder.jpg',
        width: 1200,
        height: 630,
        alt: 'Hackwise 2.0 — Captured Moments',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hackwise 2.0 Gallery | Captured Moments',
    description:
      'Explore the official Hackwise 2.0 gallery — cinematic photos & videos from Sphere Hive’s national-level hackathon.',
    images: ['/assets/group-photo-placeholder.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Hackwise 2.0 Gallery | Captured Moments',
    description:
      'Official Hackwise 2.0 gallery featuring curated photos and videos from the national-level hackathon by Sphere Hive.',
    url: 'https://hackwise.spherehive.in/gallery',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Hackwise 2.0',
      url: 'https://hackwise.spherehive.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sphere Hive',
      url: 'https://hackwise.spherehive.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hackwise.spherehive.in/assets/Hackloho.png',
      },
    },
    about: {
      '@type': 'Event',
      name: 'Hackwise 2.0',
      eventStatus: 'https://schema.org/EventScheduled',
      organizer: {
        '@type': 'Organization',
        name: 'Sphere Hive',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GalleryClient />
    </>
  );
}


