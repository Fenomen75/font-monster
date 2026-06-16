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
        <div class="card-preview" id="prev-${font.id}" data-fontname="${esc(font.name)}" style="${fs}opacity:0;transition:opacity .15s">${esc(txt)}</div>
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

