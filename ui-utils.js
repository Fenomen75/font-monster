  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200);
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
    // Bug 7 fix: only call close functions when modal is actually open to avoid
    // unconditionally resetting compareFonts (and losing compare bar selection)
    var _sm=document.getElementById('submitModal');if(_sm&&_sm.classList.contains('open')){closeSubmit();return;}
    var _co=document.getElementById('contactOverlay');if(_co&&_co.classList.contains('open')){closeContactModal();return;}
    var _cmp=document.getElementById('compareModal');if(_cmp&&_cmp.classList.contains('open')){closeCompare();return;}
    if(shortcutsOpen){shortcutsOpen=false;document.getElementById('shortcutsPanel').classList.remove('open');}
    else if(document.getElementById('authorPage').style.display!=='none')showGrid();
    else if(currentDetailFont)showGrid();
    return;
  }
  // Bug 8 fix: guard shortcuts so they don't fire when any overlay modal is open
  function _anyModalOpen(){
    var ids=['pairModal','editFontModal','authOverlay','submitModal','contactOverlay','compareModal','adminPanelOverlay','modPanelOverlay','emailVerifyModal'];
    return ids.some(function(id){var el=document.getElementById(id);if(!el)return false;var s=el.style;return s.display==='flex'||s.display==='block'||el.classList.contains('open')||(id==='pairModal'&&s.opacity==='1');});
  }
  if(e.key==='c'||e.key==='C'){if(!_anyModalOpen())openCompare();}
  if(e.key==='d'||e.key==='D'){toggleDark();}
  if(e.key==='n'||e.key==='N'){if(!_anyModalOpen())openSubmit();}
  if(e.key==='?'){e.preventDefault();if(!_anyModalOpen())toggleShortcuts();}
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
if(darkMode){document.getElementById('darkIcon').innerHTML='<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" stroke="none"/>';}

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

renderFonts();renderRecentList();
// initAuth loads currentUser from localStorage for offline/non-Firebase fallback
// Firebase onAuthStateChanged will override this when it fires
if(typeof initAuth === 'function') initAuth();
setTimeout(injectAllFallingLetters, 300);

// ??????????????????????????????????????????
// PASSWORD VISIBILITY TOGGLE
// ??????????????????????????????????????????
// ?? ENTER KEY on auth inputs ??
document.addEventListener('DOMContentLoaded', () => {
  // Handle Firebase email action links (?mode=verifyEmail&oobCode=...)
  const _urlParams = new URLSearchParams(window.location.search);
  const _mode = _urlParams.get('mode');
  const _oobCode = _urlParams.get('oobCode');
  if(_mode === 'verifyEmail' && _oobCode){
    // Wait for Firebase to init then apply the code
    const _tryVerify = setInterval(async () => {
      if(!window._fbApplyActionCode) return;
      clearInterval(_tryVerify);
      try {
        await window._fbApplyActionCode(_oobCode);
        // Update Firestore emailVerified field
        try {
          const _auth = window._fbAuth;
          const _db = window._fbDb;
          const _fns = window._fbFns;
          if(_auth && _auth.currentUser && _db && _fns){
            await _fns.updateDoc(_fns.doc(_db,'users',_auth.currentUser.uid),{emailVerified:true});
          }
        } catch(e){}
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        showEmailVerifiedModal();
      } catch(e) {
        window.history.replaceState({}, document.title, window.location.pathname);
        showEmailVerifiedModal('error');
      }
    }, 300);
  }
  if(_mode === 'resetPassword' && _oobCode){
    // Redirect to login with forgot tab after clearing params
    window.history.replaceState({}, document.title, window.location.pathname);
    setTimeout(()=> openAuthModal('forgot'), 500);
  }

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

// === Scroll top button ===
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

// === Mobile patch ===
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
        var delta = (t === 'A+') ? 8 : -8;
        function doZoom(e){
          e.preventDefault();
          e.stopPropagation();
          var b = document.getElementById('heroBannerText');
          if(!b) return;
          var cur = parseFloat(b.style.fontSize) || 48;
          b.style.fontSize = Math.min(160, Math.max(16, cur + delta)) + 'px';
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

