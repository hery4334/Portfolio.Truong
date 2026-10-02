/* =====================================================================
   NGƯỜI DẪN ĐƯỜNG · BÀO TỬ · CHỮ RƠI & VỠ TAN · THẺ CÔNG NGHỆ RƠI
   ===================================================================== */
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rnd = (a,b)=>a+Math.random()*(b-a);
const store = {get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};

/* ---- âm thanh ---- */
let soundOn = true, AC = null;
function beep(f=440,d=.09,type="square",v=.03){
  if(!soundOn) return;
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.value=f;
    g.gain.setValueAtTime(v,AC.currentTime); g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);
    o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime+d);
  }catch(e){}
}

/* ---- 6 nhân vật gốc (vẽ bằng SVG, mắt nhìn theo con trỏ) ---- */
const eye=(x,y,r=8,pr=4)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle class="pupil" cx="${x}" cy="${y}" r="${pr}" fill="#111"/>`;
const HM = (c,o={}) => {
  const {eye="#ff4040",type="slant",mouth="#cfd6e2",back="",top="",mid=""}=o;
  const ln='stroke="#0b0d10" stroke-width="1.5"';
  const eyes = type==="round"
    ? `<circle cx="33" cy="46" r="12.5" fill="${eye}" ${ln}/><circle cx="67" cy="46" r="12.5" fill="${eye}" ${ln}/><path d="M23 40 Q33 33 43 40M57 40 Q67 33 77 40" stroke="#fff" stroke-width="1.6" fill="none" opacity=".45"/><path d="M22 48 L44 48M56 48 L78 48" stroke="#0b0d10" stroke-width="1" opacity=".3"/>`
    : type==="bat"
    ? `<polygon points="21,39 47,49 42,59 23,54" fill="${eye}" ${ln}/><polygon points="79,39 53,49 58,59 77,54" fill="${eye}" ${ln}/>`
    : `<ellipse cx="35" cy="46" rx="12" ry="8.5" transform="rotate(14 35 46)" fill="${eye}" ${ln}/><ellipse cx="65" cy="46" rx="12" ry="8.5" transform="rotate(-14 65 46)" fill="${eye}" ${ln}/><path d="M26 44 Q35 40 44 47M74 44 Q65 40 56 47" stroke="#fff" stroke-width="1.4" fill="none" opacity=".4"/>`;
  const pu = type==="round"?[33,46,67,46]:type==="bat"?[34,49,66,49]:[35,45,65,45];
  const mouthSvg = `<path d="M33 65 Q50 71 67 65 L65 80 Q50 88 35 80Z" fill="${mouth}" ${ln}/><g stroke="#0b0d10" stroke-width="1.3" opacity=".55"><line x1="40" y1="68" x2="40" y2="83"/><line x1="45" y1="69" x2="45" y2="85"/><line x1="50" y1="69" x2="50" y2="86"/><line x1="55" y1="69" x2="55" y2="85"/><line x1="60" y1="68" x2="60" y2="83"/></g>`;
  return `${back}<path d="M20 42 Q20 12 50 12 Q80 12 80 42 L75 74 Q50 90 25 74Z" fill="${c}" ${ln}/><circle cx="21" cy="53" r="6" fill="${c}" ${ln}/><circle cx="79" cy="53" r="6" fill="${c}" ${ln}/>${top}${mid}${eyes}<circle class="pupil" cx="${pu[0]}" cy="${pu[1]-1}" r="3" fill="#fff"/><circle class="pupil" cx="${pu[2]}" cy="${pu[3]-1}" r="3" fill="#fff"/>${mouthSvg}`;
};
const CHARS = [
 {name:"KAMEN RIDER 1", tag:"Châu chấu khởi nguồn, người mở đường từ năm 1971", acc:"#5fe08a", pitch:520, sig:"Henshin!",
  svg:c=>HM(c,{type:"round",eye:"#ff3b30",back:`<path d="M36 18 L26 0 M64 18 L74 0" stroke="#111" stroke-width="3" stroke-linecap="round"/><path d="M20 80 Q50 98 80 80 L88 96 Q50 104 12 96Z" fill="#e63946" stroke="#0b0d10" stroke-width="1.2"/>`,top:`<path d="M46 12 L54 12 L53 33 L47 33Z" fill="#111"/><path d="M26 30 Q50 20 74 30" stroke="#fff" stroke-width="2" fill="none" opacity=".35"/>`})},
 {name:"KUUGA", tag:"Chiến binh sừng vàng, sức mạnh trỗi dậy từ trái tim", acc:"#ff4d4d", pitch:440, sig:"Henshin!",
  svg:c=>HM(c,{type:"slant",eye:"#ff8a8a",back:`<path d="M37 18 L33 -2 L43 10 L50 -6 L57 10 L67 -2 L63 18Z" fill="#ffd23d" stroke="#0b0d10" stroke-width="1.3" stroke-linejoin="round"/>`,top:`<path d="M26 32 Q50 22 74 32" stroke="#dfe6f2" stroke-width="2.4" fill="none"/><circle cx="50" cy="26" r="3.6" fill="#ffd23d" stroke="#0b0d10" stroke-width="1"/>`})},
 {name:"BLADE", tag:"Hiệp sĩ quân bài, một nhát kiếm mở mọi lối", acc:"#4d8dff", pitch:610, sig:"Henshin!",
  svg:c=>HM(c,{type:"slant",eye:"#a6ff4d",back:`<path d="M50 -8 L41 20 L50 14 L59 20Z" fill="#dfe6f2" stroke="#0b0d10" stroke-width="1.3" stroke-linejoin="round"/>`,top:`<path d="M33 24 Q50 12 67 24 L61 33 Q50 28 39 33Z" fill="#dfe6f2" stroke="#0b0d10" stroke-width="1.2"/><path d="M50 18 L53 24 L50 30 L47 24Z" fill="#ffd23d"/>`})},
 {name:"KIVA", tag:"Vua dơi, xiềng xích và tiếng violin", acc:"#a66bff", pitch:340, sig:"Henshin!",
  svg:c=>HM(c,{type:"bat",eye:"#ffd23d",mouth:"#e8c76a",back:`<polygon points="26,34 15,-6 45,14" fill="${c}" stroke="#0b0d10" stroke-width="1.4" stroke-linejoin="round"/><polygon points="74,34 85,-6 55,14" fill="${c}" stroke="#0b0d10" stroke-width="1.4" stroke-linejoin="round"/>`,top:`<path d="M30 30 Q50 18 70 30" stroke="#ffd23d" stroke-width="2.2" fill="none"/><circle cx="50" cy="24" r="4" fill="#ff4d4d" stroke="#0b0d10" stroke-width="1"/>`})},
 {name:"ZERO-ONE", tag:"Rider AI, nhảy vọt như châu chấu", acc:"#ffe23d", pitch:700, sig:"Henshin!",
  svg:c=>HM(c,{type:"slant",eye:"#ff2d2d",back:`<path d="M38 16 Q30 0 14 -4 M62 16 Q70 0 86 -4" stroke="#e8edf5" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,top:`<rect x="22" y="33" width="56" height="26" rx="13" fill="#161616"/><path d="M46 12 L54 12 L52 26 L48 26Z" fill="#161616"/>`})},
 {name:"GAIM", tag:"Samurai trái cây, ra đòn từ lát cam", acc:"#ff9a3d", pitch:580, sig:"Henshin!",
  svg:c=>HM(c,{type:"slant",eye:"#bff4ff",mouth:"#f4e3b0",back:`<path d="M24 22 Q50 -18 76 22 Q50 2 24 22Z" fill="#ffd23d" stroke="#0b0d10" stroke-width="1.3" stroke-linejoin="round"/>`,top:`<circle cx="50" cy="26" r="11" fill="#ffb347" stroke="#fff" stroke-width="1.5"/><g stroke="#fff" stroke-width="1.2"><line x1="50" y1="15" x2="50" y2="37"/><line x1="39" y1="26" x2="61" y2="26"/><line x1="42" y1="18" x2="58" y2="34"/><line x1="58" y1="18" x2="42" y2="34"/></g>`})},
 {name:"DECADE", tag:"Kẻ đi qua mọi thế giới, hủy diệt rồi kết nối", acc:"#ff4fd8", pitch:480, sig:"Henshin!",
  svg:c=>HM("#17171d",{type:"slant",eye:"#e0287d",mouth:"#cfd6e2",
   back:`<rect x="38" y="-16" width="24" height="32" rx="2.5" fill="#dfe6f2" stroke="#0b0d10" stroke-width="1.4"/><rect x="42" y="-12" width="16" height="17" rx="1.5" fill="${c}" stroke="#0b0d10" stroke-width="1"/><path d="M45 -9 L50 -3 L55 -9Z" fill="#17171d"/><rect x="45" y="0" width="10" height="3.5" fill="#fff" opacity=".8"/>`,
   top:`<g stroke="#cfd6e2" stroke-width="2.6" stroke-linecap="round"><line x1="44" y1="15" x2="44" y2="40"/><line x1="50" y1="14" x2="50" y2="40"/><line x1="56" y1="15" x2="56" y2="40"/></g><path d="M22 34 L27 62 M78 34 L73 62" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><path d="M26 22 Q50 10 74 22" stroke="${c}" stroke-width="2.6" fill="none"/>`})},
 {name:"W", tag:"Hai người một thân, nửa xanh nửa đen", acc:"#2fe0e0", pitch:400, sig:"Henshin!",
  svg:c=>HM(c,{type:"slant",eye:"#ff4040",back:`<path d="M40 16 Q30 6 24 -6 M60 16 Q70 6 76 -6" stroke="#dfe6f2" stroke-width="4" fill="none" stroke-linecap="round"/>`,top:`<path d="M50 12 Q80 12 80 42 L75 74 Q50 90 50 90Z" fill="#1c2230" stroke="#0b0d10" stroke-width="1.5"/><circle cx="79" cy="53" r="6" fill="#1c2230" stroke="#0b0d10" stroke-width="1.5"/>`})}
];
/* ---- thân người: bộ đồ siêu nhân (tay, chân, giáp, đai) ---- */
const BODY=(c,o={})=>{
  const suit=o.suit||"#161c2a", gl=o.glove||c, bt=o.boot||c, ch=o.chest||c, ln="#0b0d10";
  const R=x=>o.split?"#1c2230":x;
  const arm=(side,k)=>{ const G=side?R(gl):gl, S=side?R(c):c;
    return `<g transform="${side?"translate(100 0) scale(-1 1)":""}"><g class="limb arm s${k}"><line x1="29" y1="66" x2="19" y2="88" stroke="${ln}" stroke-width="11" stroke-linecap="round"/><line x1="19" y1="88" x2="24" y2="107" stroke="${ln}" stroke-width="11" stroke-linecap="round"/><line x1="29" y1="66" x2="19" y2="88" stroke="${suit}" stroke-width="8.5" stroke-linecap="round"/><line x1="19" y1="88" x2="24" y2="107" stroke="${suit}" stroke-width="8.5" stroke-linecap="round"/><line x1="20.5" y1="94" x2="23.5" y2="104" stroke="${G}" stroke-width="9.5" stroke-linecap="round" stroke-opacity=".95"/>${o.armBand?`<line x1="19" y1="74.7" x2="29" y2="79.3" stroke="${o.armBand}" stroke-width="4.2" stroke-linecap="round"/><line x1="16.4" y1="99" x2="26.6" y2="96.2" stroke="${o.armBand}" stroke-width="4.2" stroke-linecap="round"/>`:""}<circle cx="19" cy="88" r="4.6" fill="${S}" stroke="${ln}" stroke-width="1.2"/><circle cx="24" cy="110" r="6.6" fill="${G}" stroke="${ln}" stroke-width="1.4"/><ellipse cx="29" cy="65" rx="9" ry="7.5" fill="${S}" stroke="${ln}" stroke-width="1.4"/><path d="M23 64 Q29 59 35 64" stroke="#fff" stroke-width="1.2" fill="none" opacity=".4"/></g></g>`; };
  const leg=(side,k)=>{ const B=side?R(bt):bt, S=side?R(c):c;
    return `<g transform="${side?"translate(100 0) scale(-1 1)":""}"><g class="limb leg s${k}"><line x1="41" y1="106" x2="38" y2="128" stroke="${ln}" stroke-width="13" stroke-linecap="round"/><line x1="38" y1="128" x2="38" y2="141" stroke="${ln}" stroke-width="12" stroke-linecap="round"/><line x1="41" y1="106" x2="38" y2="128" stroke="${suit}" stroke-width="10.5" stroke-linecap="round"/><line x1="38" y1="128" x2="38" y2="141" stroke="${suit}" stroke-width="9.5" stroke-linecap="round"/>${o.stripe?`<line x1="43.2" y1="108" x2="40.5" y2="127" stroke="${o.stripe}" stroke-width="2.6" stroke-linecap="round"/><line x1="41" y1="130" x2="41" y2="140" stroke="${o.stripe}" stroke-width="2.4" stroke-linecap="round"/>`:""}<circle cx="38" cy="127" r="5.4" fill="${o.knee||S}" stroke="${ln}" stroke-width="1.2"/><path d="M31 134 L45 134 L47 152 L26 152 Q26 144 31 134Z" fill="${B}" stroke="${ln}" stroke-width="1.4"/><path d="M27 148 L46 148" stroke="${ln}" stroke-width="1.2" opacity=".5"/>${o.ankle?`<path d="M31 137.5 L45 137.5" stroke="${o.ankle}" stroke-width="2.6" stroke-linecap="round"/>`:""}</g></g>`; };
  const belt=o.beltSvg||`<circle cx="50" cy="101.5" r="7" fill="#ffd23d" stroke="${ln}" stroke-width="1.4"/>`;
  return `${o.back||""}${leg(0,0)}${leg(1,1)}<path d="M30 62 L70 62 L66 106 L34 106Z" fill="${suit}" stroke="${ln}" stroke-width="1.4" stroke-linejoin="round"/><rect x="43" y="56" width="14" height="8" rx="3" fill="${suit}" stroke="${ln}" stroke-width="1.2"/><path d="M34 64 L50 64 L50 89 L38 89Z" fill="${ch}" stroke="${ln}" stroke-width="1"/><path d="M50 64 L66 64 L62 89 L50 89Z" fill="${R(ch)}" stroke="${ln}" stroke-width="1"/><path d="M38 76 Q44 80 50 76 Q56 80 62 76" stroke="${ln}" stroke-width="1" fill="none" opacity=".35"/>${o.chestExtra||""}<g stroke="#fff" stroke-width="1" opacity=".16"><line x1="40" y1="91" x2="60" y2="91"/><line x1="39" y1="94.5" x2="61" y2="94.5"/></g><rect x="32" y="96.5" width="36" height="10" rx="2.5" fill="#2a3040" stroke="${ln}" stroke-width="1.2"/>${belt}${arm(0,0)}${arm(1,1)}${o.front||""}`;
};
const BODYOPT=[
 /* Kamen Rider 1 — đồ đen xanh, găng/giày bạc, đai Typhoon cánh quạt */
 {suit:"#0f1b15",chest:"#1c3a2a",glove:"#eef2f7",boot:"#eef2f7",ankle:"#e63946",back:`<path d="M52 60 Q84 72 91 102 Q95 120 85 134 Q88 112 76 98 Q66 84 48 70Z" fill="#e63946" stroke="#0b0d10" stroke-width="1.2"/>`,
  beltSvg:`<circle cx="50" cy="101.5" r="9" fill="#cfd6e2" stroke="#0b0d10" stroke-width="1.4"/><circle cx="50" cy="101.5" r="5.2" fill="#e63946" stroke="#0b0d10" stroke-width="1"/><g stroke="#fff" stroke-width="1.4"><line x1="50" y1="94.8" x2="50" y2="108.2"/><line x1="43.3" y1="101.5" x2="56.7" y2="101.5"/></g>`},
 /* Kuuga — đồ đỏ, giáp ngực bạc viền vàng, đai Arcle */
 {suit:"#6e1219",chest:"#dfe6f2",glove:"#ff4d4d",boot:"#ff4d4d",ankle:"#ffd23d",armBand:"#ffd23d",chestExtra:`<path d="M34 64 L66 64 L62 89 L38 89Z" fill="none" stroke="#ffd23d" stroke-width="1.8"/><circle cx="50" cy="73" r="3" fill="#ffd23d" stroke="#0b0d10" stroke-width=".8"/>`,
  beltSvg:`<circle cx="50" cy="101.5" r="9" fill="#ffd23d" stroke="#0b0d10" stroke-width="1.4"/><circle cx="50" cy="101.5" r="5.6" fill="#dfe6f2" stroke="#0b0d10" stroke-width="1"/><circle cx="50" cy="101.5" r="3" fill="#ff2d2d" stroke="#0b0d10" stroke-width=".8"/>`},
 /* Blade — đồ xanh, giáp bạc, đai Blay Buckle */
 {suit:"#0d2146",chest:"#dfe6f2",glove:"#dfe6f2",boot:"#4d8dff",ankle:"#dfe6f2",chestExtra:`<path d="M50 66 L56 76 L50 86 L44 76Z" fill="#4d8dff" stroke="#0b0d10" stroke-width=".9"/>`,
  beltSvg:`<rect x="39" y="94" width="22" height="15" rx="3" fill="#dfe6f2" stroke="#0b0d10" stroke-width="1.4"/><path d="M50 96.5 L55 101.5 L50 106.5 L45 101.5Z" fill="#ffd23d" stroke="#0b0d10" stroke-width="1"/>`},
 /* Kiva — đồ đen, giáp bạc, xích vàng quấn ngực, đai dơi */
 {suit:"#14091f",chest:"#cfd6e2",glove:"#161616",boot:"#a66bff",ankle:"#ffd23d",armBand:"#ffd23d",chestExtra:`<g stroke="#ffd23d" stroke-width="2.2" fill="none"><path d="M33 66 L66 87"/><path d="M67 66 L34 87"/></g><circle cx="50" cy="76" r="3.4" fill="#ff4d4d" stroke="#0b0d10" stroke-width=".8"/>`,
  beltSvg:`<path d="M37 98 Q44 94 50 99 Q56 94 63 98 L59 108 Q50 103 41 108Z" fill="#cfd6e2" stroke="#0b0d10" stroke-width="1.4"/><circle cx="50" cy="101.5" r="3" fill="#ffd23d" stroke="#0b0d10" stroke-width=".8"/>`},
 /* Zero-One — đồ đen, giáp vàng, đai Zero-One Driver */
 {suit:"#141000",chest:"#ffe23d",glove:"#161616",boot:"#ffe23d",ankle:"#e8edf5",armBand:"#ffe23d",chestExtra:`<g stroke="#161616" stroke-width="2"><line x1="38" y1="68" x2="46" y2="86"/><line x1="62" y1="68" x2="54" y2="86"/></g>`,
  beltSvg:`<rect x="38" y="95" width="24" height="13" rx="2.5" fill="#e8edf5" stroke="#0b0d10" stroke-width="1.4"/><rect x="41" y="98" width="18" height="7" rx="1.5" fill="#161616"/><rect x="44" y="99.6" width="12" height="3.8" fill="#ff2d2d"/>`},
 /* Gaim — đồ xanh navy, giáp cam kiểu samurai, đai Sengoku */
 {suit:"#0e1c3a",chest:"#ff9a3d",glove:"#f4e3b0",boot:"#ff9a3d",ankle:"#ffd23d",chestExtra:`<circle cx="50" cy="76" r="6" fill="#ffb347" stroke="#fff" stroke-width="1"/><g stroke="#fff" stroke-width=".8"><line x1="50" y1="70" x2="50" y2="82"/><line x1="44" y1="76" x2="56" y2="76"/></g>`,
  beltSvg:`<circle cx="50" cy="101.5" r="9" fill="#cfd6e2" stroke="#0b0d10" stroke-width="1.4"/><circle cx="50" cy="101.5" r="5.4" fill="#ff9a3d" stroke="#0b0d10" stroke-width="1"/><circle cx="50" cy="101.5" r="2" fill="#fff"/>`},
 /* Decade — đồ đen, sọc bạc, giá 9 thẻ trên vai, đai Decadriver */
 {suit:"#15151a",chest:"#24242b",glove:"#15151a",boot:"#cfd6e2",knee:"#cfd6e2",stripe:"#e8edf5",armBand:"#cfd6e2",
  front:`<rect x="19" y="57.5" width="62" height="12" rx="1.5" fill="#ff4fd8" stroke="#0b0d10" stroke-width="1.2"/><rect x="22.0" y="59.5" width="5.6" height="8" rx=".8" fill="#f4f6fb" stroke="#0b0d10" stroke-width=".5"/><rect x="23.0" y="60.8" width="3.6" height="4.4" fill="#9d7bff"/><rect x="28.4" y="59.5" width="5.6" height="8" rx=".8" fill="#f4f6fb" stroke="#0b0d10" stroke-width=".5"/><rect x="29.4" y="60.8" width="3.6" height="4.4" fill="#4d8dff"/><rect x="34.8" y="59.5" width="5.6" height="8" rx=".8" fill="#f4f6fb" stroke="#0b0d10" stroke-width=".5"/><rect x="35.8" y="60.8" width="3.6" height="4.4" fill="#ff4d4d"/><rect x="41.2" y="59.5" width="5.6" height="8" rx=".8" fill="#f4f6fb" stroke="#0b0d10" stroke-width=".5"/><rect x="42.2" y="60.8" width="3.6" height="4.4" fill="#ffd23d"/><rect x="47.6" y="59.5" width="5.6" height="8" rx=".8" fill="#f4f6fb" stroke="#0b0d10" stroke-width=".5"/><rect x="48.6" y="60.8" width="3.6" height="4.4" fill="#ff4fd8"/><rect x="54.0" y="59.5" width="5.6" height="8" rx=".8" fill="#f4f6fb" stroke="#0b0d10" stroke-width=".5"/><rect x="55.0" y="60.8" width="3.6" height="4.4" fill="#ff9a3d"/><rect x="60.4" y="59.5" width="5.6" height="8" rx=".8" fill="#f4f6fb" stroke="#0b0d10" stroke-width=".5"/><rect x="61.4" y="60.8" width="3.6" height="4.4" fill="#a66bff"/><rect x="66.8" y="59.5" width="5.6" height="8" rx=".8" fill="#f4f6fb" stroke="#0b0d10" stroke-width=".5"/><rect x="67.8" y="60.8" width="3.6" height="4.4" fill="#ffd23d"/><rect x="73.2" y="59.5" width="5.6" height="8" rx=".8" fill="#f4f6fb" stroke="#0b0d10" stroke-width=".5"/><rect x="74.2" y="60.8" width="3.6" height="4.4" fill="#ff4d6a"/>`,
  chestExtra:`<g stroke="#ff4fd8" stroke-width="1.8"><line x1="37" y1="70" x2="39" y2="92"/><line x1="63" y1="70" x2="61" y2="92"/></g>`,
  beltSvg:`<rect x="23" y="94" width="11" height="15" rx="2.5" fill="#f4f6fb" stroke="#0b0d10" stroke-width="1.3"/><rect x="68" y="95" width="6" height="15" rx="1.5" fill="#15151a" stroke="#0b0d10" stroke-width="1"/><rect x="35" y="93.5" width="30" height="15.5" rx="2.5" fill="#cfd6e2" stroke="#0b0d10" stroke-width="1.4"/><rect x="39" y="96.5" width="22" height="9.5" rx="1.5" fill="#111"/><g fill="#ff4fd8"><rect x="41" y="97.8" width="18" height="1.6"/><rect x="41" y="100.4" width="18" height="1.6"/><rect x="41" y="103" width="18" height="1.6"/></g><circle cx="37" cy="107" r="1" fill="#ff6a6a"/><circle cx="63" cy="107" r="1" fill="#6aff9a"/>`},
 /* W — nửa xanh nửa đen, đai Double Driver hai khe */
 {suit:"#0f1626",split:true,
  beltSvg:`<rect x="35" y="94" width="30" height="15" rx="3" fill="#cfd6e2" stroke="#0b0d10" stroke-width="1.4"/><rect x="38" y="97" width="11" height="9" rx="1.5" fill="#2fe0e0" stroke="#0b0d10" stroke-width=".8"/><rect x="51" y="97" width="11" height="9" rx="1.5" fill="#1c2230" stroke="#0b0d10" stroke-width=".8"/>`}
];
/* ---- biến hình riêng từng Rider: câu hô, tư thế, màu hạt, giai điệu ---- */
const HENSHIN=[
 {pose:0,say:[["変身！","ja-JP"]],cols:["#5fe08a","#ffffff","#e63946","#b9ffd0"],notes:[392,494,587,784]},
 {pose:1,say:[["変身！","ja-JP"]],cols:["#ff4d4d","#ff9a3d","#ffd23d","#ffffff"],notes:[330,415,523,659]},
 {pose:1,say:[["変身！","ja-JP"],["Turn up!","en-US"]],cols:["#4d8dff","#dfe6f2","#ffffff","#9fc4ff"],notes:[440,554,659,880]},
 {pose:0,say:[["変身！","ja-JP"],["Wake up!","en-US"]],cols:["#a66bff","#ffd23d","#1a0b33","#ffffff"],notes:[294,370,440,587]},
 {pose:2,say:[["変身！","ja-JP"],["Progrise!","en-US"]],cols:["#ffe23d","#5cff9b","#ffffff","#111111"],notes:[523,659,784,1047]},
 {pose:0,say:[["変身！","ja-JP"],["Soiya!","en-US"]],cols:["#ff9a3d","#ffb347","#5cff9b","#ffffff"],notes:[349,440,523,698]},
 {pose:1,say:[["変身！","ja-JP"],["Kamen ride. Decade!","en-US"]],cols:["#ff4fd8","#3de6ff","#ffe23d","#5cff9b","#ffffff"],notes:[392,523,659,988]},
 {pose:2,say:[["変身！","ja-JP"],["Cyclone. Joker!","en-US"]],cols:["#2fe0e0","#1c2230","#5cff9b","#ffffff"],notes:[370,466,554,740]}
];
const avatar = (i,head) => { const c=CHARS[i], h=c.svg(c.acc);
  if(head) return `<svg class="avsvg" viewBox="0 0 100 100" role="img" aria-label="${c.name}">${h}</svg>`;
  return `<svg class="avsvg" viewBox="0 0 100 156" role="img" aria-label="${c.name}">${BODY(c.acc,BODYOPT[i])}<g transform="translate(23 5) scale(.54)">${h}</g></svg>`; };
