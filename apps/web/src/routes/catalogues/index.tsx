import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '../../features/auth/guards';
import { CataloguesPage } from '../../features/gallery/pages/CataloguesPage';

export const Route = createFileRoute('/catalogues/')({
    beforeLoad: requireAuth,
    component: CataloguesPage,
});

