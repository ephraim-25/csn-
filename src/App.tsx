import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Researchers from "./pages/Researchers";
import ResearcherProfile from "./pages/ResearcherProfile";
import Publications from "./pages/Publications";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import ManageResearchers from "./pages/ManageResearchers";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ChercheursAdmin from "./pages/admin/ChercheursAdmin";
import PublicationsAdmin from "./pages/admin/PublicationsAdmin";
import CentresAdmin from "./pages/admin/CentresAdmin";
import ProvincesAdmin from "./pages/admin/ProvincesAdmin";
import PublicResearchers from "./pages/PublicResearchers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/chercheurs" element={<Researchers />} />
            <Route path="/chercheurs/:id" element={<ResearcherProfile />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="chercheur">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requiredRole="chercheur">
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/manage-researchers" element={
              <ProtectedRoute requiredRole="admin">
                <ManageResearchers />
              </ProtectedRoute>
            } />
            <Route path="/admin/chercheurs" element={
              <ProtectedRoute requiredRole="admin">
                <ChercheursAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/publications" element={
              <ProtectedRoute requiredRole="admin">
                <PublicationsAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/centres" element={
              <ProtectedRoute requiredRole="admin">
                <CentresAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/provinces" element={
              <ProtectedRoute requiredRole="admin">
                <ProvincesAdmin />
              </ProtectedRoute>
            } />
            <Route path="/annuaire" element={<PublicResearchers />} />
            <Route path="/chercheur/:id" element={<ResearcherProfile />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
