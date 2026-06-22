// ---- [app.js lines 457-509] ----
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
  const _fname=f.name;
  l.onload=function(){
    if(typeof _glyphCache!=='undefined'){Object.keys(_glyphCache).filter(k=>k.startsWith(_fname+'::')).forEach(k=>delete _glyphCache[k]);}
    document.fonts.ready.then(function(){
      if(typeof renderPvCanvas==='function') renderPvCanvas();
    });
  };
  document.head.appendChild(l);
}
// ---- [app.js lines 579-757] ----
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
// ---- [app.js lines 3952-4090] ----
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
  {code:'Cyrillic',label:'Cyrillic',chars:'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя',color:'#5856d6'},
  {code:'Cyrillic Ext',label:'Cyrillic Ext',chars:'ҐґЄєЇїІіЁёЎў',color:'#7c3aed'},
  {code:'Greek',label:'Greek',chars:'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω',color:'#007aff'},
  {code:'Vietnamese',label:'Vietnamese',chars:'ăâđêôơưĂÂĐÊÔƠƯ',color:'#10b981'},
  {code:'Arabic',label:'Arabic',chars:'ابتثجحخدذرزسشصضطظعغفقكلمنهوي',color:'#34c759'},
  {code:'Hebrew',label:'Hebrew',chars:'אבגדהוזחטיכלמנסעפצקרשת',color:'#ff9500'},
  {code:'Devanagari',label:'Devanagari',chars:'अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह',color:'#e11d48'},
  {code:'Digits',label:'Digits',chars:'0123456789',color:'#8e8e93'},
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
      const ok=supported.some(s=>s===lang.code||s===lang.label);
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
// ---- [app.js lines 4091-4803] ----
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

// Firebase auth (isAdmin) gec ge?ldikd? - s?hif? art?q a??q olsa - header-i (Edit
// dü?m?si daxil) yenid?n ?qmir, sad?c? yenid?n ?ks etdirir. He? bir preview/state
// resetl?nmir, ona gör? openDetail-? bax?lmadan a?r?ca saxlan?l?b.
function refreshDetailHeaderForAuth(){
  if(!currentDetailFont) return;
  const fdp = document.getElementById('fontDetailPage');
  if(!fdp || !fdp.classList.contains('visible')) return;
  const font = currentDetailFont;
  const licM = LICENSE_META[font.license] || {label:font.license, cls:'lic-demo'};
  const dlCount = DL_COUNTS[font.id] || 0;
  _detailRenderHeader(font, dlCount, licM);
}

