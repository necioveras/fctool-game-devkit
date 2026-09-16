# Changelog

## 0.4.0

- formalizado o ciclo completo de configuração: Manifest -> Card -> GameSession -> `INITIALIZE` -> jogo;
- jogo passa a ter como requisito de conformidade aguardar `INITIALIZE` antes de iniciar a experiência pedagógica;
- `INITIALIZE.configuration` é formalizado como snapshot da configuração efetiva do card;
- SDK passa a rejeitar `INITIALIZE` sem `sessionId` válido ou sem `configuration` objeto;
- opções `select` passam a aceitar também `{ value, label }`, preservando suporte aos valores primitivos existentes;
- validador passa a verificar tipos de `default`, pertinência de defaults de `select`, limites/step numéricos, nomes de chaves e opções duplicadas;
- Mock Host passa a ler o manifesto, gerar controles de configuração e enviar os valores escolhidos em `INITIALIZE`;
- Hello Game demonstra seleção de fase inicial e dificuldade;
- protocolo permanece FCTool Game Protocol 1.0 (clarificação/expansão compatível do contrato).

## 0.3.0

- metadados pedagógicos do manifesto passam a ser declarados como **sugestões do desenvolvedor**;
- adicionados `suggestedAreas`, `suggestedSubjects`, `suggestedTopics`, `suggestedEducationLevels`, `keywords` e `language`;
- classificação definitiva do catálogo passa a ser responsabilidade do administrador do FCTool durante a instalação/curadoria;
- documentação formaliza a separação entre metadados declarativos do pacote e metadados curatoriais da plataforma;
- template, Hello Game, schema e validador atualizados;
- protocolo permanece FCTool Game Protocol 1.0.


## 0.2.0

- compatibilidade mobile formalizada como requisito de conformidade;
- manifesto passa a declarar suporte a toque e orientações;
- novo guia `docs/mobile.md`;
- Mock Host com presets Desktop, Tablet e Mobile;
- alternância Retrato/Paisagem no Mock Host;
- templates e Hello Game atualizados para layout responsivo e alvos de toque;
- documentação de fullscreen como melhoria progressiva;
- protocolo permanece FCTool Game Protocol 1.0.

## 0.1.0

- primeira especificação do FCTool Game Manifest 1.0;
- FCTool Game Protocol 1.0 baseado em `postMessage`;
- SDK JavaScript/TypeScript de referência;
- handshake HELLO -> INITIALIZE -> READY;
- ciclo de vida, pontuação, telemetria e conclusão;
- template de jogo;
- exemplo Hello Game;
- exemplo de Adapter;
- validador e empacotador ZIP;
- Mock Host para testes independentes do FCTool.
