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
        <div className="border-b border-black/10">
            <nav className="flex flex-wrap gap-6 px-6" aria-label="Collections">
                {collections.map((collection) => (
                    <button
                        key={collection.id}
                        onClick={() => onSelectCollection(collection.id)}
                        className={`
              pb-3 text-xs uppercase tracking-[0.4em] transition-all duration-500 whitespace-nowrap border-b-2
              ${
                  selectedCollectionId === collection.id
                      ? 'border-stone-800 text-stone-800'
                      : 'border-transparent text-stone-400 hover:text-stone-600 hover:border-stone-300'
              }`}
                    >
                        {collection.name}
                    </button>
                ))}
            </nav>
        </div>
    );
}
