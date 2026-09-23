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
const RT={interval:"Interval",long:"Long run",tempo:"Tempo run",z2:"Zone 2 run"};
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
function imgSrc(id){const e=EX[id];return e?`https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@${OEF_IMG_COMMIT}/exercises/${e.src}/0.jpg`:""}
function imgAlt(id){const e=EX[id];return e?`https://raw.githubusercontent.com/yuhonas/free-exercise-db/${OEF_IMG_COMMIT}/exercises/${e.src}/0.jpg`:""}
// Valt de CDN weg, dan de foto rechtstreeks van GitHub laden
document.addEventListener("error",e=>{const im=e.target;if(im.tagName!=="IMG"||!im.dataset.ex||im.dataset.fb)return;im.dataset.fb="1";im.src=imgAlt(im.dataset.ex)},true);
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
let W=[],C=[],G=[],P=[];  // workouts, comments, goals, plan
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
  return num(d.dist)||0}
function woTitle(w){if(w.kind==="run")return RT[w.data&&w.data.rt]||"Run";return KIND[w.kind].l}
function woSummary(w){const d=w.data||{};
  if(w.kind==="run"){const k=d.km!=null?d.km:runKm(d);const bits=[];if(k)bits.push(nfmt(k)+" km");
    if(d.rt==="interval"&&d.blocks&&d.blocks.length)bits.push(d.blocks.map(b=>`${b.reps||"?"}×${b.mode==="time"?(b.time||"?")+" min":(b.dist||"?")+" m"}`).join(" + "));
    if(d.rt==="tempo"&&d.tmin)bits.push(d.tmin+" min tempo"+(d.zone?" "+d.zone:""));
    if(d.rt==="long"&&d.zone)bits.push(d.zone);
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
  days.querySelectorAll("[data-fromplan]").forEach(b=>b.addEventListener("click",()=>{const it=findPlan(b.dataset.fromplan);if(it)openEditor({date:it.date,kind:it.kind==="race"?"run":it.kind,rt:it.rt,planKm:it.km})}));
  days.querySelectorAll("[data-wo]").forEach(b=>b.addEventListener("click",()=>{const w=byId[b.dataset.wo];if(!w)return;if(w.person===who)openEditor({id:w.id});else openView(w.id)}));
  days.querySelectorAll("[data-delplan]").forEach(b=>b.addEventListener("click",async()=>{if(!confirm("Deze geplande sessie van de kalender halen?"))return;await run("deletePlanItems",[[b.dataset.delplan]],"Verwijderd.")}));
}
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
  if(!confirm(`Dit doel wissen?${n?` De ${n} geplande sessies ervan verdwijnen ook van de kalender.`:""}`))return;closeSheet("gSheet");await run("deleteGoal",[goalEdit],"Doel gewist.")});

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
  if(planMode==="one"){if(!$("plDate").value){alert("Kies een datum.");return}const k=$("plKind").value;
    items=[{date:$("plDate").value,kind:k,title:$("plTitleIn").value.trim()||PK.find(p=>p[0]===k)[1],detail:$("plDetail").value.trim(),km:num($("plKm").value)}]}
  else{items=weekItems();if(!items.length){alert("Kies minstens één dag en een geldige periode.");return}if(items.length>500){alert("Maximaal 500 sessies per keer.");return}}
  items.forEach(i=>i.goalId=goalId);closeSheet("plSheet");await run("addPlanItems",[items],`${items.length} sessie${items.length>1?"s":""} gepland.`);
  selDate=items[0].date;syncMonth();render()});

