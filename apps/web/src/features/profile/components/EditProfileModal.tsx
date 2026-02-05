import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

import {
    useCurrentUserQuery,
    useRemoveLogoMutation,
    useUpdateUserMutation,
    useUploadLogoMutation,
    type UpdateUserDto,
} from '../hooks/useUser';

import { ProfileForm, type ProfileFormValues } from './ProfileForm';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function EditProfileModal({
    isOpen,
    onClose,
    onSuccess,
}: EditProfileModalProps) {
    const { t } = useTranslation('profile');
    const { data: user, isLoading } = useCurrentUserQuery();
    const updateMutation = useUpdateUserMutation();
    const uploadLogoMutation = useUploadLogoMutation();
    const removeLogoMutation = useRemoveLogoMutation();

    useBodyScrollLock(isOpen);

    if (!isOpen) return null;

    if (typeof document === 'undefined') return null;

    const handleSubmit = (values: ProfileFormValues) => {
        // Prepare the update payload, converting empty strings to null for optional fields
        const payload: UpdateUserDto = {
            name: values.name,
            businessName: values.businessName || null,
            businessAddress: values.businessAddress || null,
            businessPhone: values.businessPhone || null,
            businessEmail: values.businessEmail || null,
            businessWebsite: values.businessWebsite || null,
            businessDescription: values.businessDescription || null,
            brandColorMain: values.brandColorMain || null,
            brandColorAccent: values.brandColorAccent || null,
            preferredLanguage: values.preferredLanguage,
            collectClientName: values.collectClientName,
            collectClientAddress: values.collectClientAddress,
            collectClientPhone: values.collectClientPhone,
            collectClientNotes: values.collectClientNotes,
        };

        updateMutation.mutate(payload, {
            onSuccess: () => {
                toast.success(t('toast.updateSuccess'));
                onSuccess?.();
                onClose();
            },
            onError: (error) => {
                toast.error(error.message || t('toast.updateError'));
            },
        });
    };

    const handleUploadLogo = (file: File) => {
        uploadLogoMutation.mutate(file, {
            onSuccess: () => {
                toast.success(t('toast.logoUploadSuccess'));
            },
            onError: (error) => {
                toast.error(error.message || t('toast.logoUploadError'));
            },
        });
    };

    const handleRemoveLogo = () => {
        removeLogoMutation.mutate(undefined, {
            onSuccess: () => {
                toast.success(t('toast.logoRemoveSuccess'));
            },
            onError: (error) => {
                toast.error(error.message || t('toast.logoRemoveError'));
            },
        });
    };

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
                            {t('modal.subtitle')}
                        </p>
                        <h2 className="text-2xl font-light tracking-[0.02em] text-stone-800">
                            {t('modal.title')}
                        </h2>
                        <p className="text-sm text-stone-500">
                            {t('modal.description')}
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
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-10 w-10 animate-spin rounded-full border border-stone-200 border-t-stone-700" />
                        </div>
                    ) : updateMutation.isError ? (
                        <div className="mb-6 rounded border border-red-200 bg-red-50/80 px-4 py-3 text-sm uppercase tracking-[0.3em] text-red-700">
                            {updateMutation.error?.message ||
                                t('toast.updateError')}
                        </div>
                    ) : null}

                    {user && (
                        <ProfileForm
                            initialValues={user}
                            isSubmitting={updateMutation.isPending}
                            onSubmit={handleSubmit}
                            onUploadLogo={handleUploadLogo}
                            onRemoveLogo={handleRemoveLogo}
                            isUploadingLogo={uploadLogoMutation.isPending}
                            isRemovingLogo={removeLogoMutation.isPending}
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
