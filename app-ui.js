// ---- [app.js lines 520-539] ----
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
// ---- [app.js lines 540-545] ----
function toggleShortcuts(){
  shortcutsOpen=!shortcutsOpen;
  document.getElementById('shortcutsPanel').classList.toggle('open',shortcutsOpen);
}

// LICENSE FILTER
// ---- [app.js lines 3483-3616] ----
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

// ---- [app.js lines 3792-3951] ----
function _detectInputScript(txt){
  if(!txt)return[];
  const found=[];
  if(/[\u0400-\u04FF]/.test(txt))found.push('Cyrillic');
  if(/[\u0370-\u03FF]/.test(txt))found.push('Greek');
  if(/[\u0600-\u06FF]/.test(txt))found.push('Arabic');
  if(/[\u0590-\u05FF]/.test(txt))found.push('Hebrew');
  if(/[\u0900-\u097F]/.test(txt))found.push('Devanagari');
  if(/[\u4E00-\u9FFF]/.test(txt))found.push('Chinese');
  if(/[\u3040-\u30FF]/.test(txt))found.push('Japanese');
  if(/[\uAC00-\uD7AF]/.test(txt))found.push('Korean');
  return found;
}
function _showPvScriptWarning(script, supported){
  const canvas=document.getElementById('pvCanvas');
  if(!canvas||!script)return;
  {
    if(canvas._warnActive)return;
    canvas._warnActive=true;
    const sz=parseInt((document.getElementById('fdpSizeRange')||{}).value)||56;
    const warnSz=Math.max(16,Math.min(sz,40));
    const pvBgEl=document.getElementById('pvCanvasBg');
    const pvBg=pvBgEl?pvBgEl.style.background:'';
    const isDark=pvBg&&(pvBg.includes('1a1a1a')||pvBg.includes('1e3a5f')||pvBg.includes('2d0a3e'));
    const warnColor=isDark?'rgba(255,70,70,0.95)':'rgba(200,30,30,0.9)';
    const msg='This font does not support '+script;
    const wrap=document.createElement('div');
    wrap.style.cssText=`display:flex;align-items:center;justify-content:center;width:100%;padding:24px 28px;box-sizing:border-box;font-family:var(--sans);font-size:${warnSz}px;font-weight:600;color:${warnColor};`;
    canvas.innerHTML='';
    canvas.appendChild(wrap);
    [...msg].forEach(ch=>{
      const s=document.createElement('span');
      s.textContent=ch;
      s.style.cssText='display:inline-block;opacity:0;transform:translateY(6px);transition:none;white-space:pre';
      wrap.appendChild(s);
    });
    const spans=wrap.querySelectorAll('span');
    spans.forEach((s,i)=>{
      setTimeout(()=>{
        s.style.transition='opacity 0.08s ease, transform 0.08s ease';
        s.style.opacity='1';
        s.style.transform='translateY(0)';
      }, i*45);
    });
    const typeEnd=spans.length*45+400;
    setTimeout(()=>{
      const order=[...Array(spans.length).keys()];
      for(let k=order.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[order[k],order[j]]=[order[j],order[k]];}
      order.forEach((idx,i)=>{
        setTimeout(()=>{
          spans[idx].style.transition='opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease';
          spans[idx].style.opacity='0';
          spans[idx].style.transform='translateY(-20px) scale(0.8)';
          spans[idx].style.filter='blur(4px)';
        },i*40);
      });
      setTimeout(()=>{
        canvas._warnActive=false;
        if(typeof renderPvCanvas==='function')renderPvCanvas();
      }, order.length*40+600);
    }, typeEnd);
  }
}

