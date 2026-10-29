// DJ Coach — controladora desenhada, log de ações, pista de batidas e motor de lições.

const $ = (s) => document.querySelector(s);
const S = {}; // valor atual de cada controle (0..127); undefined = ainda não lido

// ---------- Desenho da controladora ----------

const CTL = {};
const addCtl = (c) => (CTL[c.id] = c);

["A", "B"].forEach((D, d) => {
  const ox = d * 620;
  addCtl({ id: D + ".jog", type: "jog", x: ox + 190, y: 160, r: 100, label: "JOG " + D, deck: D });
  addCtl({ id: D + ".pitch", type: "vfader", x: ox + 355, y: 40, h: 200, label: "PITCH", deck: D });
  addCtl({ id: D + ".shift", type: "btn", x: ox + 40, y: 255, label: "SHIFT", deck: D });
  addCtl({ id: D + ".sync", type: "btn", x: ox + 40, y: 300, label: "SYNC", deck: D });
  addCtl({ id: D + ".cue", type: "btn", x: ox + 40, y: 345, label: "CUE", deck: D });
  addCtl({ id: D + ".play", type: "btn", x: ox + 40, y: 390, label: "▶ ❚❚", deck: D });
  ["HOT CUE", "AUTO LOOP", "FADER CUTS", "SAMPLE"].forEach((m, i) =>
    addCtl({ id: `${D}.mode${i}`, type: "btn", small: true, x: ox + 125 + i * 62, y: 293, w: 56, h: 20, label: m, deck: D })
  );
  for (let i = 0; i < 8; i++)
    addCtl({ id: `${D}.pad${i + 1}`, type: "pad", x: ox + 125 + (i % 4) * 62, y: i < 4 ? 335 : 385, label: String(i + 1), deck: D });
  const mx = d ? 560 : 440;
  [["gain", "GANHO", 38], ["treble", "AGUDO", 83], ["mid", "MÉDIO", 128], ["bass", "GRAVE", 173], ["filter", "FILTRO", 223]].forEach(
    ([k, l, y]) => addCtl({ id: `mix${D}.${k}`, type: "knob", x: mx, y, label: l, deck: D })
  );
  addCtl({ id: `mix${D}.pfl`, type: "btn", small: true, x: mx, y: 264, w: 40, h: 20, label: "🎧", deck: D });
  addCtl({ id: `mix${D}.vol`, type: "vfader", x: mx, y: 290, h: 95, label: "VOLUME", deck: D });
});
addCtl({ id: "browse", type: "enc", x: 500, y: 38, label: "BROWSE" });
addCtl({ id: "load.A", type: "btn", small: true, x: 500, y: 92, w: 52, h: 22, label: "LOAD A", deck: "A" });
addCtl({ id: "load.B", type: "btn", small: true, x: 500, y: 124, w: 52, h: 22, label: "LOAD B", deck: "B" });
addCtl({ id: "xfader", type: "hfader", x: 500, y: 418, w: 130, label: "CROSSFADER" });

const svg = $("#ctl");
const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs, parent = svg) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
}

const VIEW = {}; // id -> { g, update(v) }
const DEFAULT = { knob: 64, enc: 0, jog: 0, vfader: 0, hfader: 64 };

