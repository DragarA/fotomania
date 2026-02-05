import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '../../features/auth/guards';
import { CatalogueDetailPage } from '../../features/gallery/pages/CatalogueDetailPage';

export const Route = createFileRoute('/catalogues/$catalogueId/')({
    beforeLoad: requireAuth,
    component: CatalogueDetailPage,
});
