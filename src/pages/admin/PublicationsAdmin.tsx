import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { DataTable, Column } from '@/components/admin/DataTable';
import { FilterPanel, FilterConfig } from '@/components/admin/FilterPanel';
import { PublicationForm } from '@/components/admin/PublicationForm';
import { ExportButton } from '@/components/admin/ExportButton';
import { usePublicationsAPI, Publication, PublicationsFilters } from '@/hooks/usePublicationsAPI';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { BookOpen, Plus, MoreHorizontal, Edit, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_LABELS: Record<string, string> = {
  article: 'Article',
  livre: 'Livre',
  chapitre: 'Chapitre',
  conference: 'Conférence',
  poster: 'Poster',
  these: 'Thèse',
  memoire: 'Mémoire',
  rapport: 'Rapport',
  brevet: 'Brevet',
};

const QUARTILE_COLORS: Record<string, string> = {
  Q1: 'bg-green-500/10 text-green-600 border-green-500/20',
  Q2: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Q3: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  Q4: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  non_classe: 'bg-muted text-muted-foreground',
};

export default function PublicationsAdmin() {
  const { loading, fetchPublications, createPublication, updatePublication, deletePublication } = usePublicationsAPI();
  
  const [publications, setPublications] = useState<Publication[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState<PublicationsFilters>({});
  const [sortKey, setSortKey] = useState<string>('annee');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publicationToDelete, setPublicationToDelete] = useState<Publication | null>(null);

  const loadData = useCallback(async () => {
    const result = await fetchPublications({
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
      sort_by: sortKey,
      sort_order: sortOrder,
    });
    
    if (result) {
      setPublications(result.data);
      setPagination(result.pagination);
    }
  }, [fetchPublications, filters, pagination.page, pagination.limit, sortKey, sortOrder]);

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
    setSelectedPublication(null);
    setFormOpen(true);
  };

  const handleEdit = (publication: Publication) => {
    setSelectedPublication(publication);
    setFormOpen(true);
  };

  const handleDelete = (publication: Publication) => {
    setPublicationToDelete(publication);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (publicationToDelete) {
      const success = await deletePublication(publicationToDelete.id);
      if (success) {
        loadData();
      }
    }
    setDeleteDialogOpen(false);
    setPublicationToDelete(null);
  };

  const handleFormSubmit = async (data: Partial<Publication> & { auteurs?: string[] }) => {
    if (selectedPublication) {
      const result = await updatePublication(selectedPublication.id, data);
      if (result) {
        setFormOpen(false);
        loadData();
      }
    } else {
      const result = await createPublication(data);
      if (result) {
        setFormOpen(false);
        loadData();
      }
    }
  };

  // Generate year options for the last 30 years
  const yearOptions = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: String(year), label: String(year) };
  });

  const filterConfigs: FilterConfig[] = [
    { key: 'type', label: 'Type', type: 'select', options: 'types_publication' },
    { key: 'annee', label: 'Année', type: 'select', options: yearOptions },
    { key: 'quartile', label: 'Quartile', type: 'select', options: 'quartiles' },
  ];

  const columns: Column<Publication>[] = [
    {
      key: 'titre',
      header: 'Titre',
      sortable: true,
      className: 'max-w-[400px]',
      render: (item) => (
        <div>
          <p className="font-medium line-clamp-2">{item.titre}</p>
          {item.journal && (
            <p className="text-sm text-muted-foreground mt-1">{item.journal}</p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (item) => (
        <Badge variant="outline">
          {TYPE_LABELS[item.type] || item.type}
        </Badge>
      ),
    },
    {
      key: 'annee',
      header: 'Année',
      sortable: true,
      className: 'text-center',
    },
    {
      key: 'quartile',
      header: 'Quartile',
      render: (item) => item.quartile ? (
        <Badge className={QUARTILE_COLORS[item.quartile] || ''}>
          {item.quartile}
        </Badge>
      ) : '-',
    },
    {
      key: 'nombre_citations',
      header: 'Citations',
      sortable: true,
      className: 'text-center',
      render: (item) => (
        <span className="font-semibold">{item.nombre_citations || 0}</span>
      ),
    },
    {
      key: 'doi',
      header: 'DOI',
      render: (item) => item.doi ? (
        <a
          href={`https://doi.org/${item.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center gap-1"
        >
          {item.doi.substring(0, 15)}...
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : '-',
    },
  ];

  const actions = (item: Publication) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {item.url && (
          <DropdownMenuItem asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir en ligne
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleEdit(item)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => handleDelete(item)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
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
                    <BookOpen className="h-8 w-8 text-primary" />
                    Gestion des Publications
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Gérez les publications scientifiques de la plateforme
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ExportButton type="publications" filters={filters} />
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle publication
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
              data={publications}
              columns={columns}
              pagination={pagination}
              loading={loading}
              searchPlaceholder="Rechercher par titre, journal, DOI..."
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
        <PublicationForm
          open={formOpen}
          onOpenChange={setFormOpen}
          publication={selectedPublication}
          onSubmit={handleFormSubmit}
          loading={loading}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la publication{' '}
                <strong className="line-clamp-1">{publicationToDelete?.titre}</strong> ?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}
