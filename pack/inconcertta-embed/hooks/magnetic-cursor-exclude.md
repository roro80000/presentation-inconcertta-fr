# Exclusion curseur magnétique (et effets similaires)

Si le site hôte utilise un curseur personnalisé (ex. `js/hooks/magnetic-cursor.js` sur InCitta), exclure la zone embed pour éviter les conflits avec l’iframe.

## Dans `findMagnetic` (ou équivalent)

```javascript
if (startEl.closest('#demo-live, #inconcertta-live-embed')) return null;
if (document.body.classList.contains('demo-embed-fullscreen')) return null;
```

## Dans le handler `pointermove`

Quand `body.demo-embed-fullscreen` :

```javascript
if (document.body.classList.contains('demo-embed-fullscreen')) {
  // masquer curseur custom, clear magneticState, return
}
```

## CSS (déjà dans inconcertta-embed.css)

```css
body.is-magnetic-cursor #demo-live,
body.is-magnetic-cursor #demo-live *,
body.demo-embed-fullscreen,
body.demo-embed-fullscreen * {
  cursor: auto !important;
}

body.demo-embed-fullscreen .magnetic-cursor {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
```

## Lenis / scroll fluide

`inconcertta-embed.js` appelle `window.__lenis?.stop()` en plein écran et `.start()` à la fermeture.
Si votre smooth-scroll utilise une autre API, brancher les équivalents dans `setExpanded`.