for (const c of Object.values(CTL)) {
  const g = el("g", { class: `ctl t-${c.type} ${c.deck ? "d" + c.deck : ""}`, "data-id": c.id });
  let update = () => {};
  if (c.type === "btn" || c.type === "pad") {
    const w = c.w || (c.type === "pad" ? 54 : 62);
    const h = c.h || (c.type === "pad" ? 42 : 34);
    el("rect", { x: c.x - w / 2, y: c.y - h / 2, width: w, height: h, rx: 6, class: "body" }, g);
    el("text", { x: c.x, y: c.y + 4, class: c.small ? "lbl sm" : "lbl" }, g).textContent = c.label;
    update = (v) => g.classList.toggle("on", v > 0);
  } else if (c.type === "knob" || c.type === "enc") {
    el("circle", { cx: c.x, cy: c.y, r: 17, class: "body" }, g);
    const ind = el("line", { x1: c.x, y1: c.y, x2: c.x, y2: c.y - 14, class: "ind" }, g);
    const side = c.deck === "A" ? -26 : c.deck === "B" ? 26 : 0;
    el("text", {
      x: c.x + side,
      y: side ? c.y + 4 : c.y + 32,
      class: "lbl sm",
      "text-anchor": side < 0 ? "end" : side > 0 ? "start" : "middle",
    }, g).textContent = c.label;
    update = (v) => {
      const a = c.type === "knob" ? (v / 127) * 270 - 135 : v * 8;
      ind.setAttribute("transform", `rotate(${a} ${c.x} ${c.y})`);
    };
  } else if (c.type === "vfader") {
    el("rect", { x: c.x - 4, y: c.y, width: 8, height: c.h, rx: 4, class: "track" }, g);
    el("rect", { x: c.x - 18, y: c.y - 6, width: 36, height: c.h + 12, class: "hit" }, g);
    const cap = el("rect", { x: c.x - 15, y: 0, width: 30, height: 12, rx: 3, class: "cap" }, g);
    el("text", { x: c.x, y: c.id.endsWith("pitch") ? c.y - 10 : c.y + c.h + 14, class: "lbl sm" }, g).textContent = c.label;
    update = (v) => cap.setAttribute("y", c.y + (1 - v / 127) * c.h - 6);
  } else if (c.type === "hfader") {
    el("rect", { x: c.x - c.w / 2, y: c.y - 4, width: c.w, height: 8, rx: 4, class: "track" }, g);
    el("rect", { x: c.x - c.w / 2 - 8, y: c.y - 14, width: c.w + 16, height: 28, class: "hit" }, g);
    const cap = el("rect", { x: 0, y: c.y - 12, width: 14, height: 24, rx: 3, class: "cap" }, g);
    el("text", { x: c.x, y: c.y + 26, class: "lbl sm" }, g).textContent = c.label;
    update = (v) => cap.setAttribute("x", c.x - c.w / 2 + (v / 127) * c.w - 7);
  } else if (c.type === "jog") {
    el("circle", { cx: c.x, cy: c.y, r: c.r, class: "body" }, g);
    el("circle", { cx: c.x, cy: c.y, r: c.r * 0.72, class: "ring" }, g);
    const mark = el("line", { x1: c.x, y1: c.y - c.r + 6, x2: c.x, y2: c.y - c.r * 0.74, class: "ind" }, g);
    el("text", { x: c.x, y: c.y + 4, class: "lbl" }, g).textContent = c.label;
    update = (v) => mark.setAttribute("transform", `rotate(${v * 3} ${c.x} ${c.y})`);
  }
  update(DEFAULT[c.type] ?? 0);
  VIEW[c.id] = { g, update };

  // Simulação com mouse: permite testar sem a controladora.
  g.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    g.setPointerCapture(e.pointerId);
    if (c.type === "btn" || c.type === "pad") return input({ id: c.id, kind: "press", v: 127, sim: 1 });
    let lx = e.clientX, ly = e.clientY;
    const move = (m) => {
      const dx = m.clientX - lx, dy = ly - m.clientY;
      if (c.type === "jog" || c.type === "enc") {
        const d = Math.round((dx + dy) / 4);
        if (d) { input({ id: c.id, kind: "rel", v: d, sim: 1 }); lx = m.clientX; ly = m.clientY; }
        return;
      }
      const delta = c.type === "hfader" ? dx : c.type === "vfader" ? (dy * 127) / c.h : dy;
      const step = Math.round(delta);
      if (!step) return;
      const cur = S[c.id] ?? DEFAULT[c.type];
      input({ id: c.id, kind: "abs", v: Math.max(0, Math.min(127, cur + step)), sim: 1 });
      lx = m.clientX; ly = m.clientY;
    };
    const up = () => { g.removeEventListener("pointermove", move); g.removeEventListener("pointerup", up); };
    g.addEventListener("pointermove", move);
    g.addEventListener("pointerup", up);
  });
  g.addEventListener("pointerup", () => {
    if (c.type === "btn" || c.type === "pad") input({ id: c.id, kind: "release", v: 0, sim: 1 });
  });
  g.addEventListener("wheel", (e) => {
    e.preventDefault();
    const d = e.deltaY < 0 ? 1 : -1;
    if (c.type === "jog" || c.type === "enc") return input({ id: c.id, kind: "rel", v: d, sim: 1 });
    if (c.type === "btn" || c.type === "pad") return;
    const cur = S[c.id] ?? DEFAULT[c.type];
    input({ id: c.id, kind: "abs", v: Math.max(0, Math.min(127, cur + d * 6)), sim: 1 });
  }, { passive: false });
}
const arrow = el("text", { class: "arrow", x: -100, y: -100 });

