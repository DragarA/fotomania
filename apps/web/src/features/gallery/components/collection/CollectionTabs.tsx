import type { Collection } from '../../types';

interface CollectionTabsProps {
  collections: Collection[];
  selectedCollectionId: string | null;
  onSelectCollection: (collectionId: string) => void;
}

export function CollectionTabs({
  collections,
  selectedCollectionId,
  onSelectCollection,
}: CollectionTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6" aria-label="Collections">
        {collections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => onSelectCollection(collection.id)}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
              ${
                selectedCollectionId === collection.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {collection.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
