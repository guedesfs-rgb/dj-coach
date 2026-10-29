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

const press = (id) => (ev) => !!ev && ev.kind === "press" && ev.id === id && !ev.shift;
const val = (id, test) => () => S[id] !== undefined && test(S[id]);
const all = (...conds) => (ev) => conds.every((c) => c(ev));

const LOW = (v) => v <= 12;
const HIGH = (v) => v >= 115;
const CENTER = (v) => v >= 54 && v <= 74;
const KILL = (v) => v <= 15;

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

  blend: {
    name: "2. Primeira transição (troca de grave)",
    intro: "Deixe uma música tocando no Deck A com o volume no topo. Vamos entrar com o Deck B. Ajuste o BPM aqui em cima para o BPM que o Serato mostra.",
    steps: [
      { t: "Carregue a próxima música no Deck B", h: "Gire o BROWSE para escolher e aperte LOAD B.", hl: ["browse", "load.B"], c: press("load.B") },
      { t: "Feche o VOLUME do Deck B", h: "Fader do B todo para baixo: o B vai entrar devagar.", hl: ["mixB.vol"], dir: "↓", c: val("mixB.vol", LOW) },
      { t: "GRAVE do B todo para a esquerda", h: "Dois graves juntos embolam o som. O B entra sem grave.", hl: ["mixB.bass"], dir: "↺", c: val("mixB.bass", KILL) },
      { t: "Aperte SYNC no Deck B", h: "O Serato iguala o BPM do B ao do A, e as batidas ficam alinhadas.", hl: ["B.sync"], c: press("B.sync") },
      { t: "Aperte PLAY no B no começo de uma frase do A", h: "Conte 1-2-3-4 junto com o bumbo do A. Quando entrar um trecho novo, aperte PLAY no \"1\". A partir daqui o app conta as batidas.", hl: ["B.play"], c: press("B.play"), start: true },
      { t: "Suba o VOLUME do B devagar", h: "16 batidas (4 compassos) até o topo. Siga a marca amarela na barra.", hl: ["mixB.vol"], dir: "↑", lane: "B", at: 0, len: 16, ramp: { id: "mixB.vol", from: 0, to: 127 }, c: val("mixB.vol", HIGH) },
      { t: "TROCA DE GRAVE: grave do A para a esquerda e grave do B para o centro", h: "Os dois juntos, no \"1\". Agora quem comanda o bumbo é o B.", hl: ["mixA.bass", "mixB.bass"], dir: "⇄", lane: "M", at: 16, len: 2, c: all(val("mixA.bass", KILL), val("mixB.bass", (v) => v >= 54)) },
      { t: "Feche o VOLUME do A devagar", h: "16 batidas até zerar. O A sai e o B fica sozinho.", hl: ["mixA.vol"], dir: "↓", lane: "A", at: 24, len: 16, ramp: { id: "mixA.vol", from: 127, to: 0 }, c: val("mixA.vol", LOW) },
      { t: "Volte o GRAVE do A para o centro", h: "Deixe o Deck A pronto para a próxima música.", hl: ["mixA.bass"], dir: "●", lane: "A", at: 42, len: 2, c: val("mixA.bass", CENTER) },
    ],
  },

  filtro: {
    name: "3. Saída com filtro",
    intro: "Uma saída mais rápida e dramática. Deck A tocando, volume no topo, filtro do A no centro.",
    steps: [
      { t: "Carregue a próxima música no Deck B", h: "BROWSE para escolher, LOAD B para carregar.", hl: ["browse", "load.B"], c: press("load.B") },
      { t: "Feche o VOLUME do Deck B", h: "Fader do B todo para baixo.", hl: ["mixB.vol"], dir: "↓", c: val("mixB.vol", LOW) },
      { t: "Aperte SYNC no Deck B", h: "Iguala o BPM do B ao do A.", hl: ["B.sync"], c: press("B.sync") },
      { t: "Aperte PLAY no B no começo de uma frase do A", h: "No \"1\" de um trecho novo. O app começa a contar.", hl: ["B.play"], c: press("B.play"), start: true },
      { t: "Suba o VOLUME do B", h: "8 batidas até o topo.", hl: ["mixB.vol"], dir: "↑", lane: "B", at: 0, len: 8, ramp: { id: "mixB.vol", from: 0, to: 127 }, c: val("mixB.vol", HIGH) },
      { t: "Gire o FILTRO do A para a esquerda, devagar", h: "O A vai ficando abafado, como se estivesse indo embora.", hl: ["mixA.filter"], dir: "↺", lane: "A", at: 8, len: 8, ramp: { id: "mixA.filter", from: 64, to: 10 }, c: val("mixA.filter", (v) => v <= 20) },
      { t: "CORTE: feche o VOLUME do A de uma vez", h: "No \"1\" do próximo compasso, fader do A para baixo rápido.", hl: ["mixA.vol"], dir: "↓", lane: "A", at: 16, len: 1, c: val("mixA.vol", LOW) },
      { t: "Volte o FILTRO do A para o centro", h: "Deixe o Deck A pronto para a próxima.", hl: ["mixA.filter"], dir: "●", lane: "A", at: 20, len: 2, c: val("mixA.filter", CENTER) },
    ],
  },

  livre: {
    name: "Modo livre (só o log)",
    intro: "Mixe à vontade. Tudo o que você fizer aparece no log ao lado.",
    steps: [],
  },
};
