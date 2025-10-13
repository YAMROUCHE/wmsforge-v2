import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Si pas d'utilisateur connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Si utilisateur connecté, afficher la page demandée
  return <>{children}</>;
}
