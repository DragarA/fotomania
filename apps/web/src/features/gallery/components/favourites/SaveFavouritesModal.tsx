import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast } from 'sonner';
import { z } from 'zod';

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
    createSaveFavouritesSchema,
    type CollectionSettings,
    type ValidationMessages,
} from '../../utils/favourites-validation';

const CLIENT_SESSION_EMAIL_KEY = 'fotomania_client_session_email';

// Common countries list
const COUNTRIES = [
    { value: 'SI', label: 'Slovenia' },
    { value: 'AT', label: 'Austria' },
    { value: 'HR', label: 'Croatia' },
    { value: 'IT', label: 'Italy' },
    { value: 'DE', label: 'Germany' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'FR', label: 'France' },
    { value: 'ES', label: 'Spain' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'BE', label: 'Belgium' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'CZ', label: 'Czech Republic' },
    { value: 'PL', label: 'Poland' },
    { value: 'HU', label: 'Hungary' },
    { value: 'SK', label: 'Slovakia' },
];

interface SaveFavouritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    slug: string;
    favoriteIds: string[];
    favoritesCount: number;
    onSuccess: (email: string) => void;
    collectionSettings: CollectionSettings;
}

export function SaveFavouritesModal({
    isOpen,
    onClose,
    slug,
    favoriteIds,
    favoritesCount,
    onSuccess,
    collectionSettings,
}: SaveFavouritesModalProps) {
    const { t } = useTranslation('public');
    const addFavouritesMutation = useAddFavouritesMutation();

    // Create validation messages from translations
    const validationMessages: ValidationMessages = useMemo(
        () => ({
            emailRequired: t('modal.save.validation.emailRequired'),
            emailInvalid: t('modal.save.validation.emailInvalid'),
            nameRequired: t('modal.save.validation.nameRequired'),
            streetRequired: t('modal.save.validation.streetRequired'),
            cityRequired: t('modal.save.validation.cityRequired'),
            postalCodeRequired: t('modal.save.validation.postalCodeRequired'),
            countryRequired: t('modal.save.validation.countryRequired'),
            phoneRequired: t('modal.save.validation.phoneRequired'),
        }),
        [t]
    );

    // Create dynamic schema based on collection settings
    const schema = useMemo(
        () => createSaveFavouritesSchema(collectionSettings, validationMessages),
        [collectionSettings, validationMessages]
    );

    type FormValues = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: '',
            clientName: '',
            clientAddressStreet: '',
            clientAddressCity: '',
            clientAddressPostalCode: '',
            clientAddressCountry: '',
            clientPhoneNumber: '',
            clientNotes: '',
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

    const onSubmit = async (data: FormValues) => {
        try {
            const response = await addFavouritesMutation.mutateAsync({
                slug,
                data: {
                    email: data.email,
                    photoIds: favoriteIds,
                    clientName: data.clientName,
                    clientAddressStreet: data.clientAddressStreet,
                    clientAddressCity: data.clientAddressCity,
                    clientAddressPostalCode: data.clientAddressPostalCode,
                    clientAddressCountry: data.clientAddressCountry,
                    clientPhoneNumber: data.clientPhoneNumber,
                    clientNotes: data.clientNotes,
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
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : t('modal.save.error');
            toast.error(message);
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

                    <div className="py-4 space-y-4">
                        {/* Email Field */}
                        <div className="space-y-2">
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

                        {/* Client Name Field */}
                        {collectionSettings.collectClientName && (
                            <div className="space-y-2">
                                <label
                                    htmlFor="clientName"
                                    className="text-xs uppercase tracking-[0.4em] text-stone-400"
                                >
                                    {t('modal.save.nameLabel')}
                                </label>
                                <input
                                    id="clientName"
                                    type="text"
                                    {...register('clientName')}
                                    disabled={isSubmitting}
                                    className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                                        errors.clientName
                                            ? 'border-red-400 focus:ring-red-200'
                                            : 'border-black/10 focus:ring-stone-300'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    placeholder={t('modal.save.namePlaceholder')}
                                />
                                {errors.clientName && (
                                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-red-500">
                                        {errors.clientName.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Client Phone Field */}
                        {collectionSettings.collectClientPhone && (
                            <div className="space-y-2">
                                <label
                                    htmlFor="clientPhoneNumber"
                                    className="text-xs uppercase tracking-[0.4em] text-stone-400"
                                >
                                    {t('modal.save.phoneLabel')}
                                </label>
                                <Controller
                                    name="clientPhoneNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <PhoneInput
                                            {...field}
                                            id="clientPhoneNumber"
                                            defaultCountry="SI"
                                            disabled={isSubmitting}
                                            className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-stone-300 ${
                                                errors.clientPhoneNumber
                                                    ? 'border-red-400 focus-within:ring-red-200'
                                                    : 'border-black/10 focus-within:ring-stone-300'
                                            } disabled:opacity-50 disabled:cursor-not-allowed [&>input]:w-full [&>input]:border-0 [&>input]:bg-transparent [&>input]:outline-none [&>input]:text-sm`}
                                        />
                                    )}
                                />
                                {errors.clientPhoneNumber && (
                                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-red-500">
                                        {errors.clientPhoneNumber.message}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Client Address Fields */}
                        {collectionSettings.collectClientAddress && (
                            <div className="space-y-4">
                                {/* Street */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="clientAddressStreet"
                                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                                    >
                                        {t('modal.save.streetLabel')}
                                    </label>
                                    <input
                                        id="clientAddressStreet"
                                        type="text"
                                        {...register('clientAddressStreet')}
                                        disabled={isSubmitting}
                                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                                            errors.clientAddressStreet
                                                ? 'border-red-400 focus:ring-red-200'
                                                : 'border-black/10 focus:ring-stone-300'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder={t('modal.save.streetPlaceholder')}
                                    />
                                    {errors.clientAddressStreet && (
                                        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-red-500">
                                            {errors.clientAddressStreet.message}
                                        </p>
                                    )}
                                </div>

                                {/* City */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="clientAddressCity"
                                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                                    >
                                        {t('modal.save.cityLabel')}
                                    </label>
                                    <input
                                        id="clientAddressCity"
                                        type="text"
                                        {...register('clientAddressCity')}
                                        disabled={isSubmitting}
                                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                                            errors.clientAddressCity
                                                ? 'border-red-400 focus:ring-red-200'
                                                : 'border-black/10 focus:ring-stone-300'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder={t('modal.save.cityPlaceholder')}
                                    />
                                    {errors.clientAddressCity && (
                                        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-red-500">
                                            {errors.clientAddressCity.message}
                                        </p>
                                    )}
                                </div>

                                {/* Postal Code */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="clientAddressPostalCode"
                                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                                    >
                                        {t('modal.save.postalCodeLabel')}
                                    </label>
                                    <input
                                        id="clientAddressPostalCode"
                                        type="text"
                                        {...register('clientAddressPostalCode')}
                                        disabled={isSubmitting}
                                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                                            errors.clientAddressPostalCode
                                                ? 'border-red-400 focus:ring-red-200'
                                                : 'border-black/10 focus:ring-stone-300'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder={t('modal.save.postalCodePlaceholder')}
                                    />
                                    {errors.clientAddressPostalCode && (
                                        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-red-500">
                                            {errors.clientAddressPostalCode.message}
                                        </p>
                                    )}
                                </div>

                                {/* Country */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="clientAddressCountry"
                                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                                    >
                                        {t('modal.save.countryLabel')}
                                    </label>
                                    <select
                                        id="clientAddressCountry"
                                        {...register('clientAddressCountry')}
                                        disabled={isSubmitting}
                                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                                            errors.clientAddressCountry
                                                ? 'border-red-400 focus:ring-red-200'
                                                : 'border-black/10 focus:ring-stone-300'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <option value="">
                                            {t('modal.save.countryPlaceholder')}
                                        </option>
                                        {COUNTRIES.map((country) => (
                                            <option key={country.value} value={country.value}>
                                                {country.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.clientAddressCountry && (
                                        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-red-500">
                                            {errors.clientAddressCountry.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Client Notes Field */}
                        {collectionSettings.collectClientNotes && (
                            <div className="space-y-2">
                                <label
                                    htmlFor="clientNotes"
                                    className="text-xs uppercase tracking-[0.4em] text-stone-400"
                                >
                                    {t('modal.save.notesLabel')}
                                </label>
                                <textarea
                                    id="clientNotes"
                                    {...register('clientNotes')}
                                    disabled={isSubmitting}
                                    rows={3}
                                    className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                                        errors.clientNotes
                                            ? 'border-red-400 focus:ring-red-200'
                                            : 'border-black/10 focus:ring-stone-300'
                                    } disabled:opacity-50 disabled:cursor-not-allowed resize-none`}
                                    placeholder={t('modal.save.notesPlaceholder')}
                                />
                                {errors.clientNotes && (
                                    <p className="mt-1 text-xs uppercase tracking-[0.3em] text-red-500">
                                        {errors.clientNotes.message}
                                    </p>
                                )}
                            </div>
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
