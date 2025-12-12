import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../../components/ui/dialog';
import {
    useCreateCollectionMutation,
    useUpdateCollectionMutation,
} from '../../hooks';
import {
    collectionFormSchema,
    type CollectionFormValues,
} from '../../utils/validation';

interface CollectionModalProps {
    isOpen: boolean;
    onClose: (createdCollectionId?: string) => void;
    mode: 'create' | 'edit';
    catalogueId: string;
    initialData?: {
        id: string;
        name: string;
        catalogueId: string;
    };
}

export function CollectionModal({
    isOpen,
    onClose,
    mode,
    catalogueId,
    initialData,
}: CollectionModalProps) {
    const { t } = useTranslation('gallery');
    const createMutation = useCreateCollectionMutation();
    const updateMutation = useUpdateCollectionMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<CollectionFormValues>({
        resolver: zodResolver(collectionFormSchema),
        defaultValues: {
            name: initialData?.name || '',
            catalogueId,
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                name: initialData?.name || '',
                catalogueId,
            });
        }
    }, [isOpen, initialData, catalogueId, reset]);

    const onSubmit = (values: CollectionFormValues) => {
        if (mode === 'create') {
            createMutation.mutate(values, {
                onSuccess: (data) => {
                    onClose(data.id);
                    reset();
                },
            });
        } else if (initialData) {
            updateMutation.mutate(
                { id: initialData.id, data: values },
                {
                    onSuccess: () => {
                        onClose();
                        reset();
                    },
                }
            );
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            reset();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent showCloseButton={!isSubmitting}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === 'create'
                                ? t('collection.createTitle')
                                : t('collection.editTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === 'create'
                                ? t('collection.createDescription')
                                : t('collection.editDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            {t('collection.nameLabel')}
                        </label>
                        <input
                            id="name"
                            {...register('name')}
                            disabled={isSubmitting}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-hidden transition-colors ${
                                errors.name
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-200 focus:border-accent-500 focus:ring-accent-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            placeholder={t('collection.namePlaceholder')}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('collection.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    {mode === 'create'
                                        ? t('collection.creating')
                                        : t('collection.saving')}
                                </>
                            ) : mode === 'create' ? (
                                t('collection.create')
                            ) : (
                                t('collection.save')
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
