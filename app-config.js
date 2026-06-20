// ---- [app.js lines 1-198] ----
const LICENSE_META={
  free:{label:'100% Free',cls:'lic-free',hint:'Completely free for personal and commercial use.'},
  personal:{label:'Free for Personal',cls:'lic-personal',hint:'Free for personal, non-commercial projects only.'},
  ofl:{label:'OFL',cls:'lic-ofl',hint:'SIL Open Font License - free to use, modify, and redistribute.'},
  apache:{label:'Apache 2.0',cls:'lic-apache',hint:'Apache License 2.0 - open-source, free for commercial use.'},
  share:{label:'Shareware',cls:'lic-share',hint:'Try before you buy. Commercial use requires a paid license.'},
  freeware:{label:'Freeware',cls:'lic-free',hint:'Free to use. Check author terms for commercial use.'},
  demo:{label:'Demo',cls:'lic-demo',hint:'Limited demo version. Full version available for purchase.'},
  note:{label:'Note of the Author',cls:'lic-personal',hint:"License determined by author's own note. Read the readme file."},
};
const WEIGHT_NAMES={100:'Thin',200:'Extra Light',300:'Light',400:'Regular',500:'Medium',600:'Semi Bold',700:'Bold',800:'Extra Bold',900:'Black'};
const CHARMAP_SETS={
  upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  lower:'abcdefghijklmnopqrstuvwxyz'.split(''),
  digits:'0123456789'.split(''),
  punct:'!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~'.split(''),
  latinext:'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğ'.split(''),
  cyrillic:'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя'.split(''),
  greek:'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω'.split(''),
  arabic:'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split(''),
  hebrew:'אבגדהוזחטיכלמנסעפצקרשת'.split(''),
  devanagari:'अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह'.split(''),
};
// Map from language name ? {key in CHARMAP_SETS, tab label}
const LANG_TO_CHARMAP={
  'Cyrillic':        {key:'cyrillic',   label:'Cyrillic'},
  'Greek':           {key:'greek',      label:'Grk'},
  'Vietnamese':      {key:'latinext',   label:'Lat+'},
  'Extended Latin':  {key:'latinext',   label:'Lat+'},
  'Arabic':          {key:'arabic',     label:'Arb'},
  'Hebrew':          {key:'hebrew',     label:'Heb'},
  'Devanagari':      {key:'devanagari', label:'Dev'},
};
const LOREM='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.';

// FONTS_BASE is loaded from fonts-data.js

