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
import { Collection } from '../../types';
import {
    collectionFormSchema,
    type CollectionFormValues,
} from '../../utils/validation';

interface CollectionModalProps {
    isOpen: boolean;
    onClose: (createdCollectionId?: string) => void;
    mode: 'create' | 'edit';
    catalogueId: string;
    initialData?: Collection;
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
            <DialogContent
                showCloseButton={!isSubmitting}
                className="border border-black/5 bg-white/90 backdrop-blur"
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-light tracking-[0.02em] text-stone-800">
                            {mode === 'create'
                                ? t('collection.createTitle')
                                : t('collection.editTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-stone-500">
                            {mode === 'create'
                                ? t('collection.createDescription')
                                : t('collection.editDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-2">
                        <label
                            htmlFor="name"
                            className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        >
                            {t('collection.nameLabel')}
                        </label>
                        <input
                            id="name"
                            {...register('name')}
                            disabled={isSubmitting}
                            className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                                errors.name
                                    ? 'border-red-400 focus:ring-red-200'
                                    : 'border-black/10'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            placeholder={t('collection.namePlaceholder')}
                        />
                        {errors.name && (
                            <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-[0.65rem] uppercase tracking-[0.4em] text-stone-400 transition hover:text-stone-800 disabled:opacity-40"
                        >
                            {t('collection.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded border border-black/10 bg-stone-900 px-6 py-3 text-[0.65rem] uppercase tracking-[0.4em] text-white transition duration-500 hover:-translate-y-0.5 disabled:opacity-40"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border border-white/40 border-t-white" />
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
