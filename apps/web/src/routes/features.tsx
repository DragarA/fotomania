import { createFileRoute } from '@tanstack/react-router';

import { FeaturesPage } from '../features/pages/FeaturesPage';

export const Route = createFileRoute('/features')({
    component: FeaturesPage,
});
