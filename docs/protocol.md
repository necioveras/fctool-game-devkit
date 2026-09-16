# FCTool Game Protocol 1.0

## Transporte

A versão Web utiliza `window.postMessage()` entre o `iframe` do jogo e a janela hospedeira do FCTool.

Todas as mensagens usam o envelope:

```json
{
  "namespace": "fctool.game",
  "protocolVersion": "1.0",
  "type": "EVENT_TYPE",
  "messageId": "identificador",
  "timestamp": "2026-08-22T20:00:00.000Z",
  "payload": {}
}
```

## Handshake

1. Jogo carrega e chama `initialize()`;
2. SDK envia `HELLO`;
3. FCTool valida jogo/protocolo e responde `INITIALIZE`;
4. `initialize()` resolve com o contexto;
5. jogo prepara seus recursos;
6. jogo envia `READY`.

```text
JOGO                                   FCTool
 |                                        |
 |--------------- HELLO ----------------->|
 |<------------ INITIALIZE ---------------|
 |                                        |
 |--------------- READY ----------------->|
```

## Mensagens jogo -> FCTool

### HELLO

```json
{
  "gameId": "projectile-motion",
  "gameVersion": "1.0.0"
}
```

### READY

Informa que o jogo recebeu a inicialização e está apto a iniciar.

### STARTED

Informa o início efetivo da partida/interação.

### PAUSED / RESUMED

Opcionais, usados quando o jogo possui pausa explícita.

### SCORE

```json
{
  "value": 80,
  "max": 100
}
```

### EVENT

Evento de telemetria extensível:

```json
{
  "name": "attempt",
  "data": {
    "success": false,
    "angle": 35
  }
}
```

### COMPLETED

```json
{
  "score": 80,
  "result": "success"
}
```

### ERROR

```json
{
  "code": "ASSET_LOAD_FAILED",
  "message": "Não foi possível carregar um recurso necessário."
}
```

## Mensagens FCTool -> jogo

### INITIALIZE

```json
{
  "sessionId": "sessao-opaca",
  "configuration": {
    "difficulty": "medium",
    "sound": true
  }
}
```

O FCTool não deve enviar dados pessoais desnecessários ao jogo.

#### Semântica de `configuration`

`configuration` contém os **valores efetivos da instância do card** configurada pelo professor. As chaves correspondem às opções declaradas em `manifest.json`. O manifesto declara o que pode ser configurado; o FCTool persiste os valores escolhidos no card; ao criar uma sessão, o host envia um snapshot desses valores em `INITIALIZE`.

O jogo **não deve iniciar a experiência pedagógica antes de receber `INITIALIZE`**. Depois de receber a mensagem, deve validar/aplicar a configuração, preparar a experiência correspondente e somente então enviar `READY`. Isso evita iniciar uma fase, dificuldade ou regra padrão antes de conhecer a configuração escolhida pelo professor.

O host deve enviar `configuration` como objeto, mesmo quando vazio (`{}`). A configuração usada na execução deve ser registrada como snapshot da `GameSession`, juntamente com a versão exata do jogo, para preservar reprodutibilidade.

Exemplo: se o professor selecionar `initialLevel = "level-3"`, o jogo recebe esse valor em `INITIALIZE` e é responsabilidade do jogo interpretá-lo e iniciar a fase correspondente. O FCTool não precisa conhecer a semântica interna de `level-3`.

Opcionalmente, `READY` pode incluir `appliedConfiguration`, permitindo diagnóstico no Mock Host e confirmação da configuração efetivamente aplicada:

```json
{
  "appliedConfiguration": {
    "initialLevel": "level-3",
    "difficulty": "medium"
  }
}
```

### COMMAND (reservado)

Reservado para evolução do protocolo, como pausa solicitada pelo host. Jogos 1.0 podem ignorá-lo.

## Segurança

O host deve validar `event.origin`, `event.source`, namespace e versão. O SDK aceita `targetOrigin` explícito. O fallback `*` existe apenas para facilitar desenvolvimento local.


## Compatibilidade mobile e responsividade

Um FCTool Game deve ser utilizável em dispositivos com entrada por toque e adaptar sua área de renderização ao viewport fornecido pelo FCTool. A execução em `iframe` e o transporte via `postMessage` permanecem iguais em desktop, tablet e smartphone.

Requisitos de conformidade:

- declarar `meta viewport` no `entrypoint`;
- não depender exclusivamente de `hover`, teclado, botão direito ou mouse;
- oferecer equivalentes por toque para interações essenciais;
- adaptar canvas, HUD e controles sem rolagem horizontal;
- manter alvos de toque utilizáveis e textos legíveis;
- suportar redimensionamento do `iframe` durante a sessão;
- não presumir uma resolução física específica.

Jogos podem declarar no manifesto orientações suportadas e uma orientação preferencial. O host pode oferecer expansão/fullscreen, mas o jogo não deve depender disso para funcionar.
