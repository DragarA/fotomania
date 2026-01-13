import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { SUPPORTED_LANGUAGES } from '../constants';
import type { User } from '../hooks/useUser';

const profileFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    businessName: z.string().max(255, 'Business name is too long').optional().or(z.literal('')),
    businessAddress: z.string().max(500, 'Business address is too long').optional().or(z.literal('')),
    businessPhone: z.string().max(50, 'Business phone is too long').optional().or(z.literal('')),
    businessEmail: z
        .string()
        .email('Invalid email format')
        .max(255, 'Business email is too long')
        .optional()
        .or(z.literal('')),
    businessWebsite: z
        .string()
        .url('Invalid URL format')
        .max(500, 'Business website URL is too long')
        .optional()
        .or(z.literal('')),
    businessDescription: z.string().max(2000, 'Business description is too long').optional().or(z.literal('')),
    preferredLanguage: z.enum(['en', 'sl']),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
    initialValues: Partial<User>;
    isSubmitting: boolean;
    onSubmit: (values: ProfileFormValues) => void;
}

export function ProfileForm({ initialValues, isSubmitting, onSubmit }: ProfileFormProps) {
    const { t } = useTranslation('profile');
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: initialValues.name || '',
            businessName: initialValues.businessName || '',
            businessAddress: initialValues.businessAddress || '',
            businessPhone: initialValues.businessPhone || '',
            businessEmail: initialValues.businessEmail || '',
            businessWebsite: initialValues.businessWebsite || '',
            businessDescription: initialValues.businessDescription || '',
            preferredLanguage: (initialValues.preferredLanguage as 'en' | 'sl') || 'en',
        },
    });

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Personal Information Section */}
            <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.3em] text-stone-500">
                    {t('form.personalInfo')}
                </h3>

                {/* Name Field */}
                <div className="space-y-2">
                    <label
                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        htmlFor="name"
                    >
                        {t('form.name')}
                    </label>
                    <input
                        id="name"
                        {...register('name')}
                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                            errors.name ? 'border-red-400 focus:ring-red-200' : 'border-black/10'
                        }`}
                        placeholder={t('form.namePlaceholder')}
                    />
                    {errors.name && (
                        <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Preferred Language Field */}
                <div className="space-y-2">
                    <label
                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        htmlFor="preferredLanguage"
                    >
                        {t('form.preferredLanguage')}
                    </label>
                    <select
                        id="preferredLanguage"
                        {...register('preferredLanguage')}
                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                            errors.preferredLanguage ? 'border-red-400 focus:ring-red-200' : 'border-black/10'
                        }`}
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                    {errors.preferredLanguage && (
                        <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                            {errors.preferredLanguage.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Business Information Section */}
            <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.3em] text-stone-500">
                    {t('form.businessInfo')}
                </h3>

                {/* Business Name Field */}
                <div className="space-y-2">
                    <label
                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        htmlFor="businessName"
                    >
                        {t('form.businessName')}
                    </label>
                    <input
                        id="businessName"
                        {...register('businessName')}
                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                            errors.businessName ? 'border-red-400 focus:ring-red-200' : 'border-black/10'
                        }`}
                        placeholder={t('form.businessNamePlaceholder')}
                    />
                    {errors.businessName && (
                        <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                            {errors.businessName.message}
                        </p>
                    )}
                </div>

                {/* Business Email Field */}
                <div className="space-y-2">
                    <label
                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        htmlFor="businessEmail"
                    >
                        {t('form.businessEmail')}
                    </label>
                    <input
                        id="businessEmail"
                        type="email"
                        {...register('businessEmail')}
                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                            errors.businessEmail ? 'border-red-400 focus:ring-red-200' : 'border-black/10'
                        }`}
                        placeholder={t('form.businessEmailPlaceholder')}
                    />
                    {errors.businessEmail && (
                        <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                            {errors.businessEmail.message}
                        </p>
                    )}
                </div>

                {/* Business Phone Field */}
                <div className="space-y-2">
                    <label
                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        htmlFor="businessPhone"
                    >
                        {t('form.businessPhone')}
                    </label>
                    <input
                        id="businessPhone"
                        type="tel"
                        {...register('businessPhone')}
                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                            errors.businessPhone ? 'border-red-400 focus:ring-red-200' : 'border-black/10'
                        }`}
                        placeholder={t('form.businessPhonePlaceholder')}
                    />
                    {errors.businessPhone && (
                        <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                            {errors.businessPhone.message}
                        </p>
                    )}
                </div>

                {/* Business Address Field */}
                <div className="space-y-2">
                    <label
                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        htmlFor="businessAddress"
                    >
                        {t('form.businessAddress')}
                    </label>
                    <input
                        id="businessAddress"
                        {...register('businessAddress')}
                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                            errors.businessAddress ? 'border-red-400 focus:ring-red-200' : 'border-black/10'
                        }`}
                        placeholder={t('form.businessAddressPlaceholder')}
                    />
                    {errors.businessAddress && (
                        <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                            {errors.businessAddress.message}
                        </p>
                    )}
                </div>

                {/* Business Website Field */}
                <div className="space-y-2">
                    <label
                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        htmlFor="businessWebsite"
                    >
                        {t('form.businessWebsite')}
                    </label>
                    <input
                        id="businessWebsite"
                        type="url"
                        {...register('businessWebsite')}
                        className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                            errors.businessWebsite ? 'border-red-400 focus:ring-red-200' : 'border-black/10'
                        }`}
                        placeholder={t('form.businessWebsitePlaceholder')}
                    />
                    {errors.businessWebsite && (
                        <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                            {errors.businessWebsite.message}
                        </p>
                    )}
                </div>

                {/* Business Description Field */}
                <div className="space-y-2">
                    <label
                        className="text-xs uppercase tracking-[0.4em] text-stone-400"
                        htmlFor="businessDescription"
                    >
                        {t('form.businessDescription')}
                    </label>
                    <textarea
                        id="businessDescription"
                        {...register('businessDescription')}
                        className={`min-h-[100px] w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                            errors.businessDescription
                                ? 'border-red-400 focus:ring-red-200'
                                : 'border-black/10'
                        }`}
                        placeholder={t('form.businessDescriptionPlaceholder')}
                    />
                    {errors.businessDescription && (
                        <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                            {errors.businessDescription.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="w-full rounded border border-black/10 bg-stone-900 px-6 py-3 text-[0.65rem] uppercase tracking-[0.4em] text-white transition duration-500 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isSubmitting ? t('form.saving') : t('form.saveChanges')}
            </button>
        </form>
    );
}

