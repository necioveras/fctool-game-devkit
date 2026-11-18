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

Para `SCORE`, `COMPLETED` e `EVENT`, o Mock Host também valida o payload contra `manifest.outputs`. O log exibe `OUTPUT VÁLIDO` para mensagens aceitas ou `OUTPUT REJEITADO` acompanhado dos campos incompatíveis. Eventos customizados não declarados também são rejeitados.

Esse teste não substitui a validação final dentro do FCTool, mas permite ao desenvolvedor trabalhar sem conhecer nem executar a plataforma.

## Contexto simulado do roteiro

O Mock Host permite informar IDs simulados para aluno, roteiro e card. Para simular a execução em diferentes partes de um mesmo roteiro, mantenha o **ID do roteiro** e altere o **ID do card** antes de reiniciar a sessão. O host envia esses valores em `studentId`, `scriptId` e `cardId` no `INITIALIZE`, separados da configuração pedagógica do card.


## Teste de viewport

O Mock Host 0.2 inclui presets de viewport para Desktop, Tablet e Mobile e permite alternar entre retrato e paisagem. Use esses controles para verificar layout, escala, legibilidade e interação antes de gerar o ZIP.

A conformidade mobile deve ser confirmada também em um dispositivo real quando o jogo usar gestos, áudio, fullscreen, orientação ou APIs com comportamento específico de navegador.
