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
});
function handleFontImgSelect(input){
  const file=input.files[0];if(!file)return;
  if(!file.type.startsWith('image/')){showToast('⚠️ Only image files allowed');input.value='';return;}
  if(file.size>3*1024*1024){showToast('⚠ Your image is too large - please use an image under 3 MB');input.value='';return;}
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('sfImgThumb').src=e.target.result;
    document.getElementById('sfImgPlaceholder').style.display='none';
    document.getElementById('sfImgPreview').style.display='block';
  };
  reader.readAsDataURL(file);
}
function clearFontImg(){
  document.getElementById('sf-img').value='';
  document.getElementById('sfImgThumb').src='';
  document.getElementById('sfImgPlaceholder').style.display='flex';
  document.getElementById('sfImgPreview').style.display='none';
}

function _resetSubmitForm(){
  ['sf-name','sf-author','sf-year','sf-url','sf-description'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.value='';
  });
  const sfBox=document.getElementById('sf-tags-box');
  if(sfBox&&sfBox._tags){sfBox._tags.length=0;sfBox._renderChips();}
  const sfTagsInput=document.getElementById('sf-tags-input');if(sfTagsInput)sfTagsInput.value='';
  const sfTagsHidden=document.getElementById('sf-tags');if(sfTagsHidden)sfTagsHidden.value='';
  const sfCat=document.getElementById('sf-cat');if(sfCat){sfCat.value='';refreshCustomSelect('sf-cat');}
  const sfLic=document.getElementById('sf-license');if(sfLic){sfLic.value='';refreshCustomSelect('sf-license');}
  const sfDesc=document.getElementById('sf-desc-counter');if(sfDesc)sfDesc.textContent='0/300';
  clearFile();clearFontImg();
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
  const gfamily=name.replace(/\s+/g,'+');
  const tagsRaw=document.getElementById('sf-tags').value.trim();
  const year=parseInt(document.getElementById('sf-year').value)||new Date().getFullYear();
  const tags=tagsRaw?tagsRaw.split(/[,\s]+/).map(t=>t.trim()).filter(Boolean):['Custom'];
  const imgThumb=document.getElementById('sfImgThumb');
  const previewImg=imgThumb&&imgThumb.src&&imgThumb.src.startsWith('data:')?imgThumb.src:null;
  const newFont={
    id,name,author,cat,gfamily,weight:'400',tags,license,year,popular:60,sourceUrl:url||'',
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
  ['sf-name','sf-author','sf-tags','sf-year','sf-url','sf-description'].forEach(fid=>{const el=document.getElementById(fid);if(el)el.value='';});
  const sfBox=document.getElementById('sf-tags-box');
  if(sfBox&&sfBox._tags){sfBox._tags.length=0;sfBox._renderChips();}
  document.getElementById('sf-tags-input').value='';
  document.getElementById('sf-cat').value='';refreshCustomSelect('sf-cat');document.getElementById('sf-license').value='';refreshCustomSelect('sf-license');
  document.getElementById('licenseHint').textContent='';document.getElementById('licenseHint').classList.remove('show');
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
