import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import type { Catalogue, Collection } from '../../types';

interface CatalogueSidebarProps {
  catalogue: Catalogue;
  catalogueId: string;
  collections: Collection[] | undefined;
  collectionsLoading: boolean;
  selectedCollectionId: string | null;
  onSelectCollection: (collectionId: string) => void;
  onCreateCollection: () => void;
  onCollectionContextMenu: (e: React.MouseEvent, collection: Collection) => void;
}

export function CatalogueSidebar({
  catalogue,
  catalogueId,
  collections,
  collectionsLoading,
  selectedCollectionId,
  onSelectCollection,
  onCreateCollection,
  onCollectionContextMenu,
}: CatalogueSidebarProps) {
  const copyPublicUrl = () => {
    const fullUrl = `${window.location.origin}/c/${catalogue.publicUrlSlug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard');
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header with catalogue info and actions */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {catalogue.title}
        </h1>
        {catalogue.description && (
          <p className="text-gray-600 text-sm mb-4">{catalogue.description}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Link
            to="/catalogues/$catalogueId/edit"
            params={{ catalogueId }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
          >
            Edit Details
          </Link>
          <button
            onClick={copyPublicUrl}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Share
          </button>
        </div>
      </div>

      {/* Collections list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Collections</h2>
          <button
            onClick={onCreateCollection}
            className="text-accent-600 hover:text-accent-700 text-sm font-medium cursor-pointer"
          >
            + Add
          </button>
        </div>

        {collectionsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="space-y-2">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedCollectionId === collection.id
                    ? 'bg-indigo-50 border-2 border-accent-500'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                }`}
                onClick={() => onSelectCollection(collection.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {collection.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {collection.photoCount} photos
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCollectionContextMenu(e, collection);
                    }}
                    className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                    title="More options"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No collections yet</p>
            <button
              onClick={onCreateCollection}
              className="px-4 py-2 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-all cursor-pointer"
            >
              Create First Collection
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