// ================= WORKOUT EDITOR =================
let ed=null; // {id,date,kind,data,feel,note,staged:[]}
function openEditor(o){
  if(!who){alert("Tik eerst bovenaan op je naam.");return}
  const w=o.id?byId[o.id]:null;
  ed={id:w?w.id:null,date:w?w.date:o.date,kind:w?w.kind:(o.kind||null),data:w?JSON.parse(JSON.stringify(w.data||{})):{},feel:w?w.feel:null,note:w?w.note:"",staged:[]};
  if(!w&&ed.kind==="run")ed.data={rt:o.rt||"z2"};
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
document.querySelectorAll(".types button").forEach(b=>b.addEventListener("click",()=>{
  const k=b.dataset.kind;if(ed.kind===k)return;
  const hasData=(ed.data.ex&&ed.data.ex.length)||(ed.data.rt&&runKm(ed.data));
  if(hasData&&!confirm("Van soort wisselen? Wat je al invulde voor deze training gaat verloren."))return;
  ed.kind=k;ed.data=k==="run"?{rt:"z2"}:{ex:[]};renderEditor()}));
function renderEditor(){
  document.querySelectorAll(".types button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===ed.kind)));
  const body=$("wBody");body.innerHTML="";$("wCommon").hidden=!ed.kind;$("btnSave").disabled=!ed.kind;
  if(!ed.kind){body.innerHTML=`<p class="note-s" style="text-align:center;margin:10px 0 18px">Kies hierboven wat je deze dag trainde.</p>`;return}
  if(ed.kind==="run")renderRun(body);else renderStrength(body);
  renderEditPhotos();
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
    card.innerHTML=`<div class="top"><img src="${imgSrc(e.id)}" data-ex="${e.id}" alt="${esc(meta.n)}" loading="lazy"><div class="nm"><b>${esc(meta.n)}</b><span>${esc(meta.g)}</span></div><button class="rm" data-rmex="${ei}" aria-label="${esc(meta.n)} verwijderen">Verwijder</button></div>
      <div class="last">${last?`<em>Vorige keer (${fd(pd(last.w.date))}):</em> ${esc(setsTxt(last.e.sets))}`:`<em>Eerste keer deze oefening.</em>`}</div>
      <div class="sets"><div class="sr h"><span>Set</span><span>Reps</span><span>Kg</span><span></span></div>
      ${e.sets.map((s,si)=>`<div class="sr"><span class="n">${si+1}</span><input type="number" inputmode="numeric" min="0" value="${s.r??""}" data-ex="${ei}" data-set="${si}" data-f="r" aria-label="Set ${si+1} reps"><input type="number" inputmode="decimal" min="0" step="0.5" value="${s.kg??""}" data-ex="${ei}" data-set="${si}" data-f="kg" aria-label="Set ${si+1} kg"><button class="sx" data-rmset="${ei}:${si}" aria-label="Set ${si+1} verwijderen">×</button></div>`).join("")}
      <button class="addset" data-addset="${ei}">+ Set toevoegen</button></div>`;
    body.appendChild(card)});
  const add=document.createElement("button");add.className="linkbtn";add.textContent="+ Oefening toevoegen";add.addEventListener("click",openPicker);body.appendChild(add);
  const dur=document.createElement("div");dur.innerHTML=`<label style="margin-top:12px">Duur (min)<input type="number" inputmode="numeric" min="0" id="sMin" value="${d.min??""}"></label>`;body.appendChild(dur);
  $("sMin").addEventListener("input",e=>{d.min=num(e.target.value)});
  body.querySelectorAll("input[data-ex]").forEach(inp=>inp.addEventListener("input",()=>{d.ex[+inp.dataset.ex].sets[+inp.dataset.set][inp.dataset.f]=num(inp.value)}));
  body.querySelectorAll("[data-addset]").forEach(b=>b.addEventListener("click",()=>{const s=d.ex[+b.dataset.addset].sets;const l=s[s.length-1]||{r:null,kg:null};s.push({r:l.r,kg:l.kg});renderEditor()}));
  body.querySelectorAll("[data-rmset]").forEach(b=>b.addEventListener("click",()=>{const [a,c]=b.dataset.rmset.split(":").map(Number);d.ex[a].sets.splice(c,1);renderEditor()}));
  body.querySelectorAll("[data-rmex]").forEach(b=>b.addEventListener("click",()=>{d.ex.splice(+b.dataset.rmex,1);renderEditor()}));
  body.querySelectorAll(".exc img").forEach(im=>im.addEventListener("click",()=>lightbox(im.src)));
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
  $("pGrid").innerHTML=list.length?list.map(e=>`<button class="pc ${sel.has(e.id)?"on":""}" data-pick="${e.id}" aria-pressed="${sel.has(e.id)}"><img src="${imgSrc(e.id)}" data-ex="${e.id}" alt="" loading="lazy"><span>${esc(e.n)}</span>${q?`<small>${esc(e.g)}</small>`:""}</button>`).join(""):`<p class="dayempty">Geen oefeningen gevonden.</p>`;
  $("pGrid").querySelectorAll("[data-pick]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.pick;const i=ed.data.ex.findIndex(e=>e.id===id);
    if(i>=0)ed.data.ex.splice(i,1);else{const last=lastFor(id,who,ed.date,ed.id);ed.data.ex.push({id,sets:last?last.e.sets.map(s=>({r:s.r,kg:s.kg})):[{r:null,kg:null},{r:null,kg:null},{r:null,kg:null}]})}
    renderPicker()}));
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
  const seg=document.createElement("div");seg.className="seg4";seg.setAttribute("role","group");seg.setAttribute("aria-label","Soort run");
  seg.innerHTML=Object.entries(RT).map(([k,l])=>`<button data-rt="${k}" aria-pressed="${d.rt===k}">${l.replace(" run","")}</button>`).join("");
  body.appendChild(seg);
  seg.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{if(d.rt===b.dataset.rt)return;const keep={rt:b.dataset.rt};if(keep.rt==="interval")keep.blocks=[newBlock()];ed.data=keep;renderEditor()}));
  const box=document.createElement("div");
  if(d.rt==="interval"){
    if(!d.blocks)d.blocks=[newBlock()];
    box.innerHTML=`<div class="grid2">${inp("Opwarming (km)","wu",d.wu)}${inp("Cooldown (km)","cd",d.cd)}</div><div class="sub-h">Intervallen</div>`+
      d.blocks.map((b,bi)=>`<div class="block-i"><div class="bh"><span>Blok ${bi+1}</span>${d.blocks.length>1?`<button class="rm" data-rmb="${bi}">Verwijder</button>`:""}</div>
        <div class="grid2"><label>Herhalingen<input type="number" inputmode="numeric" min="1" data-b="${bi}" data-bf="reps" value="${b.reps??""}"></label>
        <label>Per interval<div class="minis" style="margin-top:4px"><button type="button" data-bm="${bi}:dist" aria-pressed="${b.mode!=="time"}">Afstand</button><button type="button" data-bm="${bi}:time" aria-pressed="${b.mode==="time"}">Tijd</button></div></label></div>
        <div class="grid3">${b.mode==="time"?`<label>Duur (min)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="time" value="${b.time??""}"></label>`:`<label>Afstand (m)<input type="number" inputmode="numeric" min="0" data-b="${bi}" data-bf="dist" value="${b.dist??""}"></label>`}
        <label>Tempo (/km)<input type="text" inputmode="numeric" placeholder="4:30" data-b="${bi}" data-bf="pace" value="${esc(b.pace||"")}"></label>
        <label>Rust (min)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="rest" value="${b.rest??""}"></label></div>
        <div class="grid2"><label>Hartslagzone${zoneSel(b.zone,`data-b="${bi}" data-bf="zone"`)}</label><label>Gem. hartslag<input type="number" inputmode="numeric" min="0" data-b="${bi}" data-bf="hr" value="${b.hr??""}"></label></div></div>`).join("")+
      `<button class="linkbtn" id="addBlock">+ Intervalblok toevoegen</button>`;
  }else if(d.rt==="long"){
    box.innerHTML=`<div class="grid2">${inp("Afstand (km)","dist",d.dist)}<label>Hartslagzone${zoneSel(d.zone,'data-k="zone"')}</label>${inp("Duur (min)","min",d.min)}${inp("Gem. hartslag","hr",d.hr)}</div>`;
  }else if(d.rt==="tempo"){
    box.innerHTML=`${inp("Opwarming (km)","wu",d.wu)}<div class="sub-h">Tempoblok</div><div class="grid3">${inp("Minuten","tmin",d.tmin)}${inp("Afstand (km)","tdist",d.tdist)}<label>Zone${zoneSel(d.zone,'data-k="zone"')}</label></div>${inp("Cooldown (km)","cd",d.cd)}`;
  }else{
    box.innerHTML=`${inp("Afstand (km)","dist",d.dist)}`;
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
  existing.forEach(fid=>box.appendChild(photoTile(null,fid,async()=>{if(!confirm("Deze foto verwijderen?"))return;await run("removePhoto",[ed.id,who,fid],"Foto verwijderd.");renderEditPhotos()})));
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
  if(ed.kind!=="run"&&!d.ex.length&&!confirm("Je hebt nog geen oefeningen gekozen. Toch opslaan?"))return;
  const payload={id:ed.id,person:who,date:ed.date,kind:ed.kind,title:ed.kind==="run"?RT[d.rt]:KIND[ed.kind].l,data:d,feel:ed.feel,note:$("fNote").value.trim()};
  const staged=ed.staged.slice();closeSheet("wSheet");
  busy++;setStatus("Opslaan…");
  try{let res=await call("saveWorkout",payload);const id=res.savedId;
    for(let k=0;k<staged.length;k++){setStatus(`Foto ${k+1} van ${staged.length} opladen…`);res=await call("uploadPhoto",id,who,staged[k])}
    busy--;apply(res);setStatus("Opgeslagen.")}
  catch(e){busy--;setStatus(errText(e),true);refresh()}
});
$("btnDel").addEventListener("click",async()=>{if(!ed||!ed.id)return;if(!confirm("Deze training wissen? Foto's en reacties verdwijnen ook."))return;const id=ed.id;closeSheet("wSheet");await run("deleteWorkout",[id,who],"Gewist.")});

