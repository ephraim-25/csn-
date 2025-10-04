import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, Users, Mail, MapPin, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const ResearcherProfile = () => {
  const { id } = useParams();

  // Mock data
  const researcher = {
    name: "Dr. Marie Kongo",
    specialty: "Intelligence Artificielle",
    center: "Centre de Recherche en IA - Kinshasa",
    email: "marie.kongo@csn.cd",
    location: "Kinshasa, RDC",
    joinDate: "Janvier 2018",
    bio: "Experte en intelligence artificielle et apprentissage automatique avec plus de 15 ans d'expérience. Spécialisée dans les applications de l'IA pour le développement durable en Afrique.",
    hIndex: 42,
    publications: 87,
    collaborations: 23,
    citations: 2453,
  };

  const publicationsPerYear = [
    { year: "2019", count: 12 },
    { year: "2020", count: 15 },
    { year: "2021", count: 18 },
    { year: "2022", count: 22 },
    { year: "2023", count: 20 },
  ];

  const citationsPerYear = [
    { year: "2019", count: 245 },
    { year: "2020", count: 398 },
    { year: "2021", count: 512 },
    { year: "2022", count: 678 },
    { year: "2023", count: 620 },
  ];

  const recentPublications = [
    {
      id: 1,
      title: "Deep Learning Applications in African Agriculture",
      year: 2023,
      citations: 45,
      journal: "AI & Society",
    },
    {
      id: 2,
      title: "Machine Learning for Healthcare in Resource-Limited Settings",
      year: 2023,
      citations: 38,
      journal: "Journal of Medical AI",
    },
    {
      id: 3,
      title: "Natural Language Processing for Congolese Languages",
      year: 2022,
      citations: 62,
      journal: "Computational Linguistics",
    },
  ];

  const initials = researcher.name.split(' ').map(n => n[0]).join('').slice(0, 2);

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
          {/* Profile Header */}
          <Card className="border-border/50 bg-gradient-primary shadow-elegant">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage alt={researcher.name} />
                  <AvatarFallback className="bg-gradient-accent text-white text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{researcher.name}</h1>
                    <p className="text-xl text-muted-foreground mb-3">{researcher.specialty}</p>
                    <Badge variant="secondary" className="text-sm">
                      {researcher.center}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {researcher.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {researcher.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Membre depuis {researcher.joinDate}
                    </div>
                  </div>
                  
                  <p className="text-foreground/80 leading-relaxed">
                    {researcher.bio}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "h-index", value: researcher.hIndex, icon: Award },
              { label: "Publications", value: researcher.publications, icon: BookOpen },
              { label: "Collaborations", value: researcher.collaborations, icon: Users },
              { label: "Citations", value: researcher.citations, icon: Award },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Publications par an</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={publicationsPerYear}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Citations par an</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={citationsPerYear}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Publications */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Publications récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPublications.map((pub, index) => (
                  <motion.div
                    key={pub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/50 transition-colors"
                  >
                    <h4 className="font-semibold mb-2">{pub.title}</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{pub.journal}</span>
                      <span>•</span>
                      <span>{pub.year}</span>
                      <span>•</span>
                      <span>{pub.citations} citations</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ResearcherProfile;
