# 🎧 DJ Coach

Um treinador de mixagem estilo *Guitar Hero* para a **Numark Mixtrack Pro FX** + **Serato DJ**.

- **Pista de batidas:** os próximos movimentos descem pela pista e você faz o movimento quando chegam na linha amarela.
- **Controladora na tela:** o controle que você precisa mexer pisca, com uma seta indicando a direção.
- **Log de ações** (canto superior direito): tudo o que você faz na controladora aparece em português ("Grave — Deck A: −100% (cortado)").
- **Nota em cada passo:** "no tempo 🎯", "suave 👌", "rápido demais", "atrasado"…

## App de Mac (overlay por cima do Serato)

O DJ Coach abre como uma camada transparente, sempre por cima do Serato:

- **Canto superior direito:** log do que você fez.
- **Esquerda (por cima das pastas):** a pista de batidas.
- **Embaixo (por cima da lista de músicas):** o próximo movimento, a lição e o BPM.
- **Embaixo à direita:** a controladora com o controle a mexer piscando.

Decks e ondas do Serato ficam livres, e os cliques passam direto para o Serato
(só os menus do DJ Coach são clicáveis). **⌘⇧D** mostra/esconde o overlay.

### Instalar

1. Em **Actions → Build Mac app**, abra a execução mais recente e baixe `DJ-Coach-mac`.
2. Abra o `.dmg` e arraste o **DJ Coach** para Aplicativos.
3. Como o app não é assinado pela Apple, rode uma vez no Terminal:
   `xattr -cr "/Applications/DJ Coach.app"`
4. Ligue a Mixtrack Pro FX, abra o Serato e depois o DJ Coach.

Para rodar a partir do código: `npm install && npm start`.

## Versão de navegador

Abra o `index.html` no **Google Chrome** e aceite a permissão de MIDI. Sem a
controladora, dá para testar clicando e arrastando nos controles do desenho.

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
| `overlay.html`, `src/overlay.css` | Layout do overlay por cima do Serato |
| `electron/` | App de Mac (janela transparente, sempre por cima, que deixa os cliques passarem) |

## Próximos passos

- Integração com o Mixxx para ler BPM e posição da música automaticamente.