// ---- Glyph-level missing-character detection (no default-font fallback) ----
const _glyphCache = {}; // fontFamily -> { char: boolean }
const _glyphDefaultWidths = {}; // char -> width rendered with a font that can never exist
const _glyphSentinel = 'serif';
let _glyphMeasureCanvas = null;
function _getGlyphCanvas(){
  if(!_glyphMeasureCanvas) _glyphMeasureCanvas = document.createElement('canvas');
  return _glyphMeasureCanvas;
}
function _glyphSupported(fontFamily, ch, fontWeight){
  if(!ch || ch===' ' || ch==='\n' || ch==='\t' || ch==='\r') return true;
  // Şrift hələ brauzerd? yükl?nm?yibs? (document.fonts.check yalan qaytarir),
  // canvas test? f?rqi heç ölçm?y? bilm?z v? h?r h?rfi "yoxdur" kimi g?stər?r.
  // Bu halda yoxlamani keç - h?rfi DƏSTƏKLƏNİR kimi qaytar (f?rz: yükl?n?nd?n sonra renderPvCanvas yenid?n ç?k?c?k).
  try{
    if(typeof document!=='undefined' && document.fonts && document.fonts.check){
      if(!document.fonts.check(`${fontWeight||'400'} 16px '${fontFamily}'`)) return true;
    }
  }catch(e){}
  const _cacheKey = fontFamily+'::'+( fontWeight||'400');
  if(!_glyphCache[_cacheKey]) _glyphCache[_cacheKey] = {};
  if(ch in _glyphCache[_cacheKey]) return _glyphCache[_cacheKey][ch];
  const ctx = _getGlyphCanvas().getContext('2d');
  const size = 72;
  if(!(ch in _glyphDefaultWidths)){
    ctx.font = `${size}px ${_glyphSentinel}`;
    _glyphDefaultWidths[ch] = ctx.measureText(ch).width;
  }
  ctx.font = `${fontWeight||'400'} ${size}px '${fontFamily}', ${_glyphSentinel}`;
  const testWidth = ctx.measureText(ch).width;
  const supported = Math.abs(testWidth - _glyphDefaultWidths[ch]) > 0.01;
  _glyphCache[_cacheKey][ch] = supported;
  return supported;
}
function sanitizeGlyphs(txt, fontFamily, fontWeight){
  if(!txt) return txt;
  let out = '';
  for(const ch of txt){
    out += _glyphSupported(fontFamily, ch, fontWeight) ? ch : '';
  }
  return out;
}

