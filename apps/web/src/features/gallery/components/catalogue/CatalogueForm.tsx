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
            password: '',
            ...initialValues,
        },
    });

    return (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Title Field */}
            <div>
                <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="title"
                >
                    {t('catalogueForm.titleLabel')}
                </label>
                <input
                    id="title"
                    {...register('title')}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.title
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-accent-500'
                    }`}
                    placeholder={t('catalogueForm.titlePlaceholder')}
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                    </p>
                )}
            </div>

            {/* Description Field */}
            <div>
                <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="description"
                >
                    {t('catalogueForm.descriptionLabel')}
                </label>
                <textarea
                    id="description"
                    {...register('description')}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors min-h-[120px] ${
                        errors.description
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-accent-500'
                    }`}
                    placeholder={t('catalogueForm.descriptionPlaceholder')}
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                    </p>
                )}
            </div>

            {/* Password Field */}
            <div>
                <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="password"
                >
                    {t('catalogueForm.passwordLabel')}
                </label>
                <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        errors.password
                            ? 'border-red-500'
                            : 'border-gray-200 focus:border-accent-500'
                    }`}
                    placeholder={t('catalogueForm.passwordPlaceholder')}
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="w-full bg-accent-500 text-white font-semibold py-3 rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? `${submitLabel}...` : submitLabel}
            </button>
        </form>
    );
}
