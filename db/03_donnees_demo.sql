-- ============================================================================
--  BABI WEDDING — jeu de démonstration
--  Généré automatiquement par outils/generer-seed.mjs. Ne pas éditer à la main.
--  À exécuter APRÈS schema.sql puis 02_ajustements.sql. Idempotent.
-- ============================================================================

-- Prestataires -------------------------------------------------------------
insert into prestataires (id, slug, nom, categorie_id, ville, commune, statut, certifie,
  sponsorise, accroche, description, capacite, delai_reponse, prix_min_fcfa, unite_prix,
  photos, contact, email_contact, tel_contact, rccm, offre, note_moyenne, nb_avis, motif_refus, cree_le) values
  ('7256973e-d860-575e-8404-c4541444b07c', 'studio-lumiere-ci', 'Studio Lumière CI', 'photographes', 'Abidjan', 'Cocody',
   'valide'::statut_prestataire, true, true, 'Reportage complet, drone et album imprimé', 'Neuf ans de reportage de mariage à Abidjan. Nous couvrons la dot, le civil et la réception, avec un second photographe inclus dès le forfait journée. Livraison de 300 photos retouchées sous 21 jours.',
   null, 'Répond en moins de 2 h', 150000, 'la prestation', '["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=72","https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=900&q=72","https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Yao Kouassi","role":"Photographe principal","email":"contact@studiolumiere.ci","tel":"+225 07 00 11 22","avatar":"https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'contact@studiolumiere.ci', '+225 07 00 11 22', 'CI-ABJ-2019-B-14582',
   'or'::niveau_offre, 4.9, 47, null, '2026-02-14'),
  ('16600d08-dd14-505c-836e-226e8f76b364', 'palais-des-saveurs', 'Le Palais des Saveurs', 'traiteurs', 'Abidjan', 'Marcory',
   'valide'::statut_prestataire, true, true, 'Cuisine ivoirienne et internationale, service en salle', 'Menus mixtes attiéké-poisson, kedjenou ou buffet international. Personnel de service, vaisselle et nappage inclus à partir de 100 couverts. Dégustation gratuite avant signature.',
   '50 à 800 invités', 'Répond en moins de 4 h', 8000, 'le couvert', '["https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=72","https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Aminata Bamba","role":"Cheffe et gérante","email":"contact@palaisdessaveurs.ci","tel":"+225 05 44 33 21","avatar":"https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'contact@palaisdessaveurs.ci', '+225 05 44 33 21', 'CI-ABJ-2017-B-09341',
   'or'::niveau_offre, 4.8, 63, null, '2026-01-08'),
  ('13b73d1c-e2a9-59ff-895c-0994e6382344', 'villa-ebene', 'Villa Ébène Réceptions', 'salles', 'Abidjan', 'Riviera Golf',
   'valide'::statut_prestataire, true, false, 'Jardin arboré, salle climatisée et parking 80 places', 'Un domaine de 2 hectares à dix minutes du Golf. Salle climatisée de 400 places, jardin pour la cérémonie laïque, loge des mariés et groupe électrogène de secours.',
   '80 à 500 invités', 'Répond en moins de 24 h', 700000, 'la journée', '["https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=72","https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Serge Adjé","role":"Directeur du domaine","email":"reservation@villaebene.ci","tel":"+225 27 22 41 90","avatar":"https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'reservation@villaebene.ci', '+225 27 22 41 90', 'CI-ABJ-2015-B-03127',
   'argent'::niveau_offre, 4.9, 38, null, '2025-11-22'),
  ('7480d4ce-d04f-5917-806b-5f5a1050e224', 'akwaba-decoration', 'Akwaba Décoration', 'decorateurs', 'Abidjan', 'Plateau',
   'valide'::statut_prestataire, true, true, 'Scénographie wax, kita et fleurs tropicales', 'Décoration de cérémonie coutumière et de réception. Nous dessinons une scénographie sur mesure à partir de vos couleurs et du pagne de la famille, puis installons la veille.',
   null, 'Répond en moins de 6 h', 300000, 'la prestation', '["https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=900&q=72","https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Fatou Koné","role":"Directrice artistique","email":"hello@akwabadeco.ci","tel":"+225 01 55 66 77","avatar":"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'hello@akwabadeco.ci', '+225 01 55 66 77', 'CI-ABJ-2018-B-11209',
   'or'::niveau_offre, 4.7, 29, null, '2026-03-02'),
  ('42c6e85a-8f8c-5acb-8e5d-160519be4eb0', 'dj-kwabo', 'DJ Kwabo Events', 'dj-animateurs', 'Abidjan', 'Yopougon',
   'valide'::statut_prestataire, true, false, 'Coupé-décalé, zouglou et afrobeats jusqu''au bout de la nuit', 'Sonorisation, éclairage et animation micro. Playlist construite avec vous en amont, avec les incontournables de la dot et l''ouverture de bal répétée.',
   null, 'Répond en moins de 3 h', 180000, 'la soirée', '["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=72","https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Kwabo Diarra","role":"DJ et animateur","email":"booking@djkwabo.ci","tel":"+225 07 88 99 00","avatar":"https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'booking@djkwabo.ci', '+225 07 88 99 00', 'CI-ABJ-2016-B-07744',
   'argent'::niveau_offre, 4.8, 51, null, '2026-01-30'),
  ('0c05ffc6-cc99-532a-83ac-b381bc8f1b39', 'awa-beauty', 'Awa Beauty Studio', 'maquilleurs', 'Abidjan', 'Angré',
   'valide'::statut_prestataire, true, false, 'Maquillage longue tenue, essai inclus', 'Maquillage adapté aux carnations foncées et à la chaleur d''Abidjan, tenue garantie 14 heures. Essai en studio inclus, déplacement possible le jour J.',
   null, 'Répond en moins de 1 h', 60000, 'la prestation', '["https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=72","https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Awa Sanogo","role":"Maquilleuse professionnelle","email":"awa@awabeauty.ci","tel":"+225 05 12 34 56","avatar":"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'awa@awabeauty.ci', '+225 05 12 34 56', 'CI-ABJ-2020-B-16630',
   'bronze'::niveau_offre, 5, 24, null, '2026-04-11'),
  ('14c51d1e-716c-572f-863f-78a7b79f2400', 'eclat-studio', 'Éclat Studio Abidjan', 'photographes', 'Abidjan', 'Riviera Golf',
   'valide'::statut_prestataire, true, true, 'Photo et vidéo, équipe de quatre personnes', 'Studio haut de gamme pour les mariages de la diaspora. Équipe de deux photographes et deux vidéastes, teaser livré sous 72 heures et film complet sous 6 semaines.',
   null, 'Répond en moins de 2 h', 550000, 'la prestation', '["https://images.unsplash.com/photo-1521543832500-49e69fb2bea1?auto=format&fit=crop&w=900&q=72","https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Marc-Aurel N''Guessan","role":"Directeur du studio","email":"studio@eclat.ci","tel":"+225 27 21 30 40","avatar":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'studio@eclat.ci', '+225 27 21 30 40', 'CI-ABJ-2014-B-01988',
   'or'::niveau_offre, 5, 58, null, '2025-09-05'),
  ('1a3d05f0-f377-5ad4-8e59-81bc2d95432f', 'baoule-prod', 'Baoulé Prod', 'videastes', 'Yamoussoukro', 'Centre',
   'valide'::statut_prestataire, true, false, 'Film de mariage traditionnel et moderne', 'Spécialiste du mariage coutumier baoulé. Captation multi-caméras de la dot, montage narratif de 25 minutes et version courte pour les réseaux.',
   null, 'Répond en moins de 12 h', 210000, 'la prestation', '["https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=72","https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Konan Brou","role":"Réalisateur","email":"konan@baouleprod.ci","tel":"+225 07 45 67 89","avatar":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'konan@baouleprod.ci', '+225 07 45 67 89', 'CI-YAM-2019-B-00412',
   'bronze'::niveau_offre, 4.7, 12, null, '2026-05-19'),
  ('e6de3b3d-1b82-5b2f-86a1-b394882a3069', 'harmonie-events', 'Harmonie Events CI', 'wedding-planners', 'Abidjan', 'Cocody',
   'attente'::statut_prestataire, false, false, 'Organisation clé en main, coordination du jour J', 'Agence de wedding planning fondée en 2024. Coordination complète de la dot au brunch du lendemain, avec un chef de projet dédié.',
   null, 'Répond en moins de 8 h', 400000, 'la prestation', '["https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Prisca Yao","role":"Fondatrice","email":"prisca@harmonie-events.ci","tel":"+225 05 90 12 34","avatar":"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'prisca@harmonie-events.ci', '+225 05 90 12 34', 'CI-ABJ-2024-B-22105',
   'aucun'::niveau_offre, 0, 0, null, '2026-08-01'),
  ('a48de393-5a4c-569d-8365-a6ff8cb0d16b', 'gold-limousine', 'Gold Limousine Abidjan', 'vehicules', 'Abidjan', 'Marcory',
   'attente'::statut_prestataire, false, false, 'Berlines et limousines avec chauffeur', 'Flotte de six véhicules de prestige avec chauffeur en costume. Décoration florale du capot incluse, cortège possible jusqu''à quatre voitures.',
   null, 'Répond en moins de 5 h', 120000, 'la journée', '["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Ibrahim Touré","role":"Gérant","email":"contact@goldlimousine.ci","tel":"+225 01 23 45 67","avatar":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'contact@goldlimousine.ci', '+225 01 23 45 67', 'CI-ABJ-2023-B-19870',
   'aucun'::niveau_offre, 0, 0, null, '2026-08-03'),
  ('ab601852-8b3a-5c57-8bae-cb1798dd4d7d', 'delices-abj', 'Délices Abidjan', 'traiteurs', 'Abidjan', 'Treichville',
   'refuse'::statut_prestataire, false, false, 'Traiteur événementiel', 'Dossier incomplet : registre de commerce illisible et portfolio composé d''images trouvées en ligne.',
   null, null, 5000, 'le couvert', '["https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=72"]'::jsonb, '{"nom":"Alain Kacou","role":"Gérant","email":"alain@delices-abj.ci","tel":"+225 07 11 22 33","avatar":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=72"}'::jsonb,
   'alain@delices-abj.ci', '+225 07 11 22 33', 'illisible',
   'aucun'::niveau_offre, 0, 0, 'Portfolio non authentique, RCCM illisible', '2026-07-28')
