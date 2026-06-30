// ---- ASYNC FONTS_BASE LOADER ----
// fonts-data.js əvəzinə fonts-data.json async yüklənir.
// Bu, 7MB JS parse yükünü aradan qaldırır (JSON parse ~10x sürətlidir).
let FONTS_BASE = [];
let _fontsBaseReady = false;

function _fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal, cache: 'no-store' })
    .finally(() => clearTimeout(timer));
}

function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function _showFontsLoadError() {
  const el = document.getElementById('resultTitle');
  if (el) {
    el.innerHTML = 'Yüklənmədi. <a href="#" onclick="location.reload();return false;" style="color:var(--accent,#2a7);text-decoration:underline">Yenidən cəhd et</a>';
  }
  const grid = document.getElementById('fontGrid');
  if (grid) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3)">Fontlar yüklənmədi. Internet bağlantınızı yoxlayıb <a href="#" onclick="location.reload();return false;" style="color:var(--accent,#2a7);text-decoration:underline">səhifəni yeniləyin</a>.</div>';
  }
}

async function _loadFontsBase() {
  const MAX_ATTEMPTS = 4;
  const TIMEOUT_MS = 12000;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const resp = await _fetchWithTimeout('/fonts-data.json', TIMEOUT_MS);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      FONTS_BASE = await resp.json();
      _fontsBaseReady = true;
      window.FONTS_BASE = FONTS_BASE;
      _initWithFontsBase();
      return; // ugurlu - cixiriq
    } catch (e) {
      console.error(`fonts-data.json yüklənmədi (cəhd ${attempt}/${MAX_ATTEMPTS}):`, e);
      if (attempt < MAX_ATTEMPTS) {
        await _sleep(attempt * 1000); // 1s, 2s, 3s gecikme
      } else {
        _showFontsLoadError();
      }
    }
  }
}

_loadFontsBase();

// ---- [app.js lines 199-349] ----
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
let DL_COUNTS={};
let DL_YESTERDAY={};
let DL_IS_ESTIMATED={};

function _initWithFontsBase(){
  DL_COUNTS=_estimatedDownloadCounts();
  // localStorage-da saxlanmış real data varsa dərhal yüklə (1 saatdan köhnədirsə istifadə etmə)
  try{
    const raw=localStorage.getItem('fm_dl_counts');
    if(raw){
      const parsed=JSON.parse(raw);
      const cachedAt=parsed._cachedAt||0;
      const ONE_HOUR=60*60*1000;
      if(Date.now()-cachedAt<ONE_HOUR){
        const {_cachedAt:_,...counts}=parsed;
        Object.assign(DL_COUNTS,counts);
      } else {
        localStorage.removeItem('fm_dl_counts');
      }
    }
  }catch(e){}
  window.DL_COUNTS = DL_COUNTS;

  // yesterday counter-ni gecə yarısında sıfırla
  DL_YESTERDAY=_estimatedYesterdayDownloads();
  try{
    const KEY='fm_yesterday_date';
    const todayStr=new Date().toDateString();
    const lastDate=localStorage.getItem(KEY);
    if(lastDate && lastDate!==todayStr){
      DL_YESTERDAY=_estimatedYesterdayDownloads();
    }
    localStorage.setItem(KEY,todayStr);
  }catch(e){}

  // true => the count for this font is still the seeded estimate, not real data
  FONTS_BASE.forEach(f=>DL_IS_ESTIMATED[f.id]=!(DL_COUNTS[f.id]>0));
  window.DL_IS_ESTIMATED=DL_IS_ESTIMATED;

  // FONTS array-ni başlat
  FONTS=[...FONTS_BASE];
  window.FONTS_BASE = FONTS_BASE;

  // App-ı başlat — bütün digər scriptlər bu event-i dinləyir
  if(typeof window._appCoreReady === 'function') window._appCoreReady();
  document.dispatchEvent(new CustomEvent('fontsBaseReady'));
}

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
    try{
      const toStore=Object.assign({},DL_COUNTS,{_cachedAt:Date.now()});
      localStorage.setItem('fm_dl_counts',JSON.stringify(toStore));
    }catch(e){}
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
  // localStorage-u dərhal yenilə ki digər tab-lar köhnə data görməsin
  try{
    const toStore=Object.assign({},DL_COUNTS,{_cachedAt:Date.now()});
    localStorage.setItem('fm_dl_counts',JSON.stringify(toStore));
  }catch(e){}
  if(window._fbDb && window._fbFns){
    try{
      const {doc, setDoc, increment}=window._fbFns;
      // Write both total and today's rolling yesterday counter
      setDoc(doc(window._fbDb,'download_stats',id), {total:increment(1), yesterday:increment(1)}, {merge:true})
        .catch(e=>console.warn('download_stats write error:',e));
    }catch(e){console.warn('download_stats write error:',e);}
  }
}

