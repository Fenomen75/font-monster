let FONTS=[...FONTS_BASE],activeCategory="all",searchTerm="",previewText="",fontSize=window.innerWidth<=768?38:100;
// Buq 4 düzəlişi: type="module" script defer kimi işləyir — onAuthStateChanged gəlməzdən
// əvvəl window.currentUser null qalır. localStorage cache-dən ilkin dəyəri oxuyuruq ki yarış vəziyyəti olmasın.
window.currentUser=(function(){
  try{
    var c=localStorage.getItem('fn_current_user');
    if(!c) return null;
    var u=JSON.parse(c);
    // isAdmin/isModerator heç vaxt cache-dən oxunmur — Firestore-dan gəlməlidir.
    // Bu, brauzer console-dan localStorage.setItem ilə admin saxtakarlığını önləyir.
    u.isAdmin=false;
    u.isModerator=false;
    return u;
  }catch(e){return null;}
})();
window.currentUser=window.currentUser; // Firebase onAuthStateChanged gəldikdə üzərinə yazacaq
let likedFonts=new Set(),loadedFonts=new Set(),debounceTimer,currentDetailFont=null;
let activeDetailWeight='400',pvMode='text',pvBold=false,pvItalic=false,pvAlign='left';
let pvBgColor='#ffffff',pvTextColor='#111111',pvBgImage=null;
let activeLicenseFilter=null,compareFonts=[],recentlyViewed=[],activeCodeTab='css';
let activeTag='';
let shortcutsOpen=false,darkMode=false;

// ?? ADMIN helpers ??
function getAdminRequests(){try{return JSON.parse(localStorage.getItem('tv_admin_requests')||'[]');}catch(e){return[];}}
function saveAdminRequests(arr){try{localStorage.setItem('tv_admin_requests',JSON.stringify(arr));}catch(e){}}
