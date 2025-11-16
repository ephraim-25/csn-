-- ============================================
-- PLATEFORME NATIONALE CSN - ARCHITECTURE COMPLÈTE
-- ============================================

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour la recherche full-text

-- ============================================
-- ÉNUMÉRATIONS
-- ============================================

-- Types de publications
CREATE TYPE public.publication_type AS ENUM (
  'article',
  'livre',
  'chapitre',
  'conference',
  'poster',
  'these',
  'memoire',
  'rapport',
  'brevet'
);

-- Quartiles pour les journaux
CREATE TYPE public.quartile AS ENUM ('Q1', 'Q2', 'Q3', 'Q4', 'non_classe');

-- Grades académiques
CREATE TYPE public.grade_academique AS ENUM (
  'professeur_ordinaire',
  'professeur_associe',
  'chef_de_travaux',
  'assistant',
  'chercheur_senior',
  'chercheur_junior',
  'doctorant',
  'autre'
);

-- Statut des projets
CREATE TYPE public.statut_projet AS ENUM ('en_preparation', 'en_cours', 'termine', 'suspendu', 'annule');

-- Types de partenariats
CREATE TYPE public.type_partenariat AS ENUM ('academique', 'industriel', 'gouvernemental', 'ong', 'international');

-- Types d'événements pour audit log
CREATE TYPE public.audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT');

-- ============================================
-- TABLE: provinces
-- ============================================
CREATE TABLE public.provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  population INTEGER,
  superficie DECIMAL,
  chef_lieu TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les provinces"
  ON public.provinces FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer les provinces"
  ON public.provinces FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: centres_recherche
