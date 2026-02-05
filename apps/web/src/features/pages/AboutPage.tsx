import { Link } from '@tanstack/react-router';
import {
    Camera,
    Heart,
    Mail,
    Shield,
    Sparkles,
    Target,
    Users,
    Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

export function AboutPage() {
    const { t } = useTranslation('common');

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-stone-50 py-24 lg:py-32">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_rgba(0,0,0,0.02)_0%,_transparent_50%)]" />

                <div className="relative mx-auto max-w-5xl px-6 sm:px-8">
                    <div className="text-center">
                        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-stone-400">
                            {t('about.hero.label')}
                        </p>
                        <h1 className="mb-6 text-4xl font-light tracking-tight text-stone-800 sm:text-5xl lg:text-6xl">
                            {t('about.hero.title')}
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg font-light text-stone-500 sm:text-xl">
                            {t('about.hero.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="bg-white py-20 lg:py-28">
                <div className="mx-auto max-w-6xl px-6 sm:px-8">
                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                        <div>
                            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-stone-400">
                                {t('about.mission.label')}
                            </p>
                            <h2 className="mb-6 text-3xl font-light tracking-tight text-stone-800 sm:text-4xl">
                                {t('about.mission.title')}
                            </h2>
                            <p className="mb-6 text-stone-500 leading-relaxed">
                                {t('about.mission.description')}
                            </p>
                            <p className="text-stone-500 leading-relaxed">
                                {t('about.mission.description2')}
                            </p>
                        </div>

                        <div className="relative">
                            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-stone-200">
                                <div className="flex h-full items-center justify-center">
                                    <img
                                        src="/assets/cover.jpeg"
                                        alt="Photographer at work"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-lg border border-black/5 bg-white shadow-lg" />
                            <div className="absolute -left-4 -top-4 h-20 w-20 rounded-lg border border-black/5 bg-stone-50" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="bg-stone-50 py-20 lg:py-28">
                <div className="mx-auto max-w-4xl px-6 text-center sm:px-8">
                    <p className="mb-3 text-xs uppercase tracking-[0.4em] text-stone-400">
                        {t('about.story.label')}
                    </p>
                    <h2 className="mb-8 text-3xl font-light tracking-tight text-stone-800 sm:text-4xl">
                        {t('about.story.title')}
                    </h2>
                    <div className="space-y-6 text-stone-500 leading-relaxed">
                        <p>{t('about.story.paragraph1')}</p>
                        <p>{t('about.story.paragraph2')}</p>
                        <p>{t('about.story.paragraph3')}</p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-white py-20 lg:py-28">
                <div className="mx-auto max-w-6xl px-6 sm:px-8">
                    <div className="mb-16 text-center">
                        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-stone-400">
                            {t('about.values.label')}
                        </p>
                        <h2 className="mb-4 text-3xl font-light tracking-tight text-stone-800 sm:text-4xl">
                            {t('about.values.title')}
                        </h2>
                        <p className="mx-auto max-w-2xl text-stone-500">
                            {t('about.values.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: Camera,
                                title: t('about.values.craftsmanship.title'),
                                description: t(
                                    'about.values.craftsmanship.description'
                                ),
                            },
                            {
                                icon: Shield,
                                title: t('about.values.trust.title'),
                                description: t(
                                    'about.values.trust.description'
                                ),
                            },
                            {
                                icon: Zap,
                                title: t('about.values.simplicity.title'),
                                description: t(
                                    'about.values.simplicity.description'
                                ),
                            },
                            {
                                icon: Heart,
                                title: t('about.values.passion.title'),
                                description: t(
                                    'about.values.passion.description'
                                ),
                            },
                        ].map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="rounded-lg border border-black/5 bg-stone-50 p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm">
                                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                                </div>
                                <h3 className="mb-3 text-lg font-medium tracking-wide text-stone-800">
                                    {title}
                                </h3>
                                <p className="text-sm leading-relaxed text-stone-500">
                                    {description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What Sets Us Apart */}
            <section className="bg-stone-100 py-16 lg:py-20">
                <div className="mx-auto max-w-6xl px-6 sm:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600">
                                <Target className="h-5 w-5" strokeWidth={1.4} />
                            </div>
                            <h3 className="mb-2 font-medium text-stone-800">
                                {t('about.apart.focused.title')}
                            </h3>
                            <p className="text-sm text-stone-500">
                                {t('about.apart.focused.description')}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600">
                                <Users className="h-5 w-5" strokeWidth={1.4} />
                            </div>
                            <h3 className="mb-2 font-medium text-stone-800">
                                {t('about.apart.community.title')}
                            </h3>
                            <p className="text-sm text-stone-500">
                                {t('about.apart.community.description')}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600">
                                <Sparkles className="h-5 w-5" strokeWidth={1.4} />
                            </div>
                            <h3 className="mb-2 font-medium text-stone-800">
                                {t('about.apart.innovation.title')}
                            </h3>
                            <p className="text-sm text-stone-500">
                                {t('about.apart.innovation.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="bg-stone-800 py-20 lg:py-24">
                <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-stone-700 text-white">
                        <Mail className="h-6 w-6" strokeWidth={1.5} />
                    </div>
                    <h2 className="mb-4 text-3xl font-light tracking-tight text-white sm:text-4xl">
                        {t('about.contact.title')}
                    </h2>
                    <p className="mb-8 text-stone-400">
                        {t('about.contact.subtitle')}
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-stone-800 hover:bg-stone-100"
                        >
                            <Link to="/register">
                                {t('about.contact.getStarted')}
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-stone-500 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        >
                            <a href="mailto:hello@fotomania.app">
                                {t('about.contact.contactUs')}
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
