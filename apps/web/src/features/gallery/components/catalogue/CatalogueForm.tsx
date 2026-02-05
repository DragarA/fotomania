import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
    catalogueCreateFormSchema,
    CatalogueCreateFormValues,
    type CatalogueFormValues,
} from '../../utils/validation';

interface CatalogueFormProps {
    initialValues?: Partial<CatalogueFormValues>;
    submitLabel: string;
    isSubmitting: boolean;
    onSubmit: (values: CatalogueCreateFormValues) => void;
}

export function CatalogueForm({
    initialValues,
    submitLabel,
    isSubmitting,
    onSubmit,
}: CatalogueFormProps) {
    const { t } = useTranslation('gallery');
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
    } = useForm<CatalogueCreateFormValues>({
        resolver: zodResolver(catalogueCreateFormSchema),
        defaultValues: {
            title: '',
            description: '',
            ...initialValues,
        },
    });

    return (
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Title Field */}
            <div className="space-y-2">
                <label
                    className="text-xs uppercase tracking-[0.4em] text-stone-400"
                    htmlFor="title"
                >
                    {t('catalogueForm.titleLabel')}
                </label>
                <input
                    id="title"
                    {...register('title')}
                    className={`w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                        errors.title
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-black/10'
                    }`}
                    placeholder={t('catalogueForm.titlePlaceholder')}
                />
                {errors.title && (
                    <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                        {errors.title.message}
                    </p>
                )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
                <label
                    className="text-xs uppercase tracking-[0.4em] text-stone-400"
                    htmlFor="description"
                >
                    {t('catalogueForm.descriptionLabel')}
                </label>
                <textarea
                    id="description"
                    {...register('description')}
                    className={`min-h-[140px] w-full rounded border bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-300 ${
                        errors.description
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-black/10'
                    }`}
                    placeholder={t('catalogueForm.descriptionPlaceholder')}
                />
                {errors.description && (
                    <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                        {errors.description.message}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="w-full rounded border border-black/10 bg-stone-900 px-6 py-3 text-[0.65rem] uppercase tracking-[0.4em] text-white transition duration-500 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isSubmitting ? `${submitLabel}...` : submitLabel}
            </button>
        </form>
    );
}
