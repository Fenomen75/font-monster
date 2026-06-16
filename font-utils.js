
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

// ?? Parse weight & style from font filename (moved here from submit.js - needed at init time) ??
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
// ?? Inject one @font-face per variant with correct weight+style ??
function injectVariantFaces(font){
  if(!font.fontVariants||!font.fontVariants.length) return false;
  const fmt={'.ttf':'truetype','.otf':'opentype','.woff':'woff','.woff2':'woff2'};
  font.fontVariants.forEach((v,i)=>{
    if(!v.url) return;
    const vi=parseVariantStyle(v.name||'');
    const ext=v.ext||font.fontExt||'.otf';
    const f2=fmt[ext]||'opentype';
    const vFamily=font.name+' '+vi.label;
    v._familyName=vFamily;
    const vFamilyEsc=vFamily.replace(/'/g,"\\'");
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
