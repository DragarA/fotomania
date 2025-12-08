import { Link, createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '../../features/auth/guards';
import { useCataloguesQuery } from '../../features/catalogues/hooks';

export const Route = createFileRoute('/catalogues/')({
  beforeLoad: requireAuth,
  component: CataloguesPage,
});

function CataloguesPage() {
  const { data, isLoading, isError, error } = useCataloguesQuery();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Catalogues</h1>
          <p className="text-gray-600 mt-2">
            Manage the galleries that you share with your clients.
          </p>
        </div>
        <Link
          to="/catalogues/new"
          className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          + Create Catalogue
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading catalogues...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error?.message || 'Failed to load catalogues'}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((catalogue) => (
            <div
              key={catalogue.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            >
              {catalogue.coverImage && (
                <img
                  src={catalogue.coverImage}
                  alt={catalogue.title}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {catalogue.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Updated {new Date(catalogue.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to="/catalogues/$catalogueId"
                    params={{ catalogueId: catalogue.id }}
                    className="text-indigo-600 font-semibold hover:text-indigo-800"
                  >
                    View
                  </Link>
                </div>

                <p className="text-gray-600 mt-4 flex-1 line-clamp-3">
                  {catalogue.description || 'No description provided.'}
                </p>

                <div className="mt-6 space-y-2">
                  <div className="text-sm text-gray-500">
                    Public URL:{' '}
                    <Link
                      to="/c/$slug"
                      params={{ slug: catalogue.publicUrlSlug }}
                      className="text-indigo-600 underline"
                    >
                      /c/{catalogue.publicUrlSlug}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                <Link
                  to="/catalogues/$catalogueId/edit"
                  params={{ catalogueId: catalogue.id }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Edit
                </Link>
                <Link
                  to="/catalogues/$catalogueId"
                  params={{ catalogueId: catalogue.id }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            No catalogues yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first catalogue to start sharing photo galleries with clients.
          </p>
          <Link
            to="/catalogues/new"
            className="inline-flex items-center px-5 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Catalogue
          </Link>
        </div>
      )}
    </div>
  );
}
