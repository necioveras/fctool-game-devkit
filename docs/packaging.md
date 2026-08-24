# Empacotamento

O pacote instalável é um ZIP contendo o `manifest.json` na raiz.

```text
meu-jogo.zip
├── manifest.json
├── index.html
├── game.js
├── game.css
└── assets/
```

## Regras de segurança do pacote

A especificação inicial recomenda:

- somente arquivos estáticos Web;
- nenhum caminho absoluto ou contendo `..`;
- nenhum link simbólico;
- limite de tamanho compactado e descompactado;
- limite de quantidade de arquivos;
- extensões permitidas;
- `entrypoint` obrigatório e existente.

Use `tools/package_game.py`, que valida antes de gerar o ZIP.
