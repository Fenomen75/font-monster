// ---- [app.js lines 1284-1315] ----
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

// ??????????????????????????????????????????
// AUTH SYSTEM
// ??????????????????????????????????????????
// window.currentUser is declared at top of main globals block (line ~4973)

// ---- [app.js lines 1316-1825] ----
function getUsers(){try{return JSON.parse(localStorage.getItem('fn_users')||'[]');}catch(e){return[];}}
function saveUsers(u){try{localStorage.setItem('fn_users',JSON.stringify(u));}catch(e){}}
function getCurrentUser(){try{const u=localStorage.getItem('fn_current_user');return u?JSON.parse(u):null;}catch(e){return null;}}
function saveCurrentUser(u){
  // Never persist password, isAdmin, or isModerator into localStorage.
  // isAdmin/isModerator must always be re-fetched from Firestore on auth init —
  // caching them allows anyone to fake admin access via browser console.
  const safe={...u};
  delete safe.password;
  delete safe.isAdmin;
  delete safe.isModerator;
  try{localStorage.setItem('fn_current_user',JSON.stringify(safe));}catch(e){}
}

// SHA-256 via Web Crypto - used only by the offline fallback auth system
async function _sha256(str){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function initAuth(){
  window.currentUser=getCurrentUser();
  if(window.currentUser){updateNavForUser(window.currentUser);}
  // Sync likedFonts from user account
  if(window.currentUser){
    likedFonts=new Set(window.currentUser.saved||[]);
  }
  syncSubmittedFonts();
  // Check admin URL
  // ?admin=1 URL bypass removed - admin panel only accessible after Firebase confirms isAdmin
}

async function socialLogin(provider) {
  const auth = window._fbAuth;
  const db = window._fbDb;
  if (!auth) { showToast('Firebase not ready'); return; }
  let prov;
  if (provider === 'google') prov = window._fbGoogleProvider;
  else if (provider === 'github') prov = window._fbGithubProvider;
  else if (provider === 'facebook') prov = window._fbFacebookProvider;
  if (!prov) return;
  try {
    closeAuthModal(); // Google popup acilmadan evvel modali bag la
    const result = await window._fbSignInWithPopup(auth, prov);
    const fbUser = result.user;
    // Create/update Firestore user doc
    const {doc, setDoc, getDoc, serverTimestamp} = window._fbFns;
    const snap = await getDoc(doc(db, 'users', fbUser.uid));
    const extra = snap.exists() ? snap.data() : {};
    console.log('🔐 Login UID:', fbUser.uid, '| Firestore doc exists:', snap.exists(), '| isAdmin:', extra.isAdmin);
    if (!snap.exists()) {
      await setDoc(doc(db, 'users', fbUser.uid), {
        name: fbUser.displayName || fbUser.email.split('@')[0],
        email: fbUser.email,
        photo: fbUser.photoURL || null,
        saved: [],
        joined: new Date().toISOString(),
        emailVerified: true,
        createdAt: serverTimestamp()
      });
    }
    // isAdmin ve diger melumatları dərhal yüklə - onAuthStateChanged-i gözləmə
    const user = {
      id: fbUser.uid,
      name: fbUser.displayName || extra.name || fbUser.email.split('@')[0],
      email: fbUser.email,
      emailVerified: true,
      photo: fbUser.photoURL || extra.photo || null,
      saved: extra.saved || [],
      joined: extra.joined || fbUser.metadata.creationTime,
      isAdmin: extra.isAdmin === true,
      isModerator: extra.isModerator === true
    };
    window.currentUser = user;
    window.currentUser = window.currentUser;
    likedFonts = new Set(user.saved);
    window.likedFonts = likedFonts;
    saveCurrentUser(user); // isAdmin/isModerator bu funksiya tərəfindən cache-ə yazılmır
    if(typeof updateNavForUser === 'function') updateNavForUser(user);
    showToast('👋 Welcome, ' + (fbUser.displayName || 'there') + '!' + (user.isAdmin ? ' 👑 Admin' : ''));
  } catch(err) {
    if (err.code === 'auth/account-exists-with-different-credential') {
      showToast('An account already exists with this email. Try another login method.');
    } else if (err.code !== 'auth/popup-closed-by-user') {
      showToast('Sign-in error: ' + err.message);
    }
  }
}

function openAuthModal(tab){
  const o=document.getElementById('authOverlay');
  o.classList.add('open');
  document.body.style.overflow='hidden';
  switchAuthTab(tab||'login');
  setTimeout(()=>{
    const inp=tab==='signup'?document.getElementById('signupName'):tab==='forgot'?document.getElementById('forgotEmail'):document.getElementById('loginEmail');
    if(inp)inp.focus();
  },120);
}
function closeAuthModal(){
  const o = document.getElementById('authOverlay');
  if(!o) return;
  o.classList.remove('open');
  document.body.style.overflow='';
}
function switchAuthTab(tab){
  document.getElementById('authLoginTab').style.display=tab==='login'?'block':'none';
  document.getElementById('authSignupTab').style.display=tab==='signup'?'block':'none';
  document.getElementById('authForgotTab').style.display=tab==='forgot'?'block':'none';
  document.getElementById('authVerifyTab').style.display=tab==='verify'?'block':'none';
  document.getElementById('loginError').textContent='';
  document.getElementById('signupError').textContent='';
  if(tab==='forgot'){
    document.getElementById('forgotError').textContent='';
    document.getElementById('forgotSuccess').style.display='none';
    const btn=document.getElementById('forgotSubmitBtn');
    if(btn){btn.textContent='Send Reset Link';btn.disabled=false;}
  }
}

async function submitForgotPassword(){
  const email=document.getElementById('forgotEmail').value.trim();
  const err=document.getElementById('forgotError');
  const success=document.getElementById('forgotSuccess');
  const btn=document.getElementById('forgotSubmitBtn');
  err.textContent='';
  success.style.display='none';
  if(!email){err.textContent='Please enter your email address.';return;}
  if(!/\S+@\S+\.\S+/.test(email)){err.textContent='Please enter a valid email.';return;}
  btn.textContent='Sending.';btn.disabled=true;
  if(window.fbResetPassword){
    try{
      await window.fbResetPassword(email);
      success.style.display='block';
      btn.textContent='Resend Link';btn.disabled=false;
    }catch(e){
      btn.textContent='Send Reset Link';btn.disabled=false;
      if(e.code==='auth/user-not-found'||e.code==='auth/invalid-email'){
        err.textContent='No account found with this email address.';
      } else {
        err.textContent=e.message||'Something went wrong. Please try again.';
      }
    }
  } else {
    // Fallback: no Firebase - show generic message
    setTimeout(()=>{
      success.style.display='block';
      btn.textContent='Resend Link';btn.disabled=false;
    },800);
  }
}

function submitLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPassword').value;
  const err=document.getElementById('loginError');
  const btn=document.querySelector('#authLoginTab .auth-submit');
  if(!email||!pass){err.textContent='Please fill in all fields.';return;}
  err.textContent='';
  if(btn){btn.textContent='Signing in…';btn.disabled=true;}
  if(window.fbLogin){
    window.fbLogin(email,pass)
      .then(()=>{if(btn){btn.textContent='Sign In';btn.disabled=false;}closeAuthModal();showToast('👋 Welcome back!');})
      .catch(e=>{
        if(btn){btn.textContent='Sign In';btn.disabled=false;}
        const isWrongPass=e.code==='auth/invalid-credential'||e.code==='auth/wrong-password';
        const isGoogleAccount=e.code==='auth/account-exists-with-different-credential';
        err.innerHTML=isGoogleAccount
          ? 'This email is linked to Google. <span onclick="closeAuthModal();socialLogin(\'google\')" style="color:var(--accent);cursor:pointer;font-weight:600;text-decoration:underline;text-underline-offset:2px">Sign in with Google</span>'
          : isWrongPass
          ? 'Incorrect email or password. <span onclick="openAuthModal(\'forgot\')" style="color:var(--accent);cursor:pointer;font-weight:600;text-decoration:underline;text-underline-offset:2px">Forgot password?</span>'
          : e.message;
      });
  } else {
    // fallback localStorage - compare against stored SHA-256 hash
    (async()=>{
      const users=getUsers();
      const hash=await _sha256(pass);
      const user=users.find(u=>u.email===email&&u.passwordHash===hash);
      if(!user){if(btn){btn.textContent='Sign In';btn.disabled=false;}err.textContent='Incorrect email or password.';return;}
      const safeUser={...user};delete safeUser.passwordHash;
      window.currentUser=safeUser;saveCurrentUser(safeUser);
      likedFonts=new Set(window.currentUser.saved||[]);
      updateNavForUser(window.currentUser);closeAuthModal();
      syncSubmittedFonts();showToast(`👋 Welcome back, ${user.name}!`);
    })();
  }
}

