import { useState, useEffect } from 'react';
import { useProvincesAPI, Province } from '@/hooks/useProvincesAPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProvincesAdmin() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    chef_lieu: '',
    description: '',
    population: '',
    superficie: '',
  });

  const { loading, fetchProvinces, createProvince, updateProvince, deleteProvince } = useProvincesAPI();
  const { toast } = useToast();

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    const data = await fetchProvinces();
    setProvinces(data);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      code: '',
      chef_lieu: '',
      description: '',
      population: '',
      superficie: '',
    });
    setEditingProvince(null);
  };

  const handleEdit = (province: Province) => {
    setEditingProvince(province);
    setFormData({
      nom: province.nom || '',
      code: province.code || '',
      chef_lieu: province.chef_lieu || '',
      description: province.description || '',
      population: province.population?.toString() || '',
      superficie: province.superficie?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      nom: formData.nom,
      code: formData.code || null,
      chef_lieu: formData.chef_lieu || null,
      description: formData.description || null,
      population: formData.population ? parseInt(formData.population) : null,
      superficie: formData.superficie ? parseFloat(formData.superficie) : null,
    };

    let success;
    if (editingProvince) {
      success = await updateProvince(editingProvince.id, payload);
    } else {
      success = await createProvince(payload);
    }

    if (success) {
      setIsDialogOpen(false);
      resetForm();
      loadProvinces();
    }
  };

  const handleDelete = async (province: Province) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la province "${province.nom}" ?`)) {
      const success = await deleteProvince(province.id);
      if (success) {
        loadProvinces();
      }
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Provinces</h1>
          <p className="text-muted-foreground">Gérez les 26 provinces de la RDC</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Province
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProvince ? 'Modifier la Province' : 'Nouvelle Province'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: KIN"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chef_lieu">Chef-lieu</Label>
                  <Input
                    id="chef_lieu"
                    value={formData.chef_lieu}
                    onChange={(e) => setFormData({ ...formData, chef_lieu: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="population">Population</Label>
                  <Input
                    id="population"
                    type="number"
                    value={formData.population}
                    onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="superficie">Superficie (km²)</Label>
                  <Input
                    id="superficie"
                    type="number"
                    step="0.01"
                    value={formData.superficie}
                    onChange={(e) => setFormData({ ...formData, superficie: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProvince ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Liste des Provinces ({provinces.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && provinces.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Chef-lieu</TableHead>
                  <TableHead>Population</TableHead>
                  <TableHead>Superficie</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {provinces.map((province) => (
                  <TableRow key={province.id}>
                    <TableCell className="font-medium">{province.nom}</TableCell>
                    <TableCell>{province.code || '-'}</TableCell>
                    <TableCell>{province.chef_lieu || '-'}</TableCell>
                    <TableCell>
                      {province.population?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell>
                      {province.superficie?.toLocaleString() || '-'} km²
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(province)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(province)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
