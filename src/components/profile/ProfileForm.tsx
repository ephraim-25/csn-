import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2 } from "lucide-react";
import PhotoUpload from "./PhotoUpload";

const grades = [
  { value: "professeur_ordinaire", label: "Professeur Ordinaire" },
  { value: "professeur_associe", label: "Professeur Associé" },
  { value: "chef_de_travaux", label: "Chef de Travaux" },
  { value: "assistant", label: "Assistant" },
  { value: "chercheur_senior", label: "Chercheur Senior" },
  { value: "chercheur_junior", label: "Chercheur Junior" },
  { value: "doctorant", label: "Doctorant" },
  { value: "autre", label: "Autre" },
];

const profileSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  telephone: z.string().optional(),
  specialite: z.string().optional(),
  grade: z.string().optional(),
  biographie: z.string().optional(),
  institution_principale: z.string().optional(),
  ville: z.string().optional(),
  adresse: z.string().optional(),
  date_naissance: z.string().optional(),
  lieu_naissance: z.string().optional(),
  nationalite: z.string().optional(),
  sexe: z.string().optional(),
  diplome_plus_eleve: z.string().optional(),
  universite_diplome: z.string().optional(),
  annee_diplome: z.coerce.number().optional(),
  domaines_recherche: z.string().optional(),
  langues: z.string().optional(),
  orcid: z.string().optional(),
  google_scholar_id: z.string().optional(),
  linkedin_url: z.string().optional(),
  researchgate_id: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: any;
  onProfileUpdated: (profile: any) => void;
}

