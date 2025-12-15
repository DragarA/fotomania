import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/hooks';
import { Link } from '@tanstack/react-router';

export function HomePage() {
    const { t } = useTranslation('common');
    const { user } = useAuth();

    console.log('HomePage rendered, user:', user);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-accent-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900">
                            {t('home.hero.title')}
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
                            {t('home.hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {user ? (
                                <Link
                                    to="/profile"
                                    className="inline-block px-8 py-4 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors"
                                >
                                    {t('home.hero.goToProfile')}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="inline-block px-8 py-4 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors"
                                    >
                                        {t('home.hero.getStarted')}
                                    </Link>
                                    <button className="inline-block px-8 py-4 bg-white border-2 border-accent-500 text-accent-600 font-semibold rounded-lg hover:bg-accent-50 transition-colors cursor-pointer">
                                        {t('home.hero.watchDemo')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('home.features.title')}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t('home.features.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-6">
                                <svg
                                    className="w-8 h-8 text-accent-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {t('home.features.storage.title')}
                            </h3>
                            <p className="text-gray-600">
                                {t('home.features.storage.description')}
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-6">
                                <svg
                                    className="w-8 h-8 text-accent-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {t('home.features.organization.title')}
                            </h3>
                            <p className="text-gray-600">
                                {t('home.features.organization.description')}
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-full mb-6">
                                <svg
                                    className="w-8 h-8 text-accent-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {t('home.features.sharing.title')}
                            </h3>
                            <p className="text-gray-600">
                                {t('home.features.sharing.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-accent-600 mb-2">
                                1M+
                            </div>
                            <div className="text-gray-600 font-medium">
                                {t('home.stats.photosStored')}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-accent-600 mb-2">
                                50K+
                            </div>
                            <div className="text-gray-600 font-medium">
                                {t('home.stats.photographers')}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-accent-600 mb-2">
                                100K+
                            </div>
                            <div className="text-gray-600 font-medium">
                                {t('home.stats.galleriesCreated')}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-accent-600 mb-2">
                                99.9%
                            </div>
                            <div className="text-gray-600 font-medium">
                                {t('home.stats.uptime')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-accent-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">
                        {t('home.cta.title')}
                    </h2>
                    <p className="text-xl mb-8 text-gray-600">
                        {t('home.cta.subtitle')}
                    </p>
                    {!user && (
                        <Link
                            to="/login"
                            className="inline-block px-8 py-4 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors"
                        >
                            {t('home.cta.startTrial')}
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