let FONTS=[],activeCategory="all",searchTerm="",previewText="",fontSize=window.innerWidth<=768?38:100;
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
let activeLicenseFilter=null,activeSubsetFilter=null,compareFonts=[],recentlyViewed=[],activeCodeTab='css';
let activeTag='';
let shortcutsOpen=false,darkMode=false;

// ?? ADMIN helpers ??
// ---- [app.js lines 546-558] ----
function filterScript(subset){
  _ensureGridView();
  activeSubsetFilter=activeSubsetFilter===subset?null:subset;
  activeLicenseFilter=null;
  activeTag='';
  currentPage=1;
  searchTerm='';document.getElementById('searchInput').value='';
  document.querySelectorAll('#tagList .sb-item').forEach(b=>b.classList.remove('active'));
  const LABEL_MAP={'latin':'Latin','latin-ext':'Latin Extended','vietnamese':'Vietnamese','cyrillic':'Cyrillic','cyrillic-ext':'Cyrillic Extended','greek':'Greek','greek-ext':'Greek Extended','arabic':'Arabic','hebrew':'Hebrew','devanagari':'Devanagari'};
  renderFonts();
  showToast(activeSubsetFilter?`Showing ${LABEL_MAP[subset]||subset} fonts`:'Filter cleared');
  syncUrl(true);
}
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
// ---- [app.js lines 559-578] ----
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
// ---- [app.js lines 758-1283] ----
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
  if(!searchTerm){ // axtarış aktivdirsə kateqoriya filtrini tətbiq etmə - bütün kitabxanada axtarsın
    if(activeCategory==="new")list=list.filter(isNewFont);
    else if(activeCategory!=="all")list=list.filter(f=>f.cat===activeCategory);
  }
  if(activeLicenseFilter)list=list.filter(f=>activeLicenseFilter==='free'?['free','ofl','apache'].includes(f.license):f.license===activeLicenseFilter);
  if(activeSubsetFilter)list=list.filter(f=>getFontLangs(f).some(l=>l.toLowerCase().replace(/\s+/g,'-')===activeSubsetFilter));
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
  // Default (popular): yeni fontlar (son 3 gün) ilk növbədə, sonra download sayına görə
  const _THREE_DAYS=3*24*60*60*1000;
  const _isFresh=f=>{
    const t=Math.max(f.submittedAt?new Date(f.submittedAt).getTime():0, f.approvedAt?new Date(f.approvedAt).getTime():0);
    return t>0 && (Date.now()-t)<_THREE_DAYS;
  };
  return[...list].sort((a,b)=>{
    const freshDiff=(_isFresh(b)?1:0)-(_isFresh(a)?1:0);
    if(freshDiff!==0)return freshDiff;
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
  const base = 'https://font-monster.vercel.app';
  const title = opts.title || 'Font·Monster - Free Font Discovery';
  const desc = opts.description || 'Browse 1,900+ free fonts by category, style and license.';
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
    _metaDesc = 'Browse free ' + activeCategory + ' fonts — 1,900+ fonts on Font·Monster.';
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
  const {isLiked,isCom,isNew,isHot,txt,fs,dlCount,isInCmp}=opts;
  const ratingHTML=(()=>{
    const r=getFontAvgRating(font.id);
    if(!r||r.count===0)return '';
    const full=Math.round(r.avg);
    return `<span style="color:#f5a623;font-size:10px;letter-spacing:0.5px" title="${r.avg.toFixed(1)} stars from ${r.count} review${r.count!==1?'s':''}">${'★'.repeat(full)}${'☆'.repeat(5-full)}</span><span style="font-size:10px;color:var(--text3)">${r.avg.toFixed(1)}</span>`;
  })();
  const langHTML=(()=>{
    const uniq=_LANG_CACHE[font.id]||getFontLangs(font);
    return uniq.map((l,i)=>{const c=_LANG_COLORS[i%_LANG_COLORS.length];const sk=l.toLowerCase().replace(/\s+/g,'-');return`<span onclick="event.stopPropagation();filterScript('${sk}')" style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:980px;background:${c.bg};border:1px solid ${c.border};color:${c.text};letter-spacing:.02em;white-space:nowrap;cursor:pointer" data-tip="🌐 Filter by ${l} · see all fonts in this script">${l}</span>`;}).join('')+`<span id="lang-count-${font.id}" style="font-size:9px;font-weight:600;color:var(--text3);white-space:nowrap;margin-left:3px">· .</span>`;
  })();
  const tagsHTML=font.tags.map(t=>`<span class="tag" style="cursor:pointer" onclick="event.stopPropagation();(function(tag){activeTag=tag;searchTerm='';document.getElementById('searchInput').value='';activeCategory='all';activeLicenseFilter=null;alphaFilter='';currentPage=1;document.querySelectorAll('#tagList .sb-item').forEach(function(b){b.classList.toggle('active',b.dataset.tag===tag);});document.querySelectorAll('.cat').forEach(function(b){b.classList.toggle('active',b.dataset.cat==='all');});document.querySelectorAll('.alpha-btn').forEach(function(b){b.classList.toggle('active',b.textContent.trim()==='All');});renderFonts();syncUrl(true);showToast('&#34;'+tag+'&#34; fonts');}('${esc(t)}'))" data-tip="Filter by ${esc(t)}">${esc(t)}</span>`).join('');
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
        <div class="card-preview" id="prev-${font.id}" data-fontname="${esc(font.name)}" style="${fs}opacity:0;transition:opacity .15s">${esc(txt)}</div>
        <div class="card-glyph-strip">
          ${getWeights(font).slice(0,5).map(w=>`<span style="font-family:'${font.name}',sans-serif;font-weight:${w}">${WEIGHT_NAMES[parseInt(w)]||w}</span>`).join('<span class="cgs-dot">·</span>')}
        </div>
      </div>
      <div class="card-footer" onclick="openDetail('${font.id}')">
        <div class="tags"><span class="tag" style="background:var(--surface3);font-weight:600;color:var(--text2)">${cap(font.cat)}</span>${tagsHTML}</div>
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
  console.trace('renderFonts called');
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
    card.innerHTML=_buildCardHTML(font,{isLiked,isCom,isNew,isHot,txt,fs,dlCount,isInCmp});
    grid.appendChild(card);
  });

  // Font yüklənəndə preview-ləri göstər
  document.fonts.ready.then(function(){
    grid.querySelectorAll('.card-preview').forEach(function(el){ el.style.opacity='1'; });
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
        langWrap.innerHTML = langs.map((l,i)=>{const c=_LANG_COLORS[i%_LANG_COLORS.length];const sk=l.toLowerCase().replace(/\s+/g,'-');return`<span onclick="event.stopPropagation();filterScript('${sk}')" style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:980px;background:${c.bg};border:1px solid ${c.border};color:${c.text};letter-spacing:.02em;white-space:nowrap;cursor:pointer" data-tip="🌐 Filter by ${l} · see all fonts in this script">${l}</span>`;}).join('')+`<span id="lang-count-${font.id}" style="font-size:9px;font-weight:600;color:var(--text3);white-space:nowrap;margin-left:3px">· ${langs.length}+ languages</span>`;
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
    showToast(`⏳ ${fontName} hazırlanır...`);
    (async()=>{
      const ttfUrls=(typeof FONT_TTF_URLS!=='undefined')?FONT_TTF_URLS[font.id]:null;
      try{
        if(!ttfUrls || !ttfUrls.length) throw new Error('no-ttf-url');
        const cleanName=fontName.replace(/\s+/g,'_');
        const zip=new JSZip();
        const folder=zip.folder(cleanName);
        let okCount=0;
        await Promise.all(ttfUrls.map(async(url)=>{
          try{
            const res=await fetch(url);
            if(!res.ok) return;
            const buf=await res.arrayBuffer();
            const fname=decodeURIComponent(url.split('/').pop());
            folder.file(fname, buf);
            okCount++;
          }catch(e){ console.error('style file failed:', url, e); }
        }));
        if(okCount===0) throw new Error('all-files-failed');
        const blob=await zip.generateAsync({type:'blob'});
        const a=document.createElement('a');
        a.href=URL.createObjectURL(blob);
        a.download=`${cleanName}_fonts.zip`;
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(a.href),60000);
        showToast(`✅ ${fontName} yükləndi (${okCount} stil)`);
      }catch(err){
        console.error('Download failed:',err);
        if(ttfUrls && ttfUrls.length){
          // ZIP alınmadı - tək faylı birbaşa yüklə, AMMA heç vaxt yeni səhifə/tab açma
          const a=document.createElement('a');
          a.href=ttfUrls[0];
          a.download=decodeURIComponent(ttfUrls[0].split('/').pop())||(fontName.replace(/\s+/g,'_')+'.ttf');
          a.rel='noopener';
          document.body.appendChild(a);a.click();document.body.removeChild(a);
          showToast(`⬇ ${fontName} yüklənir...`);
        } else {
          showToast('⚠ Fayl tapılmadı');
        }
      }
    })();
  } else if(font && font.b2Url){
    showToast(`⏳ ${fontName} hazırlanır...`);
    (async()=>{
      try{
        const ext=font.b2Url.endsWith('.otf')?'.otf':'.ttf';
        const b2path=font.b2Url.replace('https://f005.backblazeb2.com/file/font-monster/','');
        const proxyUrl='https://gfont-proxy.uroboros130875.workers.dev/b2/'+b2path;
        const res=await fetch(proxyUrl);
        if(!res.ok) throw new Error('fetch failed');
        const buf=await res.arrayBuffer();
        const cleanName=fontName.replace(/\s+/g,'_');
        const zip=new JSZip();
        const folder=zip.folder(cleanName);
        folder.file(cleanName+ext,buf);
        const blob=await zip.generateAsync({type:'blob'});
        const a=document.createElement('a');
        a.href=URL.createObjectURL(blob);
        a.download=cleanName+'_font.zip';
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(a.href),60000);
        showToast(`✅ ${fontName} ZIP kimi yükləndi`);
      }catch(err){
        console.error(err);
        showToast('⚠ Yükləmə xətası');
      }
    })();
  } else if(font && (font.fontData || font.fontUrl)){
    showToast(`⏳ ZIP hazırlanır...`);
    (async()=>{
      try{
        const ext=font.fontExt||'.ttf';
        const href=font.fontUrl||font.fontData;
        const cleanName=fontName.replace(/\s+/g,'_');
        const zip=new JSZip();
        const folder=zip.folder(cleanName);
        const fileName=cleanName+ext;
        if(href.startsWith('data:')){
          const base64=href.split(',')[1];
          folder.file(fileName,base64,{base64:true});
        } else {
          const res=await fetch(href);
          const buf=await res.arrayBuffer();
          folder.file(fileName,buf);
        }
        const blob=await zip.generateAsync({type:'blob'});
        const a=document.createElement('a');
        a.href=URL.createObjectURL(blob);
        a.download=cleanName+'_font.zip';
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        setTimeout(()=>URL.revokeObjectURL(a.href),60000);
        showToast(`✅ ${fontName} ZIP kimi yükləndi`);
      }catch(err){
        console.error(err);
        const ext=font.fontExt||'.ttf';
        const href=font.fontUrl||font.fontData;
        const a=document.createElement('a');
        a.href=href;
        a.download=fontName.replace(/\s+/g,'_')+ext;
        document.body.appendChild(a);a.click();document.body.removeChild(a);
        showToast(`⬇️ Downloading ${fontName}${ext}.`);
      }
    })();
  } else if(font && font.affiliateUrl){
    // Faylı bizdə saxlamırıq (mes. CreativeFabrica) - affiliate linkinə yönləndir
    window.open(font.affiliateUrl,'_blank','noopener');
    showToast(`↗️ Redirecting to source for ${fontName}.`);
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
    const resp=await fetch(cssUrl,{headers:{'User-Agent':'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)'}});
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
    showToast('⚠ Download uğursuz oldu, yenidən cəhd edin.');
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
  debounceTimer=setTimeout(()=>{
    searchTerm=document.getElementById('searchInput').value.trim();
    currentPage=1;
    if(currentDetailFont) closeDetail(); // font detal sehifesindeyiksə, axtarış nəticəsini görmək üçün grid-ə qayıt
    renderFonts();
    syncUrl();
  },155);
}
// ---- [app.js lines 3397-3482] ----
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

