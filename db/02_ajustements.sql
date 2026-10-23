-- ============================================================================
--  BABI WEDDING — ajustements du schéma (à exécuter APRÈS schema.sql)
--
--  Ce fichier aligne la base sur ce que consomment réellement les quatre
--  surfaces (vitrine, marketplace, portail pro, panel admin) et l'application
--  mobile. Il est idempotent : rejouable sans risque.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  1. PRESTATAIRES — un profil peut exister sans compte rattaché
--     (profil créé par l'administration, ou jeu de démonstration)
-- ---------------------------------------------------------------------------
alter table prestataires alter column proprietaire drop not null;
alter table prestataires add column if not exists email_contact text;
alter table prestataires add column if not exists tel_contact   text;

-- ---------------------------------------------------------------------------
--  2. COUPLES — le panel admin affiche l'email, le téléphone et l'état
-- ---------------------------------------------------------------------------
alter table couples alter column profil_id drop not null;
alter table couples drop constraint if exists couples_profil_id_key;
create unique index if not exists idx_couples_profil on couples (profil_id) where profil_id is not null;
alter table couples add column if not exists email  text;
alter table couples add column if not exists tel    text;
alter table couples add column if not exists statut text not null default 'actif';

-- ---------------------------------------------------------------------------
--  3. DEVIS — la marketplace envoie aussi le nom et l'email du demandeur
-- ---------------------------------------------------------------------------
alter table devis alter column date_evenement drop not null;
alter table devis add column if not exists contact_nom   text;
alter table devis add column if not exists contact_email text;
alter table devis add column if not exists contact_tel   text;

-- ---------------------------------------------------------------------------
--  4. AVIS — traçabilité du signalement
-- ---------------------------------------------------------------------------
alter table avis add column if not exists signale_par uuid references prestataires(id) on delete set null;

-- ---------------------------------------------------------------------------
--  5. PAIEMENTS — date d'opération distincte de la date d'enregistrement
-- ---------------------------------------------------------------------------
alter table paiements add column if not exists date_operation date not null default current_date;

-- ---------------------------------------------------------------------------
--  6. ARTICLES — nom d'auteur libre déjà présent, on ajoute le temps de lecture
-- ---------------------------------------------------------------------------
alter table articles add column if not exists minutes_lecture int not null default 5;

-- ---------------------------------------------------------------------------
--  7. TRAFIC — série mensuelle affichée dans les graphiques du panel admin
-- ---------------------------------------------------------------------------
create table if not exists trafic (
  id            uuid primary key default uuid_generate_v4(),
  mois          text not null,
  annee         int  not null default extract(year from now()),
  ordre         int  not null default 0,
  sessions      int  not null default 0,
  inscriptions  int  not null default 0,
  devis         int  not null default 0,
  unique (mois, annee)
);

alter table trafic enable row level security;
drop policy if exists trafic_lecture on trafic;
create policy trafic_lecture on trafic for select using (true);
drop policy if exists trafic_ecriture on trafic;
create policy trafic_ecriture on trafic for all using (est_admin()) with check (est_admin());

-- ---------------------------------------------------------------------------
--  8. POLITIQUES REVUES
--     La table prestataires n'est plus lisible par le public : les coordonnées
--     directes y vivent. Le catalogue public passe par les vues ci-dessous.
-- ---------------------------------------------------------------------------
drop policy if exists presta_lecture_publique on prestataires;
drop policy if exists presta_lecture on prestataires;
create policy presta_lecture on prestataires
  for select using (proprietaire = auth.uid() or est_admin());

drop policy if exists presta_creation on prestataires;
create policy presta_creation on prestataires
  for insert with check (proprietaire = auth.uid() or est_admin());

drop policy if exists presta_suppression on prestataires;
create policy presta_suppression on prestataires
  for delete using (est_admin());

-- Le verrou anti-auto-validation ne doit pas bloquer l'administration
-- ni les profils sans propriétaire créés par l'admin.
create or replace function public.verrouiller_champs_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not est_admin() then
    new.statut     := old.statut;
    new.certifie   := old.certifie;
    new.sponsorise := old.sponsorise;
    new.offre      := old.offre;
  end if;
  new.maj_le := now();
  return new;
end $$;

-- Services : suppression réservée au propriétaire et à l'admin
drop policy if exists services_lecture on services;
create policy services_lecture on services
  for select using (possede_prestataire(prestataire_id) or est_admin());

-- Devis : un visiteur non connecté peut demander un devis depuis la fiche
drop policy if exists devis_creation on devis;
create policy devis_creation on devis
  for insert with check (
    couple_id = mon_couple_id()
    or est_admin()
    or couple_id is null
  );
alter table devis alter column couple_id drop not null;

-- ---------------------------------------------------------------------------
--  9. VUES PUBLIQUES
--     Ce sont elles que consomment la vitrine, la marketplace et le mobile.
-- ---------------------------------------------------------------------------
drop view if exists prestataires_publics cascade;
create view prestataires_publics as
select
  p.id, p.slug, p.nom, p.categorie_id, p.ville, p.commune,
  p.statut, p.certifie, p.sponsorise, p.accroche, p.description, p.capacite,
  p.delai_reponse, p.prix_min_fcfa, p.unite_prix, p.photos,
  p.note_moyenne, p.nb_avis, p.offre, p.cree_le,
  c.label     as categorie_label,
  c.singulier as categorie_singulier,
  c.icone     as categorie_icone,
  p.contact->>'nom'    as contact_nom,
  p.contact->>'role'   as contact_role,
  p.contact->>'avatar' as contact_avatar
from prestataires p
join categories c on c.id = p.categorie_id
where p.statut = 'valide';

comment on view prestataires_publics is
  'Catalogue public. Les champs email et téléphone du JSON contact sont volontairement exclus.';

drop view if exists services_publics cascade;
create view services_publics as
select s.id, s.prestataire_id, s.nom, s.description, s.prix_fcfa,
       s.unite, s.duree, s.inclus, s.ordre, s.cree_le
from services s
join prestataires p on p.id = s.prestataire_id
where s.actif and p.statut = 'valide';

drop view if exists avis_publics cascade;
create view avis_publics as
select a.id, a.prestataire_id, a.note, a.texte, a.reponse_prestataire, a.cree_le,
       c.noms as couple_noms
from avis a
join couples c on c.id = a.couple_id
where a.statut = 'publie';

drop view if exists articles_publics cascade;
create view articles_publics as
select id, slug, titre, chapo, contenu, categorie, auteur_nom, image_url,
       mots_cles, meta_desc, vues, minutes_lecture, publie_le
from articles
where statut = 'publie';

grant select on prestataires_publics, services_publics, avis_publics, articles_publics to anon, authenticated;

-- ---------------------------------------------------------------------------
--  10. COMPTEUR DE VUES D'ARTICLE (écriture publique contrôlée)
-- ---------------------------------------------------------------------------
create or replace function public.incrementer_vues(article_slug text)
returns void language sql security definer set search_path = public as $$
  update articles set vues = vues + 1 where slug = article_slug and statut = 'publie';
$$;
grant execute on function public.incrementer_vues(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
--  11. TEMPS RÉEL — les onglets ouverts se synchronisent entre eux
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['prestataires','services','devis','avis','paiements',
                           'litiges','articles','couples','messages','conversations']
  loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null;
             when undefined_object  then null;
    end;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
--  12. VÉRIFICATION
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n from pg_policies where schemaname = 'public';
  raise notice 'Politiques RLS actives : %', n;
  select count(*) into n from pg_views where schemaname = 'public'
    and viewname in ('prestataires_publics','services_publics','avis_publics','articles_publics');
  raise notice 'Vues publiques : % sur 4', n;
end $$;
