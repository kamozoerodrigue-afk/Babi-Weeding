# Babi Wedding — plateforme complète

Quatre surfaces qui partagent une seule source de données.

## Ce qui est livré

| Surface | Ouvrir | Rôle |
|---|---|---|
| **Site vitrine** | `index.html` | Acquisition SEO, blog, présentation. Charte Mariages.net |
| **Marketplace web** | `app/index.html` | Recherche et réservation. Charte application Airbnb |
| **Portail prestataire** | `pro/index.html` | Le professionnel publie son offre |
| **Panel d'administration** | `admin/index.html` | Validation, modération, finances, contenu |
| **Application mobile** | `app-mobile/` | React Native + Expo. Voir `app-mobile/README.md` |

Toutes les pages web s'ouvrent par double-clic, sans installation.

## Le circuit complet

1. Un prestataire dépose son profil, il arrive dans **admin → Validation des profils**.
2. L'administrateur contrôle le RCCM et le portfolio, puis valide et attribue une offre.
3. Le prestataire décrit ses services dans **pro → Mes services**.
4. Le service apparaît immédiatement sur la **marketplace** et dans l'**application mobile**.
5. Un couple demande un devis depuis la fiche publique.
6. La demande arrive dans **pro → Demandes de devis**, le prestataire chiffre et répond.
7. Le suivi apparaît dans **admin → Demandes de devis** et dans **pro → Revenus**.

Pour l'observer : ouvrez `admin/index.html` et `pro/index.html` dans deux onglets,
validez un profil dans le premier, rechargez le second.

## Arborescence

```
babi-wedding/
  index.html  catalogue.html  blog.html  article.html   site vitrine
  app/        index.html  prestataire.html              marketplace web
              market.css  market.js  fiche.js
  pro/        index.html  pro.js                        portail prestataire
  admin/      index.html  admin.js                      panel d'administration
  assets/
    css/  style.css (vitrine)   app.css (interfaces applicatives)
    js/   main.js (vitrine)     store.js (données)   ui.js (composants)
    img/  icons.svg             79 icônes en trait, aucun emoji
    js/   config.js (identifiants)  garde.js (accès)  vitrine.js  connexion.js
          demo-data.js (repli hors ligne)
  connexion.html                                      connexion et inscription
  db/   schema.sql            14 tables, RLS, déclencheurs
        02_ajustements.sql    vues publiques, temps réel, colonnes du front
        04_vitrine.sql        totaux publics, décomptes par catégorie
        03_donnees_demo.sql   jeu de démonstration (généré)
  outils/ generer-seed.mjs                            régénère le fichier ci-dessus
  app-mobile/                                           projet Expo
```

## Les données

Tout vient désormais d'une base **PostgreSQL hébergée par Supabase**. Les cinq
surfaces lisent et écrivent au même endroit ; la mise en service tient en trois
étapes décrites dans **[INSTALLATION.md](INSTALLATION.md)**.

`assets/js/store.js` expose la même API qu'avant — elle est simplement adossée
à la base :

```js
BW.list('prestataires', { statut: 'valide' })
BW.get('services', id)
BW.create('devis', { … })
BW.update('prestataires', id, { statut: 'valide' })
BW.remove('articles', id)
```

Les lectures sont instantanées : la base est chargée une fois au démarrage de
la page, par `BW.boot([...])`, et servie depuis un cache mémoire. Les écritures
partent vers PostgreSQL en arrière-plan et sont annulées si le serveur refuse.
Les onglets ouverts se synchronisent entre eux par le temps réel Supabase.

Le site vitrine n'a plus une ligne de contenu écrite en dur : catégories,
compteurs, prestataires vedettes, témoignages, catalogue, blog et pages
articles sortent tous de la base. Une modification faite dans le panel
d'administration se voit sur le site **sans rechargement**, y compris depuis un
autre poste, grâce au temps réel.

Trois rôles pilotent les accès — `couple`, `prestataire`, `admin` — via
`connexion.html` et les politiques de sécurité au niveau des lignes. Le portail
prestataire et le panel d'administration sont fermés aux comptes non habilités.

**Sans configuration, rien ne casse** : `assets/js/config.js` vide fait basculer
les pages sur le jeu de démonstration hors ligne (`assets/js/demo-data.js`), et
le projet reste ouvrable par double-clic.

## Passer en production

Les fichiers de `db/` s'exécutent tels quels dans l'éditeur SQL de Supabase,
dans l'ordre `schema.sql` → `02_ajustements.sql` → `03_donnees_demo.sql`.
Ils sont idempotents, donc rejouables sans risque.

Points de sécurité déjà traités dans le schéma :

- un prestataire ne peut pas s'auto-valider ni s'auto-attribuer le badge — un
  déclencheur restaure ces champs si l'auteur n'est pas administrateur ;
- un couple ne peut noter qu'un prestataire dont il a **accepté** le devis ;
- la vue `prestataires_publics` expose le catalogue **sans** les adresses et
  téléphones directs ;
- les paiements sont en lecture seule côté utilisateur, l'écriture passe par le
  webhook Paystack avec la clé de service.

Les coordonnées directes des prestataires ne sortent jamais de la base pour un
visiteur : le catalogue public passe par les vues `prestataires_publics`,
`services_publics`, `avis_publics` et `articles_publics`, qui excluent le
courriel et le téléphone. La table `prestataires` elle-même n'est lisible que
par son propriétaire et par l'administration.

Reste à traiter pour une mise en production complète : le webhook Paystack
(écriture des paiements côté serveur), le dépôt des photos de portfolio dans le
bucket `portfolios`, et la configuration du domaine dans Supabase Auth.
Le détail est en fin d'[INSTALLATION.md](INSTALLATION.md).
