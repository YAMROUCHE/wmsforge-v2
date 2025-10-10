// ============================================
// HOOK USEAUTH - Raccourci pour l'authentification
// ============================================
// Ce hook permet d'accéder facilement au Context d'authentification
// depuis n'importe quel composant

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// ============================================
// FONCTION USEAUTH
// ============================================
// Cette fonction est un "raccourci" pour accéder au Context Auth

export function useAuth() {
  // Récupérer le Context
  const context = useContext(AuthContext);

  // SÉCURITÉ : Vérifier que le Context existe
  // Si le Context n'existe pas, c'est qu'on a oublié d'envelopper
  // l'application avec le AuthProvider
  if (context === undefined) {
    throw new Error(
      'useAuth doit être utilisé à l\'intérieur d\'un AuthProvider'
    );
  }

  // Retourner toutes les valeurs et fonctions du Context
  return context;
}

// ============================================
// UTILISATION DANS UN COMPOSANT
// ============================================
// Exemple d'utilisation :
//
// import { useAuth } from '../hooks/useAuth';
//
// function MonComposant() {
//   const { user, isAuthenticated, login, logout } = useAuth();
//
//   if (isAuthenticated) {
//     return <p>Bonjour {user?.name} !</p>;
//   }
//
//   return <p>Vous n'êtes pas connecté</p>;
// }
