/* DuoScience core */
(function(){
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const views = {
    home: $("#home-view"),
    chapters: $("#chapters-view"),
    progress: $("#progress-view"),
    settings: $("#settings-view")
  };

  const state = {
    xp: 0,
    crowns: 0,
    streak: 0,
    lastStudyDate: null,
    goalMinutes: 15,
    history: [], // {date, xp}
    current: { chapterId: null, unitId: null }
  };

  const STORAGE_KEY = "duoscience_v1";

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function load(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      try{ Object.assign(state, JSON.parse(raw)); }catch(e){ console.warn(e); }
    }
    // init history with last 14 days if missing
    const today = new Date().toISOString().slice(0,10);
    if(!state.history.length || state.history[state.history.length-1]?.date !== today){
      // ensure unique dates
      const map = new Map(state.history.map(h=>[h.date,h]));
      const last14 = [...Array(14)].map((_,i)=>{
        const d = new Date(); d.setDate(d.getDate()- (13-i));
        const key = d.toISOString().slice(0,10);
        return map.get(key) || {date:key,xp:0};
      });
      state.history = last14;
    }
  }

  function switchView(name){
    Object.values(views).forEach(v=>v.classList.remove("active"));
    views[name].classList.add("active");
  }

  function renderHome(){
    $("#goal-value").textContent = state.goalMinutes;
    $("#daily-goal").value = state.goalMinutes;
    $("#xp").textContent = state.xp;
    $("#streak").textContent = `${state.streak} 🔥`;
    $("#crowns").textContent = state.crowns;
    const next = getNextLesson();
    if(next){
      $("#continue-desc").textContent = `${next.ch.title} • ${next.u.title}`;
    } else {
      $("#continue-desc").textContent = "Choose any chapter to begin.";
    }
    renderRoadmap();
  }

  function renderChapters(){
    const container = $("#chapters-list");
    container.innerHTML = "";
    DUO_DATA.syllabus.forEach(ch=>{
      const div = document.createElement("div");
      div.className = "lesson";
      const progress = chapterProgress(ch.id);
      div.innerHTML = `
        <div class="meta"><span class="tag">Chapter</span><span>${progress.crowns}/${ch.crownTarget} 👑</span></div>
        <h3>${ch.title}</h3>
        <div>${progress.completedUnits}/${ch.units.length} units mastered</div>
        <div class="row">
          <button class="primary start-ch" data-ch="${ch.id}">Start / Continue</button>
          <span class="muted">${Math.round(progress.completion*100)}% done</span>
        </div>
      `;
      container.appendChild(div);
    });

    $$(".start-ch").forEach(b=>b.addEventListener("click", e=>{
      const chId = e.currentTarget.dataset.ch;
      startLesson(chId);
    }));
  }

  function renderRoadmap(){
    const grid = $("#roadmap-grid");
    grid.innerHTML = "";
    DUO_DATA.syllabus.forEach(ch=>{
      ch.units.forEach(u=>{
        const key = `crown_${ch.id}_${u.id}`;
        const crowns = +localStorage.getItem(key) || 0;
        const node = document.createElement("div");
        node.className = "lesson";
        node.innerHTML = `
          <div class="crown">${"👑".repeat(crowns)}</div>
          <div class="meta"><span class="tag">${ch.title.split(":")[0]}</span><span>${crowns}/3 👑</span></div>
          <h4>${u.title}</h4>
          <button class="primary start-u" data-ch="${ch.id}" data-u="${u.id}">Practice</button>
        `;
        grid.appendChild(node);
      });
    });
    $$(".start-u").forEach(b=>b.addEventListener("click", e=>{
      startLesson(e.currentTarget.dataset.ch, e.currentTarget.dataset.u);
    }));
  }

  function renderProgress(){
    // badges
    const badges = $("#badges");
    badges.innerHTML = "";
    const earned = computeBadges();
    earned.forEach(b=>{
      const li = document.createElement("li");
      li.className = "badge";
      li.innerHTML = `${b.emoji} <span>${b.name}</span>`;
      badges.appendChild(li);
    });
    renderXPChart();
  }

  function chapterProgress(chapterId){
    const ch = DUO_DATA.syllabus.find(c=>c.id===chapterId);
    let completedUnits = 0, crowns = 0;
    ch.units.forEach(u=>{
      const c = +localStorage.getItem(`crown_${chapterId}_${u.id}`) || 0;
      crowns += c;
      if(c>=3) completedUnits++;
    });
    const totalCrowns = ch.units.length*3;
    return { completedUnits, crowns, completion: crowns/totalCrowns, ch };
  }

  function getNextLesson(){
    // simple: the first unit with <3 crowns
    for(const ch of DUO_DATA.syllabus){
      for(const u of ch.units){
        const crowns = +localStorage.getItem(`crown_${ch.id}_${u.id}`) || 0;
        if(crowns < 3) return { ch, u };
      }
    }
    return null;
  }

  function startLesson(chId, uId){
    const ch = DUO_DATA.syllabus.find(c=>c.id===chId) || DUO_DATA.syllabus[0];
    const unit = ch.units.find(u=>u.id===uId) || ch.units.find(u=> (+localStorage.getItem(`crown_${ch.id}_${u.id}`) || 0) < 3 ) || ch.units[0];
    state.current = { chapterId: ch.id, unitId: unit.id };
    openLesson(ch, unit);
  }

  function shuffle(arr){
    return arr.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
  }

  function openLesson(ch, unit){
    $("#lesson-title").textContent = `${ch.title} • ${unit.title}`;
    const body = $("#lesson-body");
    body.innerHTML = "";
    const items = expandItems(unit.items);
    let index = 0, correct=0;
    renderItem();

    function renderItem(){
      const it = items[index];
      body.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className="q";
      if(it.type==="mcq"){
        wrap.innerHTML = `<h4>${it.q}</h4>`;
        const opts = document.createElement("div");
        shuffle(it.options).forEach((opt,i)=>{
          const el = document.createElement("button");
          el.className="option";
          el.textContent = opt;
          el.addEventListener("click",()=>{
            const isCorrect = opt === it.options[it.answer];
            el.classList.add(isCorrect?"correct":"wrong");
            if(isCorrect){ correct++; gainXP(10); }
            feedback(it, isCorrect);
          });
          opts.appendChild(el);
        });
        wrap.appendChild(opts);
      } else if(it.type==="fill"){
        wrap.innerHTML = `<h4>${it.q}</h4>`;
        const input = document.createElement("input");
        input.type="text";
        input.placeholder="Type your answer";
        const submit = document.createElement("button");
        submit.className="primary"; submit.textContent="Check";
        submit.addEventListener("click",()=>{
          const ans = (input.value||"").trim().toLowerCase();
          const ok = ans === String(it.answer).trim().toLowerCase();
          if(ok){ correct++; gainXP(12); }
          input.classList.add(ok?"correct":"wrong");
          feedback(it, ok);
        });
        wrap.appendChild(input); wrap.appendChild(submit);
      } else if(it.type==="tf"){
        wrap.innerHTML = `<h4>${it.q}</h4>`;
        ["True","False"].forEach((lab,val)=>{
          const b = document.createElement("button");
          b.className="option"; b.textContent=lab;
          b.addEventListener("click",()=>{
            const ok = (val===1) === !!it.answer;
            if(ok){ correct++; gainXP(8); }
            b.classList.add(ok?"correct":"wrong");
            feedback(it, ok);
          });
          wrap.appendChild(b);
        });
      } else if(it.type==="match"){
        wrap.innerHTML = `<h4>${it.q}</h4>`;
        const left = it.pairs.map(p=>p[0]);
        const right = shuffle(it.pairs.map(p=>p[1]));
        const container = document.createElement("div");
        container.className="match-pair";
        left.forEach((L,i)=>{
          const div = document.createElement("div");
          div.className="match-item";
          const span = document.createElement("span"); span.textContent=L;
          const sel = document.createElement("select");
          sel.innerHTML = `<option value="">Select</option>` + right.map(r=>`<option>${r}</option>`).join("");
          div.appendChild(span); div.appendChild(sel); container.appendChild(div);
        });
        const check = document.createElement("button");
        check.className="primary"; check.textContent="Check";
        check.addEventListener("click",()=>{
          const selects = container.querySelectorAll("select");
          let ok = true;
          selects.forEach((s,i)=>{
            const want = it.pairs[i][1];
            const got = s.value;
            if(got===want){ s.classList.add("correct"); } else { s.classList.add("wrong"); ok=false; }
          });
          if(ok){ correct++; gainXP(15); }
          feedback(it, ok);
        });
        wrap.appendChild(container);
        wrap.appendChild(check);
      }

      body.appendChild(wrap);
      const controls = document.createElement("div");
      controls.className="controls";
      const status = document.createElement("span");
      status.className="muted";
      status.textContent = `Question ${index+1} of ${items.length}`;
      const next = document.createElement("button");
      next.className="primary"; next.textContent= index === items.length-1 ? "Finish" : "Next";
      next.addEventListener("click",()=>{
        if(index < items.length-1){ index++; renderItem(); } else { finishLesson(); }
      });
      controls.appendChild(status); controls.appendChild(next);
      body.appendChild(controls);
    }

    function feedback(it, ok){
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = (ok?"✅ Correct. ":"❌ Try again. ") + (it.explain||"");
      body.appendChild(p);
    }

    function finishLesson(){
      closeLesson();
      // crown progression per unit (3 crowns max)
      const key = `crown_${ch.id}_${unit.id}`;
      const crowns = Math.min(3, (+localStorage.getItem(key) || 0) + 1);
      localStorage.setItem(key, String(crowns));
      state.crowns = totalCrowns();
      // streak
      updateStreak();
      // mark continue pointer
      state.current = { chapterId: ch.id, unitId: unit.id };
      save();
      renderHome();
      renderChapters();
      renderProgress();
      alert(`Great! You earned a crown (${crowns}/3) for "${unit.title}".`);
    }

    openModal();
  }

  function gainXP(n){
    state.xp += n;
    // today history
    const today = new Date().toISOString().slice(0,10);
    const idx = state.history.findIndex(h=>h.date===today);
    if(idx>=0){ state.history[idx].xp += n; }
    save();
    $("#xp").textContent = state.xp;
    renderXPChart();
  }

  function updateStreak(){
    const today = new Date().toISOString().slice(0,10);
    const last = state.lastStudyDate;
    if(last){
      const prev = new Date(last);
      const d = new Date(today);
      const diff = Math.round((d - prev)/(1000*60*60*24));
      if(diff === 1){ state.streak += 1; }
      else if(diff === 0){ /* same day, no change */ }
      else { state.streak = 1; }
    } else {
      state.streak = 1;
    }
    state.lastStudyDate = today;
  }

  function totalCrowns(){
    let t=0;
    DUO_DATA.syllabus.forEach(ch=>{
      ch.units.forEach(u=> t += (+localStorage.getItem(`crown_${ch.id}_${u.id}`) || 0));
    });
    return t;
  }

  function openModal(){ $("#lesson-modal").classList.remove("hidden"); }
  function closeLesson(){ $("#lesson-modal").classList.add("hidden"); }

  $("#close-lesson").addEventListener("click", closeLesson);

  // view buttons
  $("#btn-home").addEventListener("click", ()=>{ switchView("home"); });
  $("#btn-chapters").addEventListener("click", ()=>{ switchView("chapters"); });
  $("#btn-progress").addEventListener("click", ()=>{ switchView("progress"); });
  $("#btn-settings").addEventListener("click", ()=>{ switchView("settings"); });

  $("#btn-continue").addEventListener("click", ()=>{
    const next = getNextLesson();
    if(next){ startLesson(next.ch.id, next.u.id); }
  });

  $("#daily-goal").addEventListener("input", e=>{
    state.goalMinutes = +e.target.value;
    $("#goal-value").textContent = state.goalMinutes;
    save();
  });

  $("#reset").addEventListener("click", ()=>{
    if(confirm("Reset all progress?")){
      localStorage.clear();
      location.reload();
    }
  });

  // Expand items: duplicate and randomize to reach ~7 questions per lesson
  function expandItems(items){
    const pool = JSON.parse(JSON.stringify(items));
    const out = [];
    while(out.length < Math.max(7, items.length)){
      out.push(pool[out.length % pool.length]);
    }
    return shuffle(out);
  }

  // Simple XP chart (matplotlib-like not available here; use Canvas API)
  function renderXPChart(){
    const canvas = $("#xp-chart");
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    // axes
    ctx.beginPath();
    ctx.moveTo(30,10); ctx.lineTo(30,h-20); ctx.lineTo(w-10,h-20);
    ctx.stroke();
    const days = state.history;
    const maxXP = Math.max(20, ...days.map(d=>d.xp));
    const barW = (w-50)/days.length - 4;
    days.forEach((d,i)=>{
      const x = 34 + i*((w-50)/days.length);
      const bh = Math.round(((h-40) * d.xp)/maxXP);
      ctx.fillRect(x, h-20-bh, barW, bh);
    });
  }

  // badges
  function computeBadges(){
    const arr = [];
    if(state.streak>=3) arr.push({name:"3-day Streak", emoji:"🔥"});
    if(state.xp>=100) arr.push({name:"100 XP", emoji:"💯"});
    if(state.crowns>=3) arr.push({name:"3 Crowns", emoji:"👑"});
    return arr;
  }

  // init app
  function init(){
    load();
    renderHome();
    renderChapters();
    renderProgress();
    // install SW
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("./sw.js");
    }
  }
  init();
})();