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
