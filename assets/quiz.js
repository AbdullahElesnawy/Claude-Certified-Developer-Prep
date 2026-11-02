// Shared quiz engine for the practice quizzes and the mock exam.
//
// Quiz.mount({
//   title, subtitle, backHref,
//   storageKey,            // progress is saved per quiz in localStorage (best effort)
//   questions,             // [{ s, q, o, a, w, d? }]  s = section, d = exam domain
//   groupBy: "s" | null,   // show section headings in question order
//   scoreBy: "s" | "d",    // breakdown table in the results
//   shuffleQuestions,      // shuffle question order (the mock exam does this)
//   timerMinutes,          // optional; shows a start screen and auto-submits at zero
//   intro,                 // optional HTML for the start screen
// })
(function () {
  const LETTERS = "ABCDEFGH";

  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
    del(key) { try { localStorage.removeItem(key); } catch { /* storage unavailable */ } },
  };

  function shuffled(n) {
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fmt = (t) => esc(t).replace(/`([^`]+)`/g, "<code>$1</code>");

  function mount(cfg) {
    const Q = cfg.questions;
    const valid = (s) => s && Array.isArray(s.order) && s.order.length === Q.length &&
      Array.isArray(s.perms) && s.perms.length === Q.length;
    let state = store.get(cfg.storageKey);
    if (!valid(state)) {
      state = {
        order: cfg.shuffleQuestions ? shuffled(Q.length) : [...Q.keys()],
        perms: Q.map((q) => shuffled(q.o.length)),
        picked: {},
        submitted: false,
        endsAt: null,
      };
    }
    const save = () => store.set(cfg.storageKey, state);

    document.title = cfg.title;
    document.body.innerHTML = `
      <main>
        ${cfg.backHref ? `<a class="back" href="${cfg.backHref}">← Back to notes</a>` : ""}
        <h1>${esc(cfg.title)}</h1>
        <p class="sub">${cfg.subtitle}</p>
        <section id="result" aria-live="polite"></section>
        <div id="start"></div>
        <form id="quiz"></form>
      </main>
      <div class="bar"><div class="bar-inner">
        <span class="progress"><span id="progress"></span><span class="timer" id="timer"></span></span>
        <span>
          <button type="button" class="secondary" id="reset">Start over</button>
          <button type="button" id="submit">Submit</button>
        </span>
      </div></div>`;

    const form = document.getElementById("quiz");
    const resultEl = document.getElementById("result");
    const progressEl = document.getElementById("progress");
    const timerEl = document.getElementById("timer");
    const submitBtn = document.getElementById("submit");

    // Map "(A)" / "(A, D)" in an explanation from original option letters to shown letters.
    function remapLetters(text, perm) {
      return text.replace(/\(([A-H](?:\s*(?:,|and|or)\s*[A-H])*)\)/g, (m, inner) =>
        "(" + inner.replace(/[A-H]/g, (L) => LETTERS[perm.indexOf(LETTERS.indexOf(L))]) + ")");
    }

    function render() {
      let html = "", section = "";
      state.order.forEach((qi, pos) => {
        const item = Q[qi];
        if (cfg.groupBy && item[cfg.groupBy] !== section) {
          section = item[cfg.groupBy];
          html += `<h2>${esc(section)}</h2>`;
        }
        const multi = item.a.length > 1;
        const type = multi ? "checkbox" : "radio";
        const picked = state.picked[qi] || [];
        html += `<div class="q" id="q${qi}"><p class="stem"><span class="num">Q${pos + 1}.</span>${fmt(item.q)}` +
          (multi ? `<span class="hint">Select ${item.a.length}</span>` : "") + `</p>`;
        state.perms[qi].forEach((orig, shown) => {
          html += `<label class="opt"><input type="${type}" name="q${qi}" value="${orig}"${picked.includes(orig) ? " checked" : ""}>` +
            `<span class="letter">${LETTERS[shown]}.</span><span>${fmt(item.o[orig])}</span></label>`;
        });
        html += `<div class="why"></div></div>`;
      });
      form.innerHTML = html;
    }

    const answeredCount = () => Q.filter((_, qi) => (state.picked[qi] || []).length).length;
    const updateProgress = () => { progressEl.textContent = `${answeredCount()} / ${Q.length} answered`; };

    form.addEventListener("change", (e) => {
      const input = e.target;
      const qi = Number(input.name.slice(1));
      if (input.type === "checkbox") {
        const checked = form.querySelectorAll(`input[name="${input.name}"]:checked`);
        if (checked.length > Q[qi].a.length) input.checked = false;
      }
      state.picked[qi] = [...form.querySelectorAll(`input[name="${input.name}"]:checked`)].map((el) => Number(el.value));
      save();
      updateProgress();
    });

    function grade({ confirmFirst }) {
      const missing = Q.length - answeredCount();
      if (confirmFirst && missing > 0 && !confirm(`${missing} question(s) unanswered. Submit anyway?`)) return;
      state.submitted = true;
      save();
      stopTimer();

      let correct = 0;
      const groups = {};
      Q.forEach((item, qi) => {
        const box = document.getElementById(`q${qi}`);
        const picked = state.picked[qi] || [];
        const right = picked.length === item.a.length && item.a.every((v) => picked.includes(v));
        if (right) correct++;
        const g = item[cfg.scoreBy] || "Other";
        groups[g] = groups[g] || { c: 0, t: 0 };
        groups[g].t++;
        if (right) groups[g].c++;

        const perm = state.perms[qi];
        box.classList.add("done", right ? "ok" : "bad");
        box.querySelectorAll("label.opt").forEach((label, shown) => {
          const orig = perm[shown];
          if (item.a.includes(orig)) label.classList.add("correct");
          else if (picked.includes(orig)) label.classList.add("wrong");
        });
        const key = item.a.map((orig) => LETTERS[perm.indexOf(orig)]).sort().join(", ");
        const tag = cfg.scoreBy === "d" ? ` <span class="tag">${esc(item.d)}</span>` : "";
        box.querySelector(".why").innerHTML =
          `<span class="verdict">${right ? "Correct." : "Incorrect."}</span>Answer: <b>${key}</b>. ${fmt(remapLetters(item.w, perm))}${tag}`;
      });
      form.querySelectorAll("input").forEach((el) => (el.disabled = true));

      const pct = Math.round((correct / Q.length) * 100);
      const pass = pct >= 72;
      const rows = Object.entries(groups)
        .map(([name, r]) => `<tr><td>${esc(name)}</td><td>${r.c} / ${r.t}</td></tr>`).join("");
      resultEl.innerHTML =
        `<div class="score">${correct} / ${Q.length} <small>(${pct}%)</small></div>` +
        `<div class="pass" style="color: var(${pass ? "--ok" : "--bad"})">${pass ? "Above" : "Below"} the 72% practice line</div>` +
        `<table>${rows}</table>` +
        `<p class="note">The real exam reports a scaled score (pass = 720 on 100–1,000), which is not the same as percent correct. 72% here is only a rough practice target. Scroll down to review each answer.</p>`;
      resultEl.classList.add("show");
      submitBtn.disabled = true;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    let tick = null;
    function stopTimer() { if (tick) clearInterval(tick); tick = null; }
    function runTimer() {
      const update = () => {
        const left = Math.max(0, state.endsAt - Date.now());
        const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
        timerEl.textContent = `· ${m}:${String(s).padStart(2, "0")} left`;
        timerEl.classList.toggle("low", left < 5 * 60000);
        if (left === 0) grade({ confirmFirst: false });
      };
      update();
      if (!state.submitted) tick = setInterval(update, 1000);
    }

    document.getElementById("reset").addEventListener("click", () => {
      if (!confirm("Clear your answers and start again with a new shuffle?")) return;
      store.del(cfg.storageKey);
      if (cfg.onReset) cfg.onReset();
      location.reload();
    });
    submitBtn.addEventListener("click", () => grade({ confirmFirst: true }));

    function begin() {
      document.getElementById("start").innerHTML = "";
      render();
      updateProgress();
      if (state.submitted) grade({ confirmFirst: false });
      else if (cfg.timerMinutes) runTimer();
    }

    if (cfg.timerMinutes && !state.endsAt && !state.submitted) {
      submitBtn.disabled = true;
      progressEl.textContent = `${Q.length} questions · ${cfg.timerMinutes} minutes`;
      document.getElementById("start").innerHTML =
        `<div class="start">${cfg.intro || ""}<button type="button" id="go">Start the timer</button></div>`;
      document.getElementById("go").addEventListener("click", () => {
        state.endsAt = Date.now() + cfg.timerMinutes * 60000;
        save();
        submitBtn.disabled = false;
        begin();
      });
    } else {
      begin();
    }
  }

  window.Quiz = { mount };
})();
