import { Link, useNavigate } from '@tanstack/react-router';
import {
    Archive,
    ChevronLeft,
    Eye,
    EyeOff,
    Heart,
    LockOpen,
    Lock,
    MoreVertical,
    Share,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

import {
    useDeleteCatalogueMutation,
    useUpdateCatalogueStatusMutation,
} from '../../hooks';
import type {
    Catalogue,
    Collection,
    ClientFavouriteSession,
} from '../../types';
import { FavouritesModal } from '../favourites/FavouritesModal';
import { FavouritesView } from '../favourites/FavouritesView';

import { CatalogueContextMenu } from './CatalogueContextMenu';
import { CatalogueFormModal } from './CatalogueFormModal';
import { PasswordModal } from './PasswordModal';

type TabType = 'collections' | 'favourites';

interface CatalogueSidebarProps {
    catalogue: Catalogue;
    catalogueId: string;
    collections: Collection[] | undefined;
    collectionsLoading: boolean;
    selectedCollectionId: string | null;
    onSelectCollection: (collectionId: string) => void;
    onCreateCollection: () => void;
    onCollectionContextMenu: (
        e: React.MouseEvent,
        collection: Collection
    ) => void;
    // New props for favourites
    favouriteSessions: ClientFavouriteSession[] | undefined;
    favouritesLoading: boolean;
    onFavouritePhotoClick?: (photo: any) => void;
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
    favouriteSessions,
    favouritesLoading,
    onFavouritePhotoClick,
}: CatalogueSidebarProps) {
    const { t } = useTranslation('gallery');
    const navigate = useNavigate();
    const deleteCatalogueMutation = useDeleteCatalogueMutation();
    const updateStatusMutation = useUpdateCatalogueStatusMutation(catalogueId);
    const [activeTab, setActiveTab] = useState<TabType>('collections');
    const [selectedSession, setSelectedSession] =
        useState<ClientFavouriteSession | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
    } | null>(null);

    const copyPublicUrl = () => {
        const fullUrl = `${window.location.origin}/c/${catalogue.publicUrlSlug}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success(t('sidebar.linkCopied'));
    };

    const handleSessionClick = (session: ClientFavouriteSession) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleDelete = () => {
        if (
            window.confirm(
                t('sidebar.deleteConfirm', { title: catalogue.title })
            )
        ) {
            deleteCatalogueMutation.mutate(catalogueId, {
                onSuccess: () => {
                    toast.success(t('sidebar.deleteSuccess'));
                    navigate({ to: '/catalogues' });
                },
                onError: (error) => {
                    toast.error(error.message || t('sidebar.deleteError'));
                },
            });
        }
    };

    const toggleStatus = () => {
        const newStatus =
            catalogue.status === 'published' ? 'draft' : 'published';
        updateStatusMutation.mutate(
            { status: newStatus },
            {
                onSuccess: () => {
                    toast.success(
                        t(
                            newStatus === 'published'
                                ? 'sidebar.publishSuccess'
                                : 'sidebar.unpublishSuccess'
                        )
                    );
                },
                onError: (error) => {
                    toast.error(
                        error.message || t('sidebar.statusUpdateError')
                    );
                },
            }
        );
    };

    return (
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Header with catalogue info and actions */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                    <Link
                        to="/catalogues"
                        className="mr-2 text-gray-400 hover:text-gray-900 rounded transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="w-10 h-10" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 flex-1">
                        {catalogue.title}
                    </h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleContextMenu}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title={t('sidebar.moreOptions')}
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {catalogue.description && (
                    <p className="text-gray-600 text-sm mb-4">
                        {catalogue.description}
                    </p>
                )}

                {/* Status Button */}
                <div className="mb-4">
                    <button
                        onClick={toggleStatus}
                        disabled={updateStatusMutation.isPending}
                        className={`w-full h-10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium ${
                            catalogue.status === 'published'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                    >
                        {catalogue.status === 'draft' ? (
                            <>
                                <EyeOff className="w-4 h-4" />
                                {t('sidebar.draft')}
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4" />
                                {t('sidebar.published')}
                            </>
                        )}
                    </button>
                </div>

                {/* Action buttons for published catalogues */}
                {catalogue.status === 'published' && (
                    <div className="flex gap-2 mb-4">
                        <Button
                            onClick={copyPublicUrl}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            <Share className="w-4 h-4 mr-2" />
                            {t('sidebar.share')}
                        </Button>

                        <Tooltip
                            content={t(
                                catalogue.isProtected
                                    ? 'sidebar.catalogueProtected'
                                    : 'sidebar.addPasswordTooltip'
                            )}
                        >
                            <Button
                                onClick={() => setIsPasswordModalOpen(true)}
                                variant="outline"
                                size="sm"
                                className={`flex-1 ${catalogue.isProtected ? 'bg-green-100' : 'bg-red-100'}`}
                            >
                                {catalogue.isProtected ? (
                                    <Lock className="w-4 h-4 mr-2" />
                                ) : (
                                    <LockOpen className="w-4 h-4 mr-2" />
                                )}
                                {t(
                                    catalogue.isProtected
                                        ? 'sidebar.protected'
                                        : 'sidebar.addPassword'
                                )}
                            </Button>
                        </Tooltip>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 -mx-6 px-6">
                    <button
                        onClick={() => setActiveTab('collections')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'collections'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Archive className="w-5 h-5" />
                            <span>{t('sidebar.collectionsTab')}</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('favourites')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'favourites'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Heart className="w-5 h-5" />
                            <span>{t('sidebar.favouritesTab')}</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'collections' ? (
                    // EXISTING COLLECTIONS VIEW
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {t('sidebar.collectionsTitle')}
                            </h2>
                            <button
                                onClick={onCreateCollection}
                                className="text-accent-600 hover:text-accent-700 text-sm font-medium cursor-pointer"
                            >
                                + {t('sidebar.add')}
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
                                            selectedCollectionId ===
                                            collection.id
                                                ? 'bg-indigo-50 border-2 border-accent-500'
                                                : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                                        }`}
                                        onClick={() =>
                                            onSelectCollection(collection.id)
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {collection.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {collection.photoCount}{' '}
                                                    {t('sidebar.photos')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCollectionContextMenu(
                                                        e,
                                                        collection
                                                    );
                                                }}
                                                className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer"
                                                title={t('sidebar.moreOptions')}
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">
                                    {t('sidebar.noCollections')}
                                </p>
                                <button
                                    onClick={onCreateCollection}
                                    className="px-4 py-2 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-all cursor-pointer"
                                >
                                    {t('sidebar.createFirstCollection')}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    // FAVOURITES VIEW
                    <FavouritesView
                        sessions={favouriteSessions}
                        isLoading={favouritesLoading}
                        onSessionClick={handleSessionClick}
                    />
                )}
            </div>

            {/* Favourites Modal */}
            <FavouritesModal
                session={selectedSession}
                catalogueId={catalogueId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onPhotoClick={onFavouritePhotoClick}
            />

            {/* Context Menu */}
            {contextMenu && (
                <CatalogueContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onEdit={handleEdit}
                    onShare={copyPublicUrl}
                    onDelete={handleDelete}
                />
            )}

            {/* Edit Catalogue Modal */}
            <CatalogueFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                catalogueId={catalogueId}
            />

            {/* Password Modal */}
            <PasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                catalogueId={catalogueId}
                isProtected={catalogue.isProtected}
            />
        </aside>
    );
}
