import { Link } from '@tanstack/react-router';
import {
    Cloud,
    Download,
    Folder,
    Globe,
    Heart,
    Image,
    Lock,
    Palette,
    Share2,
    Shield,
    Smartphone,
    Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

export function FeaturesPage() {
    const { t } = useTranslation('common');

    const features = [
        {
            icon: Cloud,
            title: t('features.list.storage.title'),
            description: t('features.list.storage.description'),
        },
        {
            icon: Folder,
            title: t('features.list.organization.title'),
            description: t('features.list.organization.description'),
        },
        {
            icon: Share2,
            title: t('features.list.sharing.title'),
            description: t('features.list.sharing.description'),
        },
        {
            icon: Lock,
            title: t('features.list.password.title'),
            description: t('features.list.password.description'),
        },
        {
            icon: Heart,
            title: t('features.list.favorites.title'),
            description: t('features.list.favorites.description'),
        },
        {
            icon: Download,
            title: t('features.list.delivery.title'),
            description: t('features.list.delivery.description'),
        },
        {
            icon: Palette,
            title: t('features.list.branding.title'),
            description: t('features.list.branding.description'),
        },
        {
            icon: Image,
            title: t('features.list.galleries.title'),
            description: t('features.list.galleries.description'),
        },
        {
            icon: Globe,
            title: t('features.list.public.title'),
            description: t('features.list.public.description'),
        },
        {
            icon: Shield,
            title: t('features.list.security.title'),
            description: t('features.list.security.description'),
        },
        {
            icon: Smartphone,
            title: t('features.list.responsive.title'),
            description: t('features.list.responsive.description'),
        },
        {
            icon: Zap,
            title: t('features.list.fast.title'),
            description: t('features.list.fast.description'),
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-stone-50 py-24 lg:py-32">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,0,0,0.02)_0%,_transparent_50%)]" />

                <div className="relative mx-auto max-w-5xl px-6 sm:px-8">
                    <div className="text-center">
                        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-stone-400">
                            {t('features.hero.label')}
                        </p>
                        <h1 className="mb-6 text-4xl font-light tracking-tight text-stone-800 sm:text-5xl lg:text-6xl">
                            {t('features.hero.title')}
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg font-light text-stone-500 sm:text-xl">
                            {t('features.hero.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="bg-white py-20 lg:py-28">
                <div className="mx-auto max-w-6xl px-6 sm:px-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {features.map(({ icon: Icon, title, description }) => (
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

            {/* Workflow Section */}
            <section className="bg-stone-50 py-20 lg:py-28">
                <div className="mx-auto max-w-6xl px-6 sm:px-8">
                    <div className="mb-16 text-center">
                        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-stone-400">
                            {t('features.workflow.label')}
                        </p>
                        <h2 className="mb-4 text-3xl font-light tracking-tight text-stone-800 sm:text-4xl">
                            {t('features.workflow.title')}
                        </h2>
                        <p className="mx-auto max-w-2xl text-stone-500">
                            {t('features.workflow.subtitle')}
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="rounded-xl border border-black/5 bg-white p-8 shadow-sm">
                            <h3 className="mb-4 text-xl font-medium text-stone-800">
                                {t('features.workflow.private.title')}
                            </h3>
                            <ul className="space-y-3 text-stone-500">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                    {t('features.workflow.private.step1')}
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                    {t('features.workflow.private.step2')}
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                    {t('features.workflow.private.step3')}
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                    {t('features.workflow.private.step4')}
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-black/5 bg-white p-8 shadow-sm">
                            <h3 className="mb-4 text-xl font-medium text-stone-800">
                                {t('features.workflow.public.title')}
                            </h3>
                            <ul className="space-y-3 text-stone-500">
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                    {t('features.workflow.public.step1')}
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                    {t('features.workflow.public.step2')}
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                    {t('features.workflow.public.step3')}
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
                                    {t('features.workflow.public.step4')}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-stone-800 py-20 lg:py-24">
                <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
                    <h2 className="mb-4 text-3xl font-light tracking-tight text-white sm:text-4xl">
                        {t('features.cta.title')}
                    </h2>
                    <p className="mb-8 text-stone-400">
                        {t('features.cta.subtitle')}
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-stone-800 hover:bg-stone-100"
                        >
                            <Link to="/register">
                                {t('features.cta.getStarted')}
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-stone-500 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        >
                            <Link to="/pricing">
                                {t('features.cta.seePricing')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
