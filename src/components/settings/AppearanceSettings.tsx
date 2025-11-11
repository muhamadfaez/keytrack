import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from '@/hooks/use-theme';
import { Separator } from '../ui/separator';
import { Sun, Moon, Laptop, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
export function AppearanceSettings() {
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of the application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Theme</Label>
          <p className="text-sm text-muted-foreground">Select the color mode for the interface.</p>
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
            className="grid grid-cols-3 gap-2 mt-2"
          >
            <div>
              <RadioGroupItem value="light" id="light" className="peer sr-only" />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Sun className="mb-3 h-6 w-6" />
                Light
              </Label>
            </div>
            <div>
              <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Moon className="mb-3 h-6 w-6" />
                Dark
              </Label>
            </div>
            <div>
              <RadioGroupItem value="system" id="system" className="peer sr-only" />
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Laptop className="mb-3 h-6 w-6" />
                System
              </Label>
            </div>
          </RadioGroup>
        </div>
        <Separator />
        <div>
          <Label className="text-sm font-medium">Color Scheme</Label>
          <p className="text-sm text-muted-foreground">Select the primary color palette.</p>
          <RadioGroup
            value={colorScheme}
            onValueChange={(value) => setColorScheme(value as "default" | "iium")}
            className="flex items-center space-x-2 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="color-default" />
              <Label htmlFor="color-default" className="flex items-center gap-2 cursor-pointer">
                <Palette className="h-4 w-4" /> Default
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="iium" id="color-iium" />
              <Label htmlFor="color-iium" className="flex items-center gap-2 cursor-pointer">
                <div className={cn("h-4 w-4 rounded-full bg-[#00918e] border")} /> IIUM
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}