on conflict (id) do update set
  nom = excluded.nom, categorie_id = excluded.categorie_id, commune = excluded.commune,
  statut = excluded.statut, certifie = excluded.certifie, sponsorise = excluded.sponsorise,
  accroche = excluded.accroche, description = excluded.description, photos = excluded.photos,
  contact = excluded.contact, offre = excluded.offre, rccm = excluded.rccm;

-- Services -----------------------------------------------------------------
insert into services (id, prestataire_id, nom, description, prix_fcfa, unite, duree, inclus, actif, ordre) values
  ('b77fdd0f-489c-5d6d-80ea-5430eb04e81b', '7256973e-d860-575e-8404-c4541444b07c', 'Forfait journée complète', 'Dot, civil et réception. 300 photos retouchées, album 30x30 et second photographe.',
   320000, 'forfait', '12 h', '["Second photographe","Album imprimé 30x30","300 photos retouchées","Galerie en ligne"]'::jsonb, true, 0),
  ('77029c4f-2229-54cb-8b7a-2270c6d02018', '7256973e-d860-575e-8404-c4541444b07c', 'Forfait demi-journée', 'Couverture de la cérémonie et du cocktail, 150 photos retouchées.',
   180000, 'forfait', '6 h', '["150 photos retouchées","Galerie en ligne"]'::jsonb, true, 1),
  ('97952bed-cb83-57f1-82ea-1ee27b7c7adb', '7256973e-d860-575e-8404-c4541444b07c', 'Séance engagement', 'Séance photo de couple en extérieur avant le mariage.',
   75000, 'séance', '2 h', '["40 photos retouchées","Deux tenues"]'::jsonb, true, 2),
  ('91b797ca-d7b2-5247-8a4c-9207bf79e82f', '7256973e-d860-575e-8404-c4541444b07c', 'Option drone', 'Prises de vue aériennes du lieu de réception. Suspendu en attente du renouvellement de la licence.',
   60000, 'option', null, '["10 minutes de rushes","Montage court"]'::jsonb, false, 3),
  ('82313144-00dc-5142-86d2-5af2a0a59a03', '16600d08-dd14-505c-836e-226e8f76b364', 'Menu ivoirien complet', 'Entrée, attiéké-poisson ou kedjenou, dessert et boissons non alcoolisées.',
   12000, 'couvert', null, '["Service en salle","Vaisselle","Nappage"]'::jsonb, true, 4),
  ('efb9780c-1001-5f39-8212-d9464f85f2b1', '16600d08-dd14-505c-836e-226e8f76b364', 'Menu gastronomique mixte', 'Buffet dressé mêlant cuisine ivoirienne et internationale, personnel dédié.',
   19000, 'couvert', null, '["Buffet dressé","Personnel dédié","Boissons premium"]'::jsonb, true, 5),
  ('45c8c85c-152d-532b-8c10-f468b9fd45cd', '13b73d1c-e2a9-59ff-895c-0994e6382344', 'Location journée complète', 'Salle climatisée 400 places, jardin, loge des mariés, parking et groupe électrogène.',
   900000, 'journée', '24 h', '["Climatisation","Parking 80 places","Groupe électrogène","Loge des mariés"]'::jsonb, true, 6),
  ('98b5a9a5-da39-5233-8529-cc6efcf38491', '7480d4ce-d04f-5917-806b-5f5a1050e224', 'Scénographie complète', 'Conception sur mesure, installation la veille et démontage le lendemain.',
   480000, 'forfait', null, '["Arche florale","Habillage de salle","Mobilier","Démontage"]'::jsonb, true, 7)
