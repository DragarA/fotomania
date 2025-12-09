import { Link, createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '../../features/auth/guards';
import { useCataloguesQuery } from '../../features/catalogues/hooks';
import { API_BASE_URL } from '../../lib/api-client';

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
          className="inline-flex items-center justify-center px-4 py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors"
        >
          + Create Catalogue
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading catalogues...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error?.message || 'Failed to load catalogues'}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((catalogue) => (
            <Link
              key={catalogue.id}
              to="/catalogues/$catalogueId"
              params={{ catalogueId: catalogue.id }}
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-lg hover:border-accent-300"
            >
              {/* Cover Image - Large and Prominent */}
              <div className="relative h-72 bg-gray-100 overflow-hidden">
                {catalogue.coverImage ? (
                  <img
                    src={`${API_BASE_URL}/uploads/${catalogue.coverImage}`}
                    alt={catalogue.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-accent-600 transition-colors">
                  {catalogue.title}
                </h2>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {catalogue.description || 'No description provided.'}
                </p>

                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {catalogue.photoCount || 0} photos
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            No catalogues yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first catalogue to start sharing photo galleries with clients.
          </p>
          <Link
            to="/catalogues/new"
            className="inline-flex items-center px-5 py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors"
          >
            Create Catalogue
          </Link>
        </div>
      )}
    </div>
  );
}
