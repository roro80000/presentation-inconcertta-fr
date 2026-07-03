# Pack intégration InConcertta (site hôte)

Portage de l’intégration réalisée sur **incitta.eu** (`inconcertta.html`) : iframe live inline + plein écran + démo statique en images.

## Contenu du pack

```
pack/inconcertta-embed/
├── ASSETS.md                   ← liste images démo statique
├── CURSOR-PROMPT.md            ← prompt à coller dans Cursor (autre site)
├── CHECKLIST.md                ← avant mise en ligne
├── css/inconcertta-embed.css   ← styles autonomes
├── js/
│   ├── inconcertta-embed.js    ← iframe live + bouton Agrandir/Fermer (sans i18n)
│   └── inconcertta-demo-static.js  ← démo PNG + zones cliquables
├── html/
│   ├── snippet-live-embed.html
│   ├── snippet-static-demo.html
│   └── snippet-section-complete.html
└── hooks/
    └── magnetic-cursor-exclude.md
```

## Référence live

- Site déployé : https://incitta.eu/inconcertta.html
- Projet InConcertta (exemple) : `54ffa893-05f3-415d-b382`
- URL embed : `https://inconcertta.fr/embed/p/{projectId}?ref=embed&from={domaine}`

## Prérequis côté InConcertta

1. Routes déployées sur **https://inconcertta.fr** :
   - `/embed/p/{projectId}`
   - `/embed/p/{projectId}/join`
   - `/embed/p/{projectId}/play`
2. Le **domaine du site hôte** doit être dans la CSP `frame-ancestors` (fichier `embedAllowedParents.js` dans le repo InConcertta).
3. UUID / identifiant projet fourni par l’admin InConcertta.

## Installation rapide (site statique)

### 1. Copier les fichiers

```bash
cp pack/inconcertta-embed/css/inconcertta-embed.css  /votre-site/css/
cp pack/inconcertta-embed/js/inconcertta-embed.js     /votre-site/js/
# optionnel — démo statique :
cp pack/inconcertta-embed/js/inconcertta-demo-static.js /votre-site/js/
cp -R assets/Inconcertta/ /votre-site/assets/Inconcertta/   # depuis Site_InCitta
```

### 2. Lier CSS + HTML

Dans la page cible :

```html
<link rel="stylesheet" href="css/inconcertta-embed.css">
```

Coller le contenu de `html/snippet-live-embed.html` (remplacer `VOTRE-UUID-PROJET`).

### 3. Initialiser le script

```html
<script type="module">
  import { initInconcerttaEmbed } from './js/inconcertta-embed.js';
  initInconcerttaEmbed();
</script>
```

Avec démo statique en plus :

```javascript
import { initInconcerttaDemo } from './js/inconcertta-demo-static.js';
initInconcerttaDemo();
```

### 4. Curseur / effets (si le site en a)

Voir `hooks/magnetic-cursor-exclude.md`.

## Comportement

| Action | Effet |
|--------|--------|
| Scroll vers le bloc | Chargement paresseux de l’iframe (`IntersectionObserver`) |
| Clic **Agrandir** | Conteneur déplacé sous `<body>`, plein écran, iframe inchangée (pas de rechargement) |
| Clic **Fermer** / Échap | Retour inline dans la page |
| Ancre `#demo-live` | Précharge l’iframe si l’utilisateur arrive via un CTA |

**Ne pas** utiliser `embed.js` modal ni une iframe manuelle vers `/p/{uuid}/play` : uniquement `/embed/p/{uuid}` via `inconcertta-embed.js`.

## Variante Site_InCitta (i18n)

Sur incitta.eu, le fichier `js/pages/inconcertta-embed.js` importe `tSite()` pour les libellés. Le pack fournit une version **autonome** (`pack/.../inconcertta-embed.js`) avec `data-label-*` sur le bouton.

## Dépannage

| Symptôme | Cause probable |
|----------|----------------|
| « inconcertta.fr n'autorise pas la connexion » | Domaine non listé dans `frame-ancestors` ou test en `localhost` |
| Plein écran ne couvre pas la fenêtre | Ancêtre CSS avec `transform` / `backdrop-filter` — le script déplace déjà le bloc sous `body` |
| Bouton sans effet | `data-project` invalide ou IDs HTML manquants |

## Fichiers source dans ce dépôt

| Pack | Site_InCitta |
|------|----------------|
| `pack/.../inconcertta-embed.js` | `js/pages/inconcertta-embed.js` (+ i18n) |
| `pack/.../inconcertta-demo-static.js` | `js/pages/inconcertta-demo.js` |
| `pack/.../css/` | styles inline dans `inconcertta.html` |