// Nomes e formatos para eventos que vêm do mouse (os da controladora já vêm do mapa MIDI).
const SIM_INFO = {};
for (const e of Object.values(MIDI_MAP)) if (!e.shift && !SIM_INFO[e.id]) SIM_INFO[e.id] = e;

// ---------- Log ----------

const logEl = $("#log");
let lastLog = null;

function fmtValue(fmt, v) {
  const d = Math.max(-100, Math.min(100, Math.round(((v - 64) / 63) * 100)));
  const near = Math.abs(d) <= 5;
  switch (fmt) {
    case "pct": return Math.round((v / 127) * 100) + "%";
    case "eq": return near ? "centro" : d < 0 ? `−${-d}%${v <= 15 ? " (cortado)" : ""}` : `+${d}%`;
    case "filter": return near ? "desligado" : d < 0 ? `abafado ${-d}%` : `só agudos ${d}%`;
    case "xf": return near ? "centro" : d < 0 ? `◀ lado A ${-d}%` : `lado B ${d}% ▶`;
    case "sw": return v > 0 ? "ligado" : "desligado";
    default: return String(v);
  }
}

function log(text, cls = "", key = null) {
  const now = Date.now();
  const time = new Date().toLocaleTimeString("pt-BR");
  if (key && lastLog && lastLog.key === key && now - lastLog.t < 1500) {
    lastLog.x.textContent = text;
    lastLog.tm.textContent = time;
    lastLog.t = now;
    return;
  }
  const row = document.createElement("div");
  row.className = "ev " + cls;
  const tm = document.createElement("span");
  tm.className = "tm";
  tm.textContent = time;
  const x = document.createElement("span");
  x.textContent = text;
  row.append(tm, x);
  logEl.prepend(row);
  while (logEl.children.length > 80) logEl.lastChild.remove();
  lastLog = { key, x, tm, t: now };
}

function logInput(ev) {
  const info = ev.name ? ev : SIM_INFO[ev.id];
  if (!info || info.quiet) return;
  const deck = /— Deck A|^mixA|^A\./.test(info.name + ev.id) ? "dA" : /— Deck B|^mixB|^B\./.test(info.name + ev.id) ? "dB" : "";
  if (ev.kind === "press") log("● " + info.name, deck);
  else if (ev.kind === "abs") log(`${info.name}: ${fmtValue(info.fmt, ev.v)}`, deck, ev.id);
  else if (ev.kind === "rel") {
    const sentido = ev.id === "browse" ? (ev.v > 0 ? "↓" : "↑") : ev.v > 0 ? "↻ para frente" : "↺ para trás";
    log(`${info.name} ${sentido}`, deck, ev.id + (ev.v > 0));
  }
}

// ---------- Entrada (controladora ou mouse) ----------

function input(ev) {
  if (ev.unknown) {
    if (ev.kind !== "release" && $("#raw").checked) log("MIDI " + ev.raw, "raw");
    return;
  }
  if (ev.kind === "abs") S[ev.id] = ev.v;
  else if (ev.kind === "rel") S[ev.id] = (S[ev.id] || 0) + ev.v;
  else if (ev.kind === "press") S[ev.id] = 127;
  else if (ev.kind === "release") S[ev.id] = 0;
  const view = VIEW[ev.id];
  if (view) {
    view.update(S[ev.id]);
    view.g.classList.add("flash");
    clearTimeout(view.flashT);
    view.flashT = setTimeout(() => view.g.classList.remove("flash"), 160);
  }
  logInput(ev);
  waitInput = false;
  evaluate(ev);
  window.dispatchEvent(new CustomEvent("dj-input", { detail: ev }));
}

