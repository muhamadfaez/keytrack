import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { UserProfile } from '@shared/types';
import { api } from '@/lib/api-client';
import { AppLogo } from '../layout/AppLogo';
import { Upload, X } from 'lucide-react';
const MAX_FILE_SIZE_KB = 100;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
export function LogoSettings() {
  const { data: userProfile } = useApi<UserProfile>(['profile']);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateLogoMutation = useApiMutation<UserProfile, { logo: string | null }>(
    (payload) => api('/api/settings/logo', { method: 'PUT', body: JSON.stringify(payload) }),
    [['profile']]
  );
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_SIZE_KB * 1024) {
      toast.error(`File size exceeds ${MAX_FILE_SIZE_KB}KB.`);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please use PNG, JPG, SVG, or WEBP.');
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };
  const handleSave = () => {
    if (!preview) return;
    updateLogoMutation.mutate({ logo: preview }, {
      onSuccess: () => {
        toast.success('Logo updated successfully!');
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (error) => {
        toast.error('Failed to update logo', { description: error.message });
      }
    });
  };
  const handleRemove = () => {
    updateLogoMutation.mutate({ logo: null }, {
      onSuccess: () => {
        toast.success('Custom logo removed.');
        setFile(null);
        setPreview(null);
      },
      onError: (error) => {
        toast.error('Failed to remove logo', { description: error.message });
      }
    });
  };
  const currentLogoSrc = preview || userProfile?.appLogoBase64;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Customize the application's logo. Recommended size: 128x128px.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted">
            {currentLogoSrc ? (
              <img src={currentLogoSrc} alt="Logo Preview" className="h-12 w-12 object-contain" />
            ) : (
              <AppLogo className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full">
              <Upload className="mr-2 h-4 w-4" />
              {file ? 'Change file' : 'Upload Logo'}
            </Label>
            <Input id="logo-upload" type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept={ACCEPTED_IMAGE_TYPES.join(',')} />
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG, WEBP up to {MAX_FILE_SIZE_KB}KB.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={handleRemove}
          disabled={!userProfile?.appLogoBase64 || updateLogoMutation.isPending}
        >
          <X className="mr-2 h-4 w-4" />
          Remove
        </Button>
        <Button onClick={handleSave} disabled={!preview || updateLogoMutation.isPending}>
          {updateLogoMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
}