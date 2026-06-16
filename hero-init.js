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
// localStorage-da keş varsa dərhal render et, yoxdursa skeleton göstər
var _hasDlCache=!!(function(){try{return localStorage.getItem('fm_dl_counts');}catch(e){}}());
if(_hasDlCache){
  renderFonts();
} else {
  (function(){
    var grid=document.getElementById('fontGrid');
    if(!grid) return;
    var skeletons='';
    for(var i=0;i<12;i++) skeletons+='<div class="font-card skeleton-card" style="background:var(--card);border-radius:12px;min-height:160px;opacity:0.5;animation:pulse 1.2s ease-in-out infinite alternate;"></div>';
    grid.innerHTML=skeletons;
    if(!document.getElementById('_skeletonStyle')){
      var st=document.createElement('style');st.id='_skeletonStyle';
      st.textContent='@keyframes pulse{from{opacity:0.35}to{opacity:0.6}}';
      document.head.appendChild(st);
    }
  }());
}
// Firebase-dən real data gəlir; keş varsa yalnız sıralama dəyişibsə render et
(function _waitFbAndLoadStats(attempt){
  if(window._fbDb && window._fbFns){
    var _orderBefore=_hasDlCache?Object.entries(DL_COUNTS).sort((a,b)=>b[1]-a[1]).slice(0,20).map(x=>x[0]).join():'';
    loadDownloadStatsCache().then(function(){
      var _orderAfter=Object.entries(DL_COUNTS).sort((a,b)=>b[1]-a[1]).slice(0,20).map(x=>x[0]).join();
      if(!_hasDlCache||_orderBefore!==_orderAfter) renderFonts();
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

