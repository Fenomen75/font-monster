// ---- [app.js lines 350-353] ----
function getAdminRequests(){try{return JSON.parse(localStorage.getItem('tv_admin_requests')||'[]');}catch(e){return[];}}
function saveAdminRequests(arr){try{localStorage.setItem('tv_admin_requests',JSON.stringify(arr));}catch(e){}}

// ?? Sync approved/pending submitted fonts for current user ??
// ---- [app.js lines 354-456] ----
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
// ---- [app.js lines 1826-2093] ----
let _efFileData=null, _efImgData=null, _efImgRemoved=false;
function handleEditDragOver(e){e.preventDefault();document.getElementById('efFileUploadZone').classList.add('drag-over');}
function handleEditDragLeave(e){document.getElementById('efFileUploadZone').classList.remove('drag-over');}
function handleEditDrop(e){
  e.preventDefault();
  document.getElementById('efFileUploadZone').classList.remove('drag-over');
  const f=e.dataTransfer.files[0];
  if(f) _applyEditFile(f);
}
function handleEditFileSelect(e){Array.from(e.target.files||[]).forEach(f=>_applyEditFile(f));}
let _efFileList=[];
function _applyEditFile(f){
  const fext='.'+f.name.split('.').pop().toLowerCase();
  const allowed=['.ttf','.otf','.woff','.woff2'];
  if(!allowed.includes(fext)){showToast(`✅ "${f.name}" - only TTF, OTF, WOFF, WOFF2 allowed`);return;}
  if(f.size>20*1024*1024){showToast('⚠ Font file too large - max 20 MB');return;}
  if(_efFileList.find(x=>x.name===f.name)){showToast(`"${f.name}" already added`);return;}
  const r=new FileReader();
  r.onload=ev=>{
    const entry={name:f.name,file:f,data:ev.target.result,size:f.size,ext:fext};
    _efFileList.push(entry);
    if(_efFileList.length===1) _efFileData=entry;
    _renderEditFileList();
  };
  r.readAsDataURL(f);
}
function _renderEditFileList(){
  const zone=document.getElementById('efFileUploadZone');
  const sel=document.getElementById('efFuzSelected');
  const lst=document.getElementById('efFuzSelectedList');
  if(!_efFileList.length){sel.classList.remove('show');zone.style.opacity='1';zone.style.minHeight='';return;}
  zone.style.opacity='0.55';
  zone.style.minHeight='40px';
  sel.classList.add('show');
  lst.innerHTML=_efFileList.map((f,i)=>
    `<div style="display:flex;align-items:center;gap:6px;padding:2px 0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span style="font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.name}</span>
      <span style="font-size:11px;color:var(--text3);flex-shrink:0">${(f.size/1024).toFixed(0)} KB</span>
      <button onclick="_removeEditFile(${i})" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:13px;padding:0 2px;line-height:1;flex-shrink:0">×</button>
    </div>`
  ).join('');
}
function _removeEditFile(idx){
  _efFileList.splice(idx,1);
  _efFileData=_efFileList[0]||null;
  if(!_efFileList.length){document.getElementById('ef-file').value='';}
  _renderEditFileList();
}
function clearEditFile(){
  _efFileData=null;
  _efFileList=[];
  document.getElementById('ef-file').value='';
  const sel=document.getElementById('efFuzSelected');
  sel.classList.remove('show');
  const lst=document.getElementById('efFuzSelectedList');
  if(lst) lst.innerHTML='';
  document.getElementById('efFileUploadZone').style.opacity='1';
}
function handleEditImgSelect(inp){
  const f=inp.files[0];if(!f)return;
  if(!f.type.startsWith('image/')){showToast('⚠️ Only image files allowed');inp.value='';return;}
  if(f.size>3*1024*1024){showToast('⚠ Your image is too large - please use an image under 3 MB');inp.value='';return;}
  const efu=document.getElementById('ef-img-url');if(efu)efu.value='';
  const r=new FileReader();
  r.onload=ev=>{
    _efImgData=ev.target.result;
    _efImgRemoved=false;
    document.getElementById('efImgThumb').src=_efImgData;
    document.getElementById('efImgPlaceholder').style.display='none';
    document.getElementById('efImgPreview').style.display='block';
  };
  r.readAsDataURL(f);
}
let _efImgUrlDebounce=null;
function handleEditImgUrl(url){
  clearTimeout(_efImgUrlDebounce);
  url=url.trim();
  if(!url){
    if(!_efImgData){document.getElementById('efImgPlaceholder').style.display='';document.getElementById('efImgPreview').style.display='none';}
    return;
  }
  _efImgUrlDebounce=setTimeout(()=>{
    const img=new Image();
    img.onload=()=>{
      document.getElementById('ef-img').value='';
      _efImgData=url;
      _efImgRemoved=false;
      document.getElementById('efImgThumb').src=url;
      document.getElementById('efImgPlaceholder').style.display='none';
      document.getElementById('efImgPreview').style.display='block';
    };
    img.onerror=()=>{showToast('⚠ Could not load image from that URL');};
    img.src=url;
  },400);
}
function clearEditImg(){
  _efImgData=null;
  _efImgRemoved=true;
  document.getElementById('ef-img').value='';
  const efu=document.getElementById('ef-img-url');if(efu)efu.value='';
  document.getElementById('efImgPlaceholder').style.display='';
  document.getElementById('efImgPreview').style.display='none';
}
function _resetEditModal(){
  clearEditFile();
  clearEditImg();
  _efImgRemoved=false;
  document.getElementById('ef-year').value='';
  const efLicHint=document.getElementById('ef-license-hint');
  if(efLicHint){efLicHint.textContent='';efLicHint.classList.remove('show');}
  const efTwoColReset=document.querySelector('#editFontModal .modal-two-col');
  if(efTwoColReset)efTwoColReset.classList.remove('lic-expanded');
  _efFileData=null; _efImgData=null;
}
// Mövcud font faylının olduğunu modalda göstərir (real fayl seçilməyib, sadəcə indikator)
function _showExistingFontFile(f){
  const hasFile=!!(f.fontData||f.fontUrl||(f.fontVariants&&f.fontVariants.length>0));
  if(!hasFile) return;
  const zone=document.getElementById('efFileUploadZone');
  const sel=document.getElementById('efFuzSelected');
  const lst=document.getElementById('efFuzSelectedList');
  let label='Current font file';
  if(f.fontVariants&&f.fontVariants.length>0){
    label=f.fontVariants.length>1?`${f.fontVariants.length} variants on file`:(f.fontVariants[0].name||'Current font file');
  } else if(f.fontUrl){
    label=f.fontUrl.split('/').pop().split('?')[0]||'Current font file';
  }
  zone.style.opacity='0.55';
  zone.style.minHeight='40px';
  sel.classList.add('show');
  lst.innerHTML=`<div style="display:flex;align-items:center;gap:6px;padding:2px 0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span style="font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(label)}</span>
    </div>`;
}

