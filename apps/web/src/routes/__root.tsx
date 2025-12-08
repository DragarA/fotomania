import { QueryClient } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <a href="/" style={{ marginRight: '1rem' }}>
            Home
          </a>
          <a href="/about">About</a>
        </nav>
      </div>
      <div style={{ padding: '1rem' }}>
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
