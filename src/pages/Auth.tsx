import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Header } from '../components/layout/Header';
import { Alert } from '../components/ui/Alert';

type AuthMode = 'login' | 'register';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerOrganization, setRegisterOrganization] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginEmail || !loginPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await login(loginEmail, loginPassword);
      setSuccess('Connexion réussie ! Redirection...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!registerName || !registerEmail || !registerPassword || !registerOrganization) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await register(registerName, registerEmail, registerPassword, registerOrganization);
      setSuccess('Inscription réussie ! Redirection vers l\'onboarding...');
      // Nouveaux utilisateurs vont vers l'onboarding
      setTimeout(() => navigate('/onboarding'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription");
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
    setLoginEmail('');
    setLoginPassword('');
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterOrganization('');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-md mx-auto pt-20 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' ? 'Connectez-vous à votre compte' : 'Commencez gratuitement dès maintenant'}
          </p>
        </div>

        {error && <Alert variant="error" message={error} className="mb-6" />}
        {success && <Alert variant="success" message={success} className="mb-6" />}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="votre@email.com"
              value={loginEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLoginPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
            <div className="text-center">
              <button type="button" onClick={switchMode} className="text-blue-600 hover:text-blue-700 text-sm" disabled={isLoading}>
                Pas encore de compte ? S'inscrire
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <Input
              label="Nom complet"
              type="text"
              placeholder="Jean Dupont"
              value={registerName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterName(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              label="Email"
              type="email"
              placeholder="votre@email.com"
              value={registerEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={registerPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterPassword(e.target.value)}
              required
              disabled={isLoading}
              helperText="Minimum 6 caractères"
            />
            <Input
              label="Nom de l'organisation"
              type="text"
              placeholder="Mon Entreprise"
              value={registerOrganization}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRegisterOrganization(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Inscription...' : "S'inscrire"}
            </Button>
            <div className="text-center">
              <button type="button" onClick={switchMode} className="text-blue-600 hover:text-blue-700 text-sm" disabled={isLoading}>
                Déjà un compte ? Se connecter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
