// ??????????????????????????????????????
// 1. TXT UPLOAD - bütün kartlarda preview
// ??????????????????????????????????????
let txtUploadActive = false;
function handleTxtUpload(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    const text = e.target.result.slice(0,200).replace(/\n/g,' ').trim();
    previewText = text;
    const pi = document.getElementById('previewText');
    if(pi) pi.value = text;
    document.querySelectorAll('.card-preview').forEach(el => el.textContent = text);
    document.getElementById('txtUploadLbl').textContent = '📄 ' + file.name.slice(0,14);
    document.getElementById('txtUploadLabel').style.color = 'var(--accent)';
    txtUploadActive = true;
    showToast('Text loaded - showing on all cards');
  };
  reader.readAsText(file);
  input.value = '';
}
function resetTxtUpload(){
  if(!txtUploadActive) return;
  previewText = '';
  const pi = document.getElementById('previewText');
  if(pi) pi.value = '';
  document.querySelectorAll('.card-preview').forEach(el => el.textContent = el.dataset.fontname || '');
  document.getElementById('txtUploadLbl').textContent = 'Text Upload';
  document.getElementById('txtUploadLabel').style.color = '';
  txtUploadActive = false;
  showToast('Text preview cleared');
}

// ??????????????????????????????????????
// 3. FONT PAIR MODAL
// ??????????????????????????????????????
let pairTheme = 'light';

function openPairModal(){
  document.body.style.overflow='hidden';
  const m = document.getElementById('pairModal');
  m.style.opacity='1';m.style.pointerEvents='all';m.style.visibility='visible';
  const hSel = document.getElementById('pairHeadingSelect');
  const bSel = document.getElementById('pairBodySelect');
  // Rebuild options every time so newly submitted/approved fonts appear
  const prevH = hSel.value || 'playfair-display';
  const prevB = bSel.value || 'inter';
  hSel.innerHTML = '';
  bSel.innerHTML = '';
  FONTS.forEach(f => {
    hSel.add(new Option(f.name, f.id));
    bSel.add(new Option(f.name, f.id));
  });
  hSel.value = prevH;
  bSel.value = prevB;
  // Init custom selects (first time) or refresh
  if(!document.getElementById('pairHeadingSelect__csel')){
    initCustomSelect('pairHeadingSelect','pair');
    initCustomSelect('pairBodySelect','pair');
  } else {
    refreshCustomSelect('pairHeadingSelect');
    refreshCustomSelect('pairBodySelect');
  }
  // Reset zoom
  const zs = document.getElementById('pairZoomSlider');
  if(zs){ zs.value=100; applyPairZoom(100); }
  renderPairPreview();
}
function closePairModal(){
  const _pm=document.getElementById('pairModal');_pm.style.opacity='0';_pm.style.pointerEvents='none';_pm.style.visibility='hidden';
  document.body.style.overflow='';
}
document.getElementById('pairModal').addEventListener('click', function(e){
  if(e.target === this) closePairModal();
});

function setPairTheme(t){
  pairTheme = t;
  const canvas = document.getElementById('pairPreviewCanvas');
  const hPrev = document.getElementById('pairHeadingPreview');
  const bPrev = document.getElementById('pairBodyPreview');
  const icon  = document.getElementById('pairThemeIcon');
  const btn   = document.getElementById('pairThemeToggleBtn');
  if(t === 'dark'){
    canvas.style.background = '#111';
    hPrev.style.color = '#fff';
    bPrev.style.color = '#aaa';
    // Show moon icon
    if(icon) icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    if(btn){ btn.style.background='#222'; btn.style.borderColor='#444'; btn.style.color='#fff'; }
  } else {
    canvas.style.background = '#fff';
    hPrev.style.color = '#111';
    bPrev.style.color = '#555';
    // Show sun icon
    if(icon) icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    if(btn){ btn.style.background=''; btn.style.borderColor=''; btn.style.color=''; }
  }
}

function togglePairTheme(){
  setPairTheme(pairTheme === 'dark' ? 'light' : 'dark');
}

function applyPairZoom(val){
  const zoom = parseInt(val) / 100;
  const hPrev = document.getElementById('pairHeadingPreview');
  const bPrev = document.getElementById('pairBodyPreview');
  const label = document.getElementById('pairZoomLabel');
  if(hPrev) hPrev.style.fontSize = (48 * zoom) + 'px';
  if(bPrev) bPrev.style.fontSize = (16 * zoom) + 'px';
  if(label) label.textContent = val + '%';
}

function renderPairPreview(){
  const hId = document.getElementById('pairHeadingSelect').value;
  const bId = document.getElementById('pairBodySelect').value;
  const txt = document.getElementById('pairCustomText').value || 'The quick brown fox';
  const hFont = FONTS.find(f=>f.id===hId);
  const bFont = FONTS.find(f=>f.id===bId);
  if(hFont) loadFont(hFont);
  if(bFont) loadFont(bFont);
  const hPrev = document.getElementById('pairHeadingPreview');
  const bPrev = document.getElementById('pairBodyPreview');
  if(hPrev && hFont){ hPrev.style.fontFamily = `'${hFont.name}',serif`; hPrev.textContent = txt; }
  if(bPrev && bFont){ bPrev.style.fontFamily = `'${bFont.name}',sans-serif`; }
}

// Pair modal açmaq üçün toolbar düym?si (h?m d? keyboard shortcut)
document.addEventListener('keydown', function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
  if(e.key==='p'||e.key==='P') openPairModal();
});


