// ?? PROFILE PAGE
function showProfile(tab){
  if(!window.currentUser && window.currentUser) window.currentUser = window.currentUser;
  if(!window.currentUser){openAuthModal('login');return;}
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
  if(!window.currentUser && window.currentUser) window.currentUser = window.currentUser;
  if(!window.currentUser)return;
  document.getElementById('profileName').textContent=window.currentUser.name;
  document.getElementById('profileEmail').textContent=window.currentUser.email;
  const saved=window.currentUser.saved||[];
  document.getElementById('profileSavedCount').textContent=saved.length;
  const myFonts=getMySubmittedFonts();
  document.getElementById('profileMyFontsCount').textContent=myFonts.length;
  applyProfilePhoto(window.currentUser.photo||null);
  renderProfileSaved(saved);
}

function getMySubmittedFonts(){
  if(!window.currentUser && window.currentUser) window.currentUser = window.currentUser;
  if(!window.currentUser) return [];
  try{
    const sub=JSON.parse(localStorage.getItem("tv_submitted")||"[]");
    return sub.filter(f=>f.submittedById===window.currentUser.id);
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
          <button class="icon-btn liked" aria-label="Saved – click to unsave" aria-pressed="true" onclick="event.stopPropagation();toggleLike('${f.id}',this);renderProfileSaved(window.currentUser?.saved||[])">♥</button>
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
  try{ history.replaceState({page:'grid'},'','/'); }catch(e){}
  syncUrl(true);
  renderFonts();
  if(typeof window._restoreGridScroll==='function') window._restoreGridScroll();
  updatePageMeta({title:'Font·Monster - Free Font Discovery',url:'/'});
}