const hex2rgb = h => [1,3,5].map(k=>parseInt(h.slice(k,k+2),16)).join(",");

/* ---- chủ đề nền theo từng Rider: màu trang + cảnh nền SVG tự vẽ (không phụ thuộc ảnh ngoài) ---- */
const RNG=seed=>()=>(seed=(seed*16807)%2147483647)/2147483647;
const skyline=(seed,base,minH,maxH,fill,op=1)=>{const r=RNG(seed);let x=-20,s="";while(x<1620){const w=40+r()*70,h=minH+r()*(maxH-minH);s+=`<rect x="${x|0}" y="${(base-h)|0}" width="${w|0}" height="${(h+200)|0}" fill="${fill}" opacity="${op}"/>`;if(r()<.35)s+=`<rect x="${(x+w*.4)|0}" y="${(base-h-30)|0}" width="${(w*.2)|0}" height="30" fill="${fill}" opacity="${op}"/>`;x+=w+r()*8;}return s;};
const ridge=(seed,base,amp,fill,op=1)=>{const r=RNG(seed);let d=`M-10 900 L-10 ${base}`;for(let x=0;x<=1620;x+=80)d+=` L${x} ${(base-r()*amp)|0}`;return `<path d="${d} L1620 900Z" fill="${fill}" opacity="${op}"/>`;};
const starsSvg=(seed,n,op=.8)=>{const r=RNG(seed);let s="";for(let i=0;i<n;i++)s+=`<circle cx="${(r()*1600)|0}" cy="${(r()*600)|0}" r="${(r()*1.6+.4).toFixed(1)}" fill="#fff" opacity="${(r()*op).toFixed(2)}"/>`;return s;};
const grad=(id,stops,x2=0,y2=1)=>`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o,c])=>`<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
const glow=(id,c,o=.8)=>`<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
const wrapSvg=(defs,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"><defs>${defs}</defs>${body}</svg>`;
const BAT="M0 0 Q-14 -10 -26 0 Q-16 -2 -12 6 Q-6 0 0 6 Q6 0 12 6 Q16 -2 26 0 Q14 -10 0 0Z";

