// Dicas do modo livre: olham o estado da controladora e avisam na hora.
// Cada dica:
//   when()  condição que dispara a dica
//   hold    segundos que a condição precisa durar antes de avisar
//   text()  o aviso; hint() o porquê; hl() controles para destacar

const vol = (D) => S[`mix${D}.vol`] ?? 0;
const eq = (D, k) => S[`mix${D}.${k}`] ?? 64;
const other = (D) => (D === "A" ? "B" : "A");
// O deck está saindo no som: volume aberto e crossfader não fechado para o outro lado.
const audible = (D) => {
  const xf = S.xfader ?? 64;
  return vol(D) > 20 && (D === "A" ? xf < 120 : xf > 7);
};

// SYNC desde que a música foi carregada (true até alguém carregar algo pela controladora).
const synced = { A: true, B: true };
window.addEventListener("dj-input", (e) => {
  const ev = e.detail;
  if (ev.kind !== "press" || ev.shift) return;
  if (ev.id === "load.A" || ev.id === "load.B") synced[ev.id.slice(-1)] = false;
  if (ev.id === "A.sync" || ev.id === "B.sync") synced[ev.id[0]] = true;
});

const TIPS = [];
["A", "B"].forEach((D) => {
  const O = other(D);
  TIPS.push(
    {
      id: "sync" + D,
      hold: 0.3,
      when: () => !synced[D] && audible(D) && audible(O),
      text: () => `Aperte SYNC no Deck ${D}`,
      hint: () => `Você está entrando com o ${D} sem SYNC. As batidas dos dois decks vão "galopar" uma contra a outra.`,
      hl: () => [`${D}.sync`],
    },
    {
      id: "filter" + D,
      hold: 15,
      when: () => audible(D) && Math.abs(eq(D, "filter") - 64) > 12,
      text: () => `O FILTRO do ${D} continua ligado`,
      hint: () => "Se não for um efeito proposital, volte o filtro para o centro.",
      hl: () => [`mix${D}.filter`],
    },
    {
      id: "kill" + D,
      hold: 10,
      when: () => audible(D) && !audible(O) && eq(D, "bass") <= 20,
      text: () => `O GRAVE do ${D} está cortado`,
      hint: () => `O ${D} está tocando sozinho sem grave. Volte o grave para o centro.`,
      hl: () => [`mix${D}.bass`],
    },
    {
      id: "xf" + D,
      hold: 2,
      when: () => vol(D) > 60 && !audible(D) && vol(O) > 20,
      text: () => `O CROSSFADER está fechando o Deck ${D}`,
      hint: () => `O volume do ${D} está aberto, mas o crossfader está todo para o lado do ${O}. Leve o crossfader para o centro.`,
      hl: () => ["xfader"],
    }
  );
});
TIPS.push(
  {
    id: "bass",
    hold: 1.5,
    when: () => audible("A") && audible("B") && eq("A", "bass") >= 45 && eq("B", "bass") >= 45,
    text: () => "Os dois GRAVES estão abertos",
    // destaca o grave de quem está entrando (o deck mais baixo)
    hint: () => `Dois bumbos juntos embolam o som. Corte o grave do ${vol("A") < vol("B") ? "A" : "B"}, ou faça a troca de grave.`,
    hl: () => [vol("A") < vol("B") ? "mixA.bass" : "mixB.bass"],
  },
  {
    id: "both",
    hold: 30,
    when: () => vol("A") >= 115 && vol("B") >= 115 && audible("A") && audible("B"),
    text: () => "Hora de tirar um dos decks",
    hint: () => "Os dois estão no máximo há um tempo. Feche aos poucos o volume da música que está saindo.",
    hl: () => ["mixA.vol", "mixB.vol"],
  }
);

const since = {}; // id -> quando a condição ficou verdadeira
const lastShown = {}; // id -> quando a dica apareceu pela última vez
let shownTip = null;

function tipsTick() {
  if (!L || L.steps.length) {
    shownTip = null;
    return;
  }
  const now = performance.now() / 1000;
  let active = null;
  for (const t of TIPS) {
    if (!t.when()) { delete since[t.id]; continue; }
    since[t.id] ??= now;
    if (!active && now - since[t.id] >= t.hold) active = t;
  }
  if (active === shownTip) return;
  document.querySelectorAll(".ctl.hl").forEach((g) => g.classList.remove("hl"));
  shownTip = active;
  if (!active) {
    $("#stepNo").textContent = "Modo livre";
    $("#stepText").textContent = "Mixe à vontade";
    $("#stepHint").textContent = L.intro;
    return;
  }
  $("#stepNo").textContent = "💡 Dica";
  $("#stepText").textContent = active.text();
  $("#stepHint").textContent = active.hint();
  active.hl().forEach((id) => VIEW[id] && VIEW[id].g.classList.add("hl"));
  // Não repete no log a mesma dica em menos de 20 s.
  if (!lastShown[active.id] || now - lastShown[active.id] > 20) log("💡 " + active.text(), "lesson");
  lastShown[active.id] = now;
}
