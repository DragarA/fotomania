import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'sonner';

import { queryClient } from './queryClient';
import { router } from './router';
import { AuthProvider } from './features/auth/hooks';
import './lib/api-client'; // Initialize API configuration
import './index.css'; // Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