-- ============================================
CREATE TABLE public.centres_recherche (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  acronyme TEXT,
  province_id UUID REFERENCES public.provinces(id) ON DELETE SET NULL,
  adresse TEXT,
  telephone TEXT,
  email TEXT,
  site_web TEXT,
  date_creation DATE,
  description TEXT,
  logo_url TEXT,
  directeur_id UUID, -- Référence ajoutée après création table chercheurs
  domaines_recherche TEXT[],
  budget_annuel DECIMAL,
  nombre_chercheurs INTEGER DEFAULT 0,
  est_actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.centres_recherche ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les centres"
  ON public.centres_recherche FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer les centres"
  ON public.centres_recherche FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: departements
-- ============================================
CREATE TABLE public.departements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  centre_id UUID NOT NULL REFERENCES public.centres_recherche(id) ON DELETE CASCADE,
  responsable_id UUID, -- Référence ajoutée après
  description TEXT,
  budget DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.departements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les départements"
  ON public.departements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer les départements"
  ON public.departements FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: chercheurs
-- ============================================
CREATE TABLE public.chercheurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  matricule TEXT UNIQUE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  nom_complet TEXT GENERATED ALWAYS AS (prenom || ' ' || nom) STORED,
  date_naissance DATE,
  lieu_naissance TEXT,
  nationalite TEXT DEFAULT 'RDC',
  sexe TEXT CHECK (sexe IN ('M', 'F', 'Autre')),
  
  -- Contact
  email TEXT NOT NULL,
  telephone TEXT,
  adresse TEXT,
  ville TEXT,
  province_id UUID REFERENCES public.provinces(id) ON DELETE SET NULL,
  
  -- Académique
  grade public.grade_academique,
  specialite TEXT,
  domaines_recherche TEXT[],
  diplome_plus_eleve TEXT,
  universite_diplome TEXT,
  annee_diplome INTEGER,
  
  -- Affiliation
  centre_id UUID REFERENCES public.centres_recherche(id) ON DELETE SET NULL,
  departement_id UUID REFERENCES public.departements(id) ON DELETE SET NULL,
  institution_principale TEXT,
  
  -- Profil
  photo_url TEXT,
  cv_url TEXT,
  biographie TEXT,
  langues TEXT[],
  
  -- Métriques (mises à jour automatiquement)
  h_index INTEGER DEFAULT 0,
  total_citations INTEGER DEFAULT 0,
  i10_index INTEGER DEFAULT 0,
  nombre_publications INTEGER DEFAULT 0,
  
  -- Identifiants externes
  orcid TEXT UNIQUE,
  google_scholar_id TEXT,
  researchgate_id TEXT,
  linkedin_url TEXT,
  
  -- Statut
  est_actif BOOLEAN DEFAULT true,
  date_inscription DATE DEFAULT CURRENT_DATE,
  derniere_mise_a_jour TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chercheurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les chercheurs actifs"
  ON public.chercheurs FOR SELECT
  TO authenticated
  USING (est_actif = true);

CREATE POLICY "Chercheurs peuvent modifier leur profil"
  ON public.chercheurs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins peuvent tout gérer"
  ON public.chercheurs FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes pour recherche performante
CREATE INDEX idx_chercheurs_nom_prenom ON public.chercheurs(nom, prenom);
CREATE INDEX idx_chercheurs_specialite ON public.chercheurs USING gin(to_tsvector('french', specialite));
CREATE INDEX idx_chercheurs_centre ON public.chercheurs(centre_id);
CREATE INDEX idx_chercheurs_province ON public.chercheurs(province_id);
CREATE INDEX idx_chercheurs_domaines ON public.chercheurs USING gin(domaines_recherche);

-- ============================================
-- TABLE: publications
-- ============================================
CREATE TABLE public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  type public.publication_type NOT NULL,
  annee INTEGER NOT NULL,
  mois INTEGER CHECK (mois BETWEEN 1 AND 12),
  
  -- Publication details
  resume TEXT,
  mots_cles TEXT[],
  langue TEXT DEFAULT 'fr',
  
  -- Journal/Conférence
  journal TEXT,
  conference TEXT,
  editeur TEXT,
  volume TEXT,
  numero TEXT,
  pages TEXT,
  doi TEXT UNIQUE,
  isbn TEXT,
  issn TEXT,
  
  -- Qualité
  quartile public.quartile,
  impact_factor DECIMAL,
  est_peer_reviewed BOOLEAN DEFAULT false,
  
  -- Liens
  url TEXT,
  pdf_url TEXT,
  
  -- Métriques
  nombre_citations INTEGER DEFAULT 0,
  nombre_lectures INTEGER DEFAULT 0,
  
  -- Visibilité
  est_publie BOOLEAN DEFAULT true,
  date_soumission DATE,
  date_acceptation DATE,
  date_publication DATE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les publications publiées"
  ON public.publications FOR SELECT
  TO authenticated
  USING (est_publie = true);

CREATE POLICY "Admins peuvent tout gérer"
  ON public.publications FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_publications_annee ON public.publications(annee DESC);
CREATE INDEX idx_publications_type ON public.publications(type);
CREATE INDEX idx_publications_titre ON public.publications USING gin(to_tsvector('french', titre));
CREATE INDEX idx_publications_doi ON public.publications(doi);

-- ============================================
-- TABLE: auteurs_publications (relation many-to-many)
-- ============================================
CREATE TABLE public.auteurs_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  chercheur_id UUID NOT NULL REFERENCES public.chercheurs(id) ON DELETE CASCADE,
  ordre INTEGER NOT NULL DEFAULT 1,
  est_correspondant BOOLEAN DEFAULT false,
  affiliation_publication TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(publication_id, chercheur_id)
);

ALTER TABLE public.auteurs_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les auteurs"
  ON public.auteurs_publications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer les auteurs"
  ON public.auteurs_publications FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_auteurs_publication ON public.auteurs_publications(publication_id);
CREATE INDEX idx_auteurs_chercheur ON public.auteurs_publications(chercheur_id);

