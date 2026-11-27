import { createHashHistory, createRouter } from '@tanstack/react-router';

import { IS_DEMO_MODE } from './lib/demo-mode';
import { queryClient } from './queryClient';
import { routeTree } from './routeTree.gen';

// Create the router instance (hash history in static demo mode for GitHub Pages compatibility)
export const router = createRouter({
    routeTree,
    history: IS_DEMO_MODE ? createHashHistory() : undefined,
    context: {
        queryClient,
    },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
