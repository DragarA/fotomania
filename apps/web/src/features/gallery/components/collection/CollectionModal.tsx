import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {mode === 'create' ? 'Create Collection' : 'Edit Collection'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2 cursor-pointer"
            >
              Collection Name
            </label>
            <input
              id="name"
              {...register('name')}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                errors.name
                  ? 'border-red-500'
                  : 'border-gray-200 focus:border-accent-500'
              }`}
              placeholder="Ceremony Photos"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-accent-500 text-white font-semibold py-2 rounded-lg hover:bg-accent-600 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create'
                  : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
