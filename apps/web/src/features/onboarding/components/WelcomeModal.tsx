import {
    ArrowLeft,
    ArrowRight,
    Layers,
    Share2,
    Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface WelcomeModalProps {
    isOpen: boolean;
    onSkip: () => void;
    onComplete: () => void;
}

const slideIcons = [Sparkles, Layers, Share2] as const;

type Slide = {
    title: string;
    subtitle?: string;
    features?: string[];
};

export function WelcomeModal({ isOpen, onSkip, onComplete }: WelcomeModalProps) {
    const { t } = useTranslation('onboarding');
    const [activeSlide, setActiveSlide] = useState(0);

    useBodyScrollLock(isOpen);

    useEffect(() => {
        if (isOpen) {
            setActiveSlide(0);
        }
    }, [isOpen]);

    const slides = useMemo<Slide[]>(
        () => [
            {
                title: t('welcome.slide1Title'),
                subtitle: t('welcome.slide1Subtitle'),
            },
            {
                title: t('welcome.slide2Title'),
                features: [
                    t('welcome.slide2Feature1'),
                    t('welcome.slide2Feature2'),
                    t('welcome.slide2Feature3'),
                ],
            },
            {
                title: t('welcome.slide3Title'),
                subtitle: t('welcome.slide3Subtitle'),
            },
        ],
        [t]
    );

    if (!isOpen) return null;
    if (typeof document === 'undefined') return null;

    const currentSlide = slides[activeSlide] ?? slides[0]!;
    const isLastSlide = activeSlide === slides.length - 1;
    const Icon = slideIcons[activeSlide] ?? Sparkles;

    return createPortal(
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(8,6,5,0.72)] px-4 py-6 backdrop-blur"
            onClick={onSkip}
        >
            <div
                className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[radial-gradient(circle_at_top,#fff,rgba(250,250,249,0.9))] shadow-[0_70px_140px_-90px_rgba(15,10,10,0.95)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex flex-col gap-6 px-10 py-10 md:px-14">
                    <div className="flex items-center gap-3 text-[0.6rem] uppercase tracking-[0.55em] text-stone-400">
                        <span>{t('welcome.slide1Title')}</span>
                    </div>
                    <div className="flex items-start justify-between gap-6">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-light tracking-[0.02em] text-stone-900 md:text-4xl">
                                {currentSlide.title}
                            </h2>
                            {currentSlide.subtitle ? (
                                <p className="max-w-xl text-base text-stone-600">
                                    {currentSlide.subtitle}
                                </p>
                            ) : null}
                        </div>
                        <div className="hidden rounded-full border border-stone-200 bg-white/70 p-4 text-stone-500 md:flex">
                            <Icon className="h-6 w-6" strokeWidth={1.4} />
                        </div>
                    </div>

                    {currentSlide.features ? (
                        <div className="grid gap-3 md:grid-cols-3">
                            {currentSlide.features?.map((feature) => (
                                <div
                                    key={feature}
                                    className="rounded-lg border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-600"
                                >
                                    {feature}
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="flex items-center justify-between border-t border-stone-200/70 px-10 py-6 md:px-14">
                    <button
                        type="button"
                        onClick={onSkip}
                        className="text-xs uppercase tracking-[0.4em] text-stone-400 transition hover:text-stone-600"
                    >
                        {t('buttons.skip')}
                    </button>

                    <div className="flex items-center gap-3">
                        {slides.map((_, index) => (
                            <span
                                key={index}
                                className={`h-2 w-2 rounded-full transition ${
                                    index === activeSlide
                                        ? 'bg-stone-800'
                                        : 'bg-stone-300'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                setActiveSlide((value) => Math.max(0, value - 1))
                            }
                            disabled={activeSlide === 0}
                            className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 transition hover:border-stone-300 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                            {t('buttons.back')}
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                (isLastSlide
                                    ? onComplete()
                                    : setActiveSlide((value) =>
                                          Math.min(slides.length - 1, value + 1)
                                      ))
                            }
                            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2 text-sm text-white transition hover:bg-stone-800"
                        >
                            {isLastSlide
                                ? t('buttons.getStarted')
                                : t('buttons.next')}
                            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
