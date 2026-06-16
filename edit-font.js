// ?? EDIT FONT - file/image helpers ??
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
  const nm=document.getElementById('efFuzSelectedName');
  if(!_efFileList.length){sel.style.display='none';zone.style.display='';return;}
  zone.style.display='none';
  sel.style.display='flex';
  nm.innerHTML=_efFileList.map((f,i)=>
    `<div style="display:flex;align-items:center;gap:6px;padding:2px 0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      <span style="font-size:12px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.name}</span>
      <span style="font-size:11px;color:var(--text3);flex-shrink:0">${(f.size/1024).toFixed(0)} KB</span>
      <button onclick="_removeEditFile(${i})" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:13px;padding:0 2px;line-height:1;flex-shrink:0">×</button>
    </div>`
  ).join('');
  sel.style.flexDirection='column';
  sel.style.alignItems='stretch';
  sel.style.gap='3px';
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
  document.getElementById('efFuzSelected').style.display='none';
  document.getElementById('efFileUploadZone').style.display='';
  const nm=document.getElementById('efFuzSelectedName');
  if(nm) nm.innerHTML='';
}
function handleEditImgSelect(inp){
  const f=inp.files[0];if(!f)return;
  if(!f.type.startsWith('image/')){showToast('⚠️ Only image files allowed');inp.value='';return;}
  if(f.size>3*1024*1024){showToast('⚠ Your image is too large - please use an image under 3 MB');inp.value='';return;}
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
function clearEditImg(){
  _efImgData=null;
  _efImgRemoved=true;
  document.getElementById('ef-img').value='';
  document.getElementById('efImgPlaceholder').style.display='';
  document.getElementById('efImgPreview').style.display='none';
}
function _resetEditModal(){
  clearEditFile();
  clearEditImg();
  _efImgRemoved=false;
  document.getElementById('ef-year').value='';
  _efFileData=null; _efImgData=null;
}
// Mövcud font faylının olduğunu modalda göstərir (real fayl seçilməyib, sadəcə indikator)
function _showExistingFontFile(f){
  const hasFile=!!(f.fontData||f.fontUrl||(f.fontVariants&&f.fontVariants.length>0));
  if(!hasFile) return;
  const zone=document.getElementById('efFileUploadZone');
  const sel=document.getElementById('efFuzSelected');
  const nm=document.getElementById('efFuzSelectedName');
  let label='Current font file';
  if(f.fontVariants&&f.fontVariants.length>0){
    label=f.fontVariants.length>1?`${f.fontVariants.length} variants on file`:(f.fontVariants[0].name||'Current font file');
  } else if(f.fontUrl){
    label=f.fontUrl.split('/').pop().split('?')[0]||'Current font file';
  }
  zone.style.display='none';
  sel.style.display='flex';
  sel.style.flexDirection='';
  sel.style.alignItems='';
  sel.style.gap='';
  nm.innerHTML=`<span style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(label)}</span>`;
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
  document.getElementById('ef-year').value=f.year||'';
  document.getElementById('ef-tags').value=(f.tags||[]).join(',');
  setTimeout(()=>_setTagChipValues('ef-tags-box','ef-tags-chips','ef-tags-input','ef-tags',f.tags||[]),50);
  document.getElementById('ef-url').value=f.sourceUrl||'';
  const efDesc=document.getElementById('ef-description');if(efDesc)efDesc.value=f.description||'';
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
    description:(document.getElementById('ef-description')?.value||'').trim(),
    ...(yearVal?{year:parseInt(yearVal)}:{}),
    ...(_efImgData?{previewImg:_efImgData}:(_efImgRemoved?{previewImg:''}:{}))
  };
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

