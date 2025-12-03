import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { DataTable, Column } from '@/components/admin/DataTable';
import { FilterPanel, FilterConfig } from '@/components/admin/FilterPanel';
import { ChercheurForm } from '@/components/admin/ChercheurForm';
import { ExportButton } from '@/components/admin/ExportButton';
import { useChercheursAPI, Chercheur, ChercheursFilters } from '@/hooks/useChercheursAPI';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Users, Plus, MoreHorizontal, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ChercheursAdmin() {
  const { loading, fetchChercheurs, createChercheur, updateChercheur, deleteChercheur } = useChercheursAPI();
  
  const [chercheurs, setChercheurs] = useState<Chercheur[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<ChercheursFilters>({ est_actif: true });
  const [sortKey, setSortKey] = useState<string>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedChercheur, setSelectedChercheur] = useState<Chercheur | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chercheurToDelete, setChercheurToDelete] = useState<Chercheur | null>(null);

  const loadData = useCallback(async () => {
    const result = await fetchChercheurs({
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      sort_by: sortKey,
      sort_order: sortOrder,
    });
    
    if (result) {
      setChercheurs(result.data);
      setPagination(result.pagination);
    }
  }, [fetchChercheurs, filters, pagination.page, pagination.limit, sortKey, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortKey(key);
    setSortOrder(order);
  };

  const handleCreate = () => {
    setSelectedChercheur(null);
    setFormOpen(true);
  };

  const handleEdit = (chercheur: Chercheur) => {
    setSelectedChercheur(chercheur);
    setFormOpen(true);
  };

  const handleDelete = (chercheur: Chercheur) => {
    setChercheurToDelete(chercheur);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (chercheurToDelete) {
      const success = await deleteChercheur(chercheurToDelete.id);
      if (success) {
        loadData();
      }
    }
    setDeleteDialogOpen(false);
    setChercheurToDelete(null);
  };

  const handleFormSubmit = async (data: Partial<Chercheur>) => {
    if (selectedChercheur) {
      const result = await updateChercheur(selectedChercheur.id, data);
      if (result) {
        setFormOpen(false);
        loadData();
      }
    } else {
      const result = await createChercheur(data);
      if (result) {
        setFormOpen(false);
        loadData();
      }
    }
  };

  const filterConfigs: FilterConfig[] = [
    { key: 'grade', label: 'Grade', type: 'select', options: 'grades' },
    { key: 'province_id', label: 'Province', type: 'select', options: 'provinces' },
    { key: 'centre_id', label: 'Centre', type: 'select', options: 'centres' },
    { key: 'specialite', label: 'Spécialité', type: 'text', placeholder: 'Ex: Intelligence Artificielle' },
  ];

  const columns: Column<Chercheur>[] = [
    {
      key: 'nom',
      header: 'Chercheur',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.photo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {item.prenom?.[0]}{item.nom?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.prenom} {item.nom}</p>
            <p className="text-sm text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      sortable: true,
      render: (item) => (
        <Badge variant="secondary" className="capitalize">
          {item.grade?.replace('_', ' ') || 'Non défini'}
        </Badge>
      ),
    },
    {
      key: 'specialite',
      header: 'Spécialité',
      render: (item) => item.specialite || '-',
    },
    {
      key: 'centre.nom',
      header: 'Centre',
      render: (item) => item.centre?.nom || '-',
    },
    {
      key: 'h_index',
      header: 'H-Index',
      sortable: true,
      className: 'text-center',
      render: (item) => (
        <span className="font-semibold text-primary">{item.h_index || 0}</span>
      ),
    },
    {
      key: 'nombre_publications',
      header: 'Publications',
      sortable: true,
      className: 'text-center',
      render: (item) => item.nombre_publications || 0,
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

  const actions = (item: Chercheur) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to={`/chercheurs/${item.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Voir le profil
          </Link>
        </DropdownMenuItem>
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
                    <Users className="h-8 w-8 text-primary" />
                    Gestion des Chercheurs
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Gérez les profils des chercheurs de la plateforme
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ExportButton type="chercheurs" filters={filters} />
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau chercheur
                </Button>
              </div>
            </div>

            {/* Filters */}
            <FilterPanel
              filters={filterConfigs}
              values={filters}
              onChange={handleFilterChange}
            />

            {/* Data Table */}
            <DataTable
              data={chercheurs}
              columns={columns}
              pagination={pagination}
              loading={loading}
              searchPlaceholder="Rechercher par nom, email, spécialité..."
              onSearch={handleSearch}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onSort={handleSort}
              sortKey={sortKey}
              sortOrder={sortOrder}
              actions={actions}
            />
          </motion.div>
        </main>

        {/* Form Dialog */}
        <ChercheurForm
          open={formOpen}
          onOpenChange={setFormOpen}
          chercheur={selectedChercheur}
          onSubmit={handleFormSubmit}
          loading={loading}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la désactivation</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir désactiver le chercheur{' '}
                <strong>{chercheurToDelete?.prenom} {chercheurToDelete?.nom}</strong> ?
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
