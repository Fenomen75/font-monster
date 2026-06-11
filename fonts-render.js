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
    if(FONTS_BASE.find(b=>b.id===f.id)) return;
    // Restore fontData from its separate key if it was stored there
    if(f._hasFontData && !f.fontData){
      const stored=localStorage.getItem('fn_fontdata_'+f.id);
      if(stored) f.fontData=stored;
    }
    if(!f.pending) FONTS.push(f); // approved ? everyone sees
    else if(currentUser && f.submittedById===currentUser.id) FONTS.push(f); // pending ? only submitter
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
    if(currentUser){
      if(_isAdmin(currentUser) || currentUser.isModerator){
        const allPendingQ = query(collection(db,'submitted_fonts'), where('pending','==',true));
        const allPendingSnap = await getDocs(allPendingQ);
        pendingFonts = allPendingSnap.docs.map(d=>({id:d.id,...d.data()}));
      } else {
        const pendingQ = query(collection(db,'submitted_fonts'), where('submittedById','==',currentUser.id), where('pending','==',true));
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
    if(!FONTS_BASE.find(b=>b.id===f.id)&&!f.pending){
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
function toggleDark(){
  // theme-color meta-sını da yenilə
  setTimeout(function(){
    const tc = document.getElementById('metaThemeColor');
    if(tc){ const bg=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); if(bg) tc.setAttribute('content',bg); }
  }, 50);
  darkMode=!darkMode;
  document.documentElement.setAttribute('data-theme',darkMode?'dark':'');
  localStorage.setItem("tv_dark",darkMode?'1':'0');
  const icon=document.getElementById('darkIcon');
  if(darkMode){
    icon.innerHTML='<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" stroke="none"/>';
  } else {
    icon.innerHTML='<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  }
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
let _compareCloseTimer=null;
function openCompare(){
  const modal=document.getElementById('compareModal');
  // Cancel any pending close timeout to prevent race condition where
  // the timeout fires after openCompare and hides the modal unexpectedly
  if(_compareCloseTimer!==null){clearTimeout(_compareCloseTimer);_compareCloseTimer=null;}
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
  if(_compareCloseTimer!==null){clearTimeout(_compareCloseTimer);}
  _compareCloseTimer=setTimeout(()=>{ modal.style.display='none'; _compareCloseTimer=null; },300);
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
document.getElementById('cmpSize').oninput=renderCompareCols;
document.getElementById('cmpText').oninput=renderCompareCols;

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
  let list=FONTS.filter(f=>!f.pending||(currentUser&&f.submittedById===currentUser.id));
  if(activeCategory==="new")list=list.filter(isNewFont);
  else if(activeCategory!=="all")list=list.filter(f=>f.cat===activeCategory);
  if(activeLicenseFilter)list=list.filter(f=>f.license===activeLicenseFilter);
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
  return[...list].sort((a,b)=>b.popular-a.popular);
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
  if(activeTag) p.set('tag',activeTag);
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
  activeTag=p.get('tag')||'';
  currentPage=parseInt(p.get('page'))||1;
  const sort=p.get('sort')||'popular';
  // UI-ni sinxronlaşdır
  const si=document.getElementById('searchInput'); if(si) si.value=searchTerm;
  const ss=document.getElementById('sortSel'); if(ss){ ss.value=sort; if(typeof refreshCustomSelect==='function') refreshCustomSelect('sortSel'); }
  const ft=document.getElementById('freeToggle'); if(ft) ft.classList.toggle('free-active',freeOnly);
  document.querySelectorAll('.cat').forEach(b=>b.classList.toggle('active',b.dataset.cat===activeCategory));
  document.querySelectorAll('.sb-item[data-scat]').forEach(b=>b.classList.toggle('active',b.dataset.scat===activeCategory));
  document.querySelectorAll('.alpha-btn').forEach(b=>b.classList.toggle('active',b.textContent.trim()===(alphaFilter===''?'All':alphaFilter==='#'?'0-9':alphaFilter)));
  document.querySelectorAll('#tagList .sb-item').forEach(b=>b.classList.toggle('active',b.dataset.tag===activeTag));
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
  list.forEach((font,i)=>{
    loadFont(font);
    const card=document.createElement('div');card.className='font-card';
    card.style.animationDelay=`${Math.min(i*0.03,0.28)}s`;
    const isLiked=likedFonts.has(font.id),isCom=!FONTS_BASE.find(f=>f.id===font.id);
    const isNew=isNewFont(font);
    const top3ids=FONTS_BASE.slice().sort((a,b)=>(b.popular||0)-(a.popular||0)).slice(0,3).map(f=>f.id);
    const isHot=!isNew && !isCom && top3ids.includes(font.id);
    const txt=previewText||font.name;
    // For uploaded fonts with variants, use the FIRST variant (as user ordered them)
    const _cardVariant=(font.fontVariants&&font.fontVariants.length>0)?font.fontVariants[0]:null;
    const _cardFamily=_cardVariant?(_cardVariant._familyName||(font.name+' '+parseVariantStyle(_cardVariant.name||'').label)):font.name;
    const _cardWeight=_cardVariant?String(parseVariantStyle(_cardVariant.name||'').weight||font.weight||'400'):(font.weight||'400');
    const fs=`font-family:'${_cardFamily}',sans-serif;font-weight:${_cardWeight};font-size:${fontSize}px;`;
    const dlCount=DL_COUNTS[font.id]||0,isInCmp=compareFonts.includes(font.id);
    card.innerHTML=`
      <div class="card-header">
        <div class="card-header-shimmer"></div>
        <div class="ch-fall"></div>
        <div style="position:relative;z-index:2;flex:1;min-width:0">
          <div class="card-name">${esc(font.name)}${isCom?'<span class="community-badge">Community</span>':''}${isNew?'<span class="new-badge"><i class="new-badge-star">✦</i>New</span>':''}${isHot?'<span class="hot-badge"><i class="hot-badge-fire">🔥</i>Hot</span>':''}</div>
          <div class="card-author"><span onclick="event.stopPropagation();openAuthorPage('${esc(font.author)}')" style="cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${esc(font.author)}</span> · ${font.year}</div>
        </div>
        <div class="card-actions" style="position:relative;z-index:2">
          <div class="dl-count">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${fmtDlCount(dlCount)}
            <span style="opacity:0.45;font-size:9px;margin-left:2px;border-left:1px solid rgba(255,255,255,0.2);padding-left:5px" title="Yesterday downloads">yesterday +${fmtDlCount(DL_YESTERDAY[font.id]||0)}</span>
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
            onclick="event.stopPropagation();handleDownloadClick('${font.id}','${esc(font.name)}');return false;">
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
        <div class="tags">${font.tags.map(t=>`<span class="tag" style="cursor:pointer" onclick="event.stopPropagation();(function(tag){activeTag=tag;searchTerm='';document.getElementById('searchInput').value='';activeCategory='all';activeLicenseFilter=null;alphaFilter='';currentPage=1;document.querySelectorAll('#tagList .sb-item').forEach(function(b){b.classList.toggle('active',b.dataset.tag===tag);});document.querySelectorAll('.cat').forEach(function(b){b.classList.toggle('active',b.dataset.cat==='all');});document.querySelectorAll('.alpha-btn').forEach(function(b){b.classList.toggle('active',b.textContent.trim()==='All');});renderFonts();syncUrl(true);showToast('&#34;'+tag+'&#34; fonts');}('${esc(t)}'))" title="Filter by ${esc(t)}">${esc(t)}</span>`).join('')}</div>
        <div style="display:flex;align-items:center;gap:6px">
          ${(()=>{const r=getFontAvgRating(font.id);if(!r||r.count===0)return '';const full=Math.round(r.avg);return `<span style="color:#f5a623;font-size:10px;letter-spacing:0.5px" title="${r.avg.toFixed(1)} stars from ${r.count} review${r.count!==1?'s':''}">${'★'.repeat(full)}${'☆'.repeat(5-full)}</span><span style="font-size:10px;color:var(--text3)">${r.avg.toFixed(1)}</span>`;})()}
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
          ${(()=>{
            const uniq = _LANG_CACHE[font.id] || getFontLangs(font);
            return uniq.map((l,i)=>{const c=_LANG_COLORS[i%_LANG_COLORS.length];return`<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:980px;background:${c.bg};border:1px solid ${c.border};color:${c.text};letter-spacing:.02em;white-space:nowrap">${l}</span>`;}).join('')+`<span id="lang-count-${font.id}" style="font-size:9px;font-weight:600;color:var(--text3);white-space:nowrap;margin-left:3px">· .</span>`;
          })()}
        </div>
      </div>`;
    grid.appendChild(card);
  });

  // Batch lang detection AFTER all cards are in DOM - prevents 20 simultaneous fetches
  const _batchFonts = list.filter(f => !_LANG_CACHE[f.id]);
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
    // Çoxlu variant - ZIP kimi yükl?
    showToast(`⏳ ZIP hazirlanir.`);
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
    // Google Fonts fontu: gfamily parametri ilə birbaşa yüklə, səhifəyə aparmadan
    (async()=>{
      try{
        showToast(`⏳ ${fontName} yüklənir...`);
        const gf = font && font.gfamily ? font.gfamily : fontName.replace(/\s+/g,'+');
        // Google Fonts CSS2 API-dən font URL-lərini al
        const cssUrl = `https://fonts.googleapis.com/css2?family=${gf}&display=swap`;
        const cssRes = await fetch(cssUrl, {headers:{'User-Agent':'Mozilla/5.0'}});
        const cssText = await cssRes.text();
        // İlk src: url(...) tapılır
        const urlMatch = cssText.match(/src:\s*url\(([^)]+)\)/);
        if(urlMatch){
          const fontUrl = urlMatch[1].replace(/['"]/g,'');
          const fontRes = await fetch(fontUrl);
          const blob = await fontRes.blob();
          const ext = fontUrl.includes('.woff2') ? '.woff2' : fontUrl.includes('.woff') ? '.woff' : '.ttf';
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = fontName.replace(/\s+/g,'_') + ext;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(()=>URL.revokeObjectURL(a.href), 60000);
          showToast(`✅ ${fontName}${ext} yükləndi`);
        } else {
          // Fallback: Google Fonts download zip
          showToast(`⬇️ ${fontName} yüklənir...`);
          const a = document.createElement('a');
          a.href = `https://fonts.google.com/download?family=${encodeURIComponent(fontName)}`;
          a.download = fontName.replace(/\s+/g,'_') + '.zip';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }
      } catch(err){
        console.error('Font download error:', err);
        showToast(`⬇️ ${fontName} yüklənir...`);
        const a = document.createElement('a');
        a.href = `https://fonts.google.com/download?family=${encodeURIComponent(fontName)}`;
        a.download = fontName.replace(/\s+/g,'_') + '.zip';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }
    })();
  }
  if(window.fbIncrementDownload) window.fbIncrementDownload(fontId).catch(()=>{});
  // DL_COUNTS already incremented by incrementDownload() above â do NOT increment again here
  const card=document.querySelector(`#prev-${fontId}`)?.closest('.font-card');
  if(card){
    const c=card.querySelector('.dl-count');
    if(c)c.innerHTML=`<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>${fmtDlCount(DL_COUNTS[fontId])}`;
  }
}

