import { Outlet, useRouterState } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Navigation } from './Navigation';
import { Footer } from './Footer';

export function AppLayout() {
  const { pathname } = useRouterState({
    select: (state) => state.location,
  });
  const isPublicGallery = pathname.startsWith('/c/');

  return (
    <>
      {!isPublicGallery && <Navigation />}
      <main className="min-h-screen">
        <Outlet />
      </main>
      {!isPublicGallery && <Footer />}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
