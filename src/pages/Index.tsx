import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ResearcherCard from "@/components/ResearcherCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, BookOpen, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const featuredResearchers = [
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
  ];

  const centers = [
    { name: "Centre de Recherche en IA", location: "Kinshasa", researchers: 45 },
    { name: "Institut de Biotechnologie", location: "Lubumbashi", researchers: 38 },
    { name: "Laboratoire d'Énergie", location: "Goma", researchers: 32 },
    { name: "Centre de Physique Quantique", location: "Kinshasa", researchers: 28 },
  ];

  const recentPublications = [
    {
      title: "Deep Learning Applications in African Agriculture",
      author: "Dr. Marie Kongo",
      year: 2023,
    },
    {
      title: "Biotechnology Advances in Tropical Medicine",
      author: "Prof. Jean-Paul Mbala",
      year: 2023,
    },
    {
      title: "Renewable Energy Solutions for Rural Communities",
      author: "Dr. Sarah Mwamba",
      year: 2023,
    },
  ];

  const stats = [
    { label: "Chercheurs actifs", value: "248", icon: Users },
    { label: "Publications", value: "1,847", icon: BookOpen },
    { label: "Centres", value: "24", icon: Building2 },
    { label: "Croissance", value: "+12%", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-primary py-24">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-4xl mx-auto text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                  Conseil Scientifique National
                </h1>
                <p className="text-xl md:text-2xl text-foreground/80">
                  Valorisation et gestion de la recherche scientifique congolaise
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>Powered by</span>
                  <span className="font-semibold text-primary">Dark Business Hi-Tech</span>
                </div>
              </div>

              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher des chercheurs, publications, centres..."
                className="max-w-2xl mx-auto"
              />

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    className="glass-effect rounded-2xl p-6 text-center"
                  >
                    <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Researchers */}
        <section className="container py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Nos Chercheurs</h2>
                <p className="text-muted-foreground">
                  Découvrez les experts qui façonnent l'avenir de la recherche
                </p>
              </div>
              <Link to="/chercheurs">
                <Button className="group">
                  Voir tous
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResearchers.map((researcher, index) => (
                <motion.div
                  key={researcher.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ResearcherCard {...researcher} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Research Centers */}
        <section className="bg-secondary/20 py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Centres de Recherche</h2>
                <p className="text-muted-foreground">
                  Nos institutions d'excellence réparties à travers le pays
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {centers.map((center, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold">{center.name}</h3>
                        <p className="text-sm text-muted-foreground">{center.location}</p>
                        <p className="text-2xl font-bold text-primary">{center.researchers}</p>
                        <p className="text-xs text-muted-foreground">chercheurs</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Recent Publications */}
        <section className="container py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">Publications Récentes</h2>
                <p className="text-muted-foreground">
                  Les dernières avancées de la recherche scientifique
                </p>
              </div>
              <Link to="/publications">
                <Button variant="outline" className="group">
                  Voir toutes
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPublications.map((pub, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-glow transition-all duration-300 h-full">
                    <CardHeader>
                      <CardTitle className="text-lg leading-tight">
                        {pub.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{pub.author}</p>
                      <p className="text-sm font-semibold text-primary">{pub.year}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-secondary/10 py-12">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">CSN</h3>
                <p className="text-sm text-muted-foreground">
                  Conseil Scientifique National de la RDC
                </p>
              </div>
              <div className="text-sm text-muted-foreground text-center md:text-right">
                <p>© 2024 CSN. Tous droits réservés.</p>
                <p className="mt-1">
                  Propulsé par <span className="font-semibold text-primary">Dark Business Hi-Tech</span>
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
