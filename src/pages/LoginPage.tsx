import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { useSettingsStore } from '@/stores/settingsStore';
import { AppLogo } from '@/components/layout/AppLogo';
import { useApi } from '@/hooks/useApi';
import { UserProfile } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const enableGoogleAuth = useSettingsStore((state) => state.auth.enableGoogleAuth);
  const { data: userProfile, isLoading: isLoadingProfile } = useApi<UserProfile>(['profile']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@keytrack.app');
  const [password, setPassword] = useState('password');
  useEffect(() => {
    if (userProfile?.appName) {
      document.title = `${userProfile.appName} - Login`;
    } else {
      document.title = 'KeyTrack - Login';
    }
  }, [userProfile]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Login Successful', {
        description: 'Welcome back! Redirecting you to the dashboard...',
      });
      navigate('/');
    } catch (error) {
      toast.error('Login Failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup({ name, email, password });
      toast.success('Signup Successful', {
        description: 'Your account has been created. Redirecting...',
      });
      navigate('/');
    } catch (error) {
      toast.error('Signup Failed', {
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    toast.info("Google Sign-In is a mock feature for demonstration purposes.");
    // In a real app, this would trigger the OAuth flow.
    // For now, we'll just log in the admin user if the credentials match.
    if (email === 'admin@keytrack.app' && password === 'password') {
      handleLogin(new Event('submit') as unknown as React.FormEvent);
    }
  };
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-mesh opacity-10 dark:opacity-20" />
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <AppLogo className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight">
          {isLoadingProfile ? <Skeleton className="h-8 w-32" /> : (userProfile?.appName || 'KeyTrack')}
        </h1>
      </div>
      <Card className="w-full max-w-sm mt-8 z-10 animate-fade-in">
        <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl">{isSignUp ? 'Create Account' : 'Login'}</CardTitle>
            <CardDescription>
              {isSignUp ? 'Enter your details to create a new account.' : 'Enter your credentials to access the system.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
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
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            {enableGoogleAuth && !isSignUp && (
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
          <CardFooter className="text-sm">
            <p className="text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <Button variant="link" type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-semibold">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
      <p className="text-center text-sm text-muted-foreground mt-8 z-10">
        Develop by fzapp.my
      </p>
    </div>
  );
}