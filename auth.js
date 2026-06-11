// ??????????????????????????????????????????
// AUTH SYSTEM
// ??????????????????????????????????????????
// currentUser is declared at top of main globals block (line ~4973)

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
  currentUser=getCurrentUser();
  if(currentUser){updateNavForUser(currentUser);}
  // Sync likedFonts from user account
  if(currentUser){
    likedFonts=new Set(currentUser.saved||[]);
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
    currentUser = user;
    window.currentUser = currentUser;
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

function showEmailVerifiedModal(type) {
  var existing = document.getElementById('emailVerifiedModal');
  if(existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'emailVerifiedModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px';
  var isError = type === 'error';
  modal.innerHTML = `
    <div style="background:var(--surface);border-radius:20px;padding:40px 36px;max-width:400px;width:100%;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.25)">
      <div style="width:64px;height:64px;border-radius:50%;background:${isError ? 'rgba(239,68,68,.12)' : 'rgba(34,197,94,.12)'};display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
        ${isError
          ? '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
          : '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
        }
      </div>
      <h2 style="font-size:22px;font-weight:700;color:var(--text);margin:0 0 10px;letter-spacing:-0.03em">${isError ? 'Link expired' : 'Email verified!'}</h2>
      <p style="font-size:14px;color:var(--text2);line-height:1.6;margin:0 0 28px">${isError ? 'This verification link has expired or already been used. Please request a new one.' : 'Your email has been verified. You can now sign in and submit fonts.'}</p>
      <button onclick="document.getElementById('emailVerifiedModal').remove();document.body.style.overflow='';${isError ? "openAuthModal('login');" : "openAuthModal('login');"}" style="width:100%;padding:13px;background:var(--accent);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">${isError ? 'Back to Sign In' : 'Sign In →'}</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function showAccountRemovedModal(type) {
  var overlay = document.getElementById('accountRemovedOverlay');
  var title = document.getElementById('accountRemovedTitle');
  var msg = document.getElementById('accountRemovedMsg');
  if (type === 'banned') {
    title.textContent = 'Account Banned';
    msg.textContent = 'Your account has been banned. Please contact support for more information.';
  } else {
    title.textContent = 'Account Removed';
    msg.textContent = 'This account has been removed. If you think this is a mistake, please contact support.';
  }
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeAccountRemovedModal() {
  var overlay = document.getElementById('accountRemovedOverlay');
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function openAuthModal(tab){
  const o=document.getElementById('authOverlay');
  const wasAlreadyOpen = o.classList.contains('open');
  o.classList.add('open');
  document.body.style.overflow='hidden';
  // Clear fields only on fresh open, not when switching tabs
  if(!wasAlreadyOpen){
    var le=document.getElementById('loginEmail');
    var lp=document.getElementById('loginPassword');
    var sp=document.getElementById('signupPassword');
    var sn=document.getElementById('signupName');
    var se=document.getElementById('signupEmail');
    if(le) le.value='';
    if(lp) lp.value='';
    if(sp) sp.value='';
    if(sn) sn.value='';
    if(se) se.value='';
  }
  switchAuthTab(tab||'login');
  setTimeout(()=>{
    const inp=tab==='signup'?document.getElementById('signupName'):tab==='forgot'?document.getElementById('forgotEmail'):tab==='verify'?null:document.getElementById('loginEmail');
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
          : 'Something went wrong. Please try again.';
      });
  } else {
    // fallback localStorage - compare against stored SHA-256 hash
    (async()=>{
      const users=getUsers();
      const hash=await _sha256(pass);
      const user=users.find(u=>u.email===email&&u.passwordHash===hash);
      if(!user){if(btn){btn.textContent='Sign In';btn.disabled=false;}err.textContent='Incorrect email or password.';return;}
      const safeUser={...user};delete safeUser.passwordHash;
      currentUser=safeUser;saveCurrentUser(safeUser);
      likedFonts=new Set(currentUser.saved||[]);
      updateNavForUser(currentUser);closeAuthModal();
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
  const btn=document.querySelector('#authSignupTab .auth-submit');
  if(!name||!email||!pass){err.textContent='Please fill in all fields.';return;}
  if(pass.length<6){err.textContent='Password must be at least 6 characters.';return;}
  if(pass!==pass2){err.textContent='Passwords do not match.';return;}
  if(!/\S+@\S+\.\S+/.test(email)){err.textContent='Please enter a valid email.';return;}
  err.textContent='';
  if(btn){btn.textContent='Creating…';btn.disabled=true;}
  if(window.fbSignup){
    window.fbSignup(name,email,pass)
      .then(()=>{
        if(btn){btn.textContent='Create Account';btn.disabled=false;}
        // Modalı bağlamaq əvəzinə verify tab-ı göstər
        const verifyAddr=document.getElementById('verifyEmailAddr');
        if(verifyAddr) verifyAddr.textContent=email;
        switchAuthTab('verify');
      })
      .catch(e=>{
        if(btn){btn.textContent='Create Account';btn.disabled=false;}
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
      currentUser=safeUser;saveCurrentUser(safeUser);
      updateNavForUser(currentUser);closeAuthModal();
      syncSubmittedFonts();showToast(`🎉 Account created! Welcome, ${name}!`);
    })();
  }
}

// ?? Email dogrulama yenid?n gönd?r ??
async function resendVerificationEmail(){
  const btn=document.getElementById('resendVerifyBtn');
  const fbUser = window._fbAuth && window._fbAuth.currentUser;
  if(!fbUser){showToast('❌ Error: user not found');return;}
  if(btn){btn.textContent='Sending…';btn.disabled=true;}
  try{
    const { sendEmailVerification } = window._fbFns;
    await sendEmailVerification(fbUser, {
      url: window.location.origin + '/',
      handleCodeInApp: false
    });
    showToast('📧 Verification link resent!');
    if(btn){btn.textContent='✓ Sent';setTimeout(()=>{btn.textContent='Resend Email';btn.disabled=false;},4000);}
  }catch(e){
    showToast('❌ Error: '+e.message);
    if(btn){btn.textContent='Resend Email';btn.disabled=false;}
    throw e;
  }
}

// ?? Email dogrulama banner-i (login etmis amma dogrulamamis) ??
function showEmailVerifyBanner(){
  // Remove old banner if exists
  var old = document.getElementById('emailVerifyBanner');
  if(old) old.remove();
  // Show modal instead
  var existing = document.getElementById('emailVerifyModal');
  if(existing){ existing.style.display='flex'; document.body.style.overflow='hidden'; return; }
  var modal = document.createElement('div');
  modal.id = 'emailVerifyModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--surface);border-radius:20px;padding:40px 36px;max-width:400px;width:100%;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.25)">
      <div style="width:60px;height:60px;border-radius:50%;background:rgba(0,122,255,.12);display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#007aff" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </div>
      <h2 style="font-size:20px;font-weight:700;color:var(--text);margin:0 0 10px;letter-spacing:-0.03em">Verify your email</h2>
      <p style="font-size:14px;color:var(--text2);line-height:1.6;margin:0 0 24px">To submit fonts, you need to verify your email address first. Check your inbox and click the verification link.</p>
      <button onclick="(async()=>{try{await resendVerificationEmail();}catch(e){}finally{document.getElementById('emailVerifyModal').style.display='none';document.body.style.overflow='';}})()" style="width:100%;padding:12px;background:var(--accent);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .15s;margin-bottom:10px" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">Resend verification email</button>
      <button onclick="document.getElementById('emailVerifyModal').style.display='none';document.body.style.overflow='';" style="width:100%;padding:12px;background:transparent;color:var(--text2);border:1.5px solid var(--border2);border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;transition:opacity .15s" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function _clearUserLocalStorage(){
  // Remove all user-specific keys so a new user logging in on the same browser
  // cannot see any data belonging to the previous session.
  localStorage.removeItem('fn_current_user');
  localStorage.removeItem('fn_users');
  localStorage.removeItem('tv_liked');
  localStorage.removeItem('tv_submitted');
  localStorage.removeItem('tv_admin_requests');
  localStorage.removeItem('tv_admin_log');
  localStorage.removeItem('tv_trash');
  // Remove all cached font data blobs (fn_fontdata_*)
  Object.keys(localStorage).filter(k=>k.startsWith('fn_fontdata_')).forEach(k=>localStorage.removeItem(k));
}

function logoutUser(){
  closeUserDropdown();
  if(window.fbLogout){
    window.fbLogout().then(()=>{
      currentUser=null;
      likedFonts=new Set();
      _clearUserLocalStorage();
      showGrid();showToast('Logged out.');
    });
  } else {
    currentUser=null;
    likedFonts=new Set();
    _clearUserLocalStorage();
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
  // Dogrulanmamis email üçün xəbərdarlıq - yalniz admin olmayan istifadəçilər
  if(!_isAdmin(user) && user.emailVerified !== true){
    setTimeout(()=>showToast('⚠️ Your email is not verified yet. Verify to submit fonts.'), 1500);
  }
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

