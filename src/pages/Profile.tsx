import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  BookOpen,
  Award,
  TrendingUp,
  Edit,
  Calendar,
  ExternalLink,
  GraduationCap,
  FileText,
  Globe,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileForm from "@/components/profile/ProfileForm";

interface ChercheurProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  specialite: string | null;
  grade: string | null;
  biographie: string | null;
  photo_url: string | null;
  h_index: number;
  total_citations: number;
  i10_index: number;
  nombre_publications: number;
  domaines_recherche: string[] | null;
  institution_principale: string | null;
  ville: string | null;
  adresse: string | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  nationalite: string | null;
  sexe: string | null;
  diplome_plus_eleve: string | null;
  universite_diplome: string | null;
  annee_diplome: number | null;
  langues: string[] | null;
  orcid: string | null;
  google_scholar_id: string | null;
  linkedin_url: string | null;
  researchgate_id: string | null;
  cv_url: string | null;
  province_id: string | null;
  centre_id: string | null;
}

interface Publication {
  id: string;
  titre: string;
  annee: number;
  type: string;
  journal: string | null;
  doi: string | null;
  nombre_citations: number;
}

const gradeLabels: Record<string, string> = {
  professeur_ordinaire: "Professeur Ordinaire",
  professeur_associe: "Professeur Associé",
  chef_de_travaux: "Chef de Travaux",
  assistant: "Assistant",
  chercheur_senior: "Chercheur Senior",
  chercheur_junior: "Chercheur Junior",
  doctorant: "Doctorant",
  autre: "Autre",
};

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ChercheurProfile | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPublications();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("chercheurs")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfile(data as ChercheurProfile);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPublications = async () => {
    try {
      const { data: chercheurData } = await supabase
        .from("chercheurs")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!chercheurData) return;

      const { data, error } = await supabase
        .from("auteurs_publications")
        .select(`
          publication_id,
          publications (
            id,
            titre,
            annee,
            type,
            journal,
            doi,
            nombre_citations
          )
        `)
        .eq("chercheur_id", chercheurData.id)
        .order("ordre", { ascending: true });

      if (error) throw error;

      const pubs = data
        ?.map((item: any) => item.publications)
        .filter((pub: any) => pub !== null) || [];

      setPublications(pubs);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleProfileUpdated = (updatedProfile: any) => {
    setProfile(updatedProfile);
    if (!updatedProfile.photo_url && profile?.photo_url) {
      // Photo was removed
      setProfile({ ...profile, photo_url: null });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="chercheur">
        <div className="min-h-screen">
          <Header />
          <div className="container py-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute requiredRole="chercheur">
        <div className="min-h-screen">
          <Header />
          <div className="container py-24">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Profil non trouvé</CardTitle>
                <CardDescription>
                  Aucun profil chercheur n'est associé à votre compte. Contactez un administrateur.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="chercheur">
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Mon Profil</h1>
                <p className="text-muted-foreground">
                  Gérez vos informations personnelles et académiques
                </p>
              </div>
              {!editing && (
                <Button onClick={() => setEditing(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Modifier le profil
                </Button>
              )}
            </div>

            {editing ? (
              /* Editing Mode - Full Form */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Modifier le profil</h2>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Annuler
                  </Button>
                </div>
                <ProfileForm profile={profile} onProfileUpdated={(p) => {
                  handleProfileUpdated(p);
                  setEditing(false);
                }} />
              </motion.div>
            ) : (
              /* View Mode */
              <>
                {/* Header Card */}
                <Card className="border-border/50 shadow-elegant">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <Avatar className="h-32 w-32 border-4 border-primary/20">
                        <AvatarImage src={profile.photo_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                          {profile.prenom[0]}{profile.nom[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h1 className="text-3xl font-bold">
                            {profile.prenom} {profile.nom}
                          </h1>
                          {profile.grade && (
                            <p className="text-lg text-muted-foreground mt-1">
                              {gradeLabels[profile.grade] || profile.grade}
                            </p>
                          )}
                          {profile.specialite && (
                            <Badge variant="secondary" className="mt-2">
                              {profile.specialite}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {profile.email}
                          </div>
                          {profile.telephone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              {profile.telephone}
                            </div>
                          )}
                          {profile.ville && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {profile.ville}
                            </div>
                          )}
                          {profile.institution_principale && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Briefcase className="h-4 w-4" />
                              {profile.institution_principale}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{profile.nombre_publications}</p>
                          <p className="text-sm text-muted-foreground">Publications</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{profile.h_index}</p>
                          <p className="text-sm text-muted-foreground">H-Index</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{profile.total_citations}</p>
                          <p className="text-sm text-muted-foreground">Citations</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{profile.i10_index}</p>
                          <p className="text-sm text-muted-foreground">i10-Index</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="about" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="about">À propos</TabsTrigger>
                    <TabsTrigger value="publications">Publications</TabsTrigger>
                    <TabsTrigger value="links">Liens</TabsTrigger>
                  </TabsList>

                  <TabsContent value="about" className="space-y-6">
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Biographie</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile.biographie ? (
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {profile.biographie}
                          </p>
                        ) : (
                          <p className="text-muted-foreground italic">
                            Aucune biographie disponible.
                          </p>
                        )}

                        {profile.domaines_recherche && profile.domaines_recherche.length > 0 && (
                          <div className="pt-4">
                            <h3 className="text-sm font-semibold mb-3">Domaines de recherche</h3>
                            <div className="flex flex-wrap gap-2">
                              {profile.domaines_recherche.map((domaine, index) => (
                                <Badge key={index} variant="outline">
                                  {domaine}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {profile.langues && profile.langues.length > 0 && (
                          <div className="pt-4">
                            <h3 className="text-sm font-semibold mb-3">Langues</h3>
                            <div className="flex flex-wrap gap-2">
                              {profile.langues.map((langue, index) => (
                                <Badge key={index} variant="secondary">
                                  {langue}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Formation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {profile.diplome_plus_eleve && (
                          <div className="flex items-center gap-3">
                            <GraduationCap className="h-5 w-5 text-muted-foreground" />
                            <span>{profile.diplome_plus_eleve}</span>
                            {profile.annee_diplome && (
                              <Badge variant="outline">{profile.annee_diplome}</Badge>
                            )}
                          </div>
                        )}
                        {profile.universite_diplome && (
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                            <span>{profile.universite_diplome}</span>
                          </div>
                        )}
                        {!profile.diplome_plus_eleve && !profile.universite_diplome && (
                          <p className="text-muted-foreground italic">
                            Aucune information sur la formation.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="publications" className="space-y-6">
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Publications récentes</CardTitle>
                        <CardDescription>
                          {publications.length} publication(s) trouvée(s)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {publications.length > 0 ? (
                          <div className="space-y-4">
                            {publications.map((pub) => (
                              <div
                                key={pub.id}
                                className="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{pub.titre}</h4>
                                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {pub.annee}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {pub.type}
                                      </Badge>
                                      {pub.journal && <span>{pub.journal}</span>}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      {pub.nombre_citations} citations
                                    </p>
                                    {pub.doi && (
                                      <a
                                        href={`https://doi.org/${pub.doi}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        DOI
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground italic text-center py-8">
                            Aucune publication trouvée.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="links" className="space-y-6">
                    <Card className="border-border/50">
                      <CardHeader>
                        <CardTitle>Profils académiques</CardTitle>
                        <CardDescription>
                          Vos liens vers les plateformes académiques
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profile.orcid && (
                          <a
                            href={`https://orcid.org/${profile.orcid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <div className="p-2 rounded-lg bg-green-500/10">
                              <Globe className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">ORCID</p>
                              <p className="text-sm text-muted-foreground">{profile.orcid}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        )}

                        {profile.google_scholar_id && (
                          <a
                            href={`https://scholar.google.com/citations?user=${profile.google_scholar_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Google Scholar</p>
                              <p className="text-sm text-muted-foreground">
                                {profile.google_scholar_id}
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        )}

                        {profile.researchgate_id && (
                          <a
                            href={`https://www.researchgate.net/profile/${profile.researchgate_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <div className="p-2 rounded-lg bg-teal-500/10">
                              <FileText className="h-5 w-5 text-teal-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">ResearchGate</p>
                              <p className="text-sm text-muted-foreground">
                                {profile.researchgate_id}
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        )}

                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <div className="p-2 rounded-lg bg-blue-600/10">
                              <User className="h-5 w-5 text-blue-700" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">LinkedIn</p>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {profile.linkedin_url}
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        )}

                        {!profile.orcid &&
                          !profile.google_scholar_id &&
                          !profile.researchgate_id &&
                          !profile.linkedin_url && (
                            <p className="text-muted-foreground italic text-center py-8">
                              Aucun lien académique configuré. Cliquez sur "Modifier le profil" pour en ajouter.
                            </p>
                          )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
