import { motion } from "framer-motion";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import { Users, BookOpen, Building2, TrendingUp, Activity, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const stats = [
    { title: "Chercheurs actifs", value: "248", icon: Users, trend: "+12%", description: "vs mois dernier" },
    { title: "Publications totales", value: "1,847", icon: BookOpen, trend: "+8%", description: "cette année" },
    { title: "Centres de recherche", value: "24", icon: Building2, trend: "+2", description: "nouveaux" },
    { title: "h-index moyen", value: "38.5", icon: Award, trend: "+3.2", description: "amélioration" },
  ];

  const monthlyData = [
    { month: "Jan", publications: 45, researchers: 220 },
    { month: "Fév", publications: 52, researchers: 225 },
    { month: "Mar", publications: 48, researchers: 232 },
    { month: "Avr", publications: 61, researchers: 238 },
    { month: "Mai", publications: 58, researchers: 242 },
    { month: "Jun", publications: 67, researchers: 248 },
  ];

  const topResearchers = [
    { name: "Prof. Albert Nzeza", publications: 103, hIndex: 48, citations: 3245 },
    { name: "Prof. David Kalala", publications: 92, hIndex: 45, citations: 2890 },
    { name: "Dr. Marie Kongo", publications: 87, hIndex: 42, citations: 2453 },
    { name: "Dr. Grace Mutombo", publications: 78, hIndex: 40, citations: 2156 },
    { name: "Prof. Jean-Paul Mbala", publications: 65, hIndex: 38, citations: 1987 },
  ];

  const recentActivity = [
    { action: "Nouvelle publication ajoutée", user: "Dr. Marie Kongo", time: "Il y a 5 min", type: "success" },
    { action: "Profil mis à jour", user: "Prof. Albert Nzeza", time: "Il y a 1h", type: "info" },
    { action: "Nouveau chercheur inscrit", user: "Dr. Sarah Mwamba", time: "Il y a 3h", type: "success" },
    { action: "Publication modifiée", user: "Prof. David Kalala", time: "Il y a 5h", type: "warning" },
  ];

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
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Tableau de bord</h1>
              <p className="text-lg text-muted-foreground">
                Vue d'ensemble de la plateforme CSN
              </p>
            </div>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Activity className="mr-2 h-4 w-4" />
              Système opérationnel
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Publications mensuelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Bar dataKey="publications" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Évolution des chercheurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
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
                      dataKey="researchers" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Researchers & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Top chercheurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead className="text-right">Publi.</TableHead>
                      <TableHead className="text-right">h-index</TableHead>
                      <TableHead className="text-right">Citations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topResearchers.map((researcher, index) => (
                      <TableRow key={index} className="border-b border-border/50">
                        <TableCell className="font-medium">{researcher.name}</TableCell>
                        <TableCell className="text-right">{researcher.publications}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {researcher.hIndex}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {researcher.citations}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-secondary/20 border border-border/50"
                    >
                      <div className={`h-2 w-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
