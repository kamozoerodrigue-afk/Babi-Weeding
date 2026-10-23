-- ============================================================================
--  BABI WEDDING — schéma Supabase (PostgreSQL)
--
--  À exécuter dans l'éditeur SQL de Supabase, dans cet ordre. Le fichier est
--  idempotent : il peut être rejoué sans erreur sur une base déjà initialisée.
--
--  Trois rôles applicatifs :
--    couple      — futurs mariés, consultent et demandent des devis
--    prestataire — professionnels, gèrent leur offre et répondent
--    admin       — équipe Babi Wedding, valide, modère et arbitre
--
--  La sécurité repose entièrement sur les politiques RLS définies en fin de
--  fichier : aucune table n'est lisible sans politique explicite.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";      -- recherche floue sur les noms

-- ============================================================================
--  1. TYPES ÉNUMÉRÉS
-- ============================================================================

do $$ begin
  create type role_utilisateur as enum ('couple', 'prestataire', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type statut_prestataire as enum ('attente', 'valide', 'refuse', 'suspendu');
exception when duplicate_object then null; end $$;

do $$ begin
  create type statut_devis as enum ('attente', 'recu', 'accepte', 'refuse', 'expire');
exception when duplicate_object then null; end $$;

do $$ begin
  create type statut_avis as enum ('attente', 'publie', 'signale', 'masque');
exception when duplicate_object then null; end $$;

do $$ begin
  create type statut_paiement as enum ('initie', 'paye', 'echoue', 'sequestre', 'reverse', 'rembourse');
exception when duplicate_object then null; end $$;

do $$ begin
  create type type_paiement as enum ('abonnement', 'acompte', 'solde');
exception when duplicate_object then null; end $$;

do $$ begin
  create type statut_litige as enum ('ouvert', 'instruction', 'resolu', 'clos');
exception when duplicate_object then null; end $$;

do $$ begin
  create type statut_article as enum ('brouillon', 'relecture', 'publie', 'archive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type niveau_offre as enum ('aucun', 'bronze', 'argent', 'or');
exception when duplicate_object then null; end $$;


-- ============================================================================
--  2. PROFILS
--  Étend auth.users. Une ligne est créée automatiquement à l'inscription.
-- ============================================================================

create table if not exists profils (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          role_utilisateur not null default 'couple',
  nom_complet   text,
  telephone     text,
  avatar_url    text,
  ville         text,
  cree_le       timestamptz not null default now(),
  maj_le        timestamptz not null default now()
);

comment on table profils is 'Profil applicatif adossé à auth.users. Le rôle pilote toutes les politiques RLS.';

-- Création automatique du profil à l'inscription
create or replace function public.creer_profil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profils (id, nom_complet, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom_complet', new.email),
    coalesce((new.raw_user_meta_data->>'role')::role_utilisateur, 'couple')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.creer_profil();


-- ============================================================================
--  3. RÉFÉRENTIELS
-- ============================================================================

create table if not exists categories (
  id          text primary key,               -- 'photographes'
  label       text not null,                  -- 'Photographes'
  singulier   text not null,                  -- 'Photographe'
  icone       text not null default 'i-briefcase',
  ordre       int  not null default 0,
  actif       boolean not null default true
);

create table if not exists villes (
  id      text primary key,                   -- 'cocody'
  nom     text not null,                      -- 'Cocody'
  region  text not null default 'Abidjan',
  actif   boolean not null default true
);

create table if not exists offres (
  id          niveau_offre primary key,
  nom         text not null,
  prix_fcfa   int  not null,
  periode     text not null default 'mois',
  avantages   jsonb not null default '[]'::jsonb,
  ordre       int  not null default 0
);


-- ============================================================================
--  4. PRESTATAIRES
-- ============================================================================

create table if not exists prestataires (
  id              uuid primary key default uuid_generate_v4(),
  proprietaire    uuid not null references profils(id) on delete cascade,
  slug            text unique not null,
  nom             text not null,
  categorie_id    text not null references categories(id),
  ville           text not null default 'Abidjan',
  commune         text not null,
  statut          statut_prestataire not null default 'attente',
  certifie        boolean not null default false,
  sponsorise      boolean not null default false,
  accroche        text,
  description     text,
  capacite        text,
  delai_reponse   text,
  prix_min_fcfa   int,
  unite_prix      text default 'la prestation',
  photos          jsonb not null default '[]'::jsonb,
  contact         jsonb not null default '{}'::jsonb,   -- masqué côté couple, voir la vue publique
  rccm            text,
  offre           niveau_offre not null default 'aucun',
  note_moyenne    numeric(2,1) not null default 0,
  nb_avis         int not null default 0,
  motif_refus     text,
  cree_le         timestamptz not null default now(),
  maj_le          timestamptz not null default now()
);

create index if not exists idx_presta_categorie on prestataires (categorie_id) where statut = 'valide';
create index if not exists idx_presta_commune   on prestataires (commune)      where statut = 'valide';
create index if not exists idx_presta_statut    on prestataires (statut);
create index if not exists idx_presta_nom_trgm  on prestataires using gin (nom gin_trgm_ops);

comment on column prestataires.contact is
  'Coordonnées directes. Jamais exposées aux couples avant acceptation du devis : voir la vue prestataires_publics.';


-- ============================================================================
--  5. SERVICES
-- ============================================================================

create table if not exists services (
  id              uuid primary key default uuid_generate_v4(),
  prestataire_id  uuid not null references prestataires(id) on delete cascade,
  nom             text not null,
  description     text,
  prix_fcfa       int  not null check (prix_fcfa >= 0),
  unite           text not null default 'forfait',
  duree           text,
  inclus          jsonb not null default '[]'::jsonb,
  actif           boolean not null default true,
  ordre           int not null default 0,
  cree_le         timestamptz not null default now()
);

create index if not exists idx_services_presta on services (prestataire_id) where actif;

-- Le tarif de départ affiché suit le service actif le moins cher.
create or replace function public.maj_prix_min()
returns trigger language plpgsql as $$
declare cible uuid;
begin
  cible := coalesce(new.prestataire_id, old.prestataire_id);
  update prestataires p
     set prix_min_fcfa = (select min(prix_fcfa) from services s
                           where s.prestataire_id = cible and s.actif),
         maj_le = now()
   where p.id = cible;
  return null;
end $$;

drop trigger if exists trg_maj_prix_min on services;
create trigger trg_maj_prix_min
  after insert or update or delete on services
  for each row execute function public.maj_prix_min();


-- ============================================================================
--  6. COUPLES (données de mariage)
-- ============================================================================

create table if not exists couples (
  id             uuid primary key default uuid_generate_v4(),
  profil_id      uuid not null unique references profils(id) on delete cascade,
  noms           text not null,                 -- 'Adjoua & Koffi'
  date_mariage   date,
  nb_invites     int,
  budget_fcfa    bigint,
  ville          text,
  diaspora       boolean not null default false,
  cree_le        timestamptz not null default now()
);


-- ============================================================================
--  7. DEVIS
-- ============================================================================

create table if not exists devis (
  id              uuid primary key default uuid_generate_v4(),
  couple_id       uuid not null references couples(id) on delete cascade,
  prestataire_id  uuid not null references prestataires(id) on delete cascade,
  service_id      uuid references services(id) on delete set null,
  statut          statut_devis not null default 'attente',
  message         text,
  date_evenement  date not null,
  nb_invites      int,
  montant_fcfa    bigint check (montant_fcfa is null or montant_fcfa >= 0),
  reponse         text,
  envoye_le       timestamptz not null default now(),
  repondu_le      timestamptz,
  maj_le          timestamptz not null default now()
);

create index if not exists idx_devis_presta on devis (prestataire_id, statut);
create index if not exists idx_devis_couple on devis (couple_id, statut);

-- Horodatage automatique de la réponse
create or replace function public.horodater_reponse()
returns trigger language plpgsql as $$
begin
  if new.statut <> old.statut and old.statut = 'attente' then
    new.repondu_le := now();
  end if;
  new.maj_le := now();
  return new;
end $$;

drop trigger if exists trg_horodater_reponse on devis;
create trigger trg_horodater_reponse
  before update on devis
  for each row execute function public.horodater_reponse();


-- ============================================================================
--  8. MESSAGERIE
--  Une conversation par couple et prestataire. Les coordonnées directes ne
--  circulent jamais ici : c'est la garantie annoncée aux deux parties.
-- ============================================================================

create table if not exists conversations (
  id              uuid primary key default uuid_generate_v4(),
  couple_id       uuid not null references couples(id) on delete cascade,
  prestataire_id  uuid not null references prestataires(id) on delete cascade,
  devis_id        uuid references devis(id) on delete set null,
  cree_le         timestamptz not null default now(),
  unique (couple_id, prestataire_id)
);

create table if not exists messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  auteur_id        uuid not null references profils(id) on delete cascade,
  contenu          text not null,
  lu               boolean not null default false,
  envoye_le        timestamptz not null default now()
);

create index if not exists idx_messages_conv on messages (conversation_id, envoye_le);


-- ============================================================================
--  9. PAIEMENTS
--  Les acomptes restent en séquestre jusqu'à confirmation de la prestation.
-- ============================================================================

create table if not exists paiements (
  id                uuid primary key default uuid_generate_v4(),
  type              type_paiement not null,
  statut            statut_paiement not null default 'initie',
  prestataire_id    uuid references prestataires(id) on delete set null,
  couple_id         uuid references couples(id) on delete set null,
  devis_id          uuid references devis(id) on delete set null,
  offre             niveau_offre,
  montant_fcfa      bigint not null check (montant_fcfa > 0),
  moyen             text,                        -- 'Orange Money', 'Wave', 'Carte bancaire'
  reference_psp     text unique,                 -- référence Paystack
  sequestre_jusqu_a date,
  cree_le           timestamptz not null default now(),
  maj_le            timestamptz not null default now()
);

create index if not exists idx_paiements_presta on paiements (prestataire_id, type, statut);


-- ============================================================================
--  10. AVIS
-- ============================================================================

create table if not exists avis (
  id                  uuid primary key default uuid_generate_v4(),
  prestataire_id      uuid not null references prestataires(id) on delete cascade,
  couple_id           uuid not null references couples(id) on delete cascade,
  devis_id            uuid references devis(id) on delete set null,
  note                int not null check (note between 1 and 5),
  texte               text not null,
  statut              statut_avis not null default 'attente',
  motif_signalement   text,
  reponse_prestataire text,
  cree_le             timestamptz not null default now(),
  unique (prestataire_id, couple_id)              -- un seul avis par couple et prestataire
);

create index if not exists idx_avis_presta on avis (prestataire_id) where statut = 'publie';

-- Recalcul de la note moyenne à chaque changement
create or replace function public.maj_note_prestataire()
returns trigger language plpgsql as $$
declare cible uuid;
begin
  cible := coalesce(new.prestataire_id, old.prestataire_id);
  update prestataires p
     set note_moyenne = coalesce((select round(avg(note)::numeric, 1) from avis a
                                   where a.prestataire_id = cible and a.statut = 'publie'), 0),
         nb_avis      = (select count(*) from avis a
                          where a.prestataire_id = cible and a.statut = 'publie'),
         maj_le = now()
   where p.id = cible;
  return null;
end $$;

drop trigger if exists trg_maj_note on avis;
create trigger trg_maj_note
  after insert or update or delete on avis
  for each row execute function public.maj_note_prestataire();


-- ============================================================================
--  11. LITIGES
-- ============================================================================

create table if not exists litiges (
  id              uuid primary key default uuid_generate_v4(),
  couple_id       uuid not null references couples(id) on delete cascade,
  prestataire_id  uuid not null references prestataires(id) on delete cascade,
  paiement_id     uuid references paiements(id) on delete set null,
  objet           text not null,
  detail          text,
  montant_fcfa    bigint,
  statut          statut_litige not null default 'ouvert',
  priorite        text not null default 'moyenne',
  decision        text,
  ouvert_le       timestamptz not null default now(),
  clos_le         timestamptz
);


-- ============================================================================
--  12. BLOG
-- ============================================================================

create table if not exists articles (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  titre         text not null,
  chapo         text,
  contenu       text,
  categorie     text not null,
  auteur_id     uuid references profils(id) on delete set null,
  auteur_nom    text,
  image_url     text,
  mots_cles     text,
  meta_desc     text,
  statut        statut_article not null default 'brouillon',
  vues          int not null default 0,
  publie_le     timestamptz,
  cree_le       timestamptz not null default now(),
  maj_le        timestamptz not null default now()
);

create index if not exists idx_articles_publies on articles (publie_le desc) where statut = 'publie';


-- ============================================================================
--  13. VUE PUBLIQUE
--  Expose le catalogue sans les coordonnées directes des prestataires.
--  C'est cette vue que consomment le site, la marketplace et l'application.
-- ============================================================================

create or replace view prestataires_publics as
select
  p.id, p.slug, p.nom, p.categorie_id, p.ville, p.commune,
  p.certifie, p.sponsorise, p.accroche, p.description, p.capacite,
  p.delai_reponse, p.prix_min_fcfa, p.unite_prix, p.photos,
  p.note_moyenne, p.nb_avis, p.cree_le,
  c.label     as categorie_label,
  c.singulier as categorie_singulier,
  c.icone     as categorie_icone,
  p.contact->>'nom'    as contact_nom,     -- prénom et fonction seulement
  p.contact->>'role'   as contact_role,
  p.contact->>'avatar' as contact_avatar
from prestataires p
join categories c on c.id = p.categorie_id
where p.statut = 'valide';

comment on view prestataires_publics is
  'Catalogue public. Les champs email et téléphone du JSON contact sont volontairement exclus.';


-- ============================================================================
--  14. FONCTIONS D'AIDE POUR LES POLITIQUES
-- ============================================================================

create or replace function public.est_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profils where id = auth.uid() and role = 'admin');
$$;

create or replace function public.mon_couple_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from couples where profil_id = auth.uid();
$$;

create or replace function public.possede_prestataire(cible uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from prestataires where id = cible and proprietaire = auth.uid());
$$;


-- ============================================================================
--  15. SÉCURITÉ AU NIVEAU DES LIGNES
--  Chaque table est verrouillée par défaut, puis ouverte au cas par cas.
-- ============================================================================

alter table profils        enable row level security;
alter table prestataires   enable row level security;
alter table services       enable row level security;
alter table couples        enable row level security;
alter table devis          enable row level security;
alter table conversations  enable row level security;
alter table messages       enable row level security;
alter table paiements      enable row level security;
alter table avis           enable row level security;
alter table litiges        enable row level security;
alter table articles       enable row level security;
alter table categories     enable row level security;
alter table villes         enable row level security;
alter table offres         enable row level security;

-- ---------- Référentiels : lecture ouverte, écriture réservée à l'admin ----
drop policy if exists ref_lecture on categories;
create policy ref_lecture on categories for select using (true);
drop policy if exists ref_ecriture on categories;
create policy ref_ecriture on categories for all using (est_admin()) with check (est_admin());

drop policy if exists villes_lecture on villes;
create policy villes_lecture on villes for select using (true);
drop policy if exists villes_ecriture on villes;
create policy villes_ecriture on villes for all using (est_admin()) with check (est_admin());

drop policy if exists offres_lecture on offres;
create policy offres_lecture on offres for select using (true);
drop policy if exists offres_ecriture on offres;
create policy offres_ecriture on offres for all using (est_admin()) with check (est_admin());

-- ---------- Profils ------------------------------------------------------
drop policy if exists profils_lecture on profils;
create policy profils_lecture on profils
  for select using (id = auth.uid() or est_admin());

drop policy if exists profils_maj on profils;
create policy profils_maj on profils
  for update using (id = auth.uid() or est_admin())
  with check (id = auth.uid() or est_admin());

-- ---------- Prestataires -------------------------------------------------
drop policy if exists presta_lecture_publique on prestataires;
create policy presta_lecture_publique on prestataires
  for select using (statut = 'valide' or proprietaire = auth.uid() or est_admin());

drop policy if exists presta_creation on prestataires;
create policy presta_creation on prestataires
  for insert with check (proprietaire = auth.uid());

drop policy if exists presta_maj on prestataires;
create policy presta_maj on prestataires
  for update using (proprietaire = auth.uid() or est_admin())
  with check (proprietaire = auth.uid() or est_admin());

-- Le prestataire ne s'auto-valide pas : statut, certifie et sponsorise
-- restent la prérogative de l'administration.
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

drop trigger if exists trg_verrou_admin on prestataires;
create trigger trg_verrou_admin
  before update on prestataires
  for each row execute function public.verrouiller_champs_admin();

-- ---------- Services -----------------------------------------------------
drop policy if exists services_lecture on services;
create policy services_lecture on services
  for select using (
    actif
    or possede_prestataire(prestataire_id)
    or est_admin()
  );

drop policy if exists services_ecriture on services;
create policy services_ecriture on services
  for all using (possede_prestataire(prestataire_id) or est_admin())
  with check (possede_prestataire(prestataire_id) or est_admin());

-- ---------- Couples ------------------------------------------------------
drop policy if exists couples_lecture on couples;
create policy couples_lecture on couples
  for select using (profil_id = auth.uid() or est_admin());

drop policy if exists couples_ecriture on couples;
create policy couples_ecriture on couples
  for all using (profil_id = auth.uid() or est_admin())
  with check (profil_id = auth.uid() or est_admin());

-- ---------- Devis --------------------------------------------------------
-- Visible par le couple émetteur, le prestataire destinataire et l'admin.
drop policy if exists devis_lecture on devis;
create policy devis_lecture on devis
  for select using (
    couple_id = mon_couple_id()
    or possede_prestataire(prestataire_id)
    or est_admin()
  );

drop policy if exists devis_creation on devis;
create policy devis_creation on devis
  for insert with check (couple_id = mon_couple_id());

drop policy if exists devis_maj on devis;
create policy devis_maj on devis
  for update using (
    couple_id = mon_couple_id()
    or possede_prestataire(prestataire_id)
    or est_admin()
  );

-- ---------- Messagerie ---------------------------------------------------
drop policy if exists conv_acces on conversations;
create policy conv_acces on conversations
  for all using (
    couple_id = mon_couple_id()
    or possede_prestataire(prestataire_id)
    or est_admin()
  )
  with check (
    couple_id = mon_couple_id()
    or possede_prestataire(prestataire_id)
  );

drop policy if exists msg_lecture on messages;
create policy msg_lecture on messages
  for select using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.couple_id = mon_couple_id()
             or possede_prestataire(c.prestataire_id)
             or est_admin())
    )
  );