const SCENES = [
 /* 0 · Kamen Rider 1 — thành phố đêm xanh lục dưới trăng */
 ()=>wrapSvg(grad("g",[[0,"#06231b"],[.6,"#14654a"],[1,"#46c98c"]])+glow("m","#eafff2"),
   `<rect width="1600" height="900" fill="url(#g)"/>${starsSvg(3,120)}<circle cx="1230" cy="210" r="250" fill="url(#m)"/><circle cx="1230" cy="210" r="80" fill="#f4fff8"/>${skyline(7,820,140,330,"#0f5a42",.75)}${skyline(11,900,120,260,"#08302a")}`),
 /* 1 · Kuuga — hoàng hôn đỏ trên núi */
 ()=>wrapSvg(grad("g",[[0,"#2a0b16"],[.55,"#a3302b"],[1,"#ff9a52"]])+glow("s","#ffd9a0",.9),
   `<rect width="1600" height="900" fill="url(#g)"/><circle cx="800" cy="640" r="380" fill="url(#s)"/><circle cx="800" cy="640" r="150" fill="#ffe4b5"/>${ridge(5,690,230,"#8a2229",.9)}${ridge(9,780,200,"#5c1620")}${ridge(13,860,140,"#33101a")}`),
 /* 2 · Blade — bầu trời xanh và bộ bài */
 ()=>{const r=RNG(21);let cards="";for(let i=0;i<30;i++){const x=(r()*1600)|0,y=(r()*900)|0,fs=(60+r()*130)|0,rot=((r()*70)-35)|0;cards+=`<text x="${x}" y="${y}" font-size="${fs}" fill="#fff" opacity="${(.05+r()*.11).toFixed(2)}" transform="rotate(${rot} ${x} ${y})" font-family="serif">${"♠♥♦♣"[i%4]}</text>`;}
   for(let i=0;i<7;i++){const x=(r()*1500)|0,y=(r()*800)|0,rot=((r()*60)-30)|0;cards+=`<rect x="${x}" y="${y}" width="120" height="180" rx="12" fill="none" stroke="#bcd4ff" stroke-width="3" opacity=".22" transform="rotate(${rot} ${x+60} ${y+90})"/>`;}
   return wrapSvg(grad("g",[[0,"#071a3a"],[1,"#2a63d0"]])+glow("m","#9fc4ff",.5),`<rect width="1600" height="900" fill="url(#g)"/><circle cx="1300" cy="180" r="300" fill="url(#m)"/>${cards}`);},
 /* 3 · Kiva — lâu đài dưới trăng tím, dơi bay */
 ()=>{const r=RNG(33);let bats="";for(let i=0;i<9;i++){const x=(200+r()*1200)|0,y=(80+r()*350)|0,s=(.7+r()*1.1).toFixed(2);bats+=`<path d="${BAT}" transform="translate(${x} ${y}) scale(${s})" fill="#0e0522" opacity=".85"/>`;}
   const castle=`<g fill="#10052a"><rect x="1040" y="560" width="420" height="340"/><rect x="1010" y="470" width="80" height="430"/><polygon points="1000,470 1050,360 1100,470"/><rect x="1230" y="430" width="90" height="470"/><polygon points="1220,430 1275,310 1330,430"/><rect x="1400" y="500" width="70" height="400"/><polygon points="1392,500 1435,400 1478,500"/><rect x="1120" y="520" width="50" height="60"/></g><g fill="#f5d76e" opacity=".75"><rect x="1035" y="520" width="12" height="22"/><rect x="1265" y="500" width="12" height="24"/><rect x="1430" y="560" width="10" height="20"/></g>`;
   return wrapSvg(grad("g",[[0,"#14082e"],[.7,"#4a2390"],[1,"#8b52d6"]])+glow("m","#f0e6ff",.7),`<rect width="1600" height="900" fill="url(#g)"/>${starsSvg(8,90)}<circle cx="380" cy="230" r="280" fill="url(#m)"/><circle cx="380" cy="230" r="110" fill="#f4ecff"/>${ridge(41,800,120,"#2b1160",.9)}${castle}${bats}`);},
 /* 4 · Zero-One — lưới số và mạch điện vàng */
 ()=>{const r=RNG(55);let grid="";for(let i=-8;i<=16;i++)grid+=`<line x1="800" y1="520" x2="${i*200}" y2="900" stroke="#ffe23d" stroke-width="2" opacity=".28"/>`;
   for(let k=1;k<=7;k++)grid+=`<line x1="0" y1="${(520+k*k*7.8)|0}" x2="1600" y2="${(520+k*k*7.8)|0}" stroke="#ffe23d" stroke-width="2" opacity=".28"/>`;
   let circ="";for(let i=0;i<16;i++){let x=(r()*1600)|0,y=(r()*440)|0,d=`M${x} ${y}`;for(let j=0;j<4;j++){if(j%2)y+=((r()*120)-40)|0;else x+=((r()*260)-80)|0;d+=` L${x} ${y}`;}circ+=`<path d="${d}" fill="none" stroke="#ffe23d" stroke-width="3" opacity=".35"/><circle cx="${x}" cy="${y}" r="7" fill="#ffe23d" opacity=".7"/>`;}
   return wrapSvg(grad("g",[[0,"#241d00"],[.6,"#5b4a00"],[1,"#a68a00"]])+glow("m","#fff2a0",.6),`<rect width="1600" height="900" fill="url(#g)"/><circle cx="800" cy="520" r="420" fill="url(#m)"/><circle cx="800" cy="300" r="190" fill="none" stroke="#ffe23d" stroke-width="3" opacity=".3"/><circle cx="800" cy="300" r="140" fill="none" stroke="#ffe23d" stroke-width="2" opacity=".2" stroke-dasharray="10 14"/>${circ}${grid}`);},
 /* 5 · Gaim — rừng, trời cam và những lát cam khổng lồ */
 ()=>{const r=RNG(77);const slice=(cx,cy,R,o)=>{let seg="";for(let i=0;i<8;i++){const a=i*Math.PI/4;seg+=`<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*R*.92)|0}" y2="${(cy+Math.sin(a)*R*.92)|0}" stroke="#fff" stroke-width="4" opacity=".7"/>`;}return `<g opacity="${o}"><circle cx="${cx}" cy="${cy}" r="${R}" fill="#ff9f3d"/><circle cx="${cx}" cy="${cy}" r="${R*.92}" fill="#ffc06a"/>${seg}</g>`;};
   let leaves="";for(let i=0;i<14;i++){const x=(r()*1600)|0,y=(r()*700)|0,rot=(r()*180)|0;leaves+=`<ellipse cx="${x}" cy="${y}" rx="${(30+r()*40)|0}" ry="${(10+r()*14)|0}" fill="#5cff9b" opacity=".18" transform="rotate(${rot} ${x} ${y})"/>`;}
   return wrapSvg(grad("g",[[0,"#0b3d43"],[.6,"#1b8a6b"],[1,"#ff9a3d"]]),`<rect width="1600" height="900" fill="url(#g)"/>${slice(1250,230,190,.5)}${slice(260,330,120,.4)}${slice(760,120,80,.35)}${leaves}${ridge(21,760,170,"#0d5a3a",.95)}${ridge(23,840,130,"#083626")}`);},
 /* 6 · Decade — dải màu chiều không gian và mã vạch */
 ()=>{const cols=["#ff4fd8","#3de6ff","#ffe23d","#5cff9b","#ff8a3d","#9d7bff"];let bands="";cols.forEach((c,i)=>{bands+=`<rect x="${-200+i*300}" y="-400" width="150" height="1800" fill="${c}" opacity=".17" transform="rotate(-28 800 450)"/>`;});
   const r=RNG(88);let bar="";let x=1230;while(x<1560){const w=3+r()*12;bar+=`<rect x="${x|0}" y="140" width="${w|0}" height="${(360+r()*200)|0}" fill="#fff" opacity=".22"/>`;x+=w+4+r()*8;}
   return wrapSvg(grad("g",[[0,"#2b0b3d"],[1,"#a2278f"]])+glow("m","#ff9df0",.5),`<rect width="1600" height="900" fill="url(#g)"/><circle cx="500" cy="450" r="420" fill="url(#m)"/>${bands}${bar}<circle cx="500" cy="450" r="230" fill="none" stroke="#fff" stroke-width="3" opacity=".25"/><path d="M270 220 L730 680 M730 220 L270 680" stroke="#fff" stroke-width="3" opacity=".2"/>`);},
 /* 7 · W — thành phố gió, nửa xanh ngọc nửa xanh đêm */
 ()=>{const tower=(cx,c)=>`<g fill="${c}"><rect x="${cx-34}" y="330" width="68" height="570"/><polygon points="${cx-44},330 ${cx},220 ${cx+44},330"/></g><g transform="translate(${cx} 250)" fill="#fff" opacity=".55"><ellipse cx="0" cy="-60" rx="12" ry="70"/><ellipse cx="52" cy="30" rx="12" ry="70" transform="rotate(-120 0 0)"/><ellipse cx="-52" cy="30" rx="12" ry="70" transform="rotate(120 0 0)"/></g>`;
   let wind="";const r=RNG(99);for(let i=0;i<12;i++){const y=(80+r()*560)|0,x=(r()*1300)|0;wind+=`<path d="M${x} ${y} q120 -60 240 0 t240 0" fill="none" stroke="#fff" stroke-width="3" opacity=".14"/>`;}
   return wrapSvg(grad("l",[[0,"#0c3a44"],[1,"#2bc7c7"]])+grad("rr",[[0,"#0c1226"],[1,"#2a3a78"]]),`<rect width="800" height="900" fill="url(#l)"/><rect x="800" width="800" height="900" fill="url(#rr)"/>${starsSvg(5,50,.5)}${wind}${skyline(61,860,90,220,"#0a2c36",.6)}${tower(560,"#0a2a33")}${tower(1040,"#0a1024")}<rect x="798" width="4" height="900" fill="#fff" opacity=".35"/>`);}
];
const sceneURI = i => "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(SCENES[i%SCENES.length]());
const THEMES = [
 {bg:"#0a2019",bg2:"#123326",line:"#2a5a46",mut:"#a3c9b7"},
 {bg:"#2a0e14",bg2:"#40141b",line:"#6d3038",mut:"#dbaaae"},
 {bg:"#0a1a38",bg2:"#112c5e",line:"#2a4a86",mut:"#a3bce8"},
 {bg:"#1a0c33",bg2:"#2b1552",line:"#4d3380",mut:"#c4b3ea"},
 {bg:"#221c00",bg2:"#372c00",line:"#665500",mut:"#dccf8e"},
 {bg:"#0e2f2c",bg2:"#164a40",line:"#2e7060",mut:"#bcd9cf"},
 {bg:"#2a0d38",bg2:"#431556",line:"#73308a",mut:"#e3b4ea"},
 {bg:"#0b2530",bg2:"#123847",line:"#2a6d80",mut:"#a6d6df"}
];
const sceneBox=document.createElement("div"); sceneBox.id="scene"; sceneBox.setAttribute("aria-hidden","true");
sceneBox.innerHTML='<div class="sc on"></div><div class="sc"></div>'; document.body.prepend(sceneBox);
let sceneIdx=-1, sceneCache={};
function applyTheme(i){
  const t=THEMES[i%THEMES.length], root=document.documentElement;
  root.style.setProperty("--bg",t.bg); root.style.setProperty("--bg2",t.bg2); root.style.setProperty("--line",t.line); root.style.setProperty("--mut",t.mut);
  root.style.setProperty("--bg-rgb",hex2rgb(t.bg)); root.style.setProperty("--bg2-rgb",hex2rgb(t.bg2));
  if(i===sceneIdx) return; sceneIdx=i;
  const [a,b]=sceneBox.children, next=a.classList.contains("on")?b:a, prev=next===a?b:a;
  sceneCache[i]=sceneCache[i]||sceneURI(i);
  next.style.backgroundImage=`url("${sceneCache[i]}")`;
  next.classList.add("on"); prev.classList.remove("on");
}
addEventListener("scroll",()=>{ sceneBox.style.transform=`translateY(${-Math.min(50,scrollY*.03)}px)`; },{passive:true});

/* pupils theo con trỏ */
let mouse = {x:innerWidth/2,y:innerHeight/2}, pq = false;
addEventListener("pointermove",e=>{
  mouse.x=e.clientX; mouse.y=e.clientY;
  if(!pq){ pq=true; requestAnimationFrame(()=>{
    pq=false;
    document.querySelectorAll(".avsvg").forEach(svg=>{
      const r=svg.getBoundingClientRect(); if(!r.width) return;
      const a=Math.atan2(mouse.y-(r.top+r.height/2), mouse.x-(r.left+r.width/2));
      svg.querySelectorAll(".pupil").forEach(p=>p.style.transform=`translate(${Math.cos(a)*3.4}px,${Math.sin(a)*3.4}px)`);
    });
  }); }
},{passive:true});

