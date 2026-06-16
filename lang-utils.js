// ?? Unified language cache - single source of truth for card, detail & glyph preview ??
const _LANG_CACHE = {};
const _LANG_COLORS = [
  {bg:'rgba(0,122,255,0.12)',border:'rgba(0,122,255,0.25)',text:'#0a7aff'},
  {bg:'rgba(52,199,89,0.12)',border:'rgba(52,199,89,0.25)',text:'#1a8a38'},
  {bg:'rgba(175,82,222,0.12)',border:'rgba(175,82,222,0.25)',text:'#9b3dce'},
  {bg:'rgba(255,149,0,0.12)',border:'rgba(255,149,0,0.25)',text:'#b86000'},
  {bg:'rgba(255,59,48,0.12)',border:'rgba(255,59,48,0.25)',text:'#d32f20'},
  {bg:'rgba(90,200,250,0.15)',border:'rgba(90,200,250,0.3)',text:'#0077a8'},
  {bg:'rgba(255,214,10,0.15)',border:'rgba(255,214,10,0.3)',text:'#8a6d00'},
];

// Returns detected langs (cached). Priority:
// 1. Cache  2. font.detectedLangs (saved from opentype parse)  3. FONT_SUBSETS  4. canvas fallback
function resolveFontLangs(font, callback) {
  if (_LANG_CACHE[font.id]) { callback(_LANG_CACHE[font.id]); return; }
  // Community/uploaded font with pre-computed langs (from opentype.js at upload time)
  if (font.detectedLangs && font.detectedLangs.length) {
    _LANG_CACHE[font.id] = font.detectedLangs;
    callback(_LANG_CACHE[font.id]);
    return;
  }
  // Uploaded font without pre-computed langs - try canvas fallback
  if (font.fontData || font.fontUrl) {
    document.fonts.ready.then(() => {
      const detected = (typeof LANG_SUPPORT_LIST !== 'undefined' ? LANG_SUPPORT_LIST : [])
        .filter(l => _fontCanRender(font.name, font.weight||'400', l.chars))
        .map(l => l.label);
      _LANG_CACHE[font.id] = detected.length ? detected : ['Latin'];
      callback(_LANG_CACHE[font.id]);
    });
    return;
  }
  // Built-in Google Font - use accurate FONT_SUBSETS table
  _LANG_CACHE[font.id] = getFontLangs(font);
  callback(_LANG_CACHE[font.id]);
}
