import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { requireAuth } from '../../features/auth/guards';
import { CatalogueForm } from '../../features/catalogues/CatalogueForm';
import {
  useCatalogueQuery,
  useUpdateCatalogueMutation,
} from '../../features/gallery/hooks';
import type { CatalogueCreateFormValues } from '../../features/catalogues/validation';

export const Route = createFileRoute('/catalogues/$catalogueId/edit')({
  beforeLoad: requireAuth,
  component: EditCataloguePage,
});

function EditCataloguePage() {
  const navigate = useNavigate();
  const { catalogueId } = Route.useParams();
  const { data, isLoading, isError, error } = useCatalogueQuery(catalogueId);
  const updateMutation = useUpdateCatalogueMutation(catalogueId);

  const handleSubmit = (values: CatalogueCreateFormValues) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      password: values.password || undefined,
    };

    updateMutation.mutate(payload, {
      onSuccess: (catalogue) => {
        toast.success('Catalogue updated successfully!');
        navigate({
          to: '/catalogues/$catalogueId',
          params: { catalogueId: catalogue.id },
        });
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update catalogue');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading catalogue...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error?.message || 'Unable to load catalogue.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-8">
          <p className="text-sm font-semibold text-accent-600 uppercase tracking-wide mb-2">
            Edit Catalogue
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>
          <p className="text-gray-600 mt-2">
            Update catalogue metadata, cover image, and public link.
          </p>
        </div>

        {updateMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {updateMutation.error?.message || 'Unable to update catalogue.'}
          </div>
        )}

        <CatalogueForm
          initialValues={{
            title: data.title,
            description: data.description ?? '',
            password: data.password ?? '',
          }}
          submitLabel="Save changes"
          isSubmitting={updateMutation.isPending}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
