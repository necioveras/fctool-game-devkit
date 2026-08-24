# Arquitetura de integração

O jogo é tratado como um componente externo e independente do FCTool.

```text
Professor -> Card Jogo -> Catálogo -> Configuração -> Roteiro
                                                   |
                                                   v
Aluno -> FCTool Game Runtime -> iframe -> Jogo Web
                                  ^         |
                                  |         v
                           postMessage <- SDK
                                  |
                                  v
                        FCTool Game Controller
                                  |
                                  v
                           API / persistência
```

## Responsabilidades do jogo

- possuir um `manifest.json` válido;
- executar como aplicação Web estática;
- inicializar o SDK;
- receber configuração fornecida pelo FCTool;
- emitir eventos padronizados de ciclo de vida;
- emitir telemetria relevante;
- sinalizar conclusão.

## Responsabilidades do FCTool

- instalar e validar o pacote;
- fornecer catálogo e configurações ao professor;
- criar a sessão de execução;
- carregar o jogo de forma isolada;
- enviar `INITIALIZE`;
- receber e validar mensagens;
- registrar eventos e resultados;
- controlar a conclusão do card.

## Princípio de caixa-preta

Um desenvolvedor de jogo não deve precisar conhecer a implementação interna do FCTool. A integração ocorre exclusivamente por meio de:

1. FCTool Game Manifest;
2. FCTool Game Protocol;
3. FCTool Game SDK.
