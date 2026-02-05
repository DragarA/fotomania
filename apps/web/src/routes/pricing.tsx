import { createFileRoute } from '@tanstack/react-router';

import { PricingPage } from '../features/pages/PricingPage';

export const Route = createFileRoute('/pricing')({
    component: PricingPage,
});
