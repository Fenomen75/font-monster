// ??????????????????????????????????????????
// COMMENTS & REVIEWS
// ??????????????????????????????????????????
// Storage: localStorage key "fontan_comments" ? { fontId: [{id,user,userId,rating,text,date,likes:[]}] }
let currentRating = 0;

function getComments(fontId){
  try{ const d=JSON.parse(localStorage.getItem('fontan_comments')||'{}'); return d[fontId]||[]; }catch(e){return [];}
}
function saveComments(fontId, arr){
  try{ const d=JSON.parse(localStorage.getItem('fontan_comments')||'{}'); d[fontId]=arr; localStorage.setItem('fontan_comments',JSON.stringify(d)); }catch(e){}
}
async function loadCommentsFromFb(fontId){
  if(!window.fbGetComments) return null;
  try{ return await window.fbGetComments(fontId); }catch(e){ return null; }
}

function setRating(val){
  currentRating=val;
  document.querySelectorAll('.star-btn').forEach(s=>{
    s.classList.toggle('on', parseInt(s.dataset.v)<=val);
  });
}

async function renderComments(fontId){
  const list=document.getElementById('commentsList');
  const count=document.getElementById('commentCount');
  if(!list)return;
  list.innerHTML='<div class="comment-empty" style="opacity:0.5">Loading.</div>';
  let comments = await loadCommentsFromFb(fontId);
  if(!comments) comments = getComments(fontId);
  if(count) count.textContent=comments.length ? `(${comments.length})` : '';
  // Show average rating next to count
  const rated = comments.filter(c=>c.rating>0);
  const avgEl = document.getElementById('commentAvgRating');
  if(avgEl) {
    if(rated.length > 0) {
      const avg = rated.reduce((s,c)=>s+(c.rating||0),0)/rated.length;
      const fullStars = Math.round(avg);
      avgEl.innerHTML = `<span style="color:#f5a623;letter-spacing:1px">${'★'.repeat(fullStars)}${'☆'.repeat(5-fullStars)}</span> <span style="color:var(--text3);font-size:11px;font-weight:400">${avg.toFixed(1)}</span>`;
      avgEl.style.display='inline-flex';
    } else {
      avgEl.style.display='none';
    }
  }
  if(!comments.length){
    list.innerHTML='<div class="comment-empty">No reviews yet - be the first!</div>';
    return;
  }
  list.innerHTML=comments.slice().reverse().map(c=>{
    const stars='★'.repeat(c.rating||0)+'☆'.repeat(5-(c.rating||0));
    const likeCount=c.likes?c.likes.length:0;
    const likedByMe=currentUser&&c.likes&&c.likes.includes(currentUser.id);
    const isOwn=currentUser&&c.userId===currentUser.id;
    const isAdmin=_isAdmin(currentUser);
    return `<div class="comment-card" id="cmt-${c.id}">
      <div class="comment-header">
        <span class="comment-author">${esc(c.user)}</span>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="comment-date">${new Date(c.date).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</span>
          ${(isOwn||isAdmin)?`<button class="comment-delete" onclick="deleteComment('${fontId}','${c.id}')" title="Delete"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>`:''}
        </div>
      </div>
      ${c.rating?`<div class="comment-stars">${stars}</div>`:''}
      <div class="comment-body">${esc(c.text)}</div>
      <div class="comment-likes">
        <button class="comment-like-btn ${likedByMe?'liked':''}" onclick="likeComment('${fontId}','${c.id}')">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="${likedByMe?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          Helpful ${likeCount?`(${likeCount})`:''}
        </button>
      </div>
    </div>`;
  }).join('');
}

async function submitComment(){
  const font=currentDetailFont;
  if(!font){showToast('⚠️ No font selected');return;}
  if(!currentUser){openAuthModal('login');showToast('⚠️ Sign in to post a review');return;}
  const txt=document.getElementById('commentInput').value.trim();
  if(!txt){showToast('⚠️ Write something first');return;}
  if(window.fbAddComment){
    try{
      await window.fbAddComment(font.id, txt, currentRating);
      // Also save to localStorage so reviews appear even if Firebase re-fetch is slow
      const _newC={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),userId:currentUser.id,user:currentUser.name||currentUser.email,rating:currentRating,text:txt,date:new Date().toISOString(),likes:[]};
      const _lsC=getComments(font.id);
      if(!_lsC.find(c=>c.userId===currentUser.id&&c.text===txt)){_lsC.push(_newC);saveComments(font.id,_lsC);}
      // Update local rating cache
      if(currentRating > 0) {
        const existing = RATING_CACHE[font.id];
        if(existing) {
          const newTotal = existing.avg * existing.count + currentRating;
          const newCount = existing.count + 1;
          RATING_CACHE[font.id] = { avg: newTotal/newCount, count: newCount };
        } else {
          RATING_CACHE[font.id] = { avg: currentRating, count: 1 };
        }
        window.RATING_CACHE[font.id] = RATING_CACHE[font.id];
      }
      document.getElementById('commentInput').value='';
      setRating(0); currentRating=0;
      await renderComments(font.id);
      showToast('✅ Review posted!');
    }catch(e){
      if(e.message==='duplicate') showToast('⚠️ You already reviewed this font');
      else showToast('❌ Error: '+e.message);
    }
  } else {
    const comments=getComments(font.id);
    const already=comments.find(c=>c.userId===currentUser.id);
    if(already){showToast('⚠️ You already reviewed this font');return;}
    const newC={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
      userId:currentUser.id,user:currentUser.name||currentUser.email,
      rating:currentRating,text:txt,date:new Date().toISOString(),likes:[]};
    comments.push(newC);saveComments(font.id,comments);
    document.getElementById('commentInput').value='';setRating(0);currentRating=0;
    renderComments(font.id);showToast('✅ Review posted!');
  }
}

async function deleteComment(fontId, commentId){
  if(window.fbDeleteComment){
    try{ await window.fbDeleteComment(commentId); await renderComments(fontId); showToast('✅ Review deleted'); }
    catch(e){ showToast('❌ '+e.message); }
  } else {
    const comments=getComments(fontId).filter(c=>c.id!==commentId);
    saveComments(fontId,comments);renderComments(fontId);showToast('✅ Review deleted');
  }
}

async function likeComment(fontId, commentId){
  if(!currentUser){openAuthModal('login');showToast('⚠️ Sign in to mark as helpful');return;}
  if(window.fbLikeComment){
    try{ await window.fbLikeComment(commentId, currentUser.id); await renderComments(fontId); }
    catch(e){ showToast('❌ '+e.message); }
  } else {
    const comments=getComments(fontId);
    const c=comments.find(x=>x.id===commentId);
    if(!c)return;if(!c.likes)c.likes=[];
    const idx=c.likes.indexOf(currentUser.id);
    if(idx>=0)c.likes.splice(idx,1);else c.likes.push(currentUser.id);
    saveComments(fontId,comments);renderComments(fontId);
  }
}

// ??????????????????????????????????????????
// COMMENTS & REVIEWS
// ??????????????????????????????????????????
// (comment rendering is now integrated directly inside openDetail above)