function renderPvCanvas(){
  if(!currentDetailFont)return;
  const font=currentDetailFont;
  const canvas=document.getElementById('pvCanvas');
  const _rawInput=document.getElementById('fdpPvInput').value;
  const txt=_rawInput; // empty stays empty — no font.name fallback

  const sz=parseInt(document.getElementById('fdpSizeRange').value)||56;
  // Reset any inline padding overrides
  canvas.style.paddingBottom='';
  canvas.style.paddingTop='';
  const ls=parseFloat(document.getElementById('pvLS').value)||0;
  const lh=parseFloat(document.getElementById('pvLH').value)||1.15;
  document.getElementById('pvLSVal').textContent=ls+'px';
  document.getElementById('pvLHVal').textContent=lh;
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
  const _av=font.fontVariants&&font.fontVariants[activeDetailVariantIdx||0];
  const _hasVariants=font.fontVariants&&font.fontVariants.length>0;
  const _gBase=font.gfamily?(font.gfamily.split(':')[0].replace(/\+/g,' ')):null;
  // fontVariants: _familyName + weight; gfamily: base ad + weight; custom: font.name + normal
  // Variant font (məs: "Roboto Mono Bold" != "Roboto Mono"): font.name ilə @font-face inject edilib, onu işlət
  const _isVariant=_gBase&&font.name!==_gBase&&!_hasVariants;
  const _pvFamily=(_av&&_av._familyName)||(_isVariant?font.name:(_gBase||font.name));
  const fontWeight=pvBold?'bold':(_hasVariants||_gBase?activeDetailWeight:'normal');
  // Banner mətn sinxronu - _pvFamily-dən sonra, düzgün family adı ilə
  // sanitizeGlyphs ilə filtrlənir ki, aşağıdaki canvas ilə eyni nəticəni göstərsin
  // (dəstəklənməyən hərflər - məs. Ə latın əsaslı fontlarda - hər iki yerdə silinsin)
  const bannerTxt=document.getElementById('heroBannerText');
  if(bannerTxt) bannerTxt.textContent=(txt?sanitizeGlyphs(txt,_pvFamily,fontWeight):'')||_pvFamily;
  const bs=`font-family:'${_pvFamily}',sans-serif;font-weight:${fontWeight};font-style:${fontStyle};letter-spacing:${ls}px;color:${pvTextColor};`;
  document.querySelectorAll('.wt-sample').forEach(el=>el.textContent=txt||font.name);

  if(pvMode==='text'){
    if(!txt){canvas.innerHTML='';return;}
    const safeTxt=sanitizeGlyphs(txt,_pvFamily,fontWeight);
    canvas.innerHTML=`<div style="${bs}font-size:${sz}px;line-height:${Math.max(lh,1.4)};text-align:${pvAlign};word-break:break-word;padding-bottom:0.25em;width:100%">${esc(safeTxt)}</div>`;
  } else if(pvMode==='waterfall'){
    const wfSizes=[10,12,14,18,24,32,48,64,80,96];
    const wfTxt=sanitizeGlyphs(txt||font.name,_pvFamily,fontWeight);
    const sepColor=pvBgColor==='#1a1a1a'||pvBgColor==='#1e3a5f'||pvBgColor==='#2d0a3e'?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
    canvas.style.padding='6px 0';
    const wf=document.createElement('div');wf.className='pv-wf';
    wfSizes.forEach(s=>{
      const row=document.createElement('div');row.className='pv-wf-row';
      row.style.borderBottomColor=sepColor;
      row.innerHTML=`<span class="pv-wf-sz" style="color:${pvTextColor};opacity:.4">${s}</span><span class="pv-wf-txt" style="${bs}font-size:${s}px;line-height:1.3">${esc(wfTxt)}</span>`;
      wf.appendChild(row);
    });
    canvas.innerHTML='';canvas.appendChild(wf);
  } else if(pvMode==='paragraph'){
    const paraTxt=sanitizeGlyphs(txt||font.name,_pvFamily,fontWeight);
    const bodySize=Math.max(14,Math.min(sz,22));
    canvas.innerHTML=`<div class="pv-para" style="${bs}text-align:${pvAlign}">
      <strong style="${bs}font-size:${sz}px;line-height:1.1;display:block;margin-bottom:14px;font-weight:700">${esc(paraTxt)}</strong>
      <span style="font-size:${bodySize}px;line-height:${lh}">${LOREM}</span>
    </div>`;
  } else if(pvMode==='pairs'){
    const pairsTxt=sanitizeGlyphs(txt||font.name,_pvFamily,fontWeight);
    const bodySize=Math.max(13,Math.round(sz*0.3));
    canvas.innerHTML=`<div class="pv-pairs">
      <div style="${bs}font-size:${sz}px;line-height:1.1;font-weight:700;text-align:${pvAlign};margin-bottom:12px">${esc(pairsTxt)}</div>
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

// ---- [app.js lines 5280-5416] ----
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
    closeSubmit();closeContactModal();closeReportModal();closeCompare();
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

function _shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function renderTagList(tags){
  tagList.innerHTML='';
  tags.slice(0,15).forEach(tag=>{
    const d=document.createElement('div');d.className='sb-item';d.textContent=tag;d.dataset.tag=tag;
    if(activeTag===tag)d.classList.add('active');
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
}

renderTagList(_shuffle(allTags));

function updateTagsForFont(font){
  if(!font||!font.tags||!font.tags.length)return;
  const rest=_shuffle(allTags.filter(t=>!font.tags.includes(t)));
  renderTagList([...font.tags,...rest]);
}
window._updateTagsForFont=updateTagsForFont;

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
  // FONTS_BASE async yüklənir — hazır olanda render et
  document.addEventListener('fontsBaseReady', function(){ renderFonts(); }, {once:true});
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
  // Skeleton path: FONTS_BASE hazır olanda render et
  document.addEventListener('fontsBaseReady', function(){ renderFonts(); }, {once:true});
}
// Firebase-dən real data gəlir; keş varsa yalnız sıralama dəyişibsə render et
(function _waitFbAndLoadStats(attempt){
  if(window._fbDb && window._fbFns){
    var _orderBefore=_hasDlCache?Object.entries(DL_COUNTS).sort((a,b)=>b[1]-a[1]).slice(0,20).map(x=>x[0]).join():'';
    loadDownloadStatsCache().then(function(){
      var _orderAfter=Object.entries(DL_COUNTS).sort((a,b)=>b[1]-a[1]).slice(0,20).map(x=>x[0]).join();
      // FONTS_BASE hazır deyilsə render-i gözlə
      if(!_hasDlCache||_orderBefore!==_orderAfter){
        if(_fontsBaseReady){ renderFonts(); }
        else{ document.addEventListener('fontsBaseReady', function(){ renderFonts(); }, {once:true}); }
      }
      loadRatingsCache();
    });
  } else if(attempt < 40){
    setTimeout(function(){ _waitFbAndLoadStats(attempt+1); }, 250);
  } else {
    // Firebase yoxdur — FONTS_BASE hazır olanda render et
    if(_fontsBaseReady){ renderFonts(); }
    else{ document.addEventListener('fontsBaseReady', function(){ renderFonts(); }, {once:true}); }
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
// ---- [app.js lines 5706-5717] ----
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
// ---- [app.js lines 5718-5796] ----
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
if(typeof updateAdminReportsBadge==='function') updateAdminReportsBadge();

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
// ---- [app.js lines 5797-5829] ----
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
// ---- [app.js lines 5830-5931] ----
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
// ---- [app.js lines 5932-6113] ----
const _cselInstances = {};

// csel-drop-up: dropdown yuxarı deyil aşağı açılsın
(function(){
  if(document.getElementById('_csel_dir_style')) return;
  const s=document.createElement('style');
  s.id='_csel_dir_style';
  s.textContent='.csel-drop{top:100%;bottom:auto;}.csel-drop-up{top:auto!important;bottom:100%!important;}';
  document.head.appendChild(s);
})();

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
    // Dropdown istiqamətini müəyyən et: yuxarıda yer varsa yuxarı, yoxsa aşağı aç
    drop.classList.remove('csel-drop-up');
    const rect = wrap.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropH = drop.scrollHeight || 220;
    if (spaceBelow < dropH + 8 && rect.top > spaceBelow) {
      drop.classList.add('csel-drop-up');
    }
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
  initCustomSelect('rp-reason', 'form');
});

// Spin animation for AI loader
// ---- [app.js lines 6114-6605] ----
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
    // Sadə ana səhifə üçün renderFonts buradan çağırılmır —
    // _waitFbAndLoadStats (yuxarıda) artıq render edir. İkinci render flicker yaradırdı.
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
// ---- Page-load intro animasiyası: hərflər uçaraq "Font·Monster" sözünü əmələ gətirir ----
// Sessiya başına 1 dəfə göstərilir (sessionStorage), reduced-motion-da skip olunur.
function _showFmIntro(){
  try{
    if(sessionStorage.getItem('fm_intro_shown')) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      sessionStorage.setItem('fm_intro_shown','1');
      return;
    }
  }catch(e){ return; }
  sessionStorage.setItem('fm_intro_shown','1');

  const word = 'Font·Monster';
  const fonts = ['Playfair Display','Poppins','Bebas Neue','Space Grotesk','Pacifico','Righteous','Fraunces','Unbounded','Cinzel','Caveat','Orbitron','Lilita One','Quicksand'];
  const styles = [
    {weight:700, italic:false}, {weight:400, italic:true}, {weight:800, italic:false},
    {weight:500, italic:false}, {weight:600, italic:true}, {weight:900, italic:false}
  ];

  const overlay = document.createElement('div');
  overlay.className = 'fm-intro';
  overlay.id = 'fmIntro';

  const wordEl = document.createElement('div');
  wordEl.className = 'fm-intro-word';

  let letterIdx = 0;
  [...word].forEach((ch) => {
    const span = document.createElement('span');
    span.textContent = ch;
    if (ch !== ' ' && ch !== '·') {
      const fam = fonts[letterIdx % fonts.length];
      const st = styles[letterIdx % styles.length];
      span.style.fontFamily = `'${fam}',sans-serif`;
      span.style.fontWeight = st.weight;
      if (st.italic) span.style.fontStyle = 'italic';
      letterIdx++;
    } else {
      span.className = 'fm-intro-dot';
    }
    span.style.setProperty('--delay', (letterIdx * 0.045).toFixed(3) + 's');
    span.style.setProperty('--r', Math.floor((Math.random() - 0.5) * 70) + 'deg');
    span.style.setProperty('--x', Math.floor((Math.random() - 0.5) * 60) + 'px');
    wordEl.appendChild(span);
  });

  overlay.appendChild(wordEl);
  document.body.appendChild(overlay);

  const totalMs = letterIdx * 45 + 700 + 450;
  setTimeout(() => {
    overlay.classList.add('fm-intro-hide');
    setTimeout(() => overlay.remove(), 550);
  }, totalMs);
}
document.addEventListener('DOMContentLoaded', _showFmIntro);
