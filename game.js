/* =====================================================================
   GAME: KAMEN RIDER TIÊU DIỆT YÊU QUÁI
   ===================================================================== */
/* ---- nhạc nền chiptune (WebAudio, nhẹ, tự dừng khi tắt âm) ---- */
var shMusicOn = store.get("shootMusic")!=="0";
const MUSIC=(function(){
  let timer=null, step=0, intense=false;
  const bass=[55,0,55,0,65.4,0,55,0,73.4,0,73.4,0,65.4,0,49,0];
  const lead=[440,0,523,0,659,0,523,0,587,659,0,587,523,0,440,0];
  const leadB=[659,784,659,0,880,0,784,0,659,784,880,988,880,784,659,0];
  function tick(){
    if(!soundOn||!shMusicOn) return;
    const i=step%16, b=bass[i], l=(intense?leadB:lead)[i];
    if(b) beep(b*2,.11,"triangle",.03);
    if(l) beep(l,.09,"square",.011);
    if(i%4===0) beep(110,.05,"sine",.04);
    if(i%8===4) beep(1500,.015,"square",.004);
    step++;
  }
  return {
    start(){ if(timer) return; step=0; timer=setInterval(tick,intense?105:140); },
    stop(){ clearInterval(timer); timer=null; },
    boss(on){ if(intense===on) return; intense=on; if(timer){ clearInterval(timer); timer=setInterval(tick,on?105:140); } }
  };
})();

/* ---- bảng điểm cao (lưu trong trình duyệt) ---- */
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const board={
  get(){ try{ return JSON.parse(store.get("shootBoard")||"[]"); }catch(e){ return []; } },
  qualifies(sc){ const l=this.get(); return sc>0&&(l.length<5||sc>l[l.length-1].score); },
  add(e){ const l=this.get(); l.push(e); l.sort((a,b)=>b.score-a.score); const t=l.slice(0,5); store.set("shootBoard",JSON.stringify(t)); return t; }
};
const boardHTML=hl=>{
  const l=board.get();
  if(!l.length) return '<p class="mono" style="margin-top:16px">Bảng điểm đang trống — hãy là người đầu tiên!</p>';
  return '<table class="sh-board"><caption class="mono">Bảng điểm cao</caption>'+l.map((e,i)=>`<tr${hl===i?' class="me"':""}><td>${i+1}</td><td>${esc(e.name)}</td><td>${esc(e.rider)}</td><td>W${e.wave}</td><td>${e.score.toLocaleString("vi-VN")}</td></tr>`).join("")+"</table>";
};

/* ---- chiêu cuối riêng của từng Rider (thứ tự = CHARS) ---- */
const SPECIALS=[
  {n:"RIDER KICK",s:"RIDER<br>KICK",d:"Cú đá sóng xung kích: gây sát thương lên mọi yêu quái, xóa hết yêu khí."},
  {n:"MIGHTY KICK",s:"MIGHTY<br>KICK",d:"Đá lửa: bùng nổ và thiêu cháy mọi yêu quái trên màn hình."},
  {n:"LIGHTNING SONIC",s:"SONIC<br>BOLT",d:"Sét đánh xuống 9 yêu quái ở gần bạn nhất."},
  {n:"DARKNESS MOON BREAK",s:"MOON<br>BREAK",d:"Đàn dơi tự tìm mục tiêu và cắn xé."},
  {n:"RISING IMPACT",s:"RISING<br>IMPACT",d:"Chùm tia dọc xuyên thấu, quét sạch cả cột phía trước."},
  {n:"ORANGE SLASH",s:"ORANGE<br>SLASH",d:"Ba nhát chém cam xé toạc cả màn hình."},
  {n:"DIMENSION KICK",s:"DIMEN-<br>SION",d:"Chín lá thẻ xuyên không phóng lên từ đáy màn hình."},
  {n:"JOKER EXTREME",s:"JOKER<br>EXTREME",d:"Phân thân hai bên, cùng bắn trong 6 giây."}
];
const BOSSN=["ĐẠI ONI","YUREI VƯƠNG","MẮT THẦN"];

