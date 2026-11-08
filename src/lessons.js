// Lições guiadas.
// Cada passo:
//   t     texto principal (o que fazer)
//   h     dica (por quê / como)
//   hl    controles para destacar no desenho da controladora
//   dir   seta de direção mostrada junto ao controle
//   c     condição: função (evento) => true quando o passo foi cumprido
//   start inicia o relógio de batidas (batida 0 = momento em que o passo é cumprido)
//   at/len  passo cronometrado: começa na batida `at` e dura `len` batidas
//   ramp  movimento gradual: o valor deve ir de `from` a `to` durante `len` batidas
//   lane  coluna da pista: 'A', 'M' (mixer) ou 'B'
// Lições com build(OUT, IN) são montadas para o deck que está tocando (OUT) e o que entra (IN).

const press = (id) => (ev) => !!ev && ev.kind === "press" && ev.id === id && !ev.shift;
const val = (id, test) => () => S[id] !== undefined && test(S[id]);
const all = (...conds) => (ev) => conds.every((c) => c(ev));

const LOW = (v) => v <= 12;
const HIGH = (v) => v >= 115;
const CENTER = (v) => v >= 54 && v <= 74;
const KILL = (v) => v <= 15;

// Passos comuns das transições.
const loadStep = (IN) => ({
  t: `Carregue a próxima música no Deck ${IN}`,
  h: `Gire o BROWSE para escolher e aperte LOAD ${IN}. Se ela já está carregada e parada, aperte ▶ para pular este passo.`,
  hl: ["browse", `load.${IN}`],
  c: press(`load.${IN}`),
});

// Onde começar a música nova: no primeiro bumbo, salvo num HOT CUE.
// Onde começar a música nova: no primeiro bumbo. Opcional (▶ pula).
const cueStep = (IN) => ({
  t: `Opcional: deixe o ${IN} no primeiro bumbo`,
  h: `Com o ${IN} parado, gire o JOG até a linha do Serato chegar no primeiro bumbo da música e aperte CUE para marcar. Se a música já está no começo, aperte ▶ aqui no DJ Coach para pular.`,
  hl: [`${IN}.jog`, `${IN}.cue`],
  c: (ev) => press(`${IN}.cue`)(ev) || press(`${IN}.pad1`)(ev),
});

const playStep = (OUT, IN) => ({
  t: `Aperte PLAY no ${IN} no começo de uma frase do ${OUT}`,
  h: `O melhor momento é quando o ${OUT} começa a "esvaziar" (o final, chamado de outro) ou entra num trecho novo. Conte 1-2-3-4 junto com o bumbo e aperte PLAY no "1". A partir daqui o app conta as batidas.`,
  hl: [`${IN}.play`],
  c: (ev) => press(`${IN}.play`)(ev) || press(`${IN}.pad1`)(ev),
  start: true,
});