// ---------- MIDI ----------

function setupMidi() {
  const status = $("#midi");
  if (!navigator.requestMIDIAccess) {
    status.textContent = "Navegador sem MIDI: use o Chrome";
    status.className = "pill bad";
    return;
  }
  navigator.requestMIDIAccess().then((access) => {
    const refresh = () => {
      const ins = [...access.inputs.values()];
      ins.forEach((i) => (i.onmidimessage = (e) => input(parseMidi(e.data))));
      const mix = ins.find((i) => /mixtrack/i.test(i.name));
      if (mix) { status.textContent = "Controladora: " + mix.name + " ✓"; status.className = "pill ok"; }
      else if (ins.length) { status.textContent = "MIDI: " + ins.map((i) => i.name).join(", "); status.className = "pill warn"; }
      else { status.textContent = "Controladora não encontrada: use o mouse no desenho"; status.className = "pill warn"; }
    };
    access.onstatechange = refresh;
    refresh();
  }, () => {
    status.textContent = "Permissão de MIDI negada";
    status.className = "pill bad";
  });
}

// ---------- Motor de lições ----------

let L = null, idx = 0, t0 = null;
let waitInput = false; // depois de voltar um passo, espera você mexer em algo antes de dar o passo como feito
const rampErr = {};

const bpm = () => Math.max(60, Math.min(200, +$("#bpm").value || 124));
const beatNow = () => (t0 == null ? null : ((performance.now() - t0) / 60000) * bpm());
const cur = () => (L ? L.steps[idx] : null);

function startLesson(key) {
  L = LESSONS[key];
  sel.value = key;
  idx = 0;
  t0 = null;
  for (const k in rampErr) delete rampErr[k];
  L.steps.forEach((s) => { s.state = null; s.grade = null; });
  waitInput = false;
  log("▶ Lição: " + L.name, "lesson");
  renderStep();
  evaluate(null);
}

// Volta ou avança para o passo i. Passos cronometrados ganham 4 batidas de contagem.
function goTo(i) {
  if (!L || !L.steps.length) return;
  idx = Math.max(0, Math.min(L.steps.length - 1, i));
  L.steps.forEach((s, j) => {
    if (j >= idx) { s.state = null; s.grade = null; delete rampErr[j]; }
  });
  const s = L.steps[idx];
  const startIdx = L.steps.findIndex((x) => x.start);
  if (startIdx >= 0 && idx <= startIdx) t0 = null;
  else if (s.at !== undefined) t0 = performance.now() - ((s.at - 4) * 60000) / bpm();
  waitInput = true;
  log(`↩ Passo ${idx + 1}: ${s.t}`, "lesson");
  renderStep();
}

function prevStep() {
  goTo(idx - 1);
}

function nextStep() {
  const s = cur();
  if (!s) return;
  if (idx + 1 >= L.steps.length) {
    s.state = "skip";
    s.grade = "pulado";
    idx++;
    renderStep();
    return;
  }
  goTo(idx + 1);
  L.steps[idx - 1].state = "skip";
  L.steps[idx - 1].grade = "pulado";
}

function evaluate(ev) {
  const s = cur();
  if (!s) return;
  if (waitInput && !ev) return;
  if (s.at !== undefined) {
    const b = beatNow();
    if (b == null || b < s.at - 4) return;
  }
  if (s.c(ev)) complete(s);
}

function complete(s) {
  let grade = "";
  const b = beatNow();
  if (s.start) {
    t0 = performance.now();
    grade = "relógio iniciado";
  } else if (s.at !== undefined) {
    if (s.ramp) {
      const e = rampErr[idx];
      const avg = e && e.n ? e.sum / e.n : 0;
      grade = b < s.at + s.len * 0.5 ? "rápido demais" : avg < 0.15 ? "suave 👌" : avg < 0.3 ? "ok" : "brusco";
    } else {
      const dt = b - s.at;
      grade = Math.abs(dt) <= 1 ? "no tempo 🎯" : dt < 0 ? "adiantado" : "atrasado";
    }
  }
  s.state = "done";
  s.grade = grade;
  log(`✓ ${s.t}${grade ? " — " + grade : ""}`, "ok");
  idx++;
  renderStep();
  evaluate(null);
}

