// === URL Routing ===
// ── URL ROUTING: back/forward + deep link ────────────────────────────────────
(function(){
  // Browser-in öz scroll bərpasını deaktiv et - biz özümüz idarə edirik
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Grid scroll mövqeyini yadda saxla
  var _savedGridScroll = 0;
  window._saveGridScroll = function(){ _savedGridScroll = window.scrollY; };
  window._restoreGridScroll = function(){ setTimeout(function(){ window.scrollTo(0, _savedGridScroll); }, 50); };

  // Hər popstate-də açıq qalan overlay modalları bağlayan helper
  function _closeAllOverlayModals(){
    var ao=document.getElementById('authOverlay');
    if(ao&&ao.classList.contains('open')){ if(typeof closeAuthModal==='function') closeAuthModal(); }
    var sm=document.getElementById('submitModal');
    if(sm&&sm.classList.contains('open')){ if(typeof closeSubmit==='function') closeSubmit(); }
    var co=document.getElementById('contactOverlay');
    if(co&&co.classList.contains('open')){ if(typeof closeContactModal==='function') closeContactModal(); }
    var cmp=document.getElementById('compareModal');
    if(cmp&&cmp.classList.contains('open')){ if(typeof closeCompare==='function') closeCompare(); }
    var ef=document.getElementById('editFontModal');
    if(ef&&ef.classList.contains('open')){ if(typeof closeEditFont==='function') closeEditFont(); }
  }

  // Back / Forward düyməsi
  window.addEventListener('popstate', function(e){
    _closeAllOverlayModals();
    const path = location.pathname;
    const hash = location.hash;
    if(path.startsWith('/font/')){
      const fontId = decodeURIComponent(path.slice(6));
      if(typeof openDetail === 'function') openDetail(fontId);
    } else if(path.startsWith('/author/')){
      const author = decodeURIComponent(path.slice(8));
      if(typeof openAuthorPage === 'function') openAuthorPage(author);
    } else if(path.startsWith('/profile')){
      const tab = path.slice(9) || 'myfonts';
      if(typeof showProfile === 'function') showProfile(tab);
    } else if(path === '/admin'){
      if(typeof openAdminPanel === 'function') openAdminPanel();
    } else if(hash.startsWith('#font/')){
      const fontId = decodeURIComponent(hash.slice(6));
      if(typeof openDetail === 'function') openDetail(fontId);
    } else if(hash.startsWith('#author/')){
      const author = decodeURIComponent(hash.slice(8));
      if(typeof openAuthorPage === 'function') openAuthorPage(author);
    } else {
      // Grid — query params-dan state-i bərpa et
      _restoreMainView();
      if(typeof restoreFromUrl === 'function') restoreFromUrl();
      if(typeof window._restoreGridScroll === 'function') window._restoreGridScroll();
      // Açıq qalan panelləri bağla
      var ov=document.getElementById('adminPanelOverlay');
      if(ov && ov.style.display!=='none'){
        if(typeof closeAdminPanel==='function') closeAdminPanel(true);
        else {
          var dr=document.getElementById('adminPanelDrawer');
          ov.style.background='rgba(0,0,0,0)'; ov.style.backdropFilter='blur(0px)';
          if(dr){ dr.style.transform='translate(-50%,-50%) scale(0.96)'; dr.style.opacity='0'; }
          setTimeout(function(){ ov.style.display='none'; document.body.style.overflow=''; },300);
        }
      }
      var mov=document.getElementById('modPanelOverlay');
      if(mov && mov.style.display!=='none'){
        if(typeof closeModPanel==='function') closeModPanel(true);
      }
      var pm=document.getElementById('pairModal');
      if(pm && pm.style.opacity==='1'){
        if(typeof closePairModal==='function') closePairModal();
      }
    }
  });

  // Birbaşa link ilə giriş (link paylaşma)
  window.addEventListener('DOMContentLoaded', function(){
    const hash = location.hash;
    const path = location.pathname;
    // Font və ya author deep link
    var initFontId = null, initAuthor = null;
    if(path.startsWith('/font/')) initFontId = decodeURIComponent(path.slice(6));
    else if(path.startsWith('/author/')) initAuthor = decodeURIComponent(path.slice(8));
    else if(hash.startsWith('#font/')) initFontId = decodeURIComponent(hash.slice(6));
    else if(hash.startsWith('#author/')) initAuthor = decodeURIComponent(hash.slice(8));

    var waitFonts = function(cb, attempt){
      if(typeof FONTS !== 'undefined' && FONTS && FONTS.length){ cb(); }
      else if(attempt < 25){ setTimeout(function(){ waitFonts(cb, attempt+1); }, 150); }
      else { console.warn('waitFonts: FONTS 25 cəhddən sonra da hazır deyil, callback məcburi çağırılır'); cb(); }
    };

    if(initFontId){
      waitFonts(function(){ if(typeof openDetail==='function') openDetail(initFontId); }, 0);
    } else if(initAuthor){
      waitFonts(function(){ if(typeof openAuthorPage==='function') openAuthorPage(initAuthor); }, 0);
    } else if(path === '/admin'){
      waitFonts(function(){ if(typeof openAdminPanel==='function') openAdminPanel(); }, 0);
    } else if(path.startsWith('/profile')){
      var tab = path.slice(9) || 'myfonts';
      waitFonts(function(){ if(typeof showProfile==='function') showProfile(tab); }, 0);
    } else if(location.search){
      // Query params varsa grid state-ini bərpa et
      waitFonts(function(){ if(typeof restoreFromUrl==='function') restoreFromUrl(); }, 0);
    }
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      // Prioritet sırası: ən üstdəki (z-index yüksək) modal əvvəl bağlanır
      var pm = document.getElementById('pairModal');
      if(pm && pm.style.opacity === '1'){
        if(typeof closePairModal === 'function') closePairModal();
        return;
      }
      var em = document.getElementById('editFontModal');
      if(em && em.classList.contains('open')){
        if(typeof closeEditFont === 'function') closeEditFont();
        return;
      }
      var ao = document.getElementById('authOverlay');
      if(ao && ao.classList.contains('open')){
        if(typeof closeAuthModal === 'function') closeAuthModal();
        return;
      }
      var sm = document.getElementById('submitModal');
      if(sm && sm.classList.contains('open')){
        if(typeof closeSubmit === 'function') closeSubmit();
        return;
      }
      var co = document.getElementById('contactOverlay');
      if(co && co.classList.contains('open')){
        if(typeof closeContactModal === 'function') closeContactModal();
        return;
      }
      var cmp = document.getElementById('compareModal');
      if(cmp && cmp.classList.contains('open')){
        if(typeof closeCompare === 'function') closeCompare();
        return;
      }
      var adm = document.getElementById('adminPanelOverlay');
      if(adm && adm.style.display !== 'none'){
        if(typeof closeAdminPanel === 'function') closeAdminPanel();
        return;
      }
      var mod = document.getElementById('modPanelOverlay');
      if(mod && mod.style.display !== 'none'){
        if(typeof closeModPanel === 'function') closeModPanel();
        return;
      }
      // Shortcuts panel
      var sp = document.getElementById('shortcutsPanel');
      if(sp && sp.classList.contains('open')){
        sp.classList.remove('open');
        if(typeof shortcutsOpen !== 'undefined') shortcutsOpen = false;
        return;
      }
      // Font detail
      var fdp = document.getElementById('fontDetailPage');
      if(fdp && fdp.classList.contains('visible')){
        if(typeof closeDetail === 'function') closeDetail();
        return;
      }
      // Author page
      var ap = document.getElementById('authorPage');
      if(ap && ap.style.display !== 'none' && ap.style.display !== ''){
        if(typeof closeAuthorPage === 'function') closeAuthorPage();
        return;
      }
      // Profile page
      var pp = document.getElementById('profilePage');
      if(pp && pp.style.display !== 'none' && pp.style.display !== ''){
        if(typeof closeProfile === 'function') closeProfile();
        return;
      }
    }
  });

  function _restoreMainView(){
    if(typeof resetTxtUpload === 'function') resetTxtUpload();
    ['profilePage','authorPage'].forEach(function(id){ var el=document.getElementById(id); if(el) el.style.display='none'; });
    var grid=document.getElementById('gridLayout');
    var fdp=document.getElementById('fontDetailPage');
    var tb=document.getElementById('toolbarBar');
    var hero=document.getElementById('heroSection');
    if(grid) grid.style.display='';
    if(fdp)  fdp.classList.remove('visible');
    if(tb)   tb.style.display='';
    if(hero) hero.style.display='';
    // Grid-i yenilə (renderFonts olmasa grid boş qalır)
    if(typeof renderFonts === 'function') renderFonts();
    window._restoreGridScroll();
  }
})();
