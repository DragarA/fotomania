import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/profile')({
    beforeLoad: () => {
        // Check if user is authenticated by looking at localStorage
        // This is a simple check - the AuthProvider will handle the actual state
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw redirect({
                to: '/login',
            });
        }
    },
    component: ProfilePage,
});

function ProfilePage() {
    const { t } = useTranslation('gallery');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-10">
                {/* Header Section */}
                <div className="bg-accent-500 px-8 py-12 text-white">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-accent-600 text-3xl font-bold">
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {t('profile.title')}
                    </h2>

                    <div className="space-y-6">
                        {/* Account Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-accent-600 cursor-pointer"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                            {t('profile.fullName')}
                                        </h3>
                                        <p className="text-lg text-gray-900">
                                            {user.name ||
                                                t('profile.notProvided')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-accent-600 cursor-pointer"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                            {t('profile.emailAddress')}
                                        </h3>
                                        <p className="text-lg text-gray-900">
                                            {user.email ||
                                                t('profile.notProvided')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-accent-600 cursor-pointer"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                            {t('profile.emailVerification')}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="w-6 h-6 text-accent-600 cursor-pointer"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                                            />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                            {t('profile.userId')}
                                        </h3>
                                        <p className="text-sm text-gray-600 font-mono break-all">
                                            {user.id || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="border-t border-gray-200 pt-6 mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {t('profile.quickActions')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link
                                    to="/catalogues"
                                    className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-accent-500 hover:bg-indigo-50 transition-colors cursor-pointer"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-600 cursor-pointer"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                        />
                                    </svg>
                                    <span className="font-medium text-gray-700">
                                        {t('profile.manageCatalogues')}
                                    </span>
                                </Link>

                                <Link
                                    to="/catalogues"
                                    className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-accent-500 hover:bg-indigo-50 transition-colors cursor-pointer"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-600 cursor-pointer"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    <span className="font-medium text-gray-700">
                                        {t('profile.newCatalogue')}
                                    </span>
                                </Link>

                                <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-accent-500 hover:bg-indigo-50 transition-colors cursor-pointer">
                                    <svg
                                        className="w-5 h-5 text-gray-600 cursor-pointer"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
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
