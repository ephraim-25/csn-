import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type UserRole = 'admin' | 'chercheur';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'chercheur', matricule?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer role fetching to avoid blocking
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setUserRole(data.role as UserRole);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.user) {
      // Fetch user role to redirect accordingly
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();
      
      if (roleData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'chercheur', matricule?: string) => {
    console.log('[signUp] Starting signup process', { email, fullName, role, matricule });
    
    // For admin role, verify matricule first using secure RPC function
    if (role === 'admin') {
      if (!matricule) {
        console.log('[signUp] Admin signup failed: no matricule provided');
        return { error: { message: 'Le matricule est requis pour le rôle administrateur' } };
      }

      console.log('[signUp] Verifying matricule:', matricule);
      
      // Use the secure RPC function to verify matricule without exposing admin emails
      const { data: isValidMatricule, error: matriculeError } = await supabase
        .rpc('verify_admin_matricule', { p_matricule: matricule });

      console.log('[signUp] Matricule verification result:', { isValidMatricule, matriculeError });

      if (matriculeError) {
        console.error('[signUp] Matricule verification error:', matriculeError);
        return { error: { message: `Erreur de vérification du matricule: ${matriculeError.message}` } };
      }
      
      if (!isValidMatricule) {
        console.log('[signUp] Matricule invalid or already used');
        return { error: { message: 'Matricule invalide ou déjà utilisé' } };
      }
      
      console.log('[signUp] Matricule verified successfully');
    }

    const redirectUrl = `${window.location.origin}/dashboard`;
    console.log('[signUp] Creating auth user with redirect:', redirectUrl);
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          matricule: matricule,
        }
      }
    });
    
    console.log('[signUp] Auth signUp result:', { error, user: data?.user?.id, session: !!data?.session });
    
    if (error) {
      console.error('[signUp] Auth error:', error);
      return { error };
    }
    
    if (data.user) {
      console.log('[signUp] User created successfully, redirecting to:', role === 'admin' ? '/admin' : '/dashboard');
      
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
