import { Link } from '@tanstack/react-router';
import {
    Building2,
    CheckCircle,
    Folder,
    Globe,
    IdCard,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Settings,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { ProfileInfoCard } from '@/components/ui/ProfileInfoCard';

import { EditProfileModal } from '../profile/components/EditProfileModal';
import { useCurrentUserQuery } from '../profile/hooks/useUser';

export function ProfilePage() {
    const { t } = useTranslation('profile');
    const { data: user, isLoading, error } = useCurrentUserQuery();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-100">
                <div className="h-10 w-10 animate-spin rounded-full border border-stone-200 border-t-stone-700" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-100">
                <div className="text-center">
                    <p className="text-sm text-stone-500">{t('error.loadFailed')}</p>
                </div>
            </div>
        );
    }

    const hasBusinessInfo =
        user.businessName ||
        user.businessEmail ||
        user.businessPhone ||
        user.businessAddress ||
        user.businessWebsite ||
        user.businessDescription;

    return (
        <div className="min-h-screen bg-stone-100 px-6 py-10 sm:px-10">
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header Card */}
                <div className="rounded-lg border border-black/5 bg-white p-8 shadow-sm sm:p-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-stone-100 text-2xl font-light text-stone-600">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-stone-400">
                                    {t('title')}
                                </p>
                                <h1 className="text-2xl font-light tracking-[0.02em] text-stone-800 sm:text-3xl">
                                    {user.name || t('user')}
                                </h1>
                                <p className="mt-1 text-sm text-stone-500">
                                    {user.email || t('noEmail')}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditModalOpen(true)}
                            className="gap-2"
                        >
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            <span className="hidden sm:inline">{t('editProfile')}</span>
                        </Button>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-stone-500">
                        {t('accountDetails')}
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ProfileInfoCard
                            icon={<User />}
                            label={t('fullName')}
                        >
                            <p className="text-sm font-medium">
                                {user.name || t('notProvided')}
                            </p>
                        </ProfileInfoCard>

                        <ProfileInfoCard
                            icon={<Mail />}
                            label={t('emailAddress')}
                        >
                            <p className="text-sm font-medium">
                                {user.email || t('notProvided')}
                            </p>
                        </ProfileInfoCard>

                        <ProfileInfoCard
                            icon={<CheckCircle />}
                            label={t('emailVerification')}
                        >
                            <span
                                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase tracking-[0.1em] ${
                                    user.emailVerified
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-amber-50 text-amber-700'
                                }`}
                            >
                                {user.emailVerified
                                    ? t('verified')
                                    : t('notVerified')}
                            </span>
                        </ProfileInfoCard>

                        <ProfileInfoCard
                            icon={<Globe />}
                            label={t('preferredLanguage')}
                        >
                            <p className="text-sm font-medium">
                                {user.preferredLanguage === 'sl' ? 'Slovenščina' : 'English'}
                            </p>
                        </ProfileInfoCard>

                        <ProfileInfoCard
                            icon={<IdCard />}
                            label={t('userId')}
                        >
                            <p className="break-all font-mono text-xs text-stone-500">
                                {user.id || 'N/A'}
                            </p>
                        </ProfileInfoCard>
                    </div>
                </div>

                {/* Business Information */}
                {hasBusinessInfo && (
                    <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-stone-500">
                            {t('businessDetails')}
                        </h2>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {user.businessName && (
                                <ProfileInfoCard
                                    icon={<Building2 />}
                                    label={t('businessName')}
                                >
                                    <p className="text-sm font-medium">{user.businessName}</p>
                                </ProfileInfoCard>
                            )}

                            {user.businessEmail && (
                                <ProfileInfoCard
                                    icon={<Mail />}
                                    label={t('businessEmail')}
                                >
                                    <p className="text-sm font-medium">{user.businessEmail}</p>
                                </ProfileInfoCard>
                            )}

                            {user.businessPhone && (
                                <ProfileInfoCard
                                    icon={<Phone />}
                                    label={t('businessPhone')}
                                >
                                    <p className="text-sm font-medium">{user.businessPhone}</p>
                                </ProfileInfoCard>
                            )}

                            {user.businessAddress && (
                                <ProfileInfoCard
                                    icon={<MapPin />}
                                    label={t('businessAddress')}
                                >
                                    <p className="text-sm font-medium">{user.businessAddress}</p>
                                </ProfileInfoCard>
                            )}

                            {user.businessWebsite && (
                                <ProfileInfoCard
                                    icon={<Globe />}
                                    label={t('businessWebsite')}
                                >
                                    <a
                                        href={user.businessWebsite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        {user.businessWebsite}
                                    </a>
                                </ProfileInfoCard>
                            )}
                        </div>

                        {user.businessDescription && (
                            <div className="mt-4 rounded border border-black/5 bg-stone-50 p-4">
                                <p className="mb-2 text-xs uppercase tracking-[0.3em] text-stone-400">
                                    {t('businessDescription')}
                                </p>
                                <p className="text-sm text-stone-600">{user.businessDescription}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-stone-500">
                        {t('quickActions')}
                    </h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button asChild variant="outline" className="h-auto justify-start gap-3 px-5 py-4">
                            <Link to="/catalogues">
                                <Folder className="h-5 w-5" strokeWidth={1.5} />
                                <span className="normal-case tracking-normal">
                                    {t('manageCatalogues')}
                                </span>
                            </Link>
                        </Button>

                        <Button 
                            variant="outline" 
                            className="h-auto justify-start gap-3 px-5 py-4"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            <Settings className="h-5 w-5" strokeWidth={1.5} />
                            <span className="normal-case tracking-normal">
                                {t('accountSettings')}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </div>
    );
}
