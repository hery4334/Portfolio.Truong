var ACC={rgb:"198,255,61"};
/* ===== DỮ LIỆU: sửa tại đây ===== */
const PASSES = [
  {code:"EDU-00", title:"CNTT · Phân tích nghiệp vụ", role:"Cử nhân CNTT", time:"20XX — 20XX", res:"BPMN · thiết kế hệ thống", note:"Học vẽ quy trình trước khi viết dòng code đầu tiên."},
  {code:"INTERN-00", title:"Thực tập quản trị hệ thống", role:"Admin intern", time:"MM/20XX — MM/20XX", res:"Xử lý nhanh gấp 2×", note:"Biến bảng tính xếp lịch thành công cụ tự chạy."},
  {code:"CRM-00", title:"Salesforce CRM", role:"Salesforce admin", time:"MM/20XX — MM/20XX", res:"−70% sai sót thủ công", note:"Flow và Apex giúp cả đội thôi copy-paste."},
  {code:"SID-00", title:"Tư vấn phần mềm", role:"Solutions consultant · SID CORP", time:"MM/20XX — nay", res:"−40% thời gian bàn giao", note:"Ngồi cùng ban lãnh đạo, để lại một hệ thống chạy thật."}
];
const PROJECTS = [
  {n:"DodgePrint", img:"images/solution-ecommerce.png", t:"In theo yêu cầu · TMĐT", tags:"Đơn đã điều phối · 85% tự động", num:85, suf:"%", lab:"tự động hóa", url:"https://dodgeprint.com/"},
  {n:"SidPeak", img:"images/solution-hr.png", t:"ERP · Nhân sự & lương", tags:"Đã chốt lương · Chấm công IoT", num:60, suf:"%", lab:"giảm thời gian tính lương", url:"https://sidpeak.vn/"},
  {n:"Bozuro", img:"images/solution-marketing.png", t:"CDP · Marketing tự động", tags:"5 kênh · 1 hồ sơ · +28% mua lại", num:28, pre:"+", suf:"%", lab:"mua lại", url:"https://bozuro.com/"},
  {n:"ePOD System", img:"images/solution-custom.png", t:"Logistics · Di động", tags:"Đã ký · Khóa GPS · 14 ngày → 24h", num:24, suf:"h", lab:"đối soát, thay vì 14 ngày", url:"https://epodsystem.com/"},
  {n:"AnHome", img:"images/solution-property.png", t:"PropTech · Web & app", tags:"Hóa đơn qua Zalo · −40% chi phí", num:40, pre:"−", suf:"%", lab:"chi phí", url:"https://anhome.app/"},
  {n:"BounceCheck", img:"images/solution-support.png", t:"Email API · Deliverability", tags:"MX · SMTP · Traps · 10K trong 30s", num:10, suf:"K", lab:"email trong 30 giây", url:"https://bouncecheck.email/"},
  {n:"SidStudio", img:"images/solution-custom.png", t:"Website thương hiệu · Next.js", tags:"Core Web Vitals 95+ · +45% khách tiềm năng", num:95, suf:"+", lab:"điểm PageSpeed", url:"https://sidstudio.epodsystem.com/"}
];
const TOOLS = ["Next.js · React","TypeScript","Node.js","Golang","PostgreSQL","Redis","Kafka","Docker · CI/CD","Salesforce CRM","Claude API","RAG pipelines","ClickHouse","Flutter","Tailwind CSS"];
const MARQUEE = ["Thương mại điện tử","ERP & CRM","AI agents","RAG","Next.js","Microservices","Nền tảng dữ liệu","Web & app"];

/* ===== render ===== */
const $ = s => document.querySelector(s);
$("#mq").innerHTML = [...MARQUEE,...MARQUEE].map(t=>`<span>${t}</span>`).join("");
$("#toolList").innerHTML = TOOLS.map(t=>`<span>${t}</span>`).join("");
$("#projects").innerHTML = `<div class="pgrid">` + PROJECTS.map((p,i)=>`
  <a class="proj reveal" data-tilt href="${p.url}" target="_blank" rel="noopener">
    <div class="img"><img src="${p.img}" alt="Minh họa dự án ${p.n}" width="1024" height="1024" loading="lazy"><span class="no">0${i+1} ↗</span></div>
    <div class="body">
      <h3>${p.n}</h3><span class="mono">${p.t}</span>
      <p style="color:var(--mut);font-size:.9rem">${p.tags}</p>
      <div class="stat"><b data-count="${p.num}" data-prefix="${p.pre||""}" data-suffix="${p.suf}">0</b><span class="mono">${p.lab}</span></div>
    </div>
  </a>`).join("") + `
  <a class="proj free reveal" href="#contact"><span class="mono">Vị trí 08 · còn trống</span>
    <h3 style="margin:10px 0">Sản phẩm của bạn<br>trên bức tường này.</h3>
    <p class="mono">Phạm vi rõ · 30 phút là biết có làm được không</p></a></div>`;

