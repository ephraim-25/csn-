import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Award,
  TrendingUp,
  GraduationCap,
  Bell,
  FileText,
  Users,
  Calendar,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

interface ChercheurProfile {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  h_index: number;
  total_citations: number;
  i10_index: number;
  nombre_publications: number;
  grade: string | null;
  specialite: string | null;
}

interface Publication {
  id: string;
  titre: string;
  annee: number;
  type: string;
  nombre_citations: number;
}

interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  est_lu: boolean;
  created_at: string;
  url: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ChercheurProfile | null>(null);
  const [recentPublications, setRecentPublications] = useState<Publication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPubs: 0,
    thisYearPubs: 0,
    avgCitations: 0,
    collaborators: 0,
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("chercheurs")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        // Fetch recent publications
        const { data: pubsData } = await supabase
          .from("auteurs_publications")
          .select(`
            publications (
              id,
              titre,
              annee,
              type,
              nombre_citations
            )
          `)
          .eq("chercheur_id", profileData.id)
          .order("created_at", { ascending: false })
          .limit(5);

        const pubs = pubsData?.map((item: any) => item.publications).filter(Boolean) || [];
        setRecentPublications(pubs);

        // Calculate stats
        const currentYear = new Date().getFullYear();
        const thisYearCount = pubs.filter((p: Publication) => p.annee === currentYear).length;
        const avgCitations = pubs.length > 0 
          ? Math.round(pubs.reduce((sum: number, p: Publication) => sum + (p.nombre_citations || 0), 0) / pubs.length)
          : 0;

        // Count collaborators
        const { data: collabData } = await supabase
          .from("collaborations")
          .select("id")
          .or(`chercheur1_id.eq.${profileData.id},chercheur2_id.eq.${profileData.id}`);

        setStats({
          totalPubs: profileData.nombre_publications || 0,
          thisYearPubs: thisYearCount,
          avgCitations,
          collaborators: collabData?.length || 0,
        });
      }

      // Fetch notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setNotifications(notifData || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ est_lu: true })
      .eq("id", id);
    
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, est_lu: true } : n)
    );
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="chercheur">
        <div className="min-h-screen">
          <Header />
          <div className="container py-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute requiredRole="chercheur">
        <div className="min-h-screen">
          <Header />
          <div className="container py-24">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Profil non trouvé</CardTitle>
                <CardDescription>
                  Aucun profil chercheur n'est associé à votre compte.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="chercheur">
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Welcome Header */}
            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage src={profile.photo_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {profile.prenom[0]}{profile.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold">
                      Bienvenue, {profile.prenom} {profile.nom}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {profile.grade} • {profile.specialite}
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/profile">Voir mon profil complet</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <BookOpen className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalPubs}</p>
                      <p className="text-sm text-muted-foreground">Publications totales</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground">
                    +{stats.thisYearPubs} cette année
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Award className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{profile.h_index}</p>
                      <p className="text-sm text-muted-foreground">H-Index</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground">
                    Mesure d'impact
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{profile.total_citations}</p>
                      <p className="text-sm text-muted-foreground">Citations</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground">
                    Moy: {stats.avgCitations} par pub
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10">
                      <Users className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.collaborators}</p>
                      <p className="text-sm text-muted-foreground">Collaborateurs</p>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground">
                    Réseau actif
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Publications */}
              <Card className="lg:col-span-2 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Publications récentes
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/profile">Voir tout</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPublications.length > 0 ? (
                      recentPublications.map((pub) => (
                        <div
                          key={pub.id}
                          className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
                        >
                          <h3 className="font-semibold line-clamp-2 mb-2">{pub.titre}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="secondary">{pub.type}</Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {pub.annee}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {pub.nombre_citations || 0} citations
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Aucune publication enregistrée
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-lg border transition-colors ${
                            notif.est_lu
                              ? "border-border/30 bg-muted/20"
                              : "border-primary/30 bg-primary/5"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {notif.type === "success" && (
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notif.type === "warning" && (
                              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notif.type === "error" && (
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notif.type === "info" && (
                              <Bell className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1">{notif.titre}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notif.message}
                              </p>
                              {notif.url && (
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-xs mt-1"
                                  asChild
                                >
                                  <a href={notif.url} target="_blank" rel="noopener noreferrer">
                                    Voir plus <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </Button>
                              )}
                              {!notif.est_lu && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-xs mt-1"
                                  onClick={() => markNotificationAsRead(notif.id)}
                                >
                                  Marquer comme lu
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8 text-sm">
                        Aucune notification
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                    <Link to="/profile">
                      <GraduationCap className="h-6 w-6" />
                      <span>Modifier mon profil</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                    <Link to="/publications">
                      <BookOpen className="h-6 w-6" />
                      <span>Parcourir publications</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                    <Link to="/researchers">
                      <Users className="h-6 w-6" />
                      <span>Trouver collaborateurs</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