function submitSignup(){
  const name=document.getElementById('signupName').value.trim();
  const email=document.getElementById('signupEmail').value.trim();
  const pass=document.getElementById('signupPassword').value;
  const pass2=(document.getElementById('signupPasswordConfirm')||{}).value||pass;
  const err=document.getElementById('signupError');
  if(!name||!email||!pass){err.textContent='Please fill in all fields.';return;}
  if(pass.length<6){err.textContent='Password must be at least 6 characters.';return;}
  if(pass!==pass2){err.textContent='Passwords do not match.';return;}
  if(!/\S+@\S+\.\S+/.test(email)){err.textContent='Please enter a valid email.';return;}
  err.textContent='Creating account.';
  if(window.fbSignup){
    window.fbSignup(name,email,pass)
      .then(()=>{
        // Modalı bağlamaq əvəzinə verify tab-ı göstər
        const verifyAddr=document.getElementById('verifyEmailAddr');
        if(verifyAddr) verifyAddr.textContent=email;
        switchAuthTab('verify');
      })
      .catch(e=>{
        const msg=e.code==='auth/email-already-in-use'?'An account with this email already exists.':e.message;
        err.textContent=msg;
      });
  } else {
    // fallback localStorage - store SHA-256 hash, NEVER plaintext password
    (async()=>{
      const users=getUsers();
      if(users.find(u=>u.email===email)){err.textContent='An account with this email already exists.';return;}
      const passwordHash=await _sha256(pass);
      const newUser={id:'u_'+Date.now(),name,email,passwordHash,saved:[],joined:new Date().toISOString()};
      users.push(newUser);saveUsers(users);
      const safeUser={...newUser};delete safeUser.passwordHash;
      window.currentUser=safeUser;saveCurrentUser(safeUser);
      updateNavForUser(window.currentUser);closeAuthModal();
      syncSubmittedFonts();showToast(`🎉 Account created! Welcome, ${name}!`);
    })();
  }
}

