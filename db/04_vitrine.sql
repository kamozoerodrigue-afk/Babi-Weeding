-- ============================================================================
--  BABI WEDDING — ce dont le site vitrine a besoin
--  À exécuter APRÈS 02_ajustements.sql. Idempotent.
--
--  La page d'accueil affiche des compteurs (couples inscrits, devis envoyés)
--  qui portent sur des tables volontairement fermées aux visiteurs. Plutôt
--  que d'ouvrir ces tables, on expose une fonction qui ne rend que des
--  totaux : aucune ligne, aucun nom, aucun montant ne sort de la base.
-- ============================================================================

create or replace function public.statistiques_publiques()
returns table (
  prestataires int,
  certifies    int,
  couples      int,
  devis        int,
  villes       int,
  categories   int,
  avis         int,
  articles     int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*)::int from prestataires where statut = 'valide'),
    (select count(*)::int from prestataires where statut = 'valide' and certifie),
    (select count(*)::int from couples),
    (select count(*)::int from devis),
    (select count(*)::int from villes where actif),
    (select count(*)::int from categories where actif),
    (select count(*)::int from avis where statut = 'publie'),
    (select count(*)::int from articles where statut = 'publie');
$$;

grant execute on function public.statistiques_publiques() to anon, authenticated;

comment on function public.statistiques_publiques is
  'Totaux affichés sur la page d''accueil. Ne rend aucune donnée nominative.';

-- ----------------------------------------------------------------------------
--  Nombre de prestataires par catégorie, pour la grille de la page d'accueil
--  et les décomptes des filtres du catalogue.
-- ----------------------------------------------------------------------------
drop view if exists categories_publiques cascade;
create view categories_publiques as
select c.id, c.label, c.singulier, c.icone, c.ordre,
       count(p.id)::int as nb_prestataires
from categories c
left join prestataires p on p.categorie_id = c.id and p.statut = 'valide'
where c.actif
group by c.id, c.label, c.singulier, c.icone, c.ordre
order by c.ordre;

grant select on categories_publiques to anon, authenticated;

-- ----------------------------------------------------------------------------
--  Vérification
-- ----------------------------------------------------------------------------
do $$
declare r record;
begin
  select * into r from statistiques_publiques();
  raise notice 'Prestataires validés : % · couples : % · devis : % · articles publiés : %',
    r.prestataires, r.couples, r.devis, r.articles;
end $$;
