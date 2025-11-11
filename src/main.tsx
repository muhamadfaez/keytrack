import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { KeyInventoryPage } from '@/pages/KeyInventoryPage';
import { PersonnelPage } from '@/pages/PersonnelPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { Toaster } from '@/components/ui/sonner';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/keys",
    element: <KeyInventoryPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/personnel",
    element: <PersonnelPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/reports",
    element: <ReportsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)