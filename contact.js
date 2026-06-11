// ??????????????????????????????????????????
// CONTACT MODAL
// ??????????????????????????????????????????
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
  if(currentUser){
    const n=document.getElementById('ctName');
    const e=document.getElementById('ctEmail');
    if(n&&!n.value) n.value=currentUser.name||'';
    if(e&&!e.value) e.value=currentUser.email||'';
  }
}
function closeContactModal(){
  const o=document.getElementById('contactOverlay');
  if(o) o.classList.remove('open');
  document.body.style.overflow='';
  ['ctName','ctEmail','ctMessage'].forEach(id=>{
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