on conflict (id) do update set
  nom = excluded.nom, description = excluded.description, prix_fcfa = excluded.prix_fcfa,
  unite = excluded.unite, duree = excluded.duree, inclus = excluded.inclus, actif = excluded.actif;

-- Couples ------------------------------------------------------------------
insert into couples (id, profil_id, noms, email, tel, ville, date_mariage, nb_invites,
  budget_fcfa, diaspora, statut, cree_le) values
  ('82ab3136-a063-58d4-8f2f-ce2bb2d633af', null, 'Adjoua & Koffi', 'adjoua.koffi@email.ci', '+225 07 30 40 50', 'Cocody',
   '2026-12-14', 180, 6000000, false, 'actif', '2026-06-02'),
  ('e40ef21d-4a30-5ca7-81f5-fa38a48c42ac', null, 'Mariama & Ibrahima', 'm.ibrahima@email.fr', '+33 6 12 34 56 78', 'Paris',
   '2027-02-20', 250, 12000000, true, 'actif', '2026-05-18'),
  ('7c62a8b3-52b0-5227-83fb-e3933f78361b', null, 'Ange & Grace', 'ange.grace@email.ci', '+225 05 60 70 80', 'Yamoussoukro',
   '2027-04-10', 120, 3500000, false, 'actif', '2026-07-09'),
  ('c0b38293-d179-5d20-810f-e2332579ed79', null, 'Yann & Estelle', 'yann.estelle@email.ca', '+1 514 555 0142', 'Montréal',
   '2027-01-16', 200, 9000000, true, 'actif', '2026-04-25'),
  ('7b3564c5-c39e-52af-8a36-666001f2b3ba', null, 'Sékou & Fanta', 'sekou.fanta@email.ci', '+225 01 90 80 70', 'Bouaké',
   '2026-11-07', 300, 5000000, false, 'inactif', '2026-03-14')
