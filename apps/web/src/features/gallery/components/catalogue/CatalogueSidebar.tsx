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
    Package,
    Share,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
    const contextMenuTimer = useRef<number | null>(null);

    const cancelContextMenuClose = () => {
        if (contextMenuTimer.current !== null) {
            window.clearTimeout(contextMenuTimer.current);
            contextMenuTimer.current = null;
        }
    };

    useEffect(() => {
        return () => cancelContextMenuClose();
    }, []);

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
        cancelContextMenuClose();
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
        <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded border border-white/20 bg-white/80 shadow-[0_45px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur-md lg:w-80 lg:min-w-[280px]">
            {/* Header with catalogue info and actions */}
            <div className="space-y-4 border-b border-black/5 px-5 py-6">
                <div className="flex items-start justify-between gap-2">
                    <Link
                        to="/catalogues"
                        className="shrink-0 text-stone-400 transition-colors duration-500 hover:text-stone-700"
                    >
                        <ChevronLeft className="h-7 w-7" strokeWidth={1.5} />
                    </Link>
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-stone-400">
                            {t('sidebar.collectionsTab')}
                        </p>
                        <h1 className="text-xl font-light leading-snug tracking-[0.02em] text-stone-800">
                            {catalogue.title}
                        </h1>
                        {catalogue.description && (
                            <p className="line-clamp-2 text-sm text-stone-500">
                                {catalogue.description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleContextMenu}
                        className="shrink-0 rounded-full border border-black/5 p-2 text-stone-400 transition-all duration-500 hover:-translate-y-0.5 hover:text-stone-700"
                        title={t('sidebar.moreOptions')}
                    >
                        <MoreVertical className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Status Button */}
                <button
                    onClick={toggleStatus}
                    disabled={updateStatusMutation.isPending}
                    className={`flex h-12 w-full items-center justify-center rounded border border-black/5 text-xs uppercase tracking-[0.2em] transition-all duration-500 ${
                        catalogue.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                    }`}
                >
                    {catalogue.status === 'draft' ? (
                        <>
                            <EyeOff
                                className="mr-2 h-4 w-4 shrink-0"
                                strokeWidth={1.5}
                            />
                            <span className="truncate">
                                {t('sidebar.draft')}
                            </span>
                        </>
                    ) : (
                        <>
                            <Eye
                                className="mr-2 h-4 w-4 shrink-0"
                                strokeWidth={1.5}
                            />
                            <span className="truncate">
                                {t('sidebar.published')}
                            </span>
                        </>
                    )}
                </button>

                {/* Action buttons for published catalogues */}
                {catalogue.status === 'published' && (
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            onClick={copyPublicUrl}
                            variant="outline"
                            size="sm"
                            className="justify-center tracking-[0.1em]"
                        >
                            <Share className="h-4 w-4 shrink-0" strokeWidth={1.5} />
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
                                className="justify-center tracking-[0.1em]"
                            >
                                {catalogue.isProtected ? (
                                    <Lock className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                                ) : (
                                    <LockOpen className="h-4 w-4 shrink-0" strokeWidth={1.5} />
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
                <div className="flex gap-2">
                    {[
                        {
                            id: 'collections',
                            label: t('sidebar.collectionsTab'),
                            icon: Archive,
                        },
                        {
                            id: 'favourites',
                            label: t('sidebar.favouritesTab'),
                            icon: Heart,
                        },
                    ].map(({ id, label, icon: Icon }) => {
                        const active = activeTab === id;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id as TabType)}
                                className={`flex-1 min-w-0 rounded border border-transparent px-2 py-2.5 text-[0.65rem] uppercase tracking-[0.15em] transition-all duration-500 ${
                                    active
                                        ? 'border-black/10 bg-stone-100 text-stone-800'
                                        : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <Icon
                                        className="h-4 w-4 shrink-0"
                                        strokeWidth={1.5}
                                    />
                                    <span className="truncate">{label}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-5">
                {activeTab === 'collections' ? (
                    // EXISTING COLLECTIONS VIEW
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm uppercase tracking-[0.3em] text-stone-500">
                                {t('sidebar.collectionsTitle')}
                            </h2>
                            <button
                                onClick={onCreateCollection}
                                className="text-[0.6rem] uppercase tracking-[0.4em] text-stone-400 transition-colors duration-500 hover:text-stone-700"
                            >
                                + {t('sidebar.add')}
                            </button>
                        </div>

                        {collectionsLoading ? (
                            <div className="text-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border border-stone-200 border-t-stone-700 mx-auto"></div>
                            </div>
                        ) : collections && collections.length > 0 ? (
                            <div className="space-y-2">
                                {collections.map((collection) => {
                                    const isDelivery =
                                        collection.type === 'delivery';
                                    return (
                                        <div
                                            key={collection.id}
                                            className={`p-3.5 rounded border cursor-pointer transition-all duration-500 group ${
                                                selectedCollectionId ===
                                                collection.id
                                                    ? 'border-black/10 bg-white shadow-sm'
                                                    : isDelivery
                                                      ? 'border-transparent bg-amber-50 hover:border-amber-200'
                                                      : 'border-transparent bg-stone-50 hover:border-black/10'
                                            }`}
                                            onClick={() =>
                                                onSelectCollection(collection.id)
                                            }
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {isDelivery && (
                                                            <Package
                                                                className="h-4 w-4 shrink-0 text-amber-600"
                                                                strokeWidth={1.5}
                                                            />
                                                        )}
                                                        <p className="truncate font-medium text-stone-900">
                                                            {isDelivery ? collection.name.replace('Delivery', t('collection.delivery_collection_name')) : collection.name}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-stone-500">
                                                        {collection.photoCount}{' '}
                                                        {t('sidebar.photos')}
                                                        {isDelivery &&
                                                            collection.clientEmail && (
                                                                <span className="ml-1">
                                                                    •{' '}
                                                                    {String(
                                                                        collection.clientEmail
                                                                    )}
                                                                </span>
                                                            )}
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
                                                    className="shrink-0 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                                                    title={t('sidebar.moreOptions')}
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 space-y-4">
                                <p className="text-stone-400 text-sm">
                                    {t('sidebar.noCollections')}
                                </p>
                                <Button
                                    onClick={onCreateCollection}
                                    size="sm"
                                    className="tracking-[0.15em]"
                                >
                                    {t('sidebar.createFirstCollection')}
                                </Button>
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
                onDeliveryCreated={() => setActiveTab('collections')}
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
