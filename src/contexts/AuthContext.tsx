// ============================================
// CONTEXT D'AUTHENTIFICATION
// ============================================
// Ce fichier crée un "système d'interphone" pour partager
// les informations de connexion dans toute l'application

import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, api, ApiError } from '../lib/api';

// ============================================
// TYPES TYPESCRIPT
// ============================================

// Type qui définit toutes les informations et fonctions disponibles
// dans le Context Auth
interface AuthContextType {
  // États
  user: User | null;              // L'utilisateur connecté (null si déconnecté)
  isLoading: boolean;             // True pendant le chargement
  isAuthenticated: boolean;       // True si l'utilisateur est connecté
  
  // Fonctions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, organizationName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================
// CRÉATION DU CONTEXT
// ============================================

// Créer le Context avec une valeur par défaut undefined
// (il sera rempli par le Provider)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER - Le "fournisseur" d'authentification
// ============================================

// Props du Provider (il doit recevoir des enfants à envelopper)
interface AuthProviderProps {
  children: ReactNode;  // Les composants enfants (toute l'app)
}

// Le Provider est un composant qui va envelopper toute ton application
// et fournir les infos d'authentification à tous les composants enfants
export function AuthProvider({ children }: AuthProviderProps) {
  
  // ============================================
  // ÉTATS LOCAUX
  // ============================================
  
  // L'utilisateur connecté (null si personne n'est connecté)
  const [user, setUser] = useState<User | null>(null);
  
  // Indique si on est en train de charger les données
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // VÉRIFICATION INITIALE
  // ============================================
  // Au démarrage de l'app, on vérifie si un token existe
  // Si oui, on récupère les infos de l'utilisateur
  
  useEffect(() => {
    // Fonction pour vérifier le token au démarrage
    const checkAuth = async () => {
      const token = api.getToken();
      
      // Si aucun token n'existe, l'utilisateur n'est pas connecté
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Si un token existe, on essaie de récupérer les infos utilisateur
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // Si le token est invalide ou expiré, on le supprime
        console.error('Token invalide:', error);
        api.removeToken();
        setUser(null);
      } finally {
        // Dans tous les cas, on arrête le chargement
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // [] = exécuter une seule fois au montage du composant

  // ============================================
  // FONCTION LOGIN
  // ============================================
  // Permet à un utilisateur de se connecter
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Appeler l'API pour se connecter
      const response = await api.login({ email, password });
      
      // Sauvegarder l'utilisateur dans l'état
      setUser(response.user);
      
    } catch (error) {
      // Si une erreur se produit, la propager pour que le composant
      // qui appelle login() puisse l'afficher
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FONCTION REGISTER
  // ============================================
  // Permet à un nouvel utilisateur de créer un compte
  
  const register = async (
    name: string,
    email: string,
    password: string,
    organizationName: string
  ) => {
    try {
      setIsLoading(true);
      
      // Appeler l'API pour s'inscrire
      const response = await api.register({
        name,
        email,
        password,
        organizationName,
      });
      
      // Sauvegarder l'utilisateur dans l'état
      setUser(response.user);
      
    } catch (error) {
      // Si une erreur se produit, la propager
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FONCTION LOGOUT
  // ============================================
  // Permet à l'utilisateur de se déconnecter
  
  const logout = async () => {
    try {
      // Appeler l'API pour se déconnecter (supprimer le token)
      await api.logout();
      
      // Réinitialiser l'état utilisateur
      setUser(null);
      
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  // ============================================
  // FONCTION REFRESH USER
  // ============================================
  // Permet de rafraîchir les données de l'utilisateur
  // (utile après une modification de profil par exemple)
  
  const refreshUser = async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      // Si l'erreur est 401 (non autorisé), déconnecter l'utilisateur
      if (error instanceof ApiError && error.status === 401) {
        api.removeToken();
        setUser(null);
      }
      throw error;
    }
  };

  // ============================================
  // VALEUR DU CONTEXT
  // ============================================
  // Toutes les données et fonctions qu'on veut partager
  
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,  // True si user existe
    login,
    register,
    logout,
    refreshUser,
  };

  // ============================================
  // RENDU
  // ============================================
  // On enveloppe les enfants avec le Provider
  // et on leur donne accès à toutes les valeurs
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
