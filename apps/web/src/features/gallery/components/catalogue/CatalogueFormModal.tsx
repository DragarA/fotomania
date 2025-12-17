import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
    useCreateCatalogueMutation,
    useUpdateCatalogueMutation,
    useCatalogueQuery,
} from '../../hooks';
import type { CatalogueCreateFormValues } from '../../utils/validation';

import { CatalogueForm } from './CatalogueForm';

interface CatalogueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    catalogueId?: string;
    onSuccess?: (catalogueId: string) => void;
}

export function CatalogueFormModal({
    isOpen,
    onClose,
    catalogueId,
    onSuccess,
}: CatalogueFormModalProps) {
    const { t } = useTranslation('gallery');
    const isEditMode = Boolean(catalogueId);
    const createMutation = useCreateCatalogueMutation();
    const updateMutation = useUpdateCatalogueMutation(catalogueId || '');
    const { data: catalogue, isLoading } = useCatalogueQuery(
        catalogueId || '',
        {
            enabled: isEditMode && isOpen,
        }
    );

    if (!isOpen) return null;

    if (typeof document === 'undefined') return null;

    const handleSubmit = (values: CatalogueCreateFormValues) => {
        if (isEditMode && catalogueId) {
            const payload = {
                title: values.title,
                description: values.description || undefined,
            };

            updateMutation.mutate(payload, {
                onSuccess: (updatedCatalogue) => {
                    toast.success(t('catalogueForm.updateSuccess'));
                    onSuccess?.(updatedCatalogue.id);
                    onClose();
                },
                onError: (error) => {
                    toast.error(
                        error.message || t('catalogueForm.updateError')
                    );
                },
            });
        } else {
            createMutation.mutate(values, {
                onSuccess: (newCatalogue) => {
                    toast.success(t('catalogueForm.createSuccess'));
                    onSuccess?.(newCatalogue.id);
                    onClose();
                },
                onError: (error) => {
                    toast.error(
                        error.message || t('catalogueForm.createError')
                    );
                },
            });
        }
    };

    const mutation = isEditMode ? updateMutation : createMutation;

    return createPortal(
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(6,5,4,0.65)] px-4 py-6 backdrop-blur"
            onClick={onClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-white/15 bg-white/90 shadow-[0_65px_140px_-100px_rgba(0,0,0,0.95)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/5 px-8 py-6">
                    <div className="space-y-2">
                        <p className="text-[0.6rem] uppercase tracking-[0.45em] text-stone-400">
                            {t('catalogueForm.titleLabel')}
                        </p>
                        <h2 className="text-2xl font-light tracking-[0.02em] text-stone-800">
                            {isEditMode
                                ? t('catalogueForm.editTitle')
                                : t('catalogueForm.createTitle')}
                        </h2>
                        <p className="text-sm text-stone-500">
                            {isEditMode
                                ? t('catalogueForm.editSubtitle')
                                : t('catalogueForm.createSubtitle')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full border border-black/10 p-2 text-stone-400 transition hover:-translate-y-0.5 hover:text-stone-700"
                    >
                        <X className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {isEditMode && isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-10 w-10 animate-spin rounded-full border border-stone-200 border-t-stone-700" />
                        </div>
                    ) : mutation.isError ? (
                        <div className="mb-6 rounded border border-red-200 bg-red-50/80 px-4 py-3 text-sm uppercase tracking-[0.3em] text-red-700">
                            {mutation.error?.message ||
                                t(
                                    isEditMode
                                        ? 'catalogueForm.updateError'
                                        : 'catalogueForm.createError'
                                )}
                        </div>
                    ) : null}

                    <CatalogueForm
                        initialValues={
                            isEditMode && catalogue
                                ? {
                                      title: catalogue.title,
                                      description: catalogue.description ?? '',
                                  }
                                : undefined
                        }
                        submitLabel={
                            isEditMode
                                ? t('catalogueForm.saveChanges')
                                : t('catalogueForm.createButton')
                        }
                        isSubmitting={mutation.isPending}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}
