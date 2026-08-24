# Exemplo de Adapter

Este exemplo mostra como integrar um jogo existente sem reescrever sua lógica.

```js
// Jogo existente
let score = 0;
function hitTarget(points) {
  score += points;
}
function gameOver() {
  console.log("fim", score);
}

// Adapter FCTool
const fctool = new FCToolGameSDK.FCToolGame({
  gameId: "legacy-game",
  gameVersion: "1.0.0"
});

await fctool.initialize();
fctool.ready();
fctool.start();

const originalHitTarget = hitTarget;
hitTarget = function(points) {
  originalHitTarget(points);
  fctool.emit("target_hit", { points });
  fctool.score(score);
};

const originalGameOver = gameOver;
gameOver = function() {
  originalGameOver();
  fctool.complete({ score });
};
```
