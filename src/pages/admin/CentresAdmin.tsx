import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ExportButton } from '@/components/admin/ExportButton';
import { useCentresAPI, Centre, CentresFilters } from '@/hooks/useCentresAPI';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Building2, Plus, MoreHorizontal, Edit, Trash2, Globe, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function CentresAdmin() {
  const { loading, fetchCentres, createCentre, updateCentre, deleteCentre } = useCentresAPI();
  
  const [centres, setCentres] = useState<Centre[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<CentresFilters>({ est_actif: true });
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [centreToDelete, setCentreToDelete] = useState<Centre | null>(null);
  const [provinces, setProvinces] = useState<Array<{ id: string; nom: string }>>([]);
  
  const [formData, setFormData] = useState({
    nom: '',
    acronyme: '',
    description: '',
    adresse: '',
    email: '',
    telephone: '',
    site_web: '',
    province_id: '',
  });

  const loadData = useCallback(async () => {
    const result = await fetchCentres({
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
    
    if (result) {
      setCentres(result.data);
      setPagination(result.pagination);
    }
  }, [fetchCentres, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    loadData();
    
    // Load provinces
    const loadProvinces = async () => {
      const { data } = await supabase.from('provinces').select('id, nom').order('nom');
      if (data) setProvinces(data);
    };
    loadProvinces();
  }, [loadData]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleCreate = () => {
    setSelectedCentre(null);
    setFormData({
      nom: '',
      acronyme: '',
      description: '',
      adresse: '',
      email: '',
      telephone: '',
      site_web: '',
      province_id: '',
    });
    setFormOpen(true);
  };

  const handleEdit = (centre: Centre) => {
    setSelectedCentre(centre);
    setFormData({
      nom: centre.nom || '',
      acronyme: centre.acronyme || '',
      description: centre.description || '',
      adresse: centre.adresse || '',
      email: centre.email || '',
      telephone: centre.telephone || '',
      site_web: centre.site_web || '',
      province_id: centre.province_id || '',
    });
    setFormOpen(true);
  };

  const handleDelete = (centre: Centre) => {
    setCentreToDelete(centre);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (centreToDelete) {
      const success = await deleteCentre(centreToDelete.id);
      if (success) {
        loadData();
      }
    }
    setDeleteDialogOpen(false);
    setCentreToDelete(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== '')
    );

    if (selectedCentre) {
      const result = await updateCentre(selectedCentre.id, cleanedData);
      if (result) {
        setFormOpen(false);
        loadData();
      }
    } else {
      const result = await createCentre(cleanedData);
      if (result) {
        setFormOpen(false);
        loadData();
      }
    }
  };

  const columns: Column<Centre>[] = [
    {
      key: 'nom',
      header: 'Centre',
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.logo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {item.acronyme || item.nom.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.nom}</p>
            {item.acronyme && (
              <p className="text-sm text-muted-foreground">{item.acronyme}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'province.nom',
      header: 'Province',
      render: (item) => item.province?.nom || '-',
    },
    {
      key: 'nombre_chercheurs',
      header: 'Chercheurs',
      className: 'text-center',
      render: (item) => item.nombre_chercheurs || 0,
    },
    {
      key: 'email',
      header: 'Contact',
      render: (item) => (
        <div className="text-sm">
          {item.email && <p>{item.email}</p>}
          {item.telephone && <p className="text-muted-foreground">{item.telephone}</p>}
        </div>
      ),
    },
    {
      key: 'site_web',
      header: 'Site Web',
      render: (item) => item.site_web ? (
        <a
          href={item.site_web}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1"
        >
          <Globe className="h-3 w-3" />
          Visiter
        </a>
      ) : '-',
    },
    {
      key: 'est_actif',
      header: 'Statut',
      render: (item) => (
        <Badge variant={item.est_actif ? 'default' : 'secondary'}>
          {item.est_actif ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
  ];

  const actions = (item: Centre) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEdit(item)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => handleDelete(item)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Désactiver
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/admin">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Building2 className="h-8 w-8 text-primary" />
                    Gestion des Centres
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Gérez les centres de recherche de la plateforme
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ExportButton type="centres" filters={filters} />
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau centre
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              data={centres}
              columns={columns}
              pagination={pagination}
              loading={loading}
              searchPlaceholder="Rechercher par nom, acronyme..."
              onSearch={handleSearch}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              actions={actions}
            />
          </motion.div>
        </main>

        {/* Form Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCentre ? 'Modifier le centre' : 'Nouveau centre'}
              </DialogTitle>
              <DialogDescription>
                {selectedCentre
                  ? 'Modifiez les informations du centre de recherche'
                  : 'Remplissez les informations pour créer un nouveau centre'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acronyme">Acronyme</Label>
                  <Input
                    id="acronyme"
                    value={formData.acronyme}
                    onChange={(e) => setFormData(prev => ({ ...prev, acronyme: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province_id">Province</Label>
                  <Select
                    value={formData.province_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, province_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input
                    id="adresse"
                    value={formData.adresse}
                    onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_web">Site Web</Label>
                <Input
                  id="site_web"
                  type="url"
                  value={formData.site_web}
                  onChange={(e) => setFormData(prev => ({ ...prev, site_web: e.target.value }))}
                  placeholder="https://"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedCentre ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la désactivation</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir désactiver le centre{' '}
                <strong>{centreToDelete?.nom}</strong> ?
                Cette action peut être annulée ultérieurement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Désactiver
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
