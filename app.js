/* Trainingsapp Lorenzo & Nele – v3 */
(function(){
"use strict";
// ================= CONFIG =================
const API_URL="https://script.google.com/macros/s/AKfycbwtPBd75X4si1JDTjtXuhRANLHtLvVxINloLdSGSoeFHkKMTGpovHkSwOjtiwKZRp3q/exec";
const NAMES={lor:"Lorenzo",nel:"Nele"};
const DN=["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag","Zondag"];
const MN=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
const MNF=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const KIND={upper:{l:"Upper",c:"var(--kracht)"},lower:{l:"Lower",c:"var(--grass)"},run:{l:"Run",c:"var(--run)"},rust:{l:"Rust",c:"var(--rust)"},race:{l:"Race",c:"var(--race)"},event:{l:"Event",c:"var(--kino)"}};
const RT={interval:"Interval",long:"Long run",tempo:"Tempo run",z2:"Zone 2 run",walk:"Helling wandelen"};
const RT_SHORT={interval:"Interval",long:"Long",tempo:"Tempo",z2:"Zone 2",walk:"Helling"};
const ZONES=["","Z1","Z2","Z3","Z4","Z5"];
const GROUPS={upper:["Borst","Rug","Schouders","Biceps","Triceps","Core"],lower:["Quadriceps","Hamstrings","Bilspieren","Adductoren","Kuiten","Core"]};
const QUICK=["Goed gedaan! 💪","Trots op jou ❤️","Beest! 🔥","Sterk volgehouden 👏"];
const MAXPH=4;
const EX={};OEFENINGEN.forEach(e=>{EX[e.id]=e});

// ================= HELPERS =================
const $=id=>document.getElementById(id);
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function pd(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function fd(d){return d.getDate()+" "+MN[d.getMonth()]}
function dayName(d){return DN[(d.getDay()+6)%7]}
function monday(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x}
function todayD(){const t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())}
function nfmt(n,dec=1){n=Number(n)||0;const k=Math.pow(10,dec);return (Math.round(n*k)/k).toString().replace(".",",")}
function num(v){if(v===""||v==null)return null;const n=Number(String(v).replace(",","."));return isNaN(n)?null:n}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function ago(ts){const m=Math.round((Date.now()-ts)/60000);if(m<1)return"net nu";if(m<60)return m+" min geleden";const h=Math.round(m/60);if(h<24)return h+" u geleden";return fd(new Date(ts))}
function imgSrc(id,f=0){const e=EX[id];return e?`https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@${OEF_IMG_COMMIT}/exercises/${e.src}/${f}.jpg`:""}
function imgAlt(id,f=0){const e=EX[id];return e?`https://raw.githubusercontent.com/yuhonas/free-exercise-db/${OEF_IMG_COMMIT}/exercises/${e.src}/${f}.jpg`:""}
// Valt de CDN weg, dan de foto rechtstreeks van GitHub laden
document.addEventListener("error",e=>{const im=e.target;if(im.tagName!=="IMG"||!im.dataset.ex||im.dataset.fb)return;im.dataset.fb="1";im.src=imgAlt(im.dataset.ex,+(im.dataset.fr||0))},true);
// Bewegende oefening: start- en eindpositie wisselen elkaar af (zoals een gif)
function exAnim(id,cls=""){const m=EX[id]||{n:id};return `<span class="anim ${cls}" data-info="${id}" role="img" aria-label="${esc(m.n)}: uitvoering"><img src="${imgSrc(id,0)}" data-ex="${id}" data-fr="0" alt="" loading="lazy"><img class="f1" src="${imgSrc(id,1)}" data-ex="${id}" data-fr="1" alt="" loading="lazy"></span>`}
function openExInfo(id){const m=EX[id];if(!m)return;
  $("xTitle").textContent=m.n;$("xSub").textContent=m.g+" · "+(m.seg==="core"?"Core":KIND[m.seg].l);
  $("xAnim").innerHTML=exAnim(id,"big");
  $("xSteps").innerHTML=(m.i||[]).map(t=>`<li>${esc(t)}</li>`).join("");
  $("xVideo").href="https://www.youtube.com/results?search_query="+encodeURIComponent(m.n+" exercise proper form");
  openSheet("xSheet")}
const T0=todayD(),TODAY=iso(T0);

// ================= VASTE PLANNING: KNOKKE =================
const K_START=new Date(2026,8,28);
const K_MACRO=[[12,8,"Opbouw","Basistolerantie opbouwen in het zand."],[15,9,"Opbouw","Aerobe drempel verleggen."],[18,10,"Opbouw","Pezen en gewrichten harden voor duur-impact."],[12,8,"Deload","Zenuwstelsel flushen. Minder volume."],[20,11,"Opbouw","De muur verleggen. Test hydratatie en sportvoeding."],[22,12,"Piekbelasting","Mechanische grenzen opzoeken."],[14,8,"Tapering","Volume dropt, benen laten genezen."],[25,5,"Race","Uitbetaling van de discipline."]];
const BUILTIN_GOALS=[{id:"knokke",title:"BESOX Trail Knokke 25 km",date:"2026-11-22",note:"8 weken opbouw · 3× kracht, 3× lopen, 1× rust",builtin:true}];
function knokkeDay(ds){
  const n=Math.round((pd(ds)-K_START)/864e5);if(n<0||n>55)return[];
  const w=Math.floor(n/7),i=n%7,[lsd,tempo]=K_MACRO[w];const P=(kind,title,detail,km,rt)=>({id:"k"+ds+i,date:ds,kind,title,detail,km,rt,goalId:"knokke",builtin:true});
  const out=[
    ()=>P("upper","Upper 1","Borst, rug, schouders & core. Geen spierfalen.",null),
    ()=>P("run","Interval","VO2 max op asfalt. 15 min opwarmen · 6× 800 m Z4 · 90 sec wandelen · 15 min cooldown",4.8,"interval"),
    ()=>P("lower","Lower","Squats, extensions, calf raises. Max 3 sets, max 80% 1RM. Trillen de benen? Schrappen.",null),
    ()=>w===7?P("run","Shakeout","Rustige shakeout, losse benen.",5,"z2"):P("run","Tempo run",`2 km Z2 · ${tempo-4} km Z3 · 2 km Z2`,tempo,"tempo"),
    ()=>P("upper","Upper 2","Isolatie armen, zware focus buikspieren voor mul zand.",null),
    ()=>P("rust","Absolute rust","Geen actieve recuperatie. Water, elektrolyten, koolhydraten.",null),
    ()=>w===7?P("race","BESOX Trail Knokke","Racedag. Uitbetaling van de discipline.",25,"long"):P("run","LSD trail","Onverhard, 100% Z2. Hartslag te hoog in zand: wandelen.",lsd,"long")
  ][i]();
  const res=[out];
  if(ds==="2026-11-20")res.push({id:"kino",date:ds,kind:"event",title:"Etentje Kino Gent",detail:"Beloning voor al ons harde werk",builtin:true,goalId:"knokke"});
  return res;
}
function knokkePhase(ds){const n=Math.round((pd(ds)-K_START)/864e5);if(n<0||n>55)return null;const w=Math.floor(n/7);return`Knokke · week ${w+1} · ${K_MACRO[w][2]} — ${K_MACRO[w][3]}`}

// ================= STATE =================
let who=null,pin=null,lastSeen=0;
try{who=localStorage.getItem("knokke-who");pin=localStorage.getItem("knokke-pin");lastSeen=Number(localStorage.getItem("knokke-seen-"+who))||0}catch(e){}
let W=[],C=[],G=[],P=[],TP=[];  // workouts, comments, goals, plan, opgeslagen workouts
let byId={};
let selDate=TODAY, viewMonth=new Date(T0.getFullYear(),T0.getMonth(),1);
const photoCache={};

function allGoals(){return BUILTIN_GOALS.concat(G).sort((a,b)=>a.date.localeCompare(b.date))}
function planOn(ds){return knokkeDay(ds).concat(P.filter(p=>p.date===ds))}
function workoutsOn(ds,p){return W.filter(w=>w.date===ds&&(!p||w.person===p)).sort((a,b)=>a.updatedAt-b.updatedAt)}
function commentsOf(id){return C.filter(c=>c.logId===id).sort((a,b)=>a.createdAt-b.createdAt)}
function planDone(item,p){const k=item.kind==="race"?"run":item.kind;if(!["upper","lower","run"].includes(k))return null;return W.some(w=>w.date===item.date&&w.person===p&&w.kind===k)}
function goalOn(ds){return allGoals().filter(g=>g.date===ds)}

// ================= WORKOUT HELPERS =================
function runKm(d){if(!d)return 0;
  if(d.rt==="interval"){let k=(num(d.wu)||0)+(num(d.cd)||0);(d.blocks||[]).forEach(b=>{if(b.mode!=="time")k+=(num(b.reps)||0)*(num(b.dist)||0)/1000});return k}
  if(d.rt==="tempo")return (num(d.wu)||0)+(num(d.tdist)||0)+(num(d.cd)||0);
  const dist=num(d.dist);if(dist)return dist;
  if(num(d.speed)&&num(d.min))return num(d.speed)*num(d.min)/60; // loopband: snelheid × tijd
  return 0}
function isTM(d){return d&&(d.env==="tm")}
function woTitle(w){const d=w.data||{};const base=w.kind==="run"?((RT[d.rt]||"Run")+(isTM(d)&&d.rt!=="walk"?" · loopband":"")):KIND[w.kind].l;const tn=w.data&&w.data.tplName;return tn?`${base} · ${tn}`:base}
function woSummary(w){const d=w.data||{};
  if(w.kind==="run"){const k=d.km!=null?d.km:runKm(d);const bits=[];if(k)bits.push(nfmt(k)+" km");
    if(d.rt==="interval"&&d.blocks&&d.blocks.length)bits.push(d.blocks.map(b=>`${b.reps||"?"}×${b.mode==="time"?(b.time||"?")+" min":(b.dist||"?")+" m"}`).join(" + "));
    if(d.rt==="tempo"&&d.tmin)bits.push(d.tmin+" min tempo"+(d.zone?" "+d.zone:""));
    if(d.rt==="long"&&d.zone)bits.push(d.zone);
    if((d.rt==="walk"||isTM(d))&&d.incline)bits.push(nfmt(d.incline)+"% helling");
    if((d.rt==="walk"||isTM(d))&&d.speed)bits.push(nfmt(d.speed)+" km/u");
    if(d.rt==="walk"&&d.min)bits.push(d.min+" min");
    return bits.join(" · ")||"Geen details"}
  const ex=d.ex||[];const sets=ex.reduce((a,e)=>a+(e.sets||[]).length,0);
  if(!ex.length)return"Geen oefeningen";
  return `${ex.length} oefening${ex.length>1?"en":""} · ${sets} sets · `+ex.slice(0,3).map(e=>EX[e.id]?EX[e.id].n:e.id).join(", ")+(ex.length>3?"…":"")}
function setsTxt(sets){return (sets||[]).map(s=>`${s.r!=null&&s.r!==""?s.r:"?"}×${s.kg!=null&&s.kg!==""?nfmt(s.kg,2)+" kg":"lg"}`).join(" · ")}
function lastFor(exId,p,beforeDate,excludeId){
  let best=null;
  W.forEach(w=>{if(w.person!==p||w.id===excludeId||(w.kind!=="upper"&&w.kind!=="lower"))return;if(w.date>beforeDate)return;
    const e=(w.data&&w.data.ex||[]).find(x=>x.id===exId);if(!e||!e.sets||!e.sets.length)return;
    if(!best||w.date>best.w.date||(w.date===best.w.date&&w.updatedAt>best.w.updatedAt))best={w,e}});
  return best}

// ================= HERO / WHO =================
function renderHero(){
  const next=allGoals().find(g=>g.date>=TODAY);
  if(next){const d=pd(next.date),left=Math.round((d-T0)/864e5);
    $("evDays").textContent=left===0?"GO":left;
    $("evUnit").textContent=left===0?"vandaag!":(left===1?"dag":"dagen");
    $("evTitle").textContent=next.title;
    $("evDate").textContent=`${dayName(d)} ${fd(d)} ${d.getFullYear()}`;
  }else{$("evDays").textContent="–";$("evUnit").textContent="";$("evTitle").textContent="Nog geen event gepland";$("evDate").textContent="Tik hier om een doel toe te voegen"}
}
$("eventCard").addEventListener("click",()=>{const el=$("goals-h");if(el)el.scrollIntoView({behavior:"smooth",block:"start"})});
function renderWho(){document.querySelectorAll(".who button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.who===who)));
  const need=!who;document.querySelector(".who").classList.toggle("need",need);$("whoLabel").classList.toggle("need",need);
  $("whoLabel").textContent=need?"Tik eerst op je naam om te kunnen loggen":"Ingelogd als "+NAMES[who]+" op dit toestel"}
document.querySelectorAll(".who button").forEach(b=>b.addEventListener("click",()=>{who=b.dataset.who;try{localStorage.setItem("knokke-who",who);lastSeen=Number(localStorage.getItem("knokke-seen-"+who))||0}catch(e){}renderWho();render();idleStatus()}));

// ================= CALENDAR =================
function renderCal(){
  const y=viewMonth.getFullYear(),m=viewMonth.getMonth();
  $("mLabel").textContent=MNF[m]+" "+y;
  const start=monday(new Date(y,m,1));const grid=$("calGrid");grid.innerHTML="";
  const selWeek=iso(monday(pd(selDate)));
  for(let k=0;k<42;k++){
    const d=addDays(start,k);if(k>=35&&d.getMonth()!==m)break;
    const ds=iso(d);const pl=planOn(ds);const gl=goalOn(ds);
    const b=document.createElement("button");
    b.className="cd"+(d.getMonth()!==m?" out":"")+(ds===TODAY?" today":"")+(ds===selDate?" sel":"")+(gl.length?" goal":"");
    const lw=workoutsOn(ds,"lor").length,nw=workoutsOn(ds,"nel").length;
    b.setAttribute("aria-label",`${dayName(d)} ${fd(d)}${pl.length?", gepland: "+pl.map(p=>p.title).join(", "):""}${lw?", Lorenzo trainde":""}${nw?", Nele trainde":""}`);
    b.innerHTML=`<span class="dn">${d.getDate()}</span>${gl.length?'<span class="flag">⚑</span>':""}<span class="pl">${pl.map(p=>`<i style="background:${KIND[p.kind].c}"></i>`).join("")}</span><span class="who2"><span class="${lw?"lor":""}"></span><span class="${nw?"nel":""}"></span></span>`;
    b.addEventListener("click",()=>{selDate=ds;if(d.getMonth()!==m)viewMonth=new Date(d.getFullYear(),d.getMonth(),1);render();setTimeout(()=>{const el=document.querySelector(`[data-day="${ds}"]`);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})},30)});
    grid.appendChild(b);
  }
}
$("mPrev").addEventListener("click",()=>{viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()-1,1);renderCal()});
$("mNext").addEventListener("click",()=>{viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()+1,1);renderCal()});
$("mToday").addEventListener("click",()=>{selDate=TODAY;viewMonth=new Date(T0.getFullYear(),T0.getMonth(),1);render()});

