import { Link } from '@tanstack/react-router';
import { Check, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

export function PricingPage() {
    const { t } = useTranslation('common');

    const plans = [
        {
            name: t('pricing.plans.starter.name'),
            price: t('pricing.plans.starter.price'),
            period: t('pricing.plans.starter.period'),
            description: t('pricing.plans.starter.description'),
            features: [
                t('pricing.plans.starter.features.storage'),
                t('pricing.plans.starter.features.catalogues'),
                t('pricing.plans.starter.features.sharing'),
                t('pricing.plans.starter.features.galleries'),
                t('pricing.plans.starter.features.support'),
            ],
            cta: t('pricing.plans.starter.cta'),
            highlighted: false,
        },
        {
            name: t('pricing.plans.professional.name'),
            price: t('pricing.plans.professional.price'),
            period: t('pricing.plans.professional.period'),
            description: t('pricing.plans.professional.description'),
            features: [
                t('pricing.plans.professional.features.storage'),
                t('pricing.plans.professional.features.catalogues'),
                t('pricing.plans.professional.features.sharing'),
                t('pricing.plans.professional.features.galleries'),
                t('pricing.plans.professional.features.branding'),
                t('pricing.plans.professional.features.delivery'),
                t('pricing.plans.professional.features.support'),
            ],
            cta: t('pricing.plans.professional.cta'),
            highlighted: true,
        },
        {
            name: t('pricing.plans.studio.name'),
            price: t('pricing.plans.studio.price'),
            period: t('pricing.plans.studio.period'),
            description: t('pricing.plans.studio.description'),
            features: [
                t('pricing.plans.studio.features.storage'),
                t('pricing.plans.studio.features.catalogues'),
                t('pricing.plans.studio.features.sharing'),
                t('pricing.plans.studio.features.galleries'),
                t('pricing.plans.studio.features.branding'),
                t('pricing.plans.studio.features.delivery'),
                t('pricing.plans.studio.features.team'),
                t('pricing.plans.studio.features.support'),
            ],
            cta: t('pricing.plans.studio.cta'),
            highlighted: false,
        },
    ];

    const faqs = [
        {
            question: t('pricing.faq.trial.question'),
            answer: t('pricing.faq.trial.answer'),
        },
        {
            question: t('pricing.faq.cancel.question'),
            answer: t('pricing.faq.cancel.answer'),
        },
        {
            question: t('pricing.faq.storage.question'),
            answer: t('pricing.faq.storage.answer'),
        },
        {
            question: t('pricing.faq.upgrade.question'),
            answer: t('pricing.faq.upgrade.answer'),
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-stone-50 py-24 lg:py-32">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,_rgba(0,0,0,0.02)_0%,_transparent_50%)]" />

                <div className="relative mx-auto max-w-5xl px-6 sm:px-8">
                    <div className="text-center">
                        <p className="mb-4 text-xs uppercase tracking-[0.4em] text-stone-400">
                            {t('pricing.hero.label')}
                        </p>
                        <h1 className="mb-6 text-4xl font-light tracking-tight text-stone-800 sm:text-5xl lg:text-6xl">
                            {t('pricing.hero.title')}
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg font-light text-stone-500 sm:text-xl">
                            {t('pricing.hero.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="bg-white py-20 lg:py-28">
                <div className="mx-auto max-w-6xl px-6 sm:px-8">
                    <div className="grid gap-8 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative rounded-2xl border p-8 ${
                                    plan.highlighted
                                        ? 'border-stone-800 bg-stone-800 text-white shadow-xl'
                                        : 'border-stone-200 bg-white'
                                }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-stone-600 px-4 py-1 text-xs font-medium text-white">
                                        {t('pricing.popular')}
                                    </div>
                                )}

                                <h3
                                    className={`mb-2 text-xl font-medium ${
                                        plan.highlighted
                                            ? 'text-white'
                                            : 'text-stone-800'
                                    }`}
                                >
                                    {plan.name}
                                </h3>
                                <p
                                    className={`mb-6 text-sm ${
                                        plan.highlighted
                                            ? 'text-stone-300'
                                            : 'text-stone-500'
                                    }`}
                                >
                                    {plan.description}
                                </p>

                                <div className="mb-6">
                                    <span
                                        className={`text-4xl font-light ${
                                            plan.highlighted
                                                ? 'text-white'
                                                : 'text-stone-800'
                                        }`}
                                    >
                                        {plan.price}
                                    </span>
                                    <span
                                        className={`text-sm ${
                                            plan.highlighted
                                                ? 'text-stone-400'
                                                : 'text-stone-500'
                                        }`}
                                    >
                                        {plan.period}
                                    </span>
                                </div>

                                <ul className="mb-8 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-3"
                                        >
                                            <Check
                                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                                    plan.highlighted
                                                        ? 'text-stone-300'
                                                        : 'text-stone-600'
                                                }`}
                                                strokeWidth={2}
                                            />
                                            <span
                                                className={`text-sm ${
                                                    plan.highlighted
                                                        ? 'text-stone-300'
                                                        : 'text-stone-600'
                                                }`}
                                            >
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    asChild
                                    className={`w-full ${
                                        plan.highlighted
                                            ? 'bg-white text-stone-800 hover:bg-stone-100'
                                            : 'bg-stone-800 text-white hover:bg-stone-700'
                                    }`}
                                >
                                    <Link to="/register">{plan.cta}</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-stone-50 py-20 lg:py-28">
                <div className="mx-auto max-w-4xl px-6 sm:px-8">
                    <div className="mb-12 text-center">
                        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-stone-400">
                            {t('pricing.faq.label')}
                        </p>
                        <h2 className="mb-4 text-3xl font-light tracking-tight text-stone-800 sm:text-4xl">
                            {t('pricing.faq.title')}
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {faqs.map(({ question, answer }) => (
                            <div
                                key={question}
                                className="rounded-lg border border-stone-200 bg-white p-6"
                            >
                                <div className="flex items-start gap-4">
                                    <HelpCircle
                                        className="mt-0.5 h-5 w-5 shrink-0 text-stone-400"
                                        strokeWidth={1.5}
                                    />
                                    <div>
                                        <h3 className="mb-2 font-medium text-stone-800">
                                            {question}
                                        </h3>
                                        <p className="text-sm text-stone-500">
                                            {answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-stone-800 py-20 lg:py-24">
                <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
                    <h2 className="mb-4 text-3xl font-light tracking-tight text-white sm:text-4xl">
                        {t('pricing.cta.title')}
                    </h2>
                    <p className="mb-8 text-stone-400">
                        {t('pricing.cta.subtitle')}
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-white text-stone-800 hover:bg-stone-100"
                    >
                        <Link to="/register">{t('pricing.cta.getStarted')}</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
