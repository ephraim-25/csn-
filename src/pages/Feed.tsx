import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, MessageCircle, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Publication {
  id: string;
  titre: string;
  resume: string | null;
  annee: number;
  type: string;
  journal: string | null;
  doi: string | null;
  created_at: string;
  auteurs?: { chercheur_id: string; chercheurs: { nom: string; prenom: string } }[];
  commentaires?: Comment[];
}

interface Comment {
  id: string;
  contenu: string;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null; email: string };
}

export default function Feed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const { data, error } = await supabase
        .from("publications")
        .select(`
          *,
          auteurs:auteurs_publications(
            chercheur_id,
            chercheurs(nom, prenom)
          ),
          commentaires:commentaires_publications(
            id,
            contenu,
            created_at,
            user_id,
            profiles(full_name, email)
          )
        `)
        .eq("est_publie", true)
        .order("date_publication", { ascending: false })
        .limit(20);

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les publications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (publicationId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour commenter",
        variant: "destructive",
      });
      return;
    }

    const comment = commentTexts[publicationId]?.trim();
    if (!comment) return;

    setSubmitting({ ...submitting, [publicationId]: true });

    try {
      const { error } = await supabase
        .from("commentaires_publications")
        .insert({
          publication_id: publicationId,
          user_id: user.id,
          contenu: comment,
        });

      if (error) throw error;

      toast({
        title: "Commentaire ajouté",
        description: "Votre commentaire a été publié avec succès",
      });

      setCommentTexts({ ...commentTexts, [publicationId]: "" });
      fetchPublications();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive",
      });
    } finally {
      setSubmitting({ ...submitting, [publicationId]: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Fil d'Actualité</h1>
            <p className="text-muted-foreground">
              Découvrez les dernières publications scientifiques et échangez avec la communauté
            </p>
          </div>

          <div className="space-y-6">
            {publications.map((pub, index) => (
              <motion.div
                key={pub.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50 hover:border-primary/50 transition-all shadow-elegant">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-xl leading-tight">{pub.titre}</CardTitle>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {pub.annee}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {pub.type}
                          </span>
                          {pub.journal && <span>{pub.journal}</span>}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {pub.resume && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{pub.resume}</p>
                    )}

                    {pub.auteurs && pub.auteurs.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {pub.auteurs.map((a: any) => `${a.chercheurs.prenom} ${a.chercheurs.nom}`).join(", ")}
                        </span>
                      </div>
                    )}

                    {pub.doi && (
                      <a
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-block"
                      >
                        DOI: {pub.doi}
                      </a>
                    )}

                    <div className="pt-4 border-t border-border/50 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span>{pub.commentaires?.length || 0} commentaires</span>
                      </div>

                      {pub.commentaires && pub.commentaires.length > 0 && (
                        <div className="space-y-3">
                          {pub.commentaires.map((comment: Comment) => (
                            <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {comment.profiles.full_name?.[0] || comment.profiles.email[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-sm font-medium">
                                    {comment.profiles.full_name || comment.profiles.email}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(comment.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.contenu}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {user && (
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {user.email?.[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Textarea
                              placeholder="Ajoutez un commentaire..."
                              value={commentTexts[pub.id] || ""}
                              onChange={(e) =>
                                setCommentTexts({ ...commentTexts, [pub.id]: e.target.value })
                              }
                              className="min-h-[80px] resize-none"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSubmitComment(pub.id)}
                              disabled={!commentTexts[pub.id]?.trim() || submitting[pub.id]}
                            >
                              {submitting[pub.id] ? "Envoi..." : "Commenter"}
                            </Button>
                          </div>
                        </div>
                      )}

                      {!user && (
                        <p className="text-sm text-muted-foreground">
                          Connectez-vous pour laisser un commentaire
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}