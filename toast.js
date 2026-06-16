let toastT;
let _toastQueue=[];
let _toastShowing=false;
function showToast(msg){
  _toastQueue.push(msg);
  if(!_toastShowing) _showNextToast();
}
function _showNextToast(){
  if(!_toastQueue.length){_toastShowing=false;return;}
  _toastShowing=true;
  const msg=_toastQueue.shift();
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);
  toastT=setTimeout(()=>{
    t.classList.remove('show');
    setTimeout(_showNextToast,250);
  },2200);
}

// KEYBOARD (single unified handler)
document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();const s=document.getElementById('searchInput');if(s){s.focus();s.select();}return;}
  const tag=e.target.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
  if(e.key==='Escape'){
    var _pm=document.getElementById('pairModal');if(_pm&&_pm.style.opacity==='1'){closePairModal();return;}
    var _em=document.getElementById('editFontModal');if(_em&&_em.classList.contains('open')){closeEditFont();return;}
    var _ao=document.getElementById('authOverlay');if(_ao&&_ao.classList.contains('open')){closeAuthModal();return;}
    var _mo=document.getElementById('modPanelOverlay');if(_mo&&_mo.style.display!=='none'){closeModPanel();return;}
    var _admin=document.getElementById('adminPanelOverlay');if(_admin&&_admin.style.display!=='none'){closeAdminPanel();return;}
    closeSubmit();closeContactModal();closeCompare();
    if(shortcutsOpen){shortcutsOpen=false;document.getElementById('shortcutsPanel').classList.remove('open');}
    else if(document.getElementById('authorPage').style.display!=='none')showGrid();
    else if(currentDetailFont)showGrid();
    return;
  }
  if(e.key==='c'||e.key==='C'){openCompare();}
  if(e.key==='d'||e.key==='D'){toggleDark();}
  if(e.key==='n'||e.key==='N'){openSubmit();}
  if(e.key==='?'){e.preventDefault();toggleShortcuts();}
  if(e.key==='/'){e.preventDefault();document.getElementById('searchInput').focus();}
});

// EVENTS
document.querySelectorAll('.cat').forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.cat)));
document.querySelectorAll('.sb-item[data-scat]').forEach(b=>b.addEventListener('click',()=>setCategory(b.dataset.scat)));

