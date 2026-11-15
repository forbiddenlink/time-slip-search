// Public, indexable pages. The home page is rendered dynamically, so
// next-sitemap cannot discover it from the build output; list pages explicitly.
const PAGES = ['/', '/about', '/contact', '/privacy-policy']

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://timeslipsearch.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // API routes and the PWA manifest are not pages.
  exclude: ['/api/*', '/manifest.webmanifest'],
  additionalPaths: async (config) =>
    Promise.all(PAGES.map((page) => config.transform(config, page))),
}
