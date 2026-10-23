/* Génère db/03_donnees_demo.sql à partir du jeu de démonstration de store.js.
   Usage : node outils/generer-seed.mjs
   Aucune connexion réseau requise. */
import fs from 'node:fs';
import crypto from 'node:crypto';

const src = fs.readFileSync(new URL('../db/_seed-source.js', import.meta.url), 'utf8');
globalThis.window = globalThis;
new Function(src)();
const BW = globalThis.BW;

/* Identifiants stables : le même slug donne toujours le même uuid,
   donc le script peut être rejoué sans dupliquer les lignes. */
function uid(ns, key) {
  const h = crypto.createHash('sha1').update(ns + ':' + key).digest('hex');
  return [h.slice(0,8), h.slice(8,12), '5'+h.slice(13,16), '8'+h.slice(17,20), h.slice(20,32)].join('-');
}
const q  = v => v === null || v === undefined || v === '' ? 'null' : "'" + String(v).replace(/'/g, "''") + "'";
const n  = v => v === null || v === undefined || v === '' ? 'null' : Number(v);
const b  = v => v ? 'true' : 'false';
const j  = v => "'" + JSON.stringify(v ?? []).replace(/'/g, "''") + "'::jsonb";
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0, 70);

const P = BW.list('prestataires');
const S = BW.list('services');
const C = BW.list('couples');
const D = BW.list('devis');
const A = BW.list('avis');
const PAY = BW.list('paiements');
const L = BW.list('litiges');
const ART = BW.list('articles');
const T = BW.list('trafic');

const pid = slug => uid('prestataire', slug);
const cid = slug => uid('couple', slug);

const out = [];
const w = s => out.push(s);

w(`-- ============================================================================
--  BABI WEDDING — jeu de démonstration
--  Généré automatiquement par outils/generer-seed.mjs. Ne pas éditer à la main.
--  À exécuter APRÈS schema.sql puis 02_ajustements.sql. Idempotent.
-- ============================================================================
`);

/* --- Prestataires --------------------------------------------------------- */
w('-- Prestataires -------------------------------------------------------------');
w(`insert into prestataires (id, slug, nom, categorie_id, ville, commune, statut, certifie,
  sponsorise, accroche, description, capacite, delai_reponse, prix_min_fcfa, unite_prix,
  photos, contact, email_contact, tel_contact, rccm, offre, note_moyenne, nb_avis, motif_refus, cree_le) values`);
w(P.map(p => `  (${q(pid(p.id))}, ${q(p.id)}, ${q(p.nom)}, ${q(p.categorie)}, ${q(p.ville)}, ${q(p.commune)},
   ${q(p.statut)}::statut_prestataire, ${b(p.certifie)}, ${b(p.sponsorise)}, ${q(p.accroche)}, ${q(p.description)},
   ${q(p.capacite)}, ${q(p.delaiReponse)}, ${n(p.prixMin)}, ${q(p.unite)}, ${j(p.photos)}, ${j(p.contact)},
   ${q(p.contact && p.contact.email)}, ${q(p.contact && p.contact.tel)}, ${q(p.rccm)},
   ${q(p.abonnement || 'aucun')}::niveau_offre, ${n(p.note)}, ${n(p.avis)}, ${q(p.motifRefus)}, ${q(p.inscritLe)})`).join(',\n'));
w(`on conflict (id) do update set
  nom = excluded.nom, categorie_id = excluded.categorie_id, commune = excluded.commune,
  statut = excluded.statut, certifie = excluded.certifie, sponsorise = excluded.sponsorise,
  accroche = excluded.accroche, description = excluded.description, photos = excluded.photos,
  contact = excluded.contact, offre = excluded.offre, rccm = excluded.rccm;\n`);

/* --- Services ------------------------------------------------------------- */
w('-- Services -----------------------------------------------------------------');
w(`insert into services (id, prestataire_id, nom, description, prix_fcfa, unite, duree, inclus, actif, ordre) values`);
w(S.map((s, i) => `  (${q(uid('service', s.id))}, ${q(pid(s.prestataire))}, ${q(s.nom)}, ${q(s.description)},
   ${n(s.prix)}, ${q(s.unite)}, ${q(s.duree)}, ${j(s.inclus)}, ${b(s.actif)}, ${i})`).join(',\n'));
w(`on conflict (id) do update set
  nom = excluded.nom, description = excluded.description, prix_fcfa = excluded.prix_fcfa,
  unite = excluded.unite, duree = excluded.duree, inclus = excluded.inclus, actif = excluded.actif;\n`);

/* --- Couples -------------------------------------------------------------- */
w('-- Couples ------------------------------------------------------------------');
w(`insert into couples (id, profil_id, noms, email, tel, ville, date_mariage, nb_invites,
  budget_fcfa, diaspora, statut, cree_le) values`);
w(C.map(c => `  (${q(cid(c.id))}, null, ${q(c.noms)}, ${q(c.email)}, ${q(c.tel)}, ${q(c.ville)},
   ${q(c.dateMariage)}, ${n(c.invites)}, ${n(c.budget)}, ${b(c.diaspora)}, ${q(c.statut)}, ${q(c.inscritLe)})`).join(',\n'));
w(`on conflict (id) do update set
  noms = excluded.noms, email = excluded.email, tel = excluded.tel, ville = excluded.ville,
  date_mariage = excluded.date_mariage, nb_invites = excluded.nb_invites,
  budget_fcfa = excluded.budget_fcfa, statut = excluded.statut;\n`);

/* --- Devis ---------------------------------------------------------------- */
w('-- Devis --------------------------------------------------------------------');
w(`insert into devis (id, couple_id, prestataire_id, statut, message, date_evenement,
  nb_invites, montant_fcfa, envoye_le) values`);
w(D.map(d => `  (${q(uid('devis', d.id))}, ${q(cid(d.couple))}, ${q(pid(d.prestataire))},
   ${q(d.statut)}::statut_devis, ${q(d.message)}, ${q(d.dateEvenement)}, ${n(d.invites)},
   ${n(d.montant)}, ${q(d.envoyeLe)})`).join(',\n'));
w(`on conflict (id) do update set
  statut = excluded.statut, message = excluded.message, montant_fcfa = excluded.montant_fcfa;\n`);

/* --- Avis ----------------------------------------------------------------- */
w('-- Avis ---------------------------------------------------------------------');
w(`insert into avis (id, prestataire_id, couple_id, note, texte, statut, motif_signalement, signale_par, cree_le) values`);
w(A.map(a => `  (${q(uid('avis', a.id))}, ${q(pid(a.prestataire))}, ${q(cid(a.couple))}, ${n(a.note)},
   ${q(a.texte)}, ${q(a.statut)}::statut_avis, ${q(a.motifSignalement)},
   ${a.signalePar ? q(pid(a.signalePar)) : 'null'}, ${q(a.date)})`).join(',\n'));
w(`on conflict (id) do update set
  note = excluded.note, texte = excluded.texte, statut = excluded.statut;\n`);

/* --- Paiements ------------------------------------------------------------ */
w('-- Paiements ----------------------------------------------------------------');
w(`insert into paiements (id, type, statut, prestataire_id, couple_id, offre, montant_fcfa, moyen, date_operation) values`);
w(PAY.map(p => `  (${q(uid('paiement', p.id))}, ${q(p.type)}::type_paiement, ${q(p.statut)}::statut_paiement,
   ${q(pid(p.prestataire))}, ${p.couple ? q(cid(p.couple)) : 'null'},
   ${p.offre ? q(p.offre) + '::niveau_offre' : 'null'}, ${n(p.montant)}, ${q(p.moyen)}, ${q(p.date)})`).join(',\n'));
w(`on conflict (id) do update set statut = excluded.statut, montant_fcfa = excluded.montant_fcfa;\n`);

/* --- Litiges -------------------------------------------------------------- */
w('-- Litiges ------------------------------------------------------------------');
w(`insert into litiges (id, couple_id, prestataire_id, objet, detail, montant_fcfa, statut, priorite, ouvert_le) values`);
w(L.map(l => `  (${q(uid('litige', l.id))}, ${q(cid(l.couple))}, ${q(pid(l.prestataire))}, ${q(l.objet)},
   ${q(l.detail)}, ${n(l.montant)}, ${q(l.statut)}::statut_litige, ${q(l.priorite)}, ${q(l.ouvertLe)})`).join(',\n'));
w(`on conflict (id) do update set statut = excluded.statut, detail = excluded.detail;\n`);

/* --- Articles ------------------------------------------------------------- */
w('-- Articles -----------------------------------------------------------------');
w(`insert into articles (id, slug, titre, categorie, auteur_nom, statut, vues, mots_cles, publie_le, cree_le) values`);
w(ART.map(a => `  (${q(uid('article', a.id))}, ${q(slugify(a.titre))}, ${q(a.titre)}, ${q(a.categorie)},
   ${q(a.auteur)}, ${q(a.statut)}::statut_article, ${n(a.vues)}, ${q(a.motsCles)},
   ${a.statut === 'publie' ? q(a.date) : 'null'}, ${q(a.date)})`).join(',\n'));
w(`on conflict (id) do update set
  titre = excluded.titre, categorie = excluded.categorie, statut = excluded.statut, vues = excluded.vues;\n`);

/* --- Trafic --------------------------------------------------------------- */
w('-- Trafic -------------------------------------------------------------------');
w(`insert into trafic (mois, annee, ordre, sessions, inscriptions, devis) values`);
w(T.map((t, i) => `  (${q(t.mois)}, 2026, ${i}, ${n(t.sessions)}, ${n(t.inscriptions)}, ${n(t.devis)})`).join(',\n'));
w(`on conflict (mois, annee) do update set
  sessions = excluded.sessions, inscriptions = excluded.inscriptions, devis = excluded.devis;\n`);

/* --- Remise en état des agrégats ------------------------------------------ */
w(`-- Les déclencheurs ont recalculé notes et tarifs pendant l'insertion.
-- On restaure les valeurs de démonstration pour les fiches sans avis saisi.
update prestataires set note_moyenne = v.note, nb_avis = v.nb
from (values
${P.map(p => `  (${q(pid(p.id))}::uuid, ${n(p.note)}::numeric, ${n(p.avis)}::int)`).join(',\n')}
) as v(id, note, nb)
where prestataires.id = v.id and prestataires.nb_avis = 0;

select 'Jeu de démonstration installé' as resultat,
       (select count(*) from prestataires) as prestataires,
       (select count(*) from services)     as services,
       (select count(*) from devis)        as devis;`);

fs.writeFileSync(new URL('../db/03_donnees_demo.sql', import.meta.url), out.join('\n'), 'utf8');
console.log('db/03_donnees_demo.sql écrit —',
  P.length, 'prestataires,', S.length, 'services,', C.length, 'couples,',
  D.length, 'devis,', A.length, 'avis,', PAY.length, 'paiements,',
  L.length, 'litiges,', ART.length, 'articles.');
