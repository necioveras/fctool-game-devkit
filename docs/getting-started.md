# Primeiros passos

## 1. Copie o template

Copie `template/game-template/` para uma nova pasta e altere os campos do `manifest.json`.

## 2. Implemente seu jogo

O jogo é uma aplicação Web estática. O FCTool não exige Phaser: ele exige apenas compatibilidade com o **FCTool Game Protocol** por meio do SDK.

Tecnologias esperadas incluem HTML5, CSS, JavaScript/TypeScript, Phaser, Canvas ou bibliotecas equivalentes executáveis no navegador.

## 3. Inicialize o SDK

Inclua `fctool-game-sdk.js` e crie a instância:

```js
const fctool = new FCToolGameSDK.FCToolGame({
  gameId: "meu-jogo",
  gameVersion: "1.0.0"
});

const context = await fctool.initialize();
```

`initialize()` envia um `HELLO` ao host e aguarda `INITIALIZE`.

O contexto retornado contém apenas informações necessárias à execução, como:

```js
{
  sessionId: "sessao-opaca",
  configuration: {
    difficulty: "medium",
    sound: true
  }
}
```

O jogo não precisa conhecer aluno, turma, roteiro, Django ou banco de dados.

## 4. Informe que está pronto

```js
fctool.ready();
```

## 5. Informe o ciclo de vida

```js
fctool.start();
fctool.pause();
fctool.resume();
fctool.complete({ score: 80 });
```

## 6. Emita telemetria

```js
fctool.emit("attempt", {
  success: false,
  angle: 35
});

fctool.emit("hint_requested");
```

Para pontuação existe um atalho:

```js
fctool.score(80);
```

## 7. Teste sem FCTool

Suba um servidor HTTP na raiz do DevKit:

```bash
python -m http.server 8000
```

Abra:

```text
http://localhost:8000/tools/mock-host.html?game=/caminho/do/seu/index.html
```

## 8. Valide e empacote

```bash
python tools/validator.py caminho/do/jogo
python tools/package_game.py caminho/do/jogo meu-jogo.zip
```

O ZIP gerado é o artefato entregue ao administrador do FCTool.
