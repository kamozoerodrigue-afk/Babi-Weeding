# Babi Wedding — application mobile

Application React Native (Expo) du parcours couple, construite sur le contenu
du site vitrine `babiwedding.ci` et calquée sur les codes d'interface de
l'application mobile Airbnb.

## Démarrer

Le projet vise le **SDK Expo 54**, pour correspondre à la version d'Expo Go
distribuée aujourd'hui sur les magasins.

Sous Windows, double-cliquez sur `install.bat` — ou en ligne de commande :

```bash
cd app-mobile
install.bat
npx expo start -c        # -c vide le cache Metro
```

Sous macOS ou Linux :

```bash
cd app-mobile
rm -rf node_modules package-lock.json .expo
npm install
npx expo install expo-router expo-asset expo-constants expo-font expo-linking \
  expo-splash-screen expo-status-bar react react-native \
  react-native-gesture-handler react-native-safe-area-context \
  react-native-screens react-native-svg @types/react
npx expo start -c
```

Seul `expo` est épinglé dans le `package.json`. Toutes les autres dépendances
sont installées par `npx expo install`, qui lit la table des versions natives
du SDK réellement présent et choisit les numéros exacts. C'est plus fiable que
de les fixer à la main.

Scannez ensuite le QR code avec **Expo Go** (iOS ou Android), ou appuyez sur
`i` / `a` dans le terminal pour un simulateur.

## Dépannage

**`Project is incompatible with this version of Expo Go`**

Expo Go n'embarque qu'un seul SDK à la fois. Le numéro annoncé par le serveur
vient du paquet `expo` présent dans `node_modules`, **pas** du `package.json` :
modifier le fichier sans réinstaller ne change rien. Il faut donc repartir
d'une installation propre — c'est exactement ce que fait `install.bat`.

Pour viser un autre SDK, changez `"expo": "^54.0.0"` dans le `package.json`
puis relancez `install.bat`.

**`npm error code ERESOLVE` sur `react-dom`**

Expo fige React sur la version validée par le SDK (19.1.0 pour le SDK 54).
Des dépendances optionnelles — `react-dom` en tête — réclament une version plus
récente, et la résolution stricte de npm refuse d'arbitrer. Ces paquets ne sont
pas embarqués dans l'application mobile : le fichier `.npmrc` du projet active
donc `legacy-peer-deps`, ce qui règle le cas une fois pour toutes, y compris
pour les `npm install` que le CLI Expo lance lui-même.

Si le fichier `.npmrc` a disparu, recréez-le à la racine de `app-mobile` avec :

```
legacy-peer-deps=true
```

**`Cannot find module 'babel-preset-expo'`**

Le preset est une dépendance du paquet `expo`, mais npm ne le remonte pas
toujours à la racine de `node_modules`, où Babel le cherche. Déclarez-le
explicitement — c'est le contournement que recommande le message d'erreur
lui-même :

```bash
npx expo install babel-preset-expo
npx expo start -c
```

**`The required package 'expo-asset' cannot be found`**

Depuis le SDK 51, le paquet `expo` ne tire plus automatiquement `expo-asset`,
`expo-font` et `expo-splash-screen`, que `@expo/metro-config` réclame pourtant
au démarrage :

```bash
npx expo install expo-asset expo-font expo-splash-screen
```

**Conflits de versions au `npm install`**

Préférez toujours `npx expo install <paquet>` à `npm install <paquet>` : la
première choisit la version compatible avec votre SDK, la seconde prend la
dernière publiée, souvent en avance sur le SDK.

**Le mode web (`w`) échoue**

L'application vise le mobile. Pour l'ouvrir aussi dans un navigateur :

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

## Architecture

```
app/                        routes (expo-router, navigation par fichiers)
  _layout.tsx               pile racine + providers
  (tabs)/
    _layout.tsx             barre d'onglets basse
    index.tsx               Explorer — fil principal
    favoris.tsx             Favoris
    devis.tsx               Suivi des demandes de devis
    messages.tsx            Liste des conversations
    profil.tsx              Compte et outils du mariage
  prestataire/[id].tsx      Fiche prestataire
  recherche.tsx             Recherche plein écran
  devis/[id].tsx            Formulaire de demande de devis
  messages/[id].tsx         Fil de conversation

src/
  theme/index.ts            couleurs, typographie, espacements, ombres
  components/
    Icon.tsx                55 icônes SVG en trait (aucun emoji)
    VendorCard.tsx          carte prestataire avec carrousel photo
    SearchPill.tsx          pilule de recherche flottante
    CategoryStrip.tsx       bandeau de catégories horizontal
    FiltersSheet.tsx        panneau de filtres en feuille basse
    ui.tsx                  bouton, puce, séparateur, en-tête, état vide
  data/catalogue.ts         jeu de données de démonstration
  lib/filter.ts             logique de filtrage du catalogue
  store/useFavorites.tsx    état partagé (favoris, devis)
```

## Correspondance avec l'interface Airbnb

| Élément Airbnb | Transposition Babi Wedding |
|---|---|
| Pilule de recherche flottante | « Quel prestataire cherchez-vous ? » + bouton filtres cerclé |
| Bandeau de catégories à icônes | 14 catégories de prestataires, actif souligné en noir |
| Carte de logement | Carte prestataire : carrousel 1:1, cœur, badge, note en ligne de titre |
| Prix « par nuit » | « À partir de X FCFA · la prestation / le couvert / la journée » |
| Page logement | Fiche prestataire : galerie, bloc contact, sections, barre d'action fixe |
| Panneau de filtres | Feuille basse avec « Tout effacer » et « Afficher N prestataires » |
| Barre d'onglets basse | Explorer · Favoris · Mes devis · Messages · Profil |

La couleur d'accent est celle du site vitrine (`#E64A5D`), pas le rose Airbnb.

## Passage en production

Les données viennent de `src/data/catalogue.ts`. Pour brancher le back-end :

1. Remplacer `VENDORS`, `CONVERSATIONS` et `QUOTES` par des appels Supabase.
2. Déplacer `applyFilters` côté serveur pour filtrer en base plutôt qu'en mémoire.
3. Brancher Paystack sur le bouton « Demander un devis » pour l'acompte.
4. Ajouter `expo-notifications` pour les alertes de nouveau devis et de message.
5. Persister les favoris avec `expo-secure-store` ou la table `favorites`.
