/* ---- bào tử: bay, tách khỏi con trỏ, bấm để phân tách ---- */
const SP = (function(){
  const cv=document.createElement("canvas"); cv.id="spores"; cv.setAttribute("aria-hidden","true"); document.body.appendChild(cv);
  const ctx=cv.getContext("2d"); let W,H; const dpr=Math.min(devicePixelRatio||1,2);
  function rs(){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  addEventListener("resize",rs); rs();
  let sp=[], dust=[], game=false, score=0, best=+store.get("sporeBest")||0, onScore=()=>{};
  const mk=(x,y,r,g)=>({x,y,r,g,vx:rnd(-.3,.3),vy:rnd(-.5,-.2),ph:rnd(0,6.28)});
  const R = s => s.r*(game?1.5:1);
  function burst(x,y,n=16,power=1,colors){
    for(let i=0;i<n;i++){
      const a=rnd(0,6.283), v=rnd(1,7)*power;
      dust.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.5,life:0,max:rnd(35,80),s:rnd(1.5,4),w:Math.random()<.35,col:colors?colors[(Math.random()*colors.length)|0]:null});
    }
  }
  function pop(s){
    sp.splice(sp.indexOf(s),1);
    burst(s.x,s.y,8+(2-s.g)*4,.8);
    beep(380+s.g*160+rnd(0,60),.07,"triangle",.04);
    if(s.g<2){
      const base=rnd(0,6.283), n=3-s.g;
      for(let k=0;k<n;k++){ /* phân tách thành 2–3 bào tử nhỏ hơn */
        const c=mk(s.x,s.y,s.r*.62,s.g+1), a=base+k*(6.283/n);
        c.vx=Math.cos(a)*3.2; c.vy=Math.sin(a)*3.2; sp.push(c);
      }
    }
    if(game){ score++; if(score>best){best=score;store.set("sporeBest",best);} onScore(score,best); }
  }
  addEventListener("pointerdown",e=>{
    if(e.target.closest("input,textarea,#shoot")) return;
    let hit=null,bd=1e9;
    sp.forEach(s=>{const d=Math.hypot(s.x-e.clientX,s.y-e.clientY); if(d<R(s)+16&&d<bd){bd=d;hit=s;}});
    if(hit) pop(hit); else burst(e.clientX,e.clientY,game?5:12,.7);
  });
  function tick(){
    ctx.clearRect(0,0,W,H);
    const want=game?16:8;
    if(!RM && sp.filter(s=>s.g===0).length<want && sp.length<70 && Math.random()<.05) sp.push(mk(rnd(0,W),H+40,rnd(10,16),0));
    const rgb=ACC.rgb;
    for(let i=0;i<sp.length;i++){
      const s=sp[i]; s.ph+=.02;
      s.vx+=(0-s.vx)*.02; s.vy+=(-.32-s.vy)*.02;
      s.x+=s.vx+Math.sin(s.ph)*.35; s.y+=s.vy;
      const dx=s.x-mouse.x, dy=s.y-mouse.y, d=Math.hypot(dx,dy);
      if(d<140&&d>0){ const f=(140-d)/140*2.4; s.x+=dx/d*f; s.y+=dy/d*f; }
      for(let j=i+1;j<sp.length;j++){
        const o=sp[j], ox=s.x-o.x, oy=s.y-o.y, od=Math.hypot(ox,oy), min=R(s)+R(o);
        if(od<min&&od>0){ const f=(min-od)*.05; s.x+=ox/od*f; s.y+=oy/od*f; o.x-=ox/od*f; o.y-=oy/od*f; }
      }
      if(s.y<-50){s.y=H+40;s.x=rnd(0,W);}
      if(s.x<-50)s.x=W+40; if(s.x>W+50)s.x=-40;
      const r=R(s);
      const g=ctx.createRadialGradient(s.x-r*.3,s.y-r*.3,r*.1,s.x,s.y,r);
      g.addColorStop(0,"rgba(255,255,255,.95)"); g.addColorStop(.4,`rgba(${rgb},.8)`); g.addColorStop(1,`rgba(${rgb},.08)`);
      ctx.globalAlpha=game?1:.6; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(s.x,s.y,r,0,7); ctx.fill();
      ctx.fillStyle=`rgba(${rgb},.9)`;
      for(let k=0;k<4;k++){ const a=s.ph*.7+k*1.57; ctx.beginPath(); ctx.arc(s.x+Math.cos(a)*r*1.25,s.y+Math.sin(a)*r*1.25,r*.13,0,7); ctx.fill(); }
      ctx.globalAlpha=1;
    }
    for(let i=dust.length-1;i>=0;i--){
      const p=dust[i]; p.life++; p.vy+=.14; p.vx*=.985; p.x+=p.vx; p.y+=p.vy;
      if(p.life>p.max){dust.splice(i,1);continue;}
      ctx.globalAlpha=1-p.life/p.max; ctx.fillStyle=p.col||(p.w?"#fff":`rgb(${rgb})`);
      ctx.fillRect(p.x,p.y,p.s,p.s);
    }
    ctx.globalAlpha=1;
    requestAnimationFrame(tick);
  }
  if(!RM){ for(let i=0;i<6;i++) sp.push(mk(rnd(0,W),rnd(0,H),rnd(10,16),0)); }
  tick();
  return {zap(x,y){let h=null,bd=1e9;sp.forEach(q=>{const d=Math.hypot(q.x-x,q.y-y);if(d<bd){bd=d;h=q}});if(h)pop(h)}, burst, setGame(v){game=v;score=0;onScore(0,best);}, onScore(fn){onScore=fn;}, get best(){return best;}};
})();