function updateCounts(){
  ["all","sans-serif","serif","display","handwriting","monospace"].forEach(c=>{
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
  if(!currentUser){openAuthModal('login');showToast('Sign in to save fonts');return;}
  if(likedFonts.has(id)){
    likedFonts.delete(id);
    if(btn){btn.textContent='♡';btn.classList.remove('liked');btn.setAttribute('aria-label','Save font');btn.setAttribute('aria-pressed','false');}
    showToast('Removed from saved');
  } else {
    likedFonts.add(id);
    if(btn){btn.textContent='♥';btn.classList.add('liked');btn.setAttribute('aria-label','Saved – click to unsave');btn.setAttribute('aria-pressed','true');}
    showToast('❤️ Saved');
  }
  currentUser.saved=[...likedFonts];
  saveCurrentUser(currentUser);
  if(window.fbToggleSave){
    window.fbToggleSave(id).catch(e=>console.warn('fbToggleSave error:',e));
  } else {
    const users=getUsers();
    const idx=users.findIndex(u=>u.id===currentUser.id);
    if(idx>=0){users[idx].saved=currentUser.saved;saveUsers(users);}
  }
  const sc=document.getElementById('profileSavedCount');
  if(sc)sc.textContent=currentUser.saved.length;
  localStorage.setItem("tv_liked",JSON.stringify([...likedFonts]));
  const lb=document.getElementById('fdpLikeBtn');
  if(lb&&lb.dataset.id===id){lb.className='fdp-like'+(likedFonts.has(id)?' liked':'');lb.innerHTML=likedFonts.has(id)?'♥ Saved':'♡ Save';lb.setAttribute('aria-label',likedFonts.has(id)?'Saved – click to unsave':'Save font');lb.setAttribute('aria-pressed',likedFonts.has(id)?'true':'false');}
}

