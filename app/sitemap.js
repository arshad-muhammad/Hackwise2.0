export default function sitemap() {
  const baseUrl = 'https://hackwise.spherehive.in';

  const routes = [
    '',
    '/AboutH',
    '/AboutSH',
    '/accommodation',
    '/Brochure',
    '/code-of-conduct',
    '/contact',
    '/Flow',
    '/Gallery',
    '/privacy-policy',
    '/Prizes',
    '/Sponsors',
    '/terms-of-service',
    '/Timeline',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'yearly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}

