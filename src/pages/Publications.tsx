import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockPublications = [
  {
    id: 1,
    title: "Deep Learning Applications in African Agriculture",
    authors: "Dr. Marie Kongo, Prof. Jean-Paul Mbala",
    year: 2023,
    journal: "AI & Society",
    citations: 45,
    type: "Article",
  },
  {
    id: 2,
    title: "Biotechnology Advances in Tropical Medicine",
    authors: "Prof. Jean-Paul Mbala, Dr. Grace Mutombo",
    year: 2023,
    journal: "Tropical Medicine Research",
    citations: 38,
    type: "Article",
  },
  {
    id: 3,
    title: "Renewable Energy Solutions for Rural Communities",
    authors: "Dr. Sarah Mwamba",
    year: 2023,
    journal: "Energy for Sustainable Development",
    citations: 52,
    type: "Article",
  },
  {
    id: 4,
    title: "Mathematical Modeling of Epidemic Spread",
    authors: "Prof. David Kalala, Dr. Grace Mutombo",
    year: 2022,
    journal: "Applied Mathematics",
    citations: 67,
    type: "Article",
  },
  {
    id: 5,
    title: "Quantum Computing Fundamentals",
    authors: "Prof. Albert Nzeza",
    year: 2022,
    journal: "Quantum Information Processing",
    citations: 89,
    type: "Book Chapter",
  },
];

const Publications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const years = ["all", ...new Set(mockPublications.map(p => p.year.toString()))];
  const types = ["all", ...new Set(mockPublications.map(p => p.type))];

  const filteredPublications = mockPublications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pub.authors.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === "all" || pub.year.toString() === selectedYear;
    const matchesType = selectedType === "all" || pub.type === selectedType;
    
    return matchesSearch && matchesYear && matchesType;
  });

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Publications Scientifiques</h1>
            <p className="text-lg text-muted-foreground">
              Explorez les travaux de recherche publiés par nos chercheurs
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par titre ou auteur..."
              className="max-w-2xl"
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les années</SelectItem>
                  {years.filter(y => y !== "all").map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {types.filter(t => t !== "all").map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filteredPublications.length} publication{filteredPublications.length > 1 ? 's' : ''} trouvée{filteredPublications.length > 1 ? 's' : ''}
            </p>

            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Auteurs</TableHead>
                    <TableHead>Année</TableHead>
                    <TableHead>Journal</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Citations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPublications.map((pub, index) => (
                    <motion.tr
                      key={pub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-secondary/20"
                    >
                      <TableCell className="font-medium max-w-md">
                        {pub.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {pub.authors}
                      </TableCell>
                      <TableCell>{pub.year}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {pub.journal}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {pub.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {pub.citations}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPublications.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune publication ne correspond à vos critères</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Publications;