function renderStep() {
  window.dispatchEvent(new CustomEvent("dj-step", { detail: cur() }));
  document.querySelectorAll(".ctl.hl").forEach((g) => g.classList.remove("hl"));
  arrow.setAttribute("x", -100);
  const s = cur();
  $("#lessonName").textContent = L ? L.name : "";
  if (!L) return;
  if (!s) {
    if (!L.steps.length) {
      $("#stepNo").textContent = "Modo livre";
      $("#stepText").textContent = "Mixe à vontade";
      $("#stepHint").textContent = L.intro;
    } else {
      const done = L.steps.filter((x) => x.state === "done").length;
      $("#stepNo").textContent = "Lição concluída 🎉";
      $("#stepText").textContent = `${done} de ${L.steps.length} passos`;
      $("#stepHint").innerHTML = L.steps
        .filter((x) => x.at !== undefined)
        .map((x) => `<div>${x.state === "done" ? "✓" : "✗"} ${x.t}: <b>${x.grade}</b></div>`)
        .join("");
    }
    return;
  }
  $("#stepNo").textContent = `Passo ${idx + 1} de ${L.steps.length}`;
  $("#stepText").textContent = s.t;
  $("#stepHint").textContent = idx === 0 && L.intro ? L.intro + " " + s.h : s.h;
  s.hl.forEach((id) => VIEW[id] && VIEW[id].g.classList.add("hl"));
  const first = CTL[s.hl[s.hl.length - 1]];
  if (first && s.dir) {
    const dx = first.deck === "B" ? 40 : -40;
    arrow.setAttribute("x", first.x + (first.type === "jog" ? 0 : dx));
    arrow.setAttribute("y", first.y + 8);
    arrow.textContent = s.dir;
  }
}

// ---------- Pista (estilo Guitar Hero) ----------

const cv = $("#lane");
const cx = cv.getContext("2d");
const LANES = { A: 0, M: 1, B: 2 };
const COLORS = { A: "#38bdf8", M: "#a3e635", B: "#f472b6" };

function drawLane(b) {
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth, H = cv.clientHeight;
  if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.clearRect(0, 0, W, H);
  const lw = W / 3, hitY = H - 44, ppb = 14;
  const beat = b ?? -6;

  for (let i = 0; i < 3; i++) {
    cx.fillStyle = i % 2 ? "#12161d" : "#151a23";
    cx.fillRect(i * lw, 0, lw, H);
  }
  for (let k = Math.floor(beat); k < beat + hitY / ppb + 1; k++) {
    const y = hitY - (k - beat) * ppb;
    if (y < 0) break;
    cx.fillStyle = k % 16 === 0 ? "#4b5568" : k % 4 === 0 ? "#2c3442" : "#1d232d";
    cx.fillRect(0, y, W, k % 4 === 0 ? 2 : 1);
  }

  if (L) {
    L.steps.forEach((s, i) => {
      if (s.at === undefined) return;
      const x0 = LANES[s.lane] * lw;
      const yb = hitY - (s.at - beat) * ppb;
      const h = Math.max(s.len, 1.2) * ppb;
      if (yb < -10 || yb - h > H) return;
      const col = s.state === "done" ? "#4ade80" : s.state === "miss" ? "#f87171" : COLORS[s.lane];
      cx.globalAlpha = s.state ? 0.35 : i === idx ? 1 : 0.75;
      cx.fillStyle = col;
      if (s.ramp) {
        const wf = (v) => lw * (0.2 + (0.7 * v) / 127);
        const wb = wf(s.ramp.from), wt = wf(s.ramp.to), mid = x0 + lw / 2;
        cx.beginPath();
        cx.moveTo(mid - wb / 2, yb); cx.lineTo(mid + wb / 2, yb);
        cx.lineTo(mid + wt / 2, yb - h); cx.lineTo(mid - wt / 2, yb - h);
        cx.closePath(); cx.fill();
      } else {
        cx.beginPath();
        cx.roundRect(x0 + 8, yb - h, lw - 16, h, 6);
        cx.fill();
      }
      cx.globalAlpha = 1;
      cx.fillStyle = "#0d0f14";
      cx.font = "600 11px system-ui";
      cx.textAlign = "center";
      const short = s.dir ? s.dir + " " + (s.hl.length > 1 ? "EQ" : (CTL[s.hl[0]]?.label || "")) : "";
      cx.fillText(short, x0 + lw / 2, yb - Math.min(h / 2, 30) + 4);
    });
  }

  cx.fillStyle = "#fde047";
  cx.fillRect(0, hitY, W, 3);
  cx.fillStyle = "#8a93a6";
  cx.font = "600 11px system-ui";
  cx.textAlign = "center";
  ["DECK A", "MIXER", "DECK B"].forEach((t, i) => cx.fillText(t, i * lw + lw / 2, H - 16));
  if (b == null && L && L.steps.some((s) => s.at !== undefined)) {
    cx.fillStyle = "#cbd2e0";
    cx.fillText("A pista começa quando você der PLAY no Deck B", W / 2, 22);
  }
}

