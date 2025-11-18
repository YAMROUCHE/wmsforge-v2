import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Pendant le chargement, afficher un loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-600 dark:text-gray-300">Chargement...</div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Si utilisateur connecté, afficher la page demandée
  return <>{children}</>;
}