on conflict (id) do update set
  noms = excluded.noms, email = excluded.email, tel = excluded.tel, ville = excluded.ville,
  date_mariage = excluded.date_mariage, nb_invites = excluded.nb_invites,
  budget_fcfa = excluded.budget_fcfa, statut = excluded.statut;

-- Devis --------------------------------------------------------------------
insert into devis (id, couple_id, prestataire_id, statut, message, date_evenement,
  nb_invites, montant_fcfa, envoye_le) values
  ('5cb6b58d-8811-5c93-8953-e787aab94fbe', '82ab3136-a063-58d4-8f2f-ce2bb2d633af', '7256973e-d860-575e-8404-c4541444b07c',
   'recu'::statut_devis, 'Bonjour, nous cherchons une couverture complète : dot le matin, civil puis réception.', '2026-12-14', 180,
   320000, '2026-08-02'),
  ('38fcb2db-97d6-52f7-87f6-d7bf84c9ee6e', '82ab3136-a063-58d4-8f2f-ce2bb2d633af', '16600d08-dd14-505c-836e-226e8f76b364',
   'recu'::statut_devis, 'Menu mixte pour 180 couverts, avec service en salle.', '2026-12-14', 180,
   2160000, '2026-08-01'),
  ('64dec8be-c11f-573f-8f5b-df1466833995', '82ab3136-a063-58d4-8f2f-ce2bb2d633af', '13b73d1c-e2a9-59ff-895c-0994e6382344',
   'attente'::statut_devis, 'La salle est-elle libre le 14 décembre ? Nous serions 180.', '2026-12-14', 180,
   null, '2026-07-31'),
  ('d18247cc-d980-52fe-88a3-90b6ab8ede78', '82ab3136-a063-58d4-8f2f-ce2bb2d633af', '7480d4ce-d04f-5917-806b-5f5a1050e224',
   'accepte'::statut_devis, 'Décoration en wax bleu et or, arche florale pour la cérémonie laïque.', '2026-12-14', 180,
   480000, '2026-07-24'),
  ('001e9414-7a75-5da8-899f-0b471109eeb4', 'e40ef21d-4a30-5ca7-81f5-fa38a48c42ac', '14c51d1e-716c-572f-863f-78a7b79f2400',
   'recu'::statut_devis, 'Nous organisons depuis Paris. Photo et vidéo, avec teaser rapide pour la famille.', '2027-02-20', 250,
   890000, '2026-07-30'),
  ('f64078f2-512f-5943-80bc-0dca2e8ba6b5', 'c0b38293-d179-5d20-810f-e2332579ed79', '7256973e-d860-575e-8404-c4541444b07c',
   'attente'::statut_devis, 'Disponible le 16 janvier ? Nous arrivons de Montréal une semaine avant.', '2027-01-16', 200,
   null, '2026-08-03'),
  ('8f8f934d-e5c4-5d68-8db8-bf36ed78f533', '7c62a8b3-52b0-5227-83fb-e3933f78361b', '1a3d05f0-f377-5ad4-8e59-81bc2d95432f',
   'refuse'::statut_devis, 'Captation de la dot en pays baoulé.', '2027-04-10', 120,
   null, '2026-07-20'),
  ('e133a8c5-6fd2-5315-8006-87ec4377f4a3', '7c62a8b3-52b0-5227-83fb-e3933f78361b', '42c6e85a-8f8c-5acb-8e5d-160519be4eb0',
   'recu'::statut_devis, 'Animation de la soirée, ouverture de bal et coupé-décalé.', '2027-04-10', 120,
   240000, '2026-08-04')