// ---------- Loop principal ----------

function tick() {
  const b = beatNow();
  const s = cur();
  if (s && s.at !== undefined && b != null) {
    if (s.ramp && b >= s.at && b <= s.at + s.len && S[s.ramp.id] !== undefined) {
      const p = (b - s.at) / s.len;
      const expected = s.ramp.from + (s.ramp.to - s.ramp.from) * p;
      const e = (rampErr[idx] ||= { sum: 0, n: 0 });
      e.sum += Math.abs(S[s.ramp.id] - expected) / 127;
      e.n++;
    }
    if (b > s.at + s.len + 6) {
      s.state = "miss";
      s.grade = "perdeu";
      log(`✗ ${s.t} — passou do tempo`, "miss");
      idx++;
      renderStep();
    } else {
      evaluate(null);
    }
  }

  // Cartão: contagem, barra de progresso e batidas
  const meta = $("#stepMeta");
  const s2 = cur();
  if (s2 && s2.at !== undefined && b != null) {
    const d = s2.at - b;
    if (d > 0) meta.innerHTML = `<span class="count">em ${Math.ceil(d)}</span> batida${Math.ceil(d) > 1 ? "s" : ""}`;
    else if (s2.ramp) {
      const p = Math.min(1, Math.max(0, (b - s2.at) / s2.len));
      const exp = s2.ramp.from + (s2.ramp.to - s2.ramp.from) * p;
      const v = S[s2.ramp.id] ?? 0;
      meta.innerHTML = `<div class="bar"><div class="fill" style="width:${(v / 127) * 100}%"></div><div class="target" style="left:${(exp / 127) * 100}%"></div></div>`;
    } else meta.innerHTML = `<span class="count now">AGORA!</span>`;
  } else if (s2 && s2.hl.some((id) => CTL[id] && /knob|fader/.test(CTL[id].type) && S[id] === undefined)) {
    meta.textContent = "Dica: mexa um pouco o controle para o app ler a posição dele.";
  } else meta.textContent = "";

  const dots = document.querySelectorAll(".beat i");
  const active = b == null ? -1 : Math.floor(b) % 4;
  dots.forEach((dot, i) => dot.classList.toggle("on", i === active));
  $("#bar").textContent = b == null ? "" : `compasso ${Math.floor(b / 4) + 1}`;

  drawLane(b);
  requestAnimationFrame(tick);
}

// ---------- Início ----------

const sel = $("#lesson");
for (const [k, l] of Object.entries(LESSONS)) sel.add(new Option(l.name, k));
$("#start").onclick = () => startLesson(sel.value);
$("#clear").onclick = () => { logEl.innerHTML = ""; lastLog = null; };
$("#compact").onclick = () => document.body.classList.toggle("compact");
$("#prev").onclick = prevStep;
$("#next").onclick = nextStep;
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
  if (e.key === "ArrowLeft") prevStep();
  if (e.key === "ArrowRight") nextStep();
});

setupMidi();
startLesson("tour");
requestAnimationFrame(tick);
