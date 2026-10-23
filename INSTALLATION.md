# Mise en service — de la démonstration à la base de données

Trois étapes : créer les tables, brancher le web, brancher le mobile.
Comptez une vingtaine de minutes.

---

## 1. Créer les tables dans Supabase

Ouvrez votre projet Supabase → **SQL Editor** → **New query**, puis exécutez
les trois fichiers du dossier `db/` **dans cet ordre**, un par un :

| Ordre | Fichier | Ce qu'il fait |
|---|---|---|
| 1 | `db/schema.sql` | 14 tables, les types, les déclencheurs, les politiques de sécurité |
| 2 | `db/02_ajustements.sql` | Colonnes complémentaires, vues publiques, temps réel |
| 3 | `db/04_vitrine.sql` | Totaux publics et décomptes par catégorie pour la page d'accueil |
| 4 | `db/03_donnees_demo.sql` | Le jeu de démonstration : 11 prestataires, 8 services, 8 devis… |

Les quatre fichiers sont **idempotents** : les rejouer ne casse rien.

> Le dernier est facultatif. Sautez-le si vous voulez démarrer sur une base vide.

### Créer votre compte administrateur

1. Supabase → **Authentication** → **Users** → **Add user** → renseignez
   votre adresse et un mot de passe, puis validez.
2. Revenez dans le **SQL Editor** et exécutez, avec votre adresse :

```sql
update profils set role = 'admin'
where id = (select id from auth.users where email = 'votre.adresse@exemple.ci');
```

C'est le seul passage obligé par SQL : un compte ne peut pas se donner le rôle
administrateur tout seul, c'est précisément ce que le schéma empêche.

---

## 2. Brancher les quatre surfaces web

Dans Supabase → **Project Settings** → **API Keys**, relevez :

- l'**URL du projet** (`https://xxxxxxxx.supabase.co`) ;
- la clé **anon / publishable** (`eyJ…` ou `sb_publishable_…`).

Reportez-les dans **`assets/js/config.js`** :

```js
window.BW_CONFIG = {
  url: 'https://xxxxxxxx.supabase.co',
  anonKey: 'eyJhbGciOi…',
  sdk: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
};
```

⚠️ Jamais la clé `service_role` ici : elle contourne toutes les protections.
La clé anon est faite pour le navigateur — c'est la sécurité au niveau des
lignes, définie dans `db/schema.sql`, qui protège réellement les données.

### Servir les pages en http

Le SDK Supabase ne se charge pas depuis un `file://`. Ouvrez un terminal dans
le dossier du projet et lancez au choix :

```bash
python -m http.server 5173
# ou
npx serve .
```

Puis rendez-vous sur <http://localhost:5173>.

| Page | Accès |
|---|---|
| `index.html` | public |
| `app/index.html` | public |
| `connexion.html` | public |
| `pro/index.html` | compte **prestataire** |
| `admin/index.html` | compte **admin** |

Sans configuration, tout continue de fonctionner en démonstration hors ligne,
ouvrable par double-clic : c'est le repli automatique.

---

## 3. Brancher l'application mobile

Dans `app-mobile/`, installez les trois nouvelles dépendances :

```bash
cd app-mobile
npm install
```

Renseignez ensuite les mêmes identifiants, au choix :

**a. dans `app.json`** (le plus simple) :

```json
"extra": {
  "supabase": {
    "url": "https://xxxxxxxx.supabase.co",
    "anonKey": "eyJhbGciOi…"
  }
}
```

**b. ou dans un fichier `.env`** à la racine de `app-mobile/` :

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi…
```

Puis :

```bash
npm start
```

L'écran **Profil → Se connecter** ouvre la création de compte. Un compte créé
depuis le téléphone apparaît immédiatement dans **admin → Couples**.

---

## 4. Vérifier que tout communique

Le test le plus parlant : **deux onglets côte à côte**.

1. Onglet A : `index.html` (le site public). Onglet B : `admin/index.html`.
2. Dans l'admin, **Validation des profils** → validez *Gold Limousine Abidjan*.
3. Regardez l'onglet A **sans le recharger** : la catégorie « Loueurs de
   véhicules » passe de 0 à 1 pro, et la fiche entre dans les vedettes si vous
   la cochez « certifiée ».
4. Toujours dans l'admin, suspendez un prestataire vedette : il disparaît du
   site dans la seconde.
5. **Contenu → Articles** : publiez un brouillon. Il apparaît sur la page
   d'accueil et dans `blog.html`.
6. Ouvrez `app/index.html` : la marketplace montre les mêmes fiches.
7. Rechargez l'application mobile : elle aussi.
8. Depuis une fiche publique, demandez un devis. Il arrive dans
   `pro/index.html` → **Demandes de devis**, puis dans **admin → Demandes de
   devis** une fois la réponse envoyée.

### Ce qui circule en direct, et ce qui demande un rechargement

Le temps réel est activé par `db/02_ajustements.sql` sur les tables
prestataires, services, devis, avis, paiements, litiges, articles, couples et
messages. Une modification faite dans l'admin remonte donc toute seule vers :

- la **page d'accueil** — compteurs, grille des catégories, vedettes,
  témoignages, articles à la une ;
- le **catalogue** — cartes, titre, filtres par commune, décompte ;
- le **blog** et la **page article**.

La marketplace `app/` et le portail `pro/` mettent leur cache à jour de la même
façon, mais réaffichent l'écran courant au prochain changement d'onglet
interne. L'application mobile relit le catalogue à chaque lancement.

---

## Si une modification n'apparaît pas

Le site installe un **service worker** — c'est ce qui le rend consultable hors
ligne. Il peut servir une ancienne version du code après une mise à jour.

Le plus simple : ouvrez `outils/diagnostic.html` et cliquez sur
**Forcer la mise à jour du site**. Le service worker est retiré, les caches
vidés, la page rechargée.

Deux garde-fous ont été mis en place pour que cela ne se reproduise pas :

- les scripts sont appelés avec un numéro de version
  (`store.js?v=3`) — le navigateur ne peut pas se tromper de copie ;
- le service worker va désormais **chercher le code sur le réseau en
  premier**, et ne garde le cache que comme filet hors ligne.

**Après chaque modification d'un fichier de `assets/js/`**, incrémentez
`version` dans `assets/js/config.js` (`'3'` → `'4'`) et le numéro dans la
première ligne de `sw.js` (`babi-wedding-v3` → `-v4`). C'est tout.

---

## Ce qui reste à faire pour la production

- **Paiements** : le webhook Paystack doit écrire dans `paiements` avec la clé
  de service, côté serveur. Le schéma interdit déjà l'écriture côté navigateur.
- **Photos** : les portfolios pointent aujourd'hui vers Unsplash. Le bucket
  `portfolios` est créé et ouvert en lecture ; il reste à brancher le dépôt de
  fichiers depuis `pro → Portfolio`.
- **Confirmation par courriel** : réglable dans Supabase → Authentication →
  Providers → Email. Désactivez-la pour des tests plus rapides.
- **Domaine** : ajoutez votre domaine dans Authentication → URL Configuration,
  sinon les liens de réinitialisation retomberont sur `localhost`.