on conflict (id) do update set
  statut = excluded.statut, message = excluded.message, montant_fcfa = excluded.montant_fcfa;

-- Avis ---------------------------------------------------------------------
insert into avis (id, prestataire_id, couple_id, note, texte, statut, motif_signalement, signale_par, cree_le) values
  ('92ef1da9-0e5a-5802-8f7c-b4c80aa39603', '7256973e-d860-575e-8404-c4541444b07c', '82ab3136-a063-58d4-8f2f-ce2bb2d633af', 5,
   'Travail remarquable. L''équipe a su capter les moments de la dot sans jamais s''imposer. Livraison en avance sur le délai annoncé.', 'publie'::statut_avis, null,
   null, '2026-07-12'),
  ('3e4e765c-8124-5a98-827a-df7f6afed3b9', '16600d08-dd14-505c-836e-226e8f76b364', '82ab3136-a063-58d4-8f2f-ce2bb2d633af', 5,
   'Le kedjenou a fait l''unanimité et le service était impeccable du début à la fin.', 'publie'::statut_avis, null,
   null, '2026-07-15'),
  ('3b1127fa-b453-5160-83fe-0c98b599f217', '13b73d1c-e2a9-59ff-895c-0994e6382344', '7b3564c5-c39e-52af-8a36-666001f2b3ba', 4,
   'Cadre magnifique et personnel attentif. Un bémol sur la climatisation d''une des salles annexes.', 'publie'::statut_avis, null,
   null, '2026-06-28'),
  ('c286d043-2c12-56b5-8c67-137deff24cdc', '42c6e85a-8f8c-5acb-8e5d-160519be4eb0', '7c62a8b3-52b0-5227-83fb-e3933f78361b', 5,
   'Ambiance folle jusqu''à 4 h du matin. Il a parfaitement lu la salle.', 'attente'::statut_avis, null,
   null, '2026-08-03'),
  ('c2ac1c5c-3e9a-5b6c-87f7-783076b2aa3c', '7480d4ce-d04f-5917-806b-5f5a1050e224', 'e40ef21d-4a30-5ca7-81f5-fa38a48c42ac', 2,
   'Installation terminée avec deux heures de retard, plusieurs compositions florales étaient fanées.', 'signale'::statut_avis, 'Le prestataire conteste : retard imputable à l''accès au site',
   '7480d4ce-d04f-5917-806b-5f5a1050e224', '2026-08-02')
