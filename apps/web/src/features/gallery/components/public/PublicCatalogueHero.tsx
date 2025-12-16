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
        <section className="relative h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(27,24,20,0.95))]">
            {/* Cover Photo Background */}
            {catalogue.coverImage && typeof catalogue.coverImage === 'string' ? (
                <>
                    {/* Blurred Background */}
                    <div
                        className="absolute inset-0 opacity-70"
                        style={{
                            backgroundImage: `url(${API_BASE_URL}/uploads/${catalogue.coverImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(60px)',
                            transform: 'scale(1.2)',
                        }}
                    />

                    {/* Main Cover Image */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-80">
                        <img
                            src={`${API_BASE_URL}/uploads/${catalogue.coverImage}`}
                            alt=""
                            className="md:max-h-[85%] md:max-w-[85%] object-contain shadow-[0_45px_120px_-60px_rgba(0,0,0,0.9)]"
                        />
                    </div>

                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-black/90" />
                </>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#312b28] to-[#1a1614]" />
            )}

            {/* Hero Content */}
            <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="max-w-4xl space-y-4">
                    <p className="text-xs uppercase tracking-[0.5em] text-white/70">
                        {t('hero.subtitle')}
                    </p>
                    <h1 className="text-4xl font-light tracking-[0.04em] text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
                        {catalogue.title}
                    </h1>
                    {catalogue.description &&
                        typeof catalogue.description === 'string' && (
                            <p className="mx-auto max-w-3xl text-lg text-white/80 drop-shadow-xl sm:text-xl md:text-2xl">
                                {catalogue.description}
                            </p>
                        )}
                </div>

                {/* Scroll Down Button */}
                <button
                    onClick={onScrollToGallery}
                    className="group absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/80 transition-all hover:scale-110 hover:text-white"
                    aria-label="Scroll to gallery"
                >
                    <span className="hidden text-[0.65rem] uppercase tracking-[0.5em] sm:block">
                        {t('hero.viewGallery')}
                    </span>
                    <div className="flex h-12 w-12 animate-bounce items-center justify-center rounded-full border border-white/40 bg-white/10 group-hover:border-white">
                        <ChevronDown className="h-6 w-6" strokeWidth={1} />
                    </div>
                </button>
            </div>
        </section>
    );
}
