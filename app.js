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
  'Cyrillic':        {key:'cyrillic',   label:'Кир'},
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
function _estimatedDownloadCounts(){
  const s={};
  FONTS_BASE.forEach(f=>{ s[f.id]=0; });
  return s;
}
function _estimatedYesterdayDownloads(){
  const s={};
  FONTS_BASE.forEach(f=>{ s[f.id]=0; });
  return s;
}
let DL_COUNTS=_estimatedDownloadCounts();
// localStorage-da saxlanmış real data varsa dərhal yüklə
(function(){try{const c=localStorage.getItem('fm_dl_counts');if(c){const p=JSON.parse(c);Object.assign(DL_COUNTS,p);}}catch(e){}}());
window.DL_COUNTS = DL_COUNTS;
let DL_YESTERDAY=_estimatedYesterdayDownloads();
// true => the count for this font is still the seeded estimate, not real data
let DL_IS_ESTIMATED={};
FONTS_BASE.forEach(f=>DL_IS_ESTIMATED[f.id]=!(DL_COUNTS[f.id]>0));
window.DL_IS_ESTIMATED=DL_IS_ESTIMATED;

// Load real per-font download totals from Firestore ('download_stats/{fontId}')
// and overlay them on top of the estimated baseline.
async function loadDownloadStatsCache(){
  if(!window._fbDb || !window._fbFns) return;
  try{
    const {collection, getDocs}=window._fbFns;
    const snap=await getDocs(collection(window._fbDb,'download_stats'));
    snap.docs.forEach(d=>{
      const data=d.data();
      if(typeof data.total==='number'){
        DL_COUNTS[d.id]=data.total;
        DL_IS_ESTIMATED[d.id]=false;
      }
      if(typeof data.yesterday==='number') DL_YESTERDAY[d.id]=data.yesterday;
    });
    window.DL_COUNTS=DL_COUNTS;
    try{localStorage.setItem('fm_dl_counts',JSON.stringify(DL_COUNTS));}catch(e){}
  }catch(e){ console.warn('download_stats load error:',e); }
}
// Cache for average ratings: { fontId: { avg: 4.2, count: 5 } }
let RATING_CACHE = {};
window.RATING_CACHE = RATING_CACHE;

// Load all ratings from Firestore comments and cache avg per font
async function loadRatingsCache() {
  if(!window._fbDb || !window._fbFns) return;
  try {
    const { collection, getDocs } = window._fbFns;
    const snap = await getDocs(collection(window._fbDb, 'comments'));
    const byFont = {};
    snap.docs.forEach(d => {
      const c = d.data();
      if(!c.fontId || !c.rating) return;
      if(!byFont[c.fontId]) byFont[c.fontId] = [];
      byFont[c.fontId].push(c.rating);
    });
    Object.entries(byFont).forEach(([fid, ratings]) => {
      const avg = ratings.reduce((s,r)=>s+r,0)/ratings.length;
      RATING_CACHE[fid] = { avg, count: ratings.length };
      window.RATING_CACHE[fid] = RATING_CACHE[fid];
    });
    // RATING_CACHE updated in-place; ratings will show on next natural render
  } catch(e) { console.warn('Rating cache load error:', e); }
}
function getFontAvgRating(fontId) {
  return RATING_CACHE[fontId] || null;
}
function fmtDlCount(n){if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1000)return Math.round(n/1000)+'K';return String(n);}
// Like fmtDlCount but prefixes "~" while the figure is still the seeded estimate
function fmtDlCountFor(fontId){
  return fmtDlCount(DL_COUNTS[fontId]||0);
}
function incrementDownload(id){
  DL_COUNTS[id]=(DL_COUNTS[id]||0)+1;
  window.DL_COUNTS[id]=DL_COUNTS[id];
  DL_IS_ESTIMATED[id]=false;
  // Also increment local yesterday counter so the UI reflects the real click immediately
  DL_YESTERDAY[id]=(DL_YESTERDAY[id]||0)+1;
  if(window._fbDb && window._fbFns){
    try{
      const {doc, setDoc, increment}=window._fbFns;
      // Write both total and today's rolling yesterday counter
      setDoc(doc(window._fbDb,'download_stats',id), {total:increment(1), yesterday:increment(1)}, {merge:true})
        .catch(e=>console.warn('download_stats write error:',e));
    }catch(e){console.warn('download_stats write error:',e);}
  }
}

let FONTS=[...FONTS_BASE],activeCategory="all",searchTerm="",previewText="",fontSize=window.innerWidth<=768?38:100;
// Buq 4 düzəlişi: type="module" script defer kimi işləyir — onAuthStateChanged gəlməzdən
// əvvəl window.currentUser null qalır. localStorage cache-dən ilkin dəyəri oxuyuruq ki yarış vəziyyəti olmasın.
window.currentUser=(function(){
  try{
    var c=localStorage.getItem('fn_current_user');
    if(!c) return null;
    var u=JSON.parse(c);
    // isAdmin/isModerator heç vaxt cache-dən oxunmur — Firestore-dan gəlməlidir.
    // Bu, brauzer console-dan localStorage.setItem ilə admin saxtakarlığını önləyir.
    u.isAdmin=false;
    u.isModerator=false;
    return u;
  }catch(e){return null;}
})();
window.currentUser=window.currentUser; // Firebase onAuthStateChanged gəldikdə üzərinə yazacaq
let likedFonts=new Set(),loadedFonts=new Set(),debounceTimer,currentDetailFont=null;
let activeDetailWeight='400',pvMode='text',pvBold=false,pvItalic=false,pvAlign='left';
let pvBgColor='#ffffff',pvTextColor='#111111',pvBgImage=null;
let activeLicenseFilter=null,compareFonts=[],recentlyViewed=[],activeCodeTab='css';
let activeTag='';
let shortcutsOpen=false,darkMode=false;

// ?? ADMIN helpers ??
function getAdminRequests(){try{return JSON.parse(localStorage.getItem('tv_admin_requests')||'[]');}catch(e){return[];}}
function saveAdminRequests(arr){try{localStorage.setItem('tv_admin_requests',JSON.stringify(arr));}catch(e){}}

// ?? Sync approved/pending submitted fonts for current user ??
function syncSubmittedFonts(){
  // Remove all previously-loaded submitted fonts from runtime FONTS
  const ids=JSON.parse(localStorage.getItem("tv_submitted")||"[]").map(f=>f.id);
  // Rebuild: FONTS = FONTS_BASE + approved + current user's pending
  for(let i=FONTS.length-1;i>=0;i--){
    if(!FONTS_BASE.find(b=>b.id===FONTS[i].id)) FONTS.splice(i,1);
  }
  const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
  sub.forEach(f=>{
    const baseMatch=FONTS_BASE.find(b=>b.id===f.id);
    if(baseMatch){
      // Admin edit override for a built-in font - apply onto runtime copy
      if(f.adminEditedAt){
        const fi=FONTS.findIndex(x=>x.id===f.id);
        if(fi>=0) Object.assign(FONTS[fi],f);
      }
      return;
    }
    // Restore fontData from its separate key if it was stored there
    if(f._hasFontData && !f.fontData){
      const stored=localStorage.getItem('fn_fontdata_'+f.id);
      if(stored) f.fontData=stored;
    }
    if(!f.pending) FONTS.push(f); // approved ? everyone sees
    else if(window.currentUser && f.submittedById===window.currentUser.id) FONTS.push(f); // pending ? only submitter
    // Re-inject @font-face for uploaded fonts (reloads page, localStorage fonts need re-injection)
    if(f.fontVariants&&f.fontVariants.length>0) injectVariantFaces(f);
    else if(f.fontUrl) injectCustomFontFaceUrl(f.id,f.name,f.fontUrl,f.fontExt||'.ttf');
    else if(f.fontData) injectCustomFontFace(f.id,f.name,f.fontData,f.fontExt||'.ttf');
  });
}

// ?? Firestore: load submitted fonts from cloud ??
async function syncSubmittedFontsFromFirestore(){
  if(!window._fbFns || !window._fbDb) return;
  try{
    const {collection, getDocs, query, where, orderBy} = window._fbFns;
    const db = window._fbDb;
    // Load all approved fonts
    const approvedQ = query(collection(db,'submitted_fonts'), where('pending','==',false));
    const approvedSnap = await getDocs(approvedQ);
    const approvedFonts = approvedSnap.docs.map(d=>({id:d.id,...d.data()}));
    // Load pending fonts: admin/moderator sees ALL, regular user sees only own
    let pendingFonts = [];
    if(window.currentUser){
      if(_isAdmin(window.currentUser) || window.currentUser.isModerator){
        const allPendingQ = query(collection(db,'submitted_fonts'), where('pending','==',true));
        const allPendingSnap = await getDocs(allPendingQ);
        pendingFonts = allPendingSnap.docs.map(d=>({id:d.id,...d.data()}));
      } else {
        const pendingQ = query(collection(db,'submitted_fonts'), where('submittedById','==',window.currentUser.id), where('pending','==',true));
        const pendingSnap = await getDocs(pendingQ);
        pendingFonts = pendingSnap.docs.map(d=>({id:d.id,...d.data()}));
      }
    }
    const allCloud = [...approvedFonts, ...pendingFonts];
    if(!allCloud.length) return;
    // Merge into localStorage and runtime FONTS
    let sub = JSON.parse(localStorage.getItem("tv_submitted")||"[]");
    const existingIds = new Set(sub.map(f=>f.id));
    allCloud.forEach(f=>{
      if(!existingIds.has(f.id)){sub.push(f);existingIds.add(f.id);}
      else{ const idx=sub.findIndex(x=>x.id===f.id); if(idx>=0) sub[idx]={...sub[idx],...f}; }
    });
    // Only re-render if new fonts were actually added that aren't already in the grid
    const prevCount = FONTS.length;
    syncSubmittedFonts();
    const newCount = FONTS.length;
    // Re-render only if the font list actually changed (new fonts arrived from Firestore)
    if(newCount !== prevCount){
      renderFonts();
    }
  }catch(e){console.warn('Firestore submitted fonts sync error:',e);}
}

try{
  likedFonts=new Set(JSON.parse(localStorage.getItem("tv_liked")||"[]"));
  // Only load APPROVED submitted fonts at init; pending loaded after auth
  const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
  sub.forEach(f=>{
    const baseMatch=FONTS_BASE.find(b=>b.id===f.id);
    if(baseMatch){
      // Admin edit override for a built-in font - apply onto runtime copy
      if(f.adminEditedAt){
        const fi=FONTS.findIndex(x=>x.id===f.id);
        if(fi>=0) Object.assign(FONTS[fi],f);
      }
      return;
    }
    if(!f.pending){
      if(f._hasFontData && !f.fontData){const stored=localStorage.getItem('fn_fontdata_'+f.id);if(stored)f.fontData=stored;}
      FONTS.push(f);
      if(f.fontVariants&&f.fontVariants.length>0) injectVariantFaces(f);
      else if(f.fontUrl) injectCustomFontFaceUrl(f.id,f.name,f.fontUrl,f.fontExt||'.ttf');
      else if(f.fontData) injectCustomFontFace(f.id,f.name,f.fontData,f.fontExt||'.ttf');
    }
  });
  recentlyViewed=JSON.parse(localStorage.getItem("tv_recent")||"[]");
  darkMode=localStorage.getItem("tv_dark")==='1';
  if(darkMode){document.documentElement.setAttribute('data-theme','dark');}
}catch(e){}

// ?? Inject @font-face for locally-uploaded community fonts ??
function injectCustomFontFace(fontId, name, dataUrl, ext){
  if(!dataUrl||loadedFonts.has(fontId)) return;
  loadedFonts.add(fontId);
  const fmt={'.ttf':'truetype','.otf':'opentype','.woff':'woff','.woff2':'woff2'}[ext]||'truetype';
  const s=document.createElement('style');
  s.textContent=`@font-face{font-family:'${name.replace(/'/g,"\\'")}';src:url('${dataUrl}') format('${fmt}');font-weight:100 900;font-style:normal}`;
  document.head.appendChild(s);
}

// ?? Inject @font-face from a remote URL - FontFace API il? (yükl?ndikd?n sonra preview yenil?) ??
function injectCustomFontFaceUrl(fontId, name, url, ext, onLoaded){
  if(!url||loadedFonts.has(fontId)){if(onLoaded)onLoaded();return;}
  loadedFonts.add(fontId);
  const fmt={'.ttf':'truetype','.otf':'opentype','.woff':'woff','.woff2':'woff2'}[ext]||'truetype';
  // FontFace API: font yükl?nib bitdikd?n sonra callback
  if(typeof FontFace!=='undefined'){
    const ff=new FontFace(name, `url('${url}') format('${fmt}')`,{weight:'100 900'});
    ff.load().then(loaded=>{
      document.fonts.add(loaded);
      if(onLoaded)onLoaded();
      // Yalniz h?min fontun preview elementl?rini yenil?, bütün grid-i re-render etm?
      document.querySelectorAll(`[data-fontname="${name}"], [id^="prev-${fontId}"]`).forEach(el=>{
        const txt=el.dataset.previewtext||el.dataset.fontname||el.textContent||name;
        el.style.fontFamily=`'${name}',sans-serif`;
        if(el.textContent!==txt) el.textContent=txt;
      });
    }).catch(()=>{
      // Fallback: köhn? style inject
      const s=document.createElement('style');
      s.textContent=`@font-face{font-family:'${name.replace(/'/g,"\'")}';src:url('${url}') format('${fmt}');font-weight:100 900;font-style:normal}`;
      document.head.appendChild(s);
      if(onLoaded)onLoaded();
    });
  } else {
    // Köhn? browser fallback
    const s=document.createElement('style');
    s.textContent=`@font-face{font-family:'${name.replace(/'/g,"\'")}';src:url('${url}') format('${fmt}');font-weight:100 900;font-style:normal}`;
    document.head.appendChild(s);
    if(onLoaded)onLoaded();
  }
}
function loadFont(f){
  if(loadedFonts.has(f.id)) return;
  // Only skip if it's a pure image-preview font (DaFont) with no actual font data
  if(f.previewImg && !f.fontData && !f.fontUrl && !f.gfamily) return;
  if(f.fontUrl){injectCustomFontFaceUrl(f.id,f.name,f.fontUrl,f.fontExt||'.ttf');return;}
  if(f.fontData){injectCustomFontFace(f.id,f.name,f.fontData,f.fontExt||'.ttf');return;}
  if(!f.gfamily) return;
  loadedFonts.add(f.id);
  const l=document.createElement('link');l.rel='stylesheet';
  l.href=`https://fonts.googleapis.com/css2?family=${f.gfamily}&display=swap`;
  document.head.appendChild(l);
}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function licBadge(lic){const m=LICENSE_META[lic]||{label:lic,cls:'lic-demo'};return `<span class="lic-badge ${m.cls}">${m.label}</span>`;}
function getWeights(font){
  const m=font.gfamily&&font.gfamily.match(/wght@([^&"]+)/);
  if(!m)return[font.weight||'400'];
  return[...new Set(m[1].split(';').map(w=>w.replace(/[^0-9]/g,'').slice(0,3)).filter(w=>w&&parseInt(w)>=100))];
}

// DARK MODE
const ICON_SVG_MOON='<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" stroke="none"/>';
const ICON_SVG_SUN='<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
function _setDarkIcon(isDark){
  const icon=document.getElementById('darkIcon');
  if(icon) icon.innerHTML=isDark?ICON_SVG_MOON:ICON_SVG_SUN;
}
function toggleDark(){
  // theme-color meta-sını da yenilə
  setTimeout(function(){
    const tc = document.getElementById('metaThemeColor');
    if(tc){ const bg=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); if(bg) tc.setAttribute('content',bg); }
  }, 50);
  darkMode=!darkMode;
  document.documentElement.setAttribute('data-theme',darkMode?'dark':'');
  localStorage.setItem("tv_dark",darkMode?'1':'0');
  _setDarkIcon(darkMode);
  showToast(darkMode?'🌙 Dark mode':'☀️ Light mode');
}

// SHORTCUTS
function toggleShortcuts(){
  shortcutsOpen=!shortcutsOpen;
  document.getElementById('shortcutsPanel').classList.toggle('open',shortcutsOpen);
}

// LICENSE FILTER
function filterLicense(lic){
  _ensureGridView();
  activeLicenseFilter=activeLicenseFilter===lic?null:lic;
  currentPage=1;
  searchTerm='';document.getElementById('searchInput').value='';
  activeTag='';
  document.querySelectorAll('#tagList .sb-item').forEach(b=>b.classList.remove('active'));
  renderFonts();
  showToast(activeLicenseFilter?`Showing ${LICENSE_META[lic]?.label} fonts`:'Filter cleared');
  syncUrl(true);
}

// RECENTLY VIEWED
function addToRecent(fontId){
  recentlyViewed=recentlyViewed.filter(id=>id!==fontId);
  recentlyViewed.unshift(fontId);
  recentlyViewed=recentlyViewed.slice(0,6);
  try{localStorage.setItem("tv_recent",JSON.stringify(recentlyViewed));}catch(e){}
  renderRecentList();
}
function renderRecentList(){
  const el=document.getElementById('recentList');if(!el)return;
  const items=recentlyViewed.map(id=>FONTS.find(f=>f.id===id)).filter(Boolean);
  if(!items.length){el.innerHTML='<div style="padding:4px 10px;font-size:11px;color:var(--text3)">None yet</div>';return;}
  el.innerHTML=items.map(f=>{
    const dot=f.previewImg
      ? `<div class="rv-dot" style="overflow:hidden;padding:0"><img src="${f.previewImg}" style="width:100%;height:100%;object-fit:cover;"></div>`
      : `<div class="rv-dot" style="font-family:'${f.name}',sans-serif;font-weight:${f.weight}">Aa</div>`;
    return `<div class="rv-item" onclick="openDetail('${f.id}')">${dot}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${esc(f.name)}</span></div>`;
  }).join('');
}

// COMPARE
function addToCompare(fontId){
  if(compareFonts.includes(fontId)){showToast('Already in compare');return;}
  if(compareFonts.length>=4){showToast('Max 4 fonts');return;}
  compareFonts.push(fontId);updateCompareBar();
  const btn=document.querySelector(`[data-compare-btn="${fontId}"]`);
  if(btn)btn.classList.add('compare-on');
  showToast(`Added to compare (${compareFonts.length}/4)`);
}
function removeFromCompare(fontId){
  compareFonts=compareFonts.filter(id=>id!==fontId);updateCompareBar();
  const btn=document.querySelector(`[data-compare-btn="${fontId}"]`);
  if(btn)btn.classList.remove('compare-on');
  renderCompareCols();
}
function clearCompare(){
  compareFonts=[];updateCompareBar();
  document.querySelectorAll('[data-compare-btn]').forEach(b=>b.classList.remove('compare-on'));
}
function updateCompareBar(){
  const bar=document.getElementById('compareBar');
  const fontsEl=document.getElementById('compareBarFonts');
  if(!compareFonts.length){bar.classList.remove('visible');return;}
  bar.classList.add('visible');
  fontsEl.innerHTML=compareFonts.map(id=>{
    const f=FONTS.find(fn=>fn.id===id);
    return f?`<div class="compare-chip">${esc(f.name)}<button onclick="removeFromCompare('${id}')">×</button></div>`:'';
  }).join('');
}
function openCompare(){
  const modal=document.getElementById('compareModal');
  if(currentDetailFont){
    // silently show only the current font - no toast, no bar update
    compareFonts=[currentDetailFont.id];
    loadFont(currentDetailFont);
  }
  modal.style.display='flex';
  requestAnimationFrame(()=>requestAnimationFrame(()=>modal.classList.add('open')));
  document.body.style.overflow='hidden';
  renderCompareCols();
}
function closeCompare(){
  const modal=document.getElementById('compareModal');
  modal.classList.remove('open');
  document.body.style.overflow='';
  setTimeout(()=>{ modal.style.display='none'; },300);
  // reset so compare bar doesn't linger
  compareFonts=[];
  document.querySelectorAll('[data-compare-btn]').forEach(b=>b.classList.remove('compare-on'));
  updateCompareBar();
}
function toggleCmpSearch(btn){
  const wrap=document.getElementById('cmpSearchWrap');
  const input=document.getElementById('cmpSearchInput');
  const isOpen=wrap.style.display!=='none';
  wrap.style.display=isOpen?'none':'block';
  if(!isOpen){input.value='';input.focus();filterCmpSearch('');}
}
function filterCmpEmptySearch(q){
  const dd=document.getElementById('cmpEmptyDropdown');
  if(!dd)return;
  if(!q){dd.style.display='none';return;}
  const list=FONTS.filter(f=>f.name.toLowerCase().includes(q.toLowerCase())).slice(0,8);
  if(!list.length){dd.style.display='none';return;}
  dd.style.display='block';
  dd.innerHTML=list.map(f=>`
    <div onclick="pickCmpFont('${f.id}')" style="
      padding:8px 14px;cursor:pointer;font-size:13px;letter-spacing:-0.01em;
      display:flex;align-items:center;justify-content:space-between;
      border-bottom:1px solid var(--border);transition:background .1s;
    " onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background=''">
      <span style="font-weight:500">${esc(f.name)}</span>
      <span style="font-size:11px;color:var(--text3)">${cap(f.cat)}</span>
    </div>`).join('');
}
function filterCmpSearch(q){
  const dd=document.getElementById('cmpSearchDropdown');
  const list=FONTS.filter(f=>f.name.toLowerCase().includes(q.toLowerCase())).slice(0,8);
  if(!list.length){dd.style.display='none';return;}
  dd.style.display='block';
  dd.innerHTML=list.map(f=>`
    <div onclick="pickCmpFont('${f.id}')" style="
      padding:7px 12px;cursor:pointer;font-size:13px;letter-spacing:-0.01em;
      display:flex;align-items:center;justify-content:space-between;
      border-bottom:1px solid var(--border);transition:background .1s;
    " onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background=''">
      <span>${esc(f.name)}</span>
      <span style="font-size:11px;color:var(--text3)">${cap(f.cat)}</span>
    </div>`).join('');
}
function pickCmpFont(id){
  addToCompare(id);
  document.getElementById('cmpSearchWrap').style.display='none';
  document.getElementById('cmpSearchDropdown').style.display='none';
  renderCompareCols();
}
function renderCompareCols(){
  const grid=document.getElementById('cmpGrid');
  const text=document.getElementById('cmpText').value||'The quick brown fox';
  const size=parseInt(document.getElementById('cmpSize').value)||48;
  document.getElementById('cmpSizeVal').textContent=size;
  document.getElementById('cmpFontCount').textContent=`${compareFonts.length} font${compareFonts.length!==1?'s':''}`;
  if(!compareFonts.length){
    grid.innerHTML=`
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:48px 24px;gap:20px;text-align:center">
        <div style="font-size:36px;opacity:0.4">⚖️</div>
        <div>
          <div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px;letter-spacing:-0.02em">No fonts selected</div>
          <div style="font-size:13px;color:var(--text3);line-height:1.6;max-width:260px">
            Use the <strong style="color:var(--text2)">+ Add Font</strong> button above,<br>
            or click <strong style="color:var(--text2)">⊕</strong> on any font card in the grid.
          </div>
        </div>
        <div style="position:relative;width:100%;max-width:300px">
          <input type="text" id="cmpEmptySearch"
            style="width:100%;background:var(--surface3);border:1px solid var(--border2);border-radius:10px;
                   padding:9px 14px;font-family:var(--sans);font-size:14px;color:var(--text);
                   outline:none;letter-spacing:-0.01em;transition:border-color .15s,box-shadow .15s"
            placeholder="Quick-add: type a font name."
            oninput="filterCmpEmptySearch(this.value)"
            onfocus="this.style.borderColor='var(--accent)';this.style.boxShadow='0 0 0 3px rgba(220,38,38,0.12)'"
            onfocusout="this.style.borderColor='';this.style.boxShadow=''">
          <div id="cmpEmptyDropdown" style="
            position:absolute;top:calc(100% + 4px);left:0;right:0;
            background:var(--surface-solid);border:1px solid var(--border2);
            border-radius:10px;box-shadow:var(--shadow-lg);z-index:10;
            max-height:200px;overflow-y:auto;display:none;
          "></div>
        </div>
      </div>`;
    return;
  }
  const wfSizes=[12,18,24,32,48,64];
  grid.innerHTML=compareFonts.map(id=>{
    const f=FONTS.find(fn=>fn.id===id);if(!f)return'';
    loadFont(f);
    const weights=getWeights(f);
    return `<div class="cmp-col">
      <div class="cmp-col-head">
        <div><div class="cmp-col-name">${esc(f.name)}</div><div class="cmp-col-meta">${esc(f.author)} · ${cap(f.cat)}</div></div>
        <button class="cmp-remove" onclick="removeFromCompare('${id}')">Remove</button>
      </div>
      <div class="cmp-col-preview">
        <div>
          <div class="cmp-row-label">Large</div>
          <div style="font-family:'${f.name}',sans-serif;font-weight:${f.weight};font-size:${size}px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(text)}</div>
        </div>
        <div>
          <div class="cmp-row-label">Waterfall</div>
          ${wfSizes.map(sz=>`<div style="font-family:'${f.name}',sans-serif;font-weight:${f.weight};font-size:${sz}px;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(text)}</div>`).join('')}
        </div>
        <div>
          <div class="cmp-row-label">Weights (${weights.length})</div>
          ${weights.map(w=>`<div style="font-family:'${f.name}',sans-serif;font-weight:${w};font-size:14px;line-height:1.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${w} ${WEIGHT_NAMES[w]||''} - ${esc(text)}</div>`).join('')}
        </div>
        <div>
          <div class="cmp-row-label">Numbers &amp; Symbols</div>
          <div style="font-family:'${f.name}',sans-serif;font-weight:${f.weight};font-size:18px;line-height:1.5">0123456789 !@#$% ?£¥</div>
        </div>
        <div>
          <div class="cmp-row-label">All Caps</div>
          <div style="font-family:'${f.name}',sans-serif;font-weight:${f.weight};font-size:14px;line-height:1.5;letter-spacing:2px;text-transform:uppercase">${esc(text)}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}
function _debounce(fn,ms){
  let t;
  return function(...args){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,args),ms); };
}
const _renderCompareColsDebounced=_debounce(renderCompareCols,150);
document.getElementById('cmpSize').oninput=function(){
  // keep the size label live while debouncing the (expensive) grid rebuild
  document.getElementById('cmpSizeVal').textContent=this.value;
  _renderCompareColsDebounced();
};
document.getElementById('cmpText').oninput=_renderCompareColsDebounced;

// FILTER
let alphaFilter='';let freeOnly=false;let currentPage=1;let perPage=20;
function isNewFont(f){
  const sevenDaysAgo = Date.now() - 7*24*60*60*1000;
  const submittedAt = f.submittedAt ? new Date(f.submittedAt).getTime() : 0;
  const approvedAt = f.approvedAt ? new Date(f.approvedAt).getTime() : 0;
  const currentYear = new Date().getFullYear();
  // Community fonts: submitted/approved in last 7 days, or still pending
  if(submittedAt >= sevenDaysAgo || approvedAt >= sevenDaysAgo || f.pending === true) return true;
  // Built-in fonts: released in current year or last year
  if(!f.submittedAt && !f.approvedAt && f.year >= currentYear - 1) return true;
  return false;
}
function getFiltered(){
  let list=FONTS.filter(f=>!f.pending||(window.currentUser&&f.submittedById===window.currentUser.id));
  if(activeCategory==="new")list=list.filter(isNewFont);
  else if(activeCategory!=="all")list=list.filter(f=>f.cat===activeCategory);
  if(activeLicenseFilter)list=list.filter(f=>activeLicenseFilter==='free'?['free','ofl','apache'].includes(f.license):f.license===activeLicenseFilter);
  if(freeOnly)list=list.filter(f=>f.license==='free'||f.license==='ofl'||f.license==='apache');
  if(alphaFilter==='#')list=list.filter(f=>/^[0-9]/.test(f.name));
  else if(alphaFilter)list=list.filter(f=>f.name.toUpperCase().startsWith(alphaFilter));
  if(activeTag)list=list.filter(f=>f.tags.some(t=>t.toLowerCase()===activeTag.toLowerCase()));
  if(searchTerm){
    const _esc=searchTerm.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const _re=new RegExp(_esc,'i');
    list=list.filter(f=>_re.test(f.name)||_re.test(f.author)||f.tags.some(t=>_re.test(t)));
  }
  const sort=(document.getElementById('sortSel')||{value:'popular'}).value;
  if(sort==="alpha")return[...list].sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==="alpha-desc")return[...list].sort((a,b)=>b.name.localeCompare(a.name));
  if(sort==="newest")return[...list].sort((a,b)=>b.year-a.year);
  if(sort==="downloads")return[...list].sort((a,b)=>(DL_COUNTS[b.id]||0)-(DL_COUNTS[a.id]||0));
  if(sort==="top-rated")return[...list].sort((a,b)=>{
    const ra=RATING_CACHE[a.id];const rb=RATING_CACHE[b.id];
    const scoreA=ra?ra.avg*(1+Math.log(ra.count+1)):0;
    const scoreB=rb?rb.avg*(1+Math.log(rb.count+1)):0;
    return scoreB-scoreA;
  });
  // Default (popular): sort by download count desc; tie-break with popular score
  return[...list].sort((a,b)=>{
    const dlDiff=(DL_COUNTS[b.id]||0)-(DL_COUNTS[a.id]||0);
    if(dlDiff!==0)return dlDiff;
    return b.popular-a.popular;
  });
}

// RENDER
function renderPagination(total,page,pp){
  const el=document.getElementById('paginationBar');if(!el)return;
  if(pp===0||total<=pp){el.innerHTML='';return;}
  const pages=Math.ceil(total/pp);
  if(pages<=1){el.innerHTML='';return;}
  let h=`<div class="pagination">`;
  h+=`<button class="pg-btn" ${page<=1?'disabled':''} onclick="goPage(${page-1})"><</button>`;
  const range=[];
  for(let i=1;i<=pages;i++){
    if(i===1||i===pages||Math.abs(i-page)<=2)range.push(i);
    else if(range[range.length-1]!=='.')range.push('.');
  }
  range.forEach(r=>{
    if(r==='.')h+=`<span class="pg-ellipsis">.</span>`;
    else h+=`<button class="pg-btn ${r===page?'active':''}" onclick="goPage(${r})">${r}</button>`;
  });
  h+=`<button class="pg-btn" ${page>=pages?'disabled':''} onclick="goPage(${page+1})">></button>`;
  h+=`</div>`;el.innerHTML=h;
}
function goPage(p){currentPage=p;renderFonts();syncUrl(true);window.scrollTo({top:0,behavior:'smooth'});}

// ── Grid view-nu aktivləşdir (filter dəyişənlər üçün) ──────────────────────
// Detail/author/profile açıqdırsa, onları silent bağla ki URL düzgün olsun
function _ensureGridView(){
  const fdp = document.getElementById('fontDetailPage');
  const ap  = document.getElementById('authorPage');
  const pp  = document.getElementById('profilePage');
  const tb  = document.getElementById('toolbarBar');
  const hero= document.getElementById('heroSection');
  const grid= document.getElementById('gridLayout');
  if(fdp && fdp.classList.contains('visible')){
    fdp.classList.remove('visible');
    currentDetailFont = null;
    if(grid) grid.style.display='';
    if(tb)   tb.style.display='';
    if(hero) hero.style.display='';
  }
  if(ap && ap.style.display !== 'none' && ap.style.display !== ''){
    ap.style.display='none';
    if(grid) grid.style.display='';
    if(tb)   tb.style.display='';
    if(hero) hero.style.display='';
  }
  if(pp && pp.style.display !== 'none' && pp.style.display !== ''){
    pp.style.display='none';
    if(grid) grid.style.display='';
    if(tb)   tb.style.display='';
    if(hero) hero.style.display='';
  }
}

// ── Mərkəzləşdirilmiş URL sync ───────────────────────────────────────────────
// ── Safe history wrapper (sandbox/iframe uyğunluğu üçün) ────────────────
function _safeHistoryPush(state, title, url){
  try{ history.pushState(state, title, url); } catch(e){ /* sandbox/iframe */ }
}
function _safeHistoryReplace(state, title, url){
  try{ history.replaceState(state, title, url); } catch(e){ /* sandbox/iframe */ }
}

// ── Dynamic SEO meta update ──────────────────────────────────────────────
function updatePageMeta(opts){
  // opts: { title, description, url, image }
  const base = 'https://fontmonster.app';
  const title = opts.title || 'Font·Monster - Free Font Discovery';
  const desc = opts.description || 'Discover and download thousands of free fonts.';
  const url = opts.url ? (base + opts.url) : (base + location.pathname + location.search);
  const img = opts.image || (base + '/og-cover.png');

  document.title = title;
  const set = (id, val) => { const el=document.getElementById(id); if(el) el.setAttribute('content',val); };
  set('ogTitle', title); set('twTitle', title);
  set('ogDesc', desc);   set('twDesc', desc);
  set('ogUrl', url);
  set('ogImage', img);   set('twImage', img);
  const canon = document.getElementById('canonicalLink');
  if(canon) canon.setAttribute('href', url);
}

// ── Share / copy link ─────────────────────────────────────────────────────
function shareFontLink(){
  const url = location.href;
  if(navigator.share){
    navigator.share({ title: document.title, url: url }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(url).then(()=>{
      showToast('🔗 Link copied!');
      const btn = document.getElementById('fdpShareBtn');
      if(btn){ const orig=btn.innerHTML; btn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!'; setTimeout(()=>{ btn.innerHTML=orig; },2000); }
    }).catch(()=>{ showToast('Copy: ' + url); });
  }
}

function syncUrl(pushNav){
  // Yalnız grid görünüşündə işlə — font-detail, author, profile, admin-də URL-ə toxunma
  const _fdp = document.getElementById('fontDetailPage');
  const _ap  = document.getElementById('authorPage');
  const _pp  = document.getElementById('profilePage');
  if(_fdp && _fdp.classList.contains('visible')) return;
  if(_ap  && _ap.style.display  !== 'none' && _ap.style.display  !== '') return;
  if(_pp  && _pp.style.display  !== 'none' && _pp.style.display  !== '') return;
  if(location.pathname === '/admin') return;
  const p=new URLSearchParams();
  if(activeCategory && activeCategory!=='all') p.set('cat',activeCategory);
  if(searchTerm) p.set('q',searchTerm);
  if(alphaFilter) p.set('alpha',alphaFilter);
  if(freeOnly) p.set('free','1');
  if(activeLicenseFilter) p.set('license',activeLicenseFilter);
  const sort=document.getElementById('sortSel');
  if(sort && sort.value && sort.value!=='popular') p.set('sort',sort.value);
  if(currentPage>1) p.set('page',currentPage);
  const qs=p.toString();
  const newUrl=qs?'/?'+qs:'/';
  if(pushNav) _safeHistoryPush({page:'grid'},'',newUrl);
  else _safeHistoryReplace({page:'grid'},'',newUrl);
  // Title
  let _metaTitle, _metaDesc;
  if(activeCategory && activeCategory!=='all'){
    _metaTitle = activeCategory.charAt(0).toUpperCase()+activeCategory.slice(1)+' Fonts – Font·Monster';
    _metaDesc = 'Browse free ' + activeCategory + ' fonts on Font·Monster.';
  } else if(searchTerm){
    _metaTitle = '"'+searchTerm+'" – Font·Monster';
    _metaDesc = 'Search results for "' + searchTerm + '" on Font·Monster.';
  } else if(alphaFilter){
    _metaTitle = alphaFilter+' Fonts – Font·Monster';
    _metaDesc = 'Browse fonts starting with ' + alphaFilter + ' on Font·Monster.';
  } else if(freeOnly){
    _metaTitle = 'Free Fonts – Font·Monster';
    _metaDesc = 'Browse 100% free fonts on Font·Monster.';
  } else {
    _metaTitle = 'Font·Monster - Free Font Discovery';
    _metaDesc = 'Discover and download thousands of free fonts. Browse by category, style, license and more.';
  }
  updatePageMeta({ title: _metaTitle, description: _metaDesc, url: newUrl });
}
// URL-dən state-i oxu və tətbiq et (DOMContentLoaded + popstate üçün)
function restoreFromUrl(){
  const p=new URLSearchParams(location.search);
  activeCategory=p.get('cat')||'all';
  searchTerm=p.get('q')||'';
  alphaFilter=p.get('alpha')||'';
  freeOnly=p.get('free')==='1';
  activeLicenseFilter=p.get('license')||null;
  currentPage=parseInt(p.get('page'))||1;
  const sort=p.get('sort')||'popular';
  // UI-ni sinxronlaşdır
  const si=document.getElementById('searchInput'); if(si) si.value=searchTerm;
  const ss=document.getElementById('sortSel'); if(ss){ ss.value=sort; if(typeof refreshCustomSelect==='function') refreshCustomSelect('sortSel'); }
  const ft=document.getElementById('freeToggle'); if(ft) ft.classList.toggle('free-active',freeOnly);
  document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active',b.dataset.cat===activeCategory));
  document.querySelectorAll('.sb-item[data-scat]').forEach(b=>b.classList.toggle('active',b.dataset.scat===activeCategory));
  document.querySelectorAll('.alpha-btn').forEach(b=>b.classList.toggle('active',b.textContent.trim()===(alphaFilter===''?'All':alphaFilter==='#'?'0-9':alphaFilter)));
  if(typeof renderFonts==='function') renderFonts();
}

function setAlpha(letter){
  _ensureGridView();
  alphaFilter=letter;currentPage=1;
  searchTerm='';document.getElementById('searchInput').value='';
  activeTag='';
  document.querySelectorAll('#tagList .sb-item').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.alpha-btn').forEach(b=>b.classList.toggle('active',b.textContent.trim()===(letter===''?'All':letter==='#'?'0-9':letter)));
  renderFonts();
  syncUrl(true);
}
function toggleFreeOnly(btn){
  _ensureGridView();
  freeOnly=!freeOnly;currentPage=1;
  btn.classList.toggle('free-active',freeOnly);
  renderFonts();
  syncUrl(true);
}
function onSortChange(){
  _ensureGridView();
  currentPage=1;renderFonts();
  syncUrl(true);
}
function switchCardChar(btn,chars,fname,fw){
  const wrap=btn.closest('.card-charmap');
  if(!wrap)return;
  const set=wrap.querySelector('.card-charmap-set');
  set.innerHTML=chars.split('').map(ch=>`<span style="font-family:'${fname}',sans-serif;font-weight:${fw}">${ch}</span>`).join('');
  wrap.querySelectorAll('.cc-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}
// ── Font kartının bütün HTML-ini qaytarır ────────────────────────────────────
// renderFonts() bu funksiyaya istinad edir; kart dizaynını dəyişmək üçün
// yalnız bu funksiyaya baxmaq kifayətdir.
function _buildCardHTML(font, opts){
  const {isLiked,isCom,isNew,isHot,txt,fs,dlCount,isInCmp,glyphs}=opts;
  const ratingHTML=(()=>{
    const r=getFontAvgRating(font.id);
    if(!r||r.count===0)return '';
    const full=Math.round(r.avg);
    return `<span style="color:#f5a623;font-size:10px;letter-spacing:0.5px" title="${r.avg.toFixed(1)} stars from ${r.count} review${r.count!==1?'s':''}">${'★'.repeat(full)}${'☆'.repeat(5-full)}</span><span style="font-size:10px;color:var(--text3)">${r.avg.toFixed(1)}</span>`;
  })();
  const langHTML=(()=>{
    const uniq=_LANG_CACHE[font.id]||getFontLangs(font);
    return uniq.map((l,i)=>{const c=_LANG_COLORS[i%_LANG_COLORS.length];return`<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:980px;background:${c.bg};border:1px solid ${c.border};color:${c.text};letter-spacing:.02em;white-space:nowrap">${l}</span>`;}).join('')+`<span id="lang-count-${font.id}" style="font-size:9px;font-weight:600;color:var(--text3);white-space:nowrap;margin-left:3px">· .</span>`;
  })();
  const tagsHTML=font.tags.map(t=>`<span class="tag" style="cursor:pointer" onclick="event.stopPropagation();(function(tag){activeTag=tag;searchTerm='';document.getElementById('searchInput').value='';activeCategory='all';activeLicenseFilter=null;alphaFilter='';currentPage=1;document.querySelectorAll('#tagList .sb-item').forEach(function(b){b.classList.toggle('active',b.dataset.tag===tag);});document.querySelectorAll('.cat').forEach(function(b){b.classList.toggle('active',b.dataset.cat==='all');});document.querySelectorAll('.alpha-btn').forEach(function(b){b.classList.toggle('active',b.textContent.trim()==='All');});renderFonts();syncUrl(true);showToast('&#34;'+tag+'&#34; fonts');}('${esc(t)}'))" title="Filter by ${esc(t)}">${esc(t)}</span>`).join('');
  return `
      <div class="card-header">
        <div class="card-header-shimmer"></div>
        <div class="ch-fall"></div>
        <div style="position:relative;z-index:2;flex:1;min-width:0">
          <div class="card-name">${esc(font.name)}${isCom?'<span class="community-badge">Community</span>':''}${isNew?'<span class="new-badge"><i class="new-badge-star">✦</i>New</span>':''}${isHot?'<span class="hot-badge"><i class="hot-badge-fire">🔥</i>Hot</span>':''}</div>
          <div class="card-author"><span onclick="event.stopPropagation();openAuthorPage('${esc(font.author)}')" style="cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${esc(font.author)}</span> · ${font.year}</div>
        </div>
        <div class="card-actions" style="position:relative;z-index:2">
          <div class="dl-count" data-fid="${font.id}">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${fmtDlCountFor(font.id)}
            ${!DL_IS_ESTIMATED[font.id]&&DL_YESTERDAY[font.id]?`<span style="opacity:0.45;font-size:9px;margin-left:2px;border-left:1px solid rgba(255,255,255,0.2);padding-left:5px" title="Yesterday downloads">yesterday +${fmtDlCount(DL_YESTERDAY[font.id])}</span>`:''}
          </div>
          <button class="icon-btn ${isInCmp?'compare-on':''}" title="Compare" data-compare-btn="${font.id}"
            onclick="event.stopPropagation();addToCompare('${font.id}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
          </button>
          <button class="icon-btn ${isLiked?'liked':''}"
            aria-label="${isLiked?'Saved – click to unsave':'Save font'}"
            aria-pressed="${isLiked?'true':'false'}"
            onclick="event.stopPropagation();toggleLike('${font.id}',this)">${isLiked?'♥':'♡'}</button>
          <a href="#" class="dl-btn"
            onclick="event.stopPropagation();event.preventDefault();handleDownloadClick('${font.id}','${esc(font.name)}');return false;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${(font.fontData||font.fontUrl)?'Get Font':'Download'}
          </a>
        </div>
      </div>
      <div class="card-preview-area" onclick="openDetail('${font.id}')">
        <div class="card-preview" id="prev-${font.id}" data-fontname="${esc(font.name)}" style="${fs}">${esc(txt)}</div>
        <div class="card-glyph-strip">
          ${glyphs.map(ch=>`<span style="font-family:'${font.name}',sans-serif;font-weight:${font.weight}">${ch}</span>`).join('')}
        </div>
      </div>
      <div class="card-footer" onclick="openDetail('${font.id}')">
        <div class="tags">${tagsHTML}</div>
        <div style="display:flex;align-items:center;gap:6px">
          ${ratingHTML}
          ${licBadge(font.license)}
        </div>
      </div>
      <div class="card-charmap" onclick="event.stopPropagation()">
        <span class="card-charmap-set" data-fid="${font.id}" data-fw="${font.weight}" data-active="upper">
          ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(ch=>`<span style="font-family:'${font.name}',sans-serif;font-weight:${font.weight}">${ch}</span>`).join('')}
        </span>
        <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
          <div class="card-charmap-tabs">
            <button class="cc-tab active" onclick="switchCardChar(this,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','${esc(font.name)}','${font.weight}')">Aa</button>
            <button class="cc-tab" onclick="switchCardChar(this,'abcdefghijklmnopqrstuvwxyz','${esc(font.name)}','${font.weight}')">aa</button>
            <button class="cc-tab" onclick="switchCardChar(this,'0123456789','${esc(font.name)}','${font.weight}')">09</button>
            <button class="cc-tab" onclick="switchCardChar(this,'!@#\$%&amp;*(){}[]?','${esc(font.name)}','${font.weight}')">!@</button>
          </div>
          <div style="width:1px;height:18px;background:var(--border2);flex-shrink:0;margin:0 3px"></div>
          ${langHTML}
        </div>
      </div>`;
}

function renderFonts(){
  window._lastRenderFontsAt = Date.now();
  const grid=document.getElementById('fontGrid');grid.innerHTML="";
  const allList=getFiltered();updateCounts();
  const pp=parseInt(perPage)||0;
  const total=allList.length;
  const maxPage=pp>0?Math.ceil(total/pp):1;
  if(currentPage>maxPage)currentPage=1;
  const list=pp>0?allList.slice((currentPage-1)*pp,currentPage*pp):allList;
  const title=document.getElementById('resultTitle');
  if(!total){document.getElementById('emptyState').classList.add('show');title.innerHTML='<strong>0</strong> fonts';renderPagination(0,1,pp);return;}
  document.getElementById('emptyState').classList.remove('show');
  const from=pp>0?(currentPage-1)*pp+1:1,to=pp>0?Math.min(currentPage*pp,total):total;
  title.innerHTML=`<strong>${total}</strong> font${total!==1?'s':''}${pp>0&&total>pp?` <span style="color:var(--text3);font-size:.78em">· showing ${from}-${to}</span>`:''}${activeLicenseFilter?` · <span style="color:var(--text3)">${LICENSE_META[activeLicenseFilter]?.label||''} only</span>`:''}`;
  const glyphs='ABCDEFGHJKLMNOPQRST'.split('');
  const top5ids=FONTS_BASE.slice().sort((a,b)=>(DL_COUNTS[b.id]||0)-(DL_COUNTS[a.id]||0)).slice(0,5).map(f=>f.id);
  list.forEach((font,i)=>{
    loadFont(font);
    const card=document.createElement('div');card.className='font-card';
    card.style.animationDelay=`${Math.min(i*0.03,0.28)}s`;
    const isLiked=likedFonts.has(font.id),isCom=!FONTS_BASE.find(f=>f.id===font.id);
    const isNew=isNewFont(font);
    const isHot=!isNew && !isCom && top5ids.includes(font.id);
    const txt=previewText||font.name;
    const _cardVariant=(font.fontVariants&&font.fontVariants.length>0)?font.fontVariants[0]:null;
    const _cardFamily=_cardVariant?(_cardVariant._familyName||(font.name+' '+parseVariantStyle(_cardVariant.name||'').label)):font.name;
    const _cardWeight=_cardVariant?String(parseVariantStyle(_cardVariant.name||'').weight||font.weight||'400'):(font.weight||'400');
    const fs=`font-family:'${_cardFamily}',sans-serif;font-weight:${_cardWeight};font-size:${fontSize}px;`;
    const dlCount=DL_COUNTS[font.id]||0,isInCmp=compareFonts.includes(font.id);
    card.innerHTML=_buildCardHTML(font,{isLiked,isCom,isNew,isHot,txt,fs,dlCount,isInCmp,glyphs});
    grid.appendChild(card);
  });

  // Batch lang detection AFTER all cards are in DOM - prevents 20 simultaneous fetches
  const _batchFonts = list.filter(f => !_GLYPH_COUNT_CACHE[f.id]);
  let _batchIdx = 0;
  function _runNextLangBatch(){
    const chunk = _batchFonts.slice(_batchIdx, _batchIdx + 4);
    if(!chunk.length) return;
    _batchIdx += 4;
    chunk.forEach(font => {
      updateCardLangCount(font.id);
      resolveFontLangs(font, langs => {
        const langWrap = document.querySelector(`#lang-count-${font.id}`)?.parentElement;
        if(!langWrap) return;
        langWrap.innerHTML = langs.map((l,i)=>{const c=_LANG_COLORS[i%_LANG_COLORS.length];return`<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:980px;background:${c.bg};border:1px solid ${c.border};color:${c.text};letter-spacing:.02em;white-space:nowrap">${l}</span>`;}).join('')+`<span id="lang-count-${font.id}" style="font-size:9px;font-weight:600;color:var(--text3);white-space:nowrap;margin-left:3px">· ${langs.length}+ languages</span>`;
      });
    });
    if(_batchIdx < _batchFonts.length) setTimeout(_runNextLangBatch, 300);
  }
  setTimeout(_runNextLangBatch, 150);
  renderPagination(total,currentPage,pp);
  renderRecentList();
  setTimeout(injectAllFallingLettersDebounced, 80); // debounced - prevents stacking on rapid filter changes
}

function handleDownloadClick(fontId,fontName){
  incrementDownload(fontId);
  const font=FONTS.find(f=>f.id===fontId);
  if(font && font.fontVariants && font.fontVariants.length > 1){
    // Çoxlu variant - ZIP kimi yüklə
    showToast(`⏳ ZIP hazırlanır...`);
    (async()=>{
      try{
        const zip=new JSZip();
        const folder=zip.folder(fontName.replace(/\s+/g,'_'));
        await Promise.all(font.fontVariants.map(async(v,i)=>{
          const url=v.url||v.fontData||v.data;
          const fileName=(v.name||fontName+'_'+i+(v.ext||'.ttf')).replace(/^.*[\/\\]/,'');
          if(!url) return;
          if(url.startsWith('data:')){
            const base64=url.split(',')[1];
            folder.file(fileName, base64, {base64:true});
          } else {
            const res=await fetch(url);
            const buf=await res.arrayBuffer();
            folder.file(fileName, buf);
          }
        }));
        const blob=await zip.generateAsync({type:'blob'});
        const a=document.createElement('a');
        a.href=URL.createObjectURL(blob);
        a.download=fontName.replace(/\s+/g,'_')+'_fonts.zip';
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(a.href),60000);
        showToast(`✅ ${font.fontVariants.length} variant ZIP kimi yükləndi`);
      } catch(err){
        console.error(err);
        showToast('ZIP xətası, ayrı-ayrı yüklənir.');
        font.fontVariants.forEach((v,i)=>{
          setTimeout(()=>{
            const a=document.createElement('a');
            a.href=v.url||v.fontData;
            a.download=v.name||fontName+'_'+i+(v.ext||'.ttf');
            document.body.appendChild(a);a.click();document.body.removeChild(a);
          },i*400);
        });
      }
    })();
  } else if(font && font.gfamily){
    showToast(`⏳ Preparing download...`);
    downloadGoogleFontZip(font).then(ok=>{
      if(ok) showToast(`⬇️ ${fontName} downloaded`);
    });
  } else if(font && (font.fontData || font.fontUrl)){
    const ext=font.fontExt||'.ttf';
    const href = font.fontUrl || font.fontData;
    const a=document.createElement('a');
    a.href=href;
    a.download=fontName.replace(/\s+/g,'_')+ext;
    if(font.fontUrl) a.target='_blank';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    showToast(`⬇️ Downloading ${fontName}${ext}.`);
  } else {
    showToast(`⬇️ Downloading ${fontName}.`);
  }
  if(window.fbIncrementDownload) window.fbIncrementDownload(fontId).catch(()=>{});
  // DL_COUNTS already incremented by incrementDownload() above â do NOT increment again here
  const card=document.querySelector(`#prev-${fontId}`)?.closest('.font-card');
  if(card){
    const c=card.querySelector('.dl-count');
    if(c)c.innerHTML=`<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>${fmtDlCountFor(fontId)}`;
  }
}

// Google Fonts üçün birbaşa ZIP download: CSS-dən woff2/ttf url-lərini çıxarıb fetch+zip edir
async function downloadGoogleFontZip(font){
  try{
    const family=font.gfamily||font.name.replace(/\s+/g,'+');
    const cssUrl=`https://fonts.googleapis.com/css2?family=${family}&display=swap`;
    const resp=await fetch(cssUrl,{headers:{'User-Agent':'Mozilla/5.0'}});
    let css=await resp.text();
    // Bezi shilder/userAgent format-larinda woff2 yoxdur; ttf üçün fallback istəyirik
    if(!/url\(/.test(css)){
      throw new Error('No font URLs found in CSS');
    }
    // Her @font-face blokunu ayri-ayri parse et (weight/style/subset meta-sini saxlamaq üçün)
    const faceBlocks=css.match(/@font-face\s*{[^}]*}/g)||[];
    const seen=new Set();
    const files=[];
    for(const block of faceBlocks){
      const urlMatch=block.match(/url\(([^)]+)\)/);
      if(!urlMatch) continue;
      let url=urlMatch[1].replace(/['"]/g,'');
      if(seen.has(url)) continue;
      seen.add(url);
      const weightMatch=block.match(/font-weight:\s*([0-9]+)/);
      const styleMatch=block.match(/font-style:\s*(\w+)/);
      const weight=weightMatch?weightMatch[1]:'400';
      const style=styleMatch&&styleMatch[1]==='italic'?'italic':'normal';
      const ext=url.split('.').pop().split('?')[0];
      files.push({url,weight,style,ext});
    }
    if(files.length===0) throw new Error('No font files parsed');
    const zip=new JSZip();
    const folder=zip.folder(font.name.replace(/\s+/g,'_'));
    await Promise.all(files.map(async f=>{
      const res=await fetch(f.url);
      const buf=await res.arrayBuffer();
      const fname=`${font.name.replace(/\s+/g,'_')}-${f.weight}${f.style==='italic'?'Italic':''}.${f.ext}`;
      folder.file(fname,buf);
    }));
    const blob=await zip.generateAsync({type:'blob'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=font.name.replace(/\s+/g,'_')+'_fonts.zip';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(a.href),60000);
    return true;
  }catch(err){
    console.error('downloadGoogleFontZip error:',err);
    showToast('⚠ Download failed, opening Google Fonts...');
    window.open(`https://fonts.google.com/specimen/${encodeURIComponent(font.name)}`,'_blank');
    return false;
  }
}
function updateCounts(){
  ["all","sans-serif","serif","display","handwriting","monospace","other"].forEach(c=>{
    const el=document.getElementById(`sc-${c}`);
    if(el)el.textContent=c==="all"?FONTS.length:FONTS.filter(f=>f.cat===c).length;
  });
  const scNew=document.getElementById('sc-new');
  if(scNew)scNew.textContent=FONTS.filter(isNewFont).length;
}
function updateAllPreviews(){
  previewText=document.getElementById('previewText').value;
  document.querySelectorAll('.card-preview').forEach(el=>{
    el.textContent=previewText||(el.dataset.fontname||'');
  });
}
function updateSize(){
  fontSize=parseInt(document.getElementById('sizeRange').value);
  document.getElementById('sizeNum').textContent=fontSize;
  document.querySelectorAll('.card-preview').forEach(el=>el.style.fontSize=fontSize+'px');
}
function setCategory(cat){
  _ensureGridView();
  clearTimeout(debounceTimer);
  activeCategory=cat;activeLicenseFilter=null;currentPage=1;
  // Clear both search input and activeTag so neither interferes with category filter
  searchTerm='';
  const _si=document.getElementById('searchInput');
  if(_si){_si.value='';}
  activeTag='';
  document.querySelectorAll('#tagList .sb-item').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));
  document.querySelectorAll('.sb-item[data-scat]').forEach(b=>b.classList.toggle('active',b.dataset.scat===cat));
  renderFonts();
  if(cat==='new')showToast('✨ Recently added & new releases');
  syncUrl(true);
}
function debouncedFilter(){
  clearTimeout(debounceTimer);
  debounceTimer=setTimeout(()=>{searchTerm=document.getElementById('searchInput').value.trim();currentPage=1;renderFonts();syncUrl();},155);
}
function toggleLike(id,btn){
  if(!window.currentUser){openAuthModal('login');showToast('Sign in to save fonts');return;}
  if(likedFonts.has(id)){
    likedFonts.delete(id);
    if(btn){btn.textContent='♡';btn.classList.remove('liked');btn.setAttribute('aria-label','Save font');btn.setAttribute('aria-pressed','false');}
    showToast('Removed from saved');
  } else {
    likedFonts.add(id);
    if(btn){btn.textContent='♥';btn.classList.add('liked');btn.setAttribute('aria-label','Saved – click to unsave');btn.setAttribute('aria-pressed','true');}
    showToast('❤️ Saved');
  }
  window.currentUser.saved=[...likedFonts];
  saveCurrentUser(window.currentUser);
  if(window.fbToggleSave){
    window.fbToggleSave(id).catch(e=>console.warn('fbToggleSave error:',e));
  } else {
    const users=getUsers();
    const idx=users.findIndex(u=>u.id===window.currentUser.id);
    if(idx>=0){users[idx].saved=window.currentUser.saved;saveUsers(users);}
  }
  const sc=document.getElementById('profileSavedCount');
  if(sc)sc.textContent=window.currentUser.saved.length;
  localStorage.setItem("tv_liked",JSON.stringify([...likedFonts]));
  const lb=document.getElementById('fdpLikeBtn');
  if(lb&&lb.dataset.id===id){lb.className='fdp-like'+(likedFonts.has(id)?' liked':'');lb.innerHTML=likedFonts.has(id)?'♥ Saved':'♡ Save';lb.setAttribute('aria-label',likedFonts.has(id)?'Saved – click to unsave':'Save font');lb.setAttribute('aria-pressed',likedFonts.has(id)?'true':'false');}
}

// ??????????????????????????????????????????
// AUTH SYSTEM
// ??????????????????????????????????????????
// window.currentUser is declared at top of main globals block (line ~4973)

function getUsers(){try{return JSON.parse(localStorage.getItem('fn_users')||'[]');}catch(e){return[];}}
function saveUsers(u){try{localStorage.setItem('fn_users',JSON.stringify(u));}catch(e){}}
function getCurrentUser(){try{const u=localStorage.getItem('fn_current_user');return u?JSON.parse(u):null;}catch(e){return null;}}
function saveCurrentUser(u){
  // Never persist password, isAdmin, or isModerator into localStorage.
  // isAdmin/isModerator must always be re-fetched from Firestore on auth init —
  // caching them allows anyone to fake admin access via browser console.
  const safe={...u};
  delete safe.password;
  delete safe.isAdmin;
  delete safe.isModerator;
  try{localStorage.setItem('fn_current_user',JSON.stringify(safe));}catch(e){}
}

// SHA-256 via Web Crypto - used only by the offline fallback auth system
async function _sha256(str){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function initAuth(){
  window.currentUser=getCurrentUser();
  if(window.currentUser){updateNavForUser(window.currentUser);}
  // Sync likedFonts from user account
  if(window.currentUser){
    likedFonts=new Set(window.currentUser.saved||[]);
  }
  syncSubmittedFonts();
  // Check admin URL
  // ?admin=1 URL bypass removed - admin panel only accessible after Firebase confirms isAdmin
}

async function socialLogin(provider) {
  const auth = window._fbAuth;
  const db = window._fbDb;
  if (!auth) { showToast('Firebase not ready'); return; }
  let prov;
  if (provider === 'google') prov = window._fbGoogleProvider;
  else if (provider === 'github') prov = window._fbGithubProvider;
  else if (provider === 'facebook') prov = window._fbFacebookProvider;
  if (!prov) return;
  try {
    closeAuthModal(); // Google popup acilmadan evvel modali bag la
    const result = await window._fbSignInWithPopup(auth, prov);
    const fbUser = result.user;
    // Create/update Firestore user doc
    const {doc, setDoc, getDoc, serverTimestamp} = window._fbFns;
    const snap = await getDoc(doc(db, 'users', fbUser.uid));
    const extra = snap.exists() ? snap.data() : {};
    console.log('🔐 Login UID:', fbUser.uid, '| Firestore doc exists:', snap.exists(), '| isAdmin:', extra.isAdmin);
    if (!snap.exists()) {
      await setDoc(doc(db, 'users', fbUser.uid), {
        name: fbUser.displayName || fbUser.email.split('@')[0],
        email: fbUser.email,
        photo: fbUser.photoURL || null,
        saved: [],
        joined: new Date().toISOString(),
        emailVerified: true,
        createdAt: serverTimestamp()
      });
    }
    // isAdmin ve diger melumatları dərhal yüklə - onAuthStateChanged-i gözləmə
    const user = {
      id: fbUser.uid,
      name: fbUser.displayName || extra.name || fbUser.email.split('@')[0],
      email: fbUser.email,
      emailVerified: true,
      photo: fbUser.photoURL || extra.photo || null,
      saved: extra.saved || [],
      joined: extra.joined || fbUser.metadata.creationTime,
      isAdmin: extra.isAdmin === true,
      isModerator: extra.isModerator === true
    };
    window.currentUser = user;
    window.currentUser = window.currentUser;
    likedFonts = new Set(user.saved);
    window.likedFonts = likedFonts;
    saveCurrentUser(user); // isAdmin/isModerator bu funksiya tərəfindən cache-ə yazılmır
    if(typeof updateNavForUser === 'function') updateNavForUser(user);
    showToast('👋 Welcome, ' + (fbUser.displayName || 'there') + '!' + (user.isAdmin ? ' 👑 Admin' : ''));
  } catch(err) {
    if (err.code === 'auth/account-exists-with-different-credential') {
      showToast('An account already exists with this email. Try another login method.');
    } else if (err.code !== 'auth/popup-closed-by-user') {
      showToast('Sign-in error: ' + err.message);
    }
  }
}

function openAuthModal(tab){
  const o=document.getElementById('authOverlay');
  o.classList.add('open');
  document.body.style.overflow='hidden';
  switchAuthTab(tab||'login');
  setTimeout(()=>{
    const inp=tab==='signup'?document.getElementById('signupName'):tab==='forgot'?document.getElementById('forgotEmail'):document.getElementById('loginEmail');
    if(inp)inp.focus();
  },120);
}
function closeAuthModal(){
  const o = document.getElementById('authOverlay');
  if(!o) return;
  o.classList.remove('open');
  document.body.style.overflow='';
}
function switchAuthTab(tab){
  document.getElementById('authLoginTab').style.display=tab==='login'?'block':'none';
  document.getElementById('authSignupTab').style.display=tab==='signup'?'block':'none';
  document.getElementById('authForgotTab').style.display=tab==='forgot'?'block':'none';
  document.getElementById('authVerifyTab').style.display=tab==='verify'?'block':'none';
  document.getElementById('loginError').textContent='';
  document.getElementById('signupError').textContent='';
  if(tab==='forgot'){
    document.getElementById('forgotError').textContent='';
    document.getElementById('forgotSuccess').style.display='none';
    const btn=document.getElementById('forgotSubmitBtn');
    if(btn){btn.textContent='Send Reset Link';btn.disabled=false;}
  }
}

async function submitForgotPassword(){
  const email=document.getElementById('forgotEmail').value.trim();
  const err=document.getElementById('forgotError');
  const success=document.getElementById('forgotSuccess');
  const btn=document.getElementById('forgotSubmitBtn');
  err.textContent='';
  success.style.display='none';
  if(!email){err.textContent='Please enter your email address.';return;}
  if(!/\S+@\S+\.\S+/.test(email)){err.textContent='Please enter a valid email.';return;}
  btn.textContent='Sending.';btn.disabled=true;
  if(window.fbResetPassword){
    try{
      await window.fbResetPassword(email);
      success.style.display='block';
      btn.textContent='Resend Link';btn.disabled=false;
    }catch(e){
      btn.textContent='Send Reset Link';btn.disabled=false;
      if(e.code==='auth/user-not-found'||e.code==='auth/invalid-email'){
        err.textContent='No account found with this email address.';
      } else {
        err.textContent=e.message||'Something went wrong. Please try again.';
      }
    }
  } else {
    // Fallback: no Firebase - show generic message
    setTimeout(()=>{
      success.style.display='block';
      btn.textContent='Resend Link';btn.disabled=false;
    },800);
  }
}

function submitLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPassword').value;
  const err=document.getElementById('loginError');
  const btn=document.querySelector('#authLoginTab .auth-submit');
  if(!email||!pass){err.textContent='Please fill in all fields.';return;}
  err.textContent='';
  if(btn){btn.textContent='Signing in…';btn.disabled=true;}
  if(window.fbLogin){
    window.fbLogin(email,pass)
      .then(()=>{if(btn){btn.textContent='Sign In';btn.disabled=false;}closeAuthModal();showToast('👋 Welcome back!');})
      .catch(e=>{
        if(btn){btn.textContent='Sign In';btn.disabled=false;}
        const isWrongPass=e.code==='auth/invalid-credential'||e.code==='auth/wrong-password';
        const isGoogleAccount=e.code==='auth/account-exists-with-different-credential';
        err.innerHTML=isGoogleAccount
          ? 'This email is linked to Google. <span onclick="closeAuthModal();socialLogin(\'google\')" style="color:var(--accent);cursor:pointer;font-weight:600;text-decoration:underline;text-underline-offset:2px">Sign in with Google</span>'
          : isWrongPass
          ? 'Incorrect email or password. <span onclick="openAuthModal(\'forgot\')" style="color:var(--accent);cursor:pointer;font-weight:600;text-decoration:underline;text-underline-offset:2px">Forgot password?</span>'
          : e.message;
      });
  } else {
    // fallback localStorage - compare against stored SHA-256 hash
    (async()=>{
      const users=getUsers();
      const hash=await _sha256(pass);
      const user=users.find(u=>u.email===email&&u.passwordHash===hash);
      if(!user){if(btn){btn.textContent='Sign In';btn.disabled=false;}err.textContent='Incorrect email or password.';return;}
      const safeUser={...user};delete safeUser.passwordHash;
      window.currentUser=safeUser;saveCurrentUser(safeUser);
      likedFonts=new Set(window.currentUser.saved||[]);
      updateNavForUser(window.currentUser);closeAuthModal();
      syncSubmittedFonts();showToast(`👋 Welcome back, ${user.name}!`);
    })();
  }
}

function submitSignup(){
  const name=document.getElementById('signupName').value.trim();
  const email=document.getElementById('signupEmail').value.trim();
  const pass=document.getElementById('signupPassword').value;
  const pass2=(document.getElementById('signupPasswordConfirm')||{}).value||pass;
  const err=document.getElementById('signupError');
  if(!name||!email||!pass){err.textContent='Please fill in all fields.';return;}
  if(pass.length<6){err.textContent='Password must be at least 6 characters.';return;}
  if(pass!==pass2){err.textContent='Passwords do not match.';return;}
  if(!/\S+@\S+\.\S+/.test(email)){err.textContent='Please enter a valid email.';return;}
  err.textContent='Creating account.';
  if(window.fbSignup){
    window.fbSignup(name,email,pass)
      .then(()=>{
        // Modalı bağlamaq əvəzinə verify tab-ı göstər
        const verifyAddr=document.getElementById('verifyEmailAddr');
        if(verifyAddr) verifyAddr.textContent=email;
        switchAuthTab('verify');
      })
      .catch(e=>{
        const msg=e.code==='auth/email-already-in-use'?'An account with this email already exists.':e.message;
        err.textContent=msg;
      });
  } else {
    // fallback localStorage - store SHA-256 hash, NEVER plaintext password
    (async()=>{
      const users=getUsers();
      if(users.find(u=>u.email===email)){err.textContent='An account with this email already exists.';return;}
      const passwordHash=await _sha256(pass);
      const newUser={id:'u_'+Date.now(),name,email,passwordHash,saved:[],joined:new Date().toISOString()};
      users.push(newUser);saveUsers(users);
      const safeUser={...newUser};delete safeUser.passwordHash;
      window.currentUser=safeUser;saveCurrentUser(safeUser);
      updateNavForUser(window.currentUser);closeAuthModal();
      syncSubmittedFonts();showToast(`🎉 Account created! Welcome, ${name}!`);
    })();
  }
}

// ?? Email dogrulama yenid?n gönd?r ??
async function resendVerificationEmail(){
  const btn=document.getElementById('resendVerifyBtn');
  if(!btn) return;
  const fbUser = window._fbAuth && window._fbAuth.window.currentUser;
  if(!fbUser){showToast('❌ Error: user not found');return;}
  btn.textContent='Sending.';btn.disabled=true;
  try{
    const { sendEmailVerification } = window._fbFns;
    await sendEmailVerification(fbUser, {
      url: window.location.origin + '/',
      handleCodeInApp: false
    });
    showToast('📧 Verification link resent!');
    btn.textContent='✓ Sent';
    setTimeout(()=>{btn.textContent='Resend Email';btn.disabled=false;},4000);
  }catch(e){
    showToast('❌ Error: '+e.message);
    btn.textContent='Resend Email';btn.disabled=false;
  }
}

function showVerifyEmailModal(){
  document.getElementById('verifyEmailModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeVerifyEmailModal(){
  document.getElementById('verifyEmailModal').classList.remove('open');
  document.body.style.overflow='';
}

// ?? Email dogrulama banner-i (login etmis amma dogrulamamis) ??
function showEmailVerifyBanner(){
  if(document.getElementById('emailVerifyBanner')) return;
  const banner=document.createElement('div');
  banner.id='emailVerifyBanner';
  banner.style.cssText=`
    position:fixed;bottom:72px;left:50%;transform:translateX(-50%);
    background:linear-gradient(135deg,#007aff,#0051d5);
    color:#fff;padding:11px 20px;border-radius:12px;
    font-size:13px;font-weight:500;z-index:900;
    box-shadow:0 4px 24px rgba(0,122,255,0.35);
    display:flex;align-items:center;gap:12px;
    animation:ssSlideUp .4s cubic-bezier(0.34,1.56,0.64,1) both;
    max-width:calc(100vw - 32px);
  `;
  banner.innerHTML=`
    <span>⚠️ Your email is not verified yet</span>
    <button onclick="resendVerificationEmail()" style="
      background:rgba(255,255,255,0.22);color:#fff;border:1px solid rgba(255,255,255,0.35);
      border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;
      font-family:var(--sans);white-space:nowrap;transition:background .15s;
    " onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.22)'">Send</button>
    <button onclick="document.getElementById('emailVerifyBanner').remove()" style="
      background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;
      font-size:16px;padding:0 2px;line-height:1;
    ">×</button>
  `;
  document.body.appendChild(banner);
  // 8 saniy? sonra öz-özün? baglansin
  setTimeout(()=>banner.remove?.(), 8000);
}

function logoutUser(){
  closeUserDropdown();
  if(window.fbLogout){
    window.fbLogout().then(()=>{
      window.currentUser=null;
      likedFonts=new Set();
      localStorage.removeItem('fn_current_user');
      localStorage.setItem('tv_liked','[]');
      showGrid();showToast('Logged out.');
    });
  } else {
    window.currentUser=null;localStorage.removeItem('fn_current_user');
    likedFonts=new Set();
    document.getElementById('userAvatarBtn').style.display='none';
    document.getElementById('loginBtn').style.display='flex';
    showGrid();showToast('Logged out.');renderFonts();
  }
}

// Admin status is read from Firestore (isAdmin:true field) - never stored in client code.
// To grant admin: Firebase Console ? Firestore ? users/{uid} ? isAdmin: true
function _isAdmin(u){ return !!(u && u.isAdmin === true); }
function _isModerator(u){ return !!(u && (u.isModerator === true || u.isAdmin === true)); }

function updateNavForUser(user){
  document.getElementById('loginBtn').style.display='none';
  const btn=document.getElementById('userAvatarBtn');
  btn.style.display='flex';
  const navAv=document.getElementById('userAvatarCircle');
  if(user.photo){navAv.innerHTML=`<img src="${user.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;}
  else{navAv.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;}
  document.getElementById('userAvatarName').textContent=user.name.split(' ')[0];
  document.getElementById('udName').textContent=user.name;
  document.getElementById('udEmail').textContent=user.email;
  const adminItem=document.getElementById('adminDropdownItem');
  if(adminItem) adminItem.style.display=_isAdmin(user)?'flex':'none';
  // Show moderator panel link for moderators (non-admin)
  const modItem=document.getElementById('modDropdownItem');
  if(modItem) modItem.style.display=(!_isAdmin(user) && user.isModerator)?'flex':'none';
  // Dogrulanmamis email üçün banner - yalniz admin olmayan istifad?çil?r?
  // (göy banner deaktiv edilib, ?vəzin? submit zamani modal göst?rilir)
}

function toggleUserDropdown(){
  document.getElementById('userDropdown').classList.toggle('open');
}
function closeUserDropdown(){
  document.getElementById('userDropdown').classList.remove('open');
}
document.addEventListener('click',e=>{
  const btn=document.getElementById('userAvatarBtn');
  if(btn&&!btn.contains(e.target))closeUserDropdown();
});

// ?? PROFILE PAGE
function showProfile(tab){
  if(!window.currentUser && window.currentUser) window.currentUser = window.currentUser;
  if(!window.currentUser){openAuthModal('login');return;}
  closeUserDropdown();
  const _adm=document.getElementById('adminPanelOverlay');
  if(_adm&&_adm.style.display!=='none') closeAdminPanel(true);
  const _mod=document.getElementById('modPanelOverlay');
  if(_mod&&_mod.style.display!=='none') closeModPanel(true);
  document.getElementById('gridLayout').style.display='none';
  document.getElementById('fontDetailPage').classList.remove('visible');
  document.getElementById('toolbarBar').style.display='none';
  document.getElementById('heroSection').style.display='none';
  document.getElementById('authorPage').style.display='none';
  document.getElementById('profilePage').style.display='block';
  window.scrollTo(0,0);
  renderProfilePage();
  const activeTab = tab || 'myfonts';
  switchProfileTab(activeTab);
  const newProfileUrl = '/profile/' + activeTab;
  if(location.pathname === newProfileUrl){
    _safeHistoryReplace({page:'profile', tab: activeTab}, '', newProfileUrl);
  } else {
    _safeHistoryPush({page:'profile', tab: activeTab}, '', newProfileUrl);
  }
  document.title = 'My Profile – Font·Monster';
  updatePageMeta({ title: 'My Profile – Font·Monster', url: '/profile' });
}
function renderProfilePage(){
  if(!window.currentUser && window.currentUser) window.currentUser = window.currentUser;
  if(!window.currentUser)return;
  document.getElementById('profileName').textContent=window.currentUser.name;
  document.getElementById('profileEmail').textContent=window.currentUser.email;
  const saved=window.currentUser.saved||[];
  document.getElementById('profileSavedCount').textContent=saved.length;
  const myFonts=getMySubmittedFonts();
  document.getElementById('profileMyFontsCount').textContent=myFonts.length;
  applyProfilePhoto(window.currentUser.photo||null);
  renderProfileSaved(saved);
}

function getMySubmittedFonts(){
  if(!window.currentUser && window.currentUser) window.currentUser = window.currentUser;
  if(!window.currentUser) return [];
  try{
    const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
    return sub.filter(f=>f.submittedById===window.currentUser.id);
  }catch(e){return [];}
}

function renderProfileSaved(saved){
  const grid=document.getElementById('profileSavedGrid');
  const empty=document.getElementById('profileEmpty');
  if(!saved.length){grid.style.display='none';empty.style.display='block';return;}
  grid.style.display='grid';empty.style.display='none';
  const fonts=saved.map(id=>FONTS.find(f=>f.id===id)).filter(Boolean);
  grid.innerHTML=fonts.map(f=>{
    loadFont(f);
    const lic=LICENSE_META[f.license]||{label:f.license,cls:'lic-demo'};
    return `<div class="font-card" onclick="openDetail('${f.id}')" style="cursor:pointer;margin-bottom:0">
      <div class="card-header">
        <div class="card-header-shimmer"></div>
        <div class="ch-fall"></div>
        <div style="position:relative;z-index:2;flex:1;min-width:0">
          <div class="card-name">${esc(f.name)}</div>
          <div class="card-author"><span onclick="event.stopPropagation();openAuthorPage('${esc(f.author)}')" style="cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${esc(f.author)}</span> · ${f.year}</div>
        </div>
        <div class="card-actions" style="position:relative;z-index:2">
          <button class="icon-btn liked" aria-label="Saved – click to unsave" aria-pressed="true" onclick="event.stopPropagation();toggleLike('${f.id}',this);renderProfileSaved(window.currentUser?.saved||[])">♥</button>
        </div>
      </div>
      <div class="card-preview-area">
        <div class="card-preview" style="font-family:'${f.name}',sans-serif;font-size:38px">${esc(f.name)}</div>
      </div>
      <div class="card-footer">
        <div class="tags">${f.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
        <span class="lic-badge ${lic.cls}">${lic.label}</span>
      </div>
    </div>`;
  }).join('');
}

function renderMyFontsTab(){
  const myFonts=getMySubmittedFonts();
  const grid=document.getElementById('myFontsGrid');
  const empty=document.getElementById('myFontsEmpty');
  if(!myFonts.length){grid.style.display='none';empty.style.display='block';return;}
  grid.style.display='';empty.style.display='none';
  const adminReqs=getAdminRequests();
  grid.innerHTML=myFonts.map(f=>{
    const isPending=f.pending!==false;
    const hasPendingEdit=adminReqs.some(r=>r.id===f.id&&r.requestType==='edit');
    const statusColor=isPending?'var(--orange)':'var(--green)';
    const statusBg=isPending?'var(--orange-dim)':'var(--green-dim)';
    const statusLabel=isPending?'✏️ Pending Review':'✅ Approved';
    const statusExtra=!isPending&&f.approvedAt?`<div style="font-size:11px;color:var(--text3);margin-top:4px">Approved ${new Date(f.approvedAt).toLocaleDateString()}</div>`
      :(isPending?`<div style="font-size:11px;color:var(--text3);margin-top:4px">Submitted ${f.submittedAt?new Date(f.submittedAt).toLocaleDateString():'recently'} · Awaiting admin review</div>`:'')
    if(!f.previewImg) loadFont(f);
    const thumbStyle='width:56px;height:56px;border-radius:12px;flex-shrink:0;overflow:hidden;';
    const thumb=f.previewImg
      ? `<div style="${thumbStyle}"><img src="${f.previewImg}" style="width:100%;height:100%;object-fit:cover;"></div>`
      : `<div style="${thumbStyle}background:linear-gradient(135deg,var(--accent) 0%,#be123c 100%);display:flex;align-items:center;justify-content:center;font-family:'${f.name}',sans-serif;font-size:22px;color:#fff;letter-spacing:-0.03em">Aa</div>`;
    return `<div style="
      background:var(--surface-solid);border:1px solid ${hasPendingEdit?'var(--orange)':'var(--border)'};
      border-radius:var(--radius-lg);padding:16px 18px;
      display:flex;align-items:center;gap:14px;flex-wrap:wrap;
      margin-bottom:10px;transition:box-shadow .15s;
    " onmouseover="this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.boxShadow=''">
      ${thumb}
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;letter-spacing:-0.02em;color:var(--text)">${esc(f.name)}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:1px">${esc(f.author)} · ${cap(f.cat)} · ${f.year}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap">
          <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:980px;background:${statusBg};color:${statusColor};border:1px solid ${statusColor}33">${statusLabel}</span>
          ${hasPendingEdit?`<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:980px;background:var(--orange-dim);color:var(--orange);border:1px solid rgba(255,149,0,0.3)">✏ Edit pending review</span>`:''}
          ${f.tags.slice(0,3).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}
        </div>
        ${statusExtra}
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0">
        <button onclick="openEditFont('${f.id}')" style="
          padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;
          background:${hasPendingEdit?'var(--orange-dim)':'var(--surface3)'};
          border:1px solid ${hasPendingEdit?'rgba(255,149,0,0.4)':'var(--border2)'};
          color:${hasPendingEdit?'var(--orange)':'var(--text2)'};
          cursor:pointer;transition:all .15s;font-family:var(--sans);letter-spacing:-0.01em;
        " onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='${hasPendingEdit?'rgba(255,149,0,0.4)':'var(--border2)'}';this.style.color='${hasPendingEdit?'var(--orange)':'var(--text2)'}'">
          ✏️ Edit${hasPendingEdit?' (pending)':''}
        </button>
        <button onclick="deleteMyFont('${f.id}')" style="
          padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;
          background:var(--surface3);border:1px solid var(--border2);color:var(--text3);
          cursor:pointer;transition:all .15s;font-family:var(--sans);letter-spacing:-0.01em;
        " onmouseover="this.style.borderColor='var(--red)';this.style.color='var(--red)'" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--text3)'">
          🗑️ Delete
        </button>
      </div>
    </div>`;
  }).join('');
}

function switchProfileTab(tab){
  document.getElementById('ptMyFonts').classList.toggle('active',tab==='myfonts');
  document.getElementById('ptSaved').classList.toggle('active',tab==='saved');
  document.getElementById('profileTabSaved').style.display=tab==='saved'?'':'none';
  document.getElementById('profileTabMyFonts').style.display=tab==='myfonts'?'':'none';
  if(tab==='myfonts') renderMyFontsTab();
  if(location.pathname.startsWith('/profile')){
    _safeHistoryReplace({page:'profile',tab:tab},'','/profile/'+tab);
  }
}

function closeProfile(){
  document.getElementById('profilePage').style.display='none';
  document.getElementById('gridLayout').style.display='';
  document.getElementById('toolbarBar').style.display='';
  document.getElementById('heroSection').style.display='';
  try{ history.replaceState({page:'grid'},'','/'); }catch(e){}
  syncUrl(true);
  renderFonts();
  if(typeof window._restoreGridScroll==='function') window._restoreGridScroll();
  updatePageMeta({title:'Font·Monster - Free Font Discovery',url:'/'});
}

// ?? EDIT FONT - file/image helpers ??
let _efFileData=null, _efImgData=null, _efImgRemoved=false;
function handleEditDragOver(e){e.preventDefault();document.getElementById('efFileUploadZone').classList.add('drag-over');}
function handleEditDragLeave(e){document.getElementById('efFileUploadZone').classList.remove('drag-over');}
function handleEditDrop(e){
  e.preventDefault();
  document.getElementById('efFileUploadZone').classList.remove('drag-over');
  const f=e.dataTransfer.files[0];
  if(f) _applyEditFile(f);
}
function handleEditFileSelect(e){Array.from(e.target.files||[]).forEach(f=>_applyEditFile(f));}
let _efFileList=[];
function _applyEditFile(f){
  const fext='.'+f.name.split('.').pop().toLowerCase();
  const allowed=['.ttf','.otf','.woff','.woff2'];
  if(!allowed.includes(fext)){showToast(`✅ "${f.name}" - only TTF, OTF, WOFF, WOFF2 allowed`);return;}
  if(f.size>20*1024*1024){showToast('⚠ Font file too large - max 20 MB');return;}
  if(_efFileList.find(x=>x.name===f.name)){showToast(`"${f.name}" already added`);return;}
  const r=new FileReader();
  r.onload=ev=>{
    const entry={name:f.name,file:f,data:ev.target.result,size:f.size,ext:fext};
    _efFileList.push(entry);
    if(_efFileList.length===1) _efFileData=entry;
    _renderEditFileList();
  };
  r.readAsDataURL(f);
}
function _renderEditFileList(){
  const zone=document.getElementById('efFileUploadZone');
  const sel=document.getElementById('efFuzSelected');
  const nm=document.getElementById('efFuzSelectedName');
  if(!_efFileList.length){sel.style.display='none';zone.style.display='';return;}
  zone.style.display='none';
  sel.style.display='flex';
  nm.innerHTML=_efFileList.map((f,i)=>
    `<div style="display:flex;align-items:center;gap:6px;padding:2px 0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span style="font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.name}</span>
      <span style="font-size:11px;color:var(--text3);flex-shrink:0">${(f.size/1024).toFixed(0)} KB</span>
      <button onclick="_removeEditFile(${i})" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:13px;padding:0 2px;line-height:1;flex-shrink:0">×</button>
    </div>`
  ).join('');
  sel.style.flexDirection='column';
  sel.style.alignItems='stretch';
  sel.style.gap='3px';
}
function _removeEditFile(idx){
  _efFileList.splice(idx,1);
  _efFileData=_efFileList[0]||null;
  if(!_efFileList.length){document.getElementById('ef-file').value='';}
  _renderEditFileList();
}
function clearEditFile(){
  _efFileData=null;
  _efFileList=[];
  document.getElementById('ef-file').value='';
  document.getElementById('efFuzSelected').style.display='none';
  document.getElementById('efFileUploadZone').style.display='';
  const nm=document.getElementById('efFuzSelectedName');
  if(nm) nm.innerHTML='';
}
function handleEditImgSelect(inp){
  const f=inp.files[0];if(!f)return;
  if(!f.type.startsWith('image/')){showToast('⚠️ Only image files allowed');inp.value='';return;}
  if(f.size>3*1024*1024){showToast('⚠ Your image is too large - please use an image under 3 MB');inp.value='';return;}
  const r=new FileReader();
  r.onload=ev=>{
    _efImgData=ev.target.result;
    _efImgRemoved=false;
    document.getElementById('efImgThumb').src=_efImgData;
    document.getElementById('efImgPlaceholder').style.display='none';
    document.getElementById('efImgPreview').style.display='block';
  };
  r.readAsDataURL(f);
}
function clearEditImg(){
  _efImgData=null;
  _efImgRemoved=true;
  document.getElementById('ef-img').value='';
  document.getElementById('efImgPlaceholder').style.display='';
  document.getElementById('efImgPreview').style.display='none';
}
function _resetEditModal(){
  clearEditFile();
  clearEditImg();
  _efImgRemoved=false;
  document.getElementById('ef-year').value='';
  _efFileData=null; _efImgData=null;
}
// Mövcud font faylının olduğunu modalda göstərir (real fayl seçilməyib, sadəcə indikator)
function _showExistingFontFile(f){
  const hasFile=!!(f.fontData||f.fontUrl||(f.fontVariants&&f.fontVariants.length>0));
  if(!hasFile) return;
  const zone=document.getElementById('efFileUploadZone');
  const sel=document.getElementById('efFuzSelected');
  const nm=document.getElementById('efFuzSelectedName');
  let label='Current font file';
  if(f.fontVariants&&f.fontVariants.length>0){
    label=f.fontVariants.length>1?`${f.fontVariants.length} variants on file`:(f.fontVariants[0].name||'Current font file');
  } else if(f.fontUrl){
    label=f.fontUrl.split('/').pop().split('?')[0]||'Current font file';
  }
  zone.style.display='none';
  sel.style.display='flex';
  sel.style.flexDirection='';
  sel.style.alignItems='';
  sel.style.gap='';
  nm.innerHTML=`<span style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(label)}</span>`;
}

// ?? EDIT FONT ??
function openEditFont(fontId){
  const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
  const f=sub.find(x=>x.id===fontId);
  if(!f){showToast('Font not found');return;}
  _resetEditModal();
  document.getElementById('ef-id').value=f.id;
  document.getElementById('ef-name').value=f.name;
  document.getElementById('ef-author').value=f.author;
  document.getElementById('ef-cat').value=f.cat;refreshCustomSelect('ef-cat');
  document.getElementById('ef-license').value=f.license;refreshCustomSelect('ef-license');
  document.getElementById('ef-year').value=f.year||'';
  document.getElementById('ef-tags').value=(f.tags||[]).join(',');
  setTimeout(()=>_setTagChipValues('ef-tags-box','ef-tags-chips','ef-tags-input','ef-tags',f.tags||[]),50);
  document.getElementById('ef-url').value=f.sourceUrl||'';
  const efDesc=document.getElementById('ef-description');if(efDesc)efDesc.value=f.description||'';
  if(f.previewImg){_efImgData=f.previewImg;document.getElementById('efImgThumb').src=f.previewImg;document.getElementById('efImgPlaceholder').style.display='none';document.getElementById('efImgPreview').style.display='block';}
  _showExistingFontFile(f);
  document.getElementById('ef-admin-notice').style.display='none';
  document.getElementById('ef-user-notice').style.display='';
  document.getElementById('ef-review-notice').style.display='flex';
  document.getElementById('editFontModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeEditFont(){
  document.getElementById('editFontModal').classList.remove('open');
  _resetEditModal();
  window._adminDirectEditId=null;
  if(window._adminPanelWasOpen){
    window._adminPanelWasOpen=false;
    document.body.style.overflow='hidden';
  } else {
    document.body.style.overflow='';
  }
}
async function saveEditFont(){
  const id=document.getElementById('ef-id').value;
  const yearVal=document.getElementById('ef-year').value.trim();
  const updates={
    name:document.getElementById('ef-name').value.trim(),
    author:document.getElementById('ef-author').value.trim(),
    cat:document.getElementById('ef-cat').value,
    license:document.getElementById('ef-license').value,
    tags:document.getElementById('ef-tags').value.split(/[,\s]+/).map(t=>t.trim()).filter(Boolean),
    sourceUrl:document.getElementById('ef-url').value.trim(),
    description:(document.getElementById('ef-description')?.value||'').trim(),
    ...(yearVal?{year:parseInt(yearVal)}:{}),
    ...(_efImgData?{previewImg:_efImgData}:(_efImgRemoved?{previewImg:''}:{}))
  };
  if(!updates.name||!updates.author||!updates.cat||!updates.license){showToast('⚠️ Please fill in all required fields');return;}
  // Font fayli varsa PHP-y? yükl?
  if(_efFileList.length > 0){
    const saveBtn=document.querySelector('#editFontModal .submit-btn');
    if(saveBtn){saveBtn.textContent='Uploading.';saveBtn.disabled=true;}
    const fontId=updates.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')||id;
    let primarySet=false;
    for(let i=0;i<_efFileList.length;i++){
      const efd=_efFileList[i];
      // Storage Rules konfiqurasiya edilənə qədər dataUrl birbaşa işlət
      if(efd.dataUrl || efd.data){
        const dUrl = efd.dataUrl || efd.data;
        if(!primarySet){
          primarySet=true;
          updates.fontData=dUrl;
          updates.fontExt=efd.ext;
          const _efFontName=updates.name||document.getElementById('ef-name').value.trim()||id;
          injectCustomFontFace(id, _efFontName, dUrl, efd.ext||'.ttf');
        }
        console.log('✅ Local dataUrl used for edit:', efd.name||efd.file?.name);
      }
    }
    if(saveBtn){saveBtn.textContent='Save Changes';saveBtn.disabled=false;}
  } else if(_efFileData && _efFileData.data){
    updates.fontData=_efFileData.data;
    updates.fontExt=_efFileData.ext;
  }
  let sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
  const idx=sub.findIndex(f=>f.id===id);

  // Admin direct edit - bypass approval queue
  if(window._adminDirectEditId===id){
    window._adminDirectEditId=null;
    // Update in tv_submitted if exists, otherwise insert
    if(idx>=0){
      sub[idx]={...sub[idx],...updates,adminEditedAt:new Date().toISOString()};
    } else {
      // Built-in font - add an override entry to tv_submitted
      const fi=FONTS.find(f=>f.id===id);
      if(!fi){showToast('⚠️ Font not found'); closeEditFont(); return;}
      sub.push({...fi,...updates,adminEditedAt:new Date().toISOString(),pending:false});
    }
    localStorage.setItem("tv_submitted",JSON.stringify(sub));
    // Clear any pending edit request for this font
    let reqs=getAdminRequests();
    reqs=reqs.filter(r=>!(r.id===id&&r.requestType==='edit'));
    saveAdminRequests(reqs);
    _updateAdminEditsBadge();
    // Apply to runtime FONTS immediately
    const fi=FONTS.findIndex(f=>f.id===id);
    if(fi>=0) Object.assign(FONTS[fi],updates);
    syncSubmittedFonts();
    renderFonts();
    // Font detail page açıqdırsa, yenilənmiş məlumatla yenidən render et
    const _fdp=document.getElementById('fontDetailPage');
    if(_fdp && _fdp.classList.contains('visible') && currentDetailFont && currentDetailFont.id===id){
      openDetail(id);
    }
    // Close modal - admin panel stays visible underneath (if it was open)
    document.getElementById('editFontModal').classList.remove('open');
    const _adminOpen=document.getElementById('adminPanelOverlay').style.display==='flex';
    window._adminPanelWasOpen=false;
    document.body.style.overflow=_adminOpen?'hidden':'';
    _renderAdminAll();
    adminLog('edit',updates.name,'Admin direct edit');
    showToast(`✅ "${updates.name}" updated`);
    return;
  }

  // Regular user edit - send to admin queue for approval
  if(idx<0){showToast('⚠️ Font not found'); closeEditFont(); return;}
  const reqs=getAdminRequests();
  const existingReqIdx=reqs.findIndex(r=>r.id===id&&r.requestType==='edit');
  const editReq={
    ...sub[idx],...updates,
    requestType:'edit',
    editRequestAt:new Date().toISOString(),
    submittedByName:window.currentUser?window.currentUser.name:sub[idx].submittedByName,
    submittedById:window.currentUser?window.currentUser.id:sub[idx].submittedById
  };
  if(existingReqIdx>=0) reqs[existingReqIdx]=editReq;
  else reqs.push(editReq);
  saveAdminRequests(reqs);
  _updateAdminEditsBadge();
  closeEditFont();
  renderMyFontsTab();
  showToast('✅ Changes submitted - awaiting admin review');
}
function deleteMyFont(fontId){
  if(!confirm('Delete this submitted font?')) return;
  let sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
  sub=sub.filter(f=>f.id!==fontId);
  localStorage.setItem("tv_submitted",JSON.stringify(sub));
  let reqs=getAdminRequests();
  reqs=reqs.filter(r=>r.id!==fontId);
  saveAdminRequests(reqs);
  // Firestore-dan da sil (Rules istifadecinin oz fontunu silmesine icaze verir)
  if(window._fbFns && window._fbDb){
    const {doc, deleteDoc} = window._fbFns;
    deleteDoc(doc(window._fbDb,'submitted_fonts',fontId)).catch(e=>console.warn('Firestore delete error:',e));
  }
  syncSubmittedFonts();
  renderMyFontsTab();
  const mc=document.getElementById('profileMyFontsCount');
  if(mc) mc.textContent=getMySubmittedFonts().length;
  renderFonts();
  showToast('Font deleted');
}

// ?? MODERATOR PANEL ??????????????????????????????????????????????????????????
function openModPanel(){
  if(!_isModerator(window.currentUser)){ showToast('🚫 Access denied'); return; }
  const overlay=document.getElementById('modPanelOverlay');
  const drawer=document.getElementById('modPanelDrawer');
  overlay.style.display='flex';
  overlay.style.alignItems='center';
  overlay.style.justifyContent='center';
  document.body.style.overflow='hidden';
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      overlay.style.background='rgba(0,0,0,0.55)';
      overlay.style.backdropFilter='blur(6px)';
      drawer.style.transform='translate(-50%,-50%) scale(1)';
      drawer.style.opacity='1';
    });
  });
  _renderModPanel();
}
function closeModPanel(skipHistory){
  const overlay=document.getElementById('modPanelOverlay');
  const drawer=document.getElementById('modPanelDrawer');
  overlay.style.background='rgba(0,0,0,0)';
  overlay.style.backdropFilter='blur(0px)';
  drawer.style.transform='translate(-50%,-50%) scale(0.96)';
  drawer.style.opacity='0';
  if(skipHistory){
    // popstate-dən çağırılıb — dərhal overflow sıfırla
    document.body.style.overflow='';
    setTimeout(()=>{ overlay.style.display='none'; },300);
  } else {
    setTimeout(()=>{ overlay.style.display='none'; document.body.style.overflow=''; },300);
  }
}
function _renderModPanel(){
  if(!_isModerator(window.currentUser)){ return; }
  const content=document.getElementById('modPanelContent');
  // Pull pending submissions
  let pending=[];
  if(typeof syncSubmittedFontsFromFirestore==='function'){
    syncSubmittedFontsFromFirestore().then(()=>{
      pending=_allSub().filter(f=>f.pending!==false);
      _drawModPending(content, pending);
    });
  } else {
    pending=_allSub().filter(f=>f.pending!==false);
    _drawModPending(content, pending);
  }
}
function _drawModPending(content, pending){
  if(!pending.length){
    content.innerHTML=`
      <div style="text-align:center;padding:60px 20px;color:var(--text3)">
        <div style="font-size:40px;margin-bottom:14px">📋</div>
        <div style="font-size:15px;font-weight:600;color:var(--text2)">No pending submissions</div>
        <div style="font-size:13px;margin-top:6px">All caught up!</div>
      </div>`;
    return;
  }
  content.innerHTML=`
    <div style="font-size:12px;color:var(--text3);margin-bottom:14px">${pending.length} pending submission${pending.length!==1?'s':''} waiting for review</div>
    <div style="display:flex;flex-direction:column;gap:12px">
    ${pending.map(f=>`
      <div id="modrow_${f.id}" style="background:var(--surface3);border:1px solid var(--border2);border-radius:14px;padding:16px 18px">
        <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap">
          ${f.previewImg?`<img src="${f.previewImg}" style="width:80px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;border:1px solid var(--border)">`:
            `<div style="width:80px;height:56px;border-radius:8px;background:var(--surface4);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🔤</div>`}
          <div style="flex:1;min-width:0">
            <div style="font-size:16px;font-weight:700;color:var(--text);letter-spacing:-0.02em;margin-bottom:2px">${esc(f.name||'-')}</div>
            <div style="font-size:12px;color:var(--text3);margin-bottom:6px">
              By <strong style="color:var(--text2)">${esc(f.author||'-')}</strong>
              · ${esc(f.cat||'-')}
              · ${esc(f.license||'-')}
              ${f.submittedByName?`· Submitted by <strong style="color:var(--text2)">${esc(f.submittedByName)}</strong>`:''}
            </div>
            ${f.description?`<div style="font-size:12px;color:var(--text2);margin-bottom:6px">${esc(f.description)}</div>`:''}
            ${f.sourceUrl?`<a href="${esc(f.sourceUrl)}" target="_blank" rel="noopener" style="font-size:11px;color:var(--accent);text-decoration:none">🔗 Source link</a>`:''}
          </div>
          <div style="display:flex;flex-direction:column;gap:7px;flex-shrink:0;min-width:110px">
            <button onclick="_modApprove('${f.id}')"
              style="padding:9px 0;border-radius:9px;font-size:12px;font-weight:700;background:var(--green);border:none;color:#fff;cursor:pointer;font-family:var(--sans);width:100%;transition:filter .15s"
              onmouseover="this.style.filter='brightness(1.12)'" onmouseout="this.style.filter=''">✓ Approve</button>
            <button onclick="_modReject('${f.id}',this)"
              style="padding:9px 0;border-radius:9px;font-size:12px;font-weight:700;background:var(--red);border:none;color:#fff;cursor:pointer;font-family:var(--sans);width:100%;transition:filter .15s"
              onmouseover="this.style.filter='brightness(1.12)'" onmouseout="this.style.filter=''">✕ Reject</button>
          </div>
        </div>
      </div>`).join('')}
    </div>`;
}
function _modApprove(fontId){
  if(!_isModerator(window.currentUser)){ showToast('🚫 Access denied'); return; }
  // Call adminApprove which handles localStorage + Firestore + renderFonts
  adminApprove(fontId);
  // Remove row from mod panel immediately
  const row=document.getElementById('modrow_'+fontId);
  if(row){ row.style.opacity='0'; row.style.transition='opacity .2s'; setTimeout(()=>row.remove(), 200); }
  // Update empty state if none left
  setTimeout(()=>{
    const content=document.getElementById('modPanelContent');
    if(content&&!content.querySelector('[id^="modrow_"]')){
      content.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)">
        <div style="font-size:40px;margin-bottom:14px">✓</div>
        <div style="font-size:15px;font-weight:600;color:var(--text2)">All done!</div>
        <div style="font-size:13px;margin-top:6px">No more pending submissions.</div>
      </div>`;
    }
  }, 250);
}
function _modReject(fontId, btn){
  if(!_isModerator(window.currentUser)){ showToast('🚫 Access denied'); return; }
  if(btn.dataset.confirm!=='yes'){
    btn.textContent='Are you sure?';
    btn.dataset.confirm='yes';
    btn.style.background='var(--orange)';
    setTimeout(()=>{if(btn.dataset.confirm==='yes'){btn.textContent='✕ Reject';btn.dataset.confirm='';btn.style.background='var(--red)';}},3000);
    return;
  }
  btn.dataset.confirm='';
  adminReject(fontId, {target:btn});
  const row=document.getElementById('modrow_'+fontId);
  if(row){ row.style.opacity='0'; row.style.transition='opacity .2s'; setTimeout(()=>row.remove(), 200); }
  setTimeout(()=>{
    const content=document.getElementById('modPanelContent');
    if(content&&!content.querySelector('[id^="modrow_"]')){
      content.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)">
        <div style="font-size:40px;margin-bottom:14px">⚠</div>
        <div style="font-size:15px;font-weight:600;color:var(--text2)">All done!</div>
        <div style="font-size:13px;margin-top:6px">No more pending submissions.</div>
      </div>`;
    }
  }, 250);
}
// ?? ADMIN PANEL ??
/* ?? ADMIN PANEL ??????????????????????????????????????????? */
let _adminActiveTab='pending';

function openAdminPanel(){
  // ?? SECURITY: server-side guard via Firestore Rules; client guard as extra layer ??
  if(!_isAdmin(window.currentUser)){
    showToast('🚫 Access denied');
    return;
  }
  const overlay=document.getElementById('adminPanelOverlay');
  const drawer=document.getElementById('adminPanelDrawer');
  overlay.style.display='flex';
  overlay.style.alignItems='center';
  overlay.style.justifyContent='center';
  document.body.style.overflow='hidden';
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      overlay.style.background='rgba(0,0,0,0.55)';
      overlay.style.backdropFilter='blur(6px)';
      drawer.style.transform='translate(-50%,-50%) scale(1)';
      drawer.style.opacity='1';
    });
  });
  _updateAdminEditsBadge();
  _updateTrashBadge();
  switchAdminTab(_adminActiveTab);
  if(location.pathname !== '/admin'){
    _safeHistoryPush({page:'admin'}, '', '/admin');
  }
  document.title = 'Admin Panel – Font·Monster';
}
function closeAdminPanel(skipHistory){
  const overlay=document.getElementById('adminPanelOverlay');
  const drawer=document.getElementById('adminPanelDrawer');
  // editFontModal admin panelin üstündədirsə əvvəl onu bağla
  const _ef=document.getElementById('editFontModal');
  if(_ef&&_ef.classList.contains('open')) closeEditFont();
  overlay.style.background='rgba(0,0,0,0)';
  overlay.style.backdropFilter='blur(0px)';
  drawer.style.transform='translate(-50%,-50%) scale(0.96)';
  drawer.style.opacity='0';
  if(skipHistory){
    // popstate-dən çağırılıb — yeni view render olmazdan əvvəl dərhal overflow sıfırla
    document.body.style.overflow='';
    setTimeout(()=>{ overlay.style.display='none'; },300);
  } else {
    setTimeout(()=>{ overlay.style.display='none'; document.body.style.overflow=''; },300);
    if(location.pathname==='/admin' && history.state && history.state.page==='admin') history.back();
  }
}
function _adminGoToFont(fontId){
  // Admin paneli bağla (history.back() olmadan)
  const overlay=document.getElementById('adminPanelOverlay');
  const drawer=document.getElementById('adminPanelDrawer');
  if(overlay){ overlay.style.background='rgba(0,0,0,0)'; overlay.style.backdropFilter='blur(0px)'; }
  if(drawer){ drawer.style.transform='translate(-50%,-50%) scale(0.96)'; drawer.style.opacity='0'; }
  setTimeout(()=>{
    if(overlay){ overlay.style.display='none'; }
    document.body.style.overflow='';
    // Font səhifəsini aç - popstate-i bypass et, birbaşa pushState + openDetail
    history.pushState({}, '', '/font/'+encodeURIComponent(fontId));
    if(typeof openDetail === 'function') openDetail(fontId);
  }, 310);
}
function switchAdminTab(tab){
  _adminActiveTab=tab;
  ['pending','edits','all','stats','trash','log','export','messages','users'].forEach(t=>{
    const btn=document.getElementById('adminTab_'+t);
    const view=document.getElementById('adminView_'+t);
    if(!btn||!view) return;
    const active=t===tab;
    btn.style.color=active?'var(--accent)':'var(--text2)';
    btn.style.borderBottomColor=active?'var(--accent)':'transparent';
    view.style.display=active?'block':'none';
  });
  if(tab==='pending'){
    // Refresh from Firestore first so admin sees latest submissions with fontUrl
    if(typeof syncSubmittedFontsFromFirestore==='function'){
      syncSubmittedFontsFromFirestore().then(()=>_renderAdminPending());
    } else {
      _renderAdminPending();
    }
  }
  if(tab==='edits') _renderAdminEdits();
  if(tab==='all') _renderAdminAll();
  if(tab==='stats') _renderAdminStats();
  if(tab==='trash') _renderAdminTrash();
  if(tab==='log') _renderAdminLog();
  if(tab==='export') _renderAdminExport();
  if(tab==='messages') renderAdminMessages(); // consolidated from monkey-patch below
  if(tab==='users') _renderAdminUsers();
}

function _getEditRequests(){
  return getAdminRequests().filter(r=>r.requestType==='edit');
}
function _renderAdminEdits(){
  const edits=_getEditRequests();
  const badge=document.getElementById('adminBadgeEdits');
  if(badge) badge.textContent=edits.length;
  const view=document.getElementById('adminView_edits');
  if(!edits.length){
    view.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)">
      <div style="font-size:40px;margin-bottom:14px">📋</div>
      <div style="font-size:15px;font-weight:600;color:var(--text2)">No pending edit requests</div>
      <div style="font-size:13px;margin-top:6px">All caught up!</div>
    </div>`;
    return;
  }
  view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">${edits.map(f=>{
    const sub=_allSub();
    const orig=sub.find(x=>x.id===f.id)||{};
    const diffs=[];
    ['name','author','cat','license','sourceUrl'].forEach(k=>{
      if(f[k]!==orig[k]&&f[k]!==undefined) diffs.push({field:k,old:orig[k]||'-',new:f[k]||'-'});
    });
    if(JSON.stringify(f.tags)!==JSON.stringify(orig.tags)) diffs.push({field:'tags',old:(orig.tags||[]).join(', '),new:(f.tags||[]).join(', ')});
    return `
    <div style="background:var(--surface3);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:18px 20px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
            <span style="font-size:16px;font-weight:700;letter-spacing:-0.02em;color:var(--text)">${esc(f.name)}</span>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:980px;background:var(--orange-dim);color:var(--orange)">✏️ Edit</span>
          </div>
          <div style="font-size:12px;color:var(--text3);margin-bottom:10px">
            Submitted by: <strong style="color:var(--text2)">${esc(f.submittedByName||'-')}</strong>
            ${f.editRequestAt?' · <span>'+new Date(f.editRequestAt).toLocaleDateString('en-US')+'</span>':''}
          </div>
          ${diffs.length?`
          <div style="display:flex;flex-direction:column;gap:6px">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:2px">Changes</div>
            ${diffs.map(d=>`
              <div style="background:var(--surface-solid);border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-size:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span style="font-weight:700;color:var(--text2);min-width:70px;flex-shrink:0;font-family:var(--mono);font-size:11px">${d.field}</span>
                <span style="color:var(--red);text-decoration:line-through;opacity:.8">${esc(d.old)}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <span style="color:var(--green);font-weight:600">${esc(d.new)}</span>
              </div>`).join('')}
          </div>`:`<div style="font-size:13px;color:var(--text3)">No differences detected.</div>`}
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;min-width:120px">
          <button onclick="adminApproveEdit('${f.id}')" style="padding:9px 0;border-radius:9px;font-size:12px;font-weight:700;background:var(--green);border:none;color:#fff;cursor:pointer;font-family:var(--sans);width:100%;transition:filter .15s" onmouseover="this.style.filter='brightness(1.12)'" onmouseout="this.style.filter=''">✓ Approve</button>
          <button onclick="adminRejectEdit('${f.id}',this)" style="padding:9px 0;border-radius:9px;font-size:12px;font-weight:700;background:var(--red);border:none;color:#fff;cursor:pointer;font-family:var(--sans);width:100%;transition:filter .15s" onmouseover="this.style.filter='brightness(1.12)'" onmouseout="this.style.filter=''">✕ Reject</button>
        </div>
      </div>
    </div>`}).join('')}</div>`;
}
function adminApproveEdit(fontId){
  const reqs=getAdminRequests();
  const req=reqs.find(r=>r.id===fontId&&r.requestType==='edit');
  if(!req){showToast('Request not found');return;}
  // Apply to tv_submitted
  let sub=_allSub();
  const idx=sub.findIndex(f=>f.id===fontId);
  const updates={name:req.name,author:req.author,cat:req.cat,license:req.license,tags:req.tags,sourceUrl:req.sourceUrl};
  if(idx>=0){sub[idx]={...sub[idx],...updates,editApprovedAt:new Date().toISOString()};localStorage.setItem("tv_submitted",JSON.stringify(sub));}
  // Apply to runtime FONTS
  const fi=FONTS.findIndex(f=>f.id===fontId);
  if(fi>=0) Object.assign(FONTS[fi],updates);
  // Remove from admin queue
  const newReqs=reqs.filter(r=>!(r.id===fontId&&r.requestType==='edit'));
  saveAdminRequests(newReqs);
  renderFonts();
  _renderAdminEdits();
  _updateAdminEditsBadge();
  adminLog('edit',req.name,'Edit approved');
  showToast(`✅ "${req.name}" edit approved!`);
  // ?? Email bildirisi gönd?r ??
  sendFontStatusEmail({...req, name: req.name+' (Redakt?)'}, 'approved');
}
function adminRejectEdit(fontId,btn){
  if(!_isAdmin(window.currentUser)){ showToast('🚫 Access denied'); return; }
  if(btn.dataset.confirmReject!=='yes'){
    btn.textContent='Are you sure?';
    btn.dataset.confirmReject='yes';
    btn.style.background='var(--orange)';
    setTimeout(()=>{
      if(btn.dataset.confirmReject==='yes'){
        btn.textContent='✕ Reject';
        btn.dataset.confirmReject='';
        btn.style.background='var(--red)';
      }
    },3000);
    return;
  }
  btn.dataset.confirmReject='';
  const reqs=getAdminRequests();
  const req=reqs.find(r=>r.id===fontId&&r.requestType==='edit');
  const name=req?req.name:fontId;
  const rejectedEditFont = req ? {...req} : {id:fontId,name};
  const newReqs=reqs.filter(r=>!(r.id===fontId&&r.requestType==='edit'));
  saveAdminRequests(newReqs);
  _renderAdminEdits();
  _updateAdminEditsBadge();
  adminLog('reject',name,'Edit rejected');
  showToast(`✅ "${name}" edit rejected`);
  // ?? Email bildirisi gönd?r ??
  sendFontStatusEmail({...rejectedEditFont, name: name+' (Redakt?)'}, 'rejected');
}
function _updateAdminEditsBadge(){
  const badge=document.getElementById('adminBadgeEdits');
  if(badge) badge.textContent=_getEditRequests().length;
}
function _allSub(){
  try{
    const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
    // Also merge any entries from admin requests queue that aren't already in tv_submitted
    // (handles the case where Firestore is unavailable and only local queue was written)
    const reqs=getAdminRequests().filter(r=>r.requestType==='add');
    const subIds=new Set(sub.map(f=>f.id));
    reqs.forEach(r=>{ if(!subIds.has(r.id)) sub.push(r); });
    return sub;
  }catch(e){return[];}
}
function _renderAdminPending(){
  const allSub=_allSub();
  const reqs=allSub.filter(f=>f.pending===true);
  const badge=document.getElementById('adminBadgePending');
  if(badge) badge.textContent=reqs.length;
  const view=document.getElementById('adminView_pending');
  if(!reqs.length){
    view.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)">
      <div style="font-size:40px;margin-bottom:14px"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.4"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg></div>
      <div style="font-size:15px;font-weight:600;color:var(--text2)">No pending submissions</div>
      <div style="font-size:13px;margin-top:6px">All caught up!</div>
    </div>`;
    return;
  }
  // Inject @font-face for pending fonts that have actual font data (not image-only previews)
  reqs.forEach(f => { if(f.fontData||f.fontUrl||f.gfamily) loadFont(f); });
  view.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px">${reqs.map(f=>{
    const fontFamily=`'${f.name.replace(/'/g,"\\'")}',sans-serif`;
    const hasFontData=!!(f.fontData||f.fontUrl||f.gfamily);
    const hasFont=hasFontData||!!f.previewImg;
    const previewSample=f.previewText||f.name||'The quick brown fox';
    return `
    <div style="background:var(--surface3);border:1px solid var(--border2);border-radius:var(--radius-lg);overflow:hidden">
      ${hasFont?`<div id="aprev_${f.id}" style="padding:22px 24px 18px;background:var(--surface-solid);border-bottom:1px solid var(--border);position:relative;">
        ${f.previewImg?`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;">
          <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--text3)">Font Preview</span>
          <span style="font-size:10px;color:var(--text3);font-style:italic">Image preview</span>
        </div>
        <img src="${esc(f.previewImg)}" alt="Font preview" style="max-width:100%;max-height:120px;object-fit:contain;display:block;margin-bottom:6px;border-radius:6px;">
        `:`
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;">
          <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--text3)">Font Preview</span>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11px;color:var(--text3)">Size:</span>
            <input type="range" min="18" max="96" value="36" oninput="_adminPrevSize('${f.id}',this.value)"
              style="width:80px;accent-color:var(--accent);cursor:pointer;height:3px;vertical-align:middle">
            <span id="aprev_sz_${f.id}" style="font-family:var(--mono);font-size:11px;color:var(--text3);min-width:22px">36</span>
          </div>
        </div>
        <input id="aprev_inp_${f.id}"
          type="text"
          value="${esc(previewSample)}"
          oninput="_adminPrevUpdate('${f.id}',this.value)"
          placeholder="Type to preview."
          style="
            font-family:${fontFamily};
            font-size:36px;
            line-height:1.2;
            color:var(--text);
            letter-spacing:-0.01em;
            width:100%;
            background:transparent;
            border:none;
            outline:none;
            border-bottom:1px dashed var(--border2);
            padding-bottom:6px;
            margin-bottom:10px;
            font-weight:inherit;
          "
        >
        <div id="aprev_abc_${f.id}" style="font-family:${fontFamily};font-size:14px;color:var(--text3);line-height:1.6;">ABCDEFGHIJKLM &nbsp; abcdefghijklm &nbsp; 0123456789 &nbsp; !@#$%&amp;</div>
        `}
        <span style="position:absolute;top:16px;right:18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:980px;background:var(--orange-dim);color:var(--orange);border:1px solid rgba(255,149,0,0.25)">⏳ Pending</span>
      </div>`:''}
      <div style="padding:16px 20px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
              <span style="font-size:16px;font-weight:700;letter-spacing:-0.02em;color:var(--text)">${esc(f.name)}</span>
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:980px;background:var(--green-dim);color:var(--green)">✦ New</span>
              ${!hasFont?'<span style="font-size:10px;padding:2px 8px;border-radius:980px;background:var(--red-dim);color:var(--red);border:1px solid rgba(255,59,48,0.2)">⚠ No font file</span>':''}
            </div>
            <div style="font-size:12px;color:var(--text3);line-height:1.8;margin-bottom:8px">
              <span>Designer: <strong style="color:var(--text2)">${esc(f.author||'-')}</strong></span> &nbsp;·&nbsp;
              <span>Category: <strong style="color:var(--text2)">${cap(f.cat||'')}</strong></span> &nbsp;·&nbsp;
              <span>License: <strong style="color:var(--text2)">${LICENSE_META[f.license]?.label||f.license||'-'}</strong></span><br>
              <span>By: <strong style="color:var(--text2)">${esc(f.submittedByName||'Unknown')}</strong></span>
              ${f.submittedAt?' &nbsp;·&nbsp; <span>'+new Date(f.submittedAt).toLocaleDateString('en-US')+'</span>':''}
            </div>
            ${(f.tags||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">${(f.tags).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`:''}
            ${f.sourceUrl?`<a href="${esc(f.sourceUrl)}" target="_blank" style="font-size:11px;color:var(--accent);text-decoration:none">🔗 ${esc(f.sourceUrl)}</a>`:''}
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;min-width:120px">
            <button onclick="adminApprove('${f.id}')" style="padding:9px 0;border-radius:9px;font-size:12px;font-weight:700;background:var(--green);border:none;color:#fff;cursor:pointer;font-family:var(--sans);width:100%;transition:filter .15s" onmouseover="this.style.filter='brightness(1.12)'" onmouseout="this.style.filter=''">✓ Approve</button>
            <button onclick="adminEditFontDirect('${f.id}')" style="padding:9px 0;border-radius:9px;font-size:12px;font-weight:700;background:var(--accent);border:none;color:#fff;cursor:pointer;font-family:var(--sans);width:100%;transition:filter .15s" onmouseover="this.style.filter='brightness(1.12)'" onmouseout="this.style.filter=''">✏️ Edit</button>
            <button onclick="adminReject('${f.id}',event)" style="padding:9px 0;border-radius:9px;font-size:12px;font-weight:700;background:var(--red);border:none;color:#fff;cursor:pointer;font-family:var(--sans);width:100%;transition:filter .15s" onmouseover="this.style.filter='brightness(1.12)'" onmouseout="this.style.filter=''">✕ Reject</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;
}
function _adminPrevUpdate(fontId, val){
  // Preview input-u artıq öz fontunu render edir (font-family inline style-dadır).
  // Burada yalnız abc sətrini eyni mətni əks etdirməklə sinxronlaşdırırıq.
  const abc = document.getElementById('aprev_abc_' + fontId);
  if(!abc) return;
  if(val && val.trim()){
    abc.textContent = val;
  } else {
    abc.textContent = 'ABCDEFGHIJKLM   abcdefghijklm   0123456789   !@#$%&';
  }
}
function _adminPrevSize(fontId, val){
  const inp=document.getElementById('aprev_inp_'+fontId);
  const lbl=document.getElementById('aprev_sz_'+fontId);
  if(inp) inp.style.fontSize=val+'px';
  if(lbl) lbl.textContent=val;
}
function _renderAdminAll(){
  let _adminAllFilter=window._adminAllFilter||(window._adminAllFilter={q:'',status:'all',cat:''});
  const allList=_allSub();
  const view=document.getElementById('adminView_all');
  if(!allList.length){
    view.innerHTML='<div style="text-align:center;padding:60px 20px;color:var(--text3)"><div style="font-size:40px;margin-bottom:14px">📭</div><div style="font-size:15px;font-weight:600;color:var(--text2)">No fonts yet</div></div>';
    return;
  }
  const cats=[...new Set(allList.map(f=>f.cat).filter(Boolean))].sort();
  const q=_adminAllFilter.q.toLowerCase();
  const filtered=allList.filter(f=>{
    if(q&&!f.name.toLowerCase().includes(q)&&!(f.author||'').toLowerCase().includes(q)) return false;
    if(_adminAllFilter.status==='live'&&f.pending) return false;
    if(_adminAllFilter.status==='pending'&&!f.pending) return false;
    if(_adminAllFilter.cat&&f.cat!==_adminAllFilter.cat) return false;
    return true;
  });
  const row=f=>'<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface3);margin-bottom:8px">'+
    '<div style="flex:1;min-width:0">'+
    '<div onclick="_adminGoToFont(\''+f.id+'\')" style="font-size:14px;font-weight:600;color:var(--accent);letter-spacing:-0.01em;cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-decoration-color:transparent;transition:text-decoration-color .15s" onmouseover="this.style.textDecorationColor=\'var(--accent)\'" onmouseout="this.style.textDecorationColor=\'transparent\'">'+esc(f.name)+'</div>'+
    '<div style="font-size:11px;color:var(--text3);margin-top:2px">'+esc(f.author||'-')+' · '+cap(f.cat||'')+' · '+(LICENSE_META[f.license]?.label||f.license||'-')+'</div>'+
    '</div>'+
    '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:3px 9px;border-radius:980px;'+(f.pending?'background:var(--orange-dim);color:var(--orange)':'background:var(--green-dim);color:var(--green)')+'">'+( f.pending?'Pending':'Live')+'</span>'+
    '<button onclick="adminEditFontDirect(\''+f.id+'\')" style="display:flex;align-items:center;gap:4px;background:var(--blue-dim);border:1px solid var(--border2);color:var(--accent);border-radius:7px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--sans);white-space:nowrap;transition:filter .15s" onmouseover="this.style.filter=\'brightness(1.1)\'" onmouseout="this.style.filter=\'\'">✏️ Edit</button>'+
    '<button onclick="adminDeleteFont(\''+f.id+'\',this)" style="display:flex;align-items:center;gap:4px;background:var(--red-dim);border:1px solid var(--border2);color:var(--red);border-radius:7px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--sans);white-space:nowrap">🗑️ Delete</button>'+
    '</div>';
  const selStyle='background:var(--surface-solid);border:1px solid var(--border2);border-radius:8px;padding:7px 10px;font-size:12px;color:var(--text);font-family:var(--sans);cursor:pointer;outline:none';
  const catOpts=cats.map(c=>'<option value="'+esc(c)+'"'+(_adminAllFilter.cat===c?' selected':'')+'>'+cap(c)+'</option>').join('');
  view.innerHTML=
    '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">'+
    '<input id="adminAllSearch" type="text" placeholder="Search name or author." value="'+esc(_adminAllFilter.q)+'"'+
    ' oninput="window._adminAllFilter.q=this.value;_renderAdminAll()"'+
    ' style="flex:1;min-width:160px;background:var(--surface-solid);border:1px solid var(--border2);border-radius:8px;padding:7px 12px;font-size:13px;color:var(--text);font-family:var(--sans);outline:none" />'+
    '<select onchange="window._adminAllFilter.status=this.value;_renderAdminAll()" style="'+selStyle+'">'+
    '<option value="all"'+(_adminAllFilter.status==='all'?' selected':'')+'>All status</option>'+
    '<option value="live"'+(_adminAllFilter.status==='live'?' selected':'')+'>Live only</option>'+
    '<option value="pending"'+(_adminAllFilter.status==='pending'?' selected':'')+'>Pending only</option>'+
    '</select>'+
    '<select onchange="window._adminAllFilter.cat=this.value;_renderAdminAll()" style="'+selStyle+'">'+
    '<option value="">All categories</option>'+catOpts+
    '</select>'+
    '<span style="font-size:12px;color:var(--text3);white-space:nowrap">'+filtered.length+' of '+allList.length+'</span>'+
    '</div>'+
    (filtered.length?filtered.map(row).join(''):'<div style="text-align:center;padding:40px 20px;color:var(--text3);font-size:13px">No results</div>');
}

function _renderAdminStats(){
  const allSub=_allSub();
  const approved=allSub.filter(f=>!f.pending).length;
  const pending=allSub.filter(f=>f.pending).length;
  const trashed=_getTrash().length;
  const builtIn=FONTS_BASE.length;
  const view=document.getElementById('adminView_stats');
  const stat=(label,val,color)=>`<div style="background:var(--surface3);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:20px 22px;flex:1;min-width:130px">
    <div style="font-size:28px;font-weight:700;color:${color};letter-spacing:-0.04em">${val}</div>
    <div style="font-size:12px;color:var(--text3);margin-top:4px;font-weight:500">${label}</div>
  </div>`;
  view.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px">
    ${stat('Built-in Fonts',builtIn,'var(--accent)')}
    ${stat('Approved',approved,'var(--green)')}
    ${stat('Pending',pending,'var(--orange)')}
    ${stat('In Trash',trashed,'var(--red)')}
    ${stat('Total',builtIn+approved,'var(--text)')}
  </div>
  <div style="font-size:13px;color:var(--text2);line-height:1.7">
    <strong>Storage:</strong> localStorage (tv_submitted, tv_trash)<br>
    <strong>Admin:</strong> <span style="color:var(--text3);font-size:12px">Set via Firestore isAdmin:true</span>
  </div>`;
}
// ?? FONT STATUS EMAIL NOTIFICATION ??????????????????????????????????????????
async function sendFontStatusEmail(fontData, status){
  // status: 'approved' | 'rejected'
  const toEmail = fontData.submittedByEmail || fontData.submittedBy;
  const toName  = fontData.submittedByName  || 'Istifad?çi';
  const fontName= fontData.name             || 'Font';

  if(!toEmail){ console.warn('sendFontStatusEmail: no email address found'); return; }

  // ?? Firestore notification (h?mis? isl?yir) ??
  if(window._fbFns && window._fbDb && fontData.submittedById){
    try{
      const {collection, addDoc, serverTimestamp} = window._fbFns;
      await addDoc(collection(window._fbDb,'notifications'), {
        userId:    fontData.submittedById,
        userEmail: toEmail,
        fontId:    fontData.id,
        fontName,
        status,
        message: status==='approved'
          ? `Your font "${fontName}" has been approved and is now live on the site. Great work!`
          : `Unfortunately, "${fontName}" was not approved during review. Please contact us for more details.`,
        read:      false,
        createdAt: serverTimestamp()
      });
    }catch(e){ console.warn('Notification Firestore error:',e); }
  }

  // ?? EmailJS (yalniz konfiqurasiya edilibs? isl?yir) ??
  if(window.EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY' ||
     !window.EMAILJS_SERVICE_ID || !window.EMAILJS_TEMPLATE_ID){ return; }

  const isApproved = status === 'approved';
  try{
    await emailjs.send(
      window.EMAILJS_SERVICE_ID,
      window.EMAILJS_TEMPLATE_ID,
      {
        to_email:  toEmail,
        to_name:   toName,
        font_name: fontName,
        status:    isApproved ? '✅ Approved' : '❌ Rejected',
        status_raw: status,
        message:   isApproved
          ? `Great news! Your font "${fontName}" has been reviewed by our team and is now live on Font Monster. Thank you for your contribution!`
          : `Unfortunately, your font "${fontName}" was not approved during review. This may be due to a license mismatch or other issues. Feel free to contact us with any questions.`,
        site_url:  window.location.origin
      }
    );
    console.log(`? Email sent to ${toEmail} - ${status}`);
  }catch(err){
    console.warn('EmailJS send error:', err);
  }
}
// ????????????????????????????????????????????????????????????????????????????

function adminApprove(fontId){
  if(!_isAdmin(window.currentUser) && !window.currentUser?.isModerator){ showToast('🚫 Access denied'); return; }
  let sub=_allSub();
  const idx=sub.findIndex(f=>f.id===fontId);
  if(idx<0) return;
  const fontName=sub[idx].name;
  sub[idx].pending=false;
  sub[idx].approvedAt=new Date().toISOString();
  localStorage.setItem("tv_submitted",JSON.stringify(sub));
  let reqs=getAdminRequests();
  reqs=reqs.filter(r=>r.id!==fontId);
  saveAdminRequests(reqs);
  // Update Firestore if available
  if(window._fbFns && window._fbDb){
    const {doc, updateDoc} = window._fbFns;
    const update = {pending:false,approvedAt:new Date().toISOString()};
    updateDoc(doc(window._fbDb,'submitted_fonts',fontId),update).catch(e=>console.warn('Firestore approve error:',e));
  }
  syncSubmittedFonts();
  renderFonts();
  _renderAdminPending();
  adminLog('approve',fontName,'Approved submission');
  showToast(`✅ "${fontName}" approved!`);
  // ?? Email bildirisi gönd?r ??
  const approvedFont = sub[idx] || {id:fontId,name:fontName};
  sendFontStatusEmail(approvedFont, 'approved');
}
function adminReject(fontId,ev){
  if(!_isAdmin(window.currentUser) && !window.currentUser?.isModerator){ showToast('🚫 Access denied'); return; }
  let sub=_allSub();
  const f=sub.find(x=>x.id===fontId);
  if(!f) return;
  const btn=ev?ev.target:event.target;
  if(btn.dataset.confirmReject!=='yes'){
    btn.textContent='Are you sure?';
    btn.dataset.confirmReject='yes';
    btn.style.background='var(--orange)';
    setTimeout(()=>{
      if(btn.dataset.confirmReject==='yes'){
        btn.textContent='✕ Reject';
        btn.dataset.confirmReject='';
        btn.style.background='var(--red)';
      }
    },3000);
    return;
  }
  btn.dataset.confirmReject='';
  const rejectedName=f.name;
  const rejectedFont = {...f}; // kopyasini saxla email üçün
  sub=sub.filter(x=>x.id!==fontId);
  localStorage.setItem("tv_submitted",JSON.stringify(sub));
  let reqs=getAdminRequests();
  reqs=reqs.filter(r=>r.id!==fontId);
  saveAdminRequests(reqs);
  // Remove from Firestore if available
  if(window._fbFns && window._fbDb){
    const {doc, deleteDoc} = window._fbFns;
    deleteDoc(doc(window._fbDb,'submitted_fonts',fontId)).catch(e=>console.warn('Firestore reject error:',e));
  }
  // Submitter-in localStorage-indan da sil ki font onlarda geri qelmesin
  try{
    let allSub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
    allSub=allSub.filter(f=>f.id!==fontId);
    localStorage.setItem("tv_submitted",JSON.stringify(allSub));
  }catch(e){}
  syncSubmittedFonts();
  renderFonts();
  _renderAdminPending();
  adminLog('reject',rejectedName,'Rejected submission');
  showToast(`✕ "${rejectedName}" rejected`);
  sendFontStatusEmail(rejectedFont, 'rejected');
}
function adminEditFontDirect(fontId){
  const sub=_allSub();
  const f=sub.find(x=>x.id===fontId) || FONTS.find(x=>x.id===fontId);
  if(!f){showToast('Font not found: '+fontId);return;}
  _resetEditModal();
  document.getElementById('ef-id').value=f.id;
  document.getElementById('ef-name').value=f.name||'';
  document.getElementById('ef-author').value=f.author||'';
  document.getElementById('ef-cat').value=f.cat||'';refreshCustomSelect('ef-cat');
  document.getElementById('ef-license').value=f.license||'';refreshCustomSelect('ef-license');
  document.getElementById('ef-year').value=f.year||'';
  document.getElementById('ef-tags').value=(f.tags||[]).join(', ');
  setTimeout(()=>_setTagChipValues('ef-tags-box','ef-tags-chips','ef-tags-input','ef-tags',f.tags||[]),50);
  document.getElementById('ef-url').value=f.sourceUrl||f.url||'';
  const efDescAdmin=document.getElementById('ef-description');if(efDescAdmin)efDescAdmin.value=f.description||'';
  if(f.previewImg){_efImgData=f.previewImg;document.getElementById('efImgThumb').src=f.previewImg;document.getElementById('efImgPlaceholder').style.display='none';document.getElementById('efImgPreview').style.display='block';}
  _showExistingFontFile(f);
  // Show admin notice, hide user review notice
  document.getElementById('ef-admin-notice').style.display='';
  document.getElementById('ef-user-notice').style.display='none';
  document.getElementById('ef-review-notice').style.display='none';
  window._adminDirectEditId=fontId;
  window._adminPanelWasOpen=document.getElementById('adminPanelOverlay').style.display==='flex';
  document.body.style.overflow='hidden';
  document.getElementById('editFontModal').classList.add('open');
}

// ?? TRASH / SOFT-DELETE ??????????????????????????????????????
function _getTrash(){try{return JSON.parse(localStorage.getItem('tv_trash')||'[]');}catch(e){return[];}}
function _saveTrash(arr){try{localStorage.setItem('tv_trash',JSON.stringify(arr));}catch(e){}}
function _updateTrashBadge(){
  const count=_getTrash().length;
  const badge=document.getElementById('adminBadgeTrash');
  if(!badge) return;
  badge.textContent=count;
  badge.style.display=count>0?'inline-flex':'none';
}
function adminDeleteFont(fontId,btn){
  if(!_isAdmin(window.currentUser)){ showToast('🚫 Access denied'); return; }
  // Two-step confirmation
  if(!btn||btn.dataset.confirmDelete!=='yes'){
    if(btn){
      btn.textContent='Are you sure?';
      btn.dataset.confirmDelete='yes';
      btn.style.background='var(--orange)';
      btn.style.color='#fff';
      setTimeout(()=>{
        if(btn.dataset.confirmDelete==='yes'){
          btn.textContent='🗑️ Delete';
          btn.dataset.confirmDelete='';
          btn.style.background='var(--red-dim)';
          btn.style.color='var(--red)';
        }
      },3000);
    }
    return;
  }
  btn.dataset.confirmDelete='';
  let sub=_allSub();
  const f=sub.find(x=>x.id===fontId);
  if(!f) return;
  // Move to trash
  const trash=_getTrash();
  trash.push({...f, trashedAt:new Date().toISOString()});
  _saveTrash(trash);
  // Remove from submitted
  sub=sub.filter(x=>x.id!==fontId);
  localStorage.setItem("tv_submitted",JSON.stringify(sub));
  // Remove from admin requests too
  let reqs=getAdminRequests();
  reqs=reqs.filter(r=>r.id!==fontId);
  saveAdminRequests(reqs);
  syncSubmittedFonts();
  renderFonts();
  _renderAdminAll();
  _updateTrashBadge();
  adminLog('delete',f.name,'Moved to Trash');
  showToast(`🗑️ "${f.name}" moved to Trash`);
  // Firestore-dan da sil
  if(window._fbDb && window._fbFns){
    const {doc, deleteDoc} = window._fbFns;
    deleteDoc(doc(window._fbDb,'submitted_fonts',fontId)).catch(e=>console.warn('Firestore delete error:',e));
  }
}
function adminRestoreFont(fontId){
  if(!_isAdmin(window.currentUser)){ showToast('🚫 Access denied'); return; }
  const trash=_getTrash();
  const f=trash.find(x=>x.id===fontId);
  if(!f) return;
  // Move back to submitted (as pending for safety)
  let sub=_allSub();
  const restored={...f};
  delete restored.trashedAt;
  restored.pending=true;
  restored.restoredAt=new Date().toISOString();
  sub.push(restored);
  localStorage.setItem("tv_submitted",JSON.stringify(sub));
  // Remove from trash
  const newTrash=trash.filter(x=>x.id!==fontId);
  _saveTrash(newTrash);
  syncSubmittedFonts();
  renderFonts();
  _renderAdminTrash();
  _updateTrashBadge();
  adminLog('restore',f.name,'Restored from Trash');
  showToast(`✅ "${f.name}" restored - now in Pending`);
}
function adminPermanentDelete(fontId,btn){
  if(!btn||btn.dataset.confirmPerm!=='yes'){
    if(btn){
      btn.textContent='Confirm delete?';
      btn.dataset.confirmPerm='yes';
      btn.style.opacity='1';
      setTimeout(()=>{
        if(btn.dataset.confirmPerm==='yes'){
          btn.textContent='Delete permanently';
          btn.dataset.confirmPerm='';
          btn.style.opacity='';
        }
      },3000);
    }
    return;
  }
  btn.dataset.confirmPerm='';
  const trash=_getTrash();
  const f=trash.find(x=>x.id===fontId);
  const name=f?f.name:fontId;
  const newTrash=trash.filter(x=>x.id!==fontId);
  _saveTrash(newTrash);
  _renderAdminTrash();
  _updateTrashBadge();
  adminLog('delete',name,'Permanently deleted');
  showToast(`🗑️ "${name}" permanently deleted`);
  // Firestore-dan da sil
  if(window._fbDb && window._fbFns){
    const {doc, deleteDoc} = window._fbFns;
    deleteDoc(doc(window._fbDb,'submitted_fonts',fontId)).catch(e=>console.warn('Firestore permanent delete error:',e));
  }
}
function adminEmptyTrash(btn){
  if(!btn||btn.dataset.confirmEmpty!=='yes'){
    if(btn){
      btn.textContent='Empty everything?';
      btn.dataset.confirmEmpty='yes';
      btn.style.background='var(--red)';
      btn.style.color='#fff';
      setTimeout(()=>{
        if(btn.dataset.confirmEmpty==='yes'){
          btn.textContent='Empty Trash';
          btn.dataset.confirmEmpty='';
          btn.style.background='';
          btn.style.color='';
        }
      },3500);
    }
    return;
  }
  btn.dataset.confirmEmpty='';
  const trashItems=_getTrash();
  _saveTrash([]);
  _renderAdminTrash();
  _updateTrashBadge();
  adminLog('empty_trash','[trash]','All items permanently deleted');
  showToast('🗑️ Trash emptied');
  // Firestore-dan da sil
  if(window._fbDb && window._fbFns){
    const {doc, deleteDoc} = window._fbFns;
    trashItems.forEach(f=>{ deleteDoc(doc(window._fbDb,'submitted_fonts',f.id)).catch(e=>console.warn('Firestore empty trash error:',e)); });
  }
}
function _renderAdminTrash(){
  _updateTrashBadge();
  const trash=_getTrash();
  const view=document.getElementById('adminView_trash');
  if(!trash.length){
    view.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)">
      <div style="font-size:40px;margin-bottom:14px">🗑️</div>
      <div style="font-size:15px;font-weight:600;color:var(--text2)">Trash is empty</div>
      <div style="font-size:13px;margin-top:6px">Deleted fonts appear here for recovery.</div>
    </div>`;
    return;
  }
  view.innerHTML=`
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <div style="font-size:12px;color:var(--text3)">${trash.length} item${trash.length!==1?'s':''} in trash</div>
    <button onclick="adminEmptyTrash(this)" style="background:var(--red-dim);border:1px solid var(--border2);color:var(--red);border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--sans);transition:background .15s,color .15s">Empty Trash</button>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px">
  ${trash.map(f=>`
  <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:10px;border:1px solid var(--border);background:var(--surface3)">
    <div style="flex:1;min-width:0">
      <div style="font-size:14px;font-weight:600;color:var(--text);letter-spacing:-0.01em;opacity:.7">${esc(f.name)}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:2px">${esc(f.author||'-')} · ${cap(f.cat||'')} · Deleted ${f.trashedAt?new Date(f.trashedAt).toLocaleDateString('en-US'):''}</div>
    </div>
    <button onclick="adminRestoreFont('${f.id}')" style="background:var(--green-dim);border:1px solid var(--border2);color:var(--green);border-radius:7px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--sans);white-space:nowrap;transition:filter .15s" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">? Restore</button>
    <button onclick="adminPermanentDelete('${f.id}',this)" style="background:var(--red-dim);border:1px solid var(--border2);color:var(--red);border-radius:7px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:var(--sans);white-space:nowrap;transition:filter .15s" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">Delete permanently</button>
  </div>`).join('')}
  </div>`
}


// ── ACTIVITY LOG ─────────────────────────────────────────────
function _getLog(){try{return JSON.parse(localStorage.getItem('tv_admin_log')||'[]');}catch(e){return[];}}
function _saveLog(arr){try{localStorage.setItem('tv_admin_log',JSON.stringify(arr.slice(-200)));}catch(e){}}
function adminLog(action, fontName, detail){
  const entry={action, fontName, detail, at:new Date().toISOString(), by:(window.currentUser&&window.currentUser.email)||'unknown'};
  // local cache for instant UI / offline fallback
  const log=_getLog();
  log.unshift(entry);
  _saveLog(log);
  // persist to Firestore so the log is shared across devices
  if(window._fbFns && window._fbDb){
    try{
      const {collection, addDoc, serverTimestamp}=window._fbFns;
      addDoc(collection(window._fbDb,'admin_log'), {...entry, at:serverTimestamp()})
        .catch(e=>console.warn('admin_log write error:',e));
    }catch(e){console.warn('admin_log write error:',e);}
  }
}
const _ADMIN_LOG_ICON={approve:'✅',reject:'❌',delete:'🗑️',restore:'↩️',edit:'✏️',import:'📥',export:'📤',empty_trash:'🗑️'};
const _ADMIN_LOG_COLOR={approve:'var(--green)',reject:'var(--red)',delete:'var(--red)',restore:'var(--green)',edit:'var(--accent)',import:'var(--purple)',export:'var(--blue)',empty_trash:'var(--red)'};
function _renderLogList(log){
  if(!log.length){
    return '<div style="text-align:center;padding:60px 20px;color:var(--text3)">'+
      '<div style="font-size:40px;margin-bottom:14px">🗑️</div>'+
      '<div style="font-size:15px;font-weight:600;color:var(--text2)">No activity yet</div>'+
      '<div style="font-size:13px;margin-top:6px">Admin actions will appear here.</div></div>';
  }
  return '<div style="display:flex;justify-content:flex-end;margin-bottom:12px">'+
    '<button onclick="adminClearLog(this)" style="background:var(--surface3);border:1px solid var(--border2);color:var(--text3);border-radius:8px;padding:5px 14px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--sans)">Clear log</button></div>'+
    '<div style="display:flex;flex-direction:column;gap:4px">'+
    log.map(e=>{
      const ic=_ADMIN_LOG_ICON[e.action]||'·';
      const col=_ADMIN_LOG_COLOR[e.action]||'var(--text2)';
      const dt=new Date(e.at);
      const dateStr=dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      const timeStr=dt.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
      return '<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface3)">'+
        '<span style="font-size:14px;width:20px;text-align:center;flex-shrink:0">'+ic+'</span>'+
        '<div style="flex:1;min-width:0">'+
        '<span style="font-size:13px;font-weight:600;color:'+col+'">'+esc(e.fontName||'-')+'</span>'+
        (e.detail?'<span style="font-size:12px;color:var(--text3);margin-left:6px">'+esc(e.detail)+'</span>':'')+
        (e.by?'<span style="font-size:11px;color:var(--text3);margin-left:6px">· '+esc(e.by)+'</span>':'')+
        '</div>'+
        '<span style="font-size:11px;color:var(--text3);white-space:nowrap;flex-shrink:0">'+dateStr+' · '+timeStr+'</span>'+
        '</div>';
    }).join('')+
    '</div>';
}
async function _renderAdminLog(){
  const view=document.getElementById('adminView_log');
  // show local cache immediately so the panel isn't empty while Firestore loads
  view.innerHTML=_renderLogList(_getLog());
  if(!window._fbFns || !window._fbDb) return;
  try{
    const {collection, getDocs, query, orderBy, limit}=window._fbFns;
    let q=collection(window._fbDb,'admin_log');
    if(orderBy) q=query(q, orderBy('at','desc'), ...(limit?[limit(200)]:[]));
    const snap=await getDocs(q);
    const log=snap.docs.map(d=>{
      const data=d.data();
      const at=data.at && data.at.toDate ? data.at.toDate().toISOString() : (data.at||new Date().toISOString());
      return {...data, at, _id:d.id};
    }).sort((a,b)=>new Date(b.at)-new Date(a.at));
    if(log.length) view.innerHTML=_renderLogList(log);
  }catch(e){
    console.warn('admin_log read error:',e);
    // keep local cache rendering on failure
  }
}
function adminClearLog(btn){
  if(btn.dataset.c!=='yes'){btn.textContent='Sure?';btn.dataset.c='yes';setTimeout(()=>{if(btn.dataset.c==='yes'){btn.textContent='Clear log';btn.dataset.c='';}},3000);return;}
  btn.dataset.c='';
  _saveLog([]);
  if(window._fbFns && window._fbDb){
    (async()=>{
      try{
        const {collection, getDocs, doc, deleteDoc}=window._fbFns;
        const snap=await getDocs(collection(window._fbDb,'admin_log'));
        await Promise.all(snap.docs.map(d=>deleteDoc(doc(window._fbDb,'admin_log',d.id))));
      }catch(e){console.warn('admin_log clear error:',e);}
      _renderAdminLog();
    })();
  } else {
    _renderAdminLog();
  }
  showToast('Log cleared');
}

// ?? EXPORT / IMPORT ??????????????????????????????????????????
function _renderAdminExport(){
  const view=document.getElementById('adminView_export');
  const sub=_allSub();
  const trash=_getTrash();
  const log=_getLog();
  const builtIn=FONTS_BASE;
  view.innerHTML=
    // EXPORT section
    '<div style="display:flex;flex-direction:column;gap:16px">'+
    '<div style="background:var(--surface3);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:20px 22px">'+
    '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">📤 Export Data</div>'+
    '<div style="font-size:12px;color:var(--text3);margin-bottom:16px">Download a JSON backup of all font data. Use this to restore later via Import.</div>'+
    '<div style="display:flex;flex-wrap:wrap;gap:8px">'+
    '<button onclick="adminExportJSON(\'submitted\')" style="background:var(--green-dim);border:1px solid var(--border2);color:var(--green);border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans)">Export Submitted ('+sub.length+')</button>'+
    '<button onclick="adminExportJSON(\'builtin\')" style="background:var(--blue-dim);border:1px solid var(--border2);color:var(--accent);border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans)">Export Built-in ('+builtIn.length+')</button>'+
    '<button onclick="adminExportJSON(\'all\')" style="background:var(--purple-dim);border:1px solid var(--border2);color:var(--purple);border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--sans)">Export Everything</button>'+
    '</div></div>'+
    // IMPORT section
    '<div style="background:var(--surface3);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:20px 22px">'+
    '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">📥 Import Data</div>'+
    '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Upload a JSON file exported from Font Monster. Existing fonts with matching IDs will be skipped (no duplicates).</div>'+
    '<label style="display:inline-flex;align-items:center;gap:8px;background:var(--surface-solid);border:1px solid var(--border2);border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;color:var(--text);font-family:var(--sans)">'+
    '📂 Choose JSON file'+
    '<input type="file" accept=".json" onchange="adminImportJSON(this)" style="display:none"></label>'+
    '<div id="importResult" style="margin-top:10px;font-size:13px;color:var(--text3)"></div>'+
    '</div>'+
    // Stats strip
    '<div style="background:var(--surface3);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:16px 22px">'+
    '<div style="font-size:12px;color:var(--text3);line-height:2">'+
    '<strong style="color:var(--text)">localStorage usage</strong><br>'+
    'tv_submitted: '+sub.length+' fonts · tv_trash: '+trash.length+' · tv_admin_log: '+log.length+' entries<br>'+
    '<span style="font-size:11px">Tip: Export regularly - localStorage is browser-local and can be cleared.</span>'+
    '</div></div>'+
    '</div>';
}
function adminExportJSON(type){
  const sub=_allSub();
  const builtIn=FONTS_BASE;
  const trash=_getTrash();
  const log=_getLog();
  let data, filename;
  if(type==='submitted'){data={version:1,exported:new Date().toISOString(),submitted:sub};filename='fontan-submitted.json';}
  else if(type==='builtin'){data={version:1,exported:new Date().toISOString(),builtin:builtIn};filename='fontan-builtin.json';}
  else{data={version:1,exported:new Date().toISOString(),submitted:sub,builtin:builtIn,trash:trash,log:log};filename='fontan-full-backup.json';}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();
  adminLog('export','[export]',filename);
  showToast('✅ Exported: '+filename);
}
function adminImportJSON(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      const incoming=data.submitted||data.builtin||[];
      if(!Array.isArray(incoming)){document.getElementById('importResult').textContent='✕ Invalid format';return;}
      let sub=_allSub();
      const existingIds=new Set(sub.map(f=>f.id));
      const toAdd=incoming.filter(f=>f.id&&!existingIds.has(f.id));
      sub=[...sub,...toAdd];
      localStorage.setItem('tv_submitted',JSON.stringify(sub));
      syncSubmittedFonts();renderFonts();
      adminLog('import','[import]',toAdd.length+' fonts from '+file.name);
      document.getElementById('importResult').innerHTML='<span style="color:var(--green)">✓ Imported '+toAdd.length+' new fonts</span>'+(incoming.length-toAdd.length?' ('+( incoming.length-toAdd.length)+' skipped - duplicates)':'');
      showToast('✅ Imported '+toAdd.length+' fonts');
    }catch(err){
      document.getElementById('importResult').innerHTML='<span style="color:var(--red)">✕ Parse error: '+esc(err.message)+'</span>';
    }
  };
  reader.readAsText(file);
}


initAuth();

// ?? ADMIN USERS PANEL ??????????????????????????????????????????????????????
async function _renderAdminUsers(){
  const view=document.getElementById('adminView_users');
  if(!view) return;
  view.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;padding:60px 20px;flex-direction:column;gap:12px;color:var(--text3)">
    <div style="width:28px;height:28px;border:3px solid var(--accent);border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></div>
    <span style="font-size:13px">Loading users.</span>
  </div>`;

  if(!window._fbFns || !window._fbDb){
    view.innerHTML='<div style="text-align:center;padding:60px 20px;color:var(--text3)">No Firebase connection.</div>';
    return;
  }

  try{
    const {collection, getDocs, query, orderBy} = window._fbFns;
    const db = window._fbDb;
    const snap = await getDocs(query(collection(db,'users'), orderBy('createdAt','desc')));
    const users = snap.docs.map(d=>({uid:d.id,...d.data()}));

    // Badges
    const badge=document.getElementById('adminBadgeUsers');
    if(badge){badge.textContent=users.length;badge.style.display='inline-flex';}

    // Fonts submitted per user
    let subMap={};
    try{
      const subSnap=await getDocs(collection(db,'submitted_fonts'));
      subSnap.docs.forEach(d=>{
        const uid=d.data().submittedById;
        if(uid) subMap[uid]=(subMap[uid]||0)+1;
      });
    }catch(e){}

    if(!users.length){
      view.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--text3)">
        <div style="font-size:40px;margin-bottom:14px">🗑️</div>
        <div style="font-size:15px;font-weight:600;color:var(--text2)">No users yet</div>
      </div>`;
      return;
    }

    const verified=users.filter(u=>u.emailVerified===true||u.emailVerified===undefined).length;
    const unverified=users.filter(u=>u.emailVerified===false).length;
    const banned=users.filter(u=>u.banned===true).length;
    const mods=users.filter(u=>u.isModerator===true&&!u.isAdmin).length;
    const total=users.length;

    view.innerHTML=`
      <!-- Stats bar -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px">
        ${[
          {label:'Total',val:total,color:'var(--text)'},
          {label:'Verified',val:verified,color:'var(--green)'},
          {label:'Unverified',val:unverified,color:'var(--orange)'},
          {label:'Banned',val:banned,color:'var(--red)'},
          {label:'Moderators',val:mods,color:'var(--purple,#af52de)'},
          {label:'Font submitters',val:Object.keys(subMap).length,color:'var(--accent)'},
        ].map(s=>`
          <div style="background:var(--surface3);border:1px solid var(--border2);border-radius:12px;padding:14px 20px;flex:1;min-width:100px;text-align:center">
            <div style="font-size:22px;font-weight:800;color:${s.color};letter-spacing:-0.04em">${s.val}</div>
            <div style="font-size:11px;color:var(--text3);margin-top:2px;font-weight:500">${s.label}</div>
          </div>`).join('')}
      </div>
      <!-- Search -->
      <input id="adminUsersSearch" type="text" placeholder="Search by name or email."
        oninput="_filterAdminUsers(this.value)"
        style="width:100%;background:var(--surface-solid);border:1px solid var(--border2);border-radius:8px;
               padding:8px 12px;font-size:13px;color:var(--text);font-family:var(--sans);outline:none;
               margin-bottom:12px;transition:border-color .15s"
        onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border2)'">
      <!-- Table header -->
      <div style="display:grid;grid-template-columns:1fr 1fr auto auto auto auto auto;gap:10px;
                  padding:7px 14px;font-size:10px;font-weight:700;text-transform:uppercase;
                  letter-spacing:.06em;color:var(--text3);border-bottom:1px solid var(--border)">
        <span>Name</span><span>Email</span><span style="text-align:center">Status</span>
        <span style="text-align:center">Mod</span>
        <span style="text-align:center">Fonts</span><span style="text-align:center">Joined</span>
        <span style="text-align:center">Actions</span>
      </div>
      <!-- Rows -->
      <div id="adminUsersRows">
        ${users.map(u=>_adminUserRow(u, subMap)).join('')}
      </div>
    `;
    // Store for filter
    window._adminUsersData = {users, subMap};
  }catch(err){
    view.innerHTML=`<div style="text-align:center;padding:60px 20px;color:var(--red)">
      <div style="font-size:36px;margin-bottom:10px">👥</div>
      <div style="font-size:14px;font-weight:600">Error: ${esc(err.message)}</div>
      <div style="font-size:12px;color:var(--text3);margin-top:6px">Check your Firestore security rules.</div>
    </div>`;
  }
}

function _adminUserRow(u, subMap){
  const isVerified = u.emailVerified !== false;
  const isAdmin = u.isAdmin === true;
  const isModerator = u.isModerator === true;
  const isBanned = u.banned === true;
  const fontsCount = subMap[u.uid] || 0;
  const joined = u.joined||u.createdAt;
  const dateStr = joined ? (typeof joined === 'string' ? new Date(joined).toLocaleDateString('en-US') : (joined.toDate ? joined.toDate().toLocaleDateString('en-US') : '-')) : '-';
  const initials = (u.name||'?').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  const avatarBg = isAdmin ? 'linear-gradient(135deg,#af52de,#7a2fb5)' : isModerator ? 'linear-gradient(135deg,#5ac8fa,#007aff)' : isBanned ? '#888' : 'linear-gradient(135deg,var(--accent),#1e3f3f)';
  return `<div class="admin-user-row" data-uid="${esc(u.uid||'')}" data-name="${esc((u.name||'').toLowerCase())}" data-email="${esc((u.email||'').toLowerCase())}"
    style="display:grid;grid-template-columns:1fr 1fr auto auto auto auto auto;gap:10px;
           align-items:center;padding:10px 14px;border-bottom:1px solid var(--border);
           transition:background .12s;font-size:13px;${isBanned?'opacity:0.6':''}"
    onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background=''">
    <!-- Name -->
    <div style="display:flex;align-items:center;gap:9px;min-width:0">
      <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;
                  background:${avatarBg};
                  color:#fff;font-size:12px;font-weight:700;
                  display:flex;align-items:center;justify-content:center">${initials}</div>
      <div style="min-width:0">
        <div style="font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${esc(u.name||'-')}
          ${isAdmin?'<span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:5px;background:var(--accent);color:#fff;margin-left:5px;vertical-align:middle">ADMIN</span>':''}
          ${(!isAdmin&&isModerator)?'<span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:5px;background:#007aff;color:#fff;margin-left:5px;vertical-align:middle">MOD</span>':''}
          ${isBanned?'<span style="font-size:9px;font-weight:700;padding:1px 6px;border-radius:5px;background:var(--red,#ff3b30);color:#fff;margin-left:5px;vertical-align:middle">BANNED</span>':''}
        </div>
        <div style="font-size:10px;color:var(--text3);margin-top:1px">${esc(u.uid||'').slice(0,12)}.</div>
      </div>
    </div>
    <!-- Email -->
    <div style="color:var(--text2);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(u.email||'')}">
      ${esc(u.email||'-')}
    </div>
    <!-- Status -->
    <div style="text-align:center">
      <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:980px;
        ${isBanned
          ? 'background:rgba(255,59,48,0.12);color:var(--red,#ff3b30);border:1px solid rgba(255,59,48,0.3)'
          : isVerified
            ? 'background:var(--green-dim);color:var(--green);border:1px solid rgba(52,199,89,0.3)'
            : 'background:var(--orange-dim);color:var(--orange);border:1px solid rgba(255,149,0,0.3)'
        }">
        ${isBanned ? '🚫 Banned' : isVerified ? '✅ Verified' : '⏳ Pending'}
      </span>
    </div>
    <!-- Moderator toggle -->
    <div style="text-align:center">
      ${isAdmin
        ? '<span style="font-size:11px;color:var(--text3)">-</span>'
        : `<button onclick="_adminToggleModerator('${esc(u.uid)}','${esc(u.email||'')}',${isModerator})"
            title="${isModerator?'Remove moderator':'Make moderator'}"
            style="padding:4px 10px;border-radius:7px;
                   border:1px solid ${isModerator?'#007aff':'var(--border2)'};
                   background:${isModerator?'rgba(0,122,255,0.12)':'var(--surface3)'};
                   color:${isModerator?'#007aff':'var(--text3)'};
                   font-size:11px;font-weight:700;cursor:pointer;font-family:var(--sans);
                   transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">
            ${isModerator ? '🛡️ Mod' : '+Mod'}
          </button>`}
    </div>
    <!-- Font count -->
    <div style="text-align:center">
      ${fontsCount>0
        ? `<span style="font-family:var(--mono);font-size:12px;font-weight:700;color:var(--accent)">${fontsCount}</span>`
        : `<span style="color:var(--text3);font-size:12px">-</span>`}
    </div>
    <!-- Date -->
    <div style="color:var(--text3);font-size:11px;white-space:nowrap;text-align:center">${dateStr}</div>
    <!-- Actions -->
    <div style="display:flex;gap:5px;justify-content:center;align-items:center">
      ${isAdmin ? '<span style="font-size:11px;color:var(--text3)">-</span>' : `
        <button onclick="_adminToggleBan('${esc(u.uid)}','${esc(u.email||'')}',${isBanned})" title="${isBanned?'Unban user':'Ban user'}"
          style="padding:4px 10px;border-radius:7px;border:1px solid ${isBanned?'var(--green)':'var(--orange)'};
                 background:${isBanned?'rgba(52,199,89,0.1)':'rgba(255,149,0,0.1)'};
                 color:${isBanned?'var(--green)':'var(--orange)'};
                 font-size:11px;font-weight:700;cursor:pointer;font-family:var(--sans);
                 transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">
          ${isBanned ? '✅ Unban' : '🚫 Ban'}
        </button>
        <button onclick="_adminDeleteUser('${esc(u.uid)}','${esc(u.name||u.email||'this user')}')" title="Delete user account"
          style="padding:4px 10px;border-radius:7px;border:1px solid var(--red,#ff3b30);
                 background:rgba(255,59,48,0.1);color:var(--red,#ff3b30);
                 font-size:11px;font-weight:700;cursor:pointer;font-family:var(--sans);
                 transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">
          🗑️ Delete
        </button>
      `}
    </div>
  </div>`;
}

async function _adminToggleBan(uid, email, isBanned){
  if(!uid) return;
  const action = isBanned ? 'unban' : 'ban';
  if(!confirm(`Are you sure you want to ${action} this user?\n\n${email}`)) return;
  try{
    const {doc, updateDoc} = window._fbFns;
    const db = window._fbDb;
    await updateDoc(doc(db,'users',uid), { banned: !isBanned });
    showToast(isBanned ? '✅ User unbanned.' : '🚫 User banned.');
    _renderAdminUsers();
  }catch(err){
    showToast('Error: ' + err.message);
  }
}

async function _adminToggleModerator(uid, email, isModerator){
  if(!_isAdmin(window.currentUser)){ showToast('🚫 Access denied'); return; }
  if(!uid) return;
  const action = isModerator ? 'remove moderator from' : 'make moderator';
  if(!confirm(`Are you sure you want to ${action}:\n\n${email}\n\nModerators can approve/reject font submissions without admin panel access.`)) return;
  try{
    const {doc, updateDoc} = window._fbFns;
    const db = window._fbDb;
    await updateDoc(doc(db,'users',uid), { isModerator: !isModerator });
    showToast(isModerator ? '✅ Moderator removed.' : '🛡️ User is now a moderator.');
    adminLog('mod_toggle', email, isModerator ? 'Moderator removed' : 'Moderator granted');
    _renderAdminUsers();
  }catch(err){
    showToast('Error: ' + err.message);
  }
}

async function _adminDeleteUser(uid, name){
  if(!uid) return;
  if(!_isAdmin(window.currentUser)){ showToast('Access denied'); return; }
  var msg = 'DELETE USER\n\nDelete "' + name + '"?\n\n';
  msg += 'This removes their Firestore record and prevents future login.\n';
  msg += 'IMPORTANT: Also delete from Firebase Console > Authentication > Users.\n\n';
  msg += 'Cannot be undone.';
  if(!confirm(msg)) return;
  try{
    var fns = window._fbFns;
    var db = window._fbDb;
    var docFn = fns.doc, deleteDocFn = fns.deleteDoc, updateDocFn = fns.updateDoc;
    var collFn = fns.collection, getDocsFn = fns.getDocs, queryFn = fns.query, whereFn = fns.where;
    // Step 1: Ban so user cannot login even if Auth record stays
    try{ await updateDocFn(docFn(db,'users',uid), { banned: true, deletedAt: new Date().toISOString() }); }catch(e){ console.warn(e); }
    // Step 2: Delete Firestore user doc
    await deleteDocFn(docFn(db,'users',uid));
    // Step 3: Delete user comments
    try{
      var cSnap = await getDocsFn(queryFn(collFn(db,'comments'), whereFn('userId','==',uid)));
      for(var d of cSnap.docs) await deleteDocFn(d.ref);
    }catch(e){ console.warn('Comment delete error:',e); }
    // Step 4: Remove from localStorage fallback (fn_users) by uid or email
    try{
      var lsUsers = getUsers();
      var filtered = lsUsers.filter(function(u){ return u.id !== uid && u.uid !== uid; });
      saveUsers(filtered);
      // Also clear current session if same user
      var cur = getCurrentUser();
      if(cur && (cur.id === uid || cur.uid === uid)){
        localStorage.removeItem('fn_current_user');
        localStorage.setItem('tv_liked','[]');
      }
    }catch(e){ console.warn('localStorage user remove error:',e); }
    showToast('User deleted from database. Remember to delete from Firebase Console > Authentication too.');
    _renderAdminUsers();
  }catch(err){
    console.error('Delete user error:', err);
    if(err.code==='permission-denied'||err.message.includes('permission')){
      showToast('PERMISSION DENIED: Add "allow delete" for users collection in Firestore rules (Firebase Console).');
    } else {
      showToast('Error: ' + err.message);
    }
  }
}

function _filterAdminUsers(q){
  const rows = document.querySelectorAll('.admin-user-row');
  const lq = q.toLowerCase();
  rows.forEach(row=>{
    const match = !lq || row.dataset.name.includes(lq) || row.dataset.email.includes(lq);
    row.style.display = match ? '' : 'none';
  });
}
// ????????????????????????????????????????????????????????????????????????????

// ── REAL LANGUAGE GLYPH-COUNT CACHE ──
// NOT a duplicate of _LANG_CACHE: _LANG_CACHE stores the list of detected
// language *labels* (e.g. ['Latin','Cyrillic']) for the language tags shown
// on cards/detail. _GLYPH_COUNT_CACHE stores a numeric *glyph count* per font
// (used for the "X characters supported" stat), computed via canvas glyph tests.
const _GLYPH_COUNT_CACHE = {};
const SUBSET_LANG_COUNT = {
  'latin':100,'latin-ext':200,'cyrillic':9,'cyrillic-ext':6,
  'greek':2,'greek-ext':2,'vietnamese':1,'arabic':25,'hebrew':3,
  'devanagari':120,'khmer':1,'thai':1,'georgian':1,'armenian':1,
  'bengali':1,'gujarati':1,'gurmukhi':1,'kannada':1,'malayalam':1,
  'myanmar':1,'oriya':1,'sinhala':1,'tamil':1,'telugu':1,
  'tibetan':1,'mongolian':1,'ethiopic':1,
  'chinese-simplified':1,'chinese-traditional':1,'japanese':1,'korean':1,
};

// Canvas-based detection: test if font renders a char differently than fallback
function _canvasTestChar(fontName, weight, char) {
  try {
    const c = document.createElement('canvas'); c.width = 24; c.height = 24;
    const ctx = c.getContext('2d');
    const draw = (fam) => { ctx.clearRect(0,0,24,24); ctx.font = `${weight} 16px ${fam}`; ctx.fillText(char, 2, 18); return ctx.getImageData(0,0,24,24).data.join(','); };
    const withFont = draw(`'${fontName}', monospace`);
    const fallback = draw('monospace');
    return withFont !== fallback;
  } catch(e) { return false; }
}

const CANVAS_SCRIPT_TESTS = [
  { subset:'latin',      char:'A',       count:100 },
  { subset:'latin-ext',  char:'À',  count:200 },
  { subset:'cyrillic',   char:'А',  count:9   },
  { subset:'greek',      char:'α',  count:2   },
  { subset:'arabic',     char:'ب',  count:25  },
  { subset:'hebrew',     char:'א',  count:3   },
  { subset:'devanagari', char:'अ',  count:120 },
  { subset:'thai',       char:'ก',  count:1   },
  { subset:'georgian',   char:'ა',  count:1   },
  { subset:'armenian',   char:'Ա',  count:1   },
  { subset:'bengali',    char:'অ',  count:1   },
  { subset:'gujarati',   char:'અ',  count:1   },
  { subset:'tamil',      char:'அ',  count:1   },
  { subset:'telugu',     char:'అ',  count:1   },
  { subset:'kannada',    char:'ಅ',  count:1   },
  { subset:'malayalam',  char:'അ',  count:1   },
  { subset:'myanmar',    char:'က',  count:1   },
  { subset:'khmer',      char:'ក',  count:1   },
  { subset:'ethiopic',   char:'ሀ',  count:1   },
  { subset:'vietnamese', char:'Ạ',  count:1   },
  { subset:'mongolian',  char:'ᠠ',  count:1   },
  { subset:'japanese',   char:'あ',  count:1   },
  { subset:'korean',     char:'가',  count:1   },
];

async function detectFontLangCount(font) {
  if (_GLYPH_COUNT_CACHE[font.id] !== undefined) return _GLYPH_COUNT_CACHE[font.id];
  _GLYPH_COUNT_CACHE[font.id] = null;

  // Google Fonts: fetch CSS and parse subset comments
  if (font.gfamily && !font.pending) {
    try {
      const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.name)}&display=swap`;
      const resp = await fetch(url);
      const css = await resp.text();
      const subsets = [...new Set((css.match(/\/\* ([a-z][a-z-]*) \*\//g)||[]).map(s=>s.slice(3,-3)))];
      const count = subsets.reduce((s,sub)=>s+(SUBSET_LANG_COUNT[sub]||0),0);
      _GLYPH_COUNT_CACHE[font.id] = count || null;
      return _GLYPH_COUNT_CACHE[font.id];
    } catch(e) {}
  }

  // Custom / uploaded font: canvas detection (run after font is loaded)
  await document.fonts.ready;
  let count = 0;
  for (const t of CANVAS_SCRIPT_TESTS) {
    if (_canvasTestChar(font.name, font.weight||'400', t.char)) count += t.count;
  }
  _GLYPH_COUNT_CACHE[font.id] = count || null;
  return _GLYPH_COUNT_CACHE[font.id];
}

function updateCardLangCount(fontId) {
  const font = FONTS.find(f => f.id === fontId);
  if (!font) return;
  detectFontLangCount(font).then(count => {
    if (!count) return;
    const el = document.getElementById('lang-count-' + fontId);
    if (el) el.textContent = '· ' + count + '+ languages';
  });
}

function loadPvBgImage(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    pvBgImage=e.target.result;
    document.getElementById('pvImgLabel').textContent='Change';
    document.getElementById('pvImgClearBtn').style.display='';
    document.querySelector('.pv-img-upload-btn').classList.add('active');
    // Sekil yükl?ndi - r?ng kontrollari lazimsiz, gizl?
    const cc=document.getElementById('pvColorControls');if(cc)cc.style.display='none';
    renderPvCanvas();
  };
  reader.readAsDataURL(file);
}
function clearPvBgImage(){
  pvBgImage=null;
  document.getElementById('pvImgLabel').textContent='Add Image';
  document.getElementById('pvImgClearBtn').style.display='none';
  document.querySelector('.pv-img-upload-btn').classList.remove('active');
  document.getElementById('pvImgInput').value='';
  // Image cleared - show color controls again
  const cc=document.getElementById('pvColorControls');if(cc)cc.style.display='flex';
  // Color inputlari sifirla
  const bs=document.getElementById('pvBgHue');if(bs)bs.value='#ffffff';
  const fs=document.getElementById('pvFgHue');if(fs)fs.value='#111111';
  pvBgColor='#ffffff';pvTextColor='#111111';
  renderPvCanvas();
}

// ?? IMAGE OVERLAY MODE ??
let pvOverlayTextColor = '#ffffff';
let pvOverlayAlign = 'left';
let pvOverlayPos = 'center';

function pvLoadOverlayImage(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('pvImgOverlayImg').src = e.target.result;
    document.getElementById('pvImgDropZone').style.display = 'none';
    document.getElementById('pvImgOverlayCanvas').style.display = 'flex';
    document.getElementById('pvImgOverlayCanvas').style.flexDirection = 'column';
    // set default text to font name
    if(!document.getElementById('pvImgOverlayTextInput').value && currentDetailFont){
      document.getElementById('pvImgOverlayTextInput').value = currentDetailFont.name;
    }
    pvUpdateOverlay();
  };
  reader.readAsDataURL(file);
}

function pvHandleDrop(e){
  e.preventDefault();
  e.currentTarget.style.borderColor='var(--border2)';
  e.currentTarget.style.background='var(--surface3)';
  const file = e.dataTransfer.files[0];
  if(!file || !file.type.startsWith('image/')) return;
  const fakeInput = {files:[file]};
  pvLoadOverlayImage(fakeInput);
}

function pvClearOverlayImage(){
  document.getElementById('pvImgDropZone').style.display='flex';
  document.getElementById('pvImgOverlayCanvas').style.display='none';
  document.getElementById('pvImgOverlayImg').src='';
  document.getElementById('pvImgOverlayTextInput').value='';
}

function pvUpdateOverlay(){
  if(!currentDetailFont) return;
  const font = currentDetailFont;
  const txt = document.getElementById('pvImgOverlayTextInput').value || font.name;
  const sz = parseInt(document.getElementById('pvImgOverlaySize').value) || 64;
  const textEl = document.getElementById('pvImgOverlayText');
  const wrapEl = document.getElementById('pvImgOverlayWrap');

  textEl.style.fontFamily = `'${font.name}',sans-serif`;
  textEl.style.fontSize = sz + 'px';
  textEl.style.color = pvOverlayTextColor;
  textEl.style.textAlign = pvOverlayAlign;
  textEl.style.lineHeight = '1.15';
  textEl.style.letterSpacing = '-0.02em';
  textEl.textContent = txt;

  // vertical position
  if(pvOverlayPos === 'top'){
    wrapEl.style.alignItems = 'flex-start';
    textEl.style.paddingTop = '32px';
    textEl.style.paddingBottom = '16px';
  } else if(pvOverlayPos === 'bottom'){
    wrapEl.style.alignItems = 'flex-end';
    textEl.style.paddingTop = '16px';
    textEl.style.paddingBottom = '32px';
  } else {
    wrapEl.style.alignItems = 'center';
    textEl.style.paddingTop = '24px';
    textEl.style.paddingBottom = '24px';
  }

  // ensure img fills wrap height
  const img = document.getElementById('pvImgOverlayImg');
  wrapEl.style.minHeight = '320px';
  img.style.height = wrapEl.offsetHeight > 0 ? wrapEl.offsetHeight + 'px' : '320px';
}

function pvUpdateOverlayTint(val){
  document.getElementById('pvImgOverlayTint').style.background = `rgba(0,0,0,${val/100})`;
}

function pvSetOverlayTextColor(color, el){
  pvOverlayTextColor = color;
  document.querySelectorAll('.ov-swatch').forEach(s => {
    s.style.border = '2px solid transparent';
    s.classList.remove('on');
  });
  el.style.border = '2px solid var(--accent)';
  el.classList.add('on');
  pvUpdateOverlay();
}

function pvSetOverlayAlign(a, btn){
  pvOverlayAlign = a;
  document.querySelectorAll('#pvOvAlL,#pvOvAlC,#pvOvAlR').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  pvUpdateOverlay();
}

function pvSetOverlayPos(pos, btn){
  pvOverlayPos = pos;
  document.querySelectorAll('#pvOvPosT,#pvOvPosM,#pvOvPosB').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  pvUpdateOverlay();
}

function uploadProfilePhoto(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const dataUrl=e.target.result;
    if(!window.currentUser)return;
    window.currentUser.photo=dataUrl;
    saveCurrentUser(window.currentUser);
    // Sync to Firestore if available
    if(window._fbFns && window._fbAuth && window._fbDb){
      const {doc, updateDoc} = window._fbFns;
      const db = window._fbDb;
      const uid = window.currentUser.id;
      updateDoc(doc(db,'users',uid),{photo:dataUrl}).catch(e=>console.warn('Photo Firestore update:',e));
    } else {
      const users=getUsers();
      const idx=users.findIndex(u=>u.id===window.currentUser.id);
      if(idx>=0){users[idx].photo=dataUrl;saveUsers(users);}
    }
    applyProfilePhoto(dataUrl);
    showToast('✅ Profile photo updated');
  };
  reader.readAsDataURL(file);
}
function applyProfilePhoto(url){
  const el=document.getElementById('profileAvatarLg');
  const avatarSvg=`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  if(url){el.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;}
  else{el.innerHTML=avatarSvg;}
  const nav=document.getElementById('userAvatarCircle');
  const navSvg=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  if(nav){
    if(url)nav.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    else nav.innerHTML=navSvg;
  }
}

function heroBannerHueChange(val){
  val=parseInt(val);
  const banner=document.getElementById('heroBannerAuto');
  const dot=document.getElementById('heroBannerColorDot');
  const txt=document.getElementById('heroBannerText');
  if(!banner)return;
  const bg=val===0?'#0a0a0a':`hsl(${val},55%,14%)`;
  const fg=val===0?'#ffffff':`hsl(${val},80%,78%)`;
  banner.style.background=bg;
  if(dot)dot.style.background=bg;
  if(txt)txt.style.color=fg;
}

function resetHeroBanner(){
  const font=currentDetailFont;if(!font)return;
  const txt=document.getElementById('fdpPvInput')?.value||font.name;
  const heroBgPalettes=[
    {bg:'#0a0a0a',text:'#ffffff'},{bg:'#111827',text:'#f9fafb'},
    {bg:'#0f172a',text:'#e2e8f0'},{bg:'#1a0a00',text:'#fde68a'},
    {bg:'#0a0a1a',text:'#c4b5fd'},{bg:'#042f2e',text:'#99f6e4'},
    {bg:'#1e1b18',text:'#fef3c7'},{bg:'#0c0a09',text:'#fafaf9'},
    {bg:'#18181b',text:'#f4f4f5'},
  ];
  const pal=heroBgPalettes[Math.floor(Math.random()*heroBgPalettes.length)];
  document.getElementById('fdpHeroInner').innerHTML=`
    <div id="heroBannerAuto" style="
        width:100%;max-width:100%;min-width:0;min-height:420px;border-radius:14px;overflow:hidden;height:auto;
        background:${pal.bg};
        display:flex;align-items:center;justify-content:center;
        margin-bottom:20px;
        box-shadow:0 4px 24px rgba(0,0,0,0.18);
        position:relative;box-sizing:border-box;flex-shrink:1;
      ">
      <div id="heroBannerText" style="
        font-family:'${esc(font.name)}',sans-serif;
        font-weight:${font.weight};
        font-size:72px;
        color:${pal.text};
        line-height:1.1;letter-spacing:-0.03em;
        user-select:none;text-align:center;
        word-break:break-word;white-space:normal;
        width:90%;max-width:90%;min-width:0;overflow:visible;
        display:block;/*-webkit-line-clamp:2*/;-webkit-box-orient:vertical;
        transition:font-size .1s;
      ">${esc(txt)}</div>
      <div style="position:absolute;bottom:12px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:4px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);padding:4px 6px;border-radius:980px;border:1px solid rgba(255,255,255,0.18);">
            <button onclick="(function(){var b=document.getElementById('heroBannerText');if(b){var s=parseFloat(b.style.fontSize)||100;b.style.fontSize=Math.max(16,s-16)+'px';}})()" style="width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent;">A-</button>
            <button onclick="(function(){var b=document.getElementById('heroBannerText');if(b){var s=parseFloat(b.style.fontSize)||100;b.style.fontSize=Math.min(400,s+16)+'px';}})()" style="width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent;">A+</button>
          </div>
          <div id="heroBannerColorWrap" style="display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);padding:5px 11px;border-radius:980px;border:1px solid rgba(255,255,255,0.18);">
            <div id="heroBannerColorDot" style="width:10px;height:10px;border-radius:50%;background:${pal.bg};border:1.5px solid rgba(255,255,255,0.5);flex-shrink:0;"></div>
            <input type="range" class="hb-hue" min="0" max="360" value="0" step="1"
              oninput="heroBannerHueChange(this.value)">
          </div>
        </div>
        <label style="cursor:pointer;display:flex;align-items:center;gap:6px;
          background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);color:rgba(255,255,255,0.85);
          font-size:11px;font-weight:600;padding:6px 12px;border-radius:980px;
          border:1px solid rgba(255,255,255,0.2);transition:background .15s;flex-shrink:0;"
          onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Add image
          <input type="file" accept="image/*" style="display:none" onchange="heroBannerUpload(this)">
        </label>
      </div>
    </div>`;
}

function heroBannerUpload(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const font=currentDetailFont;if(!font)return;
    const txt=document.getElementById('fdpPvInput')?.value||font.name;
    document.getElementById('fdpHeroInner').innerHTML=`
      <div id="heroBannerAuto" style="position:relative;width:100%;max-width:100%;min-width:0;min-height:420px;border-radius:14px;overflow:hidden;height:auto;margin-bottom:20px;box-sizing:border-box;">
        <img src="${e.target.result}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">
        <div id="heroBannerTint" style="position:absolute;inset:0;background:rgba(0,0,0,0.4);transition:background .2s;"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:32px;box-sizing:border-box;pointer-events:none;">
          <div id="heroBannerText" style="
            font-family:'${font.name}',sans-serif;
            font-weight:${font.weight};
            font-size:64px;
            color:#fff;
            line-height:1.1;letter-spacing:-0.03em;
            user-select:none;text-align:center;
            word-break:break-word;white-space:normal;
            max-width:100%;overflow:visible;transition:font-size .1s;
          ">${txt}</div>
        </div>
        <div style="position:absolute;bottom:12px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;">
            <!-- Brightness slider -->
            <div style="display:flex;align-items:center;gap:7px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);padding:6px 11px;border-radius:980px;border:1px solid rgba(255,255,255,0.15);">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <input type="range" class="hb-bright" min="0" max="90" value="40" step="5"
                oninput="const t=document.getElementById('heroBannerTint');if(t)t.style.background='rgba(0,0,0,'+this.value/100+')'">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="rgba(255,255,255,0.7)" stroke="none"/></svg>
            </div>
            <!-- Font zoom slider -->
            <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);padding:5px 10px;border-radius:980px;border:1px solid rgba(255,255,255,0.15);">
              <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);font-family:sans-serif;line-height:1;">A</span>
              <input type="range" class="hb-zoom" min="16" max="400" value="64" step="8"
                oninput="const b=document.getElementById('heroBannerText');if(b)b.style.fontSize=this.value+'px'">
              <span style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.7);font-family:sans-serif;line-height:1;">A</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <!-- Reset image -->
            <button onclick="resetHeroBanner()" style="cursor:pointer;display:flex;align-items:center;gap:5px;
              background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);color:rgba(255,255,255,0.8);
              font-size:11px;font-weight:600;padding:6px 11px;border-radius:980px;
              border:1px solid rgba(255,255,255,0.15);transition:background .15s;flex-shrink:0;font-family:inherit;"
              onmouseover="this.style.background='rgba(180,0,0,0.65)';this.style.color='#fff'" onmouseout="this.style.background='rgba(0,0,0,0.5)';this.style.color='rgba(255,255,255,0.8)'">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5.1L1 10"/></svg>
              Reset
            </button>
            <!-- Change image -->
            <label style="cursor:pointer;display:flex;align-items:center;gap:6px;
              background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);color:#fff;
              font-size:11px;font-weight:600;padding:6px 11px;border-radius:980px;
              border:1px solid rgba(255,255,255,0.15);transition:background .15s;flex-shrink:0;"
              onmouseover="this.style.background='rgba(0,0,0,0.75)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Change image
              <input type="file" accept="image/*" style="display:none" onchange="heroBannerUpload(this)">
            </label>
          </div>
        </div>
      </div>`;
    /* Re-apply mobile banner patch after image upload */
    if(window.innerWidth <= 768 && typeof window.patchHero === 'function') setTimeout(window.patchHero, 100);
  };
  reader.readAsDataURL(file);
}

function renderPvCanvas(){
  if(!currentDetailFont)return;
  const font=currentDetailFont;
  const canvas=document.getElementById('pvCanvas');
  const txt=document.getElementById('fdpPvInput').value||font.name;
  const sz=parseInt(document.getElementById('fdpSizeRange').value)||56;
  // Reset any inline padding overrides
  canvas.style.paddingBottom='';
  canvas.style.paddingTop='';
  const ls=parseFloat(document.getElementById('pvLS').value)||0;
  const lh=parseFloat(document.getElementById('pvLH').value)||1.15;
  document.getElementById('pvLSVal').textContent=ls+'px';
  document.getElementById('pvLHVal').textContent=lh;
  // Banner m?tn sinxronu - yalniz auto banner varsa (s?kil yox)
  const bannerTxt=document.getElementById('heroBannerText');
  if(bannerTxt) bannerTxt.textContent=txt||font.name;
  const bgWrap=document.getElementById('pvCanvasBg');
  canvas.style.color=pvTextColor;
  if(pvBgImage){
    bgWrap.style.background=pvBgColor;
    bgWrap.style.backgroundImage=`url(${pvBgImage})`;
    bgWrap.style.backgroundSize='cover';
    bgWrap.style.backgroundPosition='center';
    bgWrap.style.backgroundRepeat='no-repeat';
    canvas.style.background='none';
    canvas.style.backgroundImage='none';
  } else {
    bgWrap.style.background=pvBgColor;
    bgWrap.style.backgroundImage='none';
    canvas.style.background='none';
    canvas.style.backgroundImage='none';
  }
  // Add bottom padding to bgWrap based on font size so descenders are covered
  bgWrap.style.paddingBottom='';
  const fontStyle=pvItalic?'italic':'normal';
  const fontWeight=pvBold?'bold':activeDetailWeight;
  const _av=font.fontVariants&&font.fontVariants[activeDetailVariantIdx||0];
  const _pvFamily=(_av&&_av._familyName)||(_av?(font.name+' '+parseVariantStyle(_av.name||'').label):font.name);
  const bs=`font-family:'${_pvFamily}',sans-serif;font-weight:${fontWeight};font-style:${fontStyle};letter-spacing:${ls}px;color:${pvTextColor};`;
  document.querySelectorAll('.wt-sample').forEach(el=>el.textContent=txt);

  if(pvMode==='text'){
    canvas.innerHTML=`<div style="${bs}font-size:${sz}px;line-height:${Math.max(lh,1.4)};text-align:${pvAlign};word-break:break-word;padding-bottom:0.25em;width:100%">${esc(txt)}</div>`;
  } else if(pvMode==='waterfall'){
    const wfSizes=[10,12,14,18,24,32,48,64,80,96];
    const sepColor=pvBgColor==='#1a1a1a'||pvBgColor==='#1e3a5f'||pvBgColor==='#2d0a3e'?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
    canvas.style.padding='6px 0';
    const wf=document.createElement('div');wf.className='pv-wf';
    wfSizes.forEach(s=>{
      const row=document.createElement('div');row.className='pv-wf-row';
      row.style.borderBottomColor=sepColor;
      row.innerHTML=`<span class="pv-wf-sz" style="color:${pvTextColor};opacity:.4">${s}</span><span class="pv-wf-txt" style="${bs}font-size:${s}px;line-height:1.3">${esc(txt)}</span>`;
      wf.appendChild(row);
    });
    canvas.innerHTML='';canvas.appendChild(wf);
  } else if(pvMode==='paragraph'){
    const bodySize=Math.max(14,Math.min(sz,22));
    canvas.innerHTML=`<div class="pv-para" style="${bs}text-align:${pvAlign}">
      <strong style="${bs}font-size:${sz}px;line-height:1.1;display:block;margin-bottom:14px;font-weight:700">${esc(txt)}</strong>
      <span style="font-size:${bodySize}px;line-height:${lh}">${LOREM}</span>
    </div>`;
  } else if(pvMode==='pairs'){
    const bodySize=Math.max(13,Math.round(sz*0.3));
    canvas.innerHTML=`<div class="pv-pairs">
      <div style="${bs}font-size:${sz}px;line-height:1.1;font-weight:700;text-align:${pvAlign};margin-bottom:12px">${esc(txt)}</div>
      <div style="${bs}font-size:${bodySize}px;line-height:${lh};text-align:${pvAlign};opacity:.75">${LOREM.substring(0,240)}</div>
    </div>`;
  } else if(pvMode==='stress'){
    const stressSize=Math.max(16,Math.round(sz*0.42));
    const rows=[
      {label:'Uppercase',chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'},
      {label:'Lowercase',chars:'abcdefghijklmnopqrstuvwxyz'},
      {label:'Numbers',chars:'0123456789'},
      {label:'Punctuation',chars:'!?.,;:\'"--()[]{}/@#$%^&*+=<>'},
      {label:'Mixed Sentence',chars:'The Quick Brown Fox Jumps Over The Lazy Dog.'},
      {label:'Mathematical',chars:'π≈3.14159 · e≈2.71828 · φ≈1.61803 · √2≈1.41421'},
    ];
    canvas.innerHTML=`<div class="pv-stress">${rows.map(r=>`
      <div class="pv-stress-row">
        <div class="pv-stress-label" style="color:${pvTextColor}">${r.label}</div>
        <div class="pv-stress-chars" style="${bs}font-size:${stressSize}px">${r.chars}</div>
      </div>`).join('')}</div>`;
  } else if(pvMode==='description'){
    const descText = font.description || '';
    const sepColor = pvBgColor==='#1a1a1a'||pvBgColor==='#1e3a5f'||pvBgColor==='#2d0a3e' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    const subColor = pvBgColor==='#1a1a1a'||pvBgColor==='#1e3a5f'||pvBgColor==='#2d0a3e' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
    canvas.innerHTML = descText
      ? `<div style="padding:24px 28px;display:flex;flex-direction:column;gap:16px;width:100%;box-sizing:border-box">
          <div style="font-family:var(--sans);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${subColor}">About this font</div>
          <div style="${bs}font-size:${Math.max(14,Math.min(sz,28))}px;line-height:1.65;text-align:${pvAlign};word-break:break-word;border-top:1px solid ${sepColor};padding-top:16px">${esc(descText)}</div>
        </div>`
      : `<div style="padding:32px 28px;font-family:var(--sans);font-size:13px;color:${subColor};font-style:italic">No description available for this font.</div>`;
  }
}

function setPvMode(mode,btn){
  pvMode=mode;
  document.querySelectorAll('.pv-mode-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const isOverlay = mode==='imgoverlay';
  document.getElementById('pvCanvas').style.display = isOverlay ? 'none' : '';
  document.getElementById('pvImgOverlayPanel').style.display = isOverlay ? 'flex' : 'none';
  document.getElementById('pvTopRow').style.display = (mode==='waterfall'||isOverlay) ? 'none' : 'flex';
  document.getElementById('pvTopRow').previousElementSibling && null; // style-bar stays visible
  // hide style bar for overlay mode (has its own controls)
  const styleBar = document.querySelector('.pv-style-bar');
  if(styleBar) styleBar.style.display = isOverlay ? 'none' : '';
  if(!isOverlay) renderPvCanvas();
  else pvUpdateOverlay();
}
function togglePvStyle(which){
  if(which==='bold'){pvBold=!pvBold;document.getElementById('pvBoldBtn').classList.toggle('on',pvBold);}
  else{pvItalic=!pvItalic;document.getElementById('pvItalicBtn').classList.toggle('on',pvItalic);}
  renderPvCanvas();
}
function setPvAlign(a,btn){
  pvAlign=a;
  document.querySelectorAll('#pvAlL,#pvAlC,#pvAlR').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  renderPvCanvas();
}
function setPvBg(bg,fg,swatch){
  pvBgColor=bg;pvTextColor=fg;
  const bs=document.getElementById('pvBgHue');if(bs)bs.value=bg;
  const fs=document.getElementById('pvFgHue');if(fs)fs.value=fg;
  renderPvCanvas();
}
// Seçilmis r?ngi saxla - color picker d?yis?nd? yenil?nirik
let _pvBaseBgColor = '#ffffff';

function applyPvDarkness(val){
  val = parseInt(val);
  // val=0 ? orijinal r?ng; val=100 ? tamamil? qara
  const r = parseInt(_pvBaseBgColor.slice(1,3),16);
  const g = parseInt(_pvBaseBgColor.slice(3,5),16);
  const b = parseInt(_pvBaseBgColor.slice(5,7),16);
  const factor = 1 - (val / 100);
  const dr = Math.round(r * factor);
  const dg = Math.round(g * factor);
  const db = Math.round(b * factor);
  const hex = '#' + [dr,dg,db].map(v=>v.toString(16).padStart(2,'0')).join('');
  pvBgColor = hex;
  renderPvCanvas();
}
function updatePvBgHex(hex){
  // Reset darkness slider when color picker is used manually
  const ds=document.getElementById('pvDarknessSlider');
  if(ds) ds.value=0;
  _pvBaseBgColor = hex;  // Seçilmis r?ngi yadda saxla
  pvBgColor=hex;
  document.querySelectorAll('.pv-swatch').forEach(s=>s.classList.remove('on'));
  renderPvCanvas();
}
function updatePvFgHex(hex){
  pvTextColor=hex;
  document.querySelectorAll('.pv-swatch').forEach(s=>s.classList.remove('on'));
  renderPvCanvas();
}
// keep legacy aliases for any internal callers
function updatePvBgHue(val){val=parseInt(val);updatePvBgHex(val===0?'#ffffff':`hsl(${val},55%,92%)`);}
function updatePvFgHue(val){val=parseInt(val);updatePvFgHex(val===0?'#111111':`hsl(${val},70%,18%)`);}

function updateDetailSize(){
  const val=parseInt(document.getElementById('fdpSizeRange').value);
  document.getElementById('fdpSizeVal').textContent=val;renderPvCanvas();
}

// CODE SNIPPETS
function getCodeSnippet(font,tab,weight){
  if(!font)return'';
  const family=font.gfamily||font.name.replace(/ /g,'+');
  if(tab==='css'){
    return `@import url('https://fonts.googleapis.com/css2?family=${family}');\n\nbody {\n  font-family: '${font.name}', sans-serif;\n  font-weight: ${weight};\n}`;
  } else if(tab==='html'){
    return `<!-- In <head> -->\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=${family}&display=swap"\n      rel="stylesheet">\n\n<!-- Usage -->\n<p style="font-family: '${font.name}', sans-serif;\n          font-weight: ${weight};">\n  Your text here\n</p>`;
  } else if(tab==='next'){
    const vName=font.name.replace(/ /g,'_');
    return `// app/layout.tsx\nimport { ${vName} } from 'next/font/google';\n\nconst font = ${vName}({\n  subsets: ['latin'],\n  weight: ['${weight}']\n});\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang="en">\n      <body className={font.className}>\n        {children}\n      </body>\n    </html>\n  );\n}`;
  }
  return'';
}
function switchCodeTab(tab,btn){
  activeCodeTab=tab;
  document.querySelectorAll('.fdp-code-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  const labels={css:'Import & Usage',html:'HTML Link Tag',next:'Next.js Font'};
  const lbl=document.getElementById('fdpCodeTabLabel'); if(lbl) lbl.textContent=labels[tab]||'';
  const blk=document.getElementById('fdpCodeBlock'); if(blk && currentDetailFont) blk.textContent=getCodeSnippet(currentDetailFont,tab,activeDetailWeight);
  const cpb=document.getElementById('fdpCopyBtn'); if(cpb){cpb.textContent='Copy';cpb.classList.remove('copied');}
}



// CHARMAP
let activeCharTab='upper';
const LANG_SUPPORT_LIST=[
  {code:'Latin',label:'Latin',chars:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',color:'#dc2626'},
  {code:'Latin Ext',label:'Latin Ext',chars:'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß',color:'#ff6b35'},
  {code:'Cyrillic',label:'Кир',chars:'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя',color:'#5856d6'},
  {code:'Greek',label:'Ελλ',chars:'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω',color:'#007aff'},
  {code:'Arabic',label:'عرب',chars:'ابتثجحخدذرزسشصضطظعغفقكلمنهوي',color:'#34c759'},
  {code:'Hebrew',label:'עבר',chars:'אבגדהוזחטיכלמנסעפצקרשת',color:'#ff9500'},
  {code:'Digits',label:'0-9',chars:'0123456789',color:'#8e8e93'},
  {code:'Punct',label:'Punct',chars:'!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',color:'#636366'},
];
function _fontCanRender(fontName,weight,testChars){
  // PRIMARY: If uploadedFontData has a parsed unicodeSet, use it - 100% accurate.
  if(uploadedFontData&&uploadedFontData.unicodeSet&&uploadedFontData.unicodeSet.size>0){
    const set=uploadedFontData.unicodeSet;
    return (testChars||[]).some(ch=>set.has(ch.codePointAt(0)));
  }
  // FALLBACK: canvas diff - draw char with font vs without, compare pixels.
  try{
    const W=36,H=36;
    function drawChar(family,ch){
      const c=document.createElement('canvas');c.width=W;c.height=H;
      const ctx=c.getContext('2d');
      ctx.font=`${weight||400} 22px ${family}`;
      ctx.fillText(ch,2,26);
      return ctx.getImageData(0,0,W,H).data.join(',');
    }
    const candidates=(testChars||[]).slice(0,6);
    for(const ch of candidates){
      if(drawChar(`'${fontName}',monospace`,ch)!==drawChar('monospace',ch)) return true;
    }
    return false;
  }catch(e){return false;}
}
function renderCharmapLangBadges(font){
  const container=document.getElementById('charmapLangBadges');
  if(!container)return;
  container.innerHTML='';
  // Use resolveFontLangs - single source of truth for all fonts
  resolveFontLangs(font, supported=>{
    LANG_SUPPORT_LIST.forEach(lang=>{
      const ok=supported.includes(lang.label);
      const pill=document.createElement('span');
      pill.style.cssText=`display:inline-flex;align-items:center;gap:4px;padding:3px 9px 3px 7px;border-radius:980px;font-size:10px;font-weight:600;letter-spacing:.02em;font-family:var(--sans);border:1px solid;transition:opacity .2s;${ok?`background:${lang.color}18;color:${lang.color};border-color:${lang.color}30`:'background:var(--surface3);color:var(--text3);border-color:var(--border);opacity:0.55'}`;
      pill.innerHTML=ok
        ? `<svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,6 5,9 10,3"/></svg>${lang.label}`
        : `<span style="font-size:9px;opacity:.6">–</span>${lang.label}`;
      pill.title=`${lang.label}: ${ok?'Supported':'Not detected'}`;
      container.appendChild(pill);
    });
  });
}
function renderCharmap(font){
  const grid=document.getElementById('charmapGrid');
  const chars=CHARMAP_SETS[activeCharTab];
  const _ff=activeVariantFamily||font.name;
  const _fw=activeDetailWeight;
  grid.innerHTML=chars.map(ch=>`<div class="charmap-cell" style="font-family:'${_ff}',sans-serif;font-weight:${_fw};" title="${ch}">${esc(ch)}</div>`).join('');
  // Sync active tab highlight
  const tabsEl=document.querySelector('.fdp-charmap-box .charmap-tabs');
  if(tabsEl){
    tabsEl.querySelectorAll('.charmap-tab').forEach(b=>{
      b.classList.toggle('active', b.getAttribute('data-tabkey')===activeCharTab);
    });
  }
  renderCharmapLangBadges(font);
}
function switchCharTab(tabKey,btn){
  activeCharTab=tabKey;
  const tabsEl=document.querySelector('.fdp-charmap-box .charmap-tabs');
  if(tabsEl)tabsEl.querySelectorAll('.charmap-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(currentDetailFont)renderCharmap(currentDetailFont);
}

// WEIGHT SELECT
let activeDetailVariantIdx=0;
let activeVariantFamily=null;
function selectWeightVariant(idx,rowEl){
  if(!currentDetailFont)return;
  activeDetailVariantIdx=idx;
  document.querySelectorAll('.weight-row').forEach(r=>r.classList.remove('wt-active'));
  if(rowEl)rowEl.classList.add('wt-active');
  const v=currentDetailFont.fontVariants&&currentDetailFont.fontVariants[idx];
  if(v){
    const vi=parseVariantStyle(v.name||'');
    activeDetailWeight=String(vi.weight);
    activeVariantFamily=v._familyName||null;
    pvItalic=(vi.style==='italic');
    const italicBtn=document.getElementById('pvItalicBtn');
    if(italicBtn) italicBtn.classList.toggle('on',pvItalic);
    renderPvCanvas();
    if(currentDetailFont)renderCharmap(currentDetailFont);
    showToast('Variant: '+vi.label);
  }
}

function selectWeight(fontId,weight,rowEl){
  if(!currentDetailFont)return;
  activeDetailWeight=weight;
  document.querySelectorAll('.weight-row').forEach(r=>r.classList.remove('wt-active'));rowEl.classList.add('wt-active');
  renderPvCanvas();if(currentDetailFont)renderCharmap(currentDetailFont);
  const blk=document.getElementById('fdpCodeBlock'); if(blk && currentDetailFont) blk.textContent=getCodeSnippet(currentDetailFont,activeCodeTab,weight);
  showToast(`Weight ${weight} - ${WEIGHT_NAMES[weight]||'Custom'}`);
}

// DETAIL PAGE
// Detail page-dən çıx — filterləri sıfırlamadan
function closeAuthorPage(){
  document.getElementById('authorPage').style.display='none';
  // Əgər profile üzərindən author page-ə gəlinibsə, profile-i də gizlət
  const _pp=document.getElementById('profilePage');
  if(_pp && _pp.style.display!=='none') _pp.style.display='none';
  document.getElementById('gridLayout').style.display='';
  document.getElementById('toolbarBar').style.display='';
  document.getElementById('heroSection').style.display='';
  try{ history.replaceState({page:'grid'},'','/'); } catch(e){}
  syncUrl(true);
  renderFonts();
  if(typeof window._restoreGridScroll === 'function') window._restoreGridScroll();
  else window.scrollTo(0,0);
  updatePageMeta({ title: 'Font·Monster - Free Font Discovery', url: location.pathname + location.search });
}

function closeDetail(){
  // Scroll mövqeyini əvvəlcədən yadda saxla ki renderFonts() üstünə yazmasın
  const savedScroll = (typeof window._savedGridScroll !== 'undefined') ? window._savedGridScroll : 0;
  // Üst-üstə açıq qalan modalları bağla
  const _pm=document.getElementById('pairModal');
  if(_pm&&_pm.style.opacity==='1') closePairModal();
  const _adm=document.getElementById('adminPanelOverlay');
  if(_adm&&_adm.style.display!=='none') closeAdminPanel(true);
  const _mod=document.getElementById('modPanelOverlay');
  if(_mod&&_mod.style.display!=='none') closeModPanel(true);
  document.getElementById('gridLayout').style.display='';
  document.getElementById('fontDetailPage').classList.remove('visible');
  document.getElementById('toolbarBar').style.display='';
  document.getElementById('heroSection').style.display='';
  currentDetailFont=null;
  try{ history.replaceState({page:'grid'},'','/'); } catch(e){}
  syncUrl(true);
  renderFonts();
  // renderFonts-dan sonra scroll bərpa et
  requestAnimationFrame(()=>{
    window.scrollTo(0, savedScroll);
  });
}

function showGrid(){
  // H?r seyi sifirla
  resetTxtUpload();
  document.getElementById('profilePage').style.display='none';
  document.getElementById('authorPage').style.display='none';
  activeCategory='all';
  searchTerm='';
  activeLicenseFilter=null;
  alphaFilter='';
  freeOnly=false;
  currentPage=1;
  document.getElementById('searchInput').value='';
  document.getElementById('sortSel').value='popular';refreshCustomSelect('sortSel');
  document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active',b.dataset.cat==='all'));
  document.querySelectorAll('.sb-item[data-scat]').forEach(b=>b.classList.toggle('active',b.dataset.scat==='all'));
  document.querySelectorAll('.alpha-btn').forEach(b=>b.classList.toggle('active',b.textContent.trim()==='All'));
  const freeBtn=document.getElementById('freeOnlyBtn');if(freeBtn)freeBtn.classList.remove('active');
  const freeToggleBtn=document.getElementById('freeToggle');if(freeToggleBtn)freeToggleBtn.classList.remove('free-active');
  fontSize=100;
  const sr=document.getElementById('sizeRange');if(sr)sr.value=100;
  const sn=document.getElementById('sizeNum');if(sn)sn.textContent=100;
  syncRangeSlider(document.getElementById('sizeRange'));

  document.getElementById('gridLayout').style.display='';
  document.getElementById('fontDetailPage').classList.remove('visible');

  // URL routing — ana səhifəyə qayıt
  _safeHistoryPush({page:'home'}, '', '/');
  document.title = 'Font·Monster - Free Font Discovery';
  document.getElementById('toolbarBar').style.display='';
  document.getElementById('heroSection').style.display='';
  currentDetailFont=null;window.scrollTo(0,0);
  renderFonts();
}

function openAuthorPage(authorName){
  // Grid scroll mövqeyini yadda saxla
  if(typeof window._saveGridScroll === 'function') window._saveGridScroll();
  // Açıq modalları bağla
  const _adm=document.getElementById('adminPanelOverlay');
  if(_adm&&_adm.style.display!=='none') closeAdminPanel(true);
  const _mod=document.getElementById('modPanelOverlay');
  if(_mod&&_mod.style.display!=='none') closeModPanel(true);
  // Hide other views
  document.getElementById('gridLayout').style.display='none';
  document.getElementById('fontDetailPage').classList.remove('visible');
  document.getElementById('toolbarBar').style.display='none';
  document.getElementById('heroSection').style.display='none';
  document.getElementById('profilePage').style.display='none';
  currentDetailFont=null;

  _safeHistoryPush({page:'author', author: authorName}, '', '/author/' + encodeURIComponent(authorName));
  document.title = authorName + ' — Font·Monster';
  updatePageMeta({ title: authorName + ' — Font·Monster', description: 'Browse fonts by ' + authorName + ' on Font·Monster.', url: '/author/' + encodeURIComponent(authorName) });

  // Match by exact author name OR by the submitter's user id (for user-uploaded fonts)
  const authorUser = window.currentUser && (window.currentUser.name === authorName) ? window.currentUser : null;
  const authorFonts = FONTS.filter(f => {
    if(f.pending && !(window.currentUser && f.submittedById === window.currentUser.id)) return false;
    if(f.author === authorName) return true;
    if(authorUser && f.submittedById === authorUser.id) return true;
    return false;
  });

  renderAuthorPage(authorName, authorFonts);

  document.getElementById('authorPage').style.display='block';
  window.scrollTo(0,0);
}

// Renders the author page header (avatar, stats) and the font grid for the given author
function renderAuthorPage(authorName, authorFonts){
  const cats = [...new Set(authorFonts.map(f=>f.cat))];
  const totalDl = authorFonts.reduce((s,f)=>s+(DL_COUNTS[f.id]||0),0);
  const initials = authorName.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

  document.getElementById('authorPageBreadcrumb').textContent = authorName;
  document.getElementById('authorPageAvatar').textContent = initials;
  document.getElementById('authorPageName').textContent = authorName;
  document.getElementById('authorPageMeta').textContent =
    cats.map(c=>c.charAt(0).toUpperCase()+c.slice(1)).join(' · ') +
    (authorFonts[0]?.year ? ' · Since ' + Math.min(...authorFonts.map(f=>f.year||9999)) : '');
  document.getElementById('authorStatFonts').textContent = authorFonts.length;
  document.getElementById('authorStatCat').textContent = cats.length;
  document.getElementById('authorStatDl').textContent = fmtDlCount(totalDl);
  document.getElementById('authorFontsLabel').textContent =
    `${authorFonts.length} font${authorFonts.length!==1?'s':''} by ${authorName}`;

  const grid = document.getElementById('authorFontsGrid');
  if(authorFonts.length === 0){
    grid.innerHTML = `<div style="color:var(--text3);font-size:13px;padding:20px 0">No fonts found for this designer.</div>`;
  } else {
    grid.innerHTML = authorFonts
      .slice().sort((a,b)=>(b.popular||0)-(a.popular||0))
      .map(_renderAuthorFontCard).join('');
  }
}

// Single font card used in the author page grid
function _renderAuthorFontCard(font){
  loadFont(font);
  const lic = LICENSE_META[font.license]||{label:font.license,cls:'lic-demo'};
  const isLiked = likedFonts.has(font.id);
  const isOwner = window.currentUser && (font.submittedById === window.currentUser.id || _isAdmin(window.currentUser));
  return `<div class="font-card" style="margin-bottom:0;cursor:pointer" onclick="openDetail('${font.id}')">
    <div class="card-header">
      <div class="card-header-shimmer"></div>
      <div class="ch-fall"></div>
      <div style="position:relative;z-index:2;flex:1;min-width:0">
        <div class="card-name">${esc(font.name)}</div>
        <div class="card-author"><span onclick="event.stopPropagation();openAuthorPage('${esc(font.author)}')" style="cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${esc(font.author)}</span> · ${font.year}</div>
      </div>
      <div class="card-actions" style="position:relative;z-index:2">
        ${isOwner?`<button class="icon-btn" onclick="event.stopPropagation();openEditFont('${font.id}')" title="Edit font" style="color:var(--accent);background:var(--blue-dim);border:1px solid var(--border2);border-radius:8px;width:30px;height:30px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`:''}
        <button class="icon-btn ${isLiked?'liked':''}" onclick="event.stopPropagation();toggleLike('${font.id}',this)" aria-label="${isLiked?'Saved – click to unsave':'Save font'}" aria-pressed="${isLiked?'true':'false'}">
          ${isLiked?'♥':'♡'}
        </button>
        <a class="dl-btn" href="#"
          onclick="event.stopPropagation();event.preventDefault();handleDownloadClick('${font.id}','${esc(font.name)}');return false;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Get
        </a>
      </div>
    </div>
    <div class="card-preview-area">
      <div class="card-preview" style="font-family:'${font.name}',sans-serif;font-size:36px">${esc(font.name)}</div>
    </div>
    <div class="card-footer">
      <div class="tags">${font.tags.slice(0,3).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
      <span class="lic-badge ${lic.cls}">${lic.label}</span>
    </div>
  </div>`;
}
function openDetail(fontId){
  const font=FONTS.find(f=>f.id===fontId);if(!font)return;
  const {licM, dlCount} = _detailInit(font, fontId);
  _detailRenderHero(font);
  _detailRenderHeader(font, dlCount, licM);
  _detailResetPreviewControls(font);
  const weights = _detailRenderWeights(font);
  _detailBuildCharmap(font);
  _detailRenderInfoBox(font, weights, licM);
  _detailShowPage(font, fontId, dlCount);
  _detailRenderExtras(font, fontId);
}

// 1/8 — state setup: globals, preview defaults, breadcrumb, derived license/download values
function _detailInit(font, fontId){
  currentDetailFont=font;activeDetailWeight=font.weight||'400';activeDetailVariantIdx=0;
  activeVariantFamily=(font.fontVariants&&font.fontVariants.length>0)?(font.fontVariants[0]._familyName||null):null;
  pvMode='text';pvBold=false;pvItalic=false;pvAlign='left';pvBgColor='#ffffff';pvTextColor='#111111';
  const _bh=document.getElementById('pvBgHue');if(_bh)_bh.value='#ffffff';
  const _fh=document.getElementById('pvFgHue');if(_fh)_fh.value='#111111';
  loadFont(font);addToRecent(fontId);
  document.getElementById('fdpBreadcrumb').textContent=font.name;
  const licM=LICENSE_META[font.license]||{label:font.license,cls:'lic-demo'};
  const dlCount=DL_COUNTS[font.id]||0;
  return {licM, dlCount};
}

// 2/8 — hero banner (image or auto-generated color banner)
function _detailRenderHero(font){
  // Banner - s?kil varsa göst?r, yoxsa auto banner
  const heroBgPalettes = [
    {bg:'#0a0a0a',text:'#ffffff'},
    {bg:'#111827',text:'#f9fafb'},
    {bg:'#0f172a',text:'#e2e8f0'},
    {bg:'#1a0a00',text:'#fde68a'},
    {bg:'#0a0a1a',text:'#c4b5fd'},
    {bg:'#042f2e',text:'#99f6e4'},
    {bg:'#1e1b18',text:'#fef3c7'},
    {bg:'#0c0a09',text:'#fafaf9'},
    {bg:'#18181b',text:'#f4f4f5'},
  ];
  const pal = heroBgPalettes[Math.floor(Math.random()*heroBgPalettes.length)];
  const heroBannerHasImg = !!font.previewImg;

  document.getElementById('fdpHeroInner').innerHTML = heroBannerHasImg
    ? `<div style="position:relative;width:100%;min-height:420px;border-radius:14px;overflow:hidden;height:auto;margin-bottom:20px;">
        <img src="${font.previewImg}" id="heroBannerImg" style="width:100%;height:100%;object-fit:cover;display:block;">
        <div id="heroBannerTint" style="position:absolute;inset:0;background:rgba(0,0,0,0.4);transition:background .2s;"></div>
        <div style="position:absolute;bottom:12px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:7px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);padding:6px 11px;border-radius:980px;border:1px solid rgba(255,255,255,0.15);">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <input type="range" class="hb-bright" min="0" max="90" value="40" step="5" oninput="const t=document.getElementById('heroBannerTint');if(t)t.style.background='rgba(0,0,0,'+this.value/100+')'">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="rgba(255,255,255,0.7)" stroke="none"/></svg>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <button onclick="resetHeroBanner()" style="cursor:pointer;display:flex;align-items:center;gap:5px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);color:rgba(255,255,255,0.8);font-size:11px;font-weight:600;padding:6px 11px;border-radius:980px;border:1px solid rgba(255,255,255,0.15);transition:background .15s;flex-shrink:0;font-family:inherit;" onmouseover="this.style.background='rgba(180,0,0,0.65)';this.style.color='#fff'" onmouseout="this.style.background='rgba(0,0,0,0.5)';this.style.color='rgba(255,255,255,0.8)'">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5.1L1 10"/></svg>
              Reset
            </button>
            <label style="cursor:pointer;display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);color:#fff;font-size:11px;font-weight:600;padding:6px 11px;border-radius:980px;border:1px solid rgba(255,255,255,0.15);transition:background .15s;flex-shrink:0;" onmouseover="this.style.background='rgba(0,0,0,0.75)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Change image
              <input type="file" accept="image/*" style="display:none" onchange="heroBannerUpload(this)">
            </label>
          </div>
        </div>
      </div>`
    : `<div id="heroBannerAuto" style="
          width:100%;max-width:100%;min-width:0;min-height:420px;border-radius:14px;overflow:hidden;height:auto;
          background:${pal.bg};
          display:flex;align-items:center;justify-content:center;
          margin-bottom:20px;
          box-shadow:0 4px 24px rgba(0,0,0,0.18);
          position:relative;box-sizing:border-box;flex-shrink:1;
        ">
        <div id="heroBannerText" style="
          font-family:'${esc(font.name)}',sans-serif;
          font-weight:${font.weight};
          font-size:72px;
          color:${pal.text};
          line-height:1.1;letter-spacing:-0.03em;
          user-select:none;text-align:center;
          word-break:break-word;white-space:normal;
          width:90%;max-width:90%;min-width:0;overflow:visible;
          display:block;/*-webkit-line-clamp:2*/;-webkit-box-orient:vertical;
          transition:font-size .1s;
        ">${esc(previewText||font.name)}</div>
        <div style="position:absolute;bottom:12px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <!-- Zoom slider -->
            <div style="display:flex;align-items:center;gap:4px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);padding:4px 6px;border-radius:980px;border:1px solid rgba(255,255,255,0.18);">
            <button onclick="(function(){var b=document.getElementById('heroBannerText');if(b){var s=parseFloat(b.style.fontSize)||100;b.style.fontSize=Math.max(16,s-16)+'px';}})()" style="width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent;">A-</button>
            <button onclick="(function(){var b=document.getElementById('heroBannerText');if(b){var s=parseFloat(b.style.fontSize)||100;b.style.fontSize=Math.min(400,s+16)+'px';}})()" style="width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent;">A+</button>
          </div>
            <!-- Color hue slider -->
            <div id="heroBannerColorWrap" style="display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);padding:5px 11px;border-radius:980px;border:1px solid rgba(255,255,255,0.18);">
              <div id="heroBannerColorDot" style="width:10px;height:10px;border-radius:50%;background:${pal.bg};border:1.5px solid rgba(255,255,255,0.5);flex-shrink:0;"></div>
              <input type="range" class="hb-hue" min="0" max="360" value="0" step="1"
                oninput="heroBannerHueChange(this.value)">
            </div>
          </div>
          <label style="cursor:pointer;display:flex;align-items:center;gap:6px;
            background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);color:rgba(255,255,255,0.85);
            font-size:11px;font-weight:600;padding:6px 12px;border-radius:980px;
            border:1px solid rgba(255,255,255,0.2);transition:background .15s;flex-shrink:0;"
            onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Add image
            <input type="file" accept="image/*" style="display:none" onchange="heroBannerUpload(this)">
          </label>
        </div>
      </div>`;

}

// 3/8 — title/author/tags/actions header bar
function _detailRenderHeader(font, dlCount, licM){
  // Ad, mü?llif, actions - fdpHero-da (üst bar)
  document.getElementById('fdpHero').removeAttribute('style');
  document.getElementById('fdpHero').innerHTML=`
    <div>
      <div class="fdp-name">${esc(font.name)}</div>
      <div class="fdp-author">by <span onclick="openAuthorPage('${esc(font.author)}')" style="cursor:pointer;color:var(--accent);transition:opacity .15s" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${esc(font.author)}</span> · ${font.year}</div>
      <div class="fdp-meta-row">
        <span class="fdp-chip">${cap(font.cat)}</span>
        <span class="lic-badge ${licM.cls}" style="border-radius:100px;padding:3px 11px">${licM.label}</span>
        ${font.tags.map(t=>`<span class="fdp-chip" style="cursor:pointer;transition:background .15s,color .15s" onclick="showGrid();(function(tag){activeTag=tag;searchTerm='';document.getElementById('searchInput').value='';activeCategory='all';activeLicenseFilter=null;alphaFilter='';currentPage=1;document.querySelectorAll('#tagList .sb-item').forEach(function(b){b.classList.toggle('active',b.dataset.tag===tag);});document.querySelectorAll('.cat').forEach(function(b){b.classList.toggle('active',b.dataset.cat==='all');});document.querySelectorAll('.alpha-btn').forEach(function(b){b.classList.toggle('active',b.textContent.trim()==='All');});renderFonts();syncUrl(true);showToast('&#34;'+tag+'&#34; fonts');}('${esc(t)}'))" onmouseover="this.style.background='var(--blue-dim)';this.style.color='var(--accent)'" onmouseout="this.style.background='';this.style.color=''" title="Filter by ${esc(t)}">${esc(t)}</span>`).join('')}
        <span class="fdp-chip" style="display:inline-flex;align-items:center;gap:4px">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          ${fmtDlCountFor(font.id)} downloads
        </span>
      </div>
    </div>
    <div class="fdp-actions">
      ${(()=>{
        const isCommunity = !!(font.fontData || font.fontUrl || (font.fontVariants && font.fontVariants.length > 0));
        if(isCommunity){
          return `<button class="fdp-dl" onclick="handleDownloadClick('${font.id}','${esc(font.name)}');updateDetailDlCount('${font.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download${(font.fontVariants&&font.fontVariants.length>1)?' ZIP':''}
          </button>`;
        } else {
          return `<a href="#" class="fdp-dl"
            onclick="event.preventDefault();handleDownloadClick('${font.id}','${esc(font.name)}');updateDetailDlCount('${font.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download ZIP
          </a>
          <a href="https://fonts.google.com/specimen/${encodeURIComponent(font.name)}" target="_blank" class="fdp-gf">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Google Fonts
          </a>`;
        }
      })()}
      <button class="fdp-like ${likedFonts.has(font.id)?'liked':''}" id="fdpLikeBtn" data-id="${font.id}"
        aria-label="${likedFonts.has(font.id)?'Saved – click to unsave':'Save font'}"
        aria-pressed="${likedFonts.has(font.id)?'true':'false'}"
        onclick="toggleLike('${font.id}',this);this.innerHTML=likedFonts.has('${font.id}')?'♥ Saved':'♡ Save';this.className='fdp-like'+(likedFonts.has('${font.id}')?' liked':'');this.setAttribute('aria-label',likedFonts.has('${font.id}')?'Saved – click to unsave':'Save font');this.setAttribute('aria-pressed',likedFonts.has('${font.id}')?'true':'false')">
        ${likedFonts.has(font.id)?'♥ Saved':'♡ Save'}
      </button>
      ${_isAdmin(window.currentUser)?`<button class="fdp-like" onclick="adminEditFontDirect('${font.id}')" title="Edit font (admin)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit
      </button>`:''}
    </div>`;

}

// 4/8 — reset the preview controls (text/size/style/overlay) to defaults
function _detailResetPreviewControls(font){
  // Reset controls
  document.getElementById('fdpPvInput').value=previewText||font.name;
  document.getElementById('fdpSizeRange').value=56;document.getElementById('fdpSizeVal').textContent=56;
  document.getElementById('pvBoldBtn').classList.remove('on');document.getElementById('pvItalicBtn').classList.remove('on');
  document.getElementById('pvAlL').classList.add('on');document.getElementById('pvAlC').classList.remove('on');document.getElementById('pvAlR').classList.remove('on');
  document.getElementById('pvLS').value=0;document.getElementById('pvLSVal').textContent='0px';
  document.getElementById('pvLH').value=1.15;document.getElementById('pvLHVal').textContent='1.15';
  const _ds=document.getElementById('pvDarknessSlider');if(_ds)_ds.value=0;
  _pvBaseBgColor='#ffffff';
  document.querySelectorAll('.pv-swatch').forEach((s,i)=>s.classList.toggle('on',i===0));
  document.querySelectorAll('.pv-mode-tab').forEach((b,i)=>b.classList.toggle('active',i===0));
  document.getElementById('pvTopRow').style.display='flex';
  // Reset overlay panel
  document.getElementById('pvCanvas').style.display='';
  document.getElementById('pvImgOverlayPanel').style.display='none';
  document.getElementById('pvImgDropZone').style.display='flex';
  document.getElementById('pvImgOverlayCanvas').style.display='none';
  document.getElementById('pvImgOverlayImg').src='';
  document.getElementById('pvImgOverlayTextInput').value='';
  document.querySelector('.pv-style-bar').style.display='';
  pvOverlayTextColor='#ffffff'; pvOverlayAlign='left'; pvOverlayPos='center';

}

// 5/8 — weight / variant list, returns the resolved weights array
function _detailRenderWeights(font){
  // Weights
  const weights=getWeights(font);const pvTxt=previewText||font.name;
  // Uploaded fontlar üçün fontVariants-i weight list kimi göst?r
  if(font.fontVariants && font.fontVariants.length > 0){
    // Sort: Regular first, then alphabetically by label
    font.fontVariants.sort((a,b)=>{
      const aReg=/rg$|regular|reg$/i.test((a.name||'').replace(/\.[^.]+$/,''));
      const bReg=/rg$|regular|reg$/i.test((b.name||'').replace(/\.[^.]+$/,''));
      if(aReg&&!bReg) return -1;
      if(!aReg&&bReg) return 1;
      return (a.name||'').localeCompare(b.name||'');
    });
    document.getElementById('fdpWeightList').innerHTML=font.fontVariants.map((v,i)=>{
      const rawName=(v.name||('Variant '+(i+1))).replace(/\.[^.]+$/,'');
      const vi=parseVariantStyle(v.name||rawName);
      const vFamily=v._familyName||(font.name+' '+vi.label);
      const sampleStyle=`font-family:'${vFamily}',sans-serif;font-weight:400;font-style:${vi.style};`;
      return `<div class="weight-row ${i===0?'wt-active':''}" onclick="selectWeightVariant(${i},this)" data-variant-idx="${i}">
        <span class="wt-num">${vi.weight}</span>
        <span class="wt-name" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(rawName)}">${esc(vi.label)}</span>
        <span class="wt-sample" style="${sampleStyle}">${esc(pvTxt)}</span>
      </div>`;
    }).join('');
  } else {
    document.getElementById('fdpWeightList').innerHTML=weights.map(w=>`
      <div class="weight-row ${w===activeDetailWeight?'wt-active':''}" onclick="selectWeight('${font.id}','${w}',this)">
        <span class="wt-num">${w}</span>
        <span class="wt-name">${WEIGHT_NAMES[w]||''}</span>
        <span class="wt-sample" style="font-family:'${font.name}',sans-serif;font-weight:${w};">${esc(pvTxt)}</span>
      </div>`).join('');
  }

  return weights;
}

// 6/8 — charmap tab rebuild + render
function _detailBuildCharmap(font){
  // Charmap - rebuild tabs based on this font's language support
  activeCharTab='upper';
  activeVariantFamily=null;
  (function buildCharmapTabs(){
    const tabsEl=document.querySelector('.fdp-charmap-box .charmap-tabs');
    if(!tabsEl)return;
    const ff=`'${font.name}',sans-serif`;
    const fw=font.weight||'400';
    // Base tabs always present - label rendered in the font itself
    tabsEl.innerHTML=`
      <button class="charmap-tab active" data-tabkey="upper" style="font-family:${ff};font-weight:${fw}" onclick="switchCharTab('upper',this)">Aa</button>
      <button class="charmap-tab" data-tabkey="lower" style="font-family:${ff};font-weight:${fw}" onclick="switchCharTab('lower',this)">aa</button>
      <button class="charmap-tab" data-tabkey="digits" onclick="switchCharTab('digits',this)">0-9</button>
      <button class="charmap-tab" data-tabkey="punct" onclick="switchCharTab('punct',this)">!@#</button>`;
    // Extra script tabs from language support - added after lang detection
    const seen=new Set();
    // Add tabs based on cached/resolved langs (updated after fonts.ready)
    const _addLangTabs = (langs) => {
      // Remove previously added lang tabs (keep first 4 fixed tabs)
      const fixedTabs = tabsEl.querySelectorAll('.charmap-tab');
      fixedTabs.forEach((btn, i) => { if(i >= 4) btn.remove(); });
      langs.forEach(lang => {
        const info = LANG_TO_CHARMAP[lang];
        if(!info || seen.has(info.key)) return;
        seen.add(info.key);
        const btn = document.createElement('button');
        btn.className = 'charmap-tab';
        btn.setAttribute('data-tabkey', info.key);
        btn.style.fontFamily = ff;
        btn.style.fontWeight = fw;
        btn.textContent = info.label;
        btn.onclick = function(){ switchCharTab(info.key, this); };
        tabsEl.appendChild(btn);
      });
    };
    resolveFontLangs(font, _addLangTabs);
  })();
  renderCharmap(font);

  // Code (CSS snippet panel removed - skip)
}

// 7/8 — sidebar info box (category/designer/year/license/weights/downloads/languages)
function _detailRenderInfoBox(font, weights, licM){
  // Language support - unified cache (same as card & glyph preview)
  // Placeholder rendered immediately, then updated once detection completes
  const uniqueLangs = _LANG_CACHE[font.id] || getFontLangs(font);

  // Clickable info row helper
  const clickRow = (key, val, action) =>
    `<div class="fdp-info-row" style="cursor:pointer;transition:background .12s" onclick="${action}" onmouseover="this.style.background='var(--surface3)'" onmouseout="this.style.background=''">
      <span class="fdp-info-key" style="display:flex;align-items:center;gap:5px">${key}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="opacity:.35"><polyline points="9 18 15 12 9 6"/></svg>
      </span>
      <span class="fdp-info-val">${val}</span>
    </div>`;

  document.getElementById('fdpInfoBox').innerHTML=`
    ${clickRow('Category', cap(font.cat), `closeDetail();setCategory('${font.cat}');window.scrollTo({top:0,behavior:'smooth'})`)}
    ${clickRow('Designer', esc(font.author), `openAuthorPage('${esc(font.author)}')`)}
    ${clickRow('Year', font.year, `closeDetail();document.getElementById('searchInput').value='${font.year}';searchTerm='${font.year}';currentPage=1;document.getElementById('sortSel').value='newest';refreshCustomSelect('sortSel');renderFonts();syncUrl(true);window.scrollTo({top:0,behavior:'smooth'})`)}
    ${clickRow('License', licM.label, `closeDetail();filterLicense('${font.license}');window.scrollTo({top:0,behavior:'smooth'})`)}
    <div class="fdp-info-row"><span class="fdp-info-key">Weights</span><span class="fdp-info-val">${weights.length} variant${weights.length!==1?'s':''}</span></div>
    <div class="fdp-info-row"><span class="fdp-info-key">Downloads</span><span class="fdp-info-val" id="fdpDlCountVal">${fmtDlCountFor(font.id)}</span></div>
    <div class="fdp-info-row" style="flex-direction:column;align-items:flex-start;gap:6px;padding:10px 14px">
      <span class="fdp-info-key" style="margin-bottom:2px">Languages</span>
      <div id="fdpLangBadges" style="display:flex;flex-wrap:wrap;gap:4px">
        ${uniqueLangs.map(l=>`<span style="font-size:11px;font-weight:500;padding:2px 8px;border-radius:980px;background:var(--surface3);border:1px solid var(--border2);color:var(--text2)">${l}</span>`).join('')}
      </div>
    </div>
    ${font.sourceUrl?`<div class="fdp-info-row"><span class="fdp-info-key">Source</span><a href="${esc(font.sourceUrl)}" target="_blank" style="color:var(--blue);font-size:11px;word-break:break-all;max-width:200px;display:inline-block;line-height:1.4">${esc(font.sourceUrl)}</a></div>`:''}
    ${font.description?`<div class="fdp-info-row" style="flex-direction:column;align-items:flex-start;gap:4px;padding:10px 14px"><span class="fdp-info-key">Description</span><span style="font-size:12px;color:var(--text2);line-height:1.55">${esc(font.description)}</span></div>`:''}`;

  // Update lang badges + charmap tabs from unified cache
  resolveFontLangs(font, langs => {
    const lb = document.getElementById('fdpLangBadges');
    if(lb) lb.innerHTML = langs.map((l,i) => {
      const c = _LANG_COLORS[i%_LANG_COLORS.length];
      return `<span style="font-size:11px;font-weight:500;padding:2px 8px;border-radius:980px;background:${c.bg};border:1px solid ${c.border};color:${c.text}">${l}</span>`;
    }).join('');
  });

}

// 8/8a — page switching, URL routing, SEO meta, quick-download panel
function _detailShowPage(font, fontId, dlCount){
  // Grid scroll mövqeyini yadda saxla
  if(typeof window._saveGridScroll === 'function') window._saveGridScroll();
  document.getElementById('gridLayout').style.display='none';
  document.getElementById('toolbarBar').style.display='none';
  document.getElementById('heroSection').style.display='none';
  document.getElementById('profilePage').style.display='none';
  document.getElementById('authorPage').style.display='none';
  document.getElementById('fontDetailPage').classList.add('visible');

  // URL routing + title
  const slug = font.id;
  _safeHistoryPush({page:'font', fontId: slug}, '', '/font/' + slug);
  document.title = font.name + ' — Font·Monster';
  updatePageMeta({
    title: font.name + ' — Font·Monster',
    description: (font.description || ('Download ' + font.name + ' free font by ' + font.author + '. Category: ' + font.cat + '.')),
    url: '/font/' + slug,
    image: font.imgSrc || undefined
  });

  // Quick Download Panel
  const dlPanel=document.getElementById('fdpDlPanel');
  document.getElementById('fdpDlPanelName').textContent=font.name;
  const sampleEl=document.getElementById('fdpDlPanelSample');
  sampleEl.textContent=previewText||font.name;
  sampleEl.style.fontFamily=`'${font.name}',sans-serif`;
  document.getElementById('fdpDlPanelDl').textContent=fmtDlCount(dlCount);
  const _ystEl=document.getElementById('fdpDlPanelYst');
  if(_ystEl){
    const _ystVal=DL_YESTERDAY[font.id]||0;
    const _ystRow=_ystEl.closest('.fdp-stat')||_ystEl.parentElement;
    if(!DL_IS_ESTIMATED[font.id]&&_ystVal>0){
      _ystEl.textContent='+'+fmtDlCount(_ystVal);
      if(_ystRow) _ystRow.style.display='';
    } else {
      if(_ystRow) _ystRow.style.display='none';
    }
  }
  // Uploaded font üçün variant sayi, Google Font üçün weight sayi
  const _isUploadedFont=!!(font.fontData||font.fontUrl||(font.fontVariants&&font.fontVariants.length));
  document.getElementById('fdpDlPanelWt').textContent=
    (font.fontVariants&&font.fontVariants.length>0)?font.fontVariants.length:getWeights(font).length;
  const _gfBtn=document.getElementById('fdpGfBtn');
  if(_gfBtn){_gfBtn.style.display=_isUploadedFont?'none':'';_gfBtn.href=`https://fonts.google.com/specimen/${encodeURIComponent(font.name)}`;}
  document.getElementById('fdpDlMainBtn').href='#';
  if(font.fontData||font.fontUrl){
    document.getElementById('fdpDlMainBtn').removeAttribute('target');
    const _dlLabel=(font.fontVariants&&font.fontVariants.length>1)?('Download All ('+font.fontVariants.length+')' ):'Download Font';
    document.getElementById('fdpDlMainBtn').innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> '+_dlLabel;
    document.getElementById('fdpDlMainBtn').onclick=e=>{e.preventDefault();handleDownloadClick(font.id,font.name);updateDetailDlCount(font.id);};
  } else {
    document.getElementById('fdpDlMainBtn').removeAttribute('target');
    document.getElementById('fdpDlMainBtn').innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Font';
    document.getElementById('fdpDlMainBtn').onclick=e=>{e.preventDefault();handleDownloadClick(font.id,font.name);updateDetailDlCount(font.id);};
  }
  // fdpGfBtn href yuxarida _isUploadedFont yoxlamasi il? set edildi
  window.scrollTo(0,0);
  setTimeout(()=>{
    renderPvCanvas();
    document.querySelectorAll('#fdpLeft input[type=range], .fdp-sidebar input[type=range]').forEach(r=>{syncRangeSlider(r);r.addEventListener('input',()=>syncRangeSlider(r),{once:false});});
  },130);

}

// 8/8b — similar fonts, popularity chart, font-of-the-day, trending tags, stats, comments
function _detailRenderExtras(font, fontId){
  // Similar Fonts - 9 font, tam kart stilind?
  const similarContainer = document.getElementById('fdpSimilarFonts');
  const otherFonts = FONTS.filter(f => f.id !== font.id && f.cat === font.cat);
  const fallback = FONTS.filter(f => f.id !== font.id && f.cat !== font.cat)
    .sort(()=>Math.random()-0.5);
  const pool = [...otherFonts.sort(()=>Math.random()-0.5), ...fallback];
  const shuffled = pool.slice(0,9);
  if(shuffled.length){
    similarContainer.innerHTML = shuffled.map((sf, idx)=>{
      const sfLic = LICENSE_META[sf.license]||{label:sf.license,cls:'lic-demo'};
      loadFont(sf);
      const pvText = sf.name;
      const isLiked = likedFonts.has(sf.id);
      const card = `<div class="font-card" style="margin-bottom:0">
        <div class="card-header" style="cursor:pointer" onclick="openDetail('${sf.id}')">
          <div class="ch-fall ch-fall-slow"></div>
          <div style="position:relative;z-index:2">
            <div class="card-name" style="font-family:'${sf.name}',sans-serif;font-weight:${sf.weight||'400'};font-size:${window.innerWidth<=768?'12px':'18px'}">${esc(sf.name)}</div>
            <div class="card-author"><span onclick="event.stopPropagation();openAuthorPage('${esc(sf.author)}')" style="cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${esc(sf.author)}</span></div>
          </div>
          <div class="card-actions" style="position:relative;z-index:2">
            <button class="icon-btn ${isLiked?'liked':''}" onclick="event.stopPropagation();toggleLike('${sf.id}',this)" aria-label="${isLiked?'Saved – click to unsave':'Save font'}" aria-pressed="${isLiked?'true':'false'}">
              ${isLiked?'♥':'♡'}
            </button>
            <a class="dl-btn" href="#"
              onclick="event.stopPropagation();event.preventDefault();handleDownloadClick('${sf.id}','${esc(sf.name)}');return false;" title="Download">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Get
            </a>
          </div>
        </div>
        <div class="card-preview-area" onclick="openDetail('${sf.id}')">
          <div class="card-preview" style="font-family:'${sf.name}',sans-serif;font-size:${window.innerWidth<=768?'26px':'44px'}">${esc(pvText)}</div>
        </div>
        <div class="card-footer" onclick="openDetail('${sf.id}')">
          <div class="tags">${sf.tags.slice(0,2).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
          <span class="lic-badge ${sfLic.cls}">${sfLic.label}</span>
        </div>
      </div>`;
      // After 3rd card (idx=2) insert tester for the 4th font, if it exists
      return card;
    }).join('');
    setTimeout(injectAllFallingLetters, 60);

    // ?? Popularity Chart ??
    const chartWrap = document.getElementById('fdpPopChart');
    const barsEl    = document.getElementById('fdpPopBars');
    const avgEl     = document.getElementById('fdpPopAvg');
    if(chartWrap && barsEl && shuffled.length){
      // Include current font + similar ones (max 9 bars total)
      const chartFonts = [font, ...shuffled].slice(0,9);
      const maxPop = Math.max(...chartFonts.map(f=>f.popular||0));
      const avgPop = Math.round(chartFonts.reduce((a,f)=>a+(f.popular||0),0)/chartFonts.length);
      barsEl.innerHTML = chartFonts.map(f=>{
        const pop   = f.popular || 0;
        const pct   = maxPop > 0 ? Math.round((pop/maxPop)*100) : 0;
        const barH  = Math.max(6, Math.round((pop/maxPop)*64));
        const isAct = f.id === font.id;
        return `<div class="pop-bar-col" onclick="openDetail('${f.id}')">
          <span class="pop-bar-val${isAct?' is-active':''}">${pop}</span>
          <div class="pop-bar-inner${isAct?' is-active':''}" style="height:${barH}px"></div>
          <span class="pop-bar-name${isAct?' is-active':''}" title="${esc(f.name)}">${esc(f.name.split(' ')[0])}</span>
        </div>`;
      }).join('');
      avgEl.textContent = 'avg ' + avgPop;
      // Mobil? popularity chart-i gizl?t
      chartWrap.style.display = window.innerWidth <= 768 ? 'none' : 'block';
    }
    // ?? Mobil: similar fonts-u horizontal scroll siraya çevir ??
    if(window.innerWidth <= 768){
      similarContainer.style.cssText = 'display:flex;flex-direction:row;overflow-x:auto;-webkit-overflow-scrolling:touch;gap:10px;margin-left:-28px;margin-right:-28px;padding-left:14px;padding-right:14px;padding-bottom:6px;scrollbar-width:none;';
    }
  } else {
    similarContainer.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:8px 0">No fonts found.</div>';
  }

  // Font of the Day - ?sl gün ?sasinda (YYYY-MM-DD seed)
  const today=new Date();
  const daySeed=today.getFullYear()*10000+today.getMonth()*100+today.getDate();
  const fotdList=FONTS.slice().sort((a,b)=>(b.popular||0)-(a.popular||0)).slice(0,30);
  const fotd=fotdList[daySeed % fotdList.length];
  if(fotd){
    loadFont(fotd);
    document.getElementById('fotdName').style.fontFamily=`'${fotd.name}',sans-serif`;
    document.getElementById('fotdName').textContent=fotd.name;
    document.getElementById('fotdAuthor').textContent=fotd.author;
    const fotdS=document.getElementById('fotdSample');
    fotdS.style.fontFamily=`'${fotd.name}',sans-serif`;
    fotdS.textContent=fotd.name;
    document.getElementById('fotdTags').innerHTML=fotd.tags.slice(0,3).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
    document.getElementById('fotdBtn').onclick=()=>openDetail(fotd.id);
  }

  // Trending Tags widget — tagları download + like sayına görə sırala (random deyil)
  const tagScore={};
  FONTS.forEach(f=>{
    const score=(DL_COUNTS[f.id]||f.downloads||0)+(f.popular||0);
    (f.tags||[]).forEach(t=>{tagScore[t]=(tagScore[t]||0)+score;});
  });
  const allTagsW=[...new Set(FONTS.flatMap(f=>f.tags))]
    .sort((a,b)=>(tagScore[b]||0)-(tagScore[a]||0))
    .slice(0,16);
  const ttwEl=document.getElementById('trendingTagsWidget');
  ttwEl.innerHTML=allTagsW.map(t=>`
    <span data-tag="${esc(t)}" onclick="(function(el){const t=el.dataset.tag;showGrid();document.getElementById('searchInput').value=t;searchTerm=t.toLowerCase();renderFonts();showToast('&quot;'+t+'&quot; fonts');})(this)"
      style="padding:4px 11px;border-radius:980px;font-size:11px;font-weight:500;cursor:pointer;
      background:var(--surface3);border:1px solid var(--border2);color:var(--text2);
      transition:all .15s;letter-spacing:-0.01em;"
      onmouseover="this.style.background='var(--blue-dim)';this.style.color='var(--accent)';this.style.borderColor='rgba(220,38,38,0.25)'"
      onmouseout="this.style.background='var(--surface3)';this.style.color='var(--text2)';this.style.borderColor='var(--border2)'"
    >${esc(t)}</span>`).join('');
  ttwEl.querySelectorAll('span[data-tag]').forEach(el=>{
    el.onclick=function(){
      const t=this.dataset.tag;
      showGrid();
      activeTag=t;
      searchTerm='';
      document.getElementById('searchInput').value='';
      activeCategory='all';activeLicenseFilter=null;alphaFilter='';currentPage=1;
      document.querySelectorAll('#tagList .sb-item').forEach(function(b){b.classList.toggle('active',b.dataset.tag===t);});
      document.querySelectorAll('.cat').forEach(function(b){b.classList.toggle('active',b.dataset.cat==='all');});
      document.querySelectorAll('.alpha-btn').forEach(function(b){b.classList.toggle('active',b.textContent.trim()==='All');});
      renderFonts();
      syncUrl(true);
      showToast('"'+t+'" fonts');
    };
  });

  // Stats widget
  document.getElementById('statTotalFonts').textContent=FONTS.length+'+';
  document.getElementById('statFreeFonts').textContent=FONTS.filter(f=>['free','ofl','apache'].includes(f.license)).length+'+';
  document.getElementById('statDesigners').textContent=[...new Set(FONTS.map(f=>f.author))].length+'+';

  // Render comments - integrated (no monkey-patch needed)
  setTimeout(()=>{
    currentRating=0;
    document.querySelectorAll('.star-btn').forEach(s=>s.classList.remove('on'));
    const hint=document.getElementById('commentLoginHint');
    if(hint) hint.textContent=window.currentUser?`Posting as ${window.currentUser.name||window.currentUser.email}`:'Sign in to post a review';
    renderComments(fontId);
  },120);
}

function updateDetailDlCount(fontId){
  const el=document.getElementById('fdpDlCountVal');if(el)el.textContent=fmtDlCountFor(fontId);
}
function copyDetailCSS(){
  const blk=document.getElementById('fdpCodeBlock'); if(!blk) return;
  navigator.clipboard.writeText(blk.textContent).then(()=>{
    const btn=document.getElementById('fdpCopyBtn'); if(!btn) return;
    btn.textContent='Copied!';btn.classList.add('copied');
    setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('copied');},1800);
  });
}

// FILE UPLOAD
let uploadedFontData=null; // first file - kept for submitFont compatibility
let uploadedFontFiles=[]; // all selected files
function handleFileSelect(e){Array.from(e.target.files||[]).forEach(f=>processFile(f));}
function handleDragOver(e){e.preventDefault();document.getElementById('fileUploadZone').classList.add('drag-over');}
function handleDragLeave(){document.getElementById('fileUploadZone').classList.remove('drag-over');}
function handleDrop(e){e.preventDefault();document.getElementById('fileUploadZone').classList.remove('drag-over');Array.from(e.dataTransfer.files||[]).forEach(f=>processFile(f));}
function processFile(file){
  const ext='.'+file.name.split('.').pop().toLowerCase();
  if(!['.ttf','.otf','.woff','.woff2'].includes(ext)){showToast(`✅ "${file.name}" - only TTF, OTF, WOFF, WOFF2 allowed`);return;}
  const MAX_FONT_SIZE=10*1024*1024;
  if(file.size>MAX_FONT_SIZE){showToast(`✅ "${file.name}" too large - max 10 MB`);return;}
  if(uploadedFontFiles.find(f=>f.name===file.name)){showToast(`"${file.name}" already added`);return;}
  const reader=new FileReader();
  reader.onload=e=>{
    const dataUrl=e.target.result;
    const entry={file,name:file.name,size:file.size,ext,dataUrl,unicodeSet:null};
    uploadedFontFiles.push(entry);
    if(uploadedFontFiles.length===1) uploadedFontData=entry;
    const fallback=file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    if(window.opentype){
      const abr=new FileReader();
      abr.onload=ev=>{
        try{
          const font=opentype.parse(ev.target.result);
          const set=new Set();
          const cmap=font.tables&&font.tables.cmap;
          if(cmap&&cmap.glyphIndexMap) Object.keys(cmap.glyphIndexMap).forEach(cp=>set.add(parseInt(cp)));
          entry.unicodeSet=set;
          if(uploadedFontFiles.length===1) uploadedFontData=entry;
          if(uploadedFontFiles.indexOf(entry)===0){
            const nt=font.names;
            const n=(nt&&((nt.preferredFamily&&nt.preferredFamily.en)||(nt.fontFamily&&nt.fontFamily.en)||(nt.fullName&&nt.fullName.en))||'').trim();
            const sfEl=document.getElementById('sf-name');
            if(sfEl&&!sfEl.value.trim()) sfEl.value=n||fallback;
          }
        }catch(err){if(uploadedFontFiles.indexOf(entry)===0){const sfEl=document.getElementById('sf-name');if(sfEl&&!sfEl.value.trim())sfEl.value=fallback;}}
        _renderFileList();
      };
      abr.readAsArrayBuffer(file);
    } else {
      if(uploadedFontFiles.indexOf(entry)===0){const sfEl=document.getElementById('sf-name');if(sfEl&&!sfEl.value.trim())sfEl.value=fallback;}
    }
    _renderFileList();
    showToast(`✅ "${file.name}" added`);
  };
  reader.onerror=()=>showToast(`? Could not read "${file.name}"`);
  reader.readAsDataURL(file);
}
function _renderFileList(){
  const sel=document.getElementById('fuzSelected');
  const lst=document.getElementById('fuzSelectedList');
  const zone=document.getElementById('fileUploadZone');
  if(!uploadedFontFiles.length){sel.classList.remove('show');zone.style.opacity='1';zone.style.minHeight='';return;}
  zone.style.opacity='0.55';
  zone.style.minHeight='40px';
  sel.classList.add('show');
  lst.innerHTML=uploadedFontFiles.map((f,i)=>
    `<div style="display:flex;align-items:center;gap:6px;padding:2px 0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span style="font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.name}</span>
      <span style="font-size:11px;color:var(--text3);flex-shrink:0">${(f.size/1024).toFixed(0)} KB</span>
      <button onclick="removeUploadedFile(${i})" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:13px;padding:0 2px;line-height:1;flex-shrink:0" title="Remove">?</button>
    </div>`
  ).join('');
}
function removeUploadedFile(idx){
  uploadedFontFiles.splice(idx,1);
  uploadedFontData=uploadedFontFiles[0]||null;
  if(!uploadedFontFiles.length) document.getElementById('sf-file').value='';
  _renderFileList();
}
function clearFile(){
  uploadedFontData=null;
  uploadedFontFiles=[];
  document.getElementById('sf-file').value='';
  const sel=document.getElementById('fuzSelected');
  sel.classList.remove('show');
  const lst=document.getElementById('fuzSelectedList');
  if(lst) lst.innerHTML='';
  document.getElementById('fileUploadZone').style.opacity='1';
}

// SUBMIT
document.getElementById('sf-license').addEventListener('change',function(){
  const m=LICENSE_META[this.value];const h=document.getElementById('licenseHint');
  if(m){h.textContent=m.hint;h.classList.add('show');}else{h.textContent='';h.classList.remove('show');}
});
function handleFontImgSelect(input){
  const file=input.files[0];if(!file)return;
  if(!file.type.startsWith('image/')){showToast('⚠️ Only image files allowed');input.value='';return;}
  if(file.size>3*1024*1024){showToast('⚠ Your image is too large - please use an image under 3 MB');input.value='';return;}
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('sfImgThumb').src=e.target.result;
    document.getElementById('sfImgPlaceholder').style.display='none';
    document.getElementById('sfImgPreview').style.display='block';
  };
  reader.readAsDataURL(file);
}
function clearFontImg(){
  document.getElementById('sf-img').value='';
  document.getElementById('sfImgThumb').src='';
  document.getElementById('sfImgPlaceholder').style.display='flex';
  document.getElementById('sfImgPreview').style.display='none';
}

function _resetSubmitForm(){
  ['sf-name','sf-author','sf-year','sf-url','sf-description'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  const sfBox=document.getElementById('sf-tags-box');
  if(sfBox&&sfBox._tags){sfBox._tags.length=0;sfBox._renderChips();}
  const sfTagsInput=document.getElementById('sf-tags-input');if(sfTagsInput)sfTagsInput.value='';
  const sfTagsHidden=document.getElementById('sf-tags');if(sfTagsHidden)sfTagsHidden.value='';
  const sfCat=document.getElementById('sf-cat');if(sfCat){sfCat.value='';refreshCustomSelect('sf-cat');}
  const sfLic=document.getElementById('sf-license');if(sfLic){sfLic.value='';refreshCustomSelect('sf-license');}
  const sfDesc=document.getElementById('sf-desc-counter');if(sfDesc)sfDesc.textContent='0/300';
  clearFile();clearFontImg();
}
function openSubmit(){
  if(!window.currentUser){
    openAuthModal('login');
    showToast('⚠ Please sign up or sign in to submit a font');
    return;
  }
  if(window.currentUser.emailVerified === false){
    showVerifyEmailModal();
    return;
  }
  _resetSubmitForm();
  document.getElementById('submitFormWrap').style.display='';
  document.getElementById('submitSuccess').classList.remove('show');
  document.getElementById('submitModal').classList.add('open');document.body.style.overflow='hidden';
}
function closeSubmit(){document.getElementById('submitModal').classList.remove('open');document.body.style.overflow='';_resetSubmitForm();}

// ?? TAG CHIP INPUT ??
function _initTagChip(boxId, chipsId, inputId, hiddenId, maxTags){
  const box=document.getElementById(boxId);
  const chipsEl=document.getElementById(chipsId);
  const input=document.getElementById(inputId);
  const hidden=document.getElementById(hiddenId);
  if(!box||!chipsEl||!input||!hidden) return;
  let tags=[];

  function syncHidden(){ hidden.value=tags.join(','); }
  function renderChips(){
    chipsEl.innerHTML=tags.map((t,i)=>`
      <span class="tag-chip">${esc(t)}<button type="button" onclick="_removeTagChip('${boxId}','${hiddenId}',${i})"><svg width="8" height="8" viewBox="0 0 10 10" fill="none"><line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></span>
    `).join('');
    syncHidden();
  }
  function addTag(val){
    const v=val.trim().replace(/,/g,'');
    if(!v) return;
    if(tags.length>=10){showToast("⚠️ Maximum 10 tags allowed");return;}
    if(tags.map(t=>t.toLowerCase()).includes(v.toLowerCase())) return;
    tags.push(v.charAt(0).toUpperCase()+v.slice(1));
    renderChips();
  }

  // expose tags array and renderChips for external use
  box._tags=tags; box._renderChips=renderChips;

  input.addEventListener('keydown',e=>{
    if((e.key===' '||e.key===','||e.key==='Enter')&&input.value.trim()){
      e.preventDefault();
      addTag(input.value);
      input.value='';
    } else if(e.key==='Backspace'&&!input.value&&tags.length){
      tags.pop(); renderChips();
    }
  });
  input.addEventListener('input',e=>{
    // If user pastes text with commas or spaces, split immediately
    if(input.value.includes(',')||input.value.includes(' ')){
      const parts=input.value.split(/[,\s]+/);
      parts.forEach((p,i)=>{ if(i<parts.length-1) addTag(p); });
      input.value=parts[parts.length-1];
    }
  });
}

window._removeTagChip=function(boxId,hiddenId,idx){
  const box=document.getElementById(boxId);
  if(!box||!box._tags) return;
  box._tags.splice(idx,1);
  box._renderChips();
  document.getElementById(hiddenId).value=box._tags.join(',');
};

window._setTagChipValues=function(boxId,chipsId,inputId,hiddenId,tagsArr){
  const box=document.getElementById(boxId);
  if(!box||!box._tags) return;
  box._tags.length=0;
  tagsArr.forEach(t=>{ if(t&&!box._tags.includes(t)) box._tags.push(t); });
  box._renderChips();
};

// Init both tag chip inputs when DOM ready
document.addEventListener('DOMContentLoaded',()=>{
  _initTagChip('sf-tags-box','sf-tags-chips','sf-tags-input','sf-tags',5);
  _initTagChip('ef-tags-box','ef-tags-chips','ef-tags-input','ef-tags',5);
});
function closeSubmitOutside(e){if(e.target===document.getElementById('submitModal')&&e.type!=='touchmove')closeSubmit();}
async function submitFont(){
  if(!window.currentUser){closeSubmit();openAuthModal('login');showToast('⚠ Please sign up or sign in to submit a font');return;}
  // Email doğrulanmamışsa submit-i blokla (OAuth login-lər həmişə verified sayılır)
  if(window.currentUser.emailVerified === false){
    showVerifyEmailModal();
    return;
  }
  const newFont=_buildNewFontFromForm();
  if(!newFont) return;
  if(uploadedFontFiles.length > 0){
    await _uploadSubmittedFontFiles(newFont);
  }
  try{ await _finalizeSubmit(newFont); }catch(err){ console.error('finalize error:',err); showToast('❌ Xəta: '+err.message); }
}

// 1/7 — read & validate the submit form, build the draft font object (or null if invalid)
function _buildNewFontFromForm(){
  const name=document.getElementById('sf-name').value.trim();
  const author=document.getElementById('sf-author').value.trim();
  const cat=document.getElementById('sf-cat').value;
  const license=document.getElementById('sf-license').value;
  const url=document.getElementById('sf-url').value.trim();
  const description=(document.getElementById('sf-description')?.value||'').trim();
  if(!name||!author||!cat||!license){showToast('⚠️ Please fill in all required fields');return null;}
  let id=name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  // ID artıq mövcuddursa rəqəmli suffix əlavə et
  if(FONTS.find(f=>f.id===id)){
    let suffix=2;
    while(FONTS.find(f=>f.id===id+'-'+suffix)) suffix++;
    id=id+'-'+suffix;
  }
  // Qeyd: timestamp artıq əlavə edilmir. Eyni adlı fontu iki dəfə submit etmək
  // yuxarıdakı suffix məntiqi ilə idarə olunur. Firestore-da race condition
  // setDoc-dan əvvəl getDoc ilə mövcudluq yoxlanılması ilə önlənir.
  const gfamily=name.replace(/\s+/g,'+');
  const tagsRaw=document.getElementById('sf-tags').value.trim();
  const year=parseInt(document.getElementById('sf-year').value)||new Date().getFullYear();
  const tags=tagsRaw?tagsRaw.split(/[,\s]+/).map(t=>t.trim()).filter(Boolean):['Custom'];
  const imgThumb=document.getElementById('sfImgThumb');
  const previewImg=imgThumb&&imgThumb.src&&imgThumb.src.startsWith('data:')?imgThumb.src:null;
  const newFont={
    id,name,author,cat,gfamily,weight:'400',tags,license,year,popular:60,sourceUrl:url||'',
    description:description||'',
    pending:true,isNew:true,
    submittedById:window.currentUser.id,
    submittedByName:window.currentUser.name,
    submittedByEmail:window.currentUser.email,
    submittedAt:new Date().toISOString()
  };
  if(previewImg)newFont.previewImg=previewImg;
  return newFont;
}

// 2/7 — upload selected font file(s) (Firebase Storage, with dataUrl fallback), mutates newFont
async function _uploadSubmittedFontFiles(newFont){
  const submitBtn = document.querySelector('#submitModal .submit-btn');
  if(submitBtn){submitBtn.textContent='Uploading.';submitBtn.disabled=true;}
  let primaryUrl=null, primaryExt=null, primaryName=null;
  const fontVariants=[]; // bütün variantlarin URL-l?ri
  for(let i=0;i<uploadedFontFiles.length;i++){
    const fd=uploadedFontFiles[i];
    newFont.gfamily = null;
    if(submitBtn) submitBtn.textContent=`Uploading ${i+1}/${uploadedFontFiles.length}.`;
    try{
      const fRef2=window._fbStorageRef(window._fbStorage,'fonts/'+(newFont.id+(i>0?('_'+i):'')+fd.ext));
      await window._fbUploadBytes(fRef2, fd.file);
      const url2=await window._fbGetDownloadURL(fRef2);
      fontVariants.push({url:url2, ext:fd.ext, name:fd.name});
      if(!primaryUrl){ primaryUrl=url2; primaryExt=fd.ext; primaryName=null; }
      console.log('✅ Firebase Storage upload ok:', fd.name);
    }catch(e){
      console.warn('Storage upload failed, falling back to dataUrl:', e.message);
      if(fd.dataUrl) fontVariants.push({url:fd.dataUrl, ext:fd.ext, name:fd.name});
    }
  }
  // dataUrl fallback - PHP upload isl?m?dikd? uploadedFontFiles-dan variant qur
  if(!fontVariants.length && uploadedFontFiles.length>0){
    uploadedFontFiles.forEach(fd=>{
      if(fd.dataUrl) fontVariants.push({url:fd.dataUrl, ext:fd.ext, name:fd.name});
    });
  }
  if(primaryUrl){
    newFont.fontUrl=primaryUrl;
    newFont.fontExt=primaryExt;
    if(fontVariants.length > 0) newFont.fontVariants=fontVariants;
    if(primaryName && primaryName.trim()){
      const sfNameEl=document.getElementById('sf-name');
      if(sfNameEl&&!sfNameEl.value.trim()) sfNameEl.value=primaryName.trim();
      if(!newFont.name||newFont.name.replace(/-/g,' ').trim()===newFont.id.replace(/-/g,' ').trim()){
        newFont.name=primaryName.trim();
        newFont.id=primaryName.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
      }
    }
    newFont.pending=false;
    newFont.status='approved';
    newFont.approvedAt=new Date().toISOString();
  } else if(fontVariants.length > 0){
    // PHP isl?m?di, amma dataUrl fallback var - bunlari da approved kimi qeyd et
    newFont.fontVariants=fontVariants;
    // Birinci varianti primary kimi saxla (preview üçün)
    newFont.fontData=fontVariants[0].url;
    newFont.fontExt=fontVariants[0].ext;
    newFont.pending=false;
    newFont.status='approved';
    newFont.approvedAt=new Date().toISOString();
  }
  if(submitBtn){submitBtn.textContent='Submit Font';submitBtn.disabled=false;}
}

// 3/7 — compute detectedLangs from the parsed opentype unicode set, if available
function _computeDetectedLangsForSubmission(font){
  if(!font.detectedLangs && uploadedFontData && uploadedFontData.unicodeSet && uploadedFontData.unicodeSet.size>0){
    const set=uploadedFontData.unicodeSet;
    font.detectedLangs=(typeof LANG_SUPPORT_LIST!=='undefined'?LANG_SUPPORT_LIST:[])
      .filter(l=>{
        const chars=l.chars||'';
        const arr=typeof chars==='string'?[...chars]:chars;
        return arr.some(ch=>set.has(ch.codePointAt(0)));
      })
      .map(l=>l.label);
    if(!font.detectedLangs.length) font.detectedLangs=['Latin'];
    _LANG_CACHE[font.id]=font.detectedLangs;
  }
}

// 4/7 — build the storage-safe copy of the font (binary data stripped/relocated)
function _prepFontForStorage(font){
  const fontForStorage={...font};
  if(fontForStorage.fontUrl || fontForStorage.fontData){
    fontForStorage.pending=false;
    fontForStorage.status='approved';
    if(!fontForStorage.approvedAt) fontForStorage.approvedAt=new Date().toISOString();
  }
  // fontData-nı ayrı saxla (5MB limit)
  if(font.fontData){
    try{localStorage.setItem('fn_fontdata_'+font.id, font.fontData);}catch(e){console.warn('fontData storage failed (quota?):',e);}
    delete fontForStorage.fontData;
    fontForStorage._hasFontData=true;
  }
  if(font.fontUrl) delete fontForStorage.fontData;
  return fontForStorage;
}

// 5/7 — write to Firestore (primary store); returns true if a doc now exists there
async function _persistSubmittedFontToFirestore(font, fontForStorage){
  if(!(window._fbFns && window._fbDb)) return false;
  const {doc, setDoc, getDoc} = window._fbFns;
  const db = window._fbDb;
  const cloudFont={...fontForStorage};
  delete cloudFont.fontData;
  if(cloudFont.fontUrl){ cloudFont.pending=false; cloudFont.status='approved'; }
  try{
    const existing = await getDoc(doc(db,'submitted_fonts',font.id));
    if(existing.exists()){
      console.warn('submitFont: font ID already exists in Firestore, skipping write:', font.id);
      return true; // mövcuddur, yazma tələb olunmur
    }
    await setDoc(doc(db,'submitted_fonts',font.id), cloudFont);
    console.log('✅ Firestore primary save:', font.id, 'pending:', cloudFont.pending);
    return true;
  }catch(e){
    console.warn('Firestore submitFont error, falling back to localStorage:', e.message);
    showToast('⚠ Cloud sync olmadı, lokal saxlandı. Internet bərpasında yenidən cəhd olunacaq.');
    return false;
  }
}

// 6/7 — localStorage cache + offline admin queue fallback
function _persistSubmittedFontLocally(font, fontForStorage, savedToFirestore){
  // ── FALLBACK: localStorage ──────────────────────────────────────────────
  // Həmişə local cache-ə yaz: cari sessiya üçün + Firestore offline olduqda
  try{
    const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
    // Mövcuddursa update et, yoxsa əlavə et
    const existIdx=sub.findIndex(x=>x.id===fontForStorage.id);
    if(existIdx>=0) sub[existIdx]={...sub[existIdx],...fontForStorage};
    else sub.push(fontForStorage);
    localStorage.setItem("tv_submitted",JSON.stringify(sub));
  }catch(e){console.warn('localStorage fallback save error:',e);}

  // Admin queue — yalnız Firebase yoxdursa (tam offline vəziyyət)
  if(!font.fontUrl && !font.fontData && !savedToFirestore){
    try{const reqs=getAdminRequests();reqs.push({...fontForStorage,requestType:'add'});saveAdminRequests(reqs);}catch(e){}
  }
}

// 7/7 — clear the submit form and show the success state
function _resetSubmitForm(){
  ['sf-name','sf-author','sf-tags','sf-year','sf-url','sf-description'].forEach(fid=>{const el=document.getElementById(fid);if(el)el.value='';});
  const sfBox=document.getElementById('sf-tags-box');
  if(sfBox&&sfBox._tags){sfBox._tags.length=0;sfBox._renderChips();}
  document.getElementById('sf-tags-input').value='';
  document.getElementById('sf-cat').value='';refreshCustomSelect('sf-cat');document.getElementById('sf-license').value='';refreshCustomSelect('sf-license');
  document.getElementById('licenseHint').textContent='';document.getElementById('licenseHint').classList.remove('show');
  clearFile();clearFontImg();
  document.getElementById('submitFormWrap').style.display='none';
  document.getElementById('submitSuccess').classList.add('show');
}

// Helper to finalize submission after optional Storage upload
async function _finalizeSubmit(font){
  _computeDetectedLangsForSubmission(font);
  // Add to runtime FONTS (current user sees it immediately)
  FONTS.push(font);
  DL_COUNTS[font.id]=0;
  // Inject font face immediately for current session
  if(!font.previewImg){
    if(font.fontVariants&&font.fontVariants.length>0) injectVariantFaces(font);
    else if(font.fontData) injectCustomFontFace(font.id,font.name,font.fontData,font.fontExt||'.ttf');
    else if(font.fontUrl) injectCustomFontFaceUrl(font.id,font.name,font.fontUrl,font.fontExt||'.ttf');
  }
  const fontForStorage=_prepFontForStorage(font);
  // ── PRIMARY: Firestore ──────────────────────────────────────────────────
  // Firebase mövcuddursa əvvəlcə Firestore-a yaz; localStorage yalnız
  // offline/fallback cache rolunu oynayır. Fərqli brauzer/cihazdan adminlər
  // yalnız Firestore-dakı fontu görə bilər.
  const savedToFirestore = await _persistSubmittedFontToFirestore(font, fontForStorage);
  _persistSubmittedFontLocally(font, fontForStorage, savedToFirestore);
  _resetSubmitForm();
  renderFonts();
}

// TOAST
// ?? Parse weight & style from font filename ?????????????????????????????????
function parseVariantStyle(filename){
  const base=(filename||'').replace(/\.[^.]+$/,'');
  const lower=base.toLowerCase();
  const parts=lower.split(/[-_\s]+/);
  let weight=400,style='normal';
  if(parts.includes('it')||parts.includes('ital')||/italic|oblique/.test(lower)) style='italic';
  if(parts.includes('hv')||parts.includes('heavy')||parts.includes('blk')||parts.includes('black')) weight=900;
  else if(parts.includes('extrabold')||parts.includes('xbd')) weight=800;
  else if(parts.includes('bd')||parts.includes('bold')) weight=700;
  else if(parts.includes('sb')||parts.includes('semibold')||parts.includes('demi')) weight=600;
  else if(parts.includes('md')||parts.includes('med')||parts.includes('medium')) weight=500;
  else if(parts.includes('lt')||parts.includes('light')) weight=300;
  else if(parts.includes('el')||parts.includes('extralight')) weight=200;
  else if(parts.includes('th')||parts.includes('thin')||parts.includes('hairline')) weight=100;
  const ABBR={'rg':'Regular','bd':'Bold','lt':'Light','md':'Medium','th':'Thin','hv':'Heavy','blk':'Black','it':'Italic','ob':'Oblique','sb':'Semi Bold','el':'Extra Light','cond':'Condensed','comp':'Compressed','cram':'Crammed','ext':'Extended','exp':'Expanded','nar':'Narrow','ital':'Italic','reg':'Regular','bold':'Bold','light':'Light','black':'Black','heavy':'Heavy','thin':'Thin','italic':'Italic','condensed':'Condensed','compressed':'Compressed','extended':'Extended','semibold':'Semi Bold','extrabold':'Extra Bold','extralight':'Extra Light'};
  const label=parts.slice(1).map(p=>ABBR[p]||(p.charAt(0).toUpperCase()+p.slice(1))).join(' ').trim()||'Regular';
  return {weight,style,label};
}
// ?? Inject one @font-face per variant with correct weight+style ??????????????
function injectVariantFaces(font){
  if(!font.fontVariants||!font.fontVariants.length) return false;
  const fmt={'.ttf':'truetype','.otf':'opentype','.woff':'woff','.woff2':'woff2'};
  font.fontVariants.forEach((v,i)=>{
    if(!v.url) return;
    const vi=parseVariantStyle(v.name||'');
    const ext=v.ext||font.fontExt||'.otf';
    const f2=fmt[ext]||'opentype';
    // Each variant gets its own unique font-family name so browser won't confuse them
    const vFamily=font.name+' '+vi.label;
    v._familyName=vFamily;
    const vFamilyEsc=vFamily.replace(/'/g,"\'");
    if(typeof FontFace!=='undefined'){
      const ff=new FontFace(vFamily,`url('${v.url}') format('${f2}')`,{weight:String(vi.weight),style:vi.style});
      ff.load().then(l=>{document.fonts.add(l);}).catch(()=>{
        const s=document.createElement('style');
        s.textContent=`@font-face{font-family:'${vFamilyEsc}';src:url('${v.url}') format('${f2}');font-weight:${vi.weight};font-style:${vi.style}}`;
        document.head.appendChild(s);
      });
    } else {
      const s=document.createElement('style');
      s.textContent=`@font-face{font-family:'${vFamilyEsc}';src:url('${v.url}') format('${f2}');font-weight:${vi.weight};font-style:${vi.style}}`;
      document.head.appendChild(s);
    }
  });
  loadedFonts.add(font.id);
  return true;
}
let toastT;
let _toastQueue=[];
let _toastShowing=false;
function showToast(msg){
  _toastQueue.push(msg);
  if(!_toastShowing) _showNextToast();
}
function _showNextToast(){
  if(!_toastQueue.length){_toastShowing=false;return;}
  _toastShowing=true;
  const msg=_toastQueue.shift();
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);
  toastT=setTimeout(()=>{
    t.classList.remove('show');
    setTimeout(_showNextToast,250);
  },2200);
}

// KEYBOARD (single unified handler)
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();const s=document.getElementById('searchInput');if(s){s.focus();s.select();}return;}
  const tag=e.target.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
  if(e.key==='Escape'){
    var _pm=document.getElementById('pairModal');if(_pm&&_pm.style.opacity==='1'){closePairModal();return;}
    var _em=document.getElementById('editFontModal');if(_em&&_em.classList.contains('open')){closeEditFont();return;}
    var _ao=document.getElementById('authOverlay');if(_ao&&_ao.classList.contains('open')){closeAuthModal();return;}
    var _mo=document.getElementById('modPanelOverlay');if(_mo&&_mo.style.display!=='none'){closeModPanel();return;}
    var _admin=document.getElementById('adminPanelOverlay');if(_admin&&_admin.style.display!=='none'){closeAdminPanel();return;}
    closeSubmit();closeContactModal();closeCompare();
    if(shortcutsOpen){shortcutsOpen=false;document.getElementById('shortcutsPanel').classList.remove('open');}
    else if(document.getElementById('authorPage').style.display!=='none')showGrid();
    else if(currentDetailFont)showGrid();
    return;
  }
  if(e.key==='c'||e.key==='C'){openCompare();}
  if(e.key==='d'||e.key==='D'){toggleDark();}
  if(e.key==='n'||e.key==='N'){openSubmit();}
  if(e.key==='?'){e.preventDefault();toggleShortcuts();}
  if(e.key==='/'){e.preventDefault();document.getElementById('searchInput').focus();}
});

// EVENTS
document.querySelectorAll('.cat').forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.cat)));
document.querySelectorAll('.sb-item[data-scat]').forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.scat)));

const allTags=[...new Set(FONTS_BASE.flatMap(f=>f.tags))].sort();
const tagList=document.getElementById('tagList');
allTags.slice(0,18).forEach(tag=>{
  const d=document.createElement('div');d.className='sb-item';d.textContent=tag;d.dataset.tag=tag;
  d.addEventListener('click',()=>{
    showGrid();
    activeCategory='all';activeLicenseFilter=null;alphaFilter='';currentPage=1;
    searchTerm='';document.getElementById('searchInput').value='';
    activeTag=tag;
    document.querySelectorAll('#tagList .sb-item').forEach(b=>b.classList.toggle('active',b.dataset.tag===tag));
    document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active',b.dataset.cat==='all'));
    document.querySelectorAll('.alpha-btn').forEach(b=>b.classList.toggle('active',b.textContent.trim()==='All'));
    renderFonts();showToast(`"${tag}" fonts`);
    syncUrl(true);
  });
  tagList.appendChild(d);
});

// init dark icon
if(darkMode){_setDarkIcon(true);}

// ?? APPLE RANGE SLIDERS - sync fill percentage ??
function syncRangeSlider(input){
  const min=parseFloat(input.min)||0;
  const max=parseFloat(input.max)||100;
  const val=parseFloat(input.value);
  const pct=Math.max(0,Math.min(100,((val-min)/(max-min))*100));
  input.style.setProperty('--range-pct',pct.toFixed(2)+'%');
}
document.querySelectorAll('input[type=range]').forEach(r=>{
  syncRangeSlider(r);
  r.addEventListener('input',()=>syncRangeSlider(r));
});

// ?? HERO INIT ??
(function(){
  const total = FONTS_BASE.length;
  const freeCount = FONTS_BASE.filter(f=>['free','ofl','apache'].includes(f.license)).length;
  document.getElementById('heroStatFonts').textContent = total + '+';
  document.getElementById('heroStatFree').textContent = Math.round(freeCount/total*100)+'%';
  const picks = FONTS_BASE.slice().sort((a,b)=>(b.popular||0)-(a.popular||0)).slice(0,16);
  const doubled = [...picks,...picks];
  const inner = document.getElementById('heroTickerInner');
  const separators = ['?','·','?','?','?','?','?','?'];
  inner.innerHTML = doubled.map((f,i)=>`<span class="hero-ticker-item" style="font-family:'${f.name}',sans-serif" onclick="openDetail('${f.id}')">${f.name}</span><span class="hero-ticker-item" style="font-size:10px;opacity:0.3;padding:0 8px;cursor:default;letter-spacing:0;font-style:normal;font-weight:400">${separators[i%separators.length]}</span>`).join('');
})();

renderRecentList();
// Grid-də skeleton göstər ki səhifə boş görünməsin
(function(){
  var grid=document.getElementById('fontGrid');
  if(!grid) return;
  var skeletons='';
  for(var i=0;i<12;i++) skeletons+='<div class="font-card skeleton-card" style="background:var(--card);border-radius:12px;min-height:160px;opacity:0.5;animation:pulse 1.2s ease-in-out infinite alternate;"></div>';
  grid.innerHTML=skeletons;
  if(!document.getElementById('_skeletonStyle')){
    var st=document.createElement('style');
    st.id='_skeletonStyle';
    st.textContent='@keyframes pulse{from{opacity:0.35}to{opacity:0.6}}';
    document.head.appendChild(st);
  }
}());
// Firebase hazır olandan sonra real data ilə bir dəfə render et
(function _waitFbAndLoadStats(attempt){
  if(window._fbDb && window._fbFns){
    loadDownloadStatsCache().then(function(){
      renderFonts();
      loadRatingsCache();
    });
  } else if(attempt < 40){
    setTimeout(function(){ _waitFbAndLoadStats(attempt+1); }, 250);
  } else {
    renderFonts();
  }
})(0);
// initAuth loads window.currentUser from localStorage for offline/non-Firebase fallback
// Firebase onAuthStateChanged will override this when it fires
if(typeof initAuth === 'function') initAuth();
setTimeout(injectAllFallingLetters, 300);

// ??????????????????????????????????????????
// COMMENTS & REVIEWS
// ??????????????????????????????????????????
// Storage: localStorage key "fontan_comments" ? { fontId: [{id,user,userId,rating,text,date,likes:[]}] }
let currentRating = 0;

function getComments(fontId){
  try{ const d=JSON.parse(localStorage.getItem('fontan_comments')||'{}'); return d[fontId]||[]; }catch(e){return [];}
}
function saveComments(fontId, arr){
  try{ const d=JSON.parse(localStorage.getItem('fontan_comments')||'{}'); d[fontId]=arr; localStorage.setItem('fontan_comments',JSON.stringify(d)); }catch(e){}
}
async function loadCommentsFromFb(fontId){
  if(!window.fbGetComments) return null;
  try{ return await window.fbGetComments(fontId); }catch(e){ return null; }
}

function setRating(val){
  currentRating=val;
  document.querySelectorAll('.star-btn').forEach(s=>{
    s.classList.toggle('on', parseInt(s.dataset.v)<=val);
  });
}

async function renderComments(fontId){
  const list=document.getElementById('commentsList');
  const count=document.getElementById('commentCount');
  if(!list)return;
  list.innerHTML='<div class="comment-empty" style="opacity:0.5">Loading.</div>';
  let comments = await loadCommentsFromFb(fontId);
  if(!comments) comments = getComments(fontId);
  if(count) count.textContent=comments.length ? `(${comments.length})` : '';
  // Show average rating next to count
  const rated = comments.filter(c=>c.rating>0);
  const avgEl = document.getElementById('commentAvgRating');
  if(avgEl) {
    if(rated.length > 0) {
      const avg = rated.reduce((s,c)=>s+(c.rating||0),0)/rated.length;
      const fullStars = Math.round(avg);
      avgEl.innerHTML = `<span style="color:#f5a623;letter-spacing:1px">${'★'.repeat(fullStars)}${'☆'.repeat(5-fullStars)}</span> <span style="color:var(--text3);font-size:11px;font-weight:400">${avg.toFixed(1)}</span>`;
      avgEl.style.display='inline-flex';
    } else {
      avgEl.style.display='none';
    }
  }
  if(!comments.length){
    list.innerHTML='<div class="comment-empty">No reviews yet - be the first!</div>';
    return;
  }
  list.innerHTML=comments.slice().reverse().map(c=>{
    const stars='★'.repeat(c.rating||0)+'☆'.repeat(5-(c.rating||0));
    const likeCount=c.likes?c.likes.length:0;
    const likedByMe=window.currentUser&&c.likes&&c.likes.includes(window.currentUser.id);
    const isOwn=window.currentUser&&c.userId===window.currentUser.id;
    const isAdmin=_isAdmin(window.currentUser);
    return `<div class="comment-card" id="cmt-${c.id}">
      <div class="comment-header">
        <span class="comment-author">${esc(c.user)}</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="comment-date">${new Date(c.date).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</span>
          ${(isOwn||isAdmin)?`<button class="comment-delete" onclick="deleteComment('${fontId}','${c.id}')" title="Delete"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>`:''}
        </div>
      </div>
      ${c.rating?`<div class="comment-stars">${stars}</div>`:''}
      <div class="comment-body">${esc(c.text)}</div>
      <div class="comment-likes">
        <button class="comment-like-btn ${likedByMe?'liked':''}" onclick="likeComment('${fontId}','${c.id}')">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="${likedByMe?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          Helpful ${likeCount?`(${likeCount})`:''}
        </button>
      </div>
    </div>`;
  }).join('');
}

async function submitComment(){
  const font=currentDetailFont;
  if(!font){showToast('⚠️ No font selected');return;}
  if(!window.currentUser){openAuthModal('login');showToast('⚠️ Sign in to post a review');return;}
  const txt=document.getElementById('commentInput').value.trim();
  if(!txt){showToast('⚠️ Write something first');return;}
  if(window.fbAddComment){
    try{
      await window.fbAddComment(font.id, txt, currentRating);
      // Also save to localStorage so reviews appear even if Firebase re-fetch is slow
      const _newC={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),userId:window.currentUser.id,user:window.currentUser.name||window.currentUser.email,rating:currentRating,text:txt,date:new Date().toISOString(),likes:[]};
      const _lsC=getComments(font.id);
      if(!_lsC.find(c=>c.userId===window.currentUser.id&&c.text===txt)){_lsC.push(_newC);saveComments(font.id,_lsC);}
      // Update local rating cache
      if(currentRating > 0) {
        const existing = RATING_CACHE[font.id];
        if(existing) {
          const newTotal = existing.avg * existing.count + currentRating;
          const newCount = existing.count + 1;
          RATING_CACHE[font.id] = { avg: newTotal/newCount, count: newCount };
        } else {
          RATING_CACHE[font.id] = { avg: currentRating, count: 1 };
        }
        window.RATING_CACHE[font.id] = RATING_CACHE[font.id];
      }
      document.getElementById('commentInput').value='';
      setRating(0); currentRating=0;
      await renderComments(font.id);
      showToast('✅ Review posted!');
    }catch(e){ showToast('❌ Error: '+e.message); }
  } else {
    const comments=getComments(font.id);
    const already=comments.find(c=>c.userId===window.currentUser.id);
    if(already){showToast('⚠️ You already reviewed this font');return;}
    const newC={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
      userId:window.currentUser.id,user:window.currentUser.name||window.currentUser.email,
      rating:currentRating,text:txt,date:new Date().toISOString(),likes:[]};
    comments.push(newC);saveComments(font.id,comments);
    document.getElementById('commentInput').value='';setRating(0);currentRating=0;
    renderComments(font.id);showToast('✅ Review posted!');
  }
}

async function deleteComment(fontId, commentId){
  if(window.fbDeleteComment){
    try{ await window.fbDeleteComment(commentId); await renderComments(fontId); showToast('✅ Review deleted'); }
    catch(e){ showToast('❌ '+e.message); }
  } else {
    const comments=getComments(fontId).filter(c=>c.id!==commentId);
    saveComments(fontId,comments);renderComments(fontId);showToast('✅ Review deleted');
  }
}

async function likeComment(fontId, commentId){
  if(!window.currentUser){openAuthModal('login');showToast('⚠️ Sign in to mark as helpful');return;}
  if(window.fbLikeComment){
    try{ await window.fbLikeComment(commentId, window.currentUser.id); await renderComments(fontId); }
    catch(e){ showToast('❌ '+e.message); }
  } else {
    const comments=getComments(fontId);
    const c=comments.find(x=>x.id===commentId);
    if(!c)return;if(!c.likes)c.likes=[];
    const idx=c.likes.indexOf(window.currentUser.id);
    if(idx>=0)c.likes.splice(idx,1);else c.likes.push(window.currentUser.id);
    saveComments(fontId,comments);renderComments(fontId);
  }
}

// ??????????????????????????????????????????
// COMMENTS & REVIEWS
// ??????????????????????????????????????????
// (comment rendering is now integrated directly inside openDetail above)

// ??????????????????????????????????????????
// CONTACT MODAL
// ??????????????????????????????????????????
function selectChip(el, val) {
  document.querySelectorAll('.ct-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  el.dataset.selected = val;
}

function openContactModal(){
  const o=document.getElementById('contactOverlay');
  if(!o)return;
  o.classList.add('open');
  document.body.style.overflow='hidden';
  document.getElementById('contactFormWrap').style.display='';
  document.getElementById('contactSuccess').style.display='none';
  if(window.currentUser){
    const n=document.getElementById('ctName');
    const e=document.getElementById('ctEmail');
    if(n&&!n.value) n.value=window.currentUser.name||'';
    if(e&&!e.value) e.value=window.currentUser.email||'';
  }
}
function closeContactModal(){
  const o=document.getElementById('contactOverlay');
  if(o) o.classList.remove('open');
  document.body.style.overflow='';
  ['ctName','ctEmail','ctSubject','ctMsg'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  const cw=document.getElementById('contactFormWrap');if(cw)cw.style.display='';
  const cs=document.getElementById('contactSuccess');if(cs)cs.style.display='none';
}

function submitContact(){
  const name=document.getElementById('ctName').value.trim();
  const email=document.getElementById('ctEmail').value.trim();
  const activeChip=document.querySelector('.ct-chip.active');
  const subject=activeChip?activeChip.dataset.val:'other';
  const msg=document.getElementById('ctMessage').value.trim();
  if(!name||!email||!msg){showToast('⚠️ Please fill in all fields');return;}
  if(!email.includes('@')){showToast('⚠️ Enter a valid email');return;}
  const btn=document.getElementById('ctSendBtn');
  const btnOrigHTML = btn ? btn.innerHTML : '';
  if(btn){btn.textContent='Sending\u2026';btn.disabled=true;}
  if(window.fbSendContact){
    window.fbSendContact(name,email,subject,msg)
      .then(()=>{
        document.getElementById('contactFormWrap').style.display='none';
        document.getElementById('contactSuccess').style.display='';
        if(btn){btn.innerHTML=btnOrigHTML;btn.disabled=false;}
      })
      .catch(e=>{if(btn){btn.innerHTML=btnOrigHTML;btn.disabled=false;}showToast('❌ '+e.message);});
  } else {
    const entry={id:Date.now().toString(36),name,email,subject,msg,date:new Date().toISOString(),read:false};
    try{const msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]');msgs.unshift(entry);localStorage.setItem('fontan_contact_msgs',JSON.stringify(msgs));}catch(e){}
    document.getElementById('contactFormWrap').style.display='none';
    document.getElementById('contactSuccess').style.display='';
    updateAdminMessagesBadge();
  }
}

function updateAdminMessagesBadge(){
  try{
    const msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]');
    const unread=msgs.filter(m=>!m.read).length;
    const badge=document.getElementById('adminBadgeMessages');
    if(badge){
      badge.textContent=unread;
      badge.style.display=unread?'inline-flex':'none';
    }
  }catch(e){}
}

// ??????????????????????????????????????????
// ADMIN MESSAGES TAB
// ??????????????????????????????????????????
// (messages tab rendering is already integrated into switchAdminTab above)

async function renderAdminMessages(){
  const view=document.getElementById('adminView_messages');
  if(!view)return;
  view.innerHTML='<div style="text-align:center;padding:48px;color:var(--text3);font-size:14px">Loading.</div>';
  let msgs=[];
  if(window.fbGetMessages){
    try{ msgs=await window.fbGetMessages(); }catch(e){}
  } else {
    try{ msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]'); }catch(e){}
  }
  if(!msgs.length){
    view.innerHTML='<div style="text-align:center;padding:48px;color:var(--text3);font-size:14px">📭 No messages yet</div>';
    return;
  }
  view.innerHTML=msgs.map(m=>`
    <div style="background:var(--surface3);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:10px;${m.read?'opacity:0.7':''}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px">
        <div>
          <span style="font-weight:700;color:var(--text);font-size:14px">${esc(m.name)}</span>
          <span style="color:var(--text3);font-size:12px;margin-left:8px">${esc(m.email)}</span>
          ${!m.read?'<span style="display:inline-flex;background:var(--accent);color:#fff;font-size:10px;font-weight:700;border-radius:980px;padding:1px 7px;margin-left:8px">New</span>':''}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--text3)">${new Date(m.date).toLocaleString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
          <button onclick="markMsgRead('${m.id}')" style="padding:3px 10px;border-radius:980px;border:1px solid var(--border2);background:var(--surface-solid);font-size:11px;cursor:pointer;font-family:var(--sans);color:var(--text2)">
            ${m.read?'✓ Read':'Mark read'}
          </button>
          <button onclick="deleteMsgAdmin('${m.id}')" style="padding:3px 8px;border-radius:980px;border:1px solid rgba(255,59,48,0.25);background:transparent;font-size:11px;cursor:pointer;font-family:var(--sans);color:var(--red)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button>
        </div>
      </div>
      <div style="font-size:12px;font-weight:600;color:var(--text3);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.05em">${esc(m.subject)}</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.55;white-space:pre-wrap">${esc(m.msg)}</div>
    </div>
  `).join('');
}

async function markMsgRead(id){
  if(window.fbMarkRead){ try{ await window.fbMarkRead(id); await renderAdminMessages(); }catch(e){} }
  else {
    try{const msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]');const m=msgs.find(x=>x.id===id);if(m)m.read=true;localStorage.setItem('fontan_contact_msgs',JSON.stringify(msgs));renderAdminMessages();updateAdminMessagesBadge();}catch(e){}
  }
}
async function deleteMsgAdmin(id){
  if(window.fbDeleteMessage){ try{ await window.fbDeleteMessage(id); await renderAdminMessages(); }catch(e){} }
  else {
    try{const msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]').filter(x=>x.id!==id);localStorage.setItem('fontan_contact_msgs',JSON.stringify(msgs));renderAdminMessages();updateAdminMessagesBadge();}catch(e){}
  }
}

// ??????????????????????????????????????????
// PASSWORD VISIBILITY TOGGLE
// ??????????????????????????????????????????
// ?? ENTER KEY on auth inputs ??
document.addEventListener('DOMContentLoaded', () => {
  ['loginEmail','loginPassword'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('keydown', e => { if(e.key==='Enter') submitLogin(); });
  });
  ['signupName','signupEmail','signupPassword'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('keydown', e => { if(e.key==='Enter') submitSignup(); });
  });
  // Preload hero ticker fonts
  FONTS_BASE.slice().sort((a,b)=>(b.popular||0)-(a.popular||0)).slice(0,16).forEach(f => loadFont(f));
});

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  icon.innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

// ?? Xaotik dumanli h?rfl?r ??
function injectChaoticLetters(cardEl, fontName) {
  const container = cardEl.querySelector('.ch-letters');
  if (!container) return;
  const letters = (fontName || 'Aa').replace(/\s/g,'').toUpperCase().split('');
  const all = [...letters, ...letters, ...'ABCDEFGHIJ'.split('')];
  const picks = all.slice(0, 14);
  const sizes = [28, 36, 44, 54, 64];
  container.innerHTML = picks.map((ch, i) => {
    const sz    = sizes[Math.floor(Math.random() * sizes.length)];
    const top   = Math.floor(Math.random() * 50 - 8);
    const left  = Math.floor((i / picks.length) * 100 + (Math.random()-0.5)*12);
    const rot   = Math.floor((Math.random()-0.5) * 50);
    const op    = (0.22 + Math.random() * 0.20).toFixed(2);
    const blur  = (Math.random() * 1.0).toFixed(1);
    const dur   = (3.5 + Math.random() * 4).toFixed(1);
    const delay = (Math.random() * 3).toFixed(1);
    const anim  = i % 8;
    return `<span style="font-size:${sz}px;top:${top}px;left:${left}%;color:rgba(255,255,255,${op});filter:blur(${blur}px);font-family:'${fontName}',sans-serif;transform:rotate(${rot}deg);transform-origin:center;animation:chFloat${anim} ${dur}s ${delay}s ease-in-out infinite">${ch}</span>`;
  }).join('');
}

function injectFallingLetters(cardEl, fontName) {
  const container = cardEl.querySelector('.ch-fall');
  if (!container) return;
  const isSlow = container.classList.contains('ch-fall-slow');
  const safe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nameLetters = (fontName||'').replace(/[^A-Za-z]/g,'').split('');
  const pool = [...nameLetters, ...nameLetters, ...safe.split('')];
  const count = isSlow ? 9 : 22;
  const all = pool.slice(0, count);
  const sizes = isSlow ? [22, 30, 40, 52] : [28, 36, 46, 58, 70, 82];
  container.innerHTML = all.map((ch, i) => {
    const sz    = sizes[Math.floor(Math.random() * sizes.length)];
    const left  = Math.floor((i / all.length) * 108 - 3 + (Math.random()-0.5) * 8);
    const dur   = (1.8 + Math.random() * 2.5).toFixed(1);
    const delay = (Math.random() * -5).toFixed(1);
    const rot   = Math.floor((Math.random()-0.5) * 40);
    const op    = isSlow ? (0.18 + Math.random() * 0.18).toFixed(2) : (0.30 + Math.random() * 0.28).toFixed(2);
    const blur  = (Math.random() * 0.6).toFixed(1);
    return `<span style="font-size:${sz}px;left:${left}%;filter:blur(${blur}px);font-family:'${fontName}',sans-serif;--dur:${dur}s;--delay:${delay}s;--r:${rot}deg;--op:${op}">${ch}</span>`;
  }).join('');
}

function injectAllFallingLetters() {
  document.querySelectorAll('.font-card .ch-fall').forEach(container => {
    const card = container.closest('.font-card');
    const nameEl = card.querySelector('.card-name');
    const fontName = nameEl ? nameEl.textContent.replace(/Community|New/gi,'').trim() : 'Aa';
    injectFallingLetters(card, fontName);
  });
}

let _fallingLettersTimer = null;
function injectAllFallingLettersDebounced(){
  clearTimeout(_fallingLettersTimer);
  _fallingLettersTimer = setTimeout(injectAllFallingLetters, 120);
  document.querySelectorAll('.font-card').forEach(card => {
    const nameEl = card.querySelector('.card-name');
    const fontName = nameEl ? nameEl.textContent.replace(/Community|New/gi,'').trim() : 'Aa';
    injectChaoticLetters(card, fontName);
  });
}

// Init badges on load
updateAdminMessagesBadge();

(function(){
  const btn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', function(){
    const show = window.scrollY > 400;
    btn.style.opacity = show ? '1' : '0';
    btn.style.pointerEvents = show ? 'auto' : 'none';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
  }, {passive:true});
})();

// ??????????????????????????????????????
// 1. TXT UPLOAD - bütün kartlarda preview
// ??????????????????????????????????????
let txtUploadActive = false;
function handleTxtUpload(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    const text = e.target.result.slice(0,200).replace(/\n/g,' ').trim();
    previewText = text;
    const pi = document.getElementById('previewText');
    if(pi) pi.value = text;
    document.querySelectorAll('.card-preview').forEach(el => el.textContent = text);
    document.getElementById('txtUploadLbl').textContent = '📄 ' + file.name.slice(0,14);
    document.getElementById('txtUploadLabel').style.color = 'var(--accent)';
    txtUploadActive = true;
    showToast('Text loaded - showing on all cards');
  };
  reader.readAsText(file);
  input.value = '';
}
function resetTxtUpload(){
  if(!txtUploadActive) return;
  previewText = '';
  const pi = document.getElementById('previewText');
  if(pi) pi.value = '';
  document.querySelectorAll('.card-preview').forEach(el => el.textContent = el.dataset.fontname || '');
  document.getElementById('txtUploadLbl').textContent = 'Text Upload';
  document.getElementById('txtUploadLabel').style.color = '';
  txtUploadActive = false;
  showToast('Text preview cleared');
}

// ??????????????????????????????????????
// 3. FONT PAIR MODAL
// ??????????????????????????????????????
let pairTheme = 'light';

function openPairModal(){
  document.body.style.overflow='hidden';
  const m = document.getElementById('pairModal');
  m.style.opacity='1';m.style.pointerEvents='all';m.style.visibility='visible';
  const hSel = document.getElementById('pairHeadingSelect');
  const bSel = document.getElementById('pairBodySelect');
  // Rebuild options every time so newly submitted/approved fonts appear
  const prevH = hSel.value || 'playfair-display';
  const prevB = bSel.value || 'inter';
  hSel.innerHTML = '';
  bSel.innerHTML = '';
  FONTS.forEach(f => {
    hSel.add(new Option(f.name, f.id));
    bSel.add(new Option(f.name, f.id));
  });
  hSel.value = prevH;
  bSel.value = prevB;
  // Init custom selects (first time) or refresh
  if(!document.getElementById('pairHeadingSelect__csel')){
    initCustomSelect('pairHeadingSelect','pair');
    initCustomSelect('pairBodySelect','pair');
  } else {
    refreshCustomSelect('pairHeadingSelect');
    refreshCustomSelect('pairBodySelect');
  }
  // Reset zoom
  const zs = document.getElementById('pairZoomSlider');
  if(zs){ zs.value=100; applyPairZoom(100); }
  renderPairPreview();
}
function closePairModal(){
  const _pm=document.getElementById('pairModal');_pm.style.opacity='0';_pm.style.pointerEvents='none';_pm.style.visibility='hidden';
  document.body.style.overflow='';
}
document.getElementById('pairModal').addEventListener('click', function(e){
  if(e.target === this) closePairModal();
});

function setPairTheme(t){
  pairTheme = t;
  const canvas = document.getElementById('pairPreviewCanvas');
  const hPrev = document.getElementById('pairHeadingPreview');
  const bPrev = document.getElementById('pairBodyPreview');
  const icon  = document.getElementById('pairThemeIcon');
  const btn   = document.getElementById('pairThemeToggleBtn');
  if(t === 'dark'){
    canvas.style.background = '#111';
    hPrev.style.color = '#fff';
    bPrev.style.color = '#aaa';
    // Show moon icon
    if(icon) icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    if(btn){ btn.style.background='#222'; btn.style.borderColor='#444'; btn.style.color='#fff'; }
  } else {
    canvas.style.background = '#fff';
    hPrev.style.color = '#111';
    bPrev.style.color = '#555';
    // Show sun icon
    if(icon) icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    if(btn){ btn.style.background=''; btn.style.borderColor=''; btn.style.color=''; }
  }
}

function togglePairTheme(){
  setPairTheme(pairTheme === 'dark' ? 'light' : 'dark');
}

function applyPairZoom(val){
  const zoom = parseInt(val) / 100;
  const hPrev = document.getElementById('pairHeadingPreview');
  const bPrev = document.getElementById('pairBodyPreview');
  const label = document.getElementById('pairZoomLabel');
  if(hPrev) hPrev.style.fontSize = (48 * zoom) + 'px';
  if(bPrev) bPrev.style.fontSize = (16 * zoom) + 'px';
  if(label) label.textContent = val + '%';
}

function renderPairPreview(){
  const hId = document.getElementById('pairHeadingSelect').value;
  const bId = document.getElementById('pairBodySelect').value;
  const txt = document.getElementById('pairCustomText').value || 'The quick brown fox';
  const hFont = FONTS.find(f=>f.id===hId);
  const bFont = FONTS.find(f=>f.id===bId);
  if(hFont) loadFont(hFont);
  if(bFont) loadFont(bFont);
  const hPrev = document.getElementById('pairHeadingPreview');
  const bPrev = document.getElementById('pairBodyPreview');
  if(hPrev && hFont){ hPrev.style.fontFamily = `'${hFont.name}',serif`; hPrev.textContent = txt; }
  if(bPrev && bFont){ bPrev.style.fontFamily = `'${bFont.name}',sans-serif`; }
}

// Pair modal açmaq üçün toolbar düym?si (h?m d? keyboard shortcut)
document.addEventListener('keydown', function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
  if(e.key==='p'||e.key==='P') openPairModal();
});


// ??????????????????????????????????????
// CUSTOM SELECT SYSTEM
// ??????????????????????????????????????
const _cselInstances = {};

function initCustomSelect(nativeId, variant) {
  // variant: 'toolbar' | 'form' | 'pair'
  const native = document.getElementById(nativeId);
  if (!native || document.getElementById(nativeId + '__csel')) return null;

  const wrap = document.createElement('div');
  wrap.className = 'csel' + (variant === 'form' ? ' csel-form' : variant === 'pair' ? ' csel-pair' : '');
  wrap.id = nativeId + '__csel';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'csel-btn';

  const drop = document.createElement('div');
  drop.className = 'csel-drop';

  // ?? Pair variant: axtaris inputu ??
  let searchInput = null;
  let searchTerm = '';
  if (variant === 'pair') {
    const searchWrap = document.createElement('div');
    searchWrap.style.cssText = 'padding:8px 10px 6px;position:sticky;top:0;background:var(--surface-solid);border-bottom:1px solid var(--border);z-index:1';
    searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search fonts.';
    searchInput.autocomplete = 'off';
    searchInput.style.cssText = 'width:100%;background:var(--surface3);border:1px solid var(--border2);border-radius:8px;padding:6px 10px 6px 30px;font-family:var(--sans);font-size:12px;color:var(--text);outline:none;box-sizing:border-box;transition:border-color .15s';
    searchInput.addEventListener('focus', () => { searchInput.style.borderColor = 'var(--accent)'; searchInput.style.boxShadow = '0 0 0 3px rgba(40,85,85,0.12)'; });
    searchInput.addEventListener('blur',  () => { searchInput.style.borderColor = ''; searchInput.style.boxShadow = ''; });
    // Axtaris ikonu
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    iconSvg.setAttribute('viewBox','0 0 24 24');
    iconSvg.setAttribute('width','12');
    iconSvg.setAttribute('height','12');
    iconSvg.setAttribute('fill','none');
    iconSvg.setAttribute('stroke','var(--text3)');
    iconSvg.setAttribute('stroke-width','2.2');
    iconSvg.setAttribute('stroke-linecap','round');
    iconSvg.style.cssText = 'position:absolute;left:20px;top:50%;transform:translateY(-50%);pointer-events:none';
    iconSvg.innerHTML = '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>';
    const iconWrap = document.createElement('div');
    iconWrap.style.cssText = 'position:relative';
    iconWrap.appendChild(iconSvg);
    iconWrap.appendChild(searchInput);
    searchWrap.appendChild(iconWrap);
    drop.appendChild(searchWrap);

    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value.toLowerCase();
      filterOptions();
    });
    // Dropdown içind?ki klikl?r üstünd? bubble etm?sin
    searchInput.addEventListener('mousedown', e => e.stopPropagation());
    searchInput.addEventListener('click',     e => e.stopPropagation());
    searchInput.addEventListener('keydown',   e => e.stopPropagation());
  }

  // Options konteyner (axtarisdan sonra siralanan hiss?)
  const optList = document.createElement('div');
  optList.className = 'csel-opt-list';
  optList.style.cssText = variant === 'pair' ? 'max-height:220px;overflow-y:auto' : '';
  drop.appendChild(optList);

  function getLabel() {
    const idx = native.selectedIndex;
    return idx >= 0 && native.options[idx] ? native.options[idx].text : '-';
  }

  function buildOptions() {
    optList.innerHTML = '';
    Array.from(native.options).forEach(opt => {
      if (!opt.value && variant !== 'form') return;
      const item = document.createElement('div');
      item.className = 'csel-opt' + (opt.value === native.value ? ' selected' : '');
      item.textContent = opt.text;
      item.dataset.val = opt.value;
      item.dataset.txt = opt.text.toLowerCase();
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        native.value = opt.value;
        native.dispatchEvent(new Event('change', { bubbles: true }));
        refreshBtn();
        closeMe();
      });
      optList.appendChild(item);
    });
    filterOptions();
  }

  function filterOptions() {
    optList.querySelectorAll('.csel-opt').forEach(el => {
      const match = !searchTerm || el.dataset.txt.includes(searchTerm);
      el.style.display = match ? '' : 'none';
    });
    // "N?tic? yoxdur" mesaji
    let noRes = optList.querySelector('.csel-no-result');
    const anyVisible = Array.from(optList.querySelectorAll('.csel-opt')).some(el => el.style.display !== 'none');
    if (!anyVisible) {
      if (!noRes) {
        noRes = document.createElement('div');
        noRes.className = 'csel-no-result';
        noRes.style.cssText = 'padding:10px 16px;font-size:12px;color:var(--text3);font-style:italic';
        noRes.textContent = 'No fonts found';
        optList.appendChild(noRes);
      }
    } else {
      if (noRes) noRes.remove();
    }
  }

  function refreshBtn() {
    const label = getLabel();
    btn.innerHTML = `<span>${label}</span><svg class="csel-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
    optList.querySelectorAll('.csel-opt').forEach(el => {
      el.classList.toggle('selected', el.dataset.val === native.value);
    });
  }

  function openMe() {
    document.querySelectorAll('.csel.open').forEach(c => { if (c !== wrap) { c.classList.remove('open'); c.querySelector('.csel-btn')?.classList.remove('open'); } });
    buildOptions();
    wrap.classList.add('open');
    btn.classList.add('open');
    // Pair: axtaris inputunu t?mizl? v? fokusla
    if (searchInput) {
      searchInput.value = '';
      searchTerm = '';
      filterOptions();
      setTimeout(() => searchInput.focus(), 60);
    }
  }

  function closeMe() {
    wrap.classList.remove('open');
    btn.classList.remove('open');
    if (searchInput) { searchInput.value = ''; searchTerm = ''; }
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.contains('open') ? closeMe() : openMe();
  });

  buildOptions();
  refreshBtn();
  wrap.appendChild(btn);
  wrap.appendChild(drop);

  native.style.display = 'none';
  native.parentNode.insertBefore(wrap, native);

  const inst = { refresh: () => { buildOptions(); refreshBtn(); } };
  _cselInstances[nativeId] = inst;
  return inst;
}

function refreshCustomSelect(id) {
  if (_cselInstances[id]) _cselInstances[id].refresh();
}

// Close all when clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.csel.open').forEach(c => {
    c.classList.remove('open');
    c.querySelector('.csel-btn')?.classList.remove('open');
  });
});

// Init toolbar selects immediately
document.addEventListener('DOMContentLoaded', () => {
  initCustomSelect('sortSel', 'toolbar');
  initCustomSelect('perPageSel', 'toolbar');
  initCustomSelect('sf-cat', 'form');
  initCustomSelect('sf-license', 'form');
  initCustomSelect('ef-cat', 'form');
  initCustomSelect('ef-license', 'form');
});

// Spin animation for AI loader
const aiStyle = document.createElement('style');
aiStyle.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(aiStyle);

/* ???????????????????????????????????????????????????
   MOBILE FIX - bütün mobil görünüs probleml?ri burada
   ??????????????????????????????????????????????????? */
(function(){
  const IS_MOBILE = () => window.innerWidth <= 768;

  /* ?? 1. Global mobil CSS injeksiyasi ?? */
  if(IS_MOBILE()){
    const s = document.createElement('style');
    s.textContent = `
      /* Ana grid kart preview */
      .card-preview { font-size: 36px !important; max-height: 88px !important; overflow:hidden !important; line-height:1.1 !important; }
      /* Charmap s?tri horizontal scroll */
      .card-charmap-set { flex-wrap:nowrap !important; overflow-x:auto !important; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
      .card-charmap-set::-webkit-scrollbar { display:none; }
      /* Toolbar: preview-wrap gizl?t */
      .preview-wrap { display:none !important; }
      /* Toolbar-right horizontal scroll */
      .toolbar-right { flex-wrap:nowrap !important; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
      .toolbar-right::-webkit-scrollbar { display:none; }
      /* Cats horizontal scroll */
      .cats { flex-wrap:nowrap !important; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
      .cats::-webkit-scrollbar { display:none; }
      /* Popularity chart: gizl?t */
      #fdpPopChart { display:none !important; }
      /* Similar fonts: horizontal scroll sira */
      #fdpSimilarFonts { display:flex !important; flex-direction:row !important; overflow-x:auto !important; -webkit-overflow-scrolling:touch; scrollbar-width:none; gap:10px !important; padding-bottom:8px; flex-wrap:nowrap !important; }
      #fdpSimilarFonts::-webkit-scrollbar { display:none; }
      #fdpSimilarFonts .font-card { flex:0 0 150px !important; min-width:150px !important; max-width:150px !important; margin-bottom:0 !important; }
      #fdpSimilarFonts .card-preview { font-size:22px !important; max-height:58px !important; }
      #fdpSimilarFonts .card-preview-area { min-height:68px !important; padding:12px 10px 10px !important; }
      #fdpSimilarFonts .card-name { font-size:11px !important; }
      #fdpSimilarFonts .card-author { font-size:9px !important; }
      #fdpSimilarFonts .card-header { padding:8px 8px 8px 10px !important; }
      #fdpSimilarFonts .card-footer { padding:5px 8px !important; }
      #fdpSimilarFonts .tag { font-size:8px !important; padding:1px 5px !important; }
      #fdpSimilarFonts .card-charmap { display:none !important; }
      #fdpSimilarFonts .dl-count { display:none !important; }
      #fdpSimilarFonts .icon-btn { width:22px !important; height:22px !important; }
      #fdpSimilarFonts .dl-btn { padding:3px 6px !important; font-size:9px !important; }
      /* Footer */ footer { padding:20px 12px; }
    `;
    document.head.appendChild(s);
  }

  /* ?? 2. openDetail çagrildiqda similar fonts layout-ini düz?lt ?? */
  const _origOpenDetail = window.openDetail;
  if(typeof _origOpenDetail === 'function'){
    window.openDetail = function(fontId){
      _origOpenDetail(fontId);
      if(!IS_MOBILE()) return;
      /* Render bitdikd?n sonra (setTimeout 0 il? növb? gözl?) */
      setTimeout(function(){
        /* Popularity chart: gizl?t */
        const chart = document.getElementById('fdpPopChart');
        if(chart) chart.style.setProperty('display','none','important');

        /* Similar fonts: flex sira */
        const sim = document.getElementById('fdpSimilarFonts');
        if(sim){
          sim.style.setProperty('display','flex','important');
          sim.style.flexDirection = 'row';
          sim.style.overflowX = 'auto';
          sim.style.flexWrap = 'nowrap';
          sim.style.gap = '10px';
          sim.style.paddingBottom = '8px';
          /* Parent padding-ini kompensasiya et */
          const par = sim.parentElement;
          if(par && par.style && par.style.padding){
            sim.style.marginLeft = '-14px';
            sim.style.marginRight = '-14px';
            sim.style.paddingLeft = '14px';
            sim.style.paddingRight = '14px';
          }
        }
      }, 80);
    };
  }
})();

(function(){
  if(window.innerWidth > 768) return;

  /* ?? Similar Fonts grid patch ?? */
  function patchSimilar(){
    var sim = document.getElementById('fdpSimilarFonts');
    if(!sim) return;
    sim.style.cssText += ';display:grid!important;grid-template-columns:1fr!important;flex-direction:unset!important;overflow-x:unset!important;flex-wrap:unset!important;margin-left:0!important;margin-right:0!important;padding-left:0!important;padding-right:0!important;gap:8px!important';
    sim.querySelectorAll('.font-card').forEach(function(c){
      c.style.cssText += ';flex:unset!important;min-width:unset!important;max-width:unset!important;width:100%!important';
    });
    sim.querySelectorAll('.card-preview').forEach(function(p){
      p.style.cssText += ';font-size:17px!important;max-height:24px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.35!important';
    });
  }
  /* ?? Hero banner: tund fon üz?rind?ki yazini kiçilt ?? */
  function patchHero(){    var banner = document.getElementById('heroBannerAuto');
    var txt = document.getElementById('heroBannerText');
    if(banner){
      banner.style.minHeight = '200px';
      banner.style.maxHeight = '220px';
      banner.style.overflow = 'hidden';
    }
    if(txt){
      txt.style.fontSize = '34px';
      txt.style.whiteSpace = 'nowrap';
      txt.style.overflow = 'hidden';
      txt.style.textOverflow = 'ellipsis';
      txt.style.wordBreak = 'normal';
      txt.style.maxWidth = '92%';
      txt.style.lineHeight = '1.15';
    }

    /* ?? A- / A+ düym?l?rin? touchstart+click qos ?? */
    var searchRoot2 = document.getElementById('heroBannerAuto') || document.getElementById('fdpHeroInner');
    if(searchRoot2 && !searchRoot2._zoomBtnsDone){
      searchRoot2._zoomBtnsDone = true;
      searchRoot2.querySelectorAll('button').forEach(function(btn){
        var t = btn.textContent.trim();
        if(t !== 'A-' && t !== 'A+') return;
        var delta = (t === 'A+') ? 16 : -16;
        function doZoom(e){
          e.preventDefault();
          e.stopPropagation();
          var b = document.getElementById('heroBannerText');
          if(!b) return;
          var cur = parseFloat(b.style.fontSize) || 48;
          var nv = Math.min(400, Math.max(16, cur + delta));
          b.style.fontSize = nv + 'px';
          var slider = (document.getElementById('fdpHeroInner')||document).querySelector('.hb-zoom') || document.querySelector('.hb-zoom');
          if(slider) slider.value = nv;
        }
        btn.addEventListener('touchstart', doZoom, {passive: false});
        btn.addEventListener('click', doZoom);
      });
    }

    /* ?? Add image labelini gizl?t ?? */
    if(banner){
      banner.querySelectorAll('label').forEach(function(lbl){ lbl.style.display = 'none'; });
    }
    var heroInner = document.getElementById('fdpHeroInner');
    if(heroInner){
      heroInner.querySelectorAll('label').forEach(function(lbl){ lbl.style.display = 'none'; });
    }

    /* ?? Overlay bar: pill-l?ri kiçilt, düzgün yerl?sdir ?? */
    var searchRoot = banner || heroInner;
    if(searchRoot){
      var overlayBar = searchRoot.querySelector('div[style*="position:absolute"][style*="bottom"]');
      if(!overlayBar){
        var ch = searchRoot.children;
        for(var i=0;i<ch.length;i++){
          if(getComputedStyle(ch[i]).position === 'absolute'){ overlayBar = ch[i]; break; }
        }
      }
      if(overlayBar){
        overlayBar.style.flexWrap = 'nowrap';
        overlayBar.style.gap = '5px';
        overlayBar.style.bottom = '8px';
        overlayBar.style.left = '8px';
        overlayBar.style.right = '8px';
        /* Bütün pill container-lari kiçilt */
        overlayBar.querySelectorAll('div[style*="border-radius:980px"], div[style*="border-radius: 980px"]').forEach(function(pill){
          pill.style.padding = '4px 8px';
          pill.style.gap = '5px';
        });
        /* Range input-lari kiçilt */
        overlayBar.querySelectorAll('input[type=range]').forEach(function(r){
          r.style.width = '52px';
        });
        /* Color dot kiçilt */
        var dot = overlayBar.querySelector('#heroBannerColorDot');
        if(dot){ dot.style.width = '8px'; dot.style.height = '8px'; }
      }
    }
  }
  // Expose patchHero globally so heroBannerUpload() can call it from outside this IIFE
  window.patchHero = patchHero;

  /* ?? Global zoom touch helper - passive:false üçün JS addEventListener lazimdir ?? */
  /* Bu funksiya artiq istifad? edilmir - patchHero JS listener qosur */
  window._zoomTouch = function(e, slider){
    /* fallback: attribute yolu il? çagirilarsa isl?t */
    e.stopPropagation();
    try { e.preventDefault(); } catch(ex){}
    var touch = e.touches && e.touches[0];
    if(!touch) return;
    var rect  = slider.getBoundingClientRect();
    var ratio = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    var min   = parseFloat(slider.min) || 16;
    var max   = parseFloat(slider.max) || 140;
    var val   = Math.round(min + ratio * (max - min));
    slider.value = val;
    var b = document.getElementById('heroBannerText');
    if(b) b.style.fontSize = val + 'px';
  };

  var _orig = window.openDetail;
  if(typeof _orig === 'function'){
    window.openDetail = function(id){ _orig(id); setTimeout(patchSimilar, 120); setTimeout(patchHero, 150); };
  }

  var _origReset = window.resetHeroBanner;
  if(typeof _origReset === 'function'){
    window.resetHeroBanner = function(){ _origReset(); setTimeout(patchHero, 50); };
  }

  /* ?? Live Preview font size - allow full range, just clip overflow ?? */
  window.addEventListener('load', function(){
    var pvWrap = document.getElementById('pvCanvasBg');
    if(pvWrap){
      pvWrap.style.overflowX = 'auto';
      pvWrap.style.overflowY = 'hidden';
      pvWrap.style.webkitOverflowScrolling = 'touch';
    }
    var canvas = document.getElementById('pvCanvas');
    if(canvas){
      canvas.style.minWidth = '0';
    }
    /* myFontsGrid inline margin-bottom-u sifirla */
    var mfg = document.getElementById('myFontsGrid');
    if(mfg){
      var obs = new MutationObserver(function(){
        mfg.querySelectorAll('[style*="margin-bottom"]').forEach(function(el){
          el.style.marginBottom = '0';
        });
      });
      obs.observe(mfg, { childList: true, subtree: false });
    }
  });

  /* ?? Hamburger menu: Submit Font + Auth ?? */
  var ICONS = {
    user: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    heart: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    fonts: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    plus: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    logout: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    signin: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>'
  };

  function mkItem(icon, label, onClick, cls){
    var b = document.createElement('button');
    b.className = 'mnav-item' + (cls ? ' '+cls : '');
    b.innerHTML = icon + label;
    b.addEventListener('click', function(e){ e.stopPropagation(); closeDrop(); onClick(); });
    return b;
  }

  function buildDrop(){
    drop.innerHTML = '';
    var user = window.currentUser;
    if(user){
      var info = document.createElement('div');
      info.className = 'mnav-user';
      info.innerHTML = '<div class="mnav-user-name">'+esc(user.name)+'</div><div class="mnav-user-email">'+esc(user.email)+'</div>';
      drop.appendChild(info);
      drop.appendChild(mkItem(ICONS.user, 'My Profile', function(){ if(typeof showProfile==='function') showProfile(); }));
      drop.appendChild(mkItem(ICONS.heart, 'Saved Fonts', function(){ if(typeof showProfile==='function') showProfile('saved'); }));
      drop.appendChild(mkItem(ICONS.fonts, 'My Submitted Fonts', function(){ if(typeof showProfile==='function') showProfile('myfonts'); }));
      var sep = document.createElement('div'); sep.className = 'mnav-sep'; drop.appendChild(sep);
    } else {
      drop.appendChild(mkItem(ICONS.signin, 'Sign In', function(){ if(typeof openAuthModal==='function') openAuthModal('login'); }));
      var sep = document.createElement('div'); sep.className = 'mnav-sep'; drop.appendChild(sep);
    }
    drop.appendChild(mkItem(ICONS.plus, 'Submit Font', function(){ if(typeof openSubmit==='function') openSubmit(); }, 'accent'));
    if(user){
      var sep2 = document.createElement('div'); sep2.className = 'mnav-sep'; drop.appendChild(sep2);
      drop.appendChild(mkItem(ICONS.logout, 'Sign Out', function(){ if(typeof fbLogout==='function') fbLogout(); }, 'danger'));
    }
  }

  function openDrop(){ buildDrop(); drop.classList.add('open'); }
  function closeDrop(){ drop.classList.remove('open'); }

  /* Hamburger button */
  var btn = document.createElement('button');
  btn.id = 'mobNavBtn';
  btn.setAttribute('aria-label', 'Menu');
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  btn.addEventListener('click', function(e){ e.stopPropagation(); drop.classList.contains('open') ? closeDrop() : openDrop(); });

  /* Dropdown */
  var drop = document.createElement('div');
  drop.id = 'mobNavDrop';
  document.addEventListener('click', closeDrop);

  window.addEventListener('DOMContentLoaded', function(){
    var navRight = document.querySelector('.nav-right');
    if(navRight) navRight.appendChild(btn);
    document.body.appendChild(drop);
  });
})();

// ── URL ROUTING: back/forward + deep link ────────────────────────────────────
(function(){
  // Browser-in öz scroll bərpasını deaktiv et - biz özümüz idarə edirik
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Grid scroll mövqeyini yadda saxla
  var _savedGridScroll = 0;
  window._saveGridScroll = function(){ _savedGridScroll = window.scrollY; };
  window._restoreGridScroll = function(){ setTimeout(function(){ window.scrollTo(0, _savedGridScroll); }, 50); };

  // Hər popstate-də açıq qalan overlay modalları bağlayan helper
  function _closeAllOverlayModals(){
    var ao=document.getElementById('authOverlay');
    if(ao&&ao.classList.contains('open')){ if(typeof closeAuthModal==='function') closeAuthModal(); }
    var sm=document.getElementById('submitModal');
    if(sm&&sm.classList.contains('open')){ if(typeof closeSubmit==='function') closeSubmit(); }
    var co=document.getElementById('contactOverlay');
    if(co&&co.classList.contains('open')){ if(typeof closeContactModal==='function') closeContactModal(); }
    var cmp=document.getElementById('compareModal');
    if(cmp&&cmp.classList.contains('open')){ if(typeof closeCompare==='function') closeCompare(); }
    var ef=document.getElementById('editFontModal');
    if(ef&&ef.classList.contains('open')){ if(typeof closeEditFont==='function') closeEditFont(); }
  }

  // Back / Forward düyməsi
  window.addEventListener('popstate', function(e){
    _closeAllOverlayModals();
    const path = location.pathname;
    const hash = location.hash;
    if(path.startsWith('/font/')){
      const fontId = decodeURIComponent(path.slice(6));
      if(typeof openDetail === 'function') openDetail(fontId);
    } else if(path.startsWith('/author/')){
      const author = decodeURIComponent(path.slice(8));
      if(typeof openAuthorPage === 'function') openAuthorPage(author);
    } else if(path.startsWith('/profile')){
      const tab = path.slice(9) || 'myfonts';
      if(typeof showProfile === 'function') showProfile(tab);
    } else if(path === '/admin'){
      if(typeof openAdminPanel === 'function') openAdminPanel();
    } else if(hash.startsWith('#font/')){
      const fontId = decodeURIComponent(hash.slice(6));
      if(typeof openDetail === 'function') openDetail(fontId);
    } else if(hash.startsWith('#author/')){
      const author = decodeURIComponent(hash.slice(8));
      if(typeof openAuthorPage === 'function') openAuthorPage(author);
    } else {
      // Grid — query params-dan state-i bərpa et
      _restoreMainView();
      if(typeof restoreFromUrl === 'function') restoreFromUrl();
      if(typeof window._restoreGridScroll === 'function') window._restoreGridScroll();
      // Açıq qalan panelləri bağla
      var ov=document.getElementById('adminPanelOverlay');
      if(ov && ov.style.display!=='none'){
        if(typeof closeAdminPanel==='function') closeAdminPanel(true);
        else {
          var dr=document.getElementById('adminPanelDrawer');
          ov.style.background='rgba(0,0,0,0)'; ov.style.backdropFilter='blur(0px)';
          if(dr){ dr.style.transform='translate(-50%,-50%) scale(0.96)'; dr.style.opacity='0'; }
          setTimeout(function(){ ov.style.display='none'; document.body.style.overflow=''; },300);
        }
      }
      var mov=document.getElementById('modPanelOverlay');
      if(mov && mov.style.display!=='none'){
        if(typeof closeModPanel==='function') closeModPanel(true);
      }
      var pm=document.getElementById('pairModal');
      if(pm && pm.style.opacity==='1'){
        if(typeof closePairModal==='function') closePairModal();
      }
    }
  });

  // Birbaşa link ilə giriş (link paylaşma)
  window.addEventListener('DOMContentLoaded', function(){
    const hash = location.hash;
    const path = location.pathname;
    // Font və ya author deep link
    var initFontId = null, initAuthor = null;
    if(path.startsWith('/font/')) initFontId = decodeURIComponent(path.slice(6));
    else if(path.startsWith('/author/')) initAuthor = decodeURIComponent(path.slice(8));
    else if(hash.startsWith('#font/')) initFontId = decodeURIComponent(hash.slice(6));
    else if(hash.startsWith('#author/')) initAuthor = decodeURIComponent(hash.slice(8));

    var waitFonts = function(cb, attempt){
      if(typeof FONTS !== 'undefined' && FONTS && FONTS.length){ cb(); }
      else if(attempt < 25){ setTimeout(function(){ waitFonts(cb, attempt+1); }, 150); }
      else { console.warn('waitFonts: FONTS 25 cəhddən sonra da hazır deyil, callback məcburi çağırılır'); cb(); }
    };

    if(initFontId){
      waitFonts(function(){ if(typeof openDetail==='function') openDetail(initFontId); }, 0);
    } else if(initAuthor){
      waitFonts(function(){ if(typeof openAuthorPage==='function') openAuthorPage(initAuthor); }, 0);
    } else if(path === '/admin'){
      waitFonts(function(){ if(typeof openAdminPanel==='function') openAdminPanel(); }, 0);
    } else if(path.startsWith('/profile')){
      var tab = path.slice(9) || 'myfonts';
      waitFonts(function(){ if(typeof showProfile==='function') showProfile(tab); }, 0);
    } else if(location.search){
      // Query params varsa grid state-ini bərpa et
      waitFonts(function(){ if(typeof restoreFromUrl==='function') restoreFromUrl(); }, 0);
    }
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      // Prioritet sırası: ən üstdəki (z-index yüksək) modal əvvəl bağlanır
      var pm = document.getElementById('pairModal');
      if(pm && pm.style.opacity === '1'){
        if(typeof closePairModal === 'function') closePairModal();
        return;
      }
      var em = document.getElementById('editFontModal');
      if(em && em.classList.contains('open')){
        if(typeof closeEditFont === 'function') closeEditFont();
        return;
      }
      var ao = document.getElementById('authOverlay');
      if(ao && ao.classList.contains('open')){
        if(typeof closeAuthModal === 'function') closeAuthModal();
        return;
      }
      var sm = document.getElementById('submitModal');
      if(sm && sm.classList.contains('open')){
        if(typeof closeSubmit === 'function') closeSubmit();
        return;
      }
      var co = document.getElementById('contactOverlay');
      if(co && co.classList.contains('open')){
        if(typeof closeContactModal === 'function') closeContactModal();
        return;
      }
      var cmp = document.getElementById('compareModal');
      if(cmp && cmp.classList.contains('open')){
        if(typeof closeCompare === 'function') closeCompare();
        return;
      }
      var adm = document.getElementById('adminPanelOverlay');
      if(adm && adm.style.display !== 'none'){
        if(typeof closeAdminPanel === 'function') closeAdminPanel();
        return;
      }
      var mod = document.getElementById('modPanelOverlay');
      if(mod && mod.style.display !== 'none'){
        if(typeof closeModPanel === 'function') closeModPanel();
        return;
      }
      // Shortcuts panel
      var sp = document.getElementById('shortcutsPanel');
      if(sp && sp.classList.contains('open')){
        sp.classList.remove('open');
        if(typeof shortcutsOpen !== 'undefined') shortcutsOpen = false;
        return;
      }
      // Font detail
      var fdp = document.getElementById('fontDetailPage');
      if(fdp && fdp.classList.contains('visible')){
        if(typeof closeDetail === 'function') closeDetail();
        return;
      }
      // Author page
      var ap = document.getElementById('authorPage');
      if(ap && ap.style.display !== 'none' && ap.style.display !== ''){
        if(typeof closeAuthorPage === 'function') closeAuthorPage();
        return;
      }
      // Profile page
      var pp = document.getElementById('profilePage');
      if(pp && pp.style.display !== 'none' && pp.style.display !== ''){
        if(typeof closeProfile === 'function') closeProfile();
        return;
      }
    }
  });

  function _restoreMainView(){
    if(typeof resetTxtUpload === 'function') resetTxtUpload();
    ['profilePage','authorPage'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display='none'; });
    var grid=document.getElementById('gridLayout');
    var fdp=document.getElementById('fontDetailPage');
    var tb=document.getElementById('toolbarBar');
    var hero=document.getElementById('heroSection');
    if(grid) grid.style.display='';
    if(fdp)  fdp.classList.remove('visible');
    if(tb)   tb.style.display='';
    if(hero) hero.style.display='';
    // Grid-i yenilə (renderFonts olmasa grid boş qalır)
    if(typeof renderFonts === 'function') renderFonts();
    window._restoreGridScroll();
  }
})();