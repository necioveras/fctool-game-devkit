# FCTool Game SDK

## Criação

```js
const fctool = new FCToolGameSDK.FCToolGame({
  gameId: "meu-jogo",
  gameVersion: "1.0.0",
  targetOrigin: "https://host.exemplo"
});
```

Se `targetOrigin` não for informado, o SDK tenta ler `fctool_origin` da query string. Em desenvolvimento local pode cair para `*`.

## initialize()

```js
const context = await fctool.initialize();
```

Envia `HELLO` e aguarda `INITIALIZE`.

## ready()

```js
fctool.ready();
```

Informa que o jogo está pronto.

## start(), pause(), resume()

```js
fctool.start();
fctool.pause();
fctool.resume();
```

## score(value, max?)

```js
fctool.score(80, 100);
```

## emit(name, data?)

```js
fctool.emit("attempt", { success: false });
fctool.emit("hint_requested");
```

## complete(data?)

```js
fctool.complete({ score: 80, result: "success" });
```

## error(code, message, data?)

```js
fctool.error("ASSET_LOAD_FAILED", "Falha ao carregar sprite");
```
