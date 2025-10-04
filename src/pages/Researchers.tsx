import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ResearcherCard from "@/components/ResearcherCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data
const mockResearchers = [
  {
    id: "1",
    name: "Dr. Marie Kongo",
    specialty: "Intelligence Artificielle",
    center: "Centre de Recherche en IA - Kinshasa",
    hIndex: 42,
    publications: 87,
    collaborations: 23,
  },
  {
    id: "2",
    name: "Prof. Jean-Paul Mbala",
    specialty: "Biotechnologie",
    center: "Institut de Biotechnologie - Lubumbashi",
    hIndex: 38,
    publications: 65,
    collaborations: 18,
  },
  {
    id: "3",
    name: "Dr. Sarah Mwamba",
    specialty: "Énergies Renouvelables",
    center: "Laboratoire d'Énergie - Goma",
    hIndex: 35,
    publications: 52,
    collaborations: 15,
  },
  {
    id: "4",
    name: "Prof. David Kalala",
    specialty: "Mathématiques Appliquées",
    center: "Faculté des Sciences - Kinshasa",
    hIndex: 45,
    publications: 92,
    collaborations: 28,
  },
  {
    id: "5",
    name: "Dr. Grace Mutombo",
    specialty: "Médecine Tropicale",
    center: "Institut de Recherche Médicale - Kisangani",
    hIndex: 40,
    publications: 78,
    collaborations: 21,
  },
  {
    id: "6",
    name: "Prof. Albert Nzeza",
    specialty: "Physique Quantique",
    center: "Laboratoire de Physique - Kinshasa",
    hIndex: 48,
    publications: 103,
    collaborations: 32,
  },
];

const Researchers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState("all");

  const specialties = ["all", ...new Set(mockResearchers.map(r => r.specialty))];
  const centers = ["all", ...new Set(mockResearchers.map(r => r.center))];

  const filteredResearchers = mockResearchers.filter(researcher => {
    const matchesSearch = researcher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         researcher.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || researcher.specialty === selectedSpecialty;
    const matchesCenter = selectedCenter === "all" || researcher.center === selectedCenter;
    
    return matchesSearch && matchesSpecialty && matchesCenter;
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
            <h1 className="text-4xl font-bold">Nos Chercheurs</h1>
            <p className="text-lg text-muted-foreground">
              Découvrez les experts qui font avancer la recherche scientifique congolaise
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher par nom ou spécialité..."
              className="max-w-2xl"
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les spécialités</SelectItem>
                  {specialties.filter(s => s !== "all").map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Centre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les centres</SelectItem>
                  {centers.filter(c => c !== "all").map(center => (
                    <SelectItem key={center} value={center}>
                      {center}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filteredResearchers.length} chercheur{filteredResearchers.length > 1 ? 's' : ''} trouvé{filteredResearchers.length > 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResearchers.map((researcher, index) => (
                <motion.div
                  key={researcher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ResearcherCard {...researcher} />
                </motion.div>
              ))}
            </div>

            {filteredResearchers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucun chercheur ne correspond à vos critères</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Researchers;