// ================= VIEW (andermans training) =================
let viewId=null;
function openView(id){const w=byId[id];if(!w)return;viewId=id;const d=pd(w.date);
  $("vTitle").textContent=`${NAMES[w.person]} · ${woTitle(w)}`;$("vSub").textContent=`${dayName(d)} ${fd(d)} ${d.getFullYear()}${w.feel?" · gevoel "+w.feel+"/5":""}`;
  const b=$("vBody");const x=w.data||{};
  if(w.kind==="run"){const kv=[];const k=x.km!=null?x.km:runKm(x);if(k)kv.push(["km",nfmt(k)]);
    if(x.rt==="long"){if(x.zone)kv.push(["zone",x.zone]);if(x.min)kv.push(["minuten",x.min]);if(x.hr)kv.push(["gem. hartslag",x.hr])}
    if(x.rt==="tempo"){if(x.wu)kv.push(["opwarming km",nfmt(x.wu)]);if(x.tmin)kv.push(["tempo min",x.tmin]);if(x.tdist)kv.push(["tempo km",nfmt(x.tdist)]);if(x.zone)kv.push(["zone",x.zone]);if(x.cd)kv.push(["cooldown km",nfmt(x.cd)])}
    if(x.rt==="interval"){if(x.wu)kv.push(["opwarming km",nfmt(x.wu)]);if(x.cd)kv.push(["cooldown km",nfmt(x.cd)])}
    b.innerHTML=`<div class="kv">${kv.map(([l,v])=>`<div><b>${esc(v)}</b>${l}</div>`).join("")}</div>`+(x.rt==="interval"?(x.blocks||[]).map((bl,i)=>`<div class="ivl"><b>Blok ${i+1}:</b> ${bl.reps||"?"} × ${bl.mode==="time"?(bl.time||"?")+" min":(bl.dist||"?")+" m"}${bl.pace?" · "+esc(bl.pace)+"/km":""}${bl.zone?" · "+bl.zone:""}${bl.hr?" · "+bl.hr+" bpm":""}${bl.rest!=null?" · rust "+nfmt(bl.rest)+" min":""}</div>`).join(""):"")}
  else{b.innerHTML=(x.ex||[]).map(e=>{const m=EX[e.id]||{n:e.id,g:""};return `<div class="vex"><img src="${imgSrc(e.id)}" data-ex="${e.id}" alt="${esc(m.n)}" loading="lazy"><div><b>${esc(m.n)}</b><div class="ss">${esc(m.g)}</div><div>${(e.sets||[]).length?esc(setsTxt(e.sets)):"Geen sets ingevuld"}</div></div></div>`}).join("")||`<p class="dayempty">Geen oefeningen ingevuld.</p>`+(x.min?`<p class="note-s">${x.min} minuten</p>`:"");
    b.querySelectorAll("img").forEach(im=>im.addEventListener("click",()=>lightbox(im.src)))}
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

// ================= SHEETS =================
function openSheet(id){$(id).classList.add("open")}
function closeSheet(id){$(id).classList.remove("open");if(id==="vSheet")viewId=null}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeSheet(b.dataset.close)));
["wSheet","vSheet","gSheet","plSheet"].forEach(id=>$(id).addEventListener("click",e=>{if(e.target===$(id))closeSheet(id)}));
$("pSheet").addEventListener("click",e=>{if(e.target===$("pSheet"))closePicker()});
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;
  if($("lightbox").classList.contains("open")){$("lightbox").classList.remove("open");return}
  if($("pSheet").classList.contains("open")){closePicker();return}
  for(const id of ["gSheet","plSheet","wSheet","vSheet"])if($(id).classList.contains("open")){closeSheet(id);return}});

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
function apply(d){if(!d)return;W=d.workouts||[];C=d.comments||[];G=d.goals||[];P=d.plan||[];byId={};W.forEach(w=>byId[w.id]=w);render();
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
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
})();