on conflict (id) do update set
  note = excluded.note, texte = excluded.texte, statut = excluded.statut;

-- Paiements ----------------------------------------------------------------
insert into paiements (id, type, statut, prestataire_id, couple_id, offre, montant_fcfa, moyen, date_operation) values
  ('b516bd46-b9fd-5301-8d58-13a467082924', 'abonnement'::type_paiement, 'paye'::statut_paiement,
   '7256973e-d860-575e-8404-c4541444b07c', null,
   'or'::niveau_offre, 75000, 'Orange Money', '2026-08-01'),
  ('d005f642-4f5a-5684-801a-08a75768797c', 'abonnement'::type_paiement, 'paye'::statut_paiement,
   '16600d08-dd14-505c-836e-226e8f76b364', null,
   'or'::niveau_offre, 75000, 'Wave', '2026-08-01'),
  ('589a9d9c-b1c6-5d98-8e74-d87bf1fc8802', 'abonnement'::type_paiement, 'paye'::statut_paiement,
   '14c51d1e-716c-572f-863f-78a7b79f2400', null,
   'or'::niveau_offre, 75000, 'Carte bancaire', '2026-08-01'),
  ('d3a687da-ea72-554a-83df-17d32146a606', 'abonnement'::type_paiement, 'paye'::statut_paiement,
   '7480d4ce-d04f-5917-806b-5f5a1050e224', null,
   'or'::niveau_offre, 75000, 'MTN MoMo', '2026-08-02'),
  ('ad1d53fb-57a3-51ab-8bf9-bdc6b590dd2a', 'abonnement'::type_paiement, 'paye'::statut_paiement,
   '13b73d1c-e2a9-59ff-895c-0994e6382344', null,
   'argent'::niveau_offre, 35000, 'Orange Money', '2026-08-01'),
  ('cade2ad4-7e2f-5aa1-8f9b-a2b9be195060', 'abonnement'::type_paiement, 'paye'::statut_paiement,
   '42c6e85a-8f8c-5acb-8e5d-160519be4eb0', null,
   'argent'::niveau_offre, 35000, 'Wave', '2026-08-03'),
  ('48f19462-857b-58ad-8bd6-461f845970f5', 'abonnement'::type_paiement, 'paye'::statut_paiement,
   '0c05ffc6-cc99-532a-83ac-b381bc8f1b39', null,
   'bronze'::niveau_offre, 15000, 'Orange Money', '2026-08-02'),
  ('d9964385-7e4b-5034-856f-e7b934ebe774', 'abonnement'::type_paiement, 'echoue'::statut_paiement,
   '1a3d05f0-f377-5ad4-8e59-81bc2d95432f', null,
   'bronze'::niveau_offre, 15000, 'MTN MoMo', '2026-08-04'),
  ('de90fbd8-f952-5953-8e3b-df352903f6ee', 'acompte'::type_paiement, 'sequestre'::statut_paiement,
   '7480d4ce-d04f-5917-806b-5f5a1050e224', '82ab3136-a063-58d4-8f2f-ce2bb2d633af',
   null, 144000, 'Orange Money', '2026-07-26'),
  ('70202e66-8b0d-5725-8efd-b415dd6c8dfa', 'acompte'::type_paiement, 'reverse'::statut_paiement,
   '7256973e-d860-575e-8404-c4541444b07c', 'e40ef21d-4a30-5ca7-81f5-fa38a48c42ac',
   null, 96000, 'Carte bancaire', '2026-07-18')
