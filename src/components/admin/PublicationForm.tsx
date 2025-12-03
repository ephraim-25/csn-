import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
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
import { Publication } from '@/hooks/usePublicationsAPI';
import { Loader2 } from 'lucide-react';

const publicationSchema = z.object({
  titre: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  resume: z.string().optional(),
  annee: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  mois: z.coerce.number().min(1).max(12).optional(),
  type: z.string().min(1, 'Sélectionnez un type'),
  journal: z.string().optional(),
  conference: z.string().optional(),
  volume: z.string().optional(),
  numero: z.string().optional(),
  pages: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url('URL invalide').optional().or(z.literal('')),
  nombre_citations: z.coerce.number().min(0).optional(),
  quartile: z.string().optional(),
  impact_factor: z.coerce.number().min(0).optional(),
  mots_cles: z.string().optional(),
  est_peer_reviewed: z.boolean().optional(),
  langue: z.string().optional(),
  editeur: z.string().optional(),
  isbn: z.string().optional(),
  issn: z.string().optional(),
  auteurs: z.array(z.string()).optional(),
});

type PublicationFormValues = z.infer<typeof publicationSchema>;

interface PublicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publication?: Publication | null;
  onSubmit: (data: Partial<Publication> & { auteurs?: string[] }) => Promise<void>;
  loading?: boolean;
}

export function PublicationForm({
  open,
  onOpenChange,
  publication,
  onSubmit,
  loading,
}: PublicationFormProps) {
  const [chercheurs, setChercheurs] = useState<Array<{ id: string; nom: string; prenom: string }>>([]);
  const [selectedAuteurs, setSelectedAuteurs] = useState<string[]>([]);

  const form = useForm<PublicationFormValues>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      titre: '',
      resume: '',
      annee: new Date().getFullYear(),
      type: '',
      journal: '',
      conference: '',
      volume: '',
      numero: '',
      pages: '',
      doi: '',
      url: '',
      nombre_citations: 0,
      quartile: '',
      mots_cles: '',
      est_peer_reviewed: true,
      langue: 'fr',
      editeur: '',
    },
  });

  useEffect(() => {
    const fetchChercheurs = async () => {
      const { data } = await supabase
        .from('chercheurs')
        .select('id, nom, prenom')
        .eq('est_actif', true)
        .order('nom');

      if (data) setChercheurs(data);
    };

    fetchChercheurs();
  }, []);

  useEffect(() => {
    if (publication) {
      form.reset({
        titre: publication.titre || '',
        resume: publication.resume || '',
        annee: publication.annee,
        mois: publication.mois,
        type: publication.type || '',
        journal: publication.journal || '',
        conference: publication.conference || '',
        volume: publication.volume || '',
        numero: publication.numero || '',
        pages: publication.pages || '',
        doi: publication.doi || '',
        url: publication.url || '',
        nombre_citations: publication.nombre_citations || 0,
        quartile: publication.quartile || '',
        mots_cles: publication.mots_cles?.join(', ') || '',
        est_peer_reviewed: publication.est_peer_reviewed ?? true,
        langue: publication.langue || 'fr',
        editeur: publication.editeur || '',
        isbn: publication.isbn || '',
        issn: publication.issn || '',
      });
      
      // Set selected authors
      if (publication.auteurs) {
        setSelectedAuteurs(publication.auteurs.map(a => a.chercheur_id));
      }
    } else {
      form.reset();
      setSelectedAuteurs([]);
    }
  }, [publication, form]);

  const handleSubmit = async (values: PublicationFormValues) => {
    const cleanedValues: any = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== '' && v !== undefined)
    );

    // Convert mots_cles string to array
    if (cleanedValues.mots_cles) {
      cleanedValues.mots_cles = cleanedValues.mots_cles.split(',').map((s: string) => s.trim());
    }

    // Add selected authors
    cleanedValues.auteurs = selectedAuteurs;

    await onSubmit(cleanedValues);
  };

  const toggleAuteur = (id: string) => {
    setSelectedAuteurs(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {publication ? 'Modifier la publication' : 'Nouvelle publication'}
          </DialogTitle>
          <DialogDescription>
            {publication
              ? 'Modifiez les informations de la publication'
              : 'Remplissez les informations pour créer une nouvelle publication'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Titre de la publication..."
                      className="min-h-[60px]"
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="livre">Livre</SelectItem>
                        <SelectItem value="chapitre">Chapitre de livre</SelectItem>
                        <SelectItem value="conference">Conférence</SelectItem>
                        <SelectItem value="poster">Poster</SelectItem>
                        <SelectItem value="these">Thèse</SelectItem>
                        <SelectItem value="memoire">Mémoire</SelectItem>
                        <SelectItem value="rapport">Rapport</SelectItem>
                        <SelectItem value="brevet">Brevet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année *</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mois"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mois</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Mois" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {new Date(2000, i).toLocaleString('fr', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="journal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Journal / Revue</FormLabel>
                    <FormControl>
                      <Input placeholder="Nature, Science, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conférence</FormLabel>
                    <FormControl>
                      <Input placeholder="ICML, NeurIPS, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pages</FormLabel>
                    <FormControl>
                      <Input placeholder="1-25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nombre_citations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Citations</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="doi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DOI</FormLabel>
                    <FormControl>
                      <Input placeholder="10.1000/xyz123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quartile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quartile</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Quartile" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Q1">Q1</SelectItem>
                        <SelectItem value="Q2">Q2</SelectItem>
                        <SelectItem value="Q3">Q3</SelectItem>
                        <SelectItem value="Q4">Q4</SelectItem>
                        <SelectItem value="non_classe">Non classé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="langue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Langue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">Anglais</SelectItem>
                        <SelectItem value="es">Espagnol</SelectItem>
                        <SelectItem value="de">Allemand</SelectItem>
                        <SelectItem value="pt">Portugais</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="est_peer_reviewed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-end space-x-3 space-y-0 pt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Peer-reviewed
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="resume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résumé</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Résumé de la publication..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mots_cles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mots-clés</FormLabel>
                  <FormControl>
                    <Input placeholder="IA, Machine Learning, Deep Learning (séparés par des virgules)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Authors selection */}
            <div className="space-y-2">
              <FormLabel>Auteurs</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                {chercheurs.map((chercheur) => (
                  <div key={chercheur.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={chercheur.id}
                      checked={selectedAuteurs.includes(chercheur.id)}
                      onCheckedChange={() => toggleAuteur(chercheur.id)}
                    />
                    <label
                      htmlFor={chercheur.id}
                      className="text-sm cursor-pointer"
                    >
                      {chercheur.prenom} {chercheur.nom}
                    </label>
                  </div>
                ))}
              </div>
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
                {publication ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
