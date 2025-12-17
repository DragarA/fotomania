import { Outlet, useRouterState } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';


import ErrorBoundary from '../common/ErrorBoundary';

import { Footer } from './Footer';
import { Navigation } from './Navigation';

// Lazy load DevTools only in development
const TanStackRouterDevtools =
    import.meta.env.MODE === 'development'
        ? lazy(() =>
              import('@tanstack/router-devtools').then((res) => ({
                  default: res.TanStackRouterDevtools,
              }))
          )
        : () => null;

export function AppLayout() {
    const { pathname } = useRouterState({
        select: (state) => state.location,
    });
    const isPublicGallery = pathname.startsWith('/c/') || pathname.startsWith('/d/');

    return (
        <>
            {!isPublicGallery && <Navigation />}
            <main className="min-h-screen">
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </main>
            {!isPublicGallery && <Footer />}
            {import.meta.env.MODE === 'development' && (
                <Suspense fallback={null}>
                    <TanStackRouterDevtools position="bottom-right" />
                </Suspense>
            )}
        </>
    );
}
