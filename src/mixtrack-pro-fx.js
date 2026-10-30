// Mapa MIDI da Numark Mixtrack Pro FX.
// Fonte: mapeamento oficial do Mixxx (res/controllers/Numark Mixtrack Pro FX.midi.xml).
// Cada entrada: status (com canal) + data1 -> controle do app.
//   kind: 'btn' (nota on/off), 'abs' (CC 0..127), 'rel' (CC relativo, jog/browse)
//   fmt:  como mostrar o valor no log ('pct', 'eq', 'filter', 'xf', 'sw')

const hx = (n) => n.toString(16).toUpperCase().padStart(2, "0");

const MIDI_MAP = {};

function m(status, data1, id, name, kind, extra = {}) {
  MIDI_MAP[hx(status) + hx(data1)] = { id, name, kind, ...extra };
}

["A", "B"].forEach((D, d) => {
  const NOTE = 0x90 + d; // botões do deck
  const PADS = 0x94 + d; // pads, modos e loops
  const CC = 0xb0 + d; // knobs e faders
  const FX = 0x98 + d;
  const deck = " — Deck " + D;

  m(NOTE, 0x00, D + ".play", "PLAY/PAUSE" + deck, "btn");
  m(NOTE, 0x04, D + ".play", "PLAY + SHIFT" + deck, "btn", { shift: 1 });
  m(NOTE, 0x01, D + ".cue", "CUE" + deck, "btn");
  m(NOTE, 0x05, D + ".cue", "CUE + SHIFT" + deck, "btn", { shift: 1 });
  m(NOTE, 0x02, D + ".sync", "SYNC" + deck, "btn");
  m(NOTE, 0x03, D + ".sync", "SYNC + SHIFT" + deck, "btn", { shift: 1 });
  m(NOTE, 0x20, D + ".shift", "SHIFT" + deck, "btn", { quiet: 1 });
  m(NOTE, 0x07, D + ".scratch", "Scratch" + deck, "btn");
  m(NOTE, 0x08, D + ".scratch", "Scratch + SHIFT" + deck, "btn", { shift: 1 });
  m(NOTE, 0x1b, `mix${D}.pfl`, "Fone (pré-escuta)" + deck, "btn");
  m(NOTE, 0x0b, D + ".bendup", "Pitch Bend +" + deck, "btn");
  m(NOTE, 0x2b, D + ".bendup", "Pitch Bend + (SHIFT)" + deck, "btn", { shift: 1 });
  m(NOTE, 0x0c, D + ".benddn", "Pitch Bend −" + deck, "btn");
  m(NOTE, 0x2c, D + ".benddn", "Pitch Bend − (SHIFT)" + deck, "btn", { shift: 1 });
  m(NOTE, 0x06, D + ".jog", "Jog tocado" + deck, "btn", { quiet: 1 });

  [
    [0x00, "Hot Cue"],
    [0x0d, "Auto Loop"],
    [0x07, "Fader Cuts"],
    [0x0b, "Sample"],
  ].forEach(([n, t], i) => m(PADS, n, `${D}.mode${i}`, `Modo ${t}` + deck, "btn"));
  m(PADS, 0x02, `${D}.mode0`, "Modo de pad + SHIFT" + deck, "btn", { shift: 1 });
  m(PADS, 0x0f, `${D}.mode3`, "Modo de pad + SHIFT" + deck, "btn", { shift: 1 });
  for (let i = 0; i < 8; i++) {
    m(PADS, 0x14 + i, `${D}.pad${i + 1}`, `Pad ${i + 1}` + deck, "btn");
    m(PADS, 0x1c + i, `${D}.pad${i + 1}`, `Pad ${i + 1} + SHIFT` + deck, "btn", { shift: 1 });
  }
  m(PADS, 0x40, D + ".loop", "LOOP" + deck, "btn");
  m(PADS, 0x41, D + ".loop", "LOOP + SHIFT" + deck, "btn", { shift: 1 });
  m(PADS, 0x34, D + ".loophalf", "Loop ÷2" + deck, "btn");
  m(PADS, 0x36, D + ".loophalf", "Loop ÷2 + SHIFT" + deck, "btn", { shift: 1 });
  m(PADS, 0x35, D + ".loopdbl", "Loop ×2" + deck, "btn");
  m(PADS, 0x37, D + ".loopdbl", "Loop ×2 + SHIFT" + deck, "btn", { shift: 1 });

  m(CC, 0x16, `mix${D}.gain`, "Ganho" + deck, "abs", { fmt: "eq" });
  m(CC, 0x17, `mix${D}.treble`, "Agudo" + deck, "abs", { fmt: "eq" });
  m(CC, 0x18, `mix${D}.mid`, "Médio" + deck, "abs", { fmt: "eq" });
  m(CC, 0x19, `mix${D}.bass`, "Grave" + deck, "abs", { fmt: "eq" });
  m(CC, 0x1a, `mix${D}.filter`, "Filtro" + deck, "abs", { fmt: "filter" });
  m(CC, 0x1c, `mix${D}.vol`, "Volume" + deck, "abs", { fmt: "pct" });
  m(CC, 0x09, D + ".pitch", "Pitch" + deck, "abs", { fmt: "eq" });
  m(CC, 0x06, D + ".jog", "Jog" + deck, "rel");

  m(FX, 0x09, D + ".tap", "TAP" + deck, "btn");
});

