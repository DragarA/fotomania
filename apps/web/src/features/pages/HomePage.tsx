import { Link } from '@tanstack/react-router';
import { Folder, Heart, Share2, Shield, Sparkles, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { useAuth } from '../auth/hooks';

export function HomePage() {
    const { t } = useTranslation('common');
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-stone-50 py-24 lg:py-32">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(0,0,0,0.02)_0%,_transparent_50%)]" />

                <div className="relative mx-auto max-w-5xl px-6 sm:px-8">
                    <div className="text-center">
                        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-stone-400">
                            {t('home.hero.label')}
                        </p>
                        <h1 className="mb-6 text-4xl font-light tracking-tight text-stone-800 sm:text-5xl lg:text-6xl">
                            {t('home.hero.title')}
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-stone-500 sm:text-xl">
                            {t('home.hero.subtitle')}
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {user ? (
                                <Button asChild size="lg">
                                    <Link to="/catalogues">
                                        {t('home.hero.goToProfile')}
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild size="lg">
                                        <Link to="/register">
                                            {t('home.hero.getStarted')}
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        {t('home.hero.watchDemo')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-20 lg:py-28">
                <div className="mx-auto max-w-6xl px-6 sm:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-light tracking-tight text-stone-800 sm:text-4xl">
                            {t('home.features.title')}
                        </h2>
                        <p className="mx-auto max-w-2xl text-stone-500">
                            {t('home.features.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="rounded-lg border border-black/5 bg-stone-50 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm">
                                <Image className="h-5 w-5" strokeWidth={1.5} />
                            </div>
                            <h3 className="mb-3 text-lg font-medium tracking-wide text-stone-800">
                                {t('home.features.storage.title')}
                            </h3>
                            <p className="text-sm leading-relaxed text-stone-500">
                                {t('home.features.storage.description')}
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="rounded-lg border border-black/5 bg-stone-50 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm">
                                <Folder className="h-5 w-5" strokeWidth={1.5} />
                            </div>
                            <h3 className="mb-3 text-lg font-medium tracking-wide text-stone-800">
                                {t('home.features.organization.title')}
                            </h3>
                            <p className="text-sm leading-relaxed text-stone-500">
                                {t('home.features.organization.description')}
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="rounded-lg border border-black/5 bg-stone-50 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm">
                                <Share2 className="h-5 w-5" strokeWidth={1.5} />
                            </div>
                            <h3 className="mb-3 text-lg font-medium tracking-wide text-stone-800">
                                {t('home.features.sharing.title')}
                            </h3>
                            <p className="text-sm leading-relaxed text-stone-500">
                                {t('home.features.sharing.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Props Section */}
            <section className="bg-stone-100 py-16 lg:py-20">
                <div className="mx-auto max-w-6xl px-6 sm:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div className="text-center">
                            <div className="mb-2 text-2xl font-light text-stone-800 sm:text-3xl">
                                {t('home.valueProps.unlimited.value')}
                            </div>
                            <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                                {t('home.valueProps.unlimited.label')}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-2xl font-light text-stone-800 sm:text-3xl">
                                {t('home.valueProps.resolution.value')}
                            </div>
                            <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                                {t('home.valueProps.resolution.label')}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-2xl font-light text-stone-800 sm:text-3xl">
                                {t('home.valueProps.watermarks.value')}
                            </div>
                            <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                                {t('home.valueProps.watermarks.label')}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-2xl font-light text-stone-800 sm:text-3xl">
                                {t('home.valueProps.sharing.value')}
                            </div>
                            <div className="text-xs uppercase tracking-[0.2em] text-stone-500">
                                {t('home.valueProps.sharing.label')}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="bg-white py-20 lg:py-28">
                <div className="mx-auto max-w-6xl px-6 sm:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                        <div>
                            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-stone-400">
                                {t('home.whyUs.label')}
                            </p>
                            <h2 className="mb-6 text-3xl font-light tracking-tight text-stone-800 sm:text-4xl">
                                {t('home.whyUs.title')}
                            </h2>
                            <p className="mb-8 text-stone-500">
                                {t('home.whyUs.subtitle')}
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                                        <Shield
                                            className="h-4 w-4"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-stone-800">
                                            {t('home.whyUs.secure.title')}
                                        </h4>
                                        <p className="text-sm text-stone-500">
                                            {t('home.whyUs.secure.description')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                                        <Heart
                                            className="h-4 w-4"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-stone-800">
                                            {t('home.whyUs.favorites.title')}
                                        </h4>
                                        <p className="text-sm text-stone-500">
                                            {t(
                                                'home.whyUs.favorites.description'
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                                        <Sparkles
                                            className="h-4 w-4"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-stone-800">
                                            {t('home.whyUs.galleries.title')}
                                        </h4>
                                        <p className="text-sm text-stone-500">
                                            {t(
                                                'home.whyUs.galleries.description'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-stone-200">
                                <div className="flex h-full items-center justify-center text-stone-400">
                                    <img
                                        src={`/assets/cover.jpeg`}
                                        alt="Cover"
                                    />
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-lg border border-black/5 bg-white shadow-lg" />
                            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-lg border border-black/5 bg-stone-50" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-stone-800 py-20 lg:py-24">
                <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
                    <h2 className="mb-4 text-3xl font-light tracking-tight text-white sm:text-4xl">
                        {t('home.cta.title')}
                    </h2>
                    <p className="mb-8 text-stone-400">
                        {t('home.cta.subtitle')}
                    </p>
                    {!user && (
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-stone-800 hover:bg-stone-100"
                        >
                            <Link to="/register">
                                {t('home.cta.startTrial')}
                            </Link>
                        </Button>
                    )}
                </div>
            </section>
        </div>
    );
}
