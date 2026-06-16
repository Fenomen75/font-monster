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
// localStorage-da saxlanmış real data varsa dərhal yüklə (1 saatdan köhnədirsə istifadə etmə)
(function(){
  try{
    const raw=localStorage.getItem('fm_dl_counts');
    if(raw){
      const parsed=JSON.parse(raw);
      const cachedAt=parsed._cachedAt||0;
      const ONE_HOUR=60*60*1000;
      if(Date.now()-cachedAt<ONE_HOUR){
        // _cachedAt açarını silərək yalnız font saylarını götür
        const {_cachedAt:_,...counts}=parsed;
        Object.assign(DL_COUNTS,counts);
      } else {
        // Cache köhnədir — Firebase-dən yenidən yüklənəcək, local cache silinir
        localStorage.removeItem('fm_dl_counts');
      }
    }
  }catch(e){}
}());
window.DL_COUNTS = DL_COUNTS;

// yesterday counter-ni gecə yarısında sıfırla
let DL_YESTERDAY=_estimatedYesterdayDownloads();
(function(){
  try{
    const KEY='fm_yesterday_date';
    const todayStr=new Date().toDateString();
    const lastDate=localStorage.getItem(KEY);
    if(lastDate && lastDate!==todayStr){
      // Yeni gün — yesterday sıfırlanır (Firebase-dən yenidən gəlir)
      DL_YESTERDAY=_estimatedYesterdayDownloads();
    }
    localStorage.setItem(KEY,todayStr);
  }catch(e){}
}());
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

