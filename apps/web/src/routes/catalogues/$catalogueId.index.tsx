import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { requireAuth } from '../../features/auth/guards';
import {
  useCatalogueQuery,
  useDeleteCatalogueMutation,
} from '../../features/catalogues/hooks';

export const Route = createFileRoute('/catalogues/$catalogueId/')({
  beforeLoad: requireAuth,
  component: CatalogueDetailPage,
});

function CatalogueDetailPage() {
  const navigate = useNavigate();
  const { catalogueId } = Route.useParams();
  const { data, isLoading, isError, error } = useCatalogueQuery(catalogueId);
  const deleteMutation = useDeleteCatalogueMutation();

  const handleDelete = () => {
    if (!data) return;

    toast.custom(
      (t) => (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold mb-2">
            Delete &quot;{data.title}&quot;?
          </p>
          <p className="text-sm text-gray-600 mb-3">
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t);
                deleteMutation.mutate(data.id, {
                  onSuccess: () => navigate({ to: '/catalogues' }),
                });
              }}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading catalogue...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error?.message || 'Catalogue not found.'}
        </div>
      </div>
    );
  }

  return (
    <>
      {deleteMutation.isPending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Deleting catalogue...</p>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
        {data.coverImage && (
          <img src={data.coverImage} className="w-full h-64 object-cover" alt="" />
        )}
        <div className="p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">
                Catalogue
              </p>
              <h1 className="text-4xl font-bold text-gray-900">{data.title}</h1>
              <p className="text-gray-500 mt-2">
                Created {new Date(data.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/catalogues/$catalogueId/edit"
                params={{ catalogueId: data.id }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Edit
              </Link>
              <Link
                to="/c/$slug"
                params={{ slug: data.publicUrlSlug }}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                target="_blank"
              >
                View public page
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">
                {data.description || 'No description provided yet.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  Public URL
                </p>
                <p className="font-mono text-sm text-gray-900">
                  {window.location.origin}/c/{data.publicUrlSlug}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 uppercase mb-1">
                  Catalogue ID
                </p>
                <p className="font-mono text-sm text-gray-900 break-all">{data.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
