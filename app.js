'use strict';
const $=x=>document.getElementById(x),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let db=null,tab='all',query='';
const pretty=d=>{try{return new Date(d).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}catch{return '기록 없음'}};
function show(){
 if(!db)return;
 const filter=x=>!query||(JSON.stringify(x).toLowerCase().includes(query));
 $('stats').innerHTML=[
 [db.stats.projects,'프로젝트'],[db.stats.jobs,'예약·시작'],[db.stats.active,'활성 등록'],[db.stats.services,'웹서비스']
 ].map(([n,t])=>'<div class="stat"><strong>'+esc(n)+'</strong><small>'+esc(t)+'</small></div>').join('');
 const sv=db.services.filter(filter),pr=db.projects.filter(filter),js=db.tasks.filter(filter);
 $('serviceCount').textContent=sv.length+'개';$('projectCount').textContent=pr.length+'개';$('taskCount').textContent=js.length+'개';
 $('services').innerHTML=sv.map(x=>'<article class="item"><div class="head"><strong>'+esc(x.name)+'</strong><span class="tag '+(x.state==='포트 응답'?'on':'')+'">'+esc(x.kind)+'</span></div><p class="desc">'+esc(x.detail||x.state||'')+'</p>'+((x.url&&/^https:\/\//.test(x.url))?'<a class="goto" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">웹 열기 ↗</a>':'<span class="readonly">PC 전용 · 공개하지 않음</span>')+'</article>').join('')||'<div class="empty">해당 서비스 없음</div>';
 $('projects').innerHTML=pr.map(x=>'<article class="item"><div class="head"><strong>'+esc(x.name)+'</strong><span class="tag">'+esc(x.state)+'</span></div><p class="desc">'+esc(x.detail)+'</p></article>').join('')||'<div class="empty">해당 프로젝트 없음</div>';
 $('tasks').innerHTML=js.map(x=>'<div class="job"><div><strong>'+esc(x.name)+'</strong><small>'+esc(x.source)+' · '+esc(x.detail||'')+'</small></div><span class="tag '+(x.status.includes('활성')||x.status.includes('실행')||x.status.includes('시작')?'on':'off')+'">'+esc(x.status)+'</span></div>').join('')||'<div class="empty">해당 작업 없음</div>';
 ['services','projects','tasks'].forEach(x=>$(x+'Panel').hidden=tab!=='all'&&tab!==x);
 const ms=Date.now()-Date.parse(db.published_at);
 $('sync').textContent=(Number.isFinite(ms)&&ms>60*60*1000?'마지막 동기화(지연) ':'PC 동기화 ')+pretty(db.published_at);
}
async function load(){
 $('sync').textContent='상태 확인 중';
 try{let res=await fetch('data.json?cache='+Date.now(),{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);db=await res.json();show();}
 catch(e){$('sync').textContent='자료를 불러오지 못했습니다';}
}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));show()}));
$('search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();show()});
$('refresh').addEventListener('click',load);
load();
