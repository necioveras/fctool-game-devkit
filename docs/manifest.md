# FCTool Game Manifest 1.0

Cada pacote contém obrigatoriamente um `manifest.json` na raiz. O manifesto descreve o artefato e informa **metadados sugeridos pelo desenvolvedor**. Esses metadados não controlam diretamente a taxonomia do catálogo do FCTool: durante a instalação, o administrador revisa, corrige e complementa a classificação.

Exemplo:

```json
{
  "fctoolGame": "1.0",
  "id": "projectile-motion",
  "name": "Lançamento de Projéteis",
  "version": "1.0.0",
  "entrypoint": "index.html",
  "metadata": {
    "description": "Jogo educacional sobre lançamento oblíquo de projéteis.",
    "author": "Nome do desenvolvedor",
    "license": "MIT",
    "language": "pt-BR",
    "suggestedAreas": ["Ciências da Natureza"],
    "suggestedSubjects": ["Física"],
    "suggestedTopics": ["Mecânica", "Cinemática", "Lançamento oblíquo"],
    "suggestedEducationLevels": ["Ensino Médio"],
    "keywords": ["projéteis", "velocidade", "ângulo", "trajetória"]
  },
  "capabilities": {
    "score": true,
    "attempts": true,
    "completion": true,
    "customEvents": true
  },
  "configuration": {},
  "responsive": {
    "touch": true,
    "orientations": ["portrait", "landscape"],
    "preferredOrientation": "any"
  }
}
```

## Metadados declarativos x curadoria do catálogo

O pacote é autodescritivo, mas não conhece IDs nem estruturas internas da taxonomia do FCTool.

```text
manifest.json
    │
    │ sugestões semânticas
    ▼
Administrador do FCTool
    │
    │ revisão / mapeamento
    ▼
Taxonomia oficial do catálogo
```

O desenvolvedor **não deve** informar IDs internos como `area_id` ou `subject_id`. Isso preserva o desacoplamento entre jogo e plataforma.

Na instalação, o FCTool poderá pré-preencher a classificação usando as sugestões do manifesto. O administrador homologa a classificação definitiva. Uma atualização do pacote não deve apagar automaticamente a curadoria já existente no FCTool.

## Campos de metadata

- `description`: descrição do jogo; obrigatória;
- `author`: autor/desenvolvedor;
- `license`: licença do artefato;
- `language`: idioma principal sugerido (ex.: `pt-BR`);
- `suggestedAreas`: áreas sugeridas;
- `suggestedSubjects`: componentes curriculares/disciplinas sugeridos;
- `suggestedTopics`: assuntos e tópicos sugeridos;
- `suggestedEducationLevels`: níveis de ensino sugeridos;
- `keywords`: palavras-chave para descoberta e curadoria;
- `thumbnail`: imagem opcional dentro do pacote.

## Regras principais

- `fctoolGame`: versão do contrato, atualmente `1.0`;
- `id`: identificador estável em minúsculas, dígitos e hífen;
- `version`: SemVer (`X.Y.Z`);
- `entrypoint`: arquivo HTML dentro do pacote;
- `metadata`: descrição e sugestões de classificação;
- `capabilities`: recursos declarados pelo jogo;
- `configuration`: opções que o professor poderá configurar;
- `responsive`: requisitos de responsividade e toque.

O schema formal está em `schemas/manifest.schema.json`.
