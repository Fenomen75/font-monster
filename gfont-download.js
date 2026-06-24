export default async function handler(req, res) {
  const { family } = req.query;
  if (!family) return res.status(400).json({ error: 'family required' });

  try {
    const url = `https://fonts.google.com/download?family=${encodeURIComponent(family)}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (!resp.ok) throw new Error('Google Fonts error: ' + resp.status);

    const buffer = await resp.arrayBuffer();
    const fname = family.replace(/\s+/g, '_') + '_fonts.zip';
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('gfont-download error:', err);
    res.status(502).json({ error: 'Download failed' });
  }
}
