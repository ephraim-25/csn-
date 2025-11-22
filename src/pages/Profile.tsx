import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Save,
  X,
  Calendar,
  ExternalLink,
  GraduationCap,
} from "lucide-react";

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
  orcid: string | null;
  google_scholar_id: string | null;
  linkedin_url: string | null;
  cv_url: string | null;
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

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ChercheurProfile | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ChercheurProfile>>({});

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
        setProfile(data);
        setEditedProfile(data);
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

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("chercheurs")
        .update({
          telephone: editedProfile.telephone,
          specialite: editedProfile.specialite,
          biographie: editedProfile.biographie,
          institution_principale: editedProfile.institution_principale,
          ville: editedProfile.ville,
          orcid: editedProfile.orcid,
          google_scholar_id: editedProfile.google_scholar_id,
          linkedin_url: editedProfile.linkedin_url,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...editedProfile });
      setEditing(false);
      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setEditing(false);
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

        <main className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header Section */}
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
                        <p className="text-lg text-muted-foreground mt-1">{profile.grade}</p>
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

                    {!editing && (
                      <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Modifier le profil
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            {/* Main Content Tabs */}
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">À propos</TabsTrigger>
                <TabsTrigger value="publications">Publications</TabsTrigger>
                <TabsTrigger value="links">Liens académiques</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Biographie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="biographie">Biographie</Label>
                          <Textarea
                            id="biographie"
                            value={editedProfile.biographie || ""}
                            onChange={(e) =>
                              setEditedProfile({ ...editedProfile, biographie: e.target.value })
                            }
                            rows={6}
                            placeholder="Décrivez votre parcours académique..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="telephone">Téléphone</Label>
                            <Input
                              id="telephone"
                              value={editedProfile.telephone || ""}
                              onChange={(e) =>
                                setEditedProfile({ ...editedProfile, telephone: e.target.value })
                              }
                              placeholder="+243 XXX XXX XXX"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ville">Ville</Label>
                            <Input
                              id="ville"
                              value={editedProfile.ville || ""}
                              onChange={(e) =>
                                setEditedProfile({ ...editedProfile, ville: e.target.value })
                              }
                              placeholder="Kinshasa"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="specialite">Spécialité</Label>
                            <Input
                              id="specialite"
                              value={editedProfile.specialite || ""}
                              onChange={(e) =>
                                setEditedProfile({ ...editedProfile, specialite: e.target.value })
                              }
                              placeholder="Intelligence Artificielle"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="institution">Institution</Label>
                            <Input
                              id="institution"
                              value={editedProfile.institution_principale || ""}
                              onChange={(e) =>
                                setEditedProfile({
                                  ...editedProfile,
                                  institution_principale: e.target.value,
                                })
                              }
                              placeholder="Université de Kinshasa"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSave} disabled={saving} className="gap-2">
                            <Save className="h-4 w-4" />
                            {saving ? "Enregistrement..." : "Enregistrer"}
                          </Button>
                          <Button onClick={handleCancel} variant="outline" className="gap-2">
                            <X className="h-4 w-4" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profile.biographie ? (
                          <p className="text-muted-foreground leading-relaxed">{profile.biographie}</p>
                        ) : (
                          <p className="text-muted-foreground italic">
                            Aucune biographie disponible. Cliquez sur "Modifier le profil" pour en ajouter une.
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="publications" className="space-y-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Publications ({publications.length})</CardTitle>
                    <CardDescription>Liste de vos publications scientifiques</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {publications.length > 0 ? (
                      <div className="space-y-4">
                        {publications.map((pub) => (
                          <div
                            key={pub.id}
                            className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <h3 className="font-semibold mb-2">{pub.titre}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {pub.annee}
                              </span>
                              <Badge variant="secondary">{pub.type}</Badge>
                              {pub.journal && <span>{pub.journal}</span>}
                              {pub.nombre_citations > 0 && (
                                <span className="text-primary font-medium">
                                  {pub.nombre_citations} citations
                                </span>
                              )}
                            </div>
                            {pub.doi && (
                              <a
                                href={`https://doi.org/${pub.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                              >
                                DOI: {pub.doi}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Aucune publication enregistrée pour le moment.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="links" className="space-y-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>Liens académiques</CardTitle>
                    <CardDescription>
                      Vos profils sur les plateformes académiques
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="orcid">ORCID</Label>
                          <Input
                            id="orcid"
                            value={editedProfile.orcid || ""}
                            onChange={(e) =>
                              setEditedProfile({ ...editedProfile, orcid: e.target.value })
                            }
                            placeholder="0000-0000-0000-0000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="google_scholar">Google Scholar ID</Label>
                          <Input
                            id="google_scholar"
                            value={editedProfile.google_scholar_id || ""}
                            onChange={(e) =>
                              setEditedProfile({ ...editedProfile, google_scholar_id: e.target.value })
                            }
                            placeholder="XXXXXXXXXX"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn URL</Label>
                          <Input
                            id="linkedin"
                            value={editedProfile.linkedin_url || ""}
                            onChange={(e) =>
                              setEditedProfile({ ...editedProfile, linkedin_url: e.target.value })
                            }
                            placeholder="https://linkedin.com/in/..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profile.orcid && (
                          <a
                            href={`https://orcid.org/${profile.orcid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <div className="p-2 rounded-lg bg-primary/10">
                              <ExternalLink className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">ORCID</p>
                              <p className="text-sm text-muted-foreground">{profile.orcid}</p>
                            </div>
                          </a>
                        )}

                        {profile.google_scholar_id && (
                          <a
                            href={`https://scholar.google.com/citations?user=${profile.google_scholar_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <div className="p-2 rounded-lg bg-primary/10">
                              <ExternalLink className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Google Scholar</p>
                              <p className="text-sm text-muted-foreground">
                                Voir le profil
                              </p>
                            </div>
                          </a>
                        )}

                        {profile.linkedin_url && (
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                          >
                            <div className="p-2 rounded-lg bg-primary/10">
                              <ExternalLink className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">LinkedIn</p>
                              <p className="text-sm text-muted-foreground">
                                Voir le profil professionnel
                              </p>
                            </div>
                          </a>
                        )}

                        {!profile.orcid && !profile.google_scholar_id && !profile.linkedin_url && (
                          <p className="text-muted-foreground text-center py-8">
                            Aucun lien académique configuré. Cliquez sur "Modifier le profil" pour en ajouter.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