// ?? SHARED language-support helper (used on both card & detail page) ??
// Accurate per-font subset data from Google Fonts (statically defined)
const FONT_SUBSETS = {
  'inter':              ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Greek'],
  'montserrat':         ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Vietnamese'],
  'open-sans':          ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Greek','Greek Ext','Hebrew','Vietnamese'],
  'lato':               ['Latin','Latin Ext'],
  'poppins':            ['Latin','Latin Ext','Devanagari'],
  'nunito':             ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'raleway':            ['Latin','Latin Ext'],
  'oswald':             ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'roboto':             ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Greek','Greek Ext','Vietnamese'],
  'dm-sans':            ['Latin','Latin Ext'],
  'outfit':             ['Latin'],
  'figtree':            ['Latin','Latin Ext'],
  'barlow':             ['Latin','Latin Ext','Vietnamese'],
  'playfair-display':   ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'merriweather':       ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'lora':               ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'cormorant-garamond': ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'eb-garamond':        ['Latin','Latin Ext','Cyrillic','Greek','Vietnamese'],
  'cinzel':             ['Latin','Latin Ext'],
  'spectral':           ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'pt-serif':           ['Latin','Latin Ext','Cyrillic'],
  'bebas-neue':         ['Latin','Latin Ext'],
  'abril-fatface':      ['Latin','Latin Ext'],
  'syne':               ['Latin','Latin Ext','Greek'],
  'space-grotesk':      ['Latin','Latin Ext'],
  'fredoka':            ['Latin','Latin Ext','Hebrew'],
  'bangers':            ['Latin','Latin Ext','Vietnamese'],
  'russo-one':          ['Latin','Cyrillic'],
  'exo-2':              ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'dancing-script':     ['Latin','Latin Ext','Vietnamese'],
  'pacifico':           ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'caveat':             ['Latin','Latin Ext','Cyrillic'],
  'satisfy':            ['Latin'],
  'great-vibes':        ['Latin','Latin Ext'],
  'indie-flower':       ['Latin'],
  'kalam':              ['Latin','Devanagari'],
  'sacramento':         ['Latin','Latin Ext'],
  'jetbrains-mono':     ['Latin','Latin Ext','Cyrillic','Greek'],
  'fira-code':          ['Latin','Latin Ext','Cyrillic','Greek'],
  'source-code-pro':    ['Latin','Latin Ext','Cyrillic','Greek','Vietnamese'],
  'space-mono':         ['Latin'],
  'roboto-mono':        ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Greek','Greek Ext','Vietnamese'],
  'inconsolata':        ['Latin','Latin Ext','Vietnamese'],
  'ibm-plex-mono':      ['Latin','Latin Ext','Cyrillic'],
  'dm-mono':            ['Latin','Latin Ext'],
  'plus-jakarta-sans':  ['Latin','Latin Ext'],
  'josefin-sans':       ['Latin','Latin Ext'],
  'work-sans':          ['Latin','Latin Ext','Vietnamese'],
  'manrope':            ['Latin','Latin Ext','Cyrillic'],
  'unbounded':          ['Latin','Latin Ext','Cyrillic'],
  'bodoni-moda':        ['Latin','Latin Ext'],
  'fraunces':           ['Latin','Latin Ext'],
  'libre-baskerville':  ['Latin','Latin Ext'],
  'source-serif-4':     ['Latin','Latin Ext','Cyrillic','Greek','Vietnamese'],
  'crimson-pro':        ['Latin','Latin Ext','Vietnamese'],
  'righteous':          ['Latin','Latin Ext'],
  'creepster':          ['Latin'],
  'permanent-marker':   ['Latin'],
  'patrick-hand':       ['Latin','Latin Ext','Vietnamese'],
  'architects-daughter':['Latin'],
  'gloria-hallelujah':  ['Latin'],
  'share-tech-mono':    ['Latin'],
  'anonymous-pro':      ['Latin','Latin Ext','Greek','Cyrillic'],
  'courier-prime':      ['Latin','Latin Ext'],
  'oxanium':            ['Latin','Latin Ext'],
  'mulish':             ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'karla':              ['Latin','Latin Ext'],
  'rubik':              ['Latin','Latin Ext','Cyrillic','Hebrew','Arabic'],
  'quicksand':          ['Latin','Latin Ext','Vietnamese'],
  'ibm-plex-sans':      ['Latin','Latin Ext','Cyrillic'],
  'zilla-slab':         ['Latin','Latin Ext'],
  'arvo':               ['Latin'],
  'bitter':             ['Latin','Latin Ext','Vietnamese'],
  'domine':             ['Latin','Latin Ext'],
  'alfa-slab-one':      ['Latin'],
  'black-ops-one':      ['Latin'],
  'orbitron':           ['Latin'],
  'press-start-2p':     ['Latin'],
  'teko':               ['Latin','Latin Ext','Devanagari'],
  'parisienne':         ['Latin','Latin Ext'],
  'pinyon-script':      ['Latin'],
  'allura':             ['Latin','Latin Ext'],
  'pt-mono':            ['Latin','Latin Ext','Cyrillic'],
  'overpass-mono':      ['Latin','Latin Ext'],
  'noto-sans':          ['Latin','Latin Ext','Cyrillic','Greek','Vietnamese'],
  'cabinet-grotesk':    ['Latin','Latin Ext'],
  'chivo':              ['Latin','Latin Ext'],
  'albert-sans':        ['Latin','Latin Ext'],
  'italiana':           ['Latin','Latin Ext'],
  'dm-serif-display':   ['Latin','Latin Ext'],
  'vt323':              ['Latin','Latin Ext','Vietnamese'],
  'silkscreen':         ['Latin'],
  'nanum-pen-script':   ['Latin','Korean'],
  'comic-neue':         ['Latin'],
  'fragment-mono':      ['Latin','Latin Ext'],
  'lilita-one':         ['Latin','Latin Ext'],
  'schibsted-grotesk':  ['Latin','Latin Ext'],
  'teachers':           ['Latin','Latin Ext'],
  'reddit-mono':        ['Latin','Latin Ext'],
  'urbanist':           ['Latin','Latin Ext'],
};
function getFontLangs(font) {
  if (FONT_SUBSETS[font.id]) return FONT_SUBSETS[font.id];
  // Fallback: tag-based hints
  const langs = new Set(['Latin']);
  (font.tags||[]).forEach(t => {
    if(/cyrillic/i.test(t)) langs.add('Cyrillic');
    if(/arabic/i.test(t)) langs.add('Arabic');
    if(/hebrew/i.test(t)) langs.add('Hebrew');
    if(/greek/i.test(t)) langs.add('Greek');
    if(/devanagari/i.test(t)) langs.add('Devanagari');
    if(/japanese/i.test(t)) langs.add('Japanese');
    if(/korean/i.test(t)) langs.add('Korean');
    if(/chinese/i.test(t)) langs.add('Chinese');
  });
  return [...langs];
}

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

// Real download counts only — no fake estimated numbers
// Fonts without a Firestore download_stats doc show 0 until someone downloads
// ---- [app.js lines 510-519] ----
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function licBadge(lic){const m=LICENSE_META[lic]||{label:lic,cls:'lic-demo'};return `<span class="lic-badge ${m.cls}">${m.label}</span>`;}
function getWeights(font){
  const m=font.gfamily&&font.gfamily.match(/wght@([^&"]+)/);
  if(!m)return[font.weight||'400'];
  return[...new Set(m[1].split(';').map(w=>w.replace(/[^0-9]/g,'').slice(0,3)).filter(w=>w&&parseInt(w)>=100))];
}

// DARK MODE
