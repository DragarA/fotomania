import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from 'sonner';

import { AuthProvider } from './features/auth/hooks';
import { OnboardingProvider } from './features/onboarding/OnboardingContext';
import i18n from './i18n/config';
import { initializeZodI18n } from './i18n/zod-error-map';
import { queryClient } from './queryClient';
import { router } from './router';
import './i18n/types'; // Import for type augmentation
import './lib/api-client'; // Initialize API configuration
import './index.css'; // Tailwind CSS

// Lazy load DevTools only in development
const ReactQueryDevtools =
    import.meta.env.MODE === 'development'
        ? lazy(() =>
              import('@tanstack/react-query-devtools').then((res) => ({
                  default: res.ReactQueryDevtools,
              }))
          )
        : () => null;

// Initialize Zod i18n error map
initializeZodI18n();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <I18nextProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <OnboardingProvider>
                        <RouterProvider router={router} />
                        <Toaster position="top-right" richColors />
                        {import.meta.env.MODE === 'development' && (
                            <Suspense fallback={null}>
                                <ReactQueryDevtools initialIsOpen={false} />
                            </Suspense>
                        )}
                    </OnboardingProvider>
                </AuthProvider>
            </QueryClientProvider>
        </I18nextProvider>
    </React.StrictMode>
);
