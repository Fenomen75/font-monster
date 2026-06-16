// ??????????????????????????????????????????
// AUTH SYSTEM
// ??????????????????????????????????????????
// window.currentUser is declared at top of main globals block (line ~4973)

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