m(0xbf, 0x08, "xfader", "Crossfader", "abs", { fmt: "xf" });
m(0xb1, 0x08, "xfader", "Crossfader", "abs", { fmt: "xf" });
m(0xbf, 0x00, "browse", "Navegando na biblioteca", "rel");
m(0xbf, 0x01, "browse", "Navegando na biblioteca (SHIFT)", "rel", { shift: 1 });
m(0x9f, 0x02, "load.A", "LOAD → Deck A", "btn");
m(0x9f, 0x03, "load.B", "LOAD → Deck B", "btn");
m(0x9f, 0x07, "browse.press", "BROWSE apertado", "btn");
m(0x9f, 0x06, "browse.press", "BROWSE + SHIFT", "btn", { shift: 1 });
m(0xbe, 0x23, "master", "Volume master", "abs", { fmt: "pct" });
m(0xbe, 0x2f, "cuegain", "Volume do fone", "abs", { fmt: "pct" });
m(0xbe, 0x27, "cuemix", "Mix do fone (cue ↔ master)", "abs", { fmt: "pct" });
m(0xb8, 0x04, "fx.wet", "Efeito: intensidade", "abs", { fmt: "pct" });
m(0xb8, 0x05, "fx.beats", "Efeito: batidas", "abs", { fmt: "pct" });
m(0xb8, 0x03, "fx.A", "Alavanca de efeito — Deck A", "abs", { fmt: "sw" });
m(0xb9, 0x03, "fx.B", "Alavanca de efeito — Deck B", "abs", { fmt: "sw" });
[
  [0x98, 0x00],
  [0x98, 0x01],
  [0x98, 0x02],
  [0x99, 0x03],
  [0x99, 0x04],
  [0x99, 0x05],
].forEach(([s, n]) => m(s, n, "fx.select", "Botão de efeito", "btn"));

// Converte uma mensagem MIDI crua em um evento do app (ou null se desconhecida).
function parseMidi([status, data1, data2]) {
  const type = status & 0xf0;
  const ch = status & 0x0f;
  let kind;
  let key;
  if (type === 0x80 || (type === 0x90 && data2 === 0)) {
    kind = "release";
    key = hx(0x90 | ch) + hx(data1);
  } else if (type === 0x90) {
    kind = "press";
    key = hx(status) + hx(data1);
  } else if (type === 0xb0) {
    key = hx(status) + hx(data1);
  } else {
    return null;
  }
  const e = MIDI_MAP[key];
  if (!e) return { unknown: true, raw: `${hx(status)} ${hx(data1)} ${data2}`, kind };
  if (e.kind === "abs") return { ...e, kind: "abs", v: data2 };
  if (e.kind === "rel") return { ...e, kind: "rel", v: data2 < 64 ? data2 : data2 - 128 };
  return { ...e, kind, v: kind === "press" ? 127 : 0 };
}
