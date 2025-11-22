import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Search, Edit, Trash2, Mail, Phone } from "lucide-react";

interface Researcher {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  specialite: string | null;
  grade: string | null;
  h_index: number;
  nombre_publications: number;
  est_actif: boolean;
}

const ManageResearchers = () => {
  const { toast } = useToast();
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResearcher, setEditingResearcher] = useState<Researcher | null>(null);

  useEffect(() => {
    fetchResearchers();
  }, []);

  const fetchResearchers = async () => {
    try {
      const { data, error } = await supabase
        .from("chercheurs")
        .select("*")
        .order("nom", { ascending: true });

      if (error) throw error;
      setResearchers(data || []);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les chercheurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver ce chercheur ?")) return;

    try {
      const { error } = await supabase
        .from("chercheurs")
        .update({ est_actif: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Chercheur désactivé avec succès",
      });

      fetchResearchers();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de désactiver le chercheur",
        variant: "destructive",
      });
    }
  };

  const filteredResearchers = researchers.filter(
    (r) =>
      r.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.specialite?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen">
          <Header />
          <div className="container py-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Gestion des Chercheurs</h1>
                <p className="text-muted-foreground">
                  Gérez les profils des chercheurs du système
                </p>
              </div>
            </div>

            <Card className="border-border/50 shadow-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Liste des Chercheurs</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Spécialité</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-center">H-Index</TableHead>
                      <TableHead className="text-center">Publications</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResearchers.map((researcher) => (
                      <TableRow key={researcher.id}>
                        <TableCell className="font-medium">
                          {researcher.prenom} {researcher.nom}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {researcher.email}
                          </div>
                        </TableCell>
                        <TableCell>{researcher.specialite || "—"}</TableCell>
                        <TableCell>{researcher.grade || "—"}</TableCell>
                        <TableCell className="text-center">{researcher.h_index}</TableCell>
                        <TableCell className="text-center">{researcher.nombre_publications}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              researcher.est_actif
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {researcher.est_actif ? "Actif" : "Inactif"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(researcher.id)}
                              disabled={!researcher.est_actif}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredResearchers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Aucun chercheur trouvé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default ManageResearchers;