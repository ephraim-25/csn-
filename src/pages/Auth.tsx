import { useState } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Shield } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Email invalide').max(255, 'Email trop long'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
});

const signUpSchema = z.object({
  email: z.string().email('Email invalide').max(255, 'Email trop long'),
  fullName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides'),
  role: z.enum(['chercheur', 'admin'], {
    required_error: 'Veuillez sélectionner un rôle',
  }),
  matricule: z.string().optional(),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Doit contenir au moins un caractère spécial'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
}).refine(data => {
  // If role is admin, matricule is required
  if (data.role === 'admin' && !data.matricule) {
    return false;
  }
  return true;
}, {
  message: 'Le matricule est requis pour le rôle administrateur',
  path: ['matricule']
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'chercheur' | 'admin'>('chercheur');
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const result = signInSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password')
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      toast({
        title: "Erreur de validation",
        description: Object.values(errors).flat().join(', '),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(result.data.email, result.data.password);

    if (error) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur la plateforme CSN",
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const result = signUpSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      fullName: formData.get('fullName'),
      role: formData.get('role'),
      matricule: formData.get('matricule')
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      toast({
        title: "Erreur de validation",
        description: Object.values(errors).flat().join(', '),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(
      result.data.email, 
      result.data.password, 
      result.data.fullName,
      result.data.role,
      result.data.matricule
    );

    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Inscription réussie",
        description: `Votre compte ${result.data.role === 'admin' ? 'administrateur' : 'chercheur'} a été créé avec succès`,
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
            Plateforme CSN
          </h1>
          <p className="text-muted-foreground">Conseil Scientifique National</p>
        </div>

        <Card className="border-primary/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl">Authentification</CardTitle>
            <CardDescription>
              Connectez-vous ou créez votre compte chercheur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">
                  <Shield className="w-4 h-4 mr-2" />
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="signup">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Inscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="votreemail@exemple.cd"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Dr. Jean Dupont"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="votreemail@exemple.cd"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Rôle</Label>
                    <select
                      id="signup-role"
                      name="role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as 'chercheur' | 'admin')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isLoading}
                      required
                    >
                      <option value="chercheur">Chercheur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      {selectedRole === 'chercheur' 
                        ? 'Accès aux fonctionnalités de recherche et collaboration'
                        : 'Accès administratif complet au système'}
                    </p>
                  </div>

                  {/* Matricule Field - Only for Admin */}
                  {selectedRole === 'admin' && (
                    <div className="space-y-2 p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
                      <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <Shield className="h-4 w-4" />
                        <Label htmlFor="signup-matricule" className="text-amber-600">
                          Matricule Administrateur
                        </Label>
                      </div>
                      <Input
                        id="signup-matricule"
                        name="matricule"
                        type="text"
                        placeholder="Ex: ADM2024001"
                        required={selectedRole === 'admin'}
                        disabled={isLoading}
                        className="border-amber-500/30"
                      />
                      <p className="text-xs text-amber-600">
                        Le matricule administrateur est requis pour des raisons de sécurité. 
                        Contactez le service IT si vous n'avez pas de matricule.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Min. 8 caractères avec maj, min, chiffre et symbole"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmer le mot de passe</Label>
                    <Input
                      id="signup-confirm"
                      name="confirmPassword"
                      type="password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Création du compte..." : `Créer mon compte ${selectedRole === 'admin' ? 'administrateur' : 'chercheur'}`}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Powered by <span className="font-semibold text-primary">Dark Business Hi-Tech</span>
        </p>
      </motion.div>
    </div>
  );
}
