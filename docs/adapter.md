# Adaptando um jogo existente

Um jogo já existente não precisa ser reescrito. O adaptador conecta eventos internos do jogo ao SDK.

Exemplo de jogo existente:

```js
function onTargetHit(points) {
  score += points;
  updateHud();
}

function gameOver() {
  showResult();
}
```

Adaptado:

```js
const fctool = new FCToolGameSDK.FCToolGame({
  gameId: "jogo-existente",
  gameVersion: "1.0.0"
});

const context = await fctool.initialize();
fctool.ready();
fctool.start();

function onTargetHit(points) {
  score += points;
  updateHud();

  fctool.emit("target_hit", { points });
  fctool.score(score);
}

function gameOver() {
  showResult();
  fctool.complete({ score });
}
```

O adaptador é específico do jogo. O protocolo e o SDK permanecem genéricos.