export default function ProfileForm({ profile, onProfileUpdated }: ProfileFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [provinces, setProvinces] = useState<{ id: string; nom: string }[]>([]);
  const [centres, setCentres] = useState<{ id: string; nom: string; acronyme: string | null }[]>([]);
  const [selectedProvince, setSelectedProvince] = useState(profile.province_id || "");
  const [selectedCentre, setSelectedCentre] = useState(profile.centre_id || "");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nom: profile.nom || "",
      prenom: profile.prenom || "",
      telephone: profile.telephone || "",
      specialite: profile.specialite || "",
      grade: profile.grade || "",
      biographie: profile.biographie || "",
      institution_principale: profile.institution_principale || "",
      ville: profile.ville || "",
      adresse: profile.adresse || "",
      date_naissance: profile.date_naissance || "",
      lieu_naissance: profile.lieu_naissance || "",
      nationalite: profile.nationalite || "RDC",
      sexe: profile.sexe || "",
      diplome_plus_eleve: profile.diplome_plus_eleve || "",
      universite_diplome: profile.universite_diplome || "",
      annee_diplome: profile.annee_diplome || undefined,
      domaines_recherche: profile.domaines_recherche?.join(", ") || "",
      langues: profile.langues?.join(", ") || "",
      orcid: profile.orcid || "",
      google_scholar_id: profile.google_scholar_id || "",
      linkedin_url: profile.linkedin_url || "",
      researchgate_id: profile.researchgate_id || "",
    },
  });

  useEffect(() => {
    fetchProvinces();
    fetchCentres();
  }, []);

  const fetchProvinces = async () => {
    const { data } = await supabase.from("provinces").select("id, nom").order("nom");
    if (data) setProvinces(data);
  };

  const fetchCentres = async () => {
    const { data } = await supabase.from("centres_recherche").select("id, nom, acronyme").order("nom");
    if (data) setCentres(data);
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true);
    try {
      const updateData: any = {
        nom: values.nom,
        prenom: values.prenom,
        nom_complet: `${values.prenom} ${values.nom}`,
        telephone: values.telephone || null,
        specialite: values.specialite || null,
        grade: values.grade || null,
        biographie: values.biographie || null,
        institution_principale: values.institution_principale || null,
        ville: values.ville || null,
        adresse: values.adresse || null,
        date_naissance: values.date_naissance || null,
        lieu_naissance: values.lieu_naissance || null,
        nationalite: values.nationalite || null,
        sexe: values.sexe || null,
        diplome_plus_eleve: values.diplome_plus_eleve || null,
        universite_diplome: values.universite_diplome || null,
        annee_diplome: values.annee_diplome || null,
        domaines_recherche: values.domaines_recherche
          ? values.domaines_recherche.split(",").map((d) => d.trim()).filter(Boolean)
          : null,
        langues: values.langues
          ? values.langues.split(",").map((l) => l.trim()).filter(Boolean)
          : null,
        orcid: values.orcid || null,
        google_scholar_id: values.google_scholar_id || null,
        linkedin_url: values.linkedin_url || null,
        researchgate_id: values.researchgate_id || null,
        province_id: selectedProvince || null,
        centre_id: selectedCentre || null,
        derniere_mise_a_jour: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("chercheurs")
        .update(updateData)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdated(data);
      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour avec succès",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpdated = (url: string) => {
    onProfileUpdated({ ...profile, photo_url: url || null });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personnel</TabsTrigger>
            <TabsTrigger value="academic">Académique</TabsTrigger>
            <TabsTrigger value="professional">Professionnel</TabsTrigger>
            <TabsTrigger value="links">Liens</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Photo de profil</CardTitle>
                <CardDescription>
                  Ajoutez une photo professionnelle pour votre profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload
                  currentPhotoUrl={profile.photo_url}
                  chercheurId={profile.id}
                  initials={`${profile.prenom?.[0] || ""}${profile.nom?.[0] || ""}`}
                  onPhotoUpdated={handlePhotoUpdated}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Vos informations d'identité et de contact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dupont" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sexe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexe</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M">Masculin</SelectItem>
                            <SelectItem value="F">Féminin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_naissance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de naissance</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lieu_naissance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lieu de naissance</FormLabel>
                        <FormControl>
                          <Input placeholder="Kinshasa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationalite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationalité</FormLabel>
                        <FormControl>
                          <Input placeholder="RDC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+243 XXX XXX XXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ville"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Kinshasa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="adresse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse complète</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Avenue de la Libération, N°123, Commune de Gombe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Province</Label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="langues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Langues parlées</FormLabel>
                      <FormControl>
                        <Input placeholder="Français, Anglais, Lingala" {...field} />
                      </FormControl>
                      <FormDescription>Séparez les langues par des virgules</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Formation académique</CardTitle>
                <CardDescription>Votre parcours universitaire et diplômes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="diplome_plus_eleve"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diplôme le plus élevé</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="doctorat">Doctorat (PhD)</SelectItem>
                            <SelectItem value="master">Master / DEA</SelectItem>
                            <SelectItem value="licence">Licence</SelectItem>
                            <SelectItem value="ingenieur">Ingénieur</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="annee_diplome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Année d'obtention</FormLabel>
                        <FormControl>
                          <Input type="number" min="1950" max="2030" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="universite_diplome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Université / Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="Université de Kinshasa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spécialité / Domaine principal</FormLabel>
                      <FormControl>
                        <Input placeholder="Intelligence Artificielle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="domaines_recherche"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domaines de recherche</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Machine Learning, Deep Learning, NLP"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Séparez les domaines par des virgules
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Tab */}
          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations professionnelles</CardTitle>
                <CardDescription>Votre situation professionnelle actuelle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade académique</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grades.map((g) => (
                              <SelectItem key={g.value} value={g.value}>
                                {g.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="institution_principale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution principale</FormLabel>
                        <FormControl>
                          <Input placeholder="Université de Kinshasa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Centre de recherche</Label>
                  <Select value={selectedCentre} onValueChange={setSelectedCentre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un centre" />
                    </SelectTrigger>
                    <SelectContent>
                      {centres.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nom} {c.acronyme && `(${c.acronyme})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="biographie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biographie</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez votre parcours, vos intérêts de recherche et vos contributions principales..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Un résumé de votre parcours académique et de vos recherches
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Liens académiques</CardTitle>
                <CardDescription>
                  Vos profils sur les plateformes académiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="orcid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ORCID</FormLabel>
                      <FormControl>
                        <Input placeholder="0000-0000-0000-0000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Votre identifiant ORCID (ex: 0000-0002-1234-5678)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="google_scholar_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Scholar ID</FormLabel>
                      <FormControl>
                        <Input placeholder="XXX123456" {...field} />
                      </FormControl>
                      <FormDescription>
                        L'identifiant de votre profil Google Scholar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="researchgate_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ResearchGate</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean-Dupont" {...field} />
                      </FormControl>
                      <FormDescription>
                        Votre identifiant ou URL ResearchGate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://linkedin.com/in/jean-dupont"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>L'URL de votre profil LinkedIn</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg" className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
