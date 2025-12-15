import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { API_BASE_URL } from '@/lib/api-client';
import { CataloguePublicResDto } from '@repo/sdk';

interface PublicCatalogueHeroProps {
    catalogue: CataloguePublicResDto;
    onScrollToGallery: () => void;
}

export function PublicCatalogueHero({
    catalogue,
    onScrollToGallery,
}: PublicCatalogueHeroProps) {
    const { t } = useTranslation('public');

    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Cover Photo Background */}
            {catalogue.coverImage && typeof catalogue.coverImage === 'string' ? (
                <>
                    {/* Blurred Background */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url(${API_BASE_URL}/uploads/${catalogue.coverImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(40px)',
                            transform: 'scale(1.1)',
                        }}
                    />

                    {/* Main Cover Image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img
                            src={`${API_BASE_URL}/uploads/${catalogue.coverImage}`}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>

                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40" />
                </>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
            )}

            {/* Hero Content */}
            <div className="relative flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
                <div className="max-w-4xl">
                    <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/90">
                        {t('hero.subtitle')}
                    </p>
                    <h1 className="mb-6 text-4xl font-bold text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
                        {catalogue.title}
                    </h1>
                    {catalogue.description &&
                        typeof catalogue.description === 'string' && (
                            <p className="mx-auto max-w-3xl text-lg text-white/95 drop-shadow-md sm:text-xl md:text-2xl">
                                {catalogue.description}
                            </p>
                        )}
                </div>

                {/* Scroll Down Button */}
                <button
                    onClick={onScrollToGallery}
                    className="group absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/90 transition-all hover:scale-110 hover:text-white"
                    aria-label="Scroll to gallery"
                >
                    <span className="hidden text-sm font-medium sm:block">
                        {t('hero.viewGallery')}
                    </span>
                    <div className="flex h-10 w-10 animate-bounce items-center justify-center rounded-full border-2 border-white/80 group-hover:border-white">
                        <ChevronDown className="h-6 w-6" />
                    </div>
                </button>
            </div>
        </section>
    );
}
