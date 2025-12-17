import { useParams } from "@tanstack/react-router";

import { GalleryWorkspace } from "../components/workspace/GalleryWorkspace";

export function CatalogueDetailPage() {
    const { catalogueId } = useParams({ from: '/catalogues/$catalogueId/' });

    return <GalleryWorkspace catalogueId={catalogueId} />;
}