const LESSONS = {
  tour: {
    name: "1. Conhecendo a controladora",
    intro: "Sem pressa: cada passo espera você. Carregue qualquer música no Deck A do Serato.",
    steps: [
      { t: "Aperte PLAY no Deck A", h: "O botão ▶❚❚ no canto de baixo do deck esquerdo. A música começa a tocar.", hl: ["A.play"], c: press("A.play") },
      { t: "Suba o VOLUME do Deck A até o topo", h: "O fader vertical do canal A, no mixer do meio. É ele que deixa o público ouvir o Deck A.", hl: ["mixA.vol"], dir: "↑", c: val("mixA.vol", HIGH) },
      { t: "Coloque o CROSSFADER no centro", h: "O fader horizontal embaixo do mixer. No centro, os dois decks saem juntos.", hl: ["xfader"], dir: "●", c: val("xfader", CENTER) },
      { t: "Gire o GRAVE do A todo para a esquerda", h: "Escute: o bumbo e o baixo somem. Isso é \"cortar o grave\", o truque mais usado em mixagem.", hl: ["mixA.bass"], dir: "↺", c: val("mixA.bass", KILL) },
      { t: "Volte o GRAVE do A para o centro", h: "Centro é o som original. É a posição de descanso dos EQs.", hl: ["mixA.bass"], dir: "●", c: val("mixA.bass", CENTER) },
      { t: "Gire o FILTRO do A para a esquerda", h: "O som fica abafado, como a música da festa do vizinho. Ótimo para saídas.", hl: ["mixA.filter"], dir: "↺", c: val("mixA.filter", (v) => v <= 30) },
      { t: "Agora gire o FILTRO do A para a direita", h: "Só sobram os agudos. Bom para criar tensão antes de uma entrada.", hl: ["mixA.filter"], dir: "↻", c: val("mixA.filter", (v) => v >= 98) },
      { t: "Volte o FILTRO do A para o centro", h: "No centro o filtro fica desligado.", hl: ["mixA.filter"], dir: "●", c: val("mixA.filter", CENTER) },
      { t: "Escolha uma música e aperte LOAD B", h: "Gire o BROWSE para navegar na lista do Serato. LOAD B joga a música escolhida no Deck B.", hl: ["browse", "load.B"], c: press("load.B") },
      { t: "Aperte o fone 🎧 do Deck B", h: "Assim você ouve o B só no fone, sem o público ouvir. É a pré-escuta da próxima música.", hl: ["mixB.pfl"], c: press("mixB.pfl") },
    ],
  },

  // Transições: montadas na hora para o deck que está tocando (OUT) e o que vai entrar (IN).
  blend: {
    name: "2. Primeira transição (troca de grave)",
    intro: (OUT, IN) => `Deck ${OUT} tocando com o volume no topo: vamos entrar com o Deck ${IN}. Ajuste o BPM aqui em cima para o BPM que o Serato mostra.`,
    build: (OUT, IN) => [
      loadStep(IN),
      { t: `Feche o VOLUME do Deck ${IN}`, h: `Fader do ${IN} todo para baixo: ele vai entrar devagar.`, hl: [`mix${IN}.vol`], dir: "↓", c: val(`mix${IN}.vol`, LOW) },
      { t: `GRAVE do ${IN} todo para a esquerda`, h: "Dois graves juntos embolam o som. A música nova entra sem grave.", hl: [`mix${IN}.bass`], dir: "↺", c: val(`mix${IN}.bass`, KILL) },
      { t: `Aperte SYNC no Deck ${IN}`, h: `O Serato iguala o BPM do ${IN} ao do ${OUT}, e as batidas ficam alinhadas.`, hl: [`${IN}.sync`], c: press(`${IN}.sync`) },
      cueStep(IN),
      playStep(OUT, IN),
      { t: `Suba o VOLUME do ${IN} devagar`, h: "16 batidas (4 compassos) até o topo. Siga a marca amarela na barra.", hl: [`mix${IN}.vol`], dir: "↑", lane: IN, at: 0, len: 16, ramp: { id: `mix${IN}.vol`, from: 0, to: 127 }, c: val(`mix${IN}.vol`, HIGH) },
      { t: `TROCA DE GRAVE: grave do ${OUT} para a esquerda e grave do ${IN} para o centro`, h: `Os dois juntos, no "1". Agora quem comanda o bumbo é o ${IN}.`, hl: [`mix${OUT}.bass`, `mix${IN}.bass`], dir: "⇄", lane: "M", at: 16, len: 2, c: all(val(`mix${OUT}.bass`, KILL), val(`mix${IN}.bass`, (v) => v >= 54)) },
      { t: `Feche o VOLUME do ${OUT} devagar`, h: `16 batidas até zerar. O ${OUT} sai e o ${IN} fica sozinho.`, hl: [`mix${OUT}.vol`], dir: "↓", lane: OUT, at: 24, len: 16, ramp: { id: `mix${OUT}.vol`, from: 127, to: 0 }, c: val(`mix${OUT}.vol`, LOW) },
      { t: `Volte o GRAVE do ${OUT} para o centro`, h: `Deixe o Deck ${OUT} pronto para a próxima música.`, hl: [`mix${OUT}.bass`], dir: "●", lane: OUT, at: 42, len: 2, c: val(`mix${OUT}.bass`, CENTER) },
    ],
  },

  filtro: {
    name: "3. Saída com filtro",
    intro: (OUT, IN) => `Uma saída mais rápida e dramática. Deck ${OUT} tocando, volume no topo, filtro do ${OUT} no centro.`,
    build: (OUT, IN) => [
      loadStep(IN),
      { t: `Feche o VOLUME do Deck ${IN}`, h: `Fader do ${IN} todo para baixo.`, hl: [`mix${IN}.vol`], dir: "↓", c: val(`mix${IN}.vol`, LOW) },
      { t: `Aperte SYNC no Deck ${IN}`, h: `Iguala o BPM do ${IN} ao do ${OUT}.`, hl: [`${IN}.sync`], c: press(`${IN}.sync`) },
      cueStep(IN),
      playStep(OUT, IN),
      { t: `Suba o VOLUME do ${IN}`, h: "8 batidas até o topo.", hl: [`mix${IN}.vol`], dir: "↑", lane: IN, at: 0, len: 8, ramp: { id: `mix${IN}.vol`, from: 0, to: 127 }, c: val(`mix${IN}.vol`, HIGH) },
      { t: `Gire o FILTRO do ${OUT} para a esquerda, devagar`, h: `O ${OUT} vai ficando abafado, como se estivesse indo embora.`, hl: [`mix${OUT}.filter`], dir: "↺", lane: OUT, at: 8, len: 8, ramp: { id: `mix${OUT}.filter`, from: 64, to: 10 }, c: val(`mix${OUT}.filter`, (v) => v <= 20) },
      { t: `CORTE: feche o VOLUME do ${OUT} de uma vez`, h: `No "1" do próximo compasso, fader do ${OUT} para baixo rápido.`, hl: [`mix${OUT}.vol`], dir: "↓", lane: OUT, at: 16, len: 1, c: val(`mix${OUT}.vol`, LOW) },
      { t: `Volte o FILTRO do ${OUT} para o centro`, h: `Deixe o Deck ${OUT} pronto para a próxima.`, hl: [`mix${OUT}.filter`], dir: "●", lane: OUT, at: 20, len: 2, c: val(`mix${OUT}.filter`, CENTER) },
    ],
  },

  livre: {
    name: "Modo livre (com dicas)",
    intro: "Mixe à vontade. Tudo o que você fizer aparece no log, e as dicas aparecem aqui quando algo merecer atenção.",
    steps: [],
  },
};