// ?? Email dogrulama yenid?n gönd?r ??
async function resendVerificationEmail(){
  const btn=document.getElementById('resendVerifyBtn');
  if(!btn) return;
  const fbUser = window._fbAuth && window._fbAuth.window.currentUser;
  if(!fbUser){showToast('❌ Error: user not found');return;}
  btn.textContent='Sending.';btn.disabled=true;
  try{
    const { sendEmailVerification } = window._fbFns;
    await sendEmailVerification(fbUser, {
      url: window.location.origin + '/',
      handleCodeInApp: false
    });
    showToast('📧 Verification link resent!');
    btn.textContent='✓ Sent';
    setTimeout(()=>{btn.textContent='Resend Email';btn.disabled=false;},4000);
  }catch(e){
    showToast('❌ Error: '+e.message);
    btn.textContent='Resend Email';btn.disabled=false;
  }
}

function showVerifyEmailModal(){
  document.getElementById('verifyEmailModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeVerifyEmailModal(){
  document.getElementById('verifyEmailModal').classList.remove('open');
  document.body.style.overflow='';
}

// ?? Email dogrulama banner-i (login etmis amma dogrulamamis) ??
function showEmailVerifyBanner(){
  if(document.getElementById('emailVerifyBanner')) return;
  const banner=document.createElement('div');
  banner.id='emailVerifyBanner';
  banner.style.cssText=`
    position:fixed;bottom:72px;left:50%;transform:translateX(-50%);
    background:linear-gradient(135deg,#007aff,#0051d5);
    color:#fff;padding:11px 20px;border-radius:12px;
    font-size:13px;font-weight:500;z-index:900;
    box-shadow:0 4px 24px rgba(0,122,255,0.35);
    display:flex;align-items:center;gap:12px;
    animation:ssSlideUp .4s cubic-bezier(0.34,1.56,0.64,1) both;
    max-width:calc(100vw - 32px);
  `;
  banner.innerHTML=`
    <span>⚠️ Your email is not verified yet</span>
    <button onclick="resendVerificationEmail()" style="
      background:rgba(255,255,255,0.22);color:#fff;border:1px solid rgba(255,255,255,0.35);
      border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;
      font-family:var(--sans);white-space:nowrap;transition:background .15s;
    " onmouseover="this.style.background='rgba(255,255,255,0.32)'" onmouseout="this.style.background='rgba(255,255,255,0.22)'">Send</button>
    <button onclick="document.getElementById('emailVerifyBanner').remove()" style="
      background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;
      font-size:16px;padding:0 2px;line-height:1;
    ">×</button>
  `;
  document.body.appendChild(banner);
  // 8 saniy? sonra öz-özün? baglansin
  setTimeout(()=>banner.remove?.(), 8000);
}

function logoutUser(){
  closeUserDropdown();
  if(window.fbLogout){
    window.fbLogout().then(()=>{
      window.currentUser=null;
      likedFonts=new Set();
      localStorage.removeItem('fn_current_user');
      localStorage.setItem('tv_liked','[]');
      showGrid();showToast('Logged out.');
    });
  } else {
    window.currentUser=null;localStorage.removeItem('fn_current_user');
    likedFonts=new Set();
    document.getElementById('userAvatarBtn').style.display='none';
    document.getElementById('loginBtn').style.display='flex';
    showGrid();showToast('Logged out.');renderFonts();
  }
}

// Admin status is read from Firestore (isAdmin:true field) - never stored in client code.
// To grant admin: Firebase Console ? Firestore ? users/{uid} ? isAdmin: true
function _isAdmin(u){ return !!(u && u.isAdmin === true); }
function _isModerator(u){ return !!(u && (u.isModerator === true || u.isAdmin === true)); }

function updateNavForUser(user){
  document.getElementById('loginBtn').style.display='none';
  const btn=document.getElementById('userAvatarBtn');
  btn.style.display='flex';
  const navAv=document.getElementById('userAvatarCircle');
  if(user.photo){navAv.innerHTML=`<img src="${user.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;}
  else{navAv.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;}
  document.getElementById('userAvatarName').textContent=user.name.split(' ')[0];
  document.getElementById('udName').textContent=user.name;
  document.getElementById('udEmail').textContent=user.email;
  const adminItem=document.getElementById('adminDropdownItem');
  if(adminItem) adminItem.style.display=_isAdmin(user)?'flex':'none';
  // Show moderator panel link for moderators (non-admin)
  const modItem=document.getElementById('modDropdownItem');
  if(modItem) modItem.style.display=(!_isAdmin(user) && user.isModerator)?'flex':'none';
  // Dogrulanmamis email üçün banner - yalniz admin olmayan istifad?çil?r?
  // (göy banner deaktiv edilib, ?vəzin? submit zamani modal göst?rilir)
}

function toggleUserDropdown(){
  document.getElementById('userDropdown').classList.toggle('open');
}
function closeUserDropdown(){
  document.getElementById('userDropdown').classList.remove('open');
}
document.addEventListener('click',e=>{
  const btn=document.getElementById('userAvatarBtn');
  if(btn&&!btn.contains(e.target))closeUserDropdown();
});

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

// ?? EDIT FONT - file/image helpers ??
// ---- [app.js lines 3617-3791] ----
function _resizeImageDataUrl(file,maxSize,quality){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width,h=img.height;
        if(w>h){if(w>maxSize){h=Math.round(h*maxSize/w);w=maxSize;}}
        else{if(h>maxSize){w=Math.round(w*maxSize/h);h=maxSize;}}
        const canvas=document.createElement('canvas');
        canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.onerror=reject;
      img.src=e.target.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

function uploadProfilePhoto(input){
  const file=input.files[0];if(!file)return;
  _resizeImageDataUrl(file,320,0.8).then(dataUrl=>{
    if(!window.currentUser)return;
    window._pendingProfilePhoto=dataUrl;
    applyProfilePhoto(dataUrl); // yalnız önizləmə - hələ saxlanmayıb
    const btn=document.getElementById('profilePhotoSaveBtn');
    if(btn){btn.style.display='inline-flex';btn.textContent='💾 Save photo';btn.disabled=false;}
  }).catch(()=>showToast('❌ Şəkil yüklənmədi'));
}

async function saveProfilePhoto(){
  const dataUrl=window._pendingProfilePhoto;
  if(!dataUrl||!window.currentUser)return;
  const btn=document.getElementById('profilePhotoSaveBtn');
  if(btn){btn.textContent='Saving…';btn.disabled=true;}
  window.currentUser.photo=dataUrl;
  let localOk=true,remoteOk=true;
  try{
    const safe={...window.currentUser};
    delete safe.password;delete safe.isAdmin;delete safe.isModerator;
    localStorage.setItem('fn_current_user',JSON.stringify(safe));
  }catch(e){localOk=false;console.warn('Profile photo localStorage save failed:',e);}
  if(window._fbFns && window._fbAuth && window._fbDb){
    try{
      const {doc, updateDoc} = window._fbFns;
      await updateDoc(doc(window._fbDb,'users',window.currentUser.id),{photo:dataUrl});
    }catch(e){remoteOk=false;console.warn('Photo Firestore update:',e);}
  } else {
    try{
      const users=getUsers();
      const idx=users.findIndex(u=>u.id===window.currentUser.id);
      if(idx>=0){users[idx].photo=dataUrl;saveUsers(users);}
    }catch(e){remoteOk=false;}
  }
  applyProfilePhoto(dataUrl);
  window._pendingProfilePhoto=null;
  if(localOk&&remoteOk){
    showToast('✅ Profile photo saved');
    if(btn){btn.style.display='none';}
  } else {
    showToast('⚠️ Save failed — try again');
    if(btn){btn.textContent='💾 Retry save';btn.disabled=false;}
  }
}
function applyProfilePhoto(url){
  const el=document.getElementById('profileAvatarLg');
  const avatarSvg=`<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  if(url){el.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;}
  else{el.innerHTML=avatarSvg;}
  const nav=document.getElementById('userAvatarCircle');
  const navSvg=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  if(nav){
    if(url)nav.innerHTML=`<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    else nav.innerHTML=navSvg;
  }
}


function heroBannerHueChange(val,type){
  val=parseInt(val);
  const banner=document.getElementById('heroBannerAuto');
  const txt=document.getElementById('heroBannerText');
  if(!banner)return;
  if(type==='bg'){
    const bg=val===0?'#0a0a0a':`hsl(${val},55%,14%)`;
    banner.style.background=bg;
    const dot=document.getElementById('heroBannerBgDot');
    if(dot)dot.style.background=bg;
  } else {
    const fg=val===0?'#ffffff':`hsl(${val},80%,78%)`;
    if(txt)txt.style.color=fg;
    const dot=document.getElementById('heroBannerFgDot');
    if(dot)dot.style.background=fg;
  }
}

function resetHeroBanner(){
  const font=currentDetailFont;if(!font)return;
  const txt=document.getElementById('fdpPvInput')?.value||font.name;
  const heroBgPalettes=[
    {bg:'#0a0a0a',text:'#ffffff'},{bg:'#111827',text:'#f9fafb'},
    {bg:'#0f172a',text:'#e2e8f0'},{bg:'#1a0a00',text:'#fde68a'},
    {bg:'#0a0a1a',text:'#c4b5fd'},{bg:'#042f2e',text:'#99f6e4'},
    {bg:'#1e1b18',text:'#fef3c7'},{bg:'#0c0a09',text:'#fafaf9'},
    {bg:'#18181b',text:'#f4f4f5'},
  ];
  const pal=heroBgPalettes[Math.floor(Math.random()*heroBgPalettes.length)];
  document.getElementById('fdpHeroInner').innerHTML=`
    <div id="heroBannerAuto" style="
        width:100%;max-width:100%;min-width:0;min-height:420px;border-radius:14px;overflow:hidden;height:auto;
        background:${pal.bg};
        display:flex;align-items:center;justify-content:center;
        margin-bottom:20px;
        box-shadow:0 4px 24px rgba(0,0,0,0.18);
        position:relative;box-sizing:border-box;flex-shrink:1;
      ">
      <div id="heroBannerText" style="
        font-family:'${esc(font.name)}',sans-serif;
        font-weight:${font.weight};
        font-size:72px;
        color:${pal.text};
        line-height:1.1;letter-spacing:-0.03em;
        user-select:none;text-align:center;
        word-break:break-word;white-space:normal;
        width:90%;max-width:90%;min-width:0;overflow:visible;
        display:block;/*-webkit-line-clamp:2*/;-webkit-box-orient:vertical;
        transition:font-size .1s;
      ">${esc(txt)}</div>
      <div style="position:absolute;bottom:12px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);padding:5px 11px;border-radius:980px;border:1px solid rgba(255,255,255,0.18);">
            <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);font-family:inherit;">A</span>
            <input type="range" class="hb-zoom" min="16" max="600" value="72" step="4"
              oninput="(function(v){var b=document.getElementById('heroBannerText');if(b)b.style.fontSize=v+'px';})(this.value)">
            <span style="font-size:15px;font-weight:700;color:rgba(255,255,255,0.6);font-family:inherit;">A</span>
          </div>
          <!-- Bg color -->
            <label style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:980px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);cursor:pointer;" data-tip="Background color">
              <span style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.6);font-family:inherit;">BG</span>
              <input type="color" value="#0a0a0a" style="width:18px;height:18px;border:none;border-radius:50%;padding:0;cursor:pointer;background:none;" oninput="(function(v){const b=document.getElementById('heroBannerAuto');if(b)b.style.background=v;})(this.value)">
            </label>
            <!-- Font color -->
            <label style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:980px;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);cursor:pointer;" data-tip="Text color">
              <span style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.6);font-family:inherit;">Text</span>
              <input type="color" value="#ffffff" style="width:18px;height:18px;border:none;border-radius:50%;padding:0;cursor:pointer;background:none;" oninput="(function(v){const t=document.getElementById('heroBannerText');if(t)t.style.color=v;})(this.value)">
            </label>
        </div>
        <label style="cursor:pointer;display:flex;align-items:center;gap:6px;
          background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);color:rgba(255,255,255,0.85);
          font-size:11px;font-weight:600;padding:6px 12px;border-radius:980px;
          border:1px solid rgba(255,255,255,0.2);transition:background .15s;flex-shrink:0;"
          onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Add image
          <input type="file" accept="image/*" style="display:none" onchange="heroBannerUpload(this)">
        </label>
      </div>
    </div>`;
}

function heroBannerUpload(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const font=currentDetailFont;if(!font)return;
    const txt=document.getElementById('fdpPvInput')?.value||font.name;
    document.getElementById('fdpHeroInner').innerHTML=`
      <div id="heroBannerAuto" style="position:relative;width:100%;max-width:100%;min-width:0;min-height:420px;border-radius:14px;overflow:hidden;height:auto;margin-bottom:20px;box-sizing:border-box;">
        <img src="${e.target.result}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">
        <div id="heroBannerTint" style="position:absolute;inset:0;background:rgba(0,0,0,0.4);transition:background .2s;"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:32px;box-sizing:border-box;pointer-events:none;">
          <div id="heroBannerText" style="
            font-family:'${font.name}',sans-serif;
            font-weight:${font.weight};
            font-size:64px;
            color:#fff;
            line-height:1.1;letter-spacing:-0.03em;
            user-select:none;text-align:center;
            word-break:break-word;white-space:normal;
            max-width:100%;overflow:visible;transition:font-size .1s;
          ">${txt}</div>
        </div>
        <div style="position:absolute;bottom:12px;left:12px;right:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;">
            <!-- Brightness slider -->
            <div style="display:flex;align-items:center;gap:7px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);padding:6px 11px;border-radius:980px;border:1px solid rgba(255,255,255,0.15);">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <input type="range" class="hb-bright" min="0" max="90" value="40" step="5"
                oninput="const t=document.getElementById('heroBannerTint');if(t)t.style.background='rgba(0,0,0,'+this.value/100+')'">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="rgba(255,255,255,0.7)" stroke="none"/></svg>
            </div>
            <!-- Font zoom slider -->
            <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);padding:5px 10px;border-radius:980px;border:1px solid rgba(255,255,255,0.15);">
              <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);font-family:sans-serif;line-height:1;">A</span>
              <input type="range" class="hb-zoom" min="16" max="600" value="72" step="4"
                oninput="const b=document.getElementById('heroBannerText');if(b)b.style.fontSize=this.value+'px'">
              <span style="font-size:14px;font-weight:700;color:rgba(255,255,255,0.7);font-family:sans-serif;line-height:1;">A</span>
            </div>
            <!-- Text color -->
            <label style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:980px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);cursor:pointer;" data-tip="Text color">
              <span style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.6);font-family:inherit;">Text</span>
              <input type="color" value="#ffffff" style="width:18px;height:18px;border:none;border-radius:50%;padding:0;cursor:pointer;background:none;" oninput="(function(v){const t=document.getElementById('heroBannerText');if(t)t.style.color=v;})(this.value)">
            </label>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <!-- Reset image -->
            <button onclick="resetHeroBanner()" style="cursor:pointer;display:flex;align-items:center;gap:5px;
              background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);color:rgba(255,255,255,0.8);
              font-size:11px;font-weight:600;padding:6px 11px;border-radius:980px;
              border:1px solid rgba(255,255,255,0.15);transition:background .15s;flex-shrink:0;font-family:inherit;"
              onmouseover="this.style.background='rgba(180,0,0,0.65)';this.style.color='#fff'" onmouseout="this.style.background='rgba(0,0,0,0.5)';this.style.color='rgba(255,255,255,0.8)'">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5.1L1 10"/></svg>
              Reset
            </button>
            <!-- Change image -->
            <label style="cursor:pointer;display:flex;align-items:center;gap:6px;
              background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);color:#fff;
              font-size:11px;font-weight:600;padding:6px 11px;border-radius:980px;
              border:1px solid rgba(255,255,255,0.15);transition:background .15s;flex-shrink:0;"
              onmouseover="this.style.background='rgba(0,0,0,0.75)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Change image
              <input type="file" accept="image/*" style="display:none" onchange="heroBannerUpload(this)">
            </label>
          </div>
        </div>
      </div>`;
    /* Re-apply mobile banner patch after image upload */
    if(window.innerWidth <= 768 && typeof window.patchHero === 'function') setTimeout(window.patchHero, 100);
  };
  reader.readAsDataURL(file);
}

