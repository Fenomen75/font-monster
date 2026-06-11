// ?? PROFILE PAGE
function showProfile(tab){
  if(!currentUser && window.currentUser) currentUser = window.currentUser;
  if(!currentUser){openAuthModal('login');return;}
  closeUserDropdown();
  const _adm=document.getElementById('adminPanelOverlay');
  if(_adm&&_adm.style.display!=='none') closeAdminPanel(true);
  const _mod=document.getElementById('modPanelOverlay');
  if(_mod&&_mod.style.display!=='none') closeModPanel(true);
  document.getElementById('gridLayout').style.display='none';
  document.getElementById('fontDetailPage').classList.remove('visible');
  document.getElementById('toolbarBar').style.display='none';
  document.getElementById('heroSection').style.display='none';
  document.getElementById('authorPage').style.display='none';
  document.getElementById('profilePage').style.display='block';
  window.scrollTo(0,0);
  renderProfilePage();
  const activeTab = tab || 'myfonts';
  switchProfileTab(activeTab);
  const newProfileUrl = '/profile/' + activeTab;
  if(location.pathname === newProfileUrl){
    _safeHistoryReplace({page:'profile', tab: activeTab}, '', newProfileUrl);
  } else {
    _safeHistoryPush({page:'profile', tab: activeTab}, '', newProfileUrl);
  }
  document.title = 'My Profile – Font·Monster';
  updatePageMeta({ title: 'My Profile – Font·Monster', url: '/profile' });
}
function renderProfilePage(){
  if(!currentUser && window.currentUser) currentUser = window.currentUser;
  if(!currentUser)return;
  document.getElementById('profileName').textContent=currentUser.name;
  document.getElementById('profileEmail').textContent=currentUser.email;
  const saved=currentUser.saved||[];
  document.getElementById('profileSavedCount').textContent=saved.length;
  const myFonts=getMySubmittedFonts();
  document.getElementById('profileMyFontsCount').textContent=myFonts.length;
  applyProfilePhoto(currentUser.photo||null);
  renderProfileSaved(saved);
}

function getMySubmittedFonts(){
  if(!currentUser && window.currentUser) currentUser = window.currentUser;
  if(!currentUser) return [];
  try{
    const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
    return sub.filter(f=>f.submittedById===currentUser.id);
  }catch(e){return [];}
}

function renderProfileSaved(saved){
  const grid=document.getElementById('profileSavedGrid');
  const empty=document.getElementById('profileEmpty');
  if(!saved.length){grid.style.display='none';empty.style.display='block';return;}
  grid.style.display='grid';empty.style.display='none';
  const fonts=saved.map(id=>FONTS.find(f=>f.id===id)).filter(Boolean);
  grid.innerHTML=fonts.map(f=>{
    loadFont(f);
    const lic=LICENSE_META[f.license]||{label:f.license,cls:'lic-demo'};
    return `<div class="font-card" onclick="openDetail('${f.id}')" style="cursor:pointer;margin-bottom:0">
      <div class="card-header">
        <div class="card-header-shimmer"></div>
        <div class="ch-fall"></div>
        <div style="position:relative;z-index:2;flex:1;min-width:0">
          <div class="card-name">${esc(f.name)}</div>
          <div class="card-author"><span onclick="event.stopPropagation();openAuthorPage('${esc(f.author)}')" style="cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${esc(f.author)}</span> · ${f.year}</div>
        </div>
        <div class="card-actions" style="position:relative;z-index:2">
          <button class="icon-btn liked" aria-label="Saved – click to unsave" aria-pressed="true" onclick="event.stopPropagation();toggleLike('${f.id}',this);renderProfileSaved(currentUser?.saved||[])">♥</button>
        </div>
      </div>
      <div class="card-preview-area">
        <div class="card-preview" style="font-family:'${f.name}',sans-serif;font-size:38px">${esc(f.name)}</div>
      </div>
      <div class="card-footer">
        <div class="tags">${f.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
        <span class="lic-badge ${lic.cls}">${lic.label}</span>
      </div>
    </div>`;
  }).join('');
}