/* ===== staff pass ===== */
let cur = 0;
const pass = $("#pass"), dots = $("#dots");
dots.innerHTML = PASSES.map((_,i)=>`<button role="tab" aria-label="Chặng ${i+1}"></button>`).join("");
function draw(){
  const p = PASSES[cur];
  $("#pf").innerHTML = `<span class="k">Staff pass</span><span class="k" style="color:var(--acc)">${p.code}</span><h4>${p.title}</h4><span class="k">Vai trò</span><span>${p.role}</span><span class="k">Thời gian</span><span>${p.time}</span>`;
  $("#pb").innerHTML = `<span class="k">Kết quả</span><div class="big">${p.res}</div><h4 style="font-size:1.1rem;font-weight:500">${p.note}</h4>`;
  [...dots.children].forEach((d,i)=>d.classList.toggle("on",i===cur));
}
pass.addEventListener("click",()=>pass.classList.toggle("flip"));
dots.addEventListener("click",e=>{
  const i=[...dots.children].indexOf(e.target); if(i<0) return;
  cur=i; pass.classList.remove("flip"); draw();
});
draw();

/* ===== reveal + count-up ===== */
const io = new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return;
  e.target.classList.add("is-visible");
  e.target.querySelectorAll("[data-count]").forEach(countUp);
  io.unobserve(e.target);
}),{threshold:.15});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
function countUp(el){
  const end=+el.dataset.count, pre=el.dataset.prefix||"", suf=el.dataset.suffix||"", t0=performance.now();
  (function f(t){
    const k=Math.min((t-t0)/1400,1), v=Math.round(end*(1-Math.pow(1-k,3)));
    el.textContent=pre+v+suf; if(k<1) requestAnimationFrame(f);
  })(t0);
}

/* ===== tilt cards + magnetic buttons ===== */
document.querySelectorAll("[data-tilt]").forEach(c=>{
  c.addEventListener("mousemove",e=>{
    const r=c.getBoundingClientRect();
    const x=(e.clientY-r.top-r.height/2)/-24, y=(e.clientX-r.left-r.width/2)/24;
    c.style.transform=`perspective(700px) rotateX(${x}deg) rotateY(${y}deg)`;
  });
  c.addEventListener("mouseleave",()=>c.style.transform="");
});
document.querySelectorAll("[data-magnet]").forEach(b=>{
  b.addEventListener("mousemove",e=>{
    const r=b.getBoundingClientRect();
    b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`;
  });
  b.addEventListener("mouseleave",()=>b.style.transform="");
});

/* ===== rotating word ===== */
const words=["code.","tài liệu.","demo."]; let wi=0;
setInterval(()=>{wi=(wi+1)%words.length;$("#swap").textContent=words[wi];},2200);

/* ===== scroll progress ===== */
addEventListener("scroll",()=>{
  const h=document.documentElement;
  $("#progress").style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+"%";
},{passive:true});

/* ===== hero particle network (signature background) ===== */
(function(){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv=$("#bg"), ctx=cv.getContext("2d"); let W,H,pts=[],m={x:-999,y:-999};
  function size(){W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight;
    pts=Array.from({length:Math.min(80,W/16)},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4}));}
  addEventListener("resize",size); size();
  cv.parentElement.addEventListener("mousemove",e=>{const r=cv.getBoundingClientRect();m.x=e.clientX-r.left;m.y=e.clientY-r.top;});
  cv.parentElement.addEventListener("pointerdown",e=>{const r=cv.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top;
    pts.forEach(p=>{const d=Math.hypot(p.x-cx,p.y-cy)||1;if(d<320){const f=(320-d)/320*10;p.vx+=(p.x-cx)/d*f;p.vy+=(p.y-cy)/d*f;}});});
  (function loop(){
    ctx.clearRect(0,0,W,H);
    pts.forEach((p,i)=>{
      if(p.bx===undefined){p.bx=p.vx;p.by=p.vy}
      p.vx+=(p.bx-p.vx)*.02;p.vy+=(p.by-p.vy)*.02;p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W){p.vx*=-1;p.bx*=-1} if(p.y<0||p.y>H){p.vy*=-1;p.by*=-1}
      ctx.fillStyle=`rgba(${ACC.rgb},.7)`;ctx.beginPath();ctx.arc(p.x,p.y,1.6,0,7);ctx.fill();
      for(let j=i+1;j<pts.length;j++){
        const q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);
        if(d<120){ctx.strokeStyle=`rgba(${ACC.rgb},${.18*(1-d/120)})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
      }
      const dm=Math.hypot(p.x-m.x,p.y-m.y);
      if(dm<160){ctx.strokeStyle=`rgba(${ACC.rgb},${.5*(1-dm/160)})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(m.x,m.y);ctx.stroke();}
    });
    requestAnimationFrame(loop);
  })();
})();

