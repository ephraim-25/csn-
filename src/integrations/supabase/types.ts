export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      actualites: {
        Row: {
          auteur_id: string | null
          categorie: string | null
          contenu: string
          created_at: string
          date_publication: string | null
          est_publie: boolean | null
          id: string
          image_url: string | null
          nombre_vues: number | null
          resume: string | null
          tags: string[] | null
          titre: string
          updated_at: string
        }
        Insert: {
          auteur_id?: string | null
          categorie?: string | null
          contenu: string
          created_at?: string
          date_publication?: string | null
          est_publie?: boolean | null
          id?: string
          image_url?: string | null
          nombre_vues?: number | null
          resume?: string | null
          tags?: string[] | null
          titre: string
          updated_at?: string
        }
        Update: {
          auteur_id?: string | null
          categorie?: string | null
          contenu?: string
          created_at?: string
          date_publication?: string | null
          est_publie?: boolean | null
          id?: string
          image_url?: string | null
          nombre_vues?: number | null
          resume?: string | null
          tags?: string[] | null
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actualites_auteur_id_fkey"
            columns: ["auteur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          description: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          description?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          description?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auteurs_publications: {
        Row: {
          affiliation_publication: string | null
          chercheur_id: string
          created_at: string
          est_correspondant: boolean | null
          id: string
          ordre: number
          publication_id: string
        }
        Insert: {
          affiliation_publication?: string | null
          chercheur_id: string
          created_at?: string
          est_correspondant?: boolean | null
          id?: string
          ordre?: number
          publication_id: string
        }
        Update: {
          affiliation_publication?: string | null
          chercheur_id?: string
          created_at?: string
          est_correspondant?: boolean | null
          id?: string
          ordre?: number
          publication_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auteurs_publications_chercheur_id_fkey"
            columns: ["chercheur_id"]
            isOneToOne: false
            referencedRelation: "chercheurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auteurs_publications_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      centres_recherche: {
        Row: {
          acronyme: string | null
          adresse: string | null
          budget_annuel: number | null
          created_at: string
          date_creation: string | null
          description: string | null
          directeur_id: string | null
          domaines_recherche: string[] | null
          email: string | null
          est_actif: boolean | null
          id: string
          logo_url: string | null
          nom: string
          nombre_chercheurs: number | null
          province_id: string | null
          site_web: string | null
          telephone: string | null
          updated_at: string
        }
        Insert: {
          acronyme?: string | null
          adresse?: string | null
          budget_annuel?: number | null
          created_at?: string
          date_creation?: string | null
          description?: string | null
          directeur_id?: string | null
          domaines_recherche?: string[] | null
          email?: string | null
          est_actif?: boolean | null
          id?: string
          logo_url?: string | null
          nom: string
          nombre_chercheurs?: number | null
          province_id?: string | null
          site_web?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Update: {
          acronyme?: string | null
          adresse?: string | null
          budget_annuel?: number | null
          created_at?: string
          date_creation?: string | null
          description?: string | null
          directeur_id?: string | null
          domaines_recherche?: string[] | null
          email?: string | null
          est_actif?: boolean | null
          id?: string
          logo_url?: string | null
          nom?: string
          nombre_chercheurs?: number | null
          province_id?: string | null
          site_web?: string | null
          telephone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "centres_recherche_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_centres_directeur"
            columns: ["directeur_id"]
            isOneToOne: false
            referencedRelation: "chercheurs"
            referencedColumns: ["id"]
          },
        ]
      }
      chercheurs: {
        Row: {
          adresse: string | null
          annee_diplome: number | null
          biographie: string | null
          centre_id: string | null
          created_at: string
          cv_url: string | null
          date_inscription: string | null
          date_naissance: string | null
          departement_id: string | null
          derniere_mise_a_jour: string | null
          diplome_plus_eleve: string | null
          domaines_recherche: string[] | null
          email: string
          est_actif: boolean | null
          google_scholar_id: string | null
          grade: Database["public"]["Enums"]["grade_academique"] | null
          h_index: number | null
          i10_index: number | null
          id: string
          institution_principale: string | null
          langues: string[] | null
          lieu_naissance: string | null
          linkedin_url: string | null
          matricule: string | null
          nationalite: string | null
          nom: string
          nom_complet: string | null
          nombre_publications: number | null
          orcid: string | null
          photo_url: string | null
          prenom: string
          province_id: string | null
          researchgate_id: string | null
          sexe: string | null
          specialite: string | null
          telephone: string | null
          total_citations: number | null
          universite_diplome: string | null
          updated_at: string
          user_id: string
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          annee_diplome?: number | null
          biographie?: string | null
          centre_id?: string | null
          created_at?: string
          cv_url?: string | null
          date_inscription?: string | null
          date_naissance?: string | null
          departement_id?: string | null
          derniere_mise_a_jour?: string | null
          diplome_plus_eleve?: string | null
          domaines_recherche?: string[] | null
          email: string
          est_actif?: boolean | null
          google_scholar_id?: string | null
          grade?: Database["public"]["Enums"]["grade_academique"] | null
          h_index?: number | null
          i10_index?: number | null
          id?: string
          institution_principale?: string | null
          langues?: string[] | null
          lieu_naissance?: string | null
          linkedin_url?: string | null
          matricule?: string | null
          nationalite?: string | null
          nom: string
          nom_complet?: string | null
          nombre_publications?: number | null
          orcid?: string | null
          photo_url?: string | null
          prenom: string
          province_id?: string | null
          researchgate_id?: string | null
          sexe?: string | null
          specialite?: string | null
          telephone?: string | null
          total_citations?: number | null
          universite_diplome?: string | null
          updated_at?: string
          user_id: string
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          annee_diplome?: number | null
          biographie?: string | null
          centre_id?: string | null
          created_at?: string
          cv_url?: string | null
          date_inscription?: string | null
          date_naissance?: string | null
          departement_id?: string | null
          derniere_mise_a_jour?: string | null
          diplome_plus_eleve?: string | null
          domaines_recherche?: string[] | null
          email?: string
          est_actif?: boolean | null
          google_scholar_id?: string | null
          grade?: Database["public"]["Enums"]["grade_academique"] | null
          h_index?: number | null
          i10_index?: number | null
          id?: string
          institution_principale?: string | null
          langues?: string[] | null
          lieu_naissance?: string | null
          linkedin_url?: string | null
          matricule?: string | null
          nationalite?: string | null
          nom?: string
          nom_complet?: string | null
          nombre_publications?: number | null
          orcid?: string | null
          photo_url?: string | null
          prenom?: string
          province_id?: string | null
          researchgate_id?: string | null
          sexe?: string | null
          specialite?: string | null
          telephone?: string | null
          total_citations?: number | null
          universite_diplome?: string | null
          updated_at?: string
          user_id?: string
          ville?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chercheurs_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres_recherche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chercheurs_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chercheurs_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chercheurs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborations: {
        Row: {
          chercheur1_id: string
          chercheur2_id: string
          created_at: string
          derniere_collaboration: string | null
          domaines_communs: string[] | null
          id: string
          nombre_publications: number | null
          premiere_collaboration: string | null
          updated_at: string
        }
        Insert: {
          chercheur1_id: string
          chercheur2_id: string
          created_at?: string
          derniere_collaboration?: string | null
          domaines_communs?: string[] | null
          id?: string
          nombre_publications?: number | null
          premiere_collaboration?: string | null
          updated_at?: string
        }
        Update: {
          chercheur1_id?: string
          chercheur2_id?: string
          created_at?: string
          derniere_collaboration?: string | null
          domaines_communs?: string[] | null
          id?: string
          nombre_publications?: number | null
          premiere_collaboration?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_chercheur1_id_fkey"
            columns: ["chercheur1_id"]
            isOneToOne: false
            referencedRelation: "chercheurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborations_chercheur2_id_fkey"
            columns: ["chercheur2_id"]
            isOneToOne: false
            referencedRelation: "chercheurs"
            referencedColumns: ["id"]
          },
        ]
      }
      departements: {
        Row: {
          budget: number | null
          centre_id: string
          created_at: string
          description: string | null
          id: string
          nom: string
          responsable_id: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          centre_id: string
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          responsable_id?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          centre_id?: string
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          responsable_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departements_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres_recherche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_departements_responsable"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "chercheurs"
            referencedColumns: ["id"]
          },
        ]
      }
      equipements: {
        Row: {
          categorie: string | null
          centre_id: string | null
          cout_acquisition: number | null
          created_at: string
          date_acquisition: string | null
          date_derniere_maintenance: string | null
          departement_id: string | null
          description: string | null
          est_disponible: boolean | null
          etat: string | null
          fournisseur: string | null
          id: string
          manuel_url: string | null
          marque: string | null
          modele: string | null
          nom: string
          numero_serie: string | null
          photo_url: string | null
          prochaine_maintenance: string | null
          responsable_id: string | null
          salle: string | null
          specifications: Json | null
          updated_at: string
        }
        Insert: {
          categorie?: string | null
          centre_id?: string | null
          cout_acquisition?: number | null
          created_at?: string
          date_acquisition?: string | null
          date_derniere_maintenance?: string | null
          departement_id?: string | null
          description?: string | null
          est_disponible?: boolean | null
          etat?: string | null
          fournisseur?: string | null
          id?: string
          manuel_url?: string | null
          marque?: string | null
          modele?: string | null
          nom: string
          numero_serie?: string | null
          photo_url?: string | null
          prochaine_maintenance?: string | null
          responsable_id?: string | null
          salle?: string | null
          specifications?: Json | null
          updated_at?: string
        }
        Update: {
          categorie?: string | null
          centre_id?: string | null
          cout_acquisition?: number | null
          created_at?: string
          date_acquisition?: string | null
          date_derniere_maintenance?: string | null
          departement_id?: string | null
          description?: string | null
          est_disponible?: boolean | null
          etat?: string | null
          fournisseur?: string | null
          id?: string
          manuel_url?: string | null
          marque?: string | null
          modele?: string | null
          nom?: string
          numero_serie?: string | null
          photo_url?: string | null
          prochaine_maintenance?: string | null
          responsable_id?: string | null
          salle?: string | null
          specifications?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipements_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres_recherche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipements_departement_id_fkey"
            columns: ["departement_id"]
            isOneToOne: false
            referencedRelation: "departements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipements_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "chercheurs"
            referencedColumns: ["id"]
          },
        ]
      }
      membres_projet: {
        Row: {
          chercheur_id: string
          created_at: string
          date_debut: string | null
          date_fin: string | null
          id: string
          pourcentage_temps: number | null
          projet_id: string
          role: string
        }
        Insert: {
          chercheur_id: string
          created_at?: string
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          pourcentage_temps?: number | null
          projet_id: string
          role: string
        }
        Update: {
          chercheur_id?: string
          created_at?: string
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          pourcentage_temps?: number | null
          projet_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "membres_projet_chercheur_id_fkey"
            columns: ["chercheur_id"]
            isOneToOne: false
            referencedRelation: "chercheurs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membres_projet_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets_recherche"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_abonnes: {
        Row: {
          created_at: string
          date_desabonnement: string | null
          date_inscription: string
          email: string
          est_actif: boolean | null
          id: string
          interets: string[] | null
          nom: string | null
          organisation: string | null
          prenom: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          date_desabonnement?: string | null
          date_inscription?: string
          email: string
          est_actif?: boolean | null
          id?: string
          interets?: string[] | null
          nom?: string | null
          organisation?: string | null
          prenom?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          date_desabonnement?: string | null
          date_inscription?: string
          email?: string
          est_actif?: boolean | null
          id?: string
          interets?: string[] | null
          nom?: string | null
          organisation?: string | null
          prenom?: string | null
          source?: string | null
        }
        Relationships: []
      }
      newsletter_envois: {
        Row: {
          contenu: string
          created_at: string
          date_envoi: string
          envoye_par: string | null
          id: string
          nombre_clics: number | null
          nombre_destinataires: number | null
          nombre_ouvertures: number | null
          sujet: string
        }
        Insert: {
          contenu: string
          created_at?: string
          date_envoi?: string
          envoye_par?: string | null
          id?: string
          nombre_clics?: number | null
          nombre_destinataires?: number | null
          nombre_ouvertures?: number | null
          sujet: string
        }
        Update: {
          contenu?: string
          created_at?: string
          date_envoi?: string
          envoye_par?: string | null
          id?: string
          nombre_clics?: number | null
          nombre_destinataires?: number | null
          nombre_ouvertures?: number | null
          sujet?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_envois_envoye_par_fkey"
            columns: ["envoye_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pages_dynamiques: {
        Row: {
          auteur_id: string | null
          centre_id: string | null
          contenu: string | null
          created_at: string
          date_publication: string | null
          est_publie: boolean | null
          galerie_images: string[] | null
          id: string
          image_principale_url: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          nombre_vues: number | null
          slug: string
          titre: string
          updated_at: string
        }
        Insert: {
          auteur_id?: string | null
          centre_id?: string | null
          contenu?: string | null
          created_at?: string
          date_publication?: string | null
          est_publie?: boolean | null
          galerie_images?: string[] | null
          id?: string
          image_principale_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          nombre_vues?: number | null
          slug: string
          titre: string
          updated_at?: string
        }
        Update: {
          auteur_id?: string | null
          centre_id?: string | null
          contenu?: string | null
          created_at?: string
          date_publication?: string | null
          est_publie?: boolean | null
          galerie_images?: string[] | null
          id?: string
          image_principale_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          nombre_vues?: number | null
          slug?: string
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_dynamiques_auteur_id_fkey"
            columns: ["auteur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_dynamiques_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres_recherche"
            referencedColumns: ["id"]
          },
        ]
      }
      parametres_systeme: {
        Row: {
          categorie: string | null
          cle: string
          created_at: string
          description: string | null
          id: string
          modifie_par: string | null
          type: string | null
          updated_at: string
          valeur: string | null
        }
        Insert: {
          categorie?: string | null
          cle: string
          created_at?: string
          description?: string | null
          id?: string
          modifie_par?: string | null
          type?: string | null
          updated_at?: string
          valeur?: string | null
        }
        Update: {
          categorie?: string | null
          cle?: string
          created_at?: string
          description?: string | null
          id?: string
          modifie_par?: string | null
          type?: string | null
          updated_at?: string
          valeur?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parametres_systeme_modifie_par_fkey"
            columns: ["modifie_par"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partenariats: {
        Row: {
          accord_cadre_url: string | null
          centre_id: string | null
          contact_email: string | null
          contact_nom: string | null
          contact_telephone: string | null
          created_at: string
          date_debut: string | null
          date_fin: string | null
          description: string | null
          domaines_collaboration: string[] | null
          est_actif: boolean | null
          id: string
          logo_url: string | null
          nom_partenaire: string
          pays: string | null
          site_web: string | null
          type: Database["public"]["Enums"]["type_partenariat"]
          updated_at: string
        }
        Insert: {
          accord_cadre_url?: string | null
          centre_id?: string | null
          contact_email?: string | null
          contact_nom?: string | null
          contact_telephone?: string | null
          created_at?: string
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          domaines_collaboration?: string[] | null
          est_actif?: boolean | null
          id?: string
          logo_url?: string | null
          nom_partenaire: string
          pays?: string | null
          site_web?: string | null
          type: Database["public"]["Enums"]["type_partenariat"]
          updated_at?: string
        }
        Update: {
          accord_cadre_url?: string | null
          centre_id?: string | null
          contact_email?: string | null
          contact_nom?: string | null
          contact_telephone?: string | null
          created_at?: string
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          domaines_collaboration?: string[] | null
          est_actif?: boolean | null
          id?: string
          logo_url?: string | null
          nom_partenaire?: string
          pays?: string | null
          site_web?: string | null
          type?: Database["public"]["Enums"]["type_partenariat"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partenariats_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres_recherche"
            referencedColumns: ["id"]
          },
        ]
      }
      prix_distinctions: {
        Row: {
          annee: number
          certificat_url: string | null
          chercheur_id: string
          created_at: string
          description: string | null
          id: string
          montant: number | null
          niveau: string | null
          nom_prix: string
          organisme: string | null
        }
        Insert: {
          annee: number
          certificat_url?: string | null
          chercheur_id: string
          created_at?: string
          description?: string | null
          id?: string
          montant?: number | null
          niveau?: string | null
          nom_prix: string
          organisme?: string | null
        }
        Update: {
          annee?: number
          certificat_url?: string | null
          chercheur_id?: string
          created_at?: string
          description?: string | null
          id?: string
          montant?: number | null
          niveau?: string | null
          nom_prix?: string
          organisme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prix_distinctions_chercheur_id_fkey"
            columns: ["chercheur_id"]
            isOneToOne: false
            referencedRelation: "chercheurs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          institution: string | null
          speciality: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          institution?: string | null
          speciality?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          institution?: string | null
          speciality?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projets_recherche: {
        Row: {
          acronyme: string | null
          beneficiaires: string | null
          budget_obtenu: number | null
          budget_total: number | null
          centre_id: string | null
          coordinateur_id: string | null
          created_at: string
          date_debut: string
          date_fin_prevue: string | null
          date_fin_reelle: string | null
          description: string | null
          domaine_principal: string | null
          domaines_secondaires: string[] | null
          est_public: boolean | null
          id: string
          impact_attendu: string | null
          mots_cles: string[] | null
          numero_contrat: string | null
          objectifs: string | null
          objectifs_developpement_durable: string[] | null
          site_web: string | null
          source_financement: string | null
          statut: Database["public"]["Enums"]["statut_projet"] | null
          titre: string
          updated_at: string
        }
        Insert: {
          acronyme?: string | null
          beneficiaires?: string | null
          budget_obtenu?: number | null
          budget_total?: number | null
          centre_id?: string | null
          coordinateur_id?: string | null
          created_at?: string
          date_debut: string
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          description?: string | null
          domaine_principal?: string | null
          domaines_secondaires?: string[] | null
          est_public?: boolean | null
          id?: string
          impact_attendu?: string | null
          mots_cles?: string[] | null
          numero_contrat?: string | null
          objectifs?: string | null
          objectifs_developpement_durable?: string[] | null
          site_web?: string | null
          source_financement?: string | null
          statut?: Database["public"]["Enums"]["statut_projet"] | null
          titre: string
          updated_at?: string
        }
        Update: {
          acronyme?: string | null
          beneficiaires?: string | null
          budget_obtenu?: number | null
          budget_total?: number | null
          centre_id?: string | null
          coordinateur_id?: string | null
          created_at?: string
          date_debut?: string
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          description?: string | null
          domaine_principal?: string | null
          domaines_secondaires?: string[] | null
          est_public?: boolean | null
          id?: string
          impact_attendu?: string | null
          mots_cles?: string[] | null
          numero_contrat?: string | null
          objectifs?: string | null
          objectifs_developpement_durable?: string[] | null
          site_web?: string | null
          source_financement?: string | null
          statut?: Database["public"]["Enums"]["statut_projet"] | null
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projets_recherche_centre_id_fkey"
            columns: ["centre_id"]
            isOneToOne: false
            referencedRelation: "centres_recherche"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projets_recherche_coordinateur_id_fkey"
            columns: ["coordinateur_id"]
            isOneToOne: false
            referencedRelation: "chercheurs"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          chef_lieu: string | null
          code: string | null
          created_at: string
          description: string | null
          id: string
          nom: string
          population: number | null
          superficie: number | null
          updated_at: string
        }
        Insert: {
          chef_lieu?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          nom: string
          population?: number | null
          superficie?: number | null
          updated_at?: string
        }
        Update: {
          chef_lieu?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          nom?: string
          population?: number | null
          superficie?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          annee: number
          conference: string | null
          created_at: string
          date_acceptation: string | null
          date_publication: string | null
          date_soumission: string | null
          doi: string | null
          editeur: string | null
          est_peer_reviewed: boolean | null
          est_publie: boolean | null
          id: string
          impact_factor: number | null
          isbn: string | null
          issn: string | null
          journal: string | null
          langue: string | null
          mois: number | null
          mots_cles: string[] | null
          nombre_citations: number | null
          nombre_lectures: number | null
          numero: string | null
          pages: string | null
          pdf_url: string | null
          quartile: Database["public"]["Enums"]["quartile"] | null
          resume: string | null
          titre: string
          type: Database["public"]["Enums"]["publication_type"]
          updated_at: string
          url: string | null
          volume: string | null
        }
        Insert: {
          annee: number
          conference?: string | null
          created_at?: string
          date_acceptation?: string | null
          date_publication?: string | null
          date_soumission?: string | null
          doi?: string | null
          editeur?: string | null
          est_peer_reviewed?: boolean | null
          est_publie?: boolean | null
          id?: string
          impact_factor?: number | null
          isbn?: string | null
          issn?: string | null
          journal?: string | null
          langue?: string | null
          mois?: number | null
          mots_cles?: string[] | null
          nombre_citations?: number | null
          nombre_lectures?: number | null
          numero?: string | null
          pages?: string | null
          pdf_url?: string | null
          quartile?: Database["public"]["Enums"]["quartile"] | null
          resume?: string | null
          titre: string
          type: Database["public"]["Enums"]["publication_type"]
          updated_at?: string
          url?: string | null
          volume?: string | null
        }
        Update: {
          annee?: number
          conference?: string | null
          created_at?: string
          date_acceptation?: string | null
          date_publication?: string | null
          date_soumission?: string | null
          doi?: string | null
          editeur?: string | null
          est_peer_reviewed?: boolean | null
          est_publie?: boolean | null
          id?: string
          impact_factor?: number | null
          isbn?: string | null
          issn?: string | null
          journal?: string | null
          langue?: string | null
          mois?: number | null
          mots_cles?: string[] | null
          nombre_citations?: number | null
          nombre_lectures?: number | null
          numero?: string | null
          pages?: string | null
          pdf_url?: string | null
          quartile?: Database["public"]["Enums"]["quartile"] | null
          resume?: string | null
          titre?: string
          type?: Database["public"]["Enums"]["publication_type"]
          updated_at?: string
          url?: string | null
          volume?: string | null
        }
        Relationships: []
      }
      statistiques_globales: {
        Row: {
          citations_totales: number | null
          created_at: string
          date: string
          h_index_moyen: number | null
          id: string
          nombre_centres: number | null
          nombre_chercheurs_actifs: number | null
          nombre_chercheurs_total: number | null
          nombre_projets_total: number | null
          nombre_publications_total: number | null
          nouveaux_chercheurs: number | null
          nouveaux_projets: number | null
          nouvelles_publications: number | null
          projets_actifs: number | null
          publications_cette_annee: number | null
        }
        Insert: {
          citations_totales?: number | null
          created_at?: string
          date?: string
          h_index_moyen?: number | null
          id?: string
          nombre_centres?: number | null
          nombre_chercheurs_actifs?: number | null
          nombre_chercheurs_total?: number | null
          nombre_projets_total?: number | null
          nombre_publications_total?: number | null
          nouveaux_chercheurs?: number | null
          nouveaux_projets?: number | null
          nouvelles_publications?: number | null
          projets_actifs?: number | null
          publications_cette_annee?: number | null
        }
        Update: {
          citations_totales?: number | null
          created_at?: string
          date?: string
          h_index_moyen?: number | null
          id?: string
          nombre_centres?: number | null
          nombre_chercheurs_actifs?: number | null
          nombre_chercheurs_total?: number | null
          nombre_projets_total?: number | null
          nombre_publications_total?: number | null
          nouveaux_chercheurs?: number | null
          nouveaux_projets?: number | null
          nouvelles_publications?: number | null
          projets_actifs?: number | null
          publications_cette_annee?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_collaboration: {
        Args: { c1_id: string; c2_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_chercheur_stats: {
        Args: { chercheur_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "chercheur"
      audit_action:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "LOGIN"
        | "LOGOUT"
        | "EXPORT"
        | "IMPORT"
      grade_academique:
        | "professeur_ordinaire"
        | "professeur_associe"
        | "chef_de_travaux"
        | "assistant"
        | "chercheur_senior"
        | "chercheur_junior"
        | "doctorant"
        | "autre"
      publication_type:
        | "article"
        | "livre"
        | "chapitre"
        | "conference"
        | "poster"
        | "these"
        | "memoire"
        | "rapport"
        | "brevet"
      quartile: "Q1" | "Q2" | "Q3" | "Q4" | "non_classe"
      statut_projet:
        | "en_preparation"
        | "en_cours"
        | "termine"
        | "suspendu"
        | "annule"
      type_partenariat:
        | "academique"
        | "industriel"
        | "gouvernemental"
        | "ong"
        | "international"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "chercheur"],
      audit_action: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "LOGIN",
        "LOGOUT",
        "EXPORT",
        "IMPORT",
      ],
      grade_academique: [
        "professeur_ordinaire",
        "professeur_associe",
        "chef_de_travaux",
        "assistant",
        "chercheur_senior",
        "chercheur_junior",
        "doctorant",
        "autre",
      ],
      publication_type: [
        "article",
        "livre",
        "chapitre",
        "conference",
        "poster",
        "these",
        "memoire",
        "rapport",
        "brevet",
      ],
      quartile: ["Q1", "Q2", "Q3", "Q4", "non_classe"],
      statut_projet: [
        "en_preparation",
        "en_cours",
        "termine",
        "suspendu",
        "annule",
      ],
      type_partenariat: [
        "academique",
        "industriel",
        "gouvernemental",
        "ong",
        "international",
      ],
    },
  },
} as const
