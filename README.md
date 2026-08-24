# FCTool Game Developer Kit

Versão inicial de referência: **0.3.0**  
Protocolo suportado: **FCTool Game Protocol 1.0**

Este kit permite desenvolver um jogo Web como uma aplicação independente e integrá-lo ao FCTool **sem acesso ao código interno da plataforma**.

O desenvolvedor precisa apenas:

1. criar o jogo Web (Phaser, Canvas, Three.js ou outra tecnologia compatível com navegador);
2. fornecer um `manifest.json` válido;
3. usar o **FCTool Game SDK** para receber configuração e emitir eventos;
4. garantir compatibilidade responsiva e entrada por toque;
5. empacotar o jogo em `.zip`.

## Estrutura

- `docs/` — especificação e guias;
- `schemas/manifest.schema.json` — schema do manifesto;
- `sdk/` — implementação TypeScript/JavaScript do SDK;
- `template/game-template/` — ponto de partida para um novo jogo;
- `examples/hello-game/` — jogo mínimo funcional;
- `examples/adapter-example/` — exemplo de adaptação de um jogo existente;
- `tools/validator.py` — valida pacote/diretório antes do envio;
- `tools/package_game.py` — valida e gera o `.zip` instalável;
- `tools/mock-host.html` — simula o FCTool para testar o jogo fora da plataforma.

## Fluxo mínimo do jogo

```js
const game = new FCToolGameSDK.FCToolGame({
  gameId: "meu-jogo",
  gameVersion: "1.0.0"
});

const ctx = await game.initialize();
game.ready();
game.start();

// durante o jogo
game.emit("attempt", { success: true });
game.score(80);

// ao finalizar
game.complete({ score: 80 });
```

## Teste rápido

Na raiz deste kit:

```bash
python -m http.server 8000
```

Depois abra:

```text
http://localhost:8000/tools/mock-host.html?game=/examples/hello-game/index.html
```

O host de teste exibirá as mensagens trocadas entre o jogo e o FCTool e permite simular viewports Desktop, Tablet e Mobile, em retrato ou paisagem.

## Validar um jogo

Diretório:

```bash
python tools/validator.py examples/hello-game
```

ZIP:

```bash
python tools/validator.py meu-jogo.zip
```

## Gerar pacote instalável

```bash
python tools/package_game.py examples/hello-game dist/hello-game.zip
```

Leia primeiro `docs/getting-started.md`.