// ================= WEEK =================
function weekStats(mon,p){let planned=0,done=0,km=0,sessions=0;
  for(let i=0;i<7;i++){const ds=iso(addDays(mon,i));
    planOn(ds).forEach(it=>{const r=planDone(it,p);if(r===null)return;planned++;if(r)done++});
    workoutsOn(ds,p).forEach(w=>{sessions++;if(w.kind==="run")km+=(w.data&&w.data.km!=null)?Number(w.data.km):runKm(w.data)})}
  return{planned,done,km,sessions}}
function renderWeek(){
  const mon=monday(pd(selDate));
  const sum=$("summary");sum.innerHTML="";
  ["lor","nel"].forEach(p=>{const s=weekStats(mon,p);const pct=s.planned?Math.round(s.done/s.planned*100):0;
    const el=document.createElement("div");el.className="pcard "+p;
    el.innerHTML=`<h3>${NAMES[p]}</h3><div class="row"><div><span class="big">${s.sessions}</span><br>trainingen deze week</div><div><span class="big">${nfmt(s.km)}</span><br>km gelopen</div>${s.planned?`<div><span class="big">${s.done}/${s.planned}</span><br>van de planning</div>`:""}</div>${s.planned?`<div class="bar"><i style="width:${pct}%"></i></div>`:""}`;
    sum.appendChild(el)});
  $("week-h").textContent=`Week van ${fd(mon)}`;
  $("week-sub").textContent=`${fd(mon)} – ${fd(addDays(mon,6))} ${addDays(mon,6).getFullYear()}`;
  const ph=knokkePhase(iso(mon))||knokkePhase(iso(addDays(mon,6)));
  $("phase").hidden=!ph;if(ph)$("phase").textContent=ph;
  const days=$("days");days.innerHTML="";
  for(let i=0;i<7;i++){
    const d=addDays(mon,i),ds=iso(d);const pl=planOn(ds);const gl=goalOn(ds);const ws=workoutsOn(ds);
    const el=document.createElement("div");el.dataset.day=ds;
    el.className="day"+(ds===TODAY?" today":"")+(gl.length?" raceday":"");
    let h=`<div class="dname"><b>${d.getDate()} ${MN[d.getMonth()]}</b><span>${DN[i]}</span>${ds===TODAY?"<em>vandaag</em>":""}</div><div class="sessions">`;
    gl.forEach(g=>{h+=`<div class="event" style="background:var(--race)"><b>⚑ ${esc(g.title)}</b><span>${esc(g.note||"Doeldag")}</span></div>`});
    pl.forEach(it=>{
      if(it.kind==="event"){h+=`<div class="event"><b>${esc(it.title)}</b><span>${esc(it.detail)}</span></div>`;return}
      h+=`<div class="plan" style="border-left-color:${KIND[it.kind].c}">${it.builtin?"":`<button class="del" data-delplan="${esc(it.id)}" aria-label="Geplande sessie verwijderen" title="Verwijderen">×</button>`}
        <div class="src">${it.builtin?"Knokke-schema":"Gepland"} · ${KIND[it.kind].l}</div>
        <div class="t"><strong>${esc(it.title)}</strong>${it.km?`<span class="km">${it.rt==="interval"?"6×800 m":nfmt(it.km)+" km"}</span>`:""}</div>
        ${it.detail?`<div class="d">${esc(it.detail)}</div>`:""}`;
      if(it.kind!=="rust"){h+=`<div class="done">`;["lor","nel"].forEach(p=>{const ok=planDone(it,p);const mine=p===who;
        h+=`<button class="tick ${p} ${ok?"ok":""}" ${mine&&!ok?`data-fromplan="${esc(it.id)}"`:"disabled"}>${ok?"✓ ":""}${NAMES[p]}${!ok&&mine?" · loggen":""}</button>`});h+=`</div>`}
      h+=`</div>`});
    if(ws.length){h+=`<div class="wlist">`;ws.forEach(w=>{const nc=commentsOf(w.id).length,np=(w.photos||[]).length;
      h+=`<button class="wo ${w.person}" data-wo="${esc(w.id)}"><span class="av" style="background:var(--${w.person})">${NAMES[w.person][0]}</span><span class="wt"><b><span class="kindtag" style="background:${KIND[w.kind].c}">${KIND[w.kind].l.toUpperCase()}</span>${esc(woTitle(w))}</b><span>${esc(woSummary(w))}</span></span><span class="bd">${w.feel?"★"+w.feel:""}${np?" 📷"+np:""}${nc?" 💬"+nc:""}</span></button>`});h+=`</div>`}
    if(!pl.length&&!ws.length&&!gl.length)h+=`<p class="dayempty">Niets gepland.</p>`;
    if(who)h+=`<button class="addbtn" data-add="${ds}">+ Training loggen</button>`;
    h+=`</div>`;el.innerHTML=h;days.appendChild(el);
  }
  days.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>openEditor({date:b.dataset.add})));
  days.querySelectorAll("[data-fromplan]").forEach(b=>b.addEventListener("click",()=>{const it=findPlan(b.dataset.fromplan);if(it){const txt=(it.title||"")+" "+(it.detail||"");openEditor({date:it.date,kind:it.kind==="race"?"run":it.kind,rt:it.rt||guessRt(txt),env:/loopband|treadmill/i.test(txt)?"tm":undefined,planKm:it.km})}}));
  days.querySelectorAll("[data-wo]").forEach(b=>b.addEventListener("click",()=>{const w=byId[b.dataset.wo];if(!w)return;if(w.person===who)openEditor({id:w.id});else openView(w.id)}));
  days.querySelectorAll("[data-delplan]").forEach(b=>b.addEventListener("click",async()=>{if(!(await ask("Deze geplande sessie van de kalender halen?",{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;await run("deletePlanItems",[[b.dataset.delplan]],"Verwijderd.")}));
}
function guessRt(t){t=(t||"").toLowerCase();
  if(/helling|incline|wandel/.test(t))return"walk";
  if(/interval|\d+\s*[×x]\s*\d+|fartlek|heuvelsprint|sprints?/.test(t))return"interval";
  if(/tempo|drempel|threshold/.test(t))return"tempo";
  if(/long|lsd|duurloop|lange|race|wedstrijd/.test(t))return"long";
  return"z2"}
function findPlan(id){const it=P.find(p=>p.id===id);if(it)return it;const m=id.match(/^k(\d{4}-\d{2}-\d{2})/);if(m)return knokkeDay(m[1]).find(p=>p.id===id);return null}
$("prev").addEventListener("click",()=>{selDate=iso(addDays(pd(selDate),-7));syncMonth();render()});
$("next").addEventListener("click",()=>{selDate=iso(addDays(pd(selDate),7));syncMonth();render()});
function syncMonth(){const d=pd(selDate);viewMonth=new Date(d.getFullYear(),d.getMonth(),1)}

// ================= GOALS =================
function renderGoals(){
  const box=$("goals");const gs=allGoals();const next=gs.find(g=>g.date>=TODAY);
  if(!gs.length){box.innerHTML=`<p class="dayempty">Nog geen doelen.</p>`;return}
  box.innerHTML=gs.map(g=>{const d=pd(g.date);const left=Math.round((d-T0)/864e5);const n=P.filter(p=>p.goalId===g.id).length+(g.builtin?48:0);
    return `<div class="goal ${left<0?"past":""} ${next&&next.id===g.id?"next":""}"><div class="gd"><b>${left<0?"✓":left}</b><span>${left<0?"voorbij":left===1?"dag":"dagen"}</span></div><div class="gt"><b>${esc(g.title)}</b><span>${dayName(d)} ${fd(d)} ${d.getFullYear()}${g.builtin?" · vast schema":""}${n?` · ${n} geplande sessies`:""}${g.note?" · "+esc(g.note):""}</span></div>${g.builtin?"":`<button class="textbtn" data-editgoal="${esc(g.id)}">Bewerken</button>`}</div>`}).join("");
  box.querySelectorAll("[data-editgoal]").forEach(b=>b.addEventListener("click",()=>openGoal(b.dataset.editgoal)));
}
let goalEdit=null;
function openGoal(id){goalEdit=id||null;const g=id?G.find(x=>x.id===id):null;
  $("gTitle").textContent=g?"Doel bewerken":"Nieuw doel";$("gName").value=g?g.title:"";$("gDate").value=g?g.date:"";$("gNote").value=g?g.note:"";
  $("gDel").style.visibility=g?"visible":"hidden";openSheet("gSheet");setTimeout(()=>$("gName").focus(),50)}
$("btnNewGoal").addEventListener("click",()=>openGoal(null));
$("gForm").addEventListener("submit",async e=>{e.preventDefault();const g={id:goalEdit,title:$("gName").value.trim(),date:$("gDate").value,note:$("gNote").value.trim(),createdBy:who||""};
  if(!g.title||!g.date)return;closeSheet("gSheet");await run("saveGoal",[g],"Doel opgeslagen.")});
$("gDel").addEventListener("click",async()=>{if(!goalEdit)return;const n=P.filter(p=>p.goalId===goalEdit).length;
  if(!(await ask(`Dit doel wissen?${n?` De ${n} geplande sessies ervan verdwijnen ook van de kalender.`:""}`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;closeSheet("gSheet");await run("deleteGoal",[goalEdit],"Doel gewist.")});

// ================= PLANNING =================
let planMode="one";
const PK=[["upper","Upper"],["lower","Lower"],["run","Run"],["rust","Rust"],["race","Race / wedstrijd"],["event","Event"]];
function openPlan(){
  const gs=allGoals().filter(g=>!g.builtin&&g.date>=TODAY);
  $("plGoal").innerHTML=`<option value="">— geen specifiek doel —</option>`+gs.map(g=>`<option value="${esc(g.id)}">${esc(g.title)} (${fd(pd(g.date))})</option>`).join("");
  if(gs.length)$("plGoal").value=gs[0].id;
  $("plKind").innerHTML=PK.map(([k,l])=>`<option value="${k}">${l}</option>`).join("");
  $("plDate").value=selDate>=TODAY?selDate:TODAY;$("plTitleIn").value="";$("plKm").value="";$("plDetail").value="";
  $("plFrom").value=iso(addDays(monday(T0),7));$("plTo").value=gs.length?gs[0].date:iso(addDays(monday(T0),7*8-1));
  const rows=$("plRows");rows.innerHTML=DN.map((d,i)=>`<div class="wkr" data-i="${i}"><b>${d.slice(0,2)}</b><select aria-label="${d} soort"><option value="">—</option>${PK.filter(p=>p[0]!=="event").map(([k,l])=>`<option value="${k}">${l}</option>`).join("")}</select><input class="wt-in" maxlength="60" placeholder="Titel / uitleg" aria-label="${d} titel"><input type="number" inputmode="decimal" step="0.1" min="0" placeholder="km" aria-label="${d} km"></div>`).join("");
  rows.querySelectorAll("select,input").forEach(x=>x.addEventListener("input",planCount));
  setPlanMode("one");openSheet("plSheet")}
function setPlanMode(m){planMode=m;document.querySelectorAll("[data-pm]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.pm===m)));$("plOne").hidden=m!=="one";$("plWeek").hidden=m!=="week";planCount()}
document.querySelectorAll("[data-pm]").forEach(b=>b.addEventListener("click",()=>setPlanMode(b.dataset.pm)));
$("plGoal").addEventListener("change",()=>{const g=G.find(x=>x.id===$("plGoal").value);if(g)$("plTo").value=g.date});
["plFrom","plTo"].forEach(id=>$(id).addEventListener("input",planCount));
function weekItems(){const from=$("plFrom").value,to=$("plTo").value;if(!from||!to||to<from)return[];
  const tpl=[...$("plRows").children].map(r=>{const [s,t,k]=r.querySelectorAll("select,input");return{kind:s.value,title:t.value.trim(),km:num(k.value)}});
  const items=[];for(let d=pd(from);iso(d)<=to;d=addDays(d,1)){const t=tpl[(d.getDay()+6)%7];if(!t.kind)continue;
    items.push({date:iso(d),kind:t.kind,title:t.title||PK.find(p=>p[0]===t.kind)[1],detail:"",km:t.km})}
  return items}
function planCount(){if(planMode!=="week")return;const n=weekItems().length;$("plCount").textContent=n?`Dit zet ${n} sessies op de kalender.`:"Kies minstens één dag en een geldige periode."}
$("btnNewPlan").addEventListener("click",()=>{if(!pin)return;openPlan()});
$("plSave").addEventListener("click",async()=>{const goalId=$("plGoal").value;let items;
  if(planMode==="one"){if(!$("plDate").value){ask("Kies eerst een datum.",{alert:true});return}const k=$("plKind").value;
    items=[{date:$("plDate").value,kind:k,title:$("plTitleIn").value.trim()||PK.find(p=>p[0]===k)[1],detail:$("plDetail").value.trim(),km:num($("plKm").value)}]}
  else{items=weekItems();if(!items.length){ask("Kies minstens één dag en een geldige periode.",{alert:true});return}if(items.length>500){ask("Maximaal 500 sessies per keer.",{alert:true});return}}
  items.forEach(i=>i.goalId=goalId);closeSheet("plSheet");await run("addPlanItems",[items],`${items.length} sessie${items.length>1?"s":""} gepland.`);
  selDate=items[0].date;syncMonth();render()});

// ================= PLAN IMPORTEREN =================
const IMP_KIND={upper:"upper",bovenlichaam:"upper",kracht:"upper","kracht upper":"upper",lower:"lower",benen:"lower","kracht lower":"lower",
  run:"run",loop:"run",lopen:"run",looptraining:"run",rust:"rust",rest:"rust",race:"race",wedstrijd:"race",event:"event",evenement:"event"};
const IMP_SAMPLE=["VOLTAGE PLAN",
"# Voorbeeld van het formaat. Lijnen met # worden genegeerd.",
"# doel;naam;datum;notitie",
"doel;Voorbeeld 10 km race;2026-10-01;Testplan – na het testen mag je dit doel wissen",
"datum;soort;titel;uitleg;km",
"2026-09-24;run;Interval;15 min opwarmen · 5× 1 km Z4 · 2 min wandelen · 10 min cooldown;8",
"2026-09-25;upper;Upper;Borst, rug, schouders. Licht houden.;",
"2026-09-26;rust;Rust;;",
"2026-09-27;run;Long run;Rustig in Z2;10",
"2026-09-28;lower;Lower licht;Activatie, geen zware sets;",
"2026-09-29;run;Tempo run loopband;2 km Z2 · 3 km Z3 · 1 km Z2;6",
"2026-09-30;rust;Rust;Benen omhoog, goed eten en drinken;",
"2026-10-01;race;Voorbeeld 10 km race;Racedag – go!;10"].join("\n");
let imp=null;
function csvSplit(line,delim){const out=[];let cur="",q=false;
  for(let i=0;i<line.length;i++){const c=line[i];
    if(q){if(c==='"'){if(line[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
    else if(c==='"')q=true;else if(c===delim){out.push(cur);cur=""}else cur+=c}
  out.push(cur);return out.map(x=>x.trim())}
// --- datums herkennen ---
const MONTHS={jan:1,januari:1,january:1,feb:2,februari:2,february:2,mrt:3,maart:3,mar:3,march:3,apr:4,april:4,mei:5,may:5,jun:6,juni:6,june:6,jul:7,juli:7,july:7,aug:8,augustus:8,august:8,sep:9,sept:9,september:9,okt:10,oktober:10,oct:10,october:10,nov:11,november:11,dec:12,december:12};
function inferYear(m,d){const y=T0.getFullYear();const c=new Date(y,m-1,d);return (T0-c)/864e5>60?y+1:y}
function mkIso(y,m,d){y=+y;m=+m;d=+d;if(m<1||m>12||d<1||d>31)return null;const t=new Date(y,m-1,d);if(t.getMonth()!==m-1)return null;return iso(t)}
function findDate(t){let m;
  if((m=t.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/)))return{iso:mkIso(m[1],m[2],m[3]),m:m[0]};
  if((m=t.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/)))return{iso:mkIso(m[3],m[2],m[1]),m:m[0]};
  if((m=t.match(/\b(\d{1,2})\s+([a-z]{3,9})\.?(?:\s+(\d{4}))?\b/i))&&MONTHS[m[2].toLowerCase()]){const mo=MONTHS[m[2].toLowerCase()];return{iso:mkIso(m[3]||inferYear(mo,+m[1]),mo,m[1]),m:m[0]}}
  if((m=t.match(/(?:^|[\s(,:·|])(\d{1,2})[\/.-](\d{1,2})(?![\d\/.,-]|\s*(?:km|m|min|sec|%|kg)\b)/i)))return{iso:mkIso(inferYear(+m[2],+m[1]),m[2],m[1]),m:m[0].replace(/^[\s(,:·|]/,"")};
  return null}
// --- weekdagen ---
const WD_IDX={maandag:1,ma:1,monday:1,mon:1,dinsdag:2,di:2,tuesday:2,tue:2,woensdag:3,wo:3,wednesday:3,wed:3,donderdag:4,do:4,thursday:4,thu:4,vrijdag:5,vr:5,friday:5,fri:5,zaterdag:6,za:6,saturday:6,sat:6,zondag:0,zo:0,sunday:0,sun:0};
const WD_FULL="maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|monday|tuesday|wednesday|thursday|friday|saturday|sunday";
function weekdayAtStart(t){const m=String(t).trim().match(new RegExp("^("+WD_FULL+"|ma|di|wo|do|vr|za|zo|mon|tue|wed|thu|fri|sat|sun)\\b\\.?","i"));return m?WD_IDX[m[1].toLowerCase()]:null}
// Meerdere trainingen op één lijn opsplitsen, bv. "maandag 26-09 upper dinsdag 27/09 lower"
const SPLIT_RE=new RegExp("\\b(?:"+WD_FULL+")\\b|\\b(?:ma|di|wo|do|vr|za|zo|mon|tue|wed|thu|fri|sat|sun)\\.?(?=\\s*\\d)|(?:^|(?<=[\\s(,:·|]))\\d{4}-\\d{1,2}-\\d{1,2}|(?:^|(?<=[\\s(,:·|]))\\d{1,2}[\\/.-]\\d{1,2}(?:[\\/.-]\\d{4})?(?![\\d\\/.,-]|\\s*(?:km|m|min|sec|%|kg)\\b)","gi");
function splitEntries(line){if(/^\s*(doel|goal|event|evenement)\b/i.test(line))return[line];
  const starts=[];let m;SPLIT_RE.lastIndex=0;let prevEnd=-1,prevWasWd=false;
  while((m=SPLIT_RE.exec(line))){const isWd=/^[a-z]/i.test(m[0]);const gap=line.slice(prevEnd,m.index);
    if(isWd||!(prevWasWd&&/^\s*$/.test(gap)))starts.push(m.index);prevEnd=m.index+m[0].length;prevWasWd=isWd;if(m[0]==="")SPLIT_RE.lastIndex++}
  if(starts.length<2)return[line];
  const out=[];if(starts[0]>0&&line.slice(0,starts[0]).trim())out.push(line.slice(0,starts[0]));
  starts.forEach((st,k)=>{const seg=line.slice(st,k+1<starts.length?starts[k+1]:undefined).trim().replace(/[,;·|\-–]+$/,"").trim();if(seg)out.push(seg)});
  return out}
function impDate(v){const f=findDate(String(v||"").trim());return f?f.iso:null}
// --- soort training herkennen ---
function kindFromText(t){t=" "+String(t||"").toLowerCase()+" ";
  if(/\b(rust|rustdag|rest|off|herstel dag)\b/.test(t))return"rust";
  if(/\b(race|racedag|wedstrijd)\b/.test(t))return"race";
  if(/\b(upper|bovenlichaam|push|pull|borst|schouders|armen|biceps|triceps)\b/.test(t))return"upper";
  if(/\b(lower|benen|legs?|squats?|lunges?|kuiten|hamstrings)\b/.test(t))return"lower";
  if(/\b(run|runs|loop|lopen|interval|intervals|tempo|long|lsd|duurloop|zone ?2|z2|jog|joggen|fartlek|shakeout|helling|wandelen|loopband|km)\b/.test(t))return"run";
  if(/\b(kracht|gym|strength|fitness)\b/.test(t))return"upper";
  if(/\b(etentje|event|feest|evenement)\b/.test(t))return"event";
  return null}
function kindOf(v,fallback){const k=IMP_KIND[String(v||"").toLowerCase().trim()];return k||kindFromText(v)||kindFromText(fallback)}
function kmFromText(t){const re=/(\d+(?:[.,]\d+)?)\s*km\b/gi;let m,best=null;
  while((m=re.exec(t))){const before=t.slice(Math.max(0,m.index-3),m.index);if(/[×x]\s*$/i.test(before))continue;best=num(m[1])}
  return best}
const WEEKDAY=/^(maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|monday|tuesday|wednesday|thursday|friday|saturday|sunday|ma|di|wo|do|vr|za|zo|mon|tue|wed|thu|fri|sat|sun)\b\.?\s*/i;
const HEAD={date:/^(datum|date|dag|day)$/i,kind:/^(soort|type|categorie|sport)$/i,title:/^(titel|training|workout|sessie|title|naam)$/i,detail:/^(uitleg|omschrijving|details?|beschrijving|notitie|inhoud|description)$/i,km:/^(km|afstand|distance|kilometers?)$/i};
// --- rijen (van eender welk formaat) omzetten naar een plan ---
function parseRows(rows){
  const res={goal:null,items:[],errors:[],warnings:[]};let map=null,lastDate=null;
  rows.forEach((row,ri)=>{const i=(row.line||ri+1)-1;
    row=row.map(c=>String(c==null?"":c).replace(/\s+/g," ").trim());while(row.length&&!row[row.length-1])row.pop();
    const join=row.filter(Boolean).join(" · ");if(!join)return;
    if(/^(#|\/\/)/.test(join)||/^voltage plan$/i.test(join))return;
    const low=row.map(c=>c.toLowerCase());
    if(low.some(c=>HEAD.date.test(c))&&low.length>1&&low.some(c=>HEAD.kind.test(c)||HEAD.title.test(c)||HEAD.km.test(c))){
      map={};low.forEach((c,ci)=>{for(const k in HEAD)if(HEAD[k].test(c)&&map[k]==null)map[k]=ci});return}
    if(/^(doel|goal|event|evenement)\b/i.test(row[0])){
      let title,date,note="";
      if(row.length>=3&&impDate(row[2])){title=row[1];date=impDate(row[2]);note=row[3]||""}
      else{const f=findDate(join);date=f&&f.iso;title=join.replace(/^(doel|goal|event|evenement)\s*[:;·\-–]?\s*/i,"").replace(f?f.m:"","").replace(/\s*[·;\-–|]\s*$/,"").replace(/\s*[·;\-–|]\s*[·;\-–|]\s*/g," · ").trim()}
      if(!title||!date){res.errors.push(`Lijn ${i+1}: event heeft een naam en een datum nodig.`);return}
      res.goal={title:title.slice(0,80),date,note:note.slice(0,500)};return}
    let date,kind,title="",detail="",km=null;
    const structured=row.length>=2&&(map||impDate(row[0]));
    if(structured){
      const col=k=>map&&map[k]!=null?row[map[k]]:null;
      date=impDate(map?col("date"):row[0]);
      const kc=map?col("kind"):row[1];
      title=(map?col("title"):row[2])||"";detail=(map?col("detail"):row[3])||"";
      const kmc=map?col("km"):row[4];km=num(kmc)!=null?num(kmc):kmFromText(kmc||"")??kmFromText(title+" "+detail);
      kind=kindOf(kc,title+" "+detail);
      if(!map&&!IMP_KIND[(kc||"").toLowerCase()]&&!title){title=kc||""}
    }else{
      let f=findDate(join);const wd=weekdayAtStart(join);
      if(!f&&wd!=null&&kindFromText(join.replace(WEEKDAY,""))){ // enkel een weekdag: eerstvolgende die dag na de vorige training
        let d=addDays(lastDate?pd(lastDate):T0,lastDate?1:0);while(d.getDay()!==wd)d=addDays(d,1);
        f={iso:iso(d),m:""};res.warnings.push(`Lijn ${i+1}: geen datum bij “${join.slice(0,30)}” – ingepland op ${dayName(d).toLowerCase()} ${fd(d)}.`)}
      if(!f){if(/\d/.test(join)&&kindFromText(join))res.errors.push(`Lijn ${i+1}: geen datum gevonden in “${join.slice(0,60)}”.`);return}
      if(f.iso&&wd!=null&&pd(f.iso).getDay()!==wd&&f.m){const d=pd(f.iso);res.warnings.push(`Lijn ${i+1}: je schreef ${Object.keys(WD_IDX).find(k=>WD_IDX[k]===wd&&k.length>3)} ${f.m}, maar ${fd(d)} ${d.getFullYear()} is een ${dayName(d).toLowerCase()}. De datum ${fd(d)} wordt gebruikt – pas aan als dat niet klopt.`)}
      date=f.iso;let rest=join.replace(f.m,"").trim().replace(/^[·;:\-–|,\s]+/,"").replace(WEEKDAY,"").replace(/^[·;:\-–|,\s]+/,"");
      rest=rest.replace(WEEKDAY,"").trim();
      const parts=rest.split(/\s*(?:·|\||;|\s[-–]\s|\t)\s*/).map(x=>x.trim()).filter(Boolean);
      kind=kindFromText(rest);km=kmFromText(rest);
      let pi=0;if(parts.length>1&&IMP_KIND[parts[0].toLowerCase()])pi=1;
      title=parts[pi]||"";detail=parts.slice(pi+1).filter(x=>!/^\d+(?:[.,]\d+)?\s*km$/i.test(x)).join(" · ");
      if(!/[×x]\s*\d+(?:[.,]\d+)?\s*km$/i.test(title))title=title.replace(/\s*\d+(?:[.,]\d+)?\s*km$/i,"").trim();
      title=title.replace(/\s+(op|on|at|om)$/i,"");if(IMP_KIND[title.toLowerCase()])title="";
      if(title)title=title[0].toUpperCase()+title.slice(1);
    }
    if(!date){res.errors.push(`Lijn ${i+1}: onbekende datum in “${join.slice(0,60)}”.`);return}
    if(!kind){if(title||detail)res.errors.push(`Lijn ${i+1}: soort training niet herkend in “${join.slice(0,60)}”. Gebruik upper, lower, run, rust, race of event.`);return}
    if(structured){const wd=weekdayAtStart(map?row[map.date]||"":row[0]);if(wd!=null&&pd(date).getDay()!==wd){const d=pd(date);res.warnings.push(`Lijn ${i+1}: weekdag en datum komen niet overeen – ${fd(d)} ${d.getFullYear()} is een ${dayName(d).toLowerCase()}. De datum wordt gebruikt.`)}}
    lastDate=date;
    res.items.push({date,kind,title:(title||KIND[kind].l).slice(0,60),detail:detail.slice(0,300),km:km==null?null:km})});
  res.items.sort((a,b)=>a.date.localeCompare(b.date));
  if(!res.goal){const r=res.items.filter(x=>x.kind==="race").pop();if(r)res.goal={title:r.title,date:r.date,note:"Geïmporteerd plan"}}
  return res}
function textToRows(text){text=String(text).replace(/^\uFEFF/,"");const lines=text.split(/\r?\n/);
  const sample=lines.find(l=>l.includes(";"))?";":lines.find(l=>l.includes("\t"))?"\t":null;
  const rows=[];
  lines.forEach((l,li)=>{let r;
    if(sample)r=[csvSplit(l,sample)];
    else if(/^\s*\d{4}-\d{1,2}-\d{1,2}\s*,/.test(l)||/^\s*(doel|datum|date)\s*,/i.test(l))r=[csvSplit(l,",")];
    else r=splitEntries(l).map(x=>[x]);
    r.forEach(x=>{x.line=li+1;rows.push(x)})});
  return rows}
function parsePlan(text){return parseRows(textToRows(text))}
// --- bibliotheken voor Excel, Word en PDF (pas geladen als je ze nodig hebt) ---
const J="https://cdn.jsdelivr.net/npm/",U="https://unpkg.com/";
const LIB={xlsx:"xlsx@0.18.5/dist/xlsx.full.min.js",mammoth:"mammoth@1.6.0/mammoth.browser.min.js",pdf:"pdfjs-dist@3.11.174/build/pdf.min.js",pdfWorker:"pdfjs-dist@3.11.174/build/pdf.worker.min.js"};
const libCache={};let pdfBase=J;
function loadOne(url){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=url;s.onload=res;s.onerror=()=>{s.remove();rej(new Error("LIB"))};document.head.appendChild(s)})}
function loadScript(path){return libCache[path]||(libCache[path]=loadOne(J+path).then(()=>J).catch(()=>loadOne(U+path).then(()=>U)).catch(e=>{delete libCache[path];throw e}))}
async function rowsFromXlsx(buf){await loadScript(LIB.xlsx);const wb=XLSX.read(buf,{type:"array",cellDates:true});let rows=[];
  wb.SheetNames.forEach(n=>{rows=rows.concat(XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:false,dateNF:"yyyy-mm-dd",defval:""}))});return rows}
async function rowsFromDocx(buf){await loadScript(LIB.mammoth);const r=await mammoth.convertToHtml({arrayBuffer:buf});
  const doc=new DOMParser().parseFromString(r.value,"text/html");const rows=[];
  doc.body.querySelectorAll("tr, p, li, h1, h2, h3, h4").forEach(el=>{if(el.closest("tr")&&el.tagName!=="TR")return;
    if(el.tagName==="TR")rows.push([...el.children].map(td=>td.textContent));else rows.push(...el.textContent.split(/\n/).map(x=>[x]))});
  return rows}
async function rowsFromPdf(buf){const base=await loadScript(LIB.pdf);pdfjsLib.GlobalWorkerOptions.workerSrc=base+LIB.pdfWorker;
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;const rows=[];
  for(let p=1;p<=pdf.numPages;p++){const tc=await (await pdf.getPage(p)).getTextContent();
    const lines=[];tc.items.forEach(it=>{if(!it.str.trim())return;const y=it.transform[5],x=it.transform[4];
      let ln=lines.find(l=>Math.abs(l.y-y)<3);if(!ln){ln={y,items:[]};lines.push(ln)}ln.items.push({x,w:it.width,s:it.str})});
    lines.sort((a,b)=>b.y-a.y).forEach(l=>{l.items.sort((a,b)=>a.x-b.x);const cells=[];let prevEnd=null;
      l.items.forEach(it=>{if(prevEnd===null||it.x-prevEnd>12)cells.push(it.s);else cells[cells.length-1]+=(it.x-prevEnd>1?" ":"")+it.s;prevEnd=it.x+it.w});
      rows.push(cells)})}
  return rows}
function openImport(){imp=null;$("impText").value="";$("impFile").value="";$("impFileName").textContent="Tik hier om een bestand te kiezen";$("impPreview").innerHTML="";$("impGo").disabled=true;openSheet("impSheet")}
$("btnImport").addEventListener("click",()=>{if(!pin)return;openImport()});
$("impFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;$("impFileName").textContent=f.name;
  const box=$("impPreview");box.innerHTML=`<p class="note-s">Bestand lezen…</p>`;$("impGo").disabled=true;
  try{const ext=(f.name.split(".").pop()||"").toLowerCase();let rows;
    if(["csv","txt","tsv","text"].includes(ext)||f.type.startsWith("text/"))rows=textToRows(await f.text());
    else if(["xlsx","xls","xlsm","ods"].includes(ext))rows=await rowsFromXlsx(await f.arrayBuffer());
    else if(ext==="docx")rows=await rowsFromDocx(await f.arrayBuffer());
    else if(ext==="pdf")rows=await rowsFromPdf(await f.arrayBuffer());
    else{imp=null;box.innerHTML=`<p class="status warn">Dit bestandstype kan de app niet lezen. Gebruik .csv, .txt, .xlsx, .docx of .pdf, of plak het plan hierboven.</p>`;return}
    imp=parseRows(rows);renderImport()}
  catch(err){imp=null;box.innerHTML=`<p class="status warn">${String(err&&err.message)==="LIB"?"Kon de lezer voor dit bestandstype niet laden. Controleer je internet en probeer opnieuw.":"Dit bestand kon niet gelezen worden. Is het een oud .doc-bestand of beveiligd? Sla het op als .docx, .xlsx of .pdf, of plak de tekst."}</p>`}});
$("impParse").addEventListener("click",()=>{const t=$("impText").value;if(!t.trim()){$("impText").focus();return}$("impFileName").textContent="Tik hier om een bestand te kiezen";$("impFile").value="";imp=parsePlan(t);renderImport()});
$("impText").addEventListener("paste",()=>setTimeout(()=>$("impParse").click(),60));
$("impSample").addEventListener("click",()=>{const blob=new Blob(["\uFEFF"+IMP_SAMPLE],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="voltage-plan-voorbeeld.csv";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)});
function renderImport(){const box=$("impPreview");if(!imp){box.innerHTML="";return}
  const it=imp.items;const cnt={};it.forEach(x=>cnt[x.kind]=(cnt[x.kind]||0)+1);
  const first=it[0],last=it[it.length-1];
  const exists=imp.goal&&G.find(g=>g.title.toLowerCase()===imp.goal.title.toLowerCase()&&g.date===imp.goal.date);
  box.innerHTML=(it.length?`<div class="imp-sum">
      ${imp.goal?`<div class="imp-goal"><span>EVENT</span><b>${esc(imp.goal.title)}</b><em>${dayName(pd(imp.goal.date))} ${fd(pd(imp.goal.date))} ${pd(imp.goal.date).getFullYear()}</em></div>`:`<p class="note-s">Geen doel gevonden. De sessies worden zonder doel op de kalender gezet.</p>`}
      <div class="kv"><div><b>${it.length}</b>sessies</div><div><b>${fd(pd(first.date))}</b>eerste dag</div><div><b>${fd(pd(last.date))}</b>laatste dag</div>${Object.entries(cnt).map(([k,n])=>`<div><b>${n}</b>${KIND[k].l.toLowerCase()}</div>`).join("")}</div>
      ${exists?`<p class="status warn" style="margin:8px 0">Dit doel bestaat al. Bij importeren wordt de oude planning ervan vervangen door deze.</p>`:""}
      <div class="imp-list">${it.slice(0,60).map(x=>`<div class="imp-row"><span class="kindtag" style="background:${KIND[x.kind].c}">${KIND[x.kind].l.toUpperCase()}</span><b>${dayName(pd(x.date)).slice(0,2)} ${fd(pd(x.date))}</b><span>${esc(x.title)}${x.km?` · ${nfmt(x.km)} km`:""}</span></div>`).join("")}${it.length>60?`<p class="note-s">… en nog ${it.length-60} sessies</p>`:""}</div></div>`
    :`<p class="status warn">Geen sessies gevonden in dit bestand.</p>`)+
    (imp.warnings&&imp.warnings.length?`<div class="imp-warn"><b>Controleer even:</b>${imp.warnings.slice(0,10).map(e=>`<div>${esc(e)}</div>`).join("")}</div>`:"")+
    (imp.errors.length?`<div class="imp-err"><b>${imp.errors.length} lijn${imp.errors.length>1?"en":""} overgeslagen:</b>${imp.errors.slice(0,8).map(e=>`<div>${esc(e)}</div>`).join("")}</div>`:"");
  $("impGo").disabled=!it.length;$("impGo").textContent=it.length?`Importeer ${it.length} sessies`:"Importeren"}
$("impGo").addEventListener("click",async()=>{if(!imp||!imp.items.length)return;
  const data=imp;closeSheet("impSheet");busy++;
  try{let goalId="";
    if(data.goal){const ex=G.find(g=>g.title.toLowerCase()===data.goal.title.toLowerCase()&&g.date===data.goal.date);
      if(ex){goalId=ex.id;const old=P.filter(p=>p.goalId===ex.id).map(p=>p.id);if(old.length){setStatus("Oude planning verwijderen…");apply(await call("deletePlanItems",old))}}
      else{setStatus("Doel aanmaken…");const r=await call("saveGoal",{title:data.goal.title,date:data.goal.date,note:data.goal.note,createdBy:who||""});goalId=r.savedId;apply(r)}}
    const items=data.items.map(x=>Object.assign({},x,{goalId}));
    for(let i=0;i<items.length;i+=400){setStatus(`Sessies op de kalender zetten… (${Math.min(i+400,items.length)}/${items.length})`);apply(await call("addPlanItems",items.slice(i,i+400)))}
    busy--;selDate=items[0].date>=TODAY?items[0].date:TODAY;syncMonth();render();setStatus(`${items.length} sessies geïmporteerd${data.goal?` voor ${data.goal.title}`:""}.`)}
  catch(e){busy--;setStatus(errText(e),true);refresh()}});

// ================= WORKOUT EDITOR =================
let ed=null; // {id,date,kind,data,feel,note,staged:[]}
function openEditor(o){
  if(!who){ask("Tik eerst bovenaan op je naam, zodat de app weet wie er traint.",{alert:true,title:"Wie ben jij?"});return}
  const w=o.id?byId[o.id]:null;
  ed={id:w?w.id:null,date:w?w.date:o.date,kind:w?w.kind:(o.kind||null),data:w?JSON.parse(JSON.stringify(w.data||{})):{},feel:w?w.feel:null,note:w?w.note:"",staged:[],tplId:null,tplMode:"none",tplName:""};
  if(w&&w.data&&w.data.tplId&&TP.some(t=>t.id===w.data.tplId&&t.person===who)){ed.tplId=w.data.tplId;ed.tplMode="keep"}
  if(!w&&ed.kind==="run"){ed.data={rt:o.rt||"z2"};if(o.env)ed.data.env=o.env}
  if(!w&&ed.kind==="run"&&o.planKm){if(ed.data.rt==="long"||ed.data.rt==="z2")ed.data.dist=o.planKm}
  if(!w&&(ed.kind==="upper"||ed.kind==="lower"))ed.data={ex:[]};
  if(ed.kind==="run"&&!ed.data.rt)ed.data.rt="z2";
  if(ed.kind==="run"&&ed.data.rt==="interval"&&!ed.data.blocks)ed.data.blocks=[newBlock()];
  $("wTitle").textContent=w?"Training bewerken":"Training loggen";
  const d=pd(ed.date);$("wSub").textContent=`${NAMES[who]} · ${dayName(d)} ${fd(d)} ${d.getFullYear()}`;
  $("fNote").value=ed.note||"";syncFeel();
  $("btnDel").style.visibility=w?"visible":"hidden";
  $("editThreadBlock").style.display=w?"block":"none";if(w)renderThread($("editThread"),w.id);
  if(w&&unread().some(c=>c.logId===w.id)){markSeen();render()}
  renderEditor();openSheet("wSheet");
}
function newBlock(){return{reps:6,mode:"dist",dist:800,time:null,pace:"",zone:"Z4",hr:null,rest:1.5}}
document.querySelectorAll(".types button").forEach(b=>b.addEventListener("click",async()=>{
  const k=b.dataset.kind;if(ed.kind===k)return;
  const hasData=(ed.data.ex&&ed.data.ex.length)||(ed.data.rt&&runKm(ed.data));
  if(hasData&&!(await ask("Wat je al invulde voor deze training gaat verloren.",{title:"Van soort wisselen?"})))return;
  ed.kind=k;ed.data=k==="run"?{rt:"z2"}:{ex:[]};ed.tplId=null;ed.tplMode="none";ed.tplName="";renderEditor()}));
function renderEditor(){
  document.querySelectorAll(".types button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===ed.kind)));
  const body=$("wBody");body.innerHTML="";$("wCommon").hidden=!ed.kind;$("btnSave").disabled=!ed.kind;
  if(!ed.kind){body.innerHTML=`<p class="note-s" style="text-align:center;margin:10px 0 18px">Kies hierboven wat je deze dag trainde.</p>`;return}
  renderTplBar(body);
  if(ed.kind==="run")renderRun(body);else renderStrength(body);
  renderEditPhotos();renderTplSave();
}
// ---------- opgeslagen workouts ----------
const REPS=[...Array(30).keys()].map(i=>i+1).concat([35,40,45,50,60,75,90,100,120]);
function myTpls(kind){return TP.filter(t=>t.person===who&&t.kind===kind).sort((a,b)=>a.name.localeCompare(b.name))}
function otherTpls(kind){return TP.filter(t=>t.person!==who&&t.kind===kind).sort((a,b)=>a.name.localeCompare(b.name))}
function hasInput(){const d=ed.data||{};return (d.ex&&d.ex.length)||(ed.kind==="run"&&runKm(d)>0)}
function renderTplBar(body){
  const mine=myTpls(ed.kind),other=otherTpls(ed.kind),oth=who==="lor"?"nel":"lor";
  const bar=document.createElement("div");bar.className="tplbar";
  if(!mine.length&&!other.length){bar.innerHTML=`<p class="note-s" style="margin:0">Nog geen opgeslagen ${KIND[ed.kind].l.toLowerCase()}-workouts. Vul je training in en vink onderaan <b>Bewaar als workout</b> aan, dan kan je ze de volgende keer in één tik laden.</p>`;body.appendChild(bar);return}
  const cur=ed.tplId||ed.tplFrom||"";
  bar.innerHTML=`<label>Opgeslagen workout laden<select id="tplSel"><option value="">— Kies een workout —</option>${mine.length?`<optgroup label="Mijn workouts">${mine.map(t=>`<option value="${esc(t.id)}" ${t.id===cur?"selected":""}>${esc(t.name)}</option>`).join("")}</optgroup>`:""}${other.length?`<optgroup label="Van ${NAMES[oth]}">${other.map(t=>`<option value="${esc(t.id)}" ${t.id===cur?"selected":""}>${esc(t.name)}</option>`).join("")}</optgroup>`:""}</select></label>${ed.tplId?`<button class="rm" id="tplDel" type="button">Verwijder “${esc((TP.find(t=>t.id===ed.tplId)||{}).name||"")}”</button>`:""}`;
  body.appendChild(bar);
  $("tplSel").addEventListener("change",async e=>{const id=e.target.value;if(!id){ed.tplId=null;ed.tplFrom=null;ed.tplMode="none";renderEditor();return}
    const t=TP.find(x=>x.id===id);if(!t)return;
    if(hasInput()&&!(await ask("Wat je nu hebt ingevuld wordt vervangen.",{title:`“${t.name}” laden?`,ok:"Ja, laden"}))){e.target.value=cur;return}
    loadTpl(t);renderEditor()});
  const del=$("tplDel");if(del)del.addEventListener("click",async()=>{const t=TP.find(x=>x.id===ed.tplId);if(!t||!(await ask(`Opgeslagen workout “${t.name}” verwijderen? Je gelogde trainingen blijven bewaard.`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;
    const id=t.id;ed.tplId=null;ed.tplMode="none";await run("deleteTemplate",[id,who],"Workout verwijderd.");renderEditor()});
}
function loadTpl(t){
  const data=JSON.parse(JSON.stringify(t.data||{}));delete data.tplId;delete data.tplName;delete data.km;
  if(t.person===who){ed.tplId=t.id;ed.tplFrom=null;ed.tplMode="update";ed.tplName=t.name}
  else{ed.tplId=null;ed.tplFrom=t.id;ed.tplMode="new";ed.tplName=t.name;
    if(data.ex)data.ex.forEach(e=>{const last=lastFor(e.id,who,ed.date,ed.id);(e.sets||[]).forEach((s,i)=>{const ls=last&&(last.e.sets[i]||last.e.sets[last.e.sets.length-1]);s.kg=ls?ls.kg:null})})}
  if(ed.kind!=="run"&&!data.ex)data.ex=[];
  if(ed.kind==="run"){if(!data.rt)data.rt="z2";if(data.rt==="interval"&&!data.blocks)data.blocks=[newBlock()]}
  ed.data=data;
}
function renderTplSave(){
  const box=$("wTpl");if(!box)return;box.innerHTML="";if(!ed.kind){box.hidden=true;return}box.hidden=false;
  const t=ed.tplId?TP.find(x=>x.id===ed.tplId):null;
  if(t){
    box.innerHTML=`<label class="chk"><input type="checkbox" id="tplUpd" ${ed.tplMode==="update"?"checked":""}><span>Werk <b>“${esc(t.name)}”</b> bij met deze sessie<small>Nieuwe gewichten, sets en afstanden worden je vertrekpunt voor de volgende keer.</small></span></label><button type="button" class="linkish" id="tplAsNew">Of bewaar als nieuwe workout</button>`;
    $("tplUpd").addEventListener("change",e=>{ed.tplMode=e.target.checked?"update":"keep"});
    $("tplAsNew").addEventListener("click",()=>{ed.tplId=null;ed.tplMode="new";ed.tplName="";renderEditor();setTimeout(()=>{const n=$("tplName");if(n)n.focus()},30)});
  }else{
    const on=ed.tplMode==="new";
    box.innerHTML=`<label class="chk"><input type="checkbox" id="tplNew" ${on?"checked":""}><span>Bewaar als workout<small>Zo kan je deze training later in één tik opnieuw laden.</small></span></label>${on?`<label>Naam van de workout<input id="tplName" maxlength="50" value="${esc(ed.tplName||"")}" placeholder="${ed.kind==="run"?"bv. Interval 6×800 m":ed.kind==="upper"?"bv. Push dag":"bv. Benen zwaar"}"></label>`:""}`;
    $("tplNew").addEventListener("change",e=>{ed.tplMode=e.target.checked?"new":"none";renderTplSave();if(e.target.checked)setTimeout(()=>$("tplName").focus(),30)});
    const n=$("tplName");if(n)n.addEventListener("input",()=>{ed.tplName=n.value});
  }
}
// ---------- strength ----------
function renderStrength(body){
  const d=ed.data;if(!d.ex)d.ex=[];
  const top=document.createElement("div");
  top.innerHTML=`<div class="sub-h"><span>Oefeningen</span><span class="note-s" style="margin:0">${d.ex.length} gekozen</span></div>`;
  body.appendChild(top);
  d.ex.forEach((e,ei)=>{
    const meta=EX[e.id]||{n:e.id,g:""};const last=lastFor(e.id,who,ed.date,ed.id);
    const card=document.createElement("div");card.className="exc";
    card.innerHTML=`<div class="top">${exAnim(e.id,"sm")}<div class="nm"><b>${esc(meta.n)}</b><span>${esc(meta.g)}</span></div><button class="rm" data-rmex="${ei}" aria-label="${esc(meta.n)} verwijderen">Verwijder</button></div>
      <div class="last">${last?`<em>Vorige keer (${fd(pd(last.w.date))}):</em> ${esc(setsTxt(last.e.sets))}`:`<em>Eerste keer deze oefening.</em>`}</div>
      <div class="sets"><label class="setcount">Aantal sets<select data-setcount="${ei}" aria-label="Aantal sets ${esc(meta.n)}">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option ${n===e.sets.length?"selected":""}>${n}</option>`).join("")}</select></label>
      <div class="sr h"><span>Set</span><span>Reps</span><span>Kg</span><span></span></div>
      ${e.sets.map((s,si)=>`<div class="sr"><span class="n">${si+1}</span><select data-ex="${ei}" data-set="${si}" data-f="r" aria-label="Set ${si+1} reps"><option value="">—</option>${(REPS.includes(s.r)||s.r==null?REPS:REPS.concat([s.r]).sort((a,b)=>a-b)).map(n=>`<option ${n===s.r?"selected":""}>${n}</option>`).join("")}</select><input type="number" inputmode="decimal" min="0" step="0.5" value="${s.kg??""}" placeholder="kg" data-ex="${ei}" data-set="${si}" data-f="kg" aria-label="Set ${si+1} kg"><button class="sx" data-rmset="${ei}:${si}" aria-label="Set ${si+1} verwijderen">×</button></div>`).join("")}</div>`;
    body.appendChild(card)});
  const add=document.createElement("button");add.className="linkbtn";add.textContent="+ Oefening toevoegen";add.addEventListener("click",openPicker);body.appendChild(add);
  const dur=document.createElement("div");dur.innerHTML=`<label style="margin-top:12px">Duur (min)<input type="number" inputmode="numeric" min="0" id="sMin" value="${d.min??""}"></label>`;body.appendChild(dur);
  $("sMin").addEventListener("input",e=>{d.min=num(e.target.value)});
  body.querySelectorAll("input[data-ex],select[data-ex]").forEach(inp=>inp.addEventListener(inp.tagName==="SELECT"?"change":"input",()=>{d.ex[+inp.dataset.ex].sets[+inp.dataset.set][inp.dataset.f]=num(inp.value)}));
  body.querySelectorAll("[data-setcount]").forEach(sel=>sel.addEventListener("change",()=>{const s=d.ex[+sel.dataset.setcount].sets;const n=+sel.value;
    while(s.length<n){const l=s[s.length-1]||{r:null,kg:null};s.push({r:l.r,kg:l.kg})}s.length=n;renderEditor()}));
  body.querySelectorAll("[data-rmset]").forEach(b=>b.addEventListener("click",()=>{const [a,c]=b.dataset.rmset.split(":").map(Number);d.ex[a].sets.splice(c,1);renderEditor()}));
  body.querySelectorAll("[data-rmex]").forEach(b=>b.addEventListener("click",()=>{d.ex.splice(+b.dataset.rmex,1);renderEditor()}));
  body.querySelectorAll(".exc [data-info]").forEach(el=>el.addEventListener("click",()=>openExInfo(el.dataset.info)));
}
// ---------- picker ----------
let pickGroup=null;
function openPicker(){pickGroup=GROUPS[ed.kind][0];$("pSearch").value="";renderPicker();openSheet("pSheet")}
function renderPicker(){
  const tabs=$("pTabs");tabs.innerHTML=GROUPS[ed.kind].map(g=>`<button data-g="${g}" aria-pressed="${g===pickGroup}">${g}</button>`).join("");
  tabs.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{pickGroup=b.dataset.g;$("pSearch").value="";renderPicker()}));
  const q=$("pSearch").value.trim().toLowerCase();const segs=[ed.kind,"core"];
  const list=OEFENINGEN.filter(e=>segs.includes(e.seg)&&(q?(e.n.toLowerCase().includes(q)||e.g.toLowerCase().includes(q)):e.g===pickGroup));
  const sel=new Set(ed.data.ex.map(e=>e.id));
  $("pGrid").innerHTML=list.length?list.map(e=>`<div class="pcw"><button class="pc ${sel.has(e.id)?"on":""}" data-pick="${e.id}" aria-pressed="${sel.has(e.id)}">${exAnim(e.id)}<span>${esc(e.n)}</span>${q?`<small>${esc(e.g)}</small>`:""}</button><button type="button" class="pinfo" data-pinfo="${e.id}" aria-label="Uitvoering ${esc(e.n)} bekijken">Uitleg</button></div>`).join(""):`<p class="dayempty">Geen oefeningen gevonden.</p>`;
  $("pGrid").querySelectorAll("[data-pick]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.pick;const i=ed.data.ex.findIndex(e=>e.id===id);
    if(i>=0)ed.data.ex.splice(i,1);else{const last=lastFor(id,who,ed.date,ed.id);ed.data.ex.push({id,sets:last?last.e.sets.map(s=>({r:s.r,kg:s.kg})):[{r:null,kg:null},{r:null,kg:null},{r:null,kg:null}]})}
    renderPicker()}));
  $("pGrid").querySelectorAll("[data-pinfo]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();openExInfo(b.dataset.pinfo)}));
  $("pDone").textContent=`Klaar (${ed.data.ex.length} gekozen)`;
}
$("pSearch").addEventListener("input",renderPicker);
function closePicker(){closeSheet("pSheet");renderEditor()}
$("pDone").addEventListener("click",closePicker);$("pClose").addEventListener("click",closePicker);
// ---------- run ----------
function zoneSel(val,attr){return `<select ${attr}>${ZONES.map(z=>`<option value="${z}" ${z===(val||"")?"selected":""}>${z||"—"}</option>`).join("")}</select>`}
function inp(label,key,val,extra=""){return `<label>${label}<input type="number" inputmode="decimal" min="0" step="any" data-k="${key}" value="${val??""}" ${extra}></label>`}
function renderRun(body){
  const d=ed.data;
  const tm=isTM(d);
  const env=document.createElement("div");env.className="envsw";env.setAttribute("role","group");env.setAttribute("aria-label","Waar liep je?");
  env.innerHTML=`<button type="button" data-env="out" aria-pressed="${!tm}">Buiten</button><button type="button" data-env="tm" aria-pressed="${tm}">Loopband</button>`;
  body.appendChild(env);
  env.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{d.env=b.dataset.env;renderEditor()}));
  const seg=document.createElement("div");seg.className="seg5";seg.setAttribute("role","group");seg.setAttribute("aria-label","Soort run");
  seg.innerHTML=Object.keys(RT).map(k=>`<button data-rt="${k}" aria-pressed="${d.rt===k}">${RT_SHORT[k]}</button>`).join("");
  body.appendChild(seg);
  seg.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{if(d.rt===b.dataset.rt)return;const keep={rt:b.dataset.rt,env:b.dataset.rt==="walk"&&!d.env?"tm":d.env};if(keep.rt==="interval")keep.blocks=[newBlock()];ed.data=keep;renderEditor()}));
  const tmf=(sp,inc)=>`<div class="grid2 tmrow">${inp("Snelheid (km/u)",sp,d[sp])}${inp("Helling (%)",inc,d[inc])}</div>`;
  const box=document.createElement("div");
  if(d.rt==="interval"){
    if(!d.blocks)d.blocks=[newBlock()];
    box.innerHTML=`<div class="grid2">${inp("Opwarming (km)","wu",d.wu)}${inp("Cooldown (km)","cd",d.cd)}</div><div class="sub-h">Intervallen</div>`+
      d.blocks.map((b,bi)=>`<div class="block-i"><div class="bh"><span>Blok ${bi+1}</span>${d.blocks.length>1?`<button class="rm" data-rmb="${bi}">Verwijder</button>`:""}</div>
        <div class="grid2"><label>Herhalingen<input type="number" inputmode="numeric" min="1" data-b="${bi}" data-bf="reps" value="${b.reps??""}"></label>
        <label>Per interval<div class="minis" style="margin-top:4px"><button type="button" data-bm="${bi}:dist" aria-pressed="${b.mode!=="time"}">Afstand</button><button type="button" data-bm="${bi}:time" aria-pressed="${b.mode==="time"}">Tijd</button></div></label></div>
        <div class="grid3">${b.mode==="time"?`<label>Duur (min)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="time" value="${b.time??""}"></label>`:`<label>Afstand (m)<input type="number" inputmode="numeric" min="0" data-b="${bi}" data-bf="dist" value="${b.dist??""}"></label>`}
        ${tm?`<label>Snelheid (km/u)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="speed" value="${b.speed??""}"></label>`:`<label>Tempo (/km)<input type="text" inputmode="numeric" placeholder="4:30" data-b="${bi}" data-bf="pace" value="${esc(b.pace||"")}"></label>`}
        <label>Rust (min)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="rest" value="${b.rest??""}"></label></div>
        <div class="grid${tm?3:2}">${tm?`<label>Helling (%)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="incline" value="${b.incline??""}"></label>`:""}<label>Hartslagzone${zoneSel(b.zone,`data-b="${bi}" data-bf="zone"`)}</label><label>Gem. hartslag<input type="number" inputmode="numeric" min="0" data-b="${bi}" data-bf="hr" value="${b.hr??""}"></label></div></div>`).join("")+
      `<button class="linkbtn" id="addBlock">+ Intervalblok toevoegen</button>`;
  }else if(d.rt==="long"){
    box.innerHTML=`<div class="grid2">${inp("Afstand (km)","dist",d.dist)}<label>Hartslagzone${zoneSel(d.zone,'data-k="zone"')}</label>${inp("Duur (min)","min",d.min)}${inp("Gem. hartslag","hr",d.hr)}</div>${tm?tmf("speed","incline"):""}`;
  }else if(d.rt==="tempo"){
    box.innerHTML=`${inp("Opwarming (km)","wu",d.wu)}<div class="sub-h">Tempoblok</div><div class="grid3">${inp("Minuten","tmin",d.tmin)}${inp("Afstand (km)","tdist",d.tdist)}<label>Zone${zoneSel(d.zone,'data-k="zone"')}</label></div>${tm?tmf("tspeed","tincline"):""}${inp("Cooldown (km)","cd",d.cd)}`;
  }else if(d.rt==="walk"){
    box.innerHTML=`<div class="grid3">${inp("Duur (min)","min",d.min)}${inp("Snelheid (km/u)","speed",d.speed)}${inp("Helling (%)","incline",d.incline)}</div><div class="grid3">${inp("Afstand (km)","dist",d.dist,'placeholder="auto"')}<label>Hartslagzone${zoneSel(d.zone,'data-k="zone"')}</label>${inp("Gem. hartslag","hr",d.hr)}</div><p class="note-s" style="margin-top:0">Laat afstand leeg: de app rekent ze uit met snelheid × duur.</p>`;
  }else{
    box.innerHTML=tm?`<div class="grid2">${inp("Afstand (km)","dist",d.dist)}${inp("Duur (min)","min",d.min)}</div>${tmf("speed","incline")}`:`${inp("Afstand (km)","dist",d.dist)}`;
  }
  body.appendChild(box);
  const tot=document.createElement("div");tot.className="total";tot.id="runTotal";body.appendChild(tot);updTotal();
  box.querySelectorAll("[data-k]").forEach(x=>x.addEventListener("input",()=>{d[x.dataset.k]=x.dataset.k==="zone"?x.value:num(x.value);updTotal()}));
  box.querySelectorAll("[data-bf]").forEach(x=>x.addEventListener("input",()=>{const b=d.blocks[+x.dataset.b];const f=x.dataset.bf;b[f]=(f==="pace"||f==="zone")?x.value:num(x.value);updTotal()}));
  box.querySelectorAll("[data-bm]").forEach(x=>x.addEventListener("click",()=>{const [bi,m]=x.dataset.bm.split(":");d.blocks[+bi].mode=m;renderEditor()}));
  box.querySelectorAll("[data-rmb]").forEach(x=>x.addEventListener("click",()=>{d.blocks.splice(+x.dataset.rmb,1);renderEditor()}));
  const ab=$("addBlock");if(ab)ab.addEventListener("click",()=>{d.blocks.push(newBlock());renderEditor()});
}
function updTotal(){const el=$("runTotal");if(!el)return;const k=runKm(ed.data);const tt=ed.data.rt==="interval"&&(ed.data.blocks||[]).some(b=>b.mode==="time");
  el.innerHTML=`<span>Totale afstand</span><b>${nfmt(k)} km</b>`+(tt?`<span style="flex-basis:100%;margin-top:4px">Intervallen op tijd tellen niet mee in de km.</span>`:"");el.style.flexWrap="wrap"}
// ---------- feel / photos ----------
function syncFeel(){document.querySelectorAll("#feel button").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.f===(ed&&ed.feel))))}
document.querySelectorAll("#feel button").forEach(b=>b.addEventListener("click",()=>{ed.feel=ed.feel===+b.dataset.f?null:+b.dataset.f;syncFeel()}));
function renderEditPhotos(){const box=$("editPhotos");if(!box||!ed)return;box.innerHTML="";
  const w=ed.id?byId[ed.id]:null;const existing=w?w.photos||[]:[];
  existing.forEach(fid=>box.appendChild(photoTile(null,fid,async()=>{if(!(await ask("Deze foto verwijderen?",{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;await run("removePhoto",[ed.id,who,fid],"Foto verwijderd.");renderEditPhotos()})));
  ed.staged.forEach((u,k)=>box.appendChild(photoTile(u,null,()=>{ed.staged.splice(k,1);renderEditPhotos()})));
  if(existing.length+ed.staged.length<MAXPH){const lab=document.createElement("label");lab.className="addph";lab.innerHTML=`<span>+ Foto</span><input type="file" accept="image/*" multiple>`;
    lab.querySelector("input").addEventListener("change",async e=>{const files=[...e.target.files].slice(0,MAXPH-existing.length-ed.staged.length);
      for(const f of files){try{ed.staged.push(await resize(f))}catch(err){setStatus("Die foto kon niet gelezen worden.",true)}}renderEditPhotos()});box.appendChild(lab)}}
// ---------- save / delete ----------
$("btnSave").addEventListener("click",async()=>{
  if(!ed||!ed.kind)return;
  const d=ed.data;
  if(ed.kind==="run"){d.km=Math.round(runKm(d)*100)/100}
  else{d.ex=(d.ex||[]).map(e=>({id:e.id,sets:(e.sets||[]).filter(s=>s.r!=null||s.kg!=null)})).filter(e=>e.sets.length||true)}
  if(ed.kind!=="run"&&!d.ex.length&&!(await ask("Je hebt nog geen oefeningen gekozen.",{title:"Toch opslaan?",ok:"Ja, opslaan"})))return;
  // opgeslagen workout (sjabloon)
  let tpl=null;
  if(ed.tplMode==="new"){const name=(ed.tplName||"").trim();if(!name){await ask("Geef je workout een naam, of vink 'Bewaar als workout' uit.",{alert:true,title:"Naam ontbreekt"});const n=$("tplName");if(n)n.focus();return}
    const same=myTpls(ed.kind).find(t=>t.name.toLowerCase()===name.toLowerCase());
    if(same&&!(await ask(`Je hebt al een workout “${same.name}”. Overschrijven met deze sessie?`,{title:"Overschrijven?",ok:"Ja, overschrijf"})))return;
    tpl={id:same?same.id:null,name:same?same.name:name}}
  else if(ed.tplMode==="update"&&ed.tplId){const t=TP.find(x=>x.id===ed.tplId);if(t)tpl={id:t.id,name:t.name}}
  else if(ed.tplMode==="keep"&&ed.tplId){const t=TP.find(x=>x.id===ed.tplId);if(t){d.tplId=t.id;d.tplName=t.name}}
  if(ed.tplMode==="none"){delete d.tplId;delete d.tplName}
  const tplData=JSON.parse(JSON.stringify(d));delete tplData.tplId;delete tplData.tplName;delete tplData.km;delete tplData.min;
  const kind=ed.kind;
  const staged=ed.staged.slice();const baseId=ed.id,date=ed.date,feel=ed.feel,note=$("fNote").value.trim();closeSheet("wSheet");
  busy++;setStatus("Opslaan…");
  try{let res;
    if(tpl){setStatus("Workout bijwerken…");res=await call("saveTemplate",{id:tpl.id,person:who,kind,name:tpl.name,data:tplData});d.tplId=res.savedId;d.tplName=tpl.name}
    const payload={id:baseId,person:who,date,kind,title:kind==="run"?RT[d.rt]:KIND[kind].l,data:d,feel,note};
    setStatus("Opslaan…");res=await call("saveWorkout",payload);const id=res.savedId;
    for(let k=0;k<staged.length;k++){setStatus(`Foto ${k+1} van ${staged.length} opladen…`);res=await call("uploadPhoto",id,who,staged[k])}
    busy--;apply(res);setStatus(tpl?(tpl.id?`Opgeslagen · “${tpl.name}” is bijgewerkt.`:`Opgeslagen · workout “${tpl.name}” bewaard.`):"Opgeslagen.")}
  catch(e){busy--;setStatus(errText(e),true);refresh()}
});
$("btnDel").addEventListener("click",async()=>{if(!ed||!ed.id)return;if(!(await ask("Deze training wissen? Foto's en reacties verdwijnen ook.",{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;const id=ed.id;closeSheet("wSheet");await run("deleteWorkout",[id,who],"Gewist.")});

// ================= VIEW (andermans training) =================
let viewId=null;
function openView(id){const w=byId[id];if(!w)return;viewId=id;const d=pd(w.date);
  $("vTitle").textContent=`${NAMES[w.person]} · ${woTitle(w)}`;$("vSub").textContent=`${dayName(d)} ${fd(d)} ${d.getFullYear()}${w.feel?" · gevoel "+w.feel+"/5":""}`;
  const b=$("vBody");const x=w.data||{};
  if(w.kind==="run"){const kv=[];const k=x.km!=null?x.km:runKm(x);if(k)kv.push(["km",nfmt(k)]);
    if(x.rt==="long"){if(x.zone)kv.push(["zone",x.zone]);if(x.min)kv.push(["minuten",x.min]);if(x.hr)kv.push(["gem. hartslag",x.hr])}
    if(x.rt==="tempo"){if(x.wu)kv.push(["opwarming km",nfmt(x.wu)]);if(x.tmin)kv.push(["tempo min",x.tmin]);if(x.tdist)kv.push(["tempo km",nfmt(x.tdist)]);if(x.zone)kv.push(["zone",x.zone]);if(x.cd)kv.push(["cooldown km",nfmt(x.cd)])}
    if(x.rt==="interval"){if(x.wu)kv.push(["opwarming km",nfmt(x.wu)]);if(x.cd)kv.push(["cooldown km",nfmt(x.cd)])}
    if(x.rt==="walk"||x.rt==="z2"){if(x.min)kv.push(["minuten",x.min]);if(x.zone)kv.push(["zone",x.zone]);if(x.hr)kv.push(["gem. hartslag",x.hr])}
    if(x.speed)kv.push(["km/u",nfmt(x.speed)]);if(x.incline)kv.push(["% helling",nfmt(x.incline)]);
    if(x.tspeed)kv.push(["km/u tempo",nfmt(x.tspeed)]);if(x.tincline)kv.push(["% helling tempo",nfmt(x.tincline)]);
    kv.unshift(["waar",isTM(x)?"Loopband":"Buiten"]);
    b.innerHTML=`<div class="kv">${kv.map(([l,v])=>`<div><b>${esc(v)}</b>${l}</div>`).join("")}</div>`+(x.rt==="interval"?(x.blocks||[]).map((bl,i)=>`<div class="ivl"><b>Blok ${i+1}:</b> ${bl.reps||"?"} × ${bl.mode==="time"?(bl.time||"?")+" min":(bl.dist||"?")+" m"}${bl.pace?" · "+esc(bl.pace)+"/km":""}${bl.speed?" · "+nfmt(bl.speed)+" km/u":""}${bl.incline?" · "+nfmt(bl.incline)+"% helling":""}${bl.zone?" · "+bl.zone:""}${bl.hr?" · "+bl.hr+" bpm":""}${bl.rest!=null?" · rust "+nfmt(bl.rest)+" min":""}</div>`).join(""):"")}
  else{b.innerHTML=(x.ex||[]).map(e=>{const m=EX[e.id]||{n:e.id,g:""};return `<div class="vex">${exAnim(e.id,"md")}<div><b>${esc(m.n)}</b><div class="ss">${esc(m.g)}</div><div>${(e.sets||[]).length?esc(setsTxt(e.sets)):"Geen sets ingevuld"}</div></div></div>`}).join("")||`<p class="dayempty">Geen oefeningen ingevuld.</p>`+(x.min?`<p class="note-s">${x.min} minuten</p>`:"");
    b.querySelectorAll("[data-info]").forEach(el=>el.addEventListener("click",()=>openExInfo(el.dataset.info)))}
  $("vNote").innerHTML=w.note?`<div class="vnote">${esc(w.note)}</div>`:"";
  const ph=$("vPhotos");ph.innerHTML="";(w.photos||[]).forEach(f=>ph.appendChild(photoTile(null,f)));$("vPhotoBlock").style.display=(w.photos||[]).length?"block":"none";
  renderThread($("vThread"),id);if(unread().some(c=>c.logId===id)){markSeen();render()}
  openSheet("vSheet")}

// ================= COMMENTS =================
function unread(){if(!who)return[];return C.filter(c=>c.author!==who&&c.createdAt>lastSeen&&(c.logId.indexOf(who+"_")===0||C.some(x=>x.logId===c.logId&&x.author===who)))}
function markSeen(){lastSeen=Date.now();try{localStorage.setItem("knokke-seen-"+who,String(lastSeen))}catch(e){}}
function renderThread(box,id){box.innerHTML="";const t=document.createElement("div");t.className="thread";const list=commentsOf(id);
  if(!list.length)t.innerHTML=`<p class="hint" style="margin:0">Nog geen reacties.</p>`;
  list.forEach(c=>{const el=document.createElement("div");el.className="cm";el.innerHTML=`<span class="av" style="background:var(--${c.author})">${NAMES[c.author][0]}</span><div><div class="bub">${esc(c.text)}</div><div class="meta">${NAMES[c.author]} · ${ago(c.createdAt)}${c.author===who?` <button data-del="${esc(c.id)}">verwijderen</button>`:""}</div></div>`;t.appendChild(el)});
  box.appendChild(t);
  t.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",async()=>{b.disabled=true;await run("deleteComment",[b.dataset.del,who],"Reactie verwijderd.");renderThread(box,id)}));
  if(!who){box.insertAdjacentHTML("beforeend",`<p class="hint">Kies eerst wie je bent om te reageren.</p>`);return}
  const owner=id.split("_")[0];
  if(owner!==who){const q=document.createElement("div");q.className="quick";QUICK.forEach(txt=>{const b=document.createElement("button");b.type="button";b.textContent=txt;b.addEventListener("click",()=>send(txt,b));q.appendChild(b)});box.appendChild(q)}
  const f=document.createElement("form");f.className="cform";f.innerHTML=`<input type="text" maxlength="500" placeholder="${owner===who?"Antwoord of extra boodschap…":"Schrijf een reactie…"}" aria-label="Reactie"><button type="submit">Stuur</button>`;box.appendChild(f);
  f.addEventListener("submit",e=>{e.preventDefault();const v=f.querySelector("input").value.trim();if(v)send(v,f.querySelector("button"))});
  async function send(text,btn){btn.disabled=true;try{apply(await call("addComment",id,who,text));markSeen();renderThread(box,id);render()}catch(e){btn.disabled=false;setStatus(errText(e),true)}}}

// ================= PHOTOS =================
function loadPhoto(fid,img,wrap){if(photoCache[fid]){img.src=photoCache[fid];wrap.classList.remove("load");return}
  call("getPhoto",fid).then(u=>{photoCache[fid]=u;img.src=u;wrap.classList.remove("load")}).catch(()=>{wrap.classList.remove("load")})}
function photoTile(src,fid,onRemove){const w=document.createElement("div");w.className="ph"+(fid&&!src?" load":"");const img=document.createElement("img");img.alt="Workoutfoto";w.appendChild(img);
  if(src)img.src=src;else if(fid)loadPhoto(fid,img,w);img.addEventListener("click",()=>{if(img.src)lightbox(img.src)});
  if(onRemove){const x=document.createElement("button");x.className="x";x.type="button";x.setAttribute("aria-label","Foto verwijderen");x.textContent="×";x.addEventListener("click",e=>{e.stopPropagation();onRemove()});w.appendChild(x)}return w}
function lightbox(src){$("lbImg").src=src;$("lightbox").classList.add("open")}
$("lightbox").addEventListener("click",()=>$("lightbox").classList.remove("open"));
function resize(file){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const max=1400;let{width:w,height:h}=im;if(w>max||h>max){const k=max/Math.max(w,h);w=Math.round(w*k);h=Math.round(h*k)}
  const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(im,0,0,w,h);res(c.toDataURL("image/jpeg",0.8))};im.src=r.result};r.readAsDataURL(file)})}

// ================= FEED =================
function renderFeed(){const un=unread();const nb=$("newc");
  if(un.length){nb.textContent=un.length===1?"1 nieuwe reactie":un.length+" nieuwe reacties";nb.classList.add("show")}else nb.classList.remove("show");
  const items=W.map(w=>({t:w.updatedAt,w})).concat(C.map(c=>({t:c.createdAt,c}))).sort((a,b)=>b.t-a.t).slice(0,15);
  const feed=$("feed");
  if(!items.length){feed.innerHTML=`<li class="empty">Nog niets gelogd. Tik op je naam en daarna op "+ Training loggen".</li>`;return}
  feed.innerHTML=items.map(it=>{if(it.w){const w=it.w,d=pd(w.date);return `<li data-open="${esc(w.id)}" style="cursor:pointer"><span class="dot" style="background:var(--${w.person})"></span><div><b>${NAMES[w.person]}</b> ${esc(woTitle(w))} · ${esc(woSummary(w))}${(w.photos||[]).length?" · 📷":""}<div class="when">${dayName(d)} ${fd(d)}${w.note?" · “"+esc(w.note)+"”":""}</div></div></li>`}
    const c=it.c,t=byId[c.logId],owner=c.logId.split("_")[0];const whose=owner===c.author?"eigen":(owner===who?"jouw":NAMES[owner]+"'s");
    return `<li data-open="${esc(c.logId)}" class="${un.includes(c)?"unread":""}" style="cursor:pointer"><span class="dot" style="background:var(--${c.author})"></span><div><b>${NAMES[c.author]}</b> reageerde op ${whose} ${esc(t?woTitle(t):"training")}: “${esc(c.text)}”<div class="when">${ago(c.createdAt)}</div></div></li>`}).join("");
  feed.querySelectorAll("[data-open]").forEach(li=>li.addEventListener("click",()=>{const w=byId[li.dataset.open];if(!w)return;if(w.person===who)openEditor({id:w.id});else openView(w.id)}))}
$("newc").addEventListener("click",()=>{const un=unread();markSeen();render();if(un.length){const w=byId[un[un.length-1].logId];if(w){if(w.person===who)openEditor({id:w.id});else openView(w.id)}}});

// ================= EIGEN BEVESTIGINGSVENSTER =================
function ask(text,o={}){return new Promise(res=>{
  const bg=$("askBg");$("askTitle").textContent=o.title||(o.alert?"Let op":"Ben je zeker?");$("askText").textContent=text;
  const ok=$("askOk"),no=$("askNo");ok.textContent=o.ok||(o.alert?"OK":"Ja");no.textContent=o.cancel||"Nee";
  no.hidden=!!o.alert;ok.classList.toggle("danger",!!o.danger);
  const done=v=>{bg.classList.remove("open");ok.onclick=no.onclick=null;bg.onclick=null;document.removeEventListener("keydown",key,true);res(v)};
  const key=e=>{if(e.key==="Escape"){e.stopPropagation();done(false)}};
  ok.onclick=()=>done(true);no.onclick=()=>done(false);bg.onclick=e=>{if(e.target===bg)done(false)};
  document.addEventListener("keydown",key,true);bg.classList.add("open");setTimeout(()=>(o.alert?ok:no).focus(),30)})}

// ================= SHEETS =================
function openSheet(id){$(id).classList.add("open")}
function closeSheet(id){$(id).classList.remove("open");if(id==="vSheet")viewId=null}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeSheet(b.dataset.close)));
["wSheet","vSheet","gSheet","plSheet","impSheet","xSheet"].forEach(id=>$(id).addEventListener("click",e=>{if(e.target===$(id))closeSheet(id)}));
$("pSheet").addEventListener("click",e=>{if(e.target===$("pSheet"))closePicker()});
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;
  if($("lightbox").classList.contains("open")){$("lightbox").classList.remove("open");return}
  if($("pSheet").classList.contains("open")){closePicker();return}
  for(const id of ["xSheet","impSheet","gSheet","plSheet","wSheet","vSheet"])if($(id).classList.contains("open")){closeSheet(id);return}});

// ================= SERVER =================
let stTimer=null,busy=0;
function setStatus(msg,warn){const el=$("status");el.textContent=msg;const b=/…$/.test(msg);el.className="status"+(warn?" warn":b?" busy":"");clearTimeout(stTimer);if(!warn&&!b)stTimer=setTimeout(idleStatus,4000)}
function idleStatus(){if(!pin)return;setStatus(who?"Gedeeld: de ander ziet je trainingen en reacties binnen een halve minuut.":"Tik bovenaan op je naam om te beginnen.")}
function errText(e){const m=String(e&&e.message||e);if(m==="NETWORK")return"Geen verbinding met de server. Controleer je internet.";if(m==="BAD_RESPONSE"||m==="UNKNOWN_FN")return"De server heeft nog de oude versie: publiceer in Apps Script een nieuwe versie.";if(m.indexOf("MAX_PHOTOS")>=0)return"Maximaal 4 foto's per training.";if(m.indexOf("TOO_BIG")>=0)return"Te veel gegevens voor één training.";return"Er ging iets mis ("+m+"). Probeer opnieuw."}
async function call(fn,...args){let r;
  try{r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({fn,args:[pin,...args]}),redirect:"follow"})}catch(e){throw new Error("NETWORK")}
  if(!r.ok)throw new Error("HTTP_"+r.status);let j;try{j=await r.json()}catch(e){throw new Error("BAD_RESPONSE")}
  if(!j.ok)throw new Error(j.error||"ERROR");return j.data}
async function run(fn,args,okMsg){busy++;setStatus("Bezig…");try{const res=await call(fn,...args);busy--;apply(res);setStatus(okMsg)}catch(e){busy--;setStatus(errText(e),true);refresh()}}
function apply(d){if(!d)return;W=d.workouts||[];C=d.comments||[];G=d.goals||[];P=d.plan||[];TP=d.templates||[];byId={};W.forEach(w=>byId[w.id]=w);render();
  if(viewId&&$("vSheet").classList.contains("open")){const box=$("vThread");if(!box.contains(document.activeElement))renderThread(box,viewId)}}
function isPinErr(e){return String(e&&e.message||e).indexOf("PIN_WRONG")>=0}
async function refresh(){if(!pin||busy)return;
  try{apply(await call("getData"));const s=$("status");if(s.classList.contains("warn")||/laden/.test(s.textContent))idleStatus()}
  catch(e){if(isPinErr(e))askPin(true);else setStatus(errText(e),true)}}
function askPin(wrong){$("gate").classList.add("open");$("pinErr").textContent=wrong?"Die pincode klopt niet.":"";$("pinIn").value="";setTimeout(()=>$("pinIn").focus(),50)}
$("pinForm").addEventListener("submit",async e=>{e.preventDefault();const v=$("pinIn").value.trim();if(!v)return;$("pinErr").textContent="Controleren…";
  const old=pin;pin=v;try{await call("checkPin");try{localStorage.setItem("knokke-pin",v)}catch(e){}$("gate").classList.remove("open");refresh()}
  catch(err){pin=old;$("pinErr").textContent=isPinErr(err)?"Die pincode klopt niet.":errText(err)}});

// ================= RENDER =================
function render(){renderHero();renderCal();renderWeek();renderGoals();renderFeed()}
renderWho();render();
if(!pin)askPin(false);else refresh();
setInterval(()=>{if(document.visibilityState==="visible"&&!document.querySelector(".sheet-bg.open"))refresh()},30000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")refresh()});
// ================= UPDATES =================
if(/[?&]v=\d+/.test(location.search))history.replaceState(null,"",location.pathname);
// Nieuwe versie op GitHub? Dan haalt de app die vanzelf op en herlaadt één keer.
if("serviceWorker" in navigator){
  let reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(reloaded)return;reloaded=true;location.reload()});
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(reg=>{
    const check=()=>reg.update().catch(()=>{});check();
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")check()});
  }).catch(()=>{}));
}
// Noodknop: alles van deze app op dit toestel vernieuwen (pincode en naam blijven bewaard)
$("btnRefresh").addEventListener("click",async()=>{
  if(!(await ask("De app haalt de nieuwste versie op en herstart. Je pincode, naam en gegevens blijven bewaard.",{title:"App vernieuwen?",ok:"Ja, vernieuw"})))return;
  try{if("serviceWorker" in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()))}
    if(window.caches){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}}catch(e){}
  location.replace(location.pathname+"?v="+Date.now())});
})();
