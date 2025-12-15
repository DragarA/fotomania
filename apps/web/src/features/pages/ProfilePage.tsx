import { useTranslation } from "react-i18next";
import { ProfileInfoCard } from "../../components/ui/ProfileInfoCard";
import { CheckCircle, Folder, IdCard, Mail, Plus, Settings, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ProfilePage() {
    const { t } = useTranslation('gallery');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mt-10 overflow-hidden rounded-2xl bg-white shadow-lg">
                {/* Header Section */}
                <div className="bg-accent-500 px-8 py-12 text-white">
                    <div className="flex items-center space-x-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-accent-600">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                {user.name || t('profile.user')}
                            </h1>
                            <p className="text-indigo-100">
                                {user.email || t('profile.noEmail')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="p-8">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">
                        {t('profile.title')}
                    </h2>

                    <div className="space-y-6">
                        {/* Account Details */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <ProfileInfoCard
                                icon={<User className="h-6 w-6" />}
                                label={t('profile.fullName')}
                            >
                                <p className="text-lg text-gray-900">
                                    {user.name || t('profile.notProvided')}
                                </p>
                            </ProfileInfoCard>

                            <ProfileInfoCard
                                icon={<Mail className="h-6 w-6" />}
                                label={t('profile.emailAddress')}
                            >
                                <p className="text-lg text-gray-900">
                                    {user.email || t('profile.notProvided')}
                                </p>
                            </ProfileInfoCard>

                            <ProfileInfoCard
                                icon={<CheckCircle className="h-6 w-6" />}
                                label={t('profile.emailVerification')}
                            >
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                            user.emailVerified
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {user.emailVerified
                                            ? t('profile.verified')
                                            : t('profile.notVerified')}
                                    </span>
                                </div>
                            </ProfileInfoCard>

                            <ProfileInfoCard
                                icon={<IdCard className="h-6 w-6" />}
                                label={t('profile.userId')}
                            >
                                <p className="break-all text-sm font-mono text-gray-600">
                                    {user.id || 'N/A'}
                                </p>
                            </ProfileInfoCard>
                        </div>

                        {/* Account Actions */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900">
                                {t('profile.quickActions')}
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Link
                                    to="/catalogues"
                                    className="flex cursor-pointer items-center justify-center space-x-2 rounded-lg border-2 border-gray-200 px-4 py-3 transition-colors hover:border-accent-500 hover:bg-indigo-50"
                                >
                                    <Folder className="h-5 w-5 text-gray-600" />
                                    <span className="font-medium text-gray-700">
                                        {t('profile.manageCatalogues')}
                                    </span>
                                </Link>

                                <button className="flex cursor-pointer items-center justify-center space-x-2 rounded-lg border-2 border-gray-200 px-4 py-3 transition-colors hover:border-accent-500 hover:bg-indigo-50">
                                    <Settings className="h-5 w-5 text-gray-600" />
                                    <span className="font-medium text-gray-700">
                                        {t('profile.accountSettings')}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
