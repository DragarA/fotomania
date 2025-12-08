import { createFileRoute } from '@tanstack/react-router';
import { useCatalogueBySlugQuery } from '../../features/catalogues/hooks';

export const Route = createFileRoute('/c/$slug')({
  component: PublicCataloguePage,
});

function PublicCataloguePage() {
  const { slug } = Route.useParams();
  const { data, isLoading, isError, error } = useCatalogueBySlugQuery(slug);

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
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Catalogue not found</h1>
          <p className="text-gray-600">{error?.message || 'This link may be invalid.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {data.coverImage && (
          <img src={data.coverImage} alt="" className="w-full h-72 object-cover" />
        )}
        <div className="p-10">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-2">
            Client Gallery
          </p>
          <h1 className="text-4xl font-bold text-gray-900">{data.title}</h1>
          <p className="text-gray-600 mt-4 leading-relaxed">
            {data.description || 'This catalogue is ready to be shared with clients.'}
          </p>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Public slug</p>
            <p className="font-mono text-gray-900 break-all">{data.publicUrlSlug}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
