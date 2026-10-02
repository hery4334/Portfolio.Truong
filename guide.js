/* ---- người dẫn đường: đi theo từng trang, không chữ, rê chuột vào là chạy ---- */
const TOUR = [
  {sel:".hero",   at:".hero h1",        act:()=>shatter($(".hero h1"))},
  {sel:"#what",   at:"#what h2",        act:()=>{ document.querySelectorAll("#what .card").forEach((c,i)=>setTimeout(()=>{c.style.transform="perspective(700px) rotateX(6deg) rotateY(-8deg)";setTimeout(()=>c.style.transform="",700);},i*400)); }},
  {sel:"#journey",at:"#pass",           act:()=>{ $("#pass").click(); setTimeout(()=>{$("#pass").click();$("#dots").children[1].click();},1800); }},
  {sel:"#process",at:"#process h2",     act:()=>{ const r=$("#process h2").getBoundingClientRect(); SP.burst(r.left+120,r.top+30,24,1); }},
  {sel:"#commit", at:"#commit h2",      act:()=>shatter($("#commit h2"))},
  {sel:"#work",   at:"#work h2",        act:()=>{ for(let k=0;k<6;k++) setTimeout(()=>SP.zap(gx+40,gy+40),k*450); }},
  {sel:"#tools",  at:"#tools h2",       act:()=>{ const r=$("#tools h2").getBoundingClientRect(); SP.burst(r.left+200,r.top+30,24,1); }},
  {sel:"#faq",    at:"#faq h2",         act:()=>{ const d=document.querySelector("#faq details"); if(d){ d.open=true; setTimeout(()=>d.open=false,3000); } }},
  {sel:"#contact",at:"#contact h2",     act:()=>shatter($("#contact h2"))}
];
const dock=$("#dock"), av=$("#dockAv"), gdots=$("#gdots");
let gcur = Math.min(Math.max(+store.get("guide")||0,0),CHARS.length-1);
let tourI=-1, tourT=null, gx=16, gy=0, lastEnd=-1e9;
const gsize = () => innerWidth<560?84:110;
gdots.innerHTML = TOUR.map(()=>"<i></i>").join("");
function paintDots(){ [...gdots.children].forEach((d,j)=>{ d.classList.toggle("on",tourI>=0&&j<=tourI); d.classList.toggle("cur",j===tourI); }); }
function place(x,y,walk){
  const s=gsize();
  x=Math.max(8,Math.min(innerWidth-s-8,x)); y=Math.max(76,Math.min(innerHeight-s-70,y));
  av.style.setProperty("--tilt",(x>=gx?8:-8)+"deg");
  dock.classList.toggle("walk",!!walk);
  gx=x; gy=y; dock.style.transform=`translate(${x}px,${y}px)`;
}
const home = walk => place(16, innerHeight-gsize()-40, walk);
addEventListener("resize",()=>{ if(tourI<0) home(false); });
function hop(){
  dock.classList.remove("hop"); void dock.offsetWidth; dock.classList.add("hop");
  beep(CHARS[gcur].pitch,.09,"square",.04); setTimeout(()=>beep(CHARS[gcur].pitch*1.5,.1,"square",.04),90);
  SP.burst(gx+gsize()/2,gy+gsize()/2,16,.8);
}
function setChar(i){
  gcur=i; store.set("guide",i);
  const c=CHARS[i], root=document.documentElement;
  root.style.setProperty("--acc",c.acc); root.style.setProperty("--acc-rgb",hex2rgb(c.acc));
  ACC.rgb=hex2rgb(c.acc);
  applyTheme(i);
  av.innerHTML=avatar(i);
}
function goStep(i){
  clearTimeout(tourT); tourI=i; paintDots(); dock.classList.add("touring");
  const s=TOUR[i], sec=document.querySelector(s.sel);
  if(i===0) scrollTo({top:0,behavior:"smooth"}); else if(sec) sec.scrollIntoView({behavior:"smooth",block:"start"});
  let ly=-1, still=0, waited=0;
  (function settle(){                                        // chờ cuộn xong rồi mới đi tới cạnh nội dung
    if(tourI!==i) return;
    waited+=100; if(Math.abs(scrollY-ly)<1) still++; else still=0; ly=scrollY;
    if(still<3 && waited<4000){ tourT=setTimeout(settle,100); return; }
    const t=document.querySelector(s.at), r=t.getBoundingClientRect(), sz=gsize();
    let x=r.right+14; if(x+sz+16>innerWidth) x=innerWidth-sz-16;
    place(x, r.top+r.height/2-sz/2, true);
    tourT=setTimeout(()=>{                                   // tới nơi: nhảy + minh họa
      if(tourI!==i) return;
      dock.classList.remove("walk"); hop(); s.act&&s.act();
      tourT=setTimeout(()=>{ if(tourI!==i) return; if(i<TOUR.length-1) goStep(i+1); else endTour(); }, 4600);
    },1400);
  })();
}
let henshinning=false;
function speakShout(list){
  try{
    if(!soundOn||!window.speechSynthesis) return;
    speechSynthesis.cancel();
    list.forEach(([t,l])=>{ const u=new SpeechSynthesisUtterance(t); u.lang=l; u.rate=.9; u.pitch=l==="ja-JP"?.7:.55; u.volume=.85; speechSynthesis.speak(u); });
  }catch(e){}
}
function henshin(done){
  if(henshinning) return;
  if(RM){ done&&done(); return; }
  henshinning=true;
  const H=HENSHIN[gcur%HENSHIN.length], pose="pose"+H.pose;
  dock.classList.remove("hidden"); dock.classList.add("touring","civil","hs-charge",pose);
  H.notes.forEach((f,i)=>setTimeout(()=>beep(f,.13,"square",.045),i*230));
  setTimeout(()=>speakShout(H.say),520);
  setTimeout(()=>{
    dock.classList.remove("civil","hs-charge"); dock.classList.add("hs-wave");
    const r=av.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height*.6;
    ["hs-flash","hs-ring"].forEach(cl=>{ const d=document.createElement("div"); d.className=cl; d.style.setProperty("--fx",x+"px"); d.style.setProperty("--fy",y+"px"); document.body.appendChild(d); setTimeout(()=>d.remove(),1000); });
    SP.burst(x,y,110,1.8,H.cols); setTimeout(()=>SP.burst(x,y-30,50,1.1,H.cols),180);
    hop(); beep(180,.3,"sawtooth",.06);
    H.notes.slice().reverse().forEach((f,i)=>setTimeout(()=>beep(f*2,.16,"square",.05),60+i*90));
  },1250);
  setTimeout(()=>{ dock.classList.remove("hs-wave",pose); henshinning=false; done&&done(); },3500);
}
function startTour(){ dock.classList.remove("hidden"); henshin(()=>goStep(0)); }
function endTour(){
  clearTimeout(tourT); tourI=-1; lastEnd=performance.now(); paintDots();
  dock.classList.remove("touring"); hop(); home(true);
  setTimeout(()=>dock.classList.remove("walk"),1400);
}
function stopTour(){ clearTimeout(tourT); tourI=-1; paintDots(); dock.classList.remove("touring","walk"); }
let started=0;
av.addEventListener("pointerenter",()=>{
  if(tourI<0 && !gate.classList.contains("open") && performance.now()-lastEnd>2500){ started=performance.now(); startTour(); }
});
av.addEventListener("click",()=>{
  if(performance.now()-started<800) return;                  // tránh tap vừa bắt đầu đã dừng
  if(tourI>=0) endTour(); else { started=performance.now(); startTour(); }
});

