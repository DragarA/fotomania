import { ArrowRight, X } from 'lucide-react';
import { RefObject, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

type SpotlightPosition = 'top' | 'bottom' | 'left' | 'right';

interface SpotlightTooltipProps {
    targetRef?: RefObject<HTMLElement>;
    targetSelector?: string;
    title: string;
    description: string;
    position?: SpotlightPosition;
    onNext?: () => void;
    onSkip?: () => void;
}

interface TargetRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const gap = 16;

export function SpotlightTooltip({
    targetRef,
    targetSelector,
    title,
    description,
    position = 'bottom',
    onNext,
    onSkip,
}: SpotlightTooltipProps) {
    const { t } = useTranslation('onboarding');
    const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        const resolveTarget = () => {
            const element =
                targetRef?.current ??
                (targetSelector
                    ? (document.querySelector(targetSelector) as HTMLElement | null)
                    : null);

            if (!element) {
                setTargetRect(null);
                return;
            }

            const rect = element.getBoundingClientRect();
            setTargetRect({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        };

        resolveTarget();
        window.addEventListener('resize', resolveTarget);
        window.addEventListener('scroll', resolveTarget, true);

        const observer = new MutationObserver(resolveTarget);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
        });

        return () => {
            window.removeEventListener('resize', resolveTarget);
            window.removeEventListener('scroll', resolveTarget, true);
            observer.disconnect();
        };
    }, [targetRef, targetSelector]);

    const tooltipStyle = useMemo(() => {
        if (!targetRect) {
            return { top: 0, left: 0, transform: 'translate(-9999px, -9999px)' };
        }

        const top = targetRect.top + window.scrollY;
        const left = targetRect.left + window.scrollX;

        switch (position) {
            case 'top':
                return {
                    top: top - gap,
                    left: left + targetRect.width / 2,
                    transform: 'translate(-50%, -100%)',
                };
            case 'left':
                return {
                    top: top + targetRect.height / 2,
                    left: left - gap,
                    transform: 'translate(-100%, -50%)',
                };
            case 'right':
                return {
                    top: top + targetRect.height / 2,
                    left: left + targetRect.width + gap,
                    transform: 'translate(0, -50%)',
                };
            default:
                return {
                    top: top + targetRect.height + gap,
                    left: left + targetRect.width / 2,
                    transform: 'translate(-50%, 0)',
                };
        }
    }, [position, targetRect]);

    if (!targetRect || typeof document === 'undefined') {
        return null;
    }

    const highlightStyle = {
        top: targetRect.top + window.scrollY - 6,
        left: targetRect.left + window.scrollX - 6,
        width: targetRect.width + 12,
        height: targetRect.height + 12,
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] pointer-events-none">
            <div className="absolute inset-0 bg-[rgba(6,5,4,0.35)]" />
            <div
                className="absolute rounded-xl border border-white/40 bg-transparent shadow-[0_0_0_9999px_rgba(6,5,4,0.35)] pointer-events-none"
                style={highlightStyle}
            />
            <div
                className="absolute max-w-xs rounded-xl border border-white/20 bg-white/95 p-5 text-stone-700 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)] pointer-events-auto"
                style={tooltipStyle}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-stone-400">
                            {title}
                        </p>
                        <p className="mt-3 text-sm text-stone-600">
                            {description}
                        </p>
                    </div>
                    {onSkip ? (
                        <button
                            type="button"
                            onClick={onSkip}
                            className="rounded-full border border-stone-200 p-1 text-stone-400 transition hover:text-stone-700"
                        >
                            <X className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                    ) : null}
                </div>

                {onNext ? (
                    <button
                        type="button"
                        onClick={onNext}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white"
                    >
                        {t('buttons.next')}
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                ) : null}
            </div>
        </div>,
        document.body
    );
}
