import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ChevronDown, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'number' | 'date';
  options?: FilterOption[] | 'grades' | 'provinces' | 'centres' | 'types_publication' | 'quartiles';
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onReset?: () => void;
}

const GRADES: FilterOption[] = [
  { value: 'professeur_ordinaire', label: 'Professeur Ordinaire' },
  { value: 'professeur_associe', label: 'Professeur Associé' },
  { value: 'chef_de_travaux', label: 'Chef de Travaux' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'chercheur_senior', label: 'Chercheur Senior' },
  { value: 'chercheur_junior', label: 'Chercheur Junior' },
  { value: 'doctorant', label: 'Doctorant' },
  { value: 'autre', label: 'Autre' },
];

const TYPES_PUBLICATION: FilterOption[] = [
  { value: 'article', label: 'Article' },
  { value: 'livre', label: 'Livre' },
  { value: 'chapitre', label: 'Chapitre de livre' },
  { value: 'conference', label: 'Conférence' },
  { value: 'poster', label: 'Poster' },
  { value: 'these', label: 'Thèse' },
  { value: 'memoire', label: 'Mémoire' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'brevet', label: 'Brevet' },
];

const QUARTILES: FilterOption[] = [
  { value: 'Q1', label: 'Q1' },
  { value: 'Q2', label: 'Q2' },
  { value: 'Q3', label: 'Q3' },
  { value: 'Q4', label: 'Q4' },
  { value: 'non_classe', label: 'Non classé' },
];

export function FilterPanel({ filters, values, onChange, onReset }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [provinces, setProvinces] = useState<FilterOption[]>([]);
  const [centres, setCentres] = useState<FilterOption[]>([]);

  useEffect(() => {
    // Fetch provinces and centres for dynamic filters
    const fetchOptions = async () => {
      const [provincesRes, centresRes] = await Promise.all([
        supabase.from('provinces').select('id, nom').order('nom'),
        supabase.from('centres_recherche').select('id, nom').eq('est_actif', true).order('nom'),
      ]);

      if (provincesRes.data) {
        setProvinces(provincesRes.data.map(p => ({ value: p.id, label: p.nom })));
      }
      if (centresRes.data) {
        setCentres(centresRes.data.map(c => ({ value: c.id, label: c.nom })));
      }
    };

    fetchOptions();
  }, []);

  const getOptions = (config: FilterConfig): FilterOption[] => {
    if (Array.isArray(config.options)) return config.options;
    switch (config.options) {
      case 'grades': return GRADES;
      case 'provinces': return provinces;
      case 'centres': return centres;
      case 'types_publication': return TYPES_PUBLICATION;
      case 'quartiles': return QUARTILES;
      default: return [];
    }
  };

  const handleChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value === 'all' ? undefined : value });
  };

  const handleReset = () => {
    const resetValues: Record<string, any> = {};
    filters.forEach(f => { resetValues[f.key] = undefined; });
    onChange(resetValues);
    onReset?.();
  };

  const activeFiltersCount = Object.values(values).filter(v => v !== undefined && v !== '').length;

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtres avancés</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filters.map((config) => (
                <div key={config.key} className="space-y-2">
                  <Label htmlFor={config.key} className="text-sm font-medium">
                    {config.label}
                  </Label>
                  
                  {config.type === 'select' && (
                    <Select
                      value={values[config.key] || 'all'}
                      onValueChange={(value) => handleChange(config.key, value)}
                    >
                      <SelectTrigger id={config.key}>
                        <SelectValue placeholder={config.placeholder || 'Tous'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {getOptions(config).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {config.type === 'text' && (
                    <Input
                      id={config.key}
                      value={values[config.key] || ''}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      placeholder={config.placeholder}
                    />
                  )}

                  {config.type === 'number' && (
                    <Input
                      id={config.key}
                      type="number"
                      value={values[config.key] || ''}
                      onChange={(e) => handleChange(config.key, e.target.value ? Number(e.target.value) : undefined)}
                      placeholder={config.placeholder}
                    />
                  )}

                  {config.type === 'date' && (
                    <Input
                      id={config.key}
                      type="date"
                      value={values[config.key] || ''}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