on conflict (id) do update set statut = excluded.statut, montant_fcfa = excluded.montant_fcfa;

-- Litiges ------------------------------------------------------------------
insert into litiges (id, couple_id, prestataire_id, objet, detail, montant_fcfa, statut, priorite, ouvert_le) values
  ('3bac1017-476b-5bad-8e02-2cc001b4956c', 'e40ef21d-4a30-5ca7-81f5-fa38a48c42ac', '7480d4ce-d04f-5917-806b-5f5a1050e224', 'Retard de livraison et compositions florales abîmées',
   'Le couple demande un remboursement partiel de 40 %. Le prestataire conteste et invoque un problème d''accès au site le jour de l''installation.', 144000, 'ouvert'::statut_litige, 'haute', '2026-08-02'),
  ('e1352fd6-80e3-5996-88c0-6673980dbe22', '7b3564c5-c39e-52af-8a36-666001f2b3ba', '13b73d1c-e2a9-59ff-895c-0994e6382344', 'Climatisation en panne dans la salle annexe',
   'Geste commercial de 250 000 FCFA accepté par les deux parties. Dossier clos le 21 juillet.', 250000, 'resolu'::statut_litige, 'moyenne', '2026-07-14')
on conflict (id) do update set statut = excluded.statut, detail = excluded.detail;

