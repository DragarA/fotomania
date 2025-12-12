import { useEffect, useState } from 'react';

import type { Collection, Photo } from '../types';

interface ModalState {
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialData?: any;
}

interface ContextMenuState {
    x: number;
    y: number;
    collection: any;
}

export function useCatalogueDetailState(collections: Collection[] | undefined) {
    const [selectedCollectionId, setSelectedCollectionId] = useState<
        string | null
    >(null);
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        mode: 'create',
    });
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [collectionContextMenu, setCollectionContextMenu] =
        useState<ContextMenuState | null>(null);

    // Auto-select first collection when collections load
    useEffect(() => {
        if (collections && collections.length > 0 && !selectedCollectionId) {
            setSelectedCollectionId(collections[0]!.id);
        }
    }, [collections, selectedCollectionId]);

    const selectedCollection = collections?.find(
        (c) => c.id === selectedCollectionId
    );

    const openCreateModal = () => {
        setModalState({ isOpen: true, mode: 'create' });
    };

    const openEditModal = (collection: any) => {
        setModalState({
            isOpen: true,
            mode: 'edit',
            initialData: collection,
        });
    };

    const closeModal = (createdCollectionId?: string) => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        // Switch to the newly created collection
        if (createdCollectionId && modalState.mode === 'create') {
            setSelectedCollectionId(createdCollectionId);
        }
    };

    const openContextMenu = (x: number, y: number, collection: any) => {
        setCollectionContextMenu({ x, y, collection });
    };

    const closeContextMenu = () => {
        setCollectionContextMenu(null);
    };

    const clearSelectedCollectionIfDeleted = (deletedCollectionId: string) => {
        if (selectedCollectionId === deletedCollectionId) {
            setSelectedCollectionId(null);
        }
    };

    return {
        // Collection selection
        selectedCollectionId,
        setSelectedCollectionId,
        selectedCollection,
        clearSelectedCollectionIfDeleted,

        // Modal state
        modalState,
        openCreateModal,
        openEditModal,
        closeModal,

        // Context menu
        collectionContextMenu,
        openContextMenu,
        closeContextMenu,

        // Photo lightbox
        selectedPhoto,
        setSelectedPhoto,
    };
}