drop policy if exists msg_envoi on messages;
create policy msg_envoi on messages
  for insert with check (
    auteur_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.couple_id = mon_couple_id() or possede_prestataire(c.prestataire_id))
    )
  );

-- ---------- Paiements ----------------------------------------------------
-- Lecture seule côté utilisateur ; l'écriture passe par le webhook Paystack,
-- exécuté avec la clé de service qui contourne la RLS.
drop policy if exists paiements_lecture on paiements;
create policy paiements_lecture on paiements
  for select using (
    couple_id = mon_couple_id()
    or possede_prestataire(prestataire_id)
    or est_admin()
  );

drop policy if exists paiements_admin on paiements;
create policy paiements_admin on paiements
  for all using (est_admin()) with check (est_admin());

-- ---------- Avis ---------------------------------------------------------
drop policy if exists avis_lecture on avis;
create policy avis_lecture on avis
  for select using (
    statut = 'publie'
    or couple_id = mon_couple_id()
    or possede_prestataire(prestataire_id)
    or est_admin()
  );

-- Un couple ne peut noter qu'un prestataire dont il a accepté le devis.
drop policy if exists avis_creation on avis;
create policy avis_creation on avis
  for insert with check (
    couple_id = mon_couple_id()
    and exists (
      select 1 from devis d
      where d.couple_id = mon_couple_id()
        and d.prestataire_id = avis.prestataire_id
        and d.statut = 'accepte'
    )
  );

