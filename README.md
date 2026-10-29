# 🎧 DJ Coach

Um treinador de mixagem estilo *Guitar Hero* para a **Numark Mixtrack Pro FX** + **Serato DJ**.

- **Pista de batidas:** os próximos movimentos descem pela pista e você faz o movimento quando chegam na linha amarela.
- **Controladora na tela:** o controle que você precisa mexer pisca, com uma seta indicando a direção.
- **Log de ações** (canto superior direito): tudo o que você faz na controladora aparece em português ("Grave — Deck A: −100% (cortado)").
- **Nota em cada passo:** "no tempo 🎯", "suave 👌", "rápido demais", "atrasado"…

## Como usar (Mac)

1. Ligue a Mixtrack Pro FX no USB e abra o Serato normalmente.
2. Abra o `index.html` no **Google Chrome** e aceite a permissão de MIDI.
3. O selo no topo deve ficar verde: "Controladora: Mixtrack Pro FX ✓".
4. Escolha a lição, digite o BPM que o Serato mostra e clique em **Começar**.

Sem a controladora, dá para testar clicando e arrastando nos controles do desenho.

> No macOS o Serato e o DJ Coach escutam a controladora ao mesmo tempo, sem conflito.

## Lições

1. **Conhecendo a controladora:** play, volume, crossfader, grave, filtro, load e pré-escuta.
2. **Primeira transição (troca de grave):** entrada do Deck B em 16 batidas, troca de grave e saída do Deck A.
3. **Saída com filtro:** filtro abafando o Deck A e corte seco no compasso.
4. **Modo livre:** só o log.

## Como funciona

O app escuta as mensagens MIDI da controladora (Web MIDI) e traduz cada uma usando o mapa em
`src/mixtrack-pro-fx.js` (baseado no mapeamento oficial do Mixxx). O Serato não expõe o BPM nem
a posição da música, então o relógio de batidas começa quando você aperta PLAY no Deck B,
usando o BPM informado.

| Arquivo | O que faz |
| --- | --- |
| `src/mixtrack-pro-fx.js` | Mapa MIDI da controladora |
| `src/lessons.js` | Lições e passos (fácil de criar novas) |
| `src/app.js` | Desenho da controladora, log, pista e motor de lições |

## Próximos passos

- Overlay transparente por cima do Serato (Electron).
- Integração com o Mixxx para ler BPM e posição da música automaticamente.