function renderMyFontsTab(){
  const myFonts=getMySubmittedFonts();
  const grid=document.getElementById('myFontsGrid');
  const empty=document.getElementById('myFontsEmpty');
  if(!myFonts.length){grid.style.display='none';empty.style.display='block';return;}
  grid.style.display='';empty.style.display='none';
  const adminReqs=getAdminRequests();
  grid.innerHTML=myFonts.map(f=>{
    const isPending=f.pending!==false;
    const hasPendingEdit=adminReqs.some(r=>r.id===f.id&&r.requestType==='edit');
    const statusColor=isPending?'var(--orange)':'var(--green)';
    const statusBg=isPending?'var(--orange-dim)':'var(--green-dim)';
    const statusLabel=isPending?'✏️ Pending Review':'✅ Approved';
    const statusExtra=!isPending&&f.approvedAt?`<div style="font-size:11px;color:var(--text3);margin-top:4px">Approved ${new Date(f.approvedAt).toLocaleDateString()}</div>`
      :(isPending?`<div style="font-size:11px;color:var(--text3);margin-top:4px">Submitted ${f.submittedAt?new Date(f.submittedAt).toLocaleDateString():'recently'} · Awaiting admin review</div>`:'')
    if(!f.previewImg) loadFont(f);
    const thumbStyle='width:56px;height:56px;border-radius:12px;flex-shrink:0;overflow:hidden;';
    const thumb=f.previewImg
      ? `<div style="${thumbStyle}"><img src="${f.previewImg}" style="width:100%;height:100%;object-fit:cover;"></div>`
      : `<div style="${thumbStyle}background:linear-gradient(135deg,var(--accent) 0%,#be123c 100%);display:flex;align-items:center;justify-content:center;font-family:'${f.name}',sans-serif;font-size:22px;color:#fff;letter-spacing:-0.03em">Aa</div>`;
    return `<div style="
      background:var(--surface-solid);border:1px solid ${hasPendingEdit?'var(--orange)':'var(--border)'};
      border-radius:var(--radius-lg);padding:16px 18px;
      display:flex;align-items:center;gap:14px;flex-wrap:wrap;
      margin-bottom:10px;transition:box-shadow .15s;
    " onmouseover="this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.boxShadow=''">
      ${thumb}
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700;letter-spacing:-0.02em;color:var(--text)">${esc(f.name)}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:1px">${esc(f.author)} · ${cap(f.cat)} · ${f.year}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap">
          <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:980px;background:${statusBg};color:${statusColor};border:1px solid ${statusColor}33">${statusLabel}</span>
          ${hasPendingEdit?`<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:980px;background:var(--orange-dim);color:var(--orange);border:1px solid rgba(255,149,0,0.3)">✏ Edit pending review</span>`:''}
          ${f.tags.slice(0,3).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}
        </div>
        ${statusExtra}
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0">
        <button onclick="openEditFont('${f.id}')" style="
          padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;
          background:${hasPendingEdit?'var(--orange-dim)':'var(--surface3)'};
          border:1px solid ${hasPendingEdit?'rgba(255,149,0,0.4)':'var(--border2)'};
          color:${hasPendingEdit?'var(--orange)':'var(--text2)'};
          cursor:pointer;transition:all .15s;font-family:var(--sans);letter-spacing:-0.01em;
        " onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='${hasPendingEdit?'rgba(255,149,0,0.4)':'var(--border2)'}';this.style.color='${hasPendingEdit?'var(--orange)':'var(--text2)'}'">
          ✏️ Edit${hasPendingEdit?' (pending)':''}
        </button>
        <button onclick="deleteMyFont('${f.id}')" style="
          padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;
          background:var(--surface3);border:1px solid var(--border2);color:var(--text3);
          cursor:pointer;transition:all .15s;font-family:var(--sans);letter-spacing:-0.01em;
        " onmouseover="this.style.borderColor='var(--red)';this.style.color='var(--red)'" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--text3)'">
          🗑️ Delete
        </button>
      </div>
    </div>`;
  }).join('');
}

function switchProfileTab(tab){
  document.getElementById('ptMyFonts').classList.toggle('active',tab==='myfonts');
  document.getElementById('ptSaved').classList.toggle('active',tab==='saved');
  document.getElementById('profileTabSaved').style.display=tab==='saved'?'':'none';
  document.getElementById('profileTabMyFonts').style.display=tab==='myfonts'?'':'none';
  if(tab==='myfonts') renderMyFontsTab();
  if(location.pathname.startsWith('/profile')){
    _safeHistoryReplace({page:'profile',tab:tab},'','/profile/'+tab);
  }
}

function closeProfile(){
  document.getElementById('profilePage').style.display='none';
  document.getElementById('gridLayout').style.display='';
  document.getElementById('toolbarBar').style.display='';
  document.getElementById('heroSection').style.display='';
  syncUrl(false);
  renderFonts();
  if(typeof window._restoreGridScroll==='function') window._restoreGridScroll();
  updatePageMeta({title:'Font·Monster - Free Font Discovery',url:'/'});
}

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
  if(!allowed.includes(fext)){showToast(`❌ "${f.name}" - only TTF, OTF, WOFF, WOFF2 allowed`);return;}
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
  if(idx<0){showToast('⚠️ Font not found'); closeEditFont(); return;}

  // Admin direct edit - bypass approval queue
  if(window._adminDirectEditId===id){
    window._adminDirectEditId=null;
    // Update in tv_submitted if exists, otherwise insert
    if(idx>=0){
      sub[idx]={...sub[idx],...updates,adminEditedAt:new Date().toISOString()};
    } else {
      // Built-in font - add an override entry to tv_submitted
      const fi=FONTS.find(f=>f.id===id);
      if(fi) sub.push({...fi,...updates,adminEditedAt:new Date().toISOString(),pending:false});
    }
    localStorage.setItem("tv_submitted",JSON.stringify(sub));
    // Update Firestore if available
    if(window._fbFns && window._fbDb){
      const {doc, updateDoc} = window._fbFns;
      const fsUpdates = {...updates, adminEditedAt:new Date().toISOString()};
      updateDoc(doc(window._fbDb,'submitted_fonts',id),fsUpdates).catch(e=>console.warn('Firestore admin edit error:',e));
    }
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
    // Close modal - admin panel stays visible underneath
    document.getElementById('editFontModal').classList.remove('open');
    window._adminPanelWasOpen=false;
    document.body.style.overflow='hidden';
    _renderAdminAll();
    adminLog('edit',updates.name,'Admin direct edit');
    showToast(`✅ "${updates.name}" updated`);
    return;
  }

  // Regular user edit - send to admin queue for approval
  const reqs=getAdminRequests();
  const existingReqIdx=reqs.findIndex(r=>r.id===id&&r.requestType==='edit');
  const editReq={
    ...sub[idx],...updates,
    requestType:'edit',
    editRequestAt:new Date().toISOString(),
    submittedByName:currentUser?currentUser.name:sub[idx].submittedByName,
    submittedById:currentUser?currentUser.id:sub[idx].submittedById
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

