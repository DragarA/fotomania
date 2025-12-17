import { createFileRoute } from '@tanstack/react-router';

import { DeliveryPage } from '../../features/gallery/pages/DeliveryPage';

export const Route = createFileRoute('/d/$slug')({
    component: DeliveryPage,
});

