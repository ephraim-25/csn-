import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Chercheur } from '@/hooks/useChercheursAPI';
import { Loader2 } from 'lucide-react';

const chercheurSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  specialite: z.string().optional(),
  grade: z.string().optional(),
  biographie: z.string().optional(),
  orcid: z.string().optional(),
  google_scholar_id: z.string().optional(),
  linkedin_url: z.string().url('URL invalide').optional().or(z.literal('')),
  centre_id: z.string().optional(),
  province_id: z.string().optional(),
});

type ChercheurFormValues = z.infer<typeof chercheurSchema>;

interface ChercheurFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chercheur?: Chercheur | null;
  onSubmit: (data: Partial<Chercheur>) => Promise<void>;
  loading?: boolean;
}

export function ChercheurForm({
  open,
  onOpenChange,
  chercheur,
  onSubmit,
  loading,
}: ChercheurFormProps) {
  const [provinces, setProvinces] = useState<Array<{ id: string; nom: string }>>([]);
  const [centres, setCentres] = useState<Array<{ id: string; nom: string }>>([]);

  const form = useForm<ChercheurFormValues>({
    resolver: zodResolver(chercheurSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      specialite: '',
      grade: '',
      biographie: '',
      orcid: '',
      google_scholar_id: '',
      linkedin_url: '',
      centre_id: '',
      province_id: '',
    },
  });

  useEffect(() => {
    const fetchOptions = async () => {
      const [provincesRes, centresRes] = await Promise.all([
        supabase.from('provinces').select('id, nom').order('nom'),
        supabase.from('centres_recherche').select('id, nom').eq('est_actif', true).order('nom'),
      ]);

      if (provincesRes.data) setProvinces(provincesRes.data);
      if (centresRes.data) setCentres(centresRes.data);
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (chercheur) {
      form.reset({
        nom: chercheur.nom || '',
        prenom: chercheur.prenom || '',
        email: chercheur.email || '',
        telephone: chercheur.telephone || '',
        specialite: chercheur.specialite || '',
        grade: chercheur.grade || '',
        biographie: chercheur.biographie || '',
        orcid: chercheur.orcid || '',
        google_scholar_id: chercheur.google_scholar_id || '',
        linkedin_url: chercheur.linkedin_url || '',
        centre_id: chercheur.centre_id || '',
        province_id: chercheur.province_id || '',
      });
    } else {
      form.reset();
    }
  }, [chercheur, form]);

  const handleSubmit = async (values: ChercheurFormValues) => {
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== '' && v !== undefined)
    );
    await onSubmit(cleanedValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {chercheur ? 'Modifier le chercheur' : 'Nouveau chercheur'}
          </DialogTitle>
          <DialogDescription>
            {chercheur
              ? 'Modifiez les informations du chercheur'
              : 'Remplissez les informations pour créer un nouveau chercheur'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jean.dupont@univ.cd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade académique</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="professeur_ordinaire">Professeur Ordinaire</SelectItem>
                        <SelectItem value="professeur_associe">Professeur Associé</SelectItem>
                        <SelectItem value="chef_de_travaux">Chef de Travaux</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                        <SelectItem value="chercheur_senior">Chercheur Senior</SelectItem>
                        <SelectItem value="chercheur_junior">Chercheur Junior</SelectItem>
                        <SelectItem value="doctorant">Doctorant</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spécialité</FormLabel>
                  <FormControl>
                    <Input placeholder="Intelligence Artificielle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="province_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.id} value={province.id}>
                            {province.nom}
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
                name="centre_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centre de recherche</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un centre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {centres.map((centre) => (
                          <SelectItem key={centre.id} value={centre.id}>
                            {centre.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="biographie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biographie</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brève description du parcours académique..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="orcid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ORCID</FormLabel>
                    <FormControl>
                      <Input placeholder="0000-0000-0000-0000" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Identifiant ORCID
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
                      <Input placeholder="XXX-XXXX" {...field} />
                    </FormControl>
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
                      <Input placeholder="https://linkedin.com/in/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {chercheur ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