-- ============================================
-- TABLE: projets_recherche
-- ============================================
CREATE TABLE public.projets_recherche (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  acronyme TEXT,
  description TEXT,
  objectifs TEXT,
  
  -- Dates
  date_debut DATE NOT NULL,
  date_fin_prevue DATE,
  date_fin_reelle DATE,
  statut public.statut_projet DEFAULT 'en_preparation',
  
  -- Financement
  budget_total DECIMAL,
  budget_obtenu DECIMAL,
  source_financement TEXT,
  numero_contrat TEXT,
  
  -- Organisation
  coordinateur_id UUID REFERENCES public.chercheurs(id) ON DELETE SET NULL,
  centre_id UUID REFERENCES public.centres_recherche(id) ON DELETE SET NULL,
  
  -- Classification
  domaine_principal TEXT,
  domaines_secondaires TEXT[],
  mots_cles TEXT[],
  
  -- Impact
  objectifs_developpement_durable TEXT[],
  impact_attendu TEXT,
  beneficiaires TEXT,
  
  -- Visibilité
  est_public BOOLEAN DEFAULT true,
  site_web TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projets_recherche ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les projets publics"
  ON public.projets_recherche FOR SELECT
  TO authenticated
  USING (est_public = true);

CREATE POLICY "Admins peuvent tout gérer"
  ON public.projets_recherche FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_projets_statut ON public.projets_recherche(statut);
CREATE INDEX idx_projets_dates ON public.projets_recherche(date_debut, date_fin_prevue);

-- ============================================
-- TABLE: membres_projet
-- ============================================
CREATE TABLE public.membres_projet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projet_id UUID NOT NULL REFERENCES public.projets_recherche(id) ON DELETE CASCADE,
  chercheur_id UUID NOT NULL REFERENCES public.chercheurs(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  date_debut DATE DEFAULT CURRENT_DATE,
  date_fin DATE,
  pourcentage_temps INTEGER CHECK (pourcentage_temps BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(projet_id, chercheur_id)
);

ALTER TABLE public.membres_projet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible selon projet"
  ON public.membres_projet FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer"
  ON public.membres_projet FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: collaborations
-- ============================================
CREATE TABLE public.collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chercheur1_id UUID NOT NULL REFERENCES public.chercheurs(id) ON DELETE CASCADE,
  chercheur2_id UUID NOT NULL REFERENCES public.chercheurs(id) ON DELETE CASCADE,
  nombre_publications INTEGER DEFAULT 0,
  premiere_collaboration DATE,
  derniere_collaboration DATE,
  domaines_communs TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (chercheur1_id < chercheur2_id),
  UNIQUE(chercheur1_id, chercheur2_id)
);

ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les collaborations"
  ON public.collaborations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer"
  ON public.collaborations FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: partenariats
-- ============================================
CREATE TABLE public.partenariats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_partenaire TEXT NOT NULL,
  type public.type_partenariat NOT NULL,
  pays TEXT,
  description TEXT,
  
  -- Contact
  contact_nom TEXT,
  contact_email TEXT,
  contact_telephone TEXT,
  site_web TEXT,
  
  -- Relation
  centre_id UUID REFERENCES public.centres_recherche(id) ON DELETE SET NULL,
  date_debut DATE,
  date_fin DATE,
  est_actif BOOLEAN DEFAULT true,
  
  -- Détails
  domaines_collaboration TEXT[],
  accord_cadre_url TEXT,
  logo_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partenariats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les partenariats actifs"
  ON public.partenariats FOR SELECT
  TO authenticated
  USING (est_actif = true);

CREATE POLICY "Admins peuvent tout gérer"
  ON public.partenariats FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: equipements
-- ============================================
CREATE TABLE public.equipements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  categorie TEXT,
  marque TEXT,
  modele TEXT,
  numero_serie TEXT UNIQUE,
  
  -- Localisation
  centre_id UUID REFERENCES public.centres_recherche(id) ON DELETE SET NULL,
  departement_id UUID REFERENCES public.departements(id) ON DELETE SET NULL,
  salle TEXT,
  
  -- Acquisition
  date_acquisition DATE,
  cout_acquisition DECIMAL,
  fournisseur TEXT,
  
  -- État
  etat TEXT CHECK (etat IN ('excellent', 'bon', 'moyen', 'mauvais', 'hors_service')),
  date_derniere_maintenance DATE,
  prochaine_maintenance DATE,
  
  -- Utilisation
  est_disponible BOOLEAN DEFAULT true,
  responsable_id UUID REFERENCES public.chercheurs(id) ON DELETE SET NULL,
  description TEXT,
  specifications JSONB,
  photo_url TEXT,
  manuel_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.equipements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les équipements"
  ON public.equipements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer"
  ON public.equipements FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: prix_distinctions
-- ============================================
CREATE TABLE public.prix_distinctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chercheur_id UUID NOT NULL REFERENCES public.chercheurs(id) ON DELETE CASCADE,
  nom_prix TEXT NOT NULL,
  organisme TEXT,
  annee INTEGER NOT NULL,
  description TEXT,
  niveau TEXT CHECK (niveau IN ('national', 'regional', 'international')),
  montant DECIMAL,
  certificat_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prix_distinctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les prix"
  ON public.prix_distinctions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins peuvent gérer"
  ON public.prix_distinctions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: newsletter_abonnes
-- ============================================
CREATE TABLE public.newsletter_abonnes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nom TEXT,
  prenom TEXT,
  organisation TEXT,
  interets TEXT[],
  est_actif BOOLEAN DEFAULT true,
  date_inscription TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_desabonnement TIMESTAMP WITH TIME ZONE,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_abonnes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent voir les abonnés"
  ON public.newsletter_abonnes FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins peuvent gérer"
  ON public.newsletter_abonnes FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: newsletter_envois
-- ============================================
CREATE TABLE public.newsletter_envois (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sujet TEXT NOT NULL,
  contenu TEXT NOT NULL,
  date_envoi TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  envoye_par UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nombre_destinataires INTEGER DEFAULT 0,
  nombre_ouvertures INTEGER DEFAULT 0,
  nombre_clics INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_envois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent gérer"
  ON public.newsletter_envois FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: pages_dynamiques
-- ============================================
CREATE TABLE public.pages_dynamiques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  contenu TEXT,
  centre_id UUID REFERENCES public.centres_recherche(id) ON DELETE CASCADE,
  
  -- SEO
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Média
  image_principale_url TEXT,
  galerie_images TEXT[],
  
  -- Statut
  est_publie BOOLEAN DEFAULT false,
  date_publication TIMESTAMP WITH TIME ZONE,
  auteur_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Stats
  nombre_vues INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pages_dynamiques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les pages publiées"
  ON public.pages_dynamiques FOR SELECT
  TO authenticated
  USING (est_publie = true);

CREATE POLICY "Admins peuvent tout gérer"
  ON public.pages_dynamiques FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_pages_slug ON public.pages_dynamiques(slug);

-- ============================================
-- TABLE: actualites
-- ============================================
CREATE TABLE public.actualites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  contenu TEXT NOT NULL,
  resume TEXT,
  image_url TEXT,
  categorie TEXT,
  tags TEXT[],
  
  -- Publication
  est_publie BOOLEAN DEFAULT false,
  date_publication TIMESTAMP WITH TIME ZONE,
  auteur_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Stats
  nombre_vues INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.actualites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les actualités publiées"
  ON public.actualites FOR SELECT
  TO authenticated
  USING (est_publie = true);

CREATE POLICY "Admins peuvent tout gérer"
  ON public.actualites FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: audit_logs
-- ============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action public.audit_action NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent voir les logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX idx_audit_table ON public.audit_logs(table_name);

-- ============================================
-- TABLE: parametres_systeme
-- ============================================
CREATE TABLE public.parametres_systeme (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cle TEXT NOT NULL UNIQUE,
  valeur TEXT,
  type TEXT CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  categorie TEXT,
  modifie_par UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.parametres_systeme ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent tout gérer"
  ON public.parametres_systeme FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TABLE: statistiques_globales
-- ============================================
CREATE TABLE public.statistiques_globales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  
  -- Chercheurs
  nombre_chercheurs_total INTEGER DEFAULT 0,
  nombre_chercheurs_actifs INTEGER DEFAULT 0,
  nouveaux_chercheurs INTEGER DEFAULT 0,
  
  -- Publications
  nombre_publications_total INTEGER DEFAULT 0,
  publications_cette_annee INTEGER DEFAULT 0,
  nouvelles_publications INTEGER DEFAULT 0,
  
  -- Projets
  nombre_projets_total INTEGER DEFAULT 0,
  projets_actifs INTEGER DEFAULT 0,
  nouveaux_projets INTEGER DEFAULT 0,
  
  -- Centres
  nombre_centres INTEGER DEFAULT 0,
  
  -- Métriques
  h_index_moyen DECIMAL,
  citations_totales INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.statistiques_globales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent voir les stats"
  ON public.statistiques_globales FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins peuvent gérer"
  ON public.statistiques_globales FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TRIGGERS pour updated_at
-- ============================================

CREATE TRIGGER update_provinces_updated_at
  BEFORE UPDATE ON public.provinces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_centres_recherche_updated_at
  BEFORE UPDATE ON public.centres_recherche
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departements_updated_at
  BEFORE UPDATE ON public.departements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chercheurs_updated_at
  BEFORE UPDATE ON public.chercheurs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publications_updated_at
  BEFORE UPDATE ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projets_recherche_updated_at
  BEFORE UPDATE ON public.projets_recherche
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaborations_updated_at
  BEFORE UPDATE ON public.collaborations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partenariats_updated_at
  BEFORE UPDATE ON public.partenariats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipements_updated_at
  BEFORE UPDATE ON public.equipements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pages_dynamiques_updated_at
  BEFORE UPDATE ON public.pages_dynamiques
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_actualites_updated_at
  BEFORE UPDATE ON public.actualites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parametres_systeme_updated_at
  BEFORE UPDATE ON public.parametres_systeme
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FOREIGN KEYS ajoutées après création tables
-- ============================================

-- Ajouter directeur_id dans centres_recherche
ALTER TABLE public.centres_recherche 
  ADD CONSTRAINT fk_centres_directeur 
  FOREIGN KEY (directeur_id) REFERENCES public.chercheurs(id) ON DELETE SET NULL;

-- Ajouter responsable_id dans departements
ALTER TABLE public.departements 
  ADD CONSTRAINT fk_departements_responsable 
  FOREIGN KEY (responsable_id) REFERENCES public.chercheurs(id) ON DELETE SET NULL;

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour mettre à jour les statistiques d'un chercheur
CREATE OR REPLACE FUNCTION public.update_chercheur_stats(chercheur_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chercheurs
  SET 
    nombre_publications = (
      SELECT COUNT(*) 
      FROM public.auteurs_publications 
      WHERE chercheur_id = chercheur_uuid
    ),
    derniere_mise_a_jour = now()
  WHERE id = chercheur_uuid;
END;
$$;

-- Fonction pour calculer les collaborations
CREATE OR REPLACE FUNCTION public.calculate_collaboration(c1_id UUID, c2_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pub_count INTEGER;
  first_collab DATE;
  last_collab DATE;
BEGIN
  -- Compter les publications communes
  SELECT 
    COUNT(DISTINCT ap1.publication_id),
    MIN(p.date_publication),
    MAX(p.date_publication)
  INTO pub_count, first_collab, last_collab
  FROM public.auteurs_publications ap1
  JOIN public.auteurs_publications ap2 ON ap1.publication_id = ap2.publication_id
  JOIN public.publications p ON ap1.publication_id = p.id
  WHERE ap1.chercheur_id = c1_id 
    AND ap2.chercheur_id = c2_id;
  
  IF pub_count > 0 THEN
    INSERT INTO public.collaborations (chercheur1_id, chercheur2_id, nombre_publications, premiere_collaboration, derniere_collaboration)
    VALUES (LEAST(c1_id, c2_id), GREATEST(c1_id, c2_id), pub_count, first_collab, last_collab)
    ON CONFLICT (chercheur1_id, chercheur2_id) 
    DO UPDATE SET 
      nombre_publications = pub_count,
      premiere_collaboration = first_collab,
      derniere_collaboration = last_collab,
      updated_at = now();
  END IF;
END;
$$;