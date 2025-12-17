import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('public');
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
            toast.error(error.message || t('modal.save.error'));
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
            <DialogContent showCloseButton={!isSubmitting} className="bg-white/90 backdrop-blur border border-black/5">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-light tracking-[0.02em] text-stone-800">
                            {t('modal.save.title')}
                        </DialogTitle>
                        <DialogDescription className="text-stone-500">
                            {t('modal.save.description', {
                                count: favoritesCount,
                                photoText:
                                    t('modal.save.photo', { count: favoritesCount }),
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-2">
                        <label
                            htmlFor="email"
                            className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        >
                            {t('modal.save.emailLabel')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            disabled={isSubmitting}
                            className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                                errors.email
                                    ? 'border-red-400 focus:ring-red-200'
                                    : 'border-black/10 focus:ring-stone-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            placeholder={t('modal.save.emailPlaceholder')}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-xs uppercase tracking-[0.4em] text-stone-400 transition hover:text-stone-700 disabled:opacity-40"
                        >
                            {t('modal.save.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded border border-black/10 bg-stone-900 px-6 py-3 text-[0.65rem] uppercase tracking-[0.4em] text-white transition duration-500 hover:-translate-y-0.5 disabled:opacity-40"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border border-white/40 border-t-white" />
                                    {t('modal.save.saving')}
                                </>
                            ) : (
                                t('modal.save.submit')
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
