import { createFileRoute } from '@tanstack/react-router';

import { PublicCataloguePage } from '../../features/gallery/pages/PublicCataloguePage';

export const Route = createFileRoute('/c/$slug')({
    component: PublicCataloguePage,
});