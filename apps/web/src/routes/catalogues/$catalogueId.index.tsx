import { createFileRoute } from '@tanstack/react-router';

import { requireAuth } from '../../features/auth/guards';
import { GalleryWorkspace } from '../../features/gallery/components/workspace/GalleryWorkspace';

export const Route = createFileRoute('/catalogues/$catalogueId/')({
  beforeLoad: requireAuth,
  component: CatalogueDetailPage,
});

function CatalogueDetailPage() {
  const { catalogueId } = Route.useParams();

  return <GalleryWorkspace catalogueId={catalogueId} />;
}
