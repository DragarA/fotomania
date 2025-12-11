import { toast } from 'sonner';
import { CatalogueForm } from './CatalogueForm';
import {
  useCreateCatalogueMutation,
  useUpdateCatalogueMutation,
  useCatalogueQuery,
} from '../../hooks';
import type { CatalogueCreateFormValues } from '../../utils/validation';

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
  const isEditMode = Boolean(catalogueId);
  const createMutation = useCreateCatalogueMutation();
  const updateMutation = useUpdateCatalogueMutation(catalogueId || '');
  const { data: catalogue, isLoading } = useCatalogueQuery(catalogueId || '', {
    enabled: isEditMode && isOpen,
  });

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
          toast.success('Catalogue updated successfully!');
          onSuccess?.(updatedCatalogue.id);
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update catalogue');
        },
      });
    } else {
      createMutation.mutate(values, {
        onSuccess: (newCatalogue) => {
          toast.success('Catalogue created successfully!');
          onSuccess?.(newCatalogue.id);
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to create catalogue');
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
              {isEditMode ? 'Edit Catalogue' : 'Create Catalogue'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode
                ? 'Update catalogue details and settings'
                : 'Share curated galleries with your clients'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              {mutation.error?.message || `Unable to ${isEditMode ? 'update' : 'create'} catalogue.`}
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
            submitLabel={isEditMode ? 'Save changes' : 'Create catalogue'}
            isSubmitting={mutation.isPending}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