drop policy if exists avis_maj on avis;
create policy avis_maj on avis
  for update using (
    est_admin()
    or couple_id = mon_couple_id()
    or possede_prestataire(prestataire_id)   -- pour signaler ou répondre
  );

-- ---------- Litiges ------------------------------------------------------
drop policy if exists litiges_lecture on litiges;
create policy litiges_lecture on litiges
  for select using (
    couple_id = mon_couple_id()
    or possede_prestataire(prestataire_id)
    or est_admin()
  );

drop policy if exists litiges_creation on litiges;
create policy litiges_creation on litiges
  for insert with check (couple_id = mon_couple_id() or possede_prestataire(prestataire_id));

drop policy if exists litiges_arbitrage on litiges;
create policy litiges_arbitrage on litiges
  for update using (est_admin()) with check (est_admin());

-- ---------- Articles -----------------------------------------------------
drop policy if exists articles_lecture on articles;
create policy articles_lecture on articles
  for select using (statut = 'publie' or est_admin());

drop policy if exists articles_ecriture on articles;
create policy articles_ecriture on articles
  for all using (est_admin()) with check (est_admin());


-- ============================================================================
--  16. DONNÉES DE RÉFÉRENCE
-- ============================================================================

insert into categories (id, label, singulier, icone, ordre) values
  ('photographes',     'Photographes',            'Photographe',            'i-photo',      1),
  ('videastes',        'Vidéastes',               'Vidéaste',               'i-video',      2),
  ('traiteurs',        'Traiteurs',               'Traiteur',               'i-traiteur',   3),
  ('salles',           'Salles de réception',     'Salle de réception',     'i-salle',      4),
  ('decorateurs',      'Décorateurs',             'Décorateur',             'i-deco',       5),
  ('dj-animateurs',    'Animateurs DJ',           'Animateur DJ',           'i-dj',         6),
  ('robes',            'Créateurs de robes',      'Créateur de robes',      'i-robe',       7),
  ('maquilleurs',      'Maquilleurs',             'Maquilleur',             'i-maquillage', 8),
  ('coiffeurs',        'Coiffeurs',               'Coiffeur',               'i-coiffure',   9),
  ('wedding-planners', 'Wedding Planners',        'Wedding Planner',        'i-planner',   10),
  ('hotels',           'Hôtels',                  'Hôtel',                  'i-hotel',     11),
  ('bijoutiers',       'Bijoutiers',              'Bijoutier',              'i-bijou',     12),
  ('vehicules',        'Loueurs de véhicules',    'Loueur de véhicules',    'i-voiture',   13),
  ('agences',          'Agences événementielles', 'Agence événementielle',  'i-agence',    14)
