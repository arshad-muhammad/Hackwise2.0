export default function robots() {
  const baseUrl = 'https://hackwise.spherehive.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/campus-ambassador/login',
          '/campus-ambassador/dashboard',
          '/campus-ambassador/success',
          '/register/success',
          '/r/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/campus-ambassador/login',
          '/campus-ambassador/dashboard',
          '/campus-ambassador/success',
          '/register/success',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/campus-ambassador/login',
          '/campus-ambassador/dashboard',
          '/campus-ambassador/success',
          '/register/success',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

