export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    neonAuthBaseUrl: process.env.NEON_AUTH_BASE_URL,
    neonAuthCookieSecret: process.env.NEON_AUTH_COOKIE_SECRET,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    public: { cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'demo' }
  },
  app: { head: { title: 'CourtLink — le réseau de confiance du basketball', meta: [{ name: 'description', content: 'Découvrez les profils, opportunités et événements basketball vérifiés en Afrique de l’Ouest.' }] } }
})