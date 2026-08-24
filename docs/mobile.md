# Jogos mobile e responsivos

## Regra geral

Todo FCTool Game deve funcionar dentro de um `iframe` responsivo e ser operável por toque. O jogo continua sendo uma aplicação Web independente: o FCTool controla o contêiner e o jogo controla seu layout interno.

## HTML mínimo

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## CSS recomendado

```css
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
canvas { display: block; max-width: 100%; max-height: 100%; }
```

## Phaser

Uma configuração típica é:

```js
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  width: 1280,
  height: 720
}
```

A resolução lógica pode ser fixa; o canvas deve se ajustar ao espaço efetivamente fornecido pelo host.

## Entrada

Não use como única interação: hover, clique direito, WASD, setas ou arrastes que exijam precisão de mouse. Tap, drag por toque e controles visuais devem cobrir as ações essenciais.

## Orientação

O manifesto pode declarar `responsive.orientations` e `responsive.preferredOrientation`. `any` significa que o jogo se adapta às duas orientações. A preferência é informativa: o host pode sugerir ou favorecer a orientação, sem garanti-la.

## Fullscreen

O FCTool poderá oferecer expansão/fullscreen do card. Trate fullscreen como melhoria progressiva. O jogo precisa continuar utilizável no iframe normal.

## Checklist

- viewport configurado;
- sem rolagem horizontal;
- HUD não cortado;
- texto legível;
- ações essenciais disponíveis por toque;
- redimensionamento sem reiniciar a sessão;
- testado em retrato e paisagem quando declarados;
- testado no Mock Host e, quando pertinente, em dispositivo real.
