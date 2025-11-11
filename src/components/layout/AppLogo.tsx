import React from 'react';
import { useApi } from '@/hooks/useApi';
import { UserProfile } from '@shared/types';
import { HorizonLogo } from '../icons/HorizonLogo';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
type AppLogoProps = {
  className?: string;
};
export function AppLogo({ className }: AppLogoProps) {
  const { data: userProfile, isLoading, error } = useApi<UserProfile>(['profile']);
  if (isLoading) {
    return <Skeleton className={cn("rounded-md", className)} />;
  }
  if (error) {
    // Fallback to default logo on error
    return <HorizonLogo className={className} />;
  }
  if (userProfile?.appLogoBase64) {
    return (
      <img
        src={userProfile.appLogoBase64}
        alt="Application Logo"
        className={cn("object-contain", className)}
      />
    );
  }
  return <HorizonLogo className={className} />;
}