/* ---- chữ rơi (điểm rơi) & vỡ tan ---- */
function splitChars(el){
  el.setAttribute("aria-label", el.textContent.replace(/\s+/g," ").trim());
  let n=0;
  (function walk(node){
    [...node.childNodes].forEach(c=>{
      if(c.nodeType===3){
        const frag=document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(part=>{
          if(!part) return;
          if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(" ")); return; }
          const w=document.createElement("span"); w.className="w"; w.setAttribute("aria-hidden","true");
          [...part].forEach(ch=>{
            const s=document.createElement("span"); s.className="ch pre"; s.textContent=ch;
            s.style.setProperty("--i",n++); s.style.setProperty("--r",rnd(-40,40)+"deg"); w.appendChild(s);
          });
          frag.appendChild(w);
        });
        c.replaceWith(frag);
      } else if(c.nodeType===1 && c.tagName!=="BR") walk(c);
    });
  })(el);
}
function dropIn(el){
  const chs=el.querySelectorAll(".ch.pre");
  chs.forEach(c=>{ c.classList.remove("pre"); if(!RM) c.classList.add("drop"); });
  if(!RM){
    setTimeout(()=>{ chs.forEach(c=>c.classList.remove("drop")); const r=el.getBoundingClientRect(); SP.burst(r.left+r.width/2,r.bottom,10,.6); beep(110,.12,"sine",.05); },chs.length*38+1150);
  }
}
function shatter(el){
  if(el._busy || RM) return; el._busy=true;
  const chs=el.querySelectorAll(".ch"), r=el.getBoundingClientRect();
  SP.burst(r.left+r.width/2,r.top+r.height/2,50,1.3); beep(150,.28,"sawtooth",.04); beep(90,.35,"square",.03);
  chs.forEach(c=>{
    c.style.setProperty("--dx",rnd(-280,280)+"px"); c.style.setProperty("--dy",rnd(-140,340)+"px"); c.style.setProperty("--r",rnd(-540,540)+"deg");
    c.classList.add("boom");
  });
  setTimeout(()=>chs.forEach(c=>c.classList.remove("boom")),1500);
  setTimeout(()=>{ el._busy=false; },2500);
}
document.querySelectorAll(".split").forEach(el=>{
  splitChars(el);
  el.addEventListener("click",()=>shatter(el));
  if(el.dataset.drop!=="manual"){
    const o=new IntersectionObserver(([e])=>{ if(e.isIntersecting){ dropIn(el); o.disconnect(); } },{threshold:.4});
    o.observe(el);
  }
});

/* ---- thẻ công nghệ rơi + kéo ném (Matter.js) ---- */
(function(){
  const box=$("#toolList"); if(!box || RM) return;
  let started=false;
  const start=(tries=0)=>{
    if(started) return;
    if(!window.Matter){ if(tries<20) setTimeout(()=>start(tries+1),400); return; }
    started=true;
    const {Engine,Bodies,Composite,Mouse,MouseConstraint,Runner}=Matter;
    const spans=[...box.querySelectorAll("span")];
    const sizes=spans.map(el=>[el.offsetWidth,el.offsetHeight]);
    box.classList.add("phys");
    const W=box.clientWidth, H=box.clientHeight;
    const eng=Engine.create(); eng.gravity.y=1.1;
    const wall=(x,y,w,h)=>Bodies.rectangle(x,y,w,h,{isStatic:true});
    Composite.add(eng.world,[wall(W/2,H+30,W*2,60),wall(-30,H/2,60,H*3),wall(W+30,H/2,60,H*3)]);
    const items=spans.map((el,i)=>{
      const [w,h]=sizes[i];
      const b=Bodies.rectangle(rnd(w,Math.max(w+1,W-w)),-60-i*70,w,h,{restitution:.45,friction:.2,chamfer:{radius:h/2},angle:rnd(-.6,.6)});
      Composite.add(eng.world,b); return {el,b,w,h};
    });
    if(matchMedia("(pointer: fine)").matches){
      const m=Mouse.create(box);
      m.element.removeEventListener("mousewheel",m.mousewheel); m.element.removeEventListener("DOMMouseScroll",m.mousewheel);
      Composite.add(eng.world,MouseConstraint.create(eng,{mouse:m,constraint:{stiffness:.2,render:{visible:false}}}));
    }
    Runner.run(Runner.create(),eng);
    (function paint(){
      items.forEach(({el,b,w,h})=>{ el.style.transform=`translate(${b.position.x-w/2}px,${b.position.y-h/2}px) rotate(${b.angle}rad)`; });
      requestAnimationFrame(paint);
    })();
    let last=0;
    Matter.Events.on(eng,"collisionStart",ev=>{ if(performance.now()-last<120) return;
      ev.pairs.forEach(p=>{ if(p.bodyA.isStatic||p.bodyB.isStatic){ last=performance.now(); const b=p.bodyA.isStatic?p.bodyB:p.bodyA;
        const r=box.getBoundingClientRect(); if(b.speed>6){ SP.burst(r.left+b.position.x,r.top+H-4,6,.5); beep(120+b.speed*8,.05,"sine",.03); } } }); });
  };
  const o=new IntersectionObserver(([e])=>{ if(e.isIntersecting){ o.disconnect(); start(); } },{threshold:.35});
  o.observe(box);
})();

