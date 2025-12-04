import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, MapPin, Building2, GraduationCap, Loader2 } from 'lucide-react';
import { useChercheursAPI, Chercheur } from '@/hooks/useChercheursAPI';
import { useProvincesAPI, Province } from '@/hooks/useProvincesAPI';
import { useCentresAPI, Centre } from '@/hooks/useCentresAPI';

export default function PublicResearchers() {
  const [chercheurs, setChercheurs] = useState<Chercheur[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    province_id: '',
    centre_id: '',
    grade: '',
  });

  const { loading: loadingChercheurs, fetchChercheurs } = useChercheursAPI();
  const { fetchProvinces } = useProvincesAPI();
  const { fetchCentres } = useCentresAPI();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadChercheurs();
  }, [currentPage, filters]);

  const loadInitialData = async () => {
    const [provincesData, centresData] = await Promise.all([
      fetchProvinces(),
      fetchCentres(),
    ]);
    setProvinces(provincesData);
    if (centresData) setCentres(centresData.data);
  };

  const loadChercheurs = async () => {
    const result = await fetchChercheurs({
      search: filters.search || undefined,
      province_id: filters.province_id || undefined,
      centre_id: filters.centre_id || undefined,
      grade: filters.grade || undefined,
      page: currentPage,
      limit: 12,
    });
    if (result) {
      setChercheurs(result.data);
      setTotalCount(result.pagination.total);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadChercheurs();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      province_id: '',
      centre_id: '',
      grade: '',
    });
    setCurrentPage(1);
  };

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };

  const gradeLabels: Record<string, string> = {
    professeur_ordinaire: 'Professeur Ordinaire',
    professeur_associe: 'Professeur Associé',
    chef_de_travaux: 'Chef de Travaux',
    assistant: 'Assistant',
    chercheur_senior: 'Chercheur Senior',
    chercheur_junior: 'Chercheur Junior',
    doctorant: 'Doctorant',
    autre: 'Autre',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Annuaire des Chercheurs
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Découvrez les chercheurs du Conseil Scientifique National de la RDC.
              Recherchez par nom, spécialité, province ou centre de recherche.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par nom, spécialité..."
                        className="pl-10"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      />
                    </div>
                  </div>
                  <Select
                    value={filters.province_id}
                    onValueChange={(value) => setFilters({ ...filters, province_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les provinces</SelectItem>
                      {provinces.map((province) => (
                        <SelectItem key={province.id} value={province.id}>
                          {province.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.centre_id}
                    onValueChange={(value) => setFilters({ ...filters, centre_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Centre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les centres</SelectItem>
                      {centres.map((centre) => (
                        <SelectItem key={centre.id} value={centre.id}>
                          {centre.acronyme || centre.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={filters.grade}
                    onValueChange={(value) => setFilters({ ...filters, grade: value })}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Grade académique" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les grades</SelectItem>
                      {Object.entries(gradeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="gap-2">
                    <Search className="h-4 w-4" />
                    Rechercher
                  </Button>
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>{totalCount} chercheur{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {loadingChercheurs ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chercheurs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun chercheur trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chercheurs.map((chercheur) => (
              <Link key={chercheur.id} to={`/chercheur/${chercheur.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={chercheur.photo_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(chercheur.nom, chercheur.prenom)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {chercheur.prenom} {chercheur.nom}
                        </h3>
                        {chercheur.grade && (
                          <Badge variant="secondary" className="mt-1">
                            {gradeLabels[chercheur.grade] || chercheur.grade}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {chercheur.specialite && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{chercheur.specialite}</span>
                        </div>
                      )}
                      {chercheur.centre && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {chercheur.centre.acronyme || chercheur.centre.nom}
                          </span>
                        </div>
                      )}
                      {chercheur.province && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{chercheur.province.nom}</span>
                        </div>
                      )}
                    </div>

                    {(chercheur.h_index || chercheur.nombre_publications) && (
                      <div className="mt-4 pt-4 border-t flex gap-4">
                        {chercheur.h_index !== undefined && chercheur.h_index > 0 && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{chercheur.h_index}</div>
                            <div className="text-xs text-muted-foreground">h-index</div>
                          </div>
                        )}
                        {chercheur.nombre_publications !== undefined && chercheur.nombre_publications > 0 && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{chercheur.nombre_publications}</div>
                            <div className="text-xs text-muted-foreground">Publications</div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > 12 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {currentPage} sur {Math.ceil(totalCount / 12)}
            </span>
            <Button
              variant="outline"
              disabled={currentPage >= Math.ceil(totalCount / 12)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