-- Articles -----------------------------------------------------------------
insert into articles (id, slug, titre, categorie, auteur_nom, statut, vues, mots_cles, publie_le, cree_le) values
  ('39870306-972b-5f5e-8dc8-388efee056e9', 'budget-mariage-abidjan-2026-combien-prevoir', 'Budget mariage Abidjan 2026 : combien prévoir ?', 'Budget',
   'Aïcha Traoré', 'publie'::statut_article, 4820, 'budget mariage abidjan 2026',
   '2026-07-15', '2026-07-15'),
  ('c67ba8aa-9169-5e56-8ac9-223a3b495805', 'top-10-salles-de-reception-mariage-a-abidjan', 'Top 10 salles de réception mariage à Abidjan', 'Prestataires',
   'Aïcha Traoré', 'publie'::statut_article, 3110, 'salle reception mariage abidjan',
   '2026-07-02', '2026-07-02'),
  ('38a52ee6-573d-5214-87f8-3bd0922780ce', 'mariage-coutumier-cote-d-ivoire-toutes-les-etapes', 'Mariage coutumier Côte d''Ivoire : toutes les étapes', 'Traditions',
   'Konan Brou', 'publie'::statut_article, 6740, 'mariage coutumier cote ivoire',
   '2026-06-20', '2026-06-20'),
  ('cb6c68d2-cac7-5559-8cd5-3fdb046e29cc', 'retroplanning-mariage-que-faire-12-mois-avant', 'Rétroplanning mariage : que faire 12 mois avant ?', 'Organisation',
   'Aïcha Traoré', 'brouillon'::statut_article, 0, 'retroplanning mariage',
   null, '2026-08-04'),
  ('74d71221-12ec-5fb9-8d5c-82c7da12da15', 'bijoux-mariage-ivoirien-les-tendances-2026', 'Bijoux mariage ivoirien : les tendances 2026', 'Inspiration',
   'Prisca Yao', 'relecture'::statut_article, 0, 'bijoux mariage ivoirien',
   null, '2026-08-03')
on conflict (id) do update set
  titre = excluded.titre, categorie = excluded.categorie, statut = excluded.statut, vues = excluded.vues;

-- Trafic -------------------------------------------------------------------
insert into trafic (mois, annee, ordre, sessions, inscriptions, devis) values
  ('Mars', 2026, 0, 1240, 38, 96),
  ('Avril', 2026, 1, 1890, 61, 148),
  ('Mai', 2026, 2, 2640, 84, 203),
  ('Juin', 2026, 3, 3420, 112, 287),
  ('Juillet', 2026, 4, 4780, 156, 391),
  ('Août', 2026, 5, 5310, 174, 428)
on conflict (mois, annee) do update set
  sessions = excluded.sessions, inscriptions = excluded.inscriptions, devis = excluded.devis;

-- Les déclencheurs ont recalculé notes et tarifs pendant l'insertion.
-- On restaure les valeurs de démonstration pour les fiches sans avis saisi.
update prestataires set note_moyenne = v.note, nb_avis = v.nb
from (values
  ('7256973e-d860-575e-8404-c4541444b07c'::uuid, 4.9::numeric, 47::int),
  ('16600d08-dd14-505c-836e-226e8f76b364'::uuid, 4.8::numeric, 63::int),
  ('13b73d1c-e2a9-59ff-895c-0994e6382344'::uuid, 4.9::numeric, 38::int),
  ('7480d4ce-d04f-5917-806b-5f5a1050e224'::uuid, 4.7::numeric, 29::int),
  ('42c6e85a-8f8c-5acb-8e5d-160519be4eb0'::uuid, 4.8::numeric, 51::int),
  ('0c05ffc6-cc99-532a-83ac-b381bc8f1b39'::uuid, 5::numeric, 24::int),
  ('14c51d1e-716c-572f-863f-78a7b79f2400'::uuid, 5::numeric, 58::int),
  ('1a3d05f0-f377-5ad4-8e59-81bc2d95432f'::uuid, 4.7::numeric, 12::int),
  ('e6de3b3d-1b82-5b2f-86a1-b394882a3069'::uuid, 0::numeric, 0::int),
  ('a48de393-5a4c-569d-8365-a6ff8cb0d16b'::uuid, 0::numeric, 0::int),
  ('ab601852-8b3a-5c57-8bae-cb1798dd4d7d'::uuid, 0::numeric, 0::int)
) as v(id, note, nb)
where prestataires.id = v.id and prestataires.nb_avis = 0;

select 'Jeu de démonstration installé' as resultat,
       (select count(*) from prestataires) as prestataires,
       (select count(*) from services)     as services,
       (select count(*) from devis)        as devis;