// Weight sözlərini font adından sil: "Roboto Mono Bold" → "Roboto Mono"
function _stripW(n){ return n.replace(/\b(thin|extralight|extra\s*light|light|regular|medium|semibold|semi\s*bold|bold|extrabold|extra\s*bold|black|heavy|italic|oblique|\d{3})\b/gi,'').replace(/\s+/g,' ').trim(); }

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
  // font.name-i deyil, düzgün CSS family adını işlət (məs: "Roboto Mono" not "Roboto Mono Bold")
  const _hbAv = font.fontVariants && font.fontVariants[0];
  const _hbGBase = font.gfamily ? (font.gfamily.split(':')[0].replace(/\+/g,' ')) : null;
  const _hbFamily = (_hbAv && _hbAv._familyName) || _hbGBase || (font.fontVariants&&font.fontVariants.length>0?_stripW(font.name):font.name);

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
          font-family:'${esc(_hbFamily)}',sans-serif;
          font-weight:${font.weight};
          font-size:72px;
          color:${pal.text};
          line-height:1.1;letter-spacing:-0.03em;
          user-select:none;text-align:center;
          word-break:break-word;white-space:normal;
          width:90%;max-width:90%;min-width:0;overflow:visible;
          display:block;/*-webkit-line-clamp:2*/;-webkit-box-orient:vertical;
          transition:font-size .1s;
        ">${esc(previewText||_hbFamily)}</div>
        <div style="position:absolute;bottom:12px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <!-- Zoom slider -->
            <div style="display:flex;align-items:center;gap:6px;padding:5px 11px;border-radius:980px;">
              <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);font-family:inherit;">A</span>
              <input type="range" class="hb-zoom" min="16" max="600" value="72" step="4"
                oninput="(function(v){var b=document.getElementById('heroBannerText');if(b)b.style.fontSize=v+'px';})(this.value)">
              <span style="font-size:15px;font-weight:700;color:rgba(255,255,255,0.6);font-family:inherit;">A</span>
            </div>
          <!-- Bg color -->
            <label style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:980px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);cursor:pointer;" data-tip="Background color">
              <span style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.6);font-family:inherit;">BG</span>
              <input type="color" value="#0a0a0a" style="width:18px;height:18px;border:none;border-radius:50%;padding:0;cursor:pointer;background:none;" oninput="(function(v){const b=document.getElementById('heroBannerAuto');if(b)b.style.background=v;})(this.value)">
            </label>
            <!-- Font color -->
            <label style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:980px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);cursor:pointer;" data-tip="Text color">
              <span style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.6);font-family:inherit;">Text</span>
              <input type="color" value="#ffffff" style="width:18px;height:18px;border:none;border-radius:50%;padding:0;cursor:pointer;background:none;" oninput="(function(v){const t=document.getElementById('heroBannerText');if(t)t.style.color=v;})(this.value)">
            </label>
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
  // beforeinput: dəstəklənməyən hərfləri bloklayıb warning göstər
  const inp=document.getElementById('fdpPvInput');
  if(inp){
    inp.setAttribute('autocomplete','off');
    inp.removeAttribute('name');
  }
  if(inp&&!inp._scriptGuardBound){
    inp._scriptGuardBound=true;
    const SCRIPT_RANGES={
      'Cyrillic':/[\u0400-\u04FF]/,
      'Greek':/[\u0370-\u03FF]/,
      'Arabic':/[\u0600-\u06FF]/,
      'Hebrew':/[\u0590-\u05FF]/,
      'Devanagari':/[\u0900-\u097F]/,
      'Chinese':/[\u4E00-\u9FFF]/,
      'Japanese':/[\u3040-\u30FF]/,
      'Korean':/[\uAC00-\uD7AF]/,
    };
    inp.addEventListener('beforeinput',function(e){
      if(!e.data||!currentDetailFont)return;
      const detectedScripts=Object.entries(SCRIPT_RANGES)
        .filter(([,re])=>re.test(e.data))
        .map(([name])=>name);
      if(!detectedScripts.length)return;
      // Həmişə əvvəlcə e.preventDefault() et (sinxron olmalıdır)
      // Sonra async yoxla: dəstəklənirsə özümüz daxil edirik, dəstəklənmirsə warning göstəririk
      e.preventDefault();
      const insertData=e.data;
      const start=inp.selectionStart, end=inp.selectionEnd;
      resolveFontLangs(currentDetailFont,langs=>{
        const unsupported=detectedScripts.filter(sc=>!langs.some(s=>s===sc||s.startsWith(sc)));
        if(unsupported.length){
          _showPvScriptWarning(unsupported.join(', '),langs);
        } else {
          // Şrift bu skripti dəstəkləyir — preventDefault elədiyimiz üçün hərfi özümüz daxil edirik
          const val=inp.value;
          inp.value=val.slice(0,start)+insertData+val.slice(end);
          const newPos=start+insertData.length;
          inp.setSelectionRange(newPos,newPos);
          inp.dispatchEvent(new Event('input',{bubbles:true}));
          if(typeof renderPvCanvas==='function')renderPvCanvas();
        }
      });
    });
  }
  // Reset controls
  document.getElementById('fdpPvInput').value=previewText||_stripW(font.name);
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
  const weights=getWeights(font);const pvTxt=previewText||_stripW(font.name);
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
  sampleEl.textContent=previewText||_stripW(font.name);
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
  // Şrift gec yüklən? bil?r (xüsusil? monospace/code şriftl?ri) - tam yükl?n?nd?n sonra
  // preview-u bir d? render et ki, glyph yoxlamasi düzgün n?tic? versin (səhv "?" görünməsin)
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(()=>{ if(currentDetailFont) renderPvCanvas(); });
  }

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
// ---- [app.js lines 5417-5563] ----
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
