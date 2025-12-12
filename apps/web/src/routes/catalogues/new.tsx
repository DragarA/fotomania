import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { requireAuth } from '../../features/auth/guards';
import { CatalogueForm } from '../../features/gallery/components/catalogue/CatalogueForm';
import { useCreateCatalogueMutation } from '../../features/gallery/hooks';
import type { CatalogueCreateFormValues } from '../../features/gallery/utils/validation';

export const Route = createFileRoute('/catalogues/new')({
    beforeLoad: requireAuth,
    component: CreateCataloguePage,
});

function CreateCataloguePage() {
    const navigate = useNavigate();
    const createMutation = useCreateCatalogueMutation();

    const handleSubmit = (values: CatalogueCreateFormValues) => {
        createMutation.mutate(values, {
            onSuccess: (catalogue) => {
                toast.success('Catalogue created successfully!');
                navigate({
                    to: '/catalogues/$catalogueId',
                    params: { catalogueId: catalogue.id },
                });
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to create catalogue');
            },
        });
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-accent-600 uppercase tracking-wide mb-2">
                        New Catalogue
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create a catalogue
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Share curated galleries with your clients along with
                        secure public links.
                    </p>
                </div>

                {createMutation.isError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                        {createMutation.error?.message ||
                            'Unable to create catalogue.'}
                    </div>
                )}

                <CatalogueForm
                    submitLabel="Create catalogue"
                    isSubmitting={createMutation.isPending}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
}
