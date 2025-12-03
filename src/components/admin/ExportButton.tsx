import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useExportAPI, ExportType, ExportFormat } from '@/hooks/useExportAPI';

interface ExportButtonProps {
  type: ExportType;
  filters?: Record<string, any>;
}

export function ExportButton({ type, filters }: ExportButtonProps) {
  const { exportData, loading } = useExportAPI();

  const handleExport = async (format: ExportFormat) => {
    await exportData({ type, format, filters });
  };

  const typeLabels: Record<ExportType, string> = {
    chercheurs: 'Chercheurs',
    publications: 'Publications',
    centres: 'Centres',
    projets: 'Projets',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('json')} className="cursor-pointer">
          <FileJson className="mr-2 h-4 w-4" />
          Exporter en JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Exporter en CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exporter en Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
