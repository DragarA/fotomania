import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { SpotlightTooltip } from '@/features/onboarding/components/SpotlightTooltip';
import { WelcomeModal } from '@/features/onboarding/components/WelcomeModal';
import { useOnboarding } from '@/features/onboarding/useOnboarding';

import { CatalogueCard } from '../components/catalogue/CatalogueCard';
import { CatalogueFormModal } from '../components/catalogue/CatalogueFormModal';
import { useCataloguesQuery } from '../hooks';

export function CataloguesPage() {
    const { t } = useTranslation('gallery');
    const { t: tOnboarding } = useTranslation('onboarding');
    const navigate = useNavigate();
    const { data, isLoading, isError, error } = useCataloguesQuery();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const {
        currentStep,
        isActive,
        isCompleted,
        completedSteps,
        nextStep,
        skipOnboarding,
        shouldShowWelcome,
        completeWelcome,
    } = useOnboarding();

    const showWelcome =
        shouldShowWelcome &&
        !isLoading &&
        !isError &&
        !isCompleted &&
        !completedSteps.welcome &&
        (data?.length ?? 0) === 0;

    const spotlightSelector = useMemo(() => {
        if (!data || data.length === 0) {
            return '[data-onboarding="create-catalogue-empty"]';
        }

        return '[data-onboarding="create-catalogue-primary"]';
    }, [data]);

    const handleCreateSuccess = (catalogueId: string) => {
        if (isActive && currentStep === 'create-catalogue') {
            nextStep();
        }
        navigate({ to: '/catalogues/$catalogueId', params: { catalogueId } });
    };

    const renderGrid = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="h-64 rounded border border-black/5 bg-white/60 shadow-[0_35px_80px_-65px_rgba(0,0,0,0.85)] animate-pulse"
                        />
                    ))}
                </div>
            );
        }

        if (isError) {
            return (
                <div className="rounded border border-red-200/60 bg-red-50 px-6 py-5 text-sm uppercase tracking-[0.25em] text-red-700">
                    {error?.message || t('catalogues.error')}
                </div>
            );
        }

        if (data && data.length > 0) {
            return (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {data.map((catalogue) => (
                        <CatalogueCard
                            key={catalogue.id}
                            catalogue={catalogue}
                        />
                    ))}
                </div>
            );
        }

        return (
            <div className="rounded border border-black/5 bg-white/70 px-6 py-10 text-center shadow-[0_35px_80px_-65px_rgba(0,0,0,0.85)] space-y-6 sm:px-10 sm:py-12">
                <div className="text-xs uppercase tracking-[0.3em] text-stone-500">
                    {t('catalogues.empty.title')}
                </div>
                <p className="text-sm text-stone-700 sm:text-base">
                    {t('catalogues.empty.message')}
                </p>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="default"
                    className="tracking-[0.15em]"
                    data-onboarding="create-catalogue-empty"
                >
                    {t('catalogues.createButton')}
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(250,248,244,1))] px-6 py-10 sm:px-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-10">
                <header className="flex flex-col gap-6 rounded border border-white/40 bg-white/70 px-6 py-8 shadow-[0_45px_120px_-80px_rgba(0,0,0,0.9)] backdrop-blur sm:px-8 sm:py-10">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                            Fotomania
                        </p>
                        <h1 className="text-3xl font-light tracking-[0.03em] text-stone-800 sm:text-4xl">
                            {t('catalogues.title')}
                        </h1>
                        <p className="max-w-2xl text-sm text-stone-500 sm:text-base">
                            {t('catalogues.subtitle')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            size="lg"
                            className="ml-auto tracking-[0.15em]"
                            data-onboarding="create-catalogue-primary"
                        >
                            {t('catalogues.createButton')}
                        </Button>
                    </div>
                </header>

                {renderGrid()}
            </div>

            {isActive && currentStep === 'create-catalogue' ? (
                <SpotlightTooltip
                    targetSelector={spotlightSelector}
                    title={tOnboarding('steps.createCatalogue')}
                    description={tOnboarding('steps.createCatalogueDesc')}
                    onSkip={skipOnboarding}
                    position="bottom"
                />
            ) : null}

            <CatalogueFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            <WelcomeModal
                isOpen={showWelcome}
                onSkip={skipOnboarding}
                onComplete={completeWelcome}
            />
        </div>
    );
}
