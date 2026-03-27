import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthPortalLayout } from '@/components/auth-portal-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen');
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPortalLayout
      title="Willkommen zurück"
      subtitle="Anmelden"
      footerLink={{
        to: '/register',
        label: 'Konto erstellen',
        hint: 'Noch kein Konto?',
      }}
    >
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        {error && (
          <Alert variant="destructive" className="rounded-2xl border-2">
            <AlertTitle className="font-sans font-extrabold">Fehler</AlertTitle>
            <AlertDescription className="font-sans font-bold">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="login-email"
            className="font-sans text-sm font-extrabold text-foreground"
          >
            E-Mail
          </Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="du@beispiel.de"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="login-password"
            className="font-sans text-sm font-extrabold text-foreground"
          >
            Passwort
          </Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full"
          disabled={pending}
        >
          {pending ? 'Wird angemeldet…' : 'Anmelden'}
        </Button>
      </form>
    </AuthPortalLayout>
  );
}