// ?? EDIT FONT ??
function openEditFont(fontId){
  const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
  const f=sub.find(x=>x.id===fontId);
  if(!f){showToast('Font not found');return;}
  _resetEditModal();
  document.getElementById('ef-id').value=f.id;
  document.getElementById('ef-name').value=f.name;
  document.getElementById('ef-author').value=f.author;
  document.getElementById('ef-cat').value=f.cat;refreshCustomSelect('ef-cat');
  document.getElementById('ef-license').value=f.license;refreshCustomSelect('ef-license');
  const efLicHint=document.getElementById('ef-license-hint');
  const efLicMeta=LICENSE_META[f.license];
  if(efLicHint){
    if(efLicMeta){efLicHint.textContent=efLicMeta.hint;efLicHint.classList.add('show');}
    else{efLicHint.textContent='';efLicHint.classList.remove('show');}
  }
  const efTwoColLoad=document.querySelector('#editFontModal .modal-two-col');
  if(efTwoColLoad)efTwoColLoad.classList.toggle('lic-expanded',!!efLicMeta);
  document.getElementById('ef-year').value=f.year||'';
  document.getElementById('ef-tags').value=(f.tags||[]).join(',');
  setTimeout(()=>_setTagChipValues('ef-tags-box','ef-tags-chips','ef-tags-input','ef-tags',f.tags||[]),50);
  document.getElementById('ef-url').value=f.sourceUrl||'';
  const efAffEl=document.getElementById('ef-affiliate');if(efAffEl)efAffEl.value=f.affiliateUrl||'';
  const efDesc=document.getElementById('ef-description');
  const efDescVal=f.description||'';
  if(efDesc)efDesc.value=efDescVal;
  const efDescCounter=document.getElementById('ef-desc-counter');
  if(efDescCounter){
    efDescCounter.textContent=efDescVal.length+'/300';
    efDescCounter.style.color=efDescVal.length>=280?'var(--red)':efDescVal.length>=240?'var(--orange)':'var(--text3)';
  }
  if(f.previewImg){_efImgData=f.previewImg;document.getElementById('efImgThumb').src=f.previewImg;document.getElementById('efImgPlaceholder').style.display='none';document.getElementById('efImgPreview').style.display='block';}
  _showExistingFontFile(f);
  document.getElementById('ef-admin-notice').style.display='none';
  document.getElementById('ef-user-notice').style.display='';
  document.getElementById('ef-review-notice').style.display='flex';
  document.getElementById('editFontModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeEditFont(){
  document.getElementById('editFontModal').classList.remove('open');
  _resetEditModal();
  window._adminDirectEditId=null;
  if(window._adminPanelWasOpen){
    window._adminPanelWasOpen=false;
    document.body.style.overflow='hidden';
  } else {
    document.body.style.overflow='';
  }
}
async function saveEditFont(){
  const id=document.getElementById('ef-id').value;
  const yearVal=document.getElementById('ef-year').value.trim();
  const updates={
    name:document.getElementById('ef-name').value.trim(),
    author:document.getElementById('ef-author').value.trim(),
    cat:document.getElementById('ef-cat').value,
    license:document.getElementById('ef-license').value,
    tags:document.getElementById('ef-tags').value.split(/[,\s]+/).map(t=>t.trim()).filter(Boolean),
    sourceUrl:document.getElementById('ef-url').value.trim(),
    affiliateUrl:(document.getElementById('ef-affiliate')?.value||'').trim(),
    description:(document.getElementById('ef-description')?.value||'').trim(),
    ...(yearVal?{year:parseInt(yearVal)}:{}),
    ...(_efImgData?{previewImg:_efImgData}:(_efImgRemoved?{previewImg:''}:{}))
  };
  if(updates.affiliateUrl){
    const _subList=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
    const existingFont=_subList.find(x=>x.id===id)||FONTS.find(x=>x.id===id);
    const hasRealFile=_efFileList.length>0||!!(existingFont&&(existingFont.fontData||existingFont.fontUrl||(existingFont.fontVariants&&existingFont.fontVariants.length)));
    if(!hasRealFile) updates.gfamily=null;
  }
  if(!updates.name||!updates.author||!updates.cat||!updates.license){showToast('⚠️ Please fill in all required fields');return;}
  // Font fayli varsa PHP-y? yükl?
  if(_efFileList.length > 0){
    const saveBtn=document.querySelector('#editFontModal .submit-btn');
    if(saveBtn){saveBtn.textContent='Uploading.';saveBtn.disabled=true;}
    const fontId=updates.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')||id;
    let primarySet=false;
    for(let i=0;i<_efFileList.length;i++){
      const efd=_efFileList[i];
      // Storage Rules konfiqurasiya edilənə qədər dataUrl birbaşa işlət
      if(efd.dataUrl || efd.data){
        const dUrl = efd.dataUrl || efd.data;
        if(!primarySet){
          primarySet=true;
          updates.fontData=dUrl;
          updates.fontExt=efd.ext;
          const _efFontName=updates.name||document.getElementById('ef-name').value.trim()||id;
          injectCustomFontFace(id, _efFontName, dUrl, efd.ext||'.ttf');
        }
        console.log('✅ Local dataUrl used for edit:', efd.name||efd.file?.name);
      }
    }
    if(saveBtn){saveBtn.textContent='Save Changes';saveBtn.disabled=false;}
  } else if(_efFileData && _efFileData.data){
    updates.fontData=_efFileData.data;
    updates.fontExt=_efFileData.ext;
  }
  let sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
  const idx=sub.findIndex(f=>f.id===id);

  // Admin direct edit - bypass approval queue
  if(window._adminDirectEditId===id){
    window._adminDirectEditId=null;
    // Update in tv_submitted if exists, otherwise insert
    if(idx>=0){
      sub[idx]={...sub[idx],...updates,adminEditedAt:new Date().toISOString()};
    } else {
      // Built-in font - add an override entry to tv_submitted
      const fi=FONTS.find(f=>f.id===id);
      if(!fi){showToast('⚠️ Font not found'); closeEditFont(); return;}
      sub.push({...fi,...updates,adminEditedAt:new Date().toISOString(),pending:false});
    }
    localStorage.setItem("tv_submitted",JSON.stringify(sub));
    // Clear any pending edit request for this font
    let reqs=getAdminRequests();
    reqs=reqs.filter(r=>!(r.id===id&&r.requestType==='edit'));
    saveAdminRequests(reqs);
    _updateAdminEditsBadge();
    // Apply to runtime FONTS immediately
    const fi=FONTS.findIndex(f=>f.id===id);
    if(fi>=0) Object.assign(FONTS[fi],updates);
    syncSubmittedFonts();
    renderFonts();
    // Font detail page açıqdırsa, yenilənmiş məlumatla yenidən render et
    const _fdp=document.getElementById('fontDetailPage');
    if(_fdp && _fdp.classList.contains('visible') && currentDetailFont && currentDetailFont.id===id){
      openDetail(id);
    }
    // Close modal - admin panel stays visible underneath (if it was open)
    document.getElementById('editFontModal').classList.remove('open');
    const _adminOpen=document.getElementById('adminPanelOverlay').style.display==='flex';
    window._adminPanelWasOpen=false;
    document.body.style.overflow=_adminOpen?'hidden':'';
    _renderAdminAll();
    adminLog('edit',updates.name,'Admin direct edit');
    showToast(`✅ "${updates.name}" updated`);
    return;
  }

  // Regular user edit - send to admin queue for approval
  if(idx<0){showToast('⚠️ Font not found'); closeEditFont(); return;}
  const reqs=getAdminRequests();
  const existingReqIdx=reqs.findIndex(r=>r.id===id&&r.requestType==='edit');
  const editReq={
    ...sub[idx],...updates,
    requestType:'edit',
    editRequestAt:new Date().toISOString(),
    submittedByName:window.currentUser?window.currentUser.name:sub[idx].submittedByName,
    submittedById:window.currentUser?window.currentUser.id:sub[idx].submittedById
  };
  if(existingReqIdx>=0) reqs[existingReqIdx]=editReq;
  else reqs.push(editReq);
  saveAdminRequests(reqs);
  _updateAdminEditsBadge();
  closeEditFont();
  renderMyFontsTab();
  showToast('✅ Changes submitted - awaiting admin review');
}
function deleteMyFont(fontId){
  if(!confirm('Delete this submitted font?')) return;
  let sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
  sub=sub.filter(f=>f.id!==fontId);
  localStorage.setItem("tv_submitted",JSON.stringify(sub));
  let reqs=getAdminRequests();
  reqs=reqs.filter(r=>r.id!==fontId);
  saveAdminRequests(reqs);
  // Firestore-dan da sil (Rules istifadecinin oz fontunu silmesine icaze verir)
  if(window._fbFns && window._fbDb){
    const {doc, deleteDoc} = window._fbFns;
    deleteDoc(doc(window._fbDb,'submitted_fonts',fontId)).catch(e=>console.warn('Firestore delete error:',e));
  }
  syncSubmittedFonts();
  renderMyFontsTab();
  const mc=document.getElementById('profileMyFontsCount');
  if(mc) mc.textContent=getMySubmittedFonts().length;
  renderFonts();
  showToast('Font deleted');
}

// ?? MODERATOR PANEL ??????????????????????????????????????????????????????????
// ---- [app.js lines 2094-3396] ----
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
  ['pending','edits','all','stats','trash','log','export','messages','reports','users'].forEach(t=>{
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
  if(tab==='reports') renderAdminReports();
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
    ['name','author','cat','license','sourceUrl','affiliateUrl'].forEach(k=>{
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
  const updates={name:req.name,author:req.author,cat:req.cat,license:req.license,tags:req.tags,sourceUrl:req.sourceUrl,affiliateUrl:req.affiliateUrl};
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
  const efAffAdmin=document.getElementById('ef-affiliate');if(efAffAdmin)efAffAdmin.value=f.affiliateUrl||'';
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
// (used for the "X characters supported" stat), computed via canvas glyph tests.
// ---- [app.js lines 4804-5279] ----
let uploadedFontData=null; // first file - kept for submitFont compatibility
let uploadedFontFiles=[]; // all selected files
function handleFileSelect(e){Array.from(e.target.files||[]).forEach(f=>processFile(f));}
function handleDragOver(e){e.preventDefault();document.getElementById('fileUploadZone').classList.add('drag-over');}
function handleDragLeave(){document.getElementById('fileUploadZone').classList.remove('drag-over');}
function handleDrop(e){e.preventDefault();document.getElementById('fileUploadZone').classList.remove('drag-over');Array.from(e.dataTransfer.files||[]).forEach(f=>processFile(f));}
function processFile(file){
  const ext='.'+file.name.split('.').pop().toLowerCase();
  if(!['.ttf','.otf','.woff','.woff2'].includes(ext)){showToast(`✅ "${file.name}" - only TTF, OTF, WOFF, WOFF2 allowed`);return;}
  const MAX_FONT_SIZE=10*1024*1024;
  if(file.size>MAX_FONT_SIZE){showToast(`✅ "${file.name}" too large - max 10 MB`);return;}
  if(uploadedFontFiles.find(f=>f.name===file.name)){showToast(`"${file.name}" already added`);return;}
  const reader=new FileReader();
  reader.onload=e=>{
    const dataUrl=e.target.result;
    const entry={file,name:file.name,size:file.size,ext,dataUrl,unicodeSet:null};
    uploadedFontFiles.push(entry);
    if(uploadedFontFiles.length===1) uploadedFontData=entry;
    const fallback=file.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    if(window.opentype){
      const abr=new FileReader();
      abr.onload=ev=>{
        try{
          const font=opentype.parse(ev.target.result);
          const set=new Set();
          const cmap=font.tables&&font.tables.cmap;
          if(cmap&&cmap.glyphIndexMap) Object.keys(cmap.glyphIndexMap).forEach(cp=>set.add(parseInt(cp)));
          entry.unicodeSet=set;
          if(uploadedFontFiles.length===1) uploadedFontData=entry;
          if(uploadedFontFiles.indexOf(entry)===0){
            const nt=font.names;
            const n=(nt&&((nt.preferredFamily&&nt.preferredFamily.en)||(nt.fontFamily&&nt.fontFamily.en)||(nt.fullName&&nt.fullName.en))||'').trim();
            const sfEl=document.getElementById('sf-name');
            if(sfEl&&!sfEl.value.trim()) sfEl.value=n||fallback;
          }
        }catch(err){if(uploadedFontFiles.indexOf(entry)===0){const sfEl=document.getElementById('sf-name');if(sfEl&&!sfEl.value.trim())sfEl.value=fallback;}}
        _renderFileList();
      };
      abr.readAsArrayBuffer(file);
    } else {
      if(uploadedFontFiles.indexOf(entry)===0){const sfEl=document.getElementById('sf-name');if(sfEl&&!sfEl.value.trim())sfEl.value=fallback;}
    }
    _renderFileList();
    showToast(`✅ "${file.name}" added`);
  };
  reader.onerror=()=>showToast(`? Could not read "${file.name}"`);
  reader.readAsDataURL(file);
}
function _renderFileList(){
  const sel=document.getElementById('fuzSelected');
  const lst=document.getElementById('fuzSelectedList');
  const zone=document.getElementById('fileUploadZone');
  if(!uploadedFontFiles.length){sel.classList.remove('show');zone.style.opacity='1';zone.style.minHeight='';return;}
  zone.style.opacity='0.55';
  zone.style.minHeight='40px';
  sel.classList.add('show');
  lst.innerHTML=uploadedFontFiles.map((f,i)=>
    `<div style="display:flex;align-items:center;gap:6px;padding:2px 0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span style="font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.name}</span>
      <span style="font-size:11px;color:var(--text3);flex-shrink:0">${(f.size/1024).toFixed(0)} KB</span>
      <button onclick="removeUploadedFile(${i})" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:13px;padding:0 2px;line-height:1;flex-shrink:0" title="Remove">?</button>
    </div>`
  ).join('');
}
function removeUploadedFile(idx){
  uploadedFontFiles.splice(idx,1);
  uploadedFontData=uploadedFontFiles[0]||null;
  if(!uploadedFontFiles.length) document.getElementById('sf-file').value='';
  _renderFileList();
}
function clearFile(){
  uploadedFontData=null;
  uploadedFontFiles=[];
  document.getElementById('sf-file').value='';
  const sel=document.getElementById('fuzSelected');
  sel.classList.remove('show');
  const lst=document.getElementById('fuzSelectedList');
  if(lst) lst.innerHTML='';
  document.getElementById('fileUploadZone').style.opacity='1';
}

// SUBMIT
document.getElementById('sf-license').addEventListener('change',function(){
  const m=LICENSE_META[this.value];const h=document.getElementById('licenseHint');
  if(m){h.textContent=m.hint;h.classList.add('show');}else{h.textContent='';h.classList.remove('show');}
  const sfTwoCol=document.querySelector('#submitModal .modal-two-col');
  if(sfTwoCol)sfTwoCol.classList.toggle('lic-expanded',!!m);
});
document.getElementById('ef-license').addEventListener('change',function(){
  const m=LICENSE_META[this.value];const h=document.getElementById('ef-license-hint');
  if(m){h.textContent=m.hint;h.classList.add('show');}else{h.textContent='';h.classList.remove('show');}
  const efTwoCol=document.querySelector('#editFontModal .modal-two-col');
  if(efTwoCol)efTwoCol.classList.toggle('lic-expanded',!!m);
});
function handleFontImgSelect(input){
  const file=input.files[0];if(!file)return;
  if(!file.type.startsWith('image/')){showToast('⚠️ Only image files allowed');input.value='';return;}
  if(file.size>3*1024*1024){showToast('⚠ Your image is too large - please use an image under 3 MB');input.value='';return;}
  document.getElementById('sf-img-url').value='';
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('sfImgThumb').src=e.target.result;
    document.getElementById('sfImgPlaceholder').style.display='none';
    document.getElementById('sfImgPreview').style.display='block';
  };
  reader.readAsDataURL(file);
}
let _sfImgUrlDebounce=null;
function handleFontImgUrl(url){
  clearTimeout(_sfImgUrlDebounce);
  url=url.trim();
  if(!url){document.getElementById('sfImgPlaceholder').style.display='flex';document.getElementById('sfImgPreview').style.display='none';return;}
  _sfImgUrlDebounce=setTimeout(()=>{
    const img=new Image();
    img.onload=()=>{
      document.getElementById('sf-img').value='';
      document.getElementById('sfImgThumb').src=url;
      document.getElementById('sfImgPlaceholder').style.display='none';
      document.getElementById('sfImgPreview').style.display='block';
    };
    img.onerror=()=>{showToast('⚠ Could not load image from that URL');};
    img.src=url;
  },400);
}
function clearFontImg(){
  document.getElementById('sf-img').value='';
  document.getElementById('sf-img-url').value='';
  document.getElementById('sfImgThumb').src='';
  document.getElementById('sfImgPlaceholder').style.display='flex';
  document.getElementById('sfImgPreview').style.display='none';
}

function openSubmit(){
  if(!window.currentUser){
    openAuthModal('login');
    showToast('⚠ Please sign up or sign in to submit a font');
    return;
  }
  if(window.currentUser.emailVerified === false){
    showVerifyEmailModal();
    return;
  }
  _resetSubmitForm();
  document.getElementById('submitFormWrap').style.display='';
  document.getElementById('submitSuccess').classList.remove('show');
  document.getElementById('submitModal').classList.add('open');document.body.style.overflow='hidden';
}
function closeSubmit(){document.getElementById('submitModal').classList.remove('open');document.body.style.overflow='';_resetSubmitForm();}

// ?? TAG CHIP INPUT ??
function _initTagChip(boxId, chipsId, inputId, hiddenId, maxTags){
  const box=document.getElementById(boxId);
  const chipsEl=document.getElementById(chipsId);
  const input=document.getElementById(inputId);
  const hidden=document.getElementById(hiddenId);
  if(!box||!chipsEl||!input||!hidden) return;
  let tags=[];

  function syncHidden(){ hidden.value=tags.join(','); }
  function renderChips(){
    chipsEl.innerHTML=tags.map((t,i)=>`
      <span class="tag-chip">${esc(t)}<button type="button" onclick="_removeTagChip('${boxId}','${hiddenId}',${i})"><svg width="8" height="8" viewBox="0 0 10 10" fill="none"><line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></span>
    `).join('');
    syncHidden();
  }
  function addTag(val){
    const v=val.trim().replace(/,/g,'');
    if(!v) return;
    if(tags.length>=10){showToast("⚠️ Maximum 10 tags allowed");return;}
    if(tags.map(t=>t.toLowerCase()).includes(v.toLowerCase())) return;
    tags.push(v.charAt(0).toUpperCase()+v.slice(1));
    renderChips();
  }

  // expose tags array and renderChips for external use
  box._tags=tags; box._renderChips=renderChips;

  input.addEventListener('keydown',e=>{
    if((e.key===' '||e.key===','||e.key==='Enter')&&input.value.trim()){
      e.preventDefault();
      addTag(input.value);
      input.value='';
    } else if(e.key==='Backspace'&&!input.value&&tags.length){
      tags.pop(); renderChips();
    }
  });
  input.addEventListener('input',e=>{
    // If user pastes text with commas or spaces, split immediately
    if(input.value.includes(',')||input.value.includes(' ')){
      const parts=input.value.split(/[,\s]+/);
      parts.forEach((p,i)=>{ if(i<parts.length-1) addTag(p); });
      input.value=parts[parts.length-1];
    }
  });
}

window._removeTagChip=function(boxId,hiddenId,idx){
  const box=document.getElementById(boxId);
  if(!box||!box._tags) return;
  box._tags.splice(idx,1);
  box._renderChips();
  document.getElementById(hiddenId).value=box._tags.join(',');
};

window._setTagChipValues=function(boxId,chipsId,inputId,hiddenId,tagsArr){
  const box=document.getElementById(boxId);
  if(!box||!box._tags) return;
  box._tags.length=0;
  tagsArr.forEach(t=>{ if(t&&!box._tags.includes(t)) box._tags.push(t); });
  box._renderChips();
};

// Init both tag chip inputs when DOM ready
document.addEventListener('DOMContentLoaded',()=>{
  _initTagChip('sf-tags-box','sf-tags-chips','sf-tags-input','sf-tags',5);
  _initTagChip('ef-tags-box','ef-tags-chips','ef-tags-input','ef-tags',5);
});
function closeSubmitOutside(e){if(e.target===document.getElementById('submitModal')&&e.type!=='touchmove')closeSubmit();}
async function submitFont(){
  if(!window.currentUser){closeSubmit();openAuthModal('login');showToast('⚠ Please sign up or sign in to submit a font');return;}
  // Email doğrulanmamışsa submit-i blokla (OAuth login-lər həmişə verified sayılır)
  if(window.currentUser.emailVerified === false){
    showVerifyEmailModal();
    return;
  }
  const agreeChk = document.getElementById('sf-agree');
  if(agreeChk && !agreeChk.checked){ showToast('⚠ Please confirm the license agreement before submitting.'); return; }
  const newFont=_buildNewFontFromForm();
  if(!newFont) return;
  if(uploadedFontFiles.length > 0){
    await _uploadSubmittedFontFiles(newFont);
  }
  try{ await _finalizeSubmit(newFont); }catch(err){ console.error('finalize error:',err); showToast('❌ Xəta: '+err.message); }
}

// 1/7 — read & validate the submit form, build the draft font object (or null if invalid)
function _buildNewFontFromForm(){
  const name=document.getElementById('sf-name').value.trim();
  const author=document.getElementById('sf-author').value.trim();
  const cat=document.getElementById('sf-cat').value;
  const license=document.getElementById('sf-license').value;
  const url=document.getElementById('sf-url').value.trim();
  const affiliateUrl=(document.getElementById('sf-affiliate')?.value||'').trim();
  const description=(document.getElementById('sf-description')?.value||'').trim();
  if(!name||!author||!cat||!license){showToast('⚠️ Please fill in all required fields');return null;}
  let id=name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  // ID artıq mövcuddursa rəqəmli suffix əlavə et
  if(FONTS.find(f=>f.id===id)){
    let suffix=2;
    while(FONTS.find(f=>f.id===id+'-'+suffix)) suffix++;
    id=id+'-'+suffix;
  }
  // Qeyd: timestamp artıq əlavə edilmir. Eyni adlı fontu iki dəfə submit etmək
  // yuxarıdakı suffix məntiqi ilə idarə olunur. Firestore-da race condition
  // setDoc-dan əvvəl getDoc ilə mövcudluq yoxlanılması ilə önlənir.
  const gfamily=affiliateUrl?null:name.replace(/\s+/g,'+');
  const tagsRaw=document.getElementById('sf-tags').value.trim();
  const year=parseInt(document.getElementById('sf-year').value)||new Date().getFullYear();
  const tags=tagsRaw?tagsRaw.split(/[,\s]+/).map(t=>t.trim()).filter(Boolean):['Custom'];
  const imgThumb=document.getElementById('sfImgThumb');
  const previewImg=imgThumb&&imgThumb.src&&(imgThumb.src.startsWith('data:')||imgThumb.src.startsWith('http'))?imgThumb.src:null;
  const newFont={
    id,name,author,cat,gfamily,weight:'400',tags,license,year,popular:60,sourceUrl:url||'',affiliateUrl:affiliateUrl||'',
    description:description||'',
    pending:true,isNew:true,
    submittedById:window.currentUser.id,
    submittedByName:window.currentUser.name,
    submittedByEmail:window.currentUser.email,
    submittedAt:new Date().toISOString()
  };
  if(previewImg)newFont.previewImg=previewImg;
  return newFont;
}

// 2/7 — upload selected font file(s) (Firebase Storage, with dataUrl fallback), mutates newFont
async function _uploadSubmittedFontFiles(newFont){
  const submitBtn = document.querySelector('#submitModal .submit-btn');
  if(submitBtn){submitBtn.textContent='Uploading.';submitBtn.disabled=true;}
  let primaryUrl=null, primaryExt=null, primaryName=null;
  const fontVariants=[]; // bütün variantlarin URL-l?ri
  for(let i=0;i<uploadedFontFiles.length;i++){
    const fd=uploadedFontFiles[i];
    newFont.gfamily = null;
    if(submitBtn) submitBtn.textContent=`Uploading ${i+1}/${uploadedFontFiles.length}.`;
    try{
      const fRef2=window._fbStorageRef(window._fbStorage,'fonts/'+(newFont.id+(i>0?('_'+i):'')+fd.ext));
      await window._fbUploadBytes(fRef2, fd.file);
      const url2=await window._fbGetDownloadURL(fRef2);
      fontVariants.push({url:url2, ext:fd.ext, name:fd.name});
      if(!primaryUrl){ primaryUrl=url2; primaryExt=fd.ext; primaryName=null; }
      console.log('✅ Firebase Storage upload ok:', fd.name);
    }catch(e){
      console.warn('Storage upload failed, falling back to dataUrl:', e.message);
      if(fd.dataUrl) fontVariants.push({url:fd.dataUrl, ext:fd.ext, name:fd.name});
    }
  }
  // dataUrl fallback - PHP upload isl?m?dikd? uploadedFontFiles-dan variant qur
  if(!fontVariants.length && uploadedFontFiles.length>0){
    uploadedFontFiles.forEach(fd=>{
      if(fd.dataUrl) fontVariants.push({url:fd.dataUrl, ext:fd.ext, name:fd.name});
    });
  }
  if(primaryUrl){
    newFont.fontUrl=primaryUrl;
    newFont.fontExt=primaryExt;
    if(fontVariants.length > 0) newFont.fontVariants=fontVariants;
    if(primaryName && primaryName.trim()){
      const sfNameEl=document.getElementById('sf-name');
      if(sfNameEl&&!sfNameEl.value.trim()) sfNameEl.value=primaryName.trim();
      if(!newFont.name||newFont.name.replace(/-/g,' ').trim()===newFont.id.replace(/-/g,' ').trim()){
        newFont.name=primaryName.trim();
        newFont.id=primaryName.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
      }
    }
    newFont.pending=false;
    newFont.status='approved';
    newFont.approvedAt=new Date().toISOString();
  } else if(fontVariants.length > 0){
    // PHP isl?m?di, amma dataUrl fallback var - bunlari da approved kimi qeyd et
    newFont.fontVariants=fontVariants;
    // Birinci varianti primary kimi saxla (preview üçün)
    newFont.fontData=fontVariants[0].url;
    newFont.fontExt=fontVariants[0].ext;
    newFont.pending=false;
    newFont.status='approved';
    newFont.approvedAt=new Date().toISOString();
  }
  if(submitBtn){submitBtn.textContent='Submit Font';submitBtn.disabled=false;}
}

// 3/7 — compute detectedLangs from the parsed opentype unicode set, if available
function _computeDetectedLangsForSubmission(font){
  if(!font.detectedLangs && uploadedFontData && uploadedFontData.unicodeSet && uploadedFontData.unicodeSet.size>0){
    const set=uploadedFontData.unicodeSet;
    font.detectedLangs=(typeof LANG_SUPPORT_LIST!=='undefined'?LANG_SUPPORT_LIST:[])
      .filter(l=>{
        const chars=l.chars||'';
        const arr=typeof chars==='string'?[...chars]:chars;
        return arr.some(ch=>set.has(ch.codePointAt(0)));
      })
      .map(l=>l.label);
    if(!font.detectedLangs.length) font.detectedLangs=['Latin'];
    _LANG_CACHE[font.id]=font.detectedLangs;
  }
}

// 4/7 — build the storage-safe copy of the font (binary data stripped/relocated)
function _prepFontForStorage(font){
  const fontForStorage={...font};
  if(fontForStorage.fontUrl || fontForStorage.fontData){
    fontForStorage.pending=false;
    fontForStorage.status='approved';
    if(!fontForStorage.approvedAt) fontForStorage.approvedAt=new Date().toISOString();
  }
  // fontData-nı ayrı saxla (5MB limit)
  if(font.fontData){
    try{localStorage.setItem('fn_fontdata_'+font.id, font.fontData);}catch(e){console.warn('fontData storage failed (quota?):',e);}
    delete fontForStorage.fontData;
    fontForStorage._hasFontData=true;
  }
  if(font.fontUrl) delete fontForStorage.fontData;
  return fontForStorage;
}

// 5/7 — write to Firestore (primary store); returns true if a doc now exists there
async function _persistSubmittedFontToFirestore(font, fontForStorage){
  if(!(window._fbFns && window._fbDb)) return false;
  const {doc, setDoc, getDoc} = window._fbFns;
  const db = window._fbDb;
  const cloudFont={...fontForStorage};
  delete cloudFont.fontData;
  if(cloudFont.fontUrl){ cloudFont.pending=false; cloudFont.status='approved'; }
  try{
    const existing = await getDoc(doc(db,'submitted_fonts',font.id));
    if(existing.exists()){
      console.warn('submitFont: font ID already exists in Firestore, skipping write:', font.id);
      return true; // mövcuddur, yazma tələb olunmur
    }
    await setDoc(doc(db,'submitted_fonts',font.id), cloudFont);
    console.log('✅ Firestore primary save:', font.id, 'pending:', cloudFont.pending);
    return true;
  }catch(e){
    console.warn('Firestore submitFont error, falling back to localStorage:', e.message);
    showToast('⚠ Cloud sync olmadı, lokal saxlandı. Internet bərpasında yenidən cəhd olunacaq.');
    return false;
  }
}

// 6/7 — localStorage cache + offline admin queue fallback
function _persistSubmittedFontLocally(font, fontForStorage, savedToFirestore){
  // ── FALLBACK: localStorage ──────────────────────────────────────────────
  // Həmişə local cache-ə yaz: cari sessiya üçün + Firestore offline olduqda
  try{
    const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
    // Mövcuddursa update et, yoxsa əlavə et
    const existIdx=sub.findIndex(x=>x.id===fontForStorage.id);
    if(existIdx>=0) sub[existIdx]={...sub[existIdx],...fontForStorage};
    else sub.push(fontForStorage);
    localStorage.setItem("tv_submitted",JSON.stringify(sub));
  }catch(e){console.warn('localStorage fallback save error:',e);}

  // Admin queue — yalnız Firebase yoxdursa (tam offline vəziyyət)
  if(!font.fontUrl && !font.fontData && !savedToFirestore){
    try{const reqs=getAdminRequests();reqs.push({...fontForStorage,requestType:'add'});saveAdminRequests(reqs);}catch(e){}
  }
}

// 7/7 — clear the submit form and show the success state
function _resetSubmitForm(){
  ['sf-name','sf-author','sf-tags','sf-year','sf-url','sf-affiliate','sf-description'].forEach(fid=>{const el=document.getElementById(fid);if(el)el.value='';});
  const sfBox=document.getElementById('sf-tags-box');
  if(sfBox&&sfBox._tags){sfBox._tags.length=0;sfBox._renderChips();}
  document.getElementById('sf-tags-input').value='';
  document.getElementById('sf-cat').value='';refreshCustomSelect('sf-cat');document.getElementById('sf-license').value='';refreshCustomSelect('sf-license');
  document.getElementById('licenseHint').textContent='';document.getElementById('licenseHint').classList.remove('show');
  const sfTwoColReset=document.querySelector('#submitModal .modal-two-col');
  if(sfTwoColReset)sfTwoColReset.classList.remove('lic-expanded');
  const sfDesc=document.getElementById('sf-desc-counter');if(sfDesc)sfDesc.textContent='0/300';
  clearFile();clearFontImg();
  document.getElementById('submitFormWrap').style.display='none';
  document.getElementById('submitSuccess').classList.add('show');
}

// Helper to finalize submission after optional Storage upload
async function _finalizeSubmit(font){
  _computeDetectedLangsForSubmission(font);
  // Add to runtime FONTS (current user sees it immediately)
  FONTS.push(font);
  DL_COUNTS[font.id]=0;
  // Inject font face immediately for current session
  if(!font.previewImg){
    if(font.fontVariants&&font.fontVariants.length>0) injectVariantFaces(font);
    else if(font.fontData) injectCustomFontFace(font.id,font.name,font.fontData,font.fontExt||'.ttf');
    else if(font.fontUrl) injectCustomFontFaceUrl(font.id,font.name,font.fontUrl,font.fontExt||'.ttf');
  }
  const fontForStorage=_prepFontForStorage(font);
  // ── PRIMARY: Firestore ──────────────────────────────────────────────────
  // Firebase mövcuddursa əvvəlcə Firestore-a yaz; localStorage yalnız
  // offline/fallback cache rolunu oynayır. Fərqli brauzer/cihazdan adminlər
  // yalnız Firestore-dakı fontu görə bilər.
  const savedToFirestore = await _persistSubmittedFontToFirestore(font, fontForStorage);
  _persistSubmittedFontLocally(font, fontForStorage, savedToFirestore);
  _resetSubmitForm();
  renderFonts();
}

// TOAST
// ?? Parse weight & style from font filename ?????????????????????????????????
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
// ?? Inject one @font-face per variant with correct weight+style ??????????????
function injectVariantFaces(font){
  if(!font.fontVariants||!font.fontVariants.length) return false;
  const fmt={'.ttf':'truetype','.otf':'opentype','.woff':'woff','.woff2':'woff2'};
  font.fontVariants.forEach((v,i)=>{
    if(!v.url) return;
    const vi=parseVariantStyle(v.name||'');
    const ext=v.ext||font.fontExt||'.otf';
    const f2=fmt[ext]||'opentype';
    // Each variant gets its own unique font-family name so browser won't confuse them
    const vFamily=font.name+' '+vi.label;
    v._familyName=vFamily;
    const vFamilyEsc=vFamily.replace(/'/g,"\'");
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
// ---- [app.js lines 5564-5705] ----
function selectChip(el, val) {
  document.querySelectorAll('.ct-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  el.dataset.selected = val;
}

function openContactModal(){
  const o=document.getElementById('contactOverlay');
  if(!o)return;
  o.classList.add('open');
  document.body.style.overflow='hidden';
  document.getElementById('contactFormWrap').style.display='';
  document.getElementById('contactSuccess').style.display='none';
  if(window.currentUser){
    const n=document.getElementById('ctName');
    const e=document.getElementById('ctEmail');
    if(n&&!n.value) n.value=window.currentUser.name||'';
    if(e&&!e.value) e.value=window.currentUser.email||'';
  }
}

// ?? REPORT A FONT ??
function selectReportChip(el, val) {
  el.parentElement.querySelectorAll('.ct-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  el.dataset.selected = val;
}

function openReportModal(fontId, fontName){
  const o=document.getElementById('reportOverlay');
  if(!o)return;
  o.classList.add('open');
  document.body.style.overflow='hidden';
  document.getElementById('reportFormWrap').style.display='';
  document.getElementById('reportSuccess').style.display='none';
  const wrap=document.getElementById('reportFontNameWrap');
  const nameInput=document.getElementById('rpFontName');
  if(fontId && fontName){
    wrap.style.display='';
    nameInput.value=fontName;
    nameInput.dataset.fontId=fontId;
    document.getElementById('reportSubtitle').textContent='Reporting "'+fontName+'" - we\'ll review it.';
  } else {
    wrap.style.display='none';
    nameInput.value='';
    delete nameInput.dataset.fontId;
    document.getElementById('reportSubtitle').textContent="Tell us what's wrong - we'll review it.";
  }
  if(window.currentUser && window.currentUser.email){
    const e=document.getElementById('rpEmail');
    if(e&&!e.value) e.value=window.currentUser.email;
  }
}

function closeReportModal(){
  const o=document.getElementById('reportOverlay');
  if(o) o.classList.remove('open');
  document.body.style.overflow='';
  const e=document.getElementById('rpEmail'); if(e) e.value='';
  const m=document.getElementById('rpMessage'); if(m) m.value='';
  const fw=document.getElementById('reportFormWrap'); if(fw) fw.style.display='';
  const rs=document.getElementById('reportSuccess'); if(rs) rs.style.display='none';
}

function submitReport(){
  const fontNameEl=document.getElementById('rpFontName');
  const fontId=fontNameEl.dataset.fontId||null;
  const fontName=fontNameEl.value.trim()||null;
  const email=document.getElementById('rpEmail').value.trim();
  const activeChip=document.querySelector('#reportOverlay .ct-chip.active');
  const reason=activeChip?activeChip.dataset.val:'other';
  const msg=document.getElementById('rpMessage').value.trim();
  if(!msg){showToast('⚠️ Please describe the issue');return;}
  if(email && !email.includes('@')){showToast('⚠️ Enter a valid email');return;}
  const btn=document.getElementById('rpSendBtn');
  const btnOrigHTML = btn ? btn.innerHTML : '';
  if(btn){btn.textContent='Sending\u2026';btn.disabled=true;}
  const finish=()=>{
    document.getElementById('reportFormWrap').style.display='none';
    document.getElementById('reportSuccess').style.display='';
    if(btn){btn.innerHTML=btnOrigHTML;btn.disabled=false;}
  };
  if(window.fbReportFont){
    window.fbReportFont(fontId,fontName,email,reason,msg)
      .then(finish)
      .catch(e=>{if(btn){btn.innerHTML=btnOrigHTML;btn.disabled=false;}showToast('❌ '+e.message);});
  } else {
    const entry={id:Date.now().toString(36),fontId,fontName,email,reason,msg,date:new Date().toISOString(),resolved:false};
    try{const reports=JSON.parse(localStorage.getItem('fontan_font_reports')||'[]');reports.unshift(entry);localStorage.setItem('fontan_font_reports',JSON.stringify(reports));}catch(e){}
    if(typeof updateAdminReportsBadge==='function') updateAdminReportsBadge();
    finish();
  }
}

function closeContactModal(){
  const o=document.getElementById('contactOverlay');
  if(o) o.classList.remove('open');
  document.body.style.overflow='';
  ['ctName','ctEmail','ctSubject','ctMsg'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  const cw=document.getElementById('contactFormWrap');if(cw)cw.style.display='';
  const cs=document.getElementById('contactSuccess');if(cs)cs.style.display='none';
}

function submitContact(){
  const name=document.getElementById('ctName').value.trim();
  const email=document.getElementById('ctEmail').value.trim();
  const activeChip=document.querySelector('.ct-chip.active');
  const subject=activeChip?activeChip.dataset.val:'other';
  const msg=document.getElementById('ctMessage').value.trim();
  if(!name||!email||!msg){showToast('⚠️ Please fill in all fields');return;}
  if(!email.includes('@')){showToast('⚠️ Enter a valid email');return;}
  const btn=document.getElementById('ctSendBtn');
  const btnOrigHTML = btn ? btn.innerHTML : '';
  if(btn){btn.textContent='Sending\u2026';btn.disabled=true;}
  if(window.fbSendContact){
    window.fbSendContact(name,email,subject,msg)
      .then(()=>{
        document.getElementById('contactFormWrap').style.display='none';
        document.getElementById('contactSuccess').style.display='';
        if(btn){btn.innerHTML=btnOrigHTML;btn.disabled=false;}
      })
      .catch(e=>{if(btn){btn.innerHTML=btnOrigHTML;btn.disabled=false;}showToast('❌ '+e.message);});
  } else {
    const entry={id:Date.now().toString(36),name,email,subject,msg,date:new Date().toISOString(),read:false};
    try{const msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]');msgs.unshift(entry);localStorage.setItem('fontan_contact_msgs',JSON.stringify(msgs));}catch(e){}
    document.getElementById('contactFormWrap').style.display='none';
    document.getElementById('contactSuccess').style.display='';
    updateAdminMessagesBadge();
  }
}

function updateAdminMessagesBadge(){
  try{
    const msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]');
    const unread=msgs.filter(m=>!m.read).length;
    const badge=document.getElementById('adminBadgeMessages');
    if(badge){
      badge.textContent=unread;
      badge.style.display=unread?'inline-flex':'none';
    }
  }catch(e){}
}

// ??????????????????????????????????????????
// ADMIN MESSAGES TAB
// ??????????????????????????????????????????
// (messages tab rendering is already integrated into switchAdminTab above)

async function renderAdminMessages(){
  const view=document.getElementById('adminView_messages');
  if(!view)return;
  view.innerHTML='<div style="text-align:center;padding:48px;color:var(--text3);font-size:14px">Loading.</div>';
  let msgs=[];
  if(window.fbGetMessages){
    try{ msgs=await window.fbGetMessages(); }catch(e){}
  } else {
    try{ msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]'); }catch(e){}
  }
  if(!msgs.length){
    view.innerHTML='<div style="text-align:center;padding:48px;color:var(--text3);font-size:14px">📭 No messages yet</div>';
    return;
  }
  view.innerHTML=msgs.map(m=>`
    <div style="background:var(--surface3);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:10px;${m.read?'opacity:0.7':''}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px">
        <div>
          <span style="font-weight:700;color:var(--text);font-size:14px">${esc(m.name)}</span>
          <span style="color:var(--text3);font-size:12px;margin-left:8px">${esc(m.email)}</span>
          ${!m.read?'<span style="display:inline-flex;background:var(--accent);color:#fff;font-size:10px;font-weight:700;border-radius:980px;padding:1px 7px;margin-left:8px">New</span>':''}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--text3)">${new Date(m.date).toLocaleString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
          <button onclick="markMsgRead('${m.id}')" style="padding:3px 10px;border-radius:980px;border:1px solid var(--border2);background:var(--surface-solid);font-size:11px;cursor:pointer;font-family:var(--sans);color:var(--text2)">
            ${m.read?'✓ Read':'Mark read'}
          </button>
          <button onclick="deleteMsgAdmin('${m.id}')" style="padding:3px 8px;border-radius:980px;border:1px solid rgba(255,59,48,0.25);background:transparent;font-size:11px;cursor:pointer;font-family:var(--sans);color:var(--red)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button>
        </div>
      </div>
      <div style="font-size:12px;font-weight:600;color:var(--text3);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.05em">${esc(m.subject)}</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.55;white-space:pre-wrap">${esc(m.msg)}</div>
    </div>
  `).join('');
}

async function markMsgRead(id){
  if(window.fbMarkRead){ try{ await window.fbMarkRead(id); await renderAdminMessages(); }catch(e){} }
  else {
    try{const msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]');const m=msgs.find(x=>x.id===id);if(m)m.read=true;localStorage.setItem('fontan_contact_msgs',JSON.stringify(msgs));renderAdminMessages();updateAdminMessagesBadge();}catch(e){}
  }
}
async function deleteMsgAdmin(id){
  if(window.fbDeleteMessage){ try{ await window.fbDeleteMessage(id); await renderAdminMessages(); }catch(e){} }
  else {
    try{const msgs=JSON.parse(localStorage.getItem('fontan_contact_msgs')||'[]').filter(x=>x.id!==id);localStorage.setItem('fontan_contact_msgs',JSON.stringify(msgs));renderAdminMessages();updateAdminMessagesBadge();}catch(e){}
  }
}

// ??????????????????????????????????????????
// ADMIN REPORTS TAB (font reports submitted by users)
// ??????????????????????????????????????????

const REPORT_REASON_LABELS={
  'wrong-license':'⚖️ Wrong license','not-owner':'🚫 Not theirs to share',
  'broken':'🐞 Broken file/link','duplicate':'🔁 Duplicate','other':'✉️ Other'
};

function updateAdminReportsBadge(){
  try{
    const reports=JSON.parse(localStorage.getItem('fontan_font_reports')||'[]');
    const open=reports.filter(r=>!r.resolved).length;
    const badge=document.getElementById('adminBadgeReports');
    if(badge){
      badge.textContent=open;
      badge.style.display=open?'inline-flex':'none';
    }
  }catch(e){}
}

async function renderAdminReports(){
  const view=document.getElementById('adminView_reports');
  if(!view)return;
  view.innerHTML='<div style="text-align:center;padding:48px;color:var(--text3);font-size:14px">Loading.</div>';
  let reports=[];
  if(window.fbGetReports){
    try{ reports=await window.fbGetReports(); }catch(e){}
  } else {
    try{ reports=JSON.parse(localStorage.getItem('fontan_font_reports')||'[]'); }catch(e){}
  }
  // Update badge with whatever we just fetched
  try{
    const openCount=reports.filter(r=>!r.resolved).length;
    const badge=document.getElementById('adminBadgeReports');
    if(badge){ badge.textContent=openCount; badge.style.display=openCount?'inline-flex':'none'; }
  }catch(e){}
  if(!reports.length){
    view.innerHTML='<div style="text-align:center;padding:48px;color:var(--text3);font-size:14px">🚩 No reports yet</div>';
    return;
  }
  view.innerHTML=reports.map(r=>`
    <div style="background:var(--surface3);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:10px;${r.resolved?'opacity:0.6':''}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:8px">
        <div>
          ${r.fontName?`<span style="font-weight:700;color:var(--text);font-size:14px;cursor:pointer" onclick="${r.fontId?`_adminGoToFont('${r.fontId}')`:''}">${esc(r.fontName)}</span>`:`<span style="font-weight:700;color:var(--text);font-size:14px">General report</span>`}
          ${r.email?`<span style="color:var(--text3);font-size:12px;margin-left:8px">${esc(r.email)}</span>`:''}
          ${!r.resolved?'<span style="display:inline-flex;background:var(--red);color:#fff;font-size:10px;font-weight:700;border-radius:980px;padding:1px 7px;margin-left:8px">Open</span>':'<span style="display:inline-flex;background:var(--surface4);color:var(--text3);font-size:10px;font-weight:700;border-radius:980px;padding:1px 7px;margin-left:8px">Resolved</span>'}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--text3)">${new Date(r.date).toLocaleString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
          <button onclick="markReportResolved('${r.id}')" style="padding:3px 10px;border-radius:980px;border:1px solid var(--border2);background:var(--surface-solid);font-size:11px;cursor:pointer;font-family:var(--sans);color:var(--text2)">
            ${r.resolved?'✓ Resolved':'Mark resolved'}
          </button>
          <button onclick="deleteReportAdmin('${r.id}')" style="padding:3px 8px;border-radius:980px;border:1px solid rgba(255,59,48,0.25);background:transparent;font-size:11px;cursor:pointer;font-family:var(--sans);color:var(--red)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></button>
        </div>
      </div>
      <div style="font-size:12px;font-weight:600;color:var(--text3);margin-bottom:5px;text-transform:uppercase;letter-spacing:0.05em">${REPORT_REASON_LABELS[r.reason]||esc(r.reason)}</div>
      <div style="font-size:13px;color:var(--text2);line-height:1.55;white-space:pre-wrap">${esc(r.msg)}</div>
    </div>
  `).join('');
}

async function markReportResolved(id){
  if(window.fbResolveReport){ try{ await window.fbResolveReport(id); await renderAdminReports(); }catch(e){} }
  else {
    try{const reports=JSON.parse(localStorage.getItem('fontan_font_reports')||'[]');const r=reports.find(x=>x.id===id);if(r)r.resolved=true;localStorage.setItem('fontan_font_reports',JSON.stringify(reports));renderAdminReports();updateAdminReportsBadge();}catch(e){}
  }
}
async function deleteReportAdmin(id){
  if(window.fbDeleteReport){ try{ await window.fbDeleteReport(id); await renderAdminReports(); }catch(e){} }
  else {
    try{const reports=JSON.parse(localStorage.getItem('fontan_font_reports')||'[]').filter(x=>x.id!==id);localStorage.setItem('fontan_font_reports',JSON.stringify(reports));renderAdminReports();updateAdminReportsBadge();}catch(e){}
  }
}

// ??????????????????????????????????????????
// PASSWORD VISIBILITY TOGGLE
// ??????????????????????????????????????????
// ?? ENTER KEY on auth inputs ??
document.addEventListener('DOMContentLoaded', () => {
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

