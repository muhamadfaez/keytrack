import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { useSettingsStore } from '@/stores/settingsStore';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const enableGoogleAuth = useSettingsStore((state) => state.auth.enableGoogleAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('admin@university.edu');
  const [password, setPassword] = useState('password');
  const performLogin = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login();
      toast.success('Login Successful', {
        description: 'Welcome back! Redirecting you to the dashboard...',
      });
      navigate('/');
    }, 1000);
  };
  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      performLogin();
    } else {
      toast.error('Login Failed', {
        description: 'Please enter your credentials.',
      });
    }
  };
  const handleGoogleLogin = () => {
    // This is a simulated login as per requirements.
    performLogin();
  };
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-mesh opacity-10 dark:opacity-20" />
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight">
          KeyTrack
        </h1>
      </div>
      <Card className="w-full max-w-sm mt-8 z-10 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the system.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCredentialLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button className="w-full mt-2" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            {enableGoogleAuth && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="mr-2 h-4 w-4" />
                  )}
                  Sign in with Google
                </Button>
              </>
            )}
          </CardContent>
        </form>
      </Card>
      <p className="text-center text-sm text-muted-foreground mt-8 z-10">
        Built with ❤️ at Cloudflare
      </p>
    </div>
  );
}