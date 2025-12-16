import { Link } from '@tanstack/react-router';
import { CheckCircle, Folder, IdCard, Mail, Settings, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { ProfileInfoCard } from '@/components/ui/ProfileInfoCard';

export function ProfilePage() {
    const { t } = useTranslation('gallery');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="min-h-screen bg-stone-100 px-6 py-10 sm:px-10">
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header Card */}
                <div className="rounded-lg border border-black/5 bg-white p-8 shadow-sm sm:p-10">
                    <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-stone-100 text-2xl font-light text-stone-600">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[0.6rem] uppercase tracking-[0.4em] text-stone-400">
                                {t('profile.title')}
                            </p>
                            <h1 className="text-2xl font-light tracking-[0.02em] text-stone-800 sm:text-3xl">
                                {user.name || t('profile.user')}
                            </h1>
                            <p className="mt-1 text-sm text-stone-500">
                                {user.email || t('profile.noEmail')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-stone-500">
                        Account Details
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ProfileInfoCard
                            icon={<User />}
                            label={t('profile.fullName')}
                        >
                            <p className="text-sm font-medium">
                                {user.name || t('profile.notProvided')}
                            </p>
                        </ProfileInfoCard>

                        <ProfileInfoCard
                            icon={<Mail />}
                            label={t('profile.emailAddress')}
                        >
                            <p className="text-sm font-medium">
                                {user.email || t('profile.notProvided')}
                            </p>
                        </ProfileInfoCard>

                        <ProfileInfoCard
                            icon={<CheckCircle />}
                            label={t('profile.emailVerification')}
                        >
                            <span
                                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase tracking-[0.1em] ${
                                    user.emailVerified
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-amber-50 text-amber-700'
                                }`}
                            >
                                {user.emailVerified
                                    ? t('profile.verified')
                                    : t('profile.notVerified')}
                            </span>
                        </ProfileInfoCard>

                        <ProfileInfoCard
                            icon={<IdCard />}
                            label={t('profile.userId')}
                        >
                            <p className="break-all font-mono text-xs text-stone-500">
                                {user.id || 'N/A'}
                            </p>
                        </ProfileInfoCard>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-lg border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="mb-6 text-xs uppercase tracking-[0.3em] text-stone-500">
                        {t('profile.quickActions')}
                    </h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button asChild variant="outline" className="h-auto justify-start gap-3 px-5 py-4">
                            <Link to="/catalogues">
                                <Folder className="h-5 w-5" strokeWidth={1.5} />
                                <span className="normal-case tracking-normal">
                                    {t('profile.manageCatalogues')}
                                </span>
                            </Link>
                        </Button>

                        <Button variant="outline" className="h-auto justify-start gap-3 px-5 py-4">
                            <Settings className="h-5 w-5" strokeWidth={1.5} />
                            <span className="normal-case tracking-normal">
                                {t('profile.accountSettings')}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
