const BASE_URL = 'https://font-monster.vercel.app';

const STATIC_FONTS = [
  'inter','montserrat','open-sans','lato','poppins','nunito','raleway','oswald',
  'roboto','dm-sans','outfit','figtree','barlow','playfair-display','merriweather',
  'lora','cormorant-garamond','eb-garamond','cinzel','spectral','pt-serif',
  'bebas-neue','abril-fatface','syne','space-grotesk','fredoka','bangers',
  'russo-one','exo-2','dancing-script','pacifico','caveat','satisfy','great-vibes',
  'indie-flower','kalam','sacramento','jetbrains-mono','fira-code','source-code-pro',
  'space-mono','roboto-mono','inconsolata','ibm-plex-mono','dm-mono',
  'plus-jakarta-sans','josefin-sans','work-sans','manrope','unbounded'
];

module.exports = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  let dynamicFonts = [];

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/fontan-7bae4/databases/(default)/documents/submitted_fonts?pageSize=500`
    );
    const data = await response.json();
    if (data.documents) {
      dynamicFonts = data.documents
        .map(d => {
          const fields = d.fields || {};
          const status = fields.status?.stringValue;
          const id = fields.id?.stringValue || d.name.split('/').pop();
          return status === 'approved' ? id : null;
        })
        .filter(Boolean);
    }
  } catch (e) {
    console.error('Firestore fetch error:', e.message);
  }

  const allIds = [...new Set([...STATIC_FONTS, ...dynamicFonts])];

  const urls = [
    `  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...allIds.map(id =>
      `  <url>\n    <loc>${BASE_URL}/font/${id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    )
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.status(200).send(xml);
};
