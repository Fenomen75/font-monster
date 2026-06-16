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

