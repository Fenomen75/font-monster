  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendEmailVerification, sendPasswordResetEmail, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, signInWithPopup, applyActionCode } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy, where, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getDatabase, ref, onValue, onDisconnect, set as rtSet, serverTimestamp as rtServerTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

  /*
   * ⚠️  SECURITY CHECKLIST — Firebase client config aşkar olması normaldır,
   *     lakin aşağıdakı tədbirlər MÜTLƏQdir:
   *
   *  1. Firebase Console → Project Settings → API restrictions:
   *       - Bu API key-i yalnız öz domain(lar)ınla məhdudlaşdır
   *         (HTTP referrers whitelist: https://yourdomain.com/*)
   *
   *  2. Firestore Security Rules (Firebase Console → Firestore → Rules):
   *
   *     rules_version = '2';
   *     service cloud.firestore {
   *       match /databases/{database}/documents {
   *         // Fonts — hər kəs oxuya bilər, yalnız auth user yaza bilər
   *         match /fonts/{fontId} {
   *           allow read: if true;
   *           allow create: if request.auth != null;
   *           allow update, delete: if request.auth != null
   *             && (request.auth.uid == resource.data.submittedBy
   *                 || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isModerator == true);
   *         }
   *         // Users — yalnız öz profilini yaza bilər
   *         match /users/{userId} {
   *           allow read: if true;
   *           allow write: if request.auth != null && request.auth.uid == userId;
   *         }
   *         // Admin-only collections
   *         match /admin/{doc} {
   *           allow read, write: if request.auth != null
   *             && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isModerator == true;
   *         }
   *       }
   *     }
   *
   *  3. Firebase Storage Rules (Firebase Console → Storage → Rules):
   *
   *     rules_version = '2';
   *     service firebase.storage {
   *       match /b/{bucket}/o {
   *         match /fonts/{allPaths=**} {
   *           allow read: if true;
   *           allow write: if request.auth != null
   *             && request.resource.size < 20 * 1024 * 1024  // 20 MB limit
   *             && (request.resource.contentType.matches('font/.*')
   *                 || request.resource.contentType.matches('application/octet-stream'));
   *         }
   *       }
   *     }
   *
   *  4. Realtime Database Rules (Firebase Console → Realtime Database → Rules):
   *       Minimum: { "rules": { ".read": false, ".write": false } }
   *       Presence üçün: yalnız /status/{uid} path-i auth user-a açıq olsun.
   */
  const firebaseConfig = {
    apiKey: "AIzaSyBvKAVE0Gnt9O5d_KOmaxhtCKlShoYWhlE",
    authDomain: "fontan-7bae4.firebaseapp.com",
    databaseURL: "https://fontan-7bae4-default-rtdb.firebaseio.com",
    projectId: "fontan-7bae4",
    storageBucket: "fontan-7bae4.firebasestorage.app",
    messagingSenderId: "845466542679",
    appId: "1:845466542679:web:697a8643d4c78cb6183912",
    measurementId: "G-BMMR0Y4GQE"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const rtdb = getDatabase(app);
  const storage = getStorage(app);
  window.rtdb = rtdb;
  window._rtRef = ref;
  window._rtSet = rtSet;
  window._rtOnValue = onValue;
  window._rtOnDisconnect = onDisconnect;
  window._rtServerTimestamp = rtServerTimestamp;
  window._fbStorage = storage;
  window._fbStorageRef = storageRef;
  window._fbUploadBytes = uploadBytes;
  window._fbGetDownloadURL = getDownloadURL;

  // Expose to global scope
  // OAuth providers
  window._fbGoogleProvider = new GoogleAuthProvider();
  window._fbGithubProvider = new GithubAuthProvider();
  window._fbFacebookProvider = new FacebookAuthProvider();
  window._fbSignInWithPopup = signInWithPopup;
  window._fbAuth = auth;
  window._fbDb = db;
  window._fbApplyActionCode = (code) => applyActionCode(auth, code);
  window._fbFns = {
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    signOut, onAuthStateChanged, updateProfile,
    doc, setDoc, getDoc, updateDoc, collection, addDoc,
    getDocs, deleteDoc, query, orderBy, where, increment, serverTimestamp,
    sendPasswordResetEmail, sendEmailVerification
  };
  window.fbResetPassword = (email) => sendPasswordResetEmail(auth, email);

  // Auth state listener - fires when page loads or user logs in/out
  let _authInitialized = false;
  onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      // Token-i yenilə ki emailVerified dəqiq olsun
      await fbUser.reload().catch(()=>{});
      // Get extra user data from Firestore
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      // Firestore doc yoxdursa — admin tərəfindən silinib, girişi blokla
      if (!snap.exists()) {
        await signOut(auth);
        closeAuthModal(); showAccountRemovedModal();
        return;
      }
      const extra = snap.data();
      // Ban check
      if (extra.banned === true) {
        await signOut(auth);
        closeAuthModal(); showAccountRemovedModal('banned');
        return;
      }
      // Firebase emailVerified true-dursa Firestore-u da yenilə
      if (fbUser.emailVerified && extra.emailVerified !== true) {
        try { await updateDoc(doc(db, 'users', fbUser.uid), { emailVerified: true }); } catch(e){}
      }
      const user = {
        id: fbUser.uid,
        name: fbUser.displayName || extra.name || fbUser.email.split('@')[0],
        email: fbUser.email,
        emailVerified: fbUser.emailVerified === true,
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
      // Persist locally for offline/reload fallback.
      // isAdmin and isModerator are NOT cached — they must always come from Firestore.
      // Caching them would allow anyone to spoof admin access via browser console.
      try{
        const safeUser = {...user};
        delete safeUser.isAdmin;
        delete safeUser.isModerator;
        localStorage.setItem('fn_current_user', JSON.stringify(safeUser));
        localStorage.setItem('tv_liked', JSON.stringify(user.saved));
      }catch(e){}
      if(typeof updateNavForUser === 'function') updateNavForUser(user);
      if(typeof syncSubmittedFonts === 'function') syncSubmittedFonts();
      if(typeof syncSubmittedFontsFromFirestore === 'function') syncSubmittedFontsFromFirestore();
      // Sayğacı admin girişinə görə yenilə
      if(typeof window._refreshOnlineCounter === 'function') window._refreshOnlineCounter();
      // Mark auth as initialized; renderFonts already ran at page load from line 9235
      _authInitialized = true;
    } else {
      currentUser = null;
      window.currentUser = null;
      likedFonts = new Set();
      window.likedFonts = likedFonts;
      const loginBtn = document.getElementById('loginBtn');
      const avatarBtn = document.getElementById('userAvatarBtn');
      if(loginBtn) loginBtn.style.display = 'flex';
      // Çıxış etdi - fake sayğaca qayıt
      if(typeof window._refreshOnlineCounter === 'function') window._refreshOnlineCounter();
      if(avatarBtn) avatarBtn.style.display = 'none';
      _authInitialized = true;
    }
  });

  // ?? FIREBASE AUTH FUNCTIONS ??
  window.fbSignup = async function(name, email, pass) {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, 'users', user.uid), {
      name, email,
      saved: [],
      joined: new Date().toISOString(),
      emailVerified: false,
      createdAt: serverTimestamp()
    });
    // Email doğrulama göndər
    await sendEmailVerification(user, {
      url: window.location.origin + '/',
      handleCodeInApp: false
    });
    return user;
  };

  window.fbLogin = async function(email, pass) {
    const { user } = await signInWithEmailAndPassword(auth, email, pass);
    return user;
  };

  window.fbLogout = async function() {
    await signOut(auth);
  };

  // ?? LIKES / SAVED ??
  window.fbToggleSave = async function(fontId) {
    if(!window.currentUser) return;
    const uid = window.currentUser.id;
    const ref = doc(db, 'users', uid);
    const saved = [...window.likedFonts];
    const idx = saved.indexOf(fontId);
    if(idx >= 0) saved.splice(idx, 1);
    else saved.push(fontId);
    await updateDoc(ref, { saved });
    window.currentUser.saved = saved;
    window.likedFonts = new Set(saved);
  };

  // ?? COMMENTS ??
  window.fbGetComments = async function(fontId) {
    // Note: orderBy('createdAt') removed - requires composite index in Firestore.
    // We sort client-side by date field instead.
    const q = query(collection(db, 'comments'), where('fontId','==',fontId));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({id: d.id, ...d.data()}));
    // Sort ascending by date (ISO string or Firestore Timestamp)
    docs.sort((a, b) => {
      const da = a.date || (a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().toISOString() : '') || '';
      const db_ = b.date || (b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().toISOString() : '') || '';
      return da < db_ ? -1 : da > db_ ? 1 : 0;
    });
    return docs;
  };

  window.fbAddComment = async function(fontId, text, rating) {
    if(!window.currentUser) return;
    // Duplicate guard: eyni istifadəçinin bu fontda artıq şərhi var mı?
    const dupQ = query(
      collection(db, 'comments'),
      where('fontId', '==', fontId),
      where('userId', '==', window.currentUser.id)
    );
    const dupSnap = await getDocs(dupQ);
    if(!dupSnap.empty) throw new Error('duplicate');
    const ref = await addDoc(collection(db, 'comments'), {
      fontId,
      userId: window.currentUser.id,
      user: window.currentUser.name,
      text,
      rating,
      likes: [],
      createdAt: serverTimestamp(),
      date: new Date().toISOString()
    });
    return ref.id;
  };

  window.fbDeleteComment = async function(commentId) {
    if(!window.currentUser) throw new Error('Not authenticated');
    // Verify ownership or admin before deleting (defence-in-depth - Firestore rules also enforce this)
    const snap = await getDoc(doc(db, 'comments', commentId));
    if(!snap.exists()) throw new Error('Comment not found');
    const data = snap.data();
    const isOwner = data.userId === window.currentUser.id;
    const isAdmin = window.currentUser.isAdmin === true;
    if(!isOwner && !isAdmin) throw new Error('Permission denied');
    await deleteDoc(doc(db, 'comments', commentId));
  };

  window.fbLikeComment = async function(commentId, userId) {
    const ref = doc(db, 'comments', commentId);
    const snap = await getDoc(ref);
    if(!snap.exists()) return;
    let likes = snap.data().likes || [];
    const idx = likes.indexOf(userId);
    if(idx >= 0) likes.splice(idx, 1);
    else likes.push(userId);
    await updateDoc(ref, { likes });
    return likes;
  };

  // ?? CONTACT MESSAGES ??
  window.fbSendContact = async function(name, email, subject, msg) {
    await addDoc(collection(db, 'contact_messages'), {
      name, email, subject, msg,
      read: false,
      createdAt: serverTimestamp(),
      date: new Date().toISOString()
    });
  };

  window.fbGetMessages = async function() {
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt','desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({id: d.id, ...d.data()}));
  };

  window.fbMarkRead = async function(msgId) {
    await updateDoc(doc(db, 'contact_messages', msgId), { read: true });
  };

  window.fbDeleteMessage = async function(msgId) {
    await deleteDoc(doc(db, 'contact_messages', msgId));
  };

  // ?? FONT DOWNLOADS ??
  window.fbIncrementDownload = async function(fontId) {
    const ref = doc(db, 'font_stats', fontId);
    try {
      await updateDoc(ref, { downloads: increment(1) });
    } catch(e) {
      await setDoc(ref, { downloads: 1 });
    }
  };

  console.log('✅ Firebase connected - fontan-7bae4');

  // ?? Load real download counts from Firestore font_stats ??
  window.syncFontStatsFromFirestore = async function() {
    if(!window._fbDb || !window._fbFns) return;
    try {
      const { collection, getDocs } = window._fbFns;
      const snap = await getDocs(collection(window._fbDb, 'font_stats'));
      snap.docs.forEach(d => {
        const data = d.data();
        if(typeof data.downloads === 'number' && data.downloads > 0) {
          // Real Firebase download counts override the simulated ones
          if(window.DL_COUNTS !== undefined) {
            window.DL_COUNTS[d.id] = data.downloads;
          }
        }
      });
      // DL_COUNTS updated in-place; no full re-render needed
      console.log('✅ Font stats synced from Firestore');
    } catch(e) { console.warn('Font stats sync error:', e); }
  };
  // Call after page is settled to ensure DL_COUNTS is initialized
  setTimeout(() => { if(window.syncFontStatsFromFirestore) window.syncFontStatsFromFirestore(); }, 1500);
  setTimeout(() => { if(typeof loadRatingsCache === 'function') loadRatingsCache(); }, 2000);

  // ?? Real-time presence ??
  const sid = Math.random().toString(36).slice(2);
  const sesRef = ref(rtdb, 'presence/' + sid);
  rtSet(sesRef, { t: rtServerTimestamp() });
  onDisconnect(sesRef).remove();
  window.addEventListener('pagehide', () => rtSet(sesRef, null));

  // Real Firebase Realtime presence sayı — bütün istifadəçilərə göstərilir
  let _lastRealCount = 1;
  onValue(ref(rtdb, 'presence'), snap => {
    const realCount = snap.exists() ? Object.keys(snap.val()).length : 1;
    _lastRealCount = realCount;
    const el = document.getElementById('onlineCount');
    const badge = document.getElementById('onlineBadge');
    if(badge) badge.style.display = 'flex';
    if(el) el.textContent = realCount.toLocaleString();
  });
  // Login/logout zamanı sayğacı yenilə

  window._refreshOnlineCounter = function(){
    const el = document.getElementById('onlineCount');
    if(!el) return;
    el.textContent = _lastRealCount.toLocaleString();
  };
