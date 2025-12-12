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

    const handleSubmit = (values: CatalogueCreateFormValues) => {
        if (isEditMode && catalogueId) {
            const payload = {
                title: values.title,
                description: values.description || undefined,
                password: values.password || undefined,
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

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEditMode
                                ? t('catalogueForm.editTitle')
                                : t('catalogueForm.createTitle')}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode
                                ? t('catalogueForm.editSubtitle')
                                : t('catalogueForm.createSubtitle')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isEditMode && isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : mutation.isError ? (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
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
                                      password: catalogue.password ?? '',
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
        </div>
    );
}
