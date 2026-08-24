# Testes de compatibilidade

O DevKit inclui um FCTool Host simulado.

## Executar

Na raiz do kit:

```bash
python -m http.server 8000
```

Abra:

```text
http://localhost:8000/tools/mock-host.html?game=/examples/hello-game/index.html
```

## O que o host verifica

- recebimento de `HELLO`;
- compatibilidade com protocolo 1.0;
- envio de `INITIALIZE`;
- recebimento de `READY`;
- eventos de ciclo de vida;
- telemetria customizada;
- conclusão.

Esse teste não substitui a validação final dentro do FCTool, mas permite ao desenvolvedor trabalhar sem conhecer nem executar a plataforma.


## Teste de viewport

O Mock Host 0.2 inclui presets de viewport para Desktop, Tablet e Mobile e permite alternar entre retrato e paisagem. Use esses controles para verificar layout, escala, legibilidade e interação antes de gerar o ZIP.

A conformidade mobile deve ser confirmada também em um dispositivo real quando o jogo usar gestos, áudio, fullscreen, orientação ou APIs com comportamento específico de navegador.