/* cổng chọn nhân vật */
const gate=$("#gate");
function drawGate(anim){
  const c=CHARS[gcur];
  $("#gstage").innerHTML=avatar(gcur); if(anim) $("#gstage svg").classList.add("pop");
  $("#gname").textContent=c.name; $("#gtag").textContent=c.tag;
  $("#ggo").innerHTML=`Để ${c.name} lái →`;
  [...$("#gthumbs").children].forEach((b,i)=>{ b.classList.toggle("on",i===gcur); b.setAttribute("aria-pressed",i===gcur); });
  setChar(gcur); beep(c.pitch,.1,"square",.04);
}
$("#gthumbs").innerHTML=CHARS.map((c,i)=>`<button aria-label="${c.name}">${avatar(i,true)}</button>`).join("");
$("#gthumbs").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; gcur=[...$("#gthumbs").children].indexOf(b); drawGate(true); });
const shift=d=>{ gcur=(gcur+d+CHARS.length)%CHARS.length; drawGate(true); };
$("#gprev").onclick=()=>shift(-1); $("#gnext").onclick=()=>shift(1);
let heroDone=false;
function closeGate(tour){
  gate.classList.add("out"); document.body.classList.remove("locked");
  setTimeout(()=>{ gate.classList.remove("open","out"); },500);
  removeEventListener("keydown",gateKeys);
  if(!heroDone){ heroDone=true; setTimeout(()=>dropIn($(".hero h1")),350); }
  setChar(gcur);
  if(tour){ home(false); dock.classList.remove("hidden"); } else dock.classList.add("hidden");
}
function gateKeys(e){
  if(e.key==="ArrowLeft") shift(-1); else if(e.key==="ArrowRight") shift(1);
  else if(e.key==="Enter"){ e.preventDefault(); closeGate(true); } else if(e.key==="Escape") closeGate(false);
}
function openGate(){
  stopTour(); dock.classList.add("hidden");
  gate.classList.add("open"); document.body.classList.add("locked"); drawGate(true);
  addEventListener("keydown",gateKeys); $("#ggo").focus();
}
$("#ggo").onclick=()=>closeGate(true);
$("#gskip").onclick=()=>closeGate(false);

/* điều khiển góc phải */
$("#cTour").onclick=()=>{ stopTour(); startTour(); };
$("#cChar").onclick=openGate;
$("#cSound").onclick=e=>{ soundOn=!soundOn; e.currentTarget.setAttribute("aria-pressed",soundOn); e.currentTarget.textContent="Âm thanh: "+(soundOn?"on":"off"); };
$("#cGame").onclick=e=>{
  const on=e.currentTarget.getAttribute("aria-pressed")!=="true";
  e.currentTarget.setAttribute("aria-pressed",on); document.body.classList.toggle("game",on);
  SP.setGame(on); e.currentTarget.textContent=on?"Game: 0":"Game";
};
SP.onScore((s,b)=>{ const g=$("#cGame"); if(g.getAttribute("aria-pressed")==="true") g.textContent=`Game: ${s} · Kỷ lục ${b}`; });

/* khởi động */
setChar(gcur);
home(false);
openGate();