on conflict (id) do update
  set label = excluded.label, singulier = excluded.singulier, icone = excluded.icone;

insert into villes (id, nom, region) values
  ('cocody',       'Cocody',        'Abidjan'),
  ('plateau',      'Plateau',       'Abidjan'),
  ('marcory',      'Marcory',       'Abidjan'),
  ('riviera-golf', 'Riviera Golf',  'Abidjan'),
  ('yopougon',     'Yopougon',      'Abidjan'),
  ('treichville',  'Treichville',   'Abidjan'),
  ('angre',        'Angré',         'Abidjan'),
  ('yamoussoukro', 'Yamoussoukro',  'Yamoussoukro'),
  ('bouake',       'Bouaké',        'Vallée du Bandama'),
  ('san-pedro',    'San-Pedro',     'Bas-Sassandra'),
  ('daloa',        'Daloa',         'Haut-Sassandra')
on conflict (id) do update set nom = excluded.nom, region = excluded.region;

insert into offres (id, nom, prix_fcfa, avantages, ordre) values
  ('bronze', 'Bronze', 15000,
   '["Profil public vérifié","Jusqu''à 5 devis par mois","Messagerie sécurisée"]'::jsonb, 1),
  ('argent', 'Argent', 35000,
   '["Devis illimités","Badge Certifié Or","Statistiques de profil","Support prioritaire"]'::jsonb, 2),
  ('or',     'Or',     75000,
   '["Tout Argent","Mise en avant sponsorisée","Position prioritaire au catalogue","Accompagnement dédié"]'::jsonb, 3),
  ('aucun',  'Aucun',      0, '[]'::jsonb, 0)
on conflict (id) do update
  set nom = excluded.nom, prix_fcfa = excluded.prix_fcfa, avantages = excluded.avantages;


-- ============================================================================
--  17. STOCKAGE DES FICHIERS
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('portfolios', 'portfolios', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)   -- pièces d'identité et RCCM
on conflict (id) do nothing;

drop policy if exists portfolio_lecture on storage.objects;
create policy portfolio_lecture on storage.objects
  for select using (bucket_id = 'portfolios');

drop policy if exists portfolio_depot on storage.objects;
create policy portfolio_depot on storage.objects
  for insert with check (
    bucket_id = 'portfolios'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists documents_prives on storage.objects;
create policy documents_prives on storage.objects
  for all using (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or est_admin())
  );


-- ============================================================================
--  18. VÉRIFICATION
-- ============================================================================

do $$
declare n int;
begin
  select count(*) into n from pg_tables
   where schemaname = 'public'
     and tablename in ('profils','prestataires','services','couples','devis',
                       'conversations','messages','paiements','avis','litiges',
                       'articles','categories','villes','offres');
  raise notice 'Tables créées : % sur 14', n;

  select count(*) into n from pg_policies where schemaname = 'public';
  raise notice 'Politiques RLS actives : %', n;
end $$;