const SHOOT = (function(){
  const ov=document.createElement("div"); ov.id="shoot"; ov.hidden=true;
  ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Game Kamen Rider tiêu diệt yêu quái");
  ov.innerHTML=`<canvas id="sc"></canvas>
    <div class="sh-hud"><div class="sh-l"><span id="shScore">0</span><small id="shCombo"></small></div><div class="sh-m" id="shWave"></div><div class="sh-r" id="shHp"></div></div>
    <div class="sh-btns"><button id="shMusic" aria-label="Bật/tắt nhạc">♪</button><button id="shPause" aria-label="Tạm dừng">❚❚</button><button id="shExit" aria-label="Thoát game">✕</button></div>
    <div class="sh-bar" id="shBar"><i id="shSp"></i><em>RIDER KICK · phím E</em></div>
    <button class="sh-kick" id="shKick">RIDER<br>KICK</button>
    <div class="sh-panel" id="shPanel" hidden></div>`;
  document.body.appendChild(ov);
  const cv=ov.querySelector("#sc"), ctx=cv.getContext("2d"), panel=ov.querySelector("#shPanel");
  const $s=id=>ov.querySelector("#"+id);
  const TAU=Math.PI*2;
  let W=0,H=0,dpr=1,raf=0,last=0,mode="menu",open=false;
  let P,bullets,foes,orbs,drops,parts,texts,stars,wave,spawnLeft,spawnT,bossPending,banner,score,killed,combo,comboT,charge,shake,flash,ring,fx,beams,best=+store.get("shootBest")||0;
  let tx,ty,firing=false,keys={},img=null,bgImg=null,prevDockHidden=false,fireBeep=0;

  function resize(){
    dpr=Math.min(devicePixelRatio||1,2); W=innerWidth; H=innerHeight;
    cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    if(!stars) return;
    if(P){ P.x=Math.min(P.x,W-20); tx=Math.min(tx,W-20); ty=Math.max(ty,H*.45); }
  }
  addEventListener("resize",()=>{ if(open) resize(); });

  function riderImg(){
    const svg=avatar(gcur).replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="312" ');
    const im=new Image(); im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg); return im;
  }

  function reset(){
    resize();
    P={x:W/2,y:H-120,r:16,hp:5,inv:0,lvl:1,cd:0,muzzle:0,twin:0,tcd:0};
    tx=P.x; ty=P.y; bullets=[]; foes=[]; orbs=[]; drops=[]; parts=[]; texts=[];
    stars=Array.from({length:90},()=>({x:rnd(0,W),y:rnd(0,H),z:rnd(.3,1.6)}));
    wave=0; spawnLeft=0; spawnT=0; bossPending=false; banner=0;
    score=0; killed=0; combo=0; comboT=0; charge=0; shake=0; flash=0; ring=null; fx=[]; beams=[];
    const sp=SPECIALS[gcur%SPECIALS.length];
    $s("shBar").querySelector("em").textContent=sp.n+" · phím E"; $s("shKick").innerHTML=sp.s;
    hud();
  }

  /* ---------- HUD ---------- */
  function hud(){
    $s("shScore").textContent=score.toLocaleString("vi-VN");
    const m=1+Math.min(4,Math.floor(combo/5));
    $s("shCombo").textContent=combo>1?`COMBO ${combo} · x${m}`:"";
    $s("shWave").textContent=wave?`WAVE ${wave}`:"";
    $s("shHp").textContent="♥".repeat(Math.max(0,P.hp))+"♡".repeat(Math.max(0,5-P.hp));
    $s("shSp").style.width=Math.min(100,charge)+"%";
    $s("shBar").classList.toggle("full",charge>=100);
    $s("shKick").classList.toggle("ready",charge>=100);
  }

  /* ---------- panels ---------- */
  function showPanel(html){ panel.innerHTML=html; panel.hidden=false; }
  function menu(){
    mode="menu"; const c=CHARS[gcur], sp=SPECIALS[gcur%SPECIALS.length];
    showPanel(`<p class="mono">Mini game</p>
      <h2>Kamen Rider<br>tiêu diệt <span style="color:var(--acc)">yêu quái</span></h2>
      <p style="color:var(--mut);max-width:480px;margin:8px auto 14px">Bạn là <b style="color:var(--acc)">${c.name}</b>. Yêu quái tràn xuống thành phố — bắn hạ chúng, né yêu khí, hạ gục boss mỗi 5 đợt.</p>
      <p class="mono" style="max-width:500px;margin:0 auto 6px;line-height:1.9">Di chuột / WASD / mũi tên / vuốt để di chuyển · Giữ chuột hoặc Space để bắn · P tạm dừng</p>
      <p style="max-width:480px;margin:0 auto 18px;font-size:.9rem"><b style="color:var(--acc)">E · ${sp.n}</b> <span style="color:var(--mut)">— ${sp.d}</span></p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn" id="shStart" style="padding:14px 28px">Bắt đầu →</button><button class="btn" id="shChange" style="background:transparent;color:var(--fg);border:1px solid var(--line)">Đổi Rider</button></div>
      ${boardHTML()}`);
    $s("shStart").onclick=start; $s("shChange").onclick=()=>{ close(); openGate(); };
    $s("shStart").focus();
  }
  function start(){ reset(); panel.hidden=true; mode="play"; startWave(); MUSIC.start(); beep(660,.1,"square",.05); }
  function over(){
    mode="over"; MUSIC.stop(); if(score>best){ best=score; store.set("shootBest",best); }
    renderOver(-1,false);
  }
  function renderOver(hl,saved){
    const q=!saved&&board.qualifies(score);
    showPanel(`<p class="mono">Game over</p><h2>Yêu quái đã bị đẩy lùi<br>${killed} con</h2>
      <p style="font-size:2.4rem;font-weight:800;color:var(--acc)">${score.toLocaleString("vi-VN")}</p>
      <p class="mono">Wave ${wave}</p>
      ${q?`<form id="shForm" class="sh-form"><input id="shName" maxlength="14" autocomplete="off" placeholder="Tên của bạn" value="${esc(store.get("shootName")||"")}"><button class="btn" style="padding:10px 18px">Lưu điểm</button></form>`:""}
      ${boardHTML(hl)}
      <div style="display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap"><button class="btn" id="shAgain" style="padding:14px 28px">Chơi lại</button><button class="btn" id="shOut" style="background:transparent;color:var(--fg);border:1px solid var(--line)">Thoát</button></div>`);
    $s("shAgain").onclick=start; $s("shOut").onclick=close;
    if(q){
      $s("shForm").onsubmit=ev=>{ ev.preventDefault(); const name=($s("shName").value.trim()||"Rider").slice(0,14); store.set("shootName",name);
        const l=board.add({name,rider:CHARS[gcur].name,score,wave,date:Date.now()});
        renderOver(l.findIndex(e=>e.score===score&&e.name===name),true); };
      $s("shName").focus();
    } else $s("shAgain").focus();
  }
  function pause(on){
    if(mode==="play"&&on){ mode="pause"; MUSIC.stop();
      showPanel(`<h2>Tạm dừng</h2><div style="display:flex;gap:10px;justify-content:center;margin-top:16px"><button class="btn" id="shResume" style="padding:14px 28px">Tiếp tục</button><button class="btn" id="shQuit" style="background:transparent;color:var(--fg);border:1px solid var(--line)">Thoát</button></div>`);
      $s("shResume").onclick=()=>pause(false); $s("shQuit").onclick=close; $s("shResume").focus();
    } else if(mode==="pause"&&!on){ mode="play"; panel.hidden=true; MUSIC.start(); }
  }

  /* ---------- open / close ---------- */
  function openG(){
    if(open) return; open=true; ov.hidden=false; document.body.classList.add("locked");
    prevDockHidden=dock.classList.contains("hidden"); stopTour(); dock.classList.add("hidden");
    img=riderImg(); bgImg=new Image(); bgImg.src=sceneURI(gcur); reset(); menu(); last=performance.now(); raf=requestAnimationFrame(frame);
  }
  function close(){
    open=false; ov.hidden=true; MUSIC.stop(); cancelAnimationFrame(raf); keys={}; firing=false;
    if(!gate.classList.contains("open")) document.body.classList.remove("locked");
    if(!prevDockHidden) dock.classList.remove("hidden");
    const g=$("#cGame"); g.setAttribute("aria-pressed","false");
  }

  /* ---------- waves & foes ---------- */
  function startWave(){
    wave++; spawnLeft=6+wave*3; spawnT=1.4; banner=2.2; bossPending=(wave%5===0);
    MUSIC.boss(bossPending);
    hud(); beep(300+wave*20,.15,"square",.04);
  }
  function addFoe(type){
    const base=70+wave*6, x=rnd(50,W-50);
    if(!type){ const r=Math.random(); type=(wave>=3&&r<.25)?"eye":(wave>=2&&r<.55)?"yurei":"oni"; }
    const f={type,x,y:-40,x0:x,t:0,flash:0,fireT:rnd(1.2,3.2),bt:0};
    if(type==="oni")  Object.assign(f,{r:24,hp:2+Math.floor(wave/4),vy:base,vx:rnd(-30,30),pts:10});
    if(type==="yurei")Object.assign(f,{r:22,hp:2+Math.floor(wave/6),vy:base*.7,vx:0,pts:20});
    if(type==="eye")  Object.assign(f,{r:20,hp:1+Math.floor(wave/5),vy:base*1.2,vx:(Math.random()<.5?-1:1)*(90+wave*5),pts:15});
    if(type==="boss"){ const bk=((wave/5-1)|0)%3; Object.assign(f,{r:[62,56,58][bk],hp:40+wave*6,vy:60,vx:0,pts:500+bk*200,x:W/2,x0:W/2,y:-90,boss:true,bk,name:BOSSN[bk]}); f.max=f.hp; }
    f.max=f.hp; foes.push(f);
  }
  function orb(x,y,a,sp){ orbs.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:7}); }
  function aimAt(f){ return Math.atan2(P.y-f.y,P.x-f.x); }

  function burst(x,y,n,c,pw=1){ for(let i=0;i<n;i++){ const a=rnd(0,TAU),v=rnd(40,320)*pw; parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,max:rnd(.3,.8),c,s:rnd(2,5)}); } }
  function text(x,y,t,c){ texts.push({x,y,t,c,life:0}); }

  function kill(f){
    foes.splice(foes.indexOf(f),1); killed++;
    const m=1+Math.min(4,Math.floor(combo/5)); combo++; comboT=2.2;
    const pts=f.pts*m; score+=pts; text(f.x,f.y,"+"+pts,f.boss?"#ffd23d":"#fff");
    burst(f.x,f.y,f.boss?90:22,f.type==="yurei"?"#b9a6ff":f.type==="eye"?"#7bffa0":"#ff6b7f",f.boss?2:1);
    beep(f.boss?70:120+rnd(0,40),f.boss?.5:.14,"sawtooth",.05);
    charge=Math.min(100,charge+(f.boss?35:5));
    if(f.boss){ shake=24; orbs.length=0; }
    const r=Math.random();
    if(f.boss||r<.14){ const t=f.boss?"w":(r<.05?"w":r<.1?"h":"k"); drops.push({x:f.x,y:f.y,t,r:13}); }
  }
  function hurt(){
    if(P.inv>0) return;
    P.hp--; P.inv=1.3; shake=14; combo=0; flash=.35;
    burst(P.x,P.y,26,"#ff4d4d",.9); beep(140,.25,"sawtooth",.06);
    if(P.hp<=0){ burst(P.x,P.y,80,ACCHEX(),1.6); hud(); over(); }
  }
  const ACCHEX=()=>CHARS[gcur].acc;

  function dmgAll(d,c){
    orbs.length=0;
    foes.slice().forEach(f=>{ f.hp-=d; f.flash=.2; burst(f.x,f.y,10,c||ACCHEX(),1); if(f.hp<=0) kill(f); });
  }
  const bolt=(x,y)=>{ const pts=[[x,0]]; let cy=0; while(cy<y){ cy+=rnd(25,50); pts.push([x+rnd(-26,26),Math.min(cy,y)]); } pts[pts.length-1]=[x,y];
    fx.push({t:0,max:.45,d:k=>{ ctx.save(); ctx.strokeStyle="#bfe0ff"; ctx.shadowColor="#4d8dff"; ctx.shadowBlur=24; ctx.lineWidth=8*(1-k)+1; ctx.globalAlpha=1-k; ctx.beginPath(); pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.stroke(); ctx.restore(); }}); };
  const slash=(y0,y1,c)=>fx.push({t:0,max:.55,d:k=>{ ctx.save(); ctx.strokeStyle=c; ctx.shadowColor=c; ctx.shadowBlur=30; ctx.lineCap="round"; ctx.lineWidth=46*(1-k)+4; ctx.globalAlpha=Math.min(1,(1-k)*1.5);
      const e=Math.min(1,k*3.2); ctx.beginPath(); ctx.moveTo(-40,y0); ctx.quadraticCurveTo(W*.5,(y0+y1)/2-90,-40+(W+80)*e,y0+(y1-y0)*e); ctx.stroke(); ctx.restore(); }});
  const RUN=[
    ()=>{ ring={x:P.x,y:P.y,r:10,life:0}; dmgAll(8); },
    ()=>{ ring={x:P.x,y:P.y,r:10,life:0}; dmgAll(6); foes.forEach(f=>f.burn=4); burst(P.x,P.y,70,"#ff9a3d",2.2); },
    ()=>{ orbs.length=0; foes.slice().sort((a,b)=>b.y-a.y).slice(0,9).forEach((f,i)=>setTimeout(()=>{ if(!foes.includes(f)) return; bolt(f.x,f.y); f.hp-=7; f.flash=.25; burst(f.x,f.y,22,"#bfe0ff",1.3); beep(900,.1,"sawtooth",.05); if(f.hp<=0) kill(f); },i*110)); },
    ()=>{ for(let i=0;i<14;i++) bullets.push({x:P.x,y:P.y-20,vx:rnd(-380,380),vy:rnd(-520,-160),r:8,dmg:3,c:"#c9a7ff",home:true,bat:true,life:4}); },
    ()=>{ orbs.length=0; beams.push({x:P.x,y:P.y,w:150,life:1.2,follow:true}); },
    ()=>{ slash(H*.25,H*.55,"#ff9a3d"); setTimeout(()=>slash(H*.6,H*.3,"#ffd23d"),160); setTimeout(()=>slash(H*.35,H*.75,"#ff6a2d"),320); setTimeout(()=>dmgAll(7,"#ff9a3d"),220); },
    ()=>{ for(let i=0;i<9;i++) bullets.push({x:W*(.1+.1*i),y:H+30+i*10,vx:0,vy:-1150,r:18,dmg:5,c:"#ff4fd8",card:true,pierce:true,hit:new Set()}); },
    ()=>{ P.twin=6; text(P.x,P.y-60,"PHÂN THÂN!","#7fffff"); }
  ];
  function kick(){
    if(mode!=="play"||charge<100) return;
    charge=0; shake=26; flash=.55;
    beep(200,.3,"sawtooth",.06); setTimeout(()=>beep(420,.3,"square",.05),90); setTimeout(()=>beep(800,.35,"square",.05),200);
    burst(P.x,P.y,60,ACCHEX(),2);
    text(P.x,P.y-70,SPECIALS[gcur%SPECIALS.length].n,ACCHEX());
    RUN[gcur%RUN.length]();
  }

  function fire(){
    const c=ACCHEX(), L=P.lvl, sp=900, y=P.y-14;
    const shots=L===1?[0]:L===2?[-.05,.05]:L===3?[-.14,0,.14]:[-.28,-.14,0,.14,.28];
    shots.forEach(a=>bullets.push({x:P.x+19+(L===2?(a<0?-8:8):0),y,vx:Math.sin(a)*sp,vy:-Math.cos(a)*sp,r:5,dmg:1,c}));
    P.muzzle=.06;
    if(performance.now()-fireBeep>90){ fireBeep=performance.now(); beep(820-L*40,.03,"square",.012); }
  }

  /* ---------- update ---------- */
  function update(dt){
    // di chuyển
    const spd=520;
    if(keys.ArrowLeft||keys.a) tx-=spd*dt; if(keys.ArrowRight||keys.d) tx+=spd*dt;
    if(keys.ArrowUp||keys.w) ty-=spd*dt;   if(keys.ArrowDown||keys.s) ty+=spd*dt;
    tx=Math.max(24,Math.min(W-24,tx)); ty=Math.max(H*.42,Math.min(H-96,ty));
    const k=Math.min(1,dt*14); P.x+=(tx-P.x)*k; P.y+=(ty-P.y)*k;
    P.inv=Math.max(0,P.inv-dt); P.muzzle=Math.max(0,P.muzzle-dt);
    P.cd-=dt; if(firing&&P.cd<=0){ fire(); P.cd=.13; }
    comboT-=dt; if(comboT<=0&&combo>0){ combo=0; }
    shake=Math.max(0,shake-dt*40); flash=Math.max(0,flash-dt);
    banner=Math.max(0,banner-dt);

    // sinh yêu quái
    spawnT-=dt;
    if(bossPending&&spawnT<=0){ bossPending=false; addFoe("boss"); text(W/2,H*.3,foes[foes.length-1].name+" XUẤT HIỆN!","#ff6b7f"); beep(90,.6,"sawtooth",.07); }
    if(spawnLeft>0&&spawnT<=0){ addFoe(); spawnLeft--; spawnT=Math.max(.28,1.0-wave*.05)+rnd(0,.4); }
    if(spawnLeft===0&&!bossPending&&foes.length===0&&banner<=0&&mode==="play") startWave();

    // đạn
    for(let i=bullets.length-1;i>=0;i--){ const b=bullets[i];
      if(b.home&&foes.length){ let t=null,bd=1e9; foes.forEach(f=>{ const d=Math.hypot(f.x-b.x,f.y-b.y); if(d<bd){ bd=d; t=f; } });
        const a=Math.atan2(t.y-b.y,t.x-b.x), k2=Math.min(1,dt*5); b.vx+=(Math.cos(a)*760-b.vx)*k2; b.vy+=(Math.sin(a)*760-b.vy)*k2; }
      b.x+=b.vx*dt; b.y+=b.vy*dt;
      if(b.life!==undefined){ b.life-=dt; if(b.life<=0){ bullets.splice(i,1); continue; } }
      if(b.y<-40||b.y>H+80||b.x<-40||b.x>W+40) bullets.splice(i,1);
    }
    // phân thân W
    if(P.twin>0){ P.twin-=dt; P.tcd-=dt; if(P.tcd<=0){ P.tcd=.1; [-110,110].forEach(o=>bullets.push({x:P.x+o+19,y:P.y-14,vx:0,vy:-900,r:5,dmg:1,c:"#7fffff"})); } }
    // tia sáng Zero-One
    for(let i=beams.length-1;i>=0;i--){ const bm=beams[i]; bm.life-=dt; if(bm.follow){ bm.x=P.x; bm.y=P.y; }
      foes.slice().forEach(f=>{ if(Math.abs(f.x-bm.x)<bm.w/2+f.r&&f.y<bm.y){ f.hp-=14*dt; f.flash=.05; if(Math.random()<.3) burst(f.x,f.y,1,"#fff4a0",.5); if(f.hp<=0) kill(f); } });
      orbs=orbs.filter(o=>!(Math.abs(o.x-bm.x)<bm.w/2&&o.y<bm.y));
      if(bm.life<=0) beams.splice(i,1);
    }
    for(let i=fx.length-1;i>=0;i--){ fx[i].t+=dt; if(fx[i].t>=fx[i].max) fx.splice(i,1); }

    // yêu quái
    for(let i=foes.length-1;i>=0;i--){
      const f=foes[i]; if(!f) continue; f.t+=dt; f.flash=Math.max(0,f.flash-dt);
      if(f.burn>0){ f.burn-=dt; f.hp-=1.5*dt; if(Math.random()<.4) parts.push({x:f.x+rnd(-f.r,f.r),y:f.y,vx:rnd(-20,20),vy:rnd(-120,-40),life:0,max:.5,c:Math.random()<.5?"#ff9a3d":"#ffd23d",s:rnd(2,5)}); if(f.hp<=0){ kill(f); continue; } }
      if(f.type==="oni"){ f.x+=f.vx*dt; f.y+=f.vy*dt; }
      else if(f.type==="yurei"){ f.x=f.x0+Math.sin(f.t*2)*90; f.y+=f.vy*dt; }
      else if(f.type==="eye"){ f.x+=f.vx*dt; f.y+=f.vy*dt; if(f.x<f.r||f.x>W-f.r) f.vx*=-1; }
      else if(f.boss){
        f.bt+=dt;
        if(f.bk===0){
          if(f.y<130) f.y+=f.vy*dt; f.x=W/2+Math.sin(f.t*.8)*W*.3;
          if(f.y>=110){
            f.fireT-=dt; if(f.fireT<=0){ f.fireT=1.5; const a0=aimAt(f); for(let j=-3;j<=3;j++) orb(f.x,f.y+30,a0+j*.2,240); beep(180,.08,"sawtooth",.03); }
            if(f.bt>4){ f.bt=0; for(let j=0;j<14;j++) orb(f.x,f.y,j*TAU/14+rnd(0,.1),200); beep(120,.2,"sawtooth",.04); }
          }
        } else if(f.bk===1){
          if(f.y<140) f.y+=f.vy*dt; else {
            f.tp=(f.tp===undefined?3:f.tp)-dt; f.sa=f.sa||0; f.fireT-=dt;
            if(f.fireT<=0){ f.fireT=.17; f.sa+=.55; orb(f.x,f.y+20,f.sa,210); orb(f.x,f.y+20,f.sa+Math.PI,210); }
            if(f.tp<=0){ f.tp=3.6; burst(f.x,f.y,40,"#b9a6ff",1.4); f.x=rnd(W*.2,W*.8); burst(f.x,f.y,40,"#b9a6ff",1.4); beep(250,.2,"sine",.05); for(let j=0;j<12;j++) orb(f.x,f.y,j*TAU/12,190); }
          }
        } else {
          if(f.y<150) f.y+=f.vy*dt; else {
            f.x=W/2+Math.sin(f.t*.5)*W*.2; f.fireT-=dt;
            if(f.fireT<=0){ f.fireT=1.2; const a0=aimAt(f); for(let j=-1;j<=1;j++) orb(f.x,f.y+20,a0+j*.28,260); beep(160,.08,"sawtooth",.03); }
            f.ms=(f.ms===undefined?4:f.ms)-dt;
            if(f.ms<=0){ f.ms=6; for(let j=-1;j<=1;j++){ addFoe("eye"); const e=foes[foes.length-1]; e.x=f.x+j*90; e.y=f.y+60; } beep(110,.25,"sawtooth",.05); }
          }
        }
      }
      if(!f.boss&&(f.type==="yurei"||f.type==="eye")&&wave>=2&&f.y>0&&f.y<H*.6){
        f.fireT-=dt; if(f.fireT<=0){ f.fireT=rnd(2,4)/(1+wave*.05); orb(f.x,f.y,aimAt(f),200+wave*8); }
      }
      if(f.y>H+50&&!f.boss){ foes.splice(i,1); combo=0; continue; }
      // va chạm với người chơi
      if(Math.hypot(f.x-P.x,f.y-P.y)<f.r*.8+P.r){ hurt(); if(!f.boss){ f.hp-=3; f.flash=.2; if(f.hp<=0) kill(f); } }
    }
    // đạn trúng yêu quái
    for(let i=bullets.length-1;i>=0;i--){
      const b=bullets[i]; let used=false;
      for(const f of foes.slice()){
        if(b.hit&&b.hit.has(f)) continue;
        if(Math.hypot(b.x-f.x,b.y-f.y)<f.r+b.r){
          f.hp-=b.dmg; f.flash=.08; burst(b.x,b.y,4,b.c,.4); beep(300,.02,"square",.01);
          if(b.pierce) b.hit.add(f); else used=true;
          if(f.hp<=0) kill(f);
          if(used) break;
        }
      }
      if(used) bullets.splice(i,1);
    }
    // yêu khí
    for(let i=orbs.length-1;i>=0;i--){
      const o=orbs[i]; o.x+=o.vx*dt; o.y+=o.vy*dt;
      if(o.x<-30||o.x>W+30||o.y<-30||o.y>H+30){ orbs.splice(i,1); continue; }
      if(Math.hypot(o.x-P.x,o.y-P.y)<o.r+P.r*.7){ orbs.splice(i,1); hurt(); }
    }
    // vật phẩm
    for(let i=drops.length-1;i>=0;i--){
      const d=drops[i]; d.y+=90*dt;
      if(d.y>H+30){ drops.splice(i,1); continue; }
      if(Math.hypot(d.x-P.x,d.y-P.y)<d.r+P.r+8){
        drops.splice(i,1); beep(900,.08,"triangle",.05); setTimeout(()=>beep(1200,.08,"triangle",.05),70);
        if(d.t==="w"){ if(P.lvl<4){ P.lvl++; text(P.x,P.y-50,"NÂNG CẤP SÚNG!",ACCHEX()); } else { score+=200; text(P.x,P.y-50,"+200",ACCHEX()); } }
        if(d.t==="h"){ if(P.hp<5){ P.hp++; text(P.x,P.y-50,"+1 HP","#ff7a90"); } else { score+=100; } }
        if(d.t==="k"){ charge=Math.min(100,charge+40); text(P.x,P.y-50,"+KICK","#fff"); }
      }
    }
    // hạt & chữ
    for(let i=parts.length-1;i>=0;i--){ const p=parts[i]; p.life+=dt; p.vx*=.98; p.vy=p.vy*.98+220*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.life>p.max) parts.splice(i,1); }
    for(let i=texts.length-1;i>=0;i--){ const t=texts[i]; t.life+=dt; t.y-=40*dt; if(t.life>1.2) texts.splice(i,1); }
    if(ring){ ring.life+=dt; ring.r+=1400*dt; if(ring.life>.8) ring=null; }
    stars.forEach(s=>{ s.y+=s.z*60*dt; if(s.y>H){ s.y=0; s.x=rnd(0,W); } });
    hud();
  }

  /* ---------- draw ---------- */
  function glowCircle(x,y,r,c,a=1){
    const g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,`rgba(${c},${a})`); g.addColorStop(1,`rgba(${c},0)`);
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.fill();
  }
  function drawFoe(f){
    const r=f.r, fl=f.flash>0, ang=aimAt(f), ex=Math.cos(ang)*r*.08, ey=Math.sin(ang)*r*.08;
    ctx.save(); ctx.translate(f.x,f.y);
    const eyeWhite=(x,y,rr)=>{ ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(x,y,rr,0,TAU); ctx.fill(); ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(x+ex,y+ey,rr*.5,0,TAU); ctx.fill(); };
    if(f.boss&&f.bk===1){
      ctx.translate(0,Math.sin(f.t*3)*4); ctx.fillStyle=fl?"#fff":"rgba(150,120,255,.95)";
      ctx.beginPath(); ctx.arc(0,-r*.1,r,Math.PI,0); ctx.lineTo(r,r*.95);
      for(let i=5;i>=-5;i--){ ctx.quadraticCurveTo((i-.5)*r/5,r*(i%2?1.35:.75)+Math.sin(f.t*5+i)*4,i*r/5-r/5,r*.95); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle="#0b0d10"; ctx.lineWidth=2.5; ctx.stroke();
      ctx.fillStyle=fl?"#fff":"#ffd23d"; ctx.beginPath(); ctx.moveTo(-r*.55,-r*.85); ctx.lineTo(-r*.4,-r*1.3); ctx.lineTo(-r*.2,-r*.95); ctx.lineTo(0,-r*1.4); ctx.lineTo(r*.2,-r*.95); ctx.lineTo(r*.4,-r*1.3); ctx.lineTo(r*.55,-r*.85); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle="#150a30"; [[-.38,-.15],[.38,-.15],[0,.2]].forEach(([ex2,ey2])=>{ ctx.beginPath(); ctx.ellipse(ex2*r,ey2*r,r*.14,r*.22,0,0,TAU); ctx.fill(); });
      ctx.beginPath(); ctx.ellipse(0,r*.58,r*.2,r*.14,0,0,TAU); ctx.fill();
    } else if(f.boss&&f.bk===2){
      ctx.strokeStyle=fl?"#fff":"#6b2fa0"; ctx.lineWidth=7; ctx.lineCap="round";
      for(let i=-3;i<=3;i++){ ctx.beginPath(); ctx.moveTo(i*r*.28,r*.7); ctx.quadraticCurveTo(i*r*.4+Math.sin(f.t*4+i)*8,r*1.3,i*r*.42,r*1.55); ctx.stroke(); }
      ctx.fillStyle=fl?"#fff":"#f4e3b0"; [-1,1].forEach(sg=>{ ctx.beginPath(); ctx.moveTo(sg*r*.45,-r*.8); ctx.lineTo(sg*r*.7,-r*1.35); ctx.lineTo(sg*r*.15,-r*.95); ctx.fill(); });
      ctx.fillStyle=fl?"#fff":"#7d3fb8"; ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.fill(); ctx.strokeStyle="#0b0d10"; ctx.lineWidth=2.5; ctx.stroke();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.ellipse(0,0,r*.8,r*.62,0,0,TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle="#ff3b7a"; ctx.beginPath(); ctx.arc(ex*6,ey*6,r*.38,0,TAU); ctx.fill();
      ctx.fillStyle="#111"; ctx.beginPath(); ctx.ellipse(ex*7,ey*7,r*.12,r*.3,0,0,TAU); ctx.fill();
    } else if(f.type==="oni"||f.boss){
      const body=fl?"#fff":f.boss?"#5b2a86":"#d9435a", horn=fl?"#fff":"#f4e3b0";
      ctx.fillStyle=horn;
      const hs=f.boss?[[-.55,-.7,.3],[.55,-.7,.3],[-.2,-.95,.22],[.2,-.95,.22]]:[[-.5,-.75,.3],[.5,-.75,.3]];
      hs.forEach(([hx,hy,w])=>{ ctx.beginPath(); ctx.moveTo((hx-w)*r,-r*.5); ctx.lineTo(hx*r,hy*r-r*.6); ctx.lineTo((hx+w)*r,-r*.5); ctx.fill(); });
      ctx.fillStyle=body; ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.fill();
      ctx.strokeStyle="#0b0d10"; ctx.lineWidth=2; ctx.stroke();
      if(f.boss){ eyeWhite(-r*.42,-r*.15,r*.17); eyeWhite(r*.42,-r*.15,r*.17); eyeWhite(0,-r*.42,r*.15); }
      else { eyeWhite(-r*.36,-r*.12,r*.2); eyeWhite(r*.36,-r*.12,r*.2); }
      ctx.strokeStyle="#0b0d10"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-r*.6,-r*.4); ctx.lineTo(-r*.15,-r*.22); ctx.moveTo(r*.6,-r*.4); ctx.lineTo(r*.15,-r*.22); ctx.stroke();
      ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(0,r*.42,r*.36,0,Math.PI); ctx.fill();
      ctx.fillStyle="#fff"; for(let i=-1;i<=1;i+=2){ ctx.beginPath(); ctx.moveTo(i*r*.2,r*.42); ctx.lineTo(i*r*.3,r*.62); ctx.lineTo(i*r*.08,r*.42); ctx.fill(); }
    } else if(f.type==="yurei"){
      const bob=Math.sin(f.t*4)*3;
      ctx.translate(0,bob); ctx.fillStyle=fl?"#fff":"rgba(178,160,255,.9)";
      ctx.beginPath(); ctx.arc(0,-r*.1,r,Math.PI,0); ctx.lineTo(r,r*.9);
      for(let i=4;i>=-4;i--){ ctx.quadraticCurveTo((i-.5)*r/4,r*(i%2?1.3:.7)+Math.sin(f.t*6+i)*3,i*r/4-r/4,r*.9); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle="#0b0d10"; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle="#1a1230"; ctx.beginPath(); ctx.ellipse(-r*.35,-r*.15,r*.16,r*.24,0,0,TAU); ctx.ellipse(r*.35,-r*.15,r*.16,r*.24,0,0,TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(0,r*.35,r*.12,r*.2,0,0,TAU); ctx.fill();
    } else {
      ctx.strokeStyle=fl?"#fff":"#3a9a50"; ctx.lineWidth=4; ctx.lineCap="round";
      for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(i*r*.3,r*.6); ctx.quadraticCurveTo(i*r*.4+Math.sin(f.t*6+i)*5,r*1.1,i*r*.45,r*1.3); ctx.stroke(); }
      ctx.fillStyle=fl?"#fff":"#58c26b"; ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.fill(); ctx.strokeStyle="#0b0d10"; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(0,-r*.05,r*.6,0,TAU); ctx.fill();
      ctx.fillStyle="#e23"; ctx.beginPath(); ctx.arc(ex*4,-r*.05+ey*4,r*.34,0,TAU); ctx.fill();
      ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(ex*5,-r*.05+ey*5,r*.16,0,TAU); ctx.fill();
    }
    ctx.restore();
  }
  function drawPlayer(){
    if(P.inv>0&&Math.floor(P.inv*14)%2) return;
    const c=ACCHEX(), x=P.x, y=P.y, t=performance.now()/1000, h=104, w=h*100/156;
    glowCircle(x,y+60,26+Math.sin(t*30)*4,hex2rgb(c),.7);
    ctx.fillStyle="#ffd9a0"; ctx.beginPath(); ctx.moveTo(x-7,y+52); ctx.lineTo(x,y+76+Math.sin(t*40)*5); ctx.lineTo(x+7,y+52); ctx.fill();
    if(img&&img.complete) ctx.drawImage(img,x-w/2,y-46,w,h);
    ctx.fillStyle="#2c3446"; ctx.fillRect(x+15,y-6,8,26); ctx.fillStyle=c; ctx.fillRect(x+16,y-10,6,6);
    if(P.muzzle>0) glowCircle(x+19,y-14,24,"255,255,255",.9);
  }
  function draw(){
    ctx.save();
    if(shake>0) ctx.translate(rnd(-shake,shake)*.5,rnd(-shake,shake)*.5);
    const T=THEMES[gcur%THEMES.length];
    ctx.fillStyle=T.bg; ctx.fillRect(-20,-20,W+40,H+40);
    if(bgImg&&bgImg.complete&&bgImg.naturalWidth){ const sc=Math.max(W/1600,H/900); ctx.drawImage(bgImg,(W-1600*sc)/2,H-900*sc,1600*sc,900*sc); }
    ctx.fillStyle=`rgba(${hex2rgb(T.bg)},.25)`; ctx.fillRect(-20,-20,W+40,H+40);
    if(stars) stars.forEach(s=>{ ctx.fillStyle=`rgba(255,255,255,${.25+s.z*.3})`; ctx.fillRect(s.x,s.y,s.z*1.6,s.z*1.6); });
    if(P&&mode!=="menu"){
      drops.forEach(d=>{
        const col=d.t==="w"?"255,210,60":d.t==="h"?"255,90,130":"90,220,255";
        glowCircle(d.x,d.y,26,col,.6); ctx.fillStyle=`rgb(${col})`; ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,TAU); ctx.fill();
        ctx.fillStyle="#0b0d10"; ctx.font="800 14px sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(d.t==="w"?"⚡":d.t==="h"?"♥":"K",d.x,d.y+1);
      });
      foes.forEach(drawFoe);
      orbs.forEach(o=>{ glowCircle(o.x,o.y,o.r*3,"190,110,255",.6); ctx.fillStyle="#f2d9ff"; ctx.beginPath(); ctx.arc(o.x,o.y,o.r*.6,0,TAU); ctx.fill(); });
      beams.forEach(bm=>{ const g=ctx.createLinearGradient(bm.x-bm.w/2,0,bm.x+bm.w/2,0); g.addColorStop(0,"rgba(255,226,61,0)"); g.addColorStop(.3,"rgba(255,226,61,.75)"); g.addColorStop(.5,"rgba(255,255,255,1)"); g.addColorStop(.7,"rgba(255,226,61,.75)"); g.addColorStop(1,"rgba(255,226,61,0)");
        ctx.globalAlpha=Math.min(1,bm.life*2); ctx.fillStyle=g; ctx.fillRect(bm.x-bm.w/2,0,bm.w,bm.y); ctx.globalAlpha=1; });
      bullets.forEach(b=>{ ctx.save();
        if(b.bat){ ctx.translate(b.x,b.y); ctx.scale(.9,.9); ctx.shadowColor=b.c; ctx.shadowBlur=14; ctx.fillStyle="#1a0b33"; ctx.strokeStyle=b.c; ctx.lineWidth=1.5; const bp=new Path2D(BAT); ctx.fill(bp); ctx.stroke(bp); }
        else if(b.card){ ctx.translate(b.x,b.y); ctx.rotate(Math.sin(performance.now()/120+b.x)*.2); ctx.shadowColor=b.c; ctx.shadowBlur=18; ctx.fillStyle="#f4f6fb"; ctx.fillRect(-14,-20,28,40); ctx.fillStyle=b.c; ctx.fillRect(-10,-16,20,24); ctx.fillStyle="#111"; ctx.fillRect(-10,12,20,4); }
        else { ctx.shadowColor=b.c; ctx.shadowBlur=12; ctx.fillStyle=b.c; ctx.beginPath(); ctx.ellipse(b.x,b.y,b.r*.8,b.r*2.2,Math.atan2(b.vx,-b.vy),0,TAU); ctx.fill(); }
        ctx.restore(); });
      if(P.twin>0&&img&&img.complete&&mode!=="over"){ const hh=104,ww=hh*100/156; ctx.save(); ctx.globalAlpha=.6; [-110,110].forEach(o=>{ glowCircle(P.x+o,P.y+60,22,"127,255,255",.6); ctx.drawImage(img,P.x+o-ww/2,P.y-46,ww,hh); }); ctx.restore(); }
      fx.forEach(e=>e.d(e.t/e.max));
      if(mode!=="over") drawPlayer();
      parts.forEach(p=>{ ctx.globalAlpha=1-p.life/p.max; ctx.fillStyle=p.c; ctx.fillRect(p.x,p.y,p.s,p.s); }); ctx.globalAlpha=1;
      if(ring){ ctx.strokeStyle=ACCHEX(); ctx.globalAlpha=1-ring.life/.8; ctx.lineWidth=14; ctx.beginPath(); ctx.arc(ring.x,ring.y,ring.r,0,TAU); ctx.stroke(); ctx.globalAlpha=1; }
      ctx.textAlign="center"; ctx.textBaseline="middle";
      texts.forEach(t=>{ ctx.globalAlpha=1-t.life/1.2; ctx.fillStyle=t.c; ctx.font="800 18px 'Be Vietnam Pro',sans-serif"; ctx.fillText(t.t,t.x,t.y); }); ctx.globalAlpha=1;
      const boss=foes.find(f=>f.boss);
      if(boss){ const bw=Math.min(420,W*.6); ctx.fillStyle="rgba(255,255,255,.12)"; ctx.fillRect(W/2-bw/2,64,bw,10); ctx.fillStyle="#ff4d6a"; ctx.fillRect(W/2-bw/2,64,bw*boss.hp/boss.max,10);
        ctx.fillStyle="#fff"; ctx.font="700 11px 'JetBrains Mono',monospace"; ctx.fillText(boss.name||"ĐẠI YÊU QUÁI",W/2,52); }
      if(banner>0&&mode==="play"){ ctx.globalAlpha=Math.min(1,banner); ctx.fillStyle=ACCHEX(); ctx.font="800 clamp(2rem,6vw,4rem) 'Be Vietnam Pro',sans-serif"; ctx.font=`800 ${Math.min(64,W*.09)}px 'Be Vietnam Pro',sans-serif`; ctx.fillText(wave%5===0?`WAVE ${wave} · ${BOSSN[((wave/5-1)|0)%3]}`:`WAVE ${wave}`,W/2,H*.4); ctx.globalAlpha=1; }
    } else {
      // menu: vài yêu quái bay nền
      const t=performance.now()/1000;
      for(let i=0;i<5;i++){ drawFoe({type:["oni","yurei","eye","oni","yurei"][i],x:W*(.15+i*.18),y:H*.25+Math.sin(t+i)*30,r:24,t:t+i,flash:0}); }
    }
    ctx.restore();
    if(flash>0){ ctx.fillStyle=`rgba(255,255,255,${Math.min(.8,flash)})`; ctx.fillRect(0,0,W,H); }
  }

  /* ---------- loop & input ---------- */
  function frame(now){
    if(!open) return; raf=requestAnimationFrame(frame);
    const dt=Math.min(.05,(now-last)/1000); last=now;
    if(mode==="play") update(dt);
    else if(mode==="over"){ parts.forEach(p=>{p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}); parts=parts.filter(p=>p.life<p.max); stars.forEach(s=>{ s.y+=s.z*60*dt; if(s.y>H){s.y=0;s.x=rnd(0,W);} }); }
    else if(stars) stars.forEach(s=>{ s.y+=s.z*60*dt; if(s.y>H){s.y=0;s.x=rnd(0,W);} });
    draw();
  }
  cv.addEventListener("pointerdown",e=>{
    if(mode!=="play") return; cv.setPointerCapture(e.pointerId); firing=true;
    tx=e.clientX; ty=e.pointerType==="touch"?e.clientY-70:e.clientY;
  });
  cv.addEventListener("pointermove",e=>{
    if(mode!=="play") return;
    tx=e.clientX; ty=e.pointerType==="touch"?e.clientY-70:e.clientY;
    if(e.pointerType==="touch") firing=true;
  });
  addEventListener("pointerup",()=>{ firing=false; keys[" "]&&(firing=true); });
  addEventListener("keydown",e=>{
    if(!open) return;
    if(e.target&&e.target.tagName==="INPUT") return;
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if([" ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(k)) e.preventDefault();
    keys[k]=true;
    if(k===" ") firing=true;
    if(k==="e") kick();
    if(k==="p"||k==="Escape"){ if(mode==="play") pause(true); else if(mode==="pause") pause(false); else if(mode==="menu") close(); }
    if(k==="Enter"&&mode==="menu") start();
  });
  addEventListener("keyup",e=>{ const k=e.key.length===1?e.key.toLowerCase():e.key; keys[k]=false; if(k===" ") firing=false; });
  addEventListener("blur",()=>{ if(open&&mode==="play") pause(true); });
  $s("shExit").onclick=close;
  $s("shPause").onclick=()=>pause(mode==="play");
  $s("shKick").onclick=kick;
  $s("shMusic").onclick=e=>{ shMusicOn=!shMusicOn; store.set("shootMusic",shMusicOn?"1":"0"); e.currentTarget.style.opacity=shMusicOn?1:.4; if(shMusicOn&&mode==="play") MUSIC.start(); };
  $s("shMusic").style.opacity=shMusicOn?1:.4;
  return {open:openG};
})();

$("#cGame").title="Chơi game: Kamen Rider tiêu diệt yêu quái";
$("#cGame").onclick=e=>{ e.currentTarget.setAttribute("aria-pressed","true"); SHOOT.open(); };
