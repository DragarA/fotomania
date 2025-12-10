import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { useAddFavouritesMutation } from '../../../../hooks/useClientSessions';
import {
  saveFavouritesSchema,
  SaveFavouritesFormValues,
} from '../../utils/favourites-validation';

const CLIENT_SESSION_EMAIL_KEY = 'fotomania_client_session_email';

interface SaveFavouritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  favoriteIds: string[];
  favoritesCount: number;
  onSuccess: (email: string) => void;
}

export function SaveFavouritesModal({
  isOpen,
  onClose,
  slug,
  favoriteIds,
  favoritesCount,
  onSuccess,
}: SaveFavouritesModalProps) {
  const addFavouritesMutation = useAddFavouritesMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<SaveFavouritesFormValues>({
    resolver: zodResolver(saveFavouritesSchema),
    defaultValues: {
      email: '',
    },
  });

  // Load cached email from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const cachedEmail = localStorage.getItem(CLIENT_SESSION_EMAIL_KEY);
      if (cachedEmail) {
        setValue('email', cachedEmail);
      }
    }
  }, [isOpen, setValue]);

  const onSubmit = async (data: SaveFavouritesFormValues) => {
    try {
      const response = await addFavouritesMutation.mutateAsync({
        slug,
        data: {
          email: data.email,
          photoIds: favoriteIds,
        },
      });

      // Cache email for future use
      if (response.clientSessionEmail) {
        localStorage.setItem(
          CLIENT_SESSION_EMAIL_KEY,
          response.clientSessionEmail
        );
      }

      // Call success handler
      onSuccess(data.email);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save favourites. Please try again.');
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
            <DialogTitle>Save Your Favorites</DialogTitle>
            <DialogDescription>
              Enter your email to save {favoritesCount} favorite{' '}
              {favoritesCount === 1 ? 'photo' : 'photos'}. The photographer will
              be able to see which photos you selected.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-hidden transition-colors ${
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-200 focus:border-accent-500 focus:ring-accent-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                'Save Favorites'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
