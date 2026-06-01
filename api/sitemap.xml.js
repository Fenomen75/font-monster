const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { credential } = require('firebase-admin');

// Firebase Admin initialization (only once)
if (!getApps().length) {
  initializeApp({
    credential: credential.applicationDefault(),
    projectId: 'fontan-7bae4'
  });
}

const BASE_URL = 'https://font-monster.vercel.app';

const STATIC_FONTS = [
  'inter','montserrat','open-sans','lato','poppins','nunito','raleway','oswald',
  'roboto','dm-sans','outfit','figtree','barlow','playfair-display','merriweather',
  'lora','cormorant-garamond','eb-garamond','cinzel','spectral','pt-serif',
  'bebas-neue','abril-fatface','syne','space-grotesk','fredoka','bangers',
  'russo-one','exo-2','dancing-script','pacifico','caveat','satisfy','great-vibes',
  'indie-flower','kalam','sacramento','jetbrains-mono','fira-code','source-code-pro',
  'space-mono','roboto-mono','inconsolata','ibm-plex-mono','dm-mono',
  'plus-jakarta-sans','josefin-sans','work-sans','manrope','unbounded',
  'urbanist','cabinet-grotesk','clash-display','satoshi','general-sans',
  'switzer','geist','bricolage-grotesque','schibsted-grotesk','instrument-serif',
  'fraunces','sentient','editorial-new','chillax','synonym','ranade',
  'author','melodrama','cabinet-grotesk','array','nippo','telma',
  'gambarino','boska','erode','zodiak','neulis','quincy','articulat-cf',
  'neue-haas-grotesk','aktiv-grotesk','graphik','circular','gt-walsheim',
  'founders-grotesk','styrene','acumin','tiempos','canela','domaine',
  'freight-display','chronicle','hoefler-text','surveyor','guardian','lyon'
];

module.exports = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  let dynamicFontIds = [];
  
  try {
    const db = getFirestore();
    const snap = await db.collection('submitted_fonts')
      .where('status', '==', 'approved')
      .get();
    dynamicFontIds = snap.docs.map(d => d.data().id || d.id);
  } catch (e) {
    // Firestore oxunmadisa static fontlarla davam et
    console.error('Firestore error:', e.message);
  }

  // Merge static + dynamic, dublikat olmasin
  const allIds = [...new Set([...STATIC_FONTS, ...dynamicFontIds])];

  const urls = [
    `  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
    ...allIds.map(id => `  <url>
    <loc>${BASE_URL}/font/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600'); // 1 saat cache
  res.status(200).send(xml);
};
