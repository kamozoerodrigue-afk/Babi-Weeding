/* ==========================================================================
   BABI WEDDING — configuration de la base de données

   Renseignez ici les deux valeurs publiques de votre projet Supabase.
   Tableau de bord Supabase → Project Settings → API Keys.

   La clé anon (dite « publishable ») est faite pour vivre dans le navigateur :
   c'est la sécurité au niveau des lignes, définie dans db/schema.sql, qui
   protège réellement les données. Ne collez JAMAIS ici la clé service_role.

   Si les deux champs restent vides, les pages basculent automatiquement sur
   le jeu de démonstration hors ligne (assets/js/demo-data.js).
   ========================================================================== */
window.BW_CONFIG = {
  url: 'https://hpsvxzpovrafsolxkwto.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwc3Z4enBvdnJhZnNvbHhrd3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTM2NDcsImV4cCI6MjEwMzY2OTY0N30.k_oGLqbf8FkOu_1rZg9nyNPvTNOtkIL_jVskxyHKPg8',

  /* Numéro de version du code. Il est ajouté à l'adresse des scripts pour
     qu'une mise à jour ne reste jamais coincée dans le cache du navigateur.
     Incrémentez-le après chaque modification des fichiers de assets/js/. */
  version: '3',

  /* Adresse du SDK Supabase. Laissez tel quel. */
  sdk: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
};
