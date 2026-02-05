import { Link, useNavigate } from '@tanstack/react-router';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { useAuth, useLogout } from '../../features/auth/hooks';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export function Navigation() {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();
    const logoutMutation = useLogout();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logoutMutation.mutate();
        setMobileMenuOpen(false);
        navigate({ to: '/' });
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-xl font-light tracking-[0.02em] text-stone-800 transition-colors duration-500 hover:text-stone-600"
                        onClick={closeMobileMenu}
                    >
                        Fotomania
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-start gap-8 md:flex">
                        <Link
                            to="/"
                            className="text-sm font-light tracking-[0.02em] text-stone-500 transition-colors duration-500 hover:text-stone-800"
                            activeProps={{ className: 'text-stone-800' }}
                        >
                            {t('nav.home')}
                        </Link>
                        <Link
                            to="/about"
                            className="text-sm font-light tracking-[0.02em] text-stone-500 transition-colors duration-500 hover:text-stone-800"
                            activeProps={{ className: 'text-stone-800' }}
                        >
                            {t('nav.about')}
                        </Link>
                        {!user && (
                            <>
                                <Link
                                    to="/features"
                                    className="text-sm font-light tracking-[0.02em] text-stone-500 transition-colors duration-500 hover:text-stone-800"
                                    activeProps={{ className: 'text-stone-800' }}
                                >
                                    {t('nav.features')}
                                </Link>
                                <Link
                                    to="/pricing"
                                    className="text-sm font-light tracking-[0.02em] text-stone-500 transition-colors duration-500 hover:text-stone-800"
                                    activeProps={{ className: 'text-stone-800' }}
                                >
                                    {t('nav.pricing')}
                                </Link>
                            </>
                        )}
                        {user && (
                            <Link
                                to="/catalogues"
                                className="text-sm font-light tracking-[0.02em] text-stone-500 transition-colors duration-500 hover:text-stone-800"
                                activeProps={{ className: 'text-stone-800' }}
                            >
                                {t('nav.catalogues')}
                            </Link>
                        )}
                    </div>

                    {/* Desktop User Menu */}
                    <div className="hidden items-center gap-3 md:flex flex-justify-end">
                        <LanguageSwitcher />

                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 animate-spin rounded-full border border-stone-200 border-t-stone-600"></div>
                            </div>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 text-stone-600 transition-colors duration-500 hover:text-stone-800"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-600">
                                        {user.name?.charAt(0).toUpperCase() ||
                                            'U'}
                                    </div>
                                    <span className="text-sm font-light tracking-[0.02em]">
                                        {user.name}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    disabled={logoutMutation.isPending}
                                    className="rounded-full border border-black/5 p-2 text-stone-400 transition-all duration-500 hover:border-black/10 hover:text-stone-600 disabled:opacity-50"
                                    title={t('nav.logout')}
                                >
                                    <LogOut
                                        className="h-4 w-4"
                                        strokeWidth={1.5}
                                    />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-light tracking-[0.02em] text-stone-500 transition-colors duration-500 hover:text-stone-800"
                                >
                                    {t('nav.signIn')}
                                </Link>
                                <Button asChild size="sm">
                                    <Link to="/register">
                                        {t('nav.getStarted')}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="md:hidden ml-auto">
                        <LanguageSwitcher />
                    </div>
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100 md:hidden"
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" strokeWidth={1.5} />
                        ) : (
                            <Menu className="h-6 w-6" strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`grid border-t border-black/5 bg-white/95 backdrop-blur-md transition-[grid-template-rows] duration-300 ease-in-out md:hidden ${
                    mobileMenuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
            >
                <div className="overflow-hidden">
                    <div className="mx-auto max-w-7xl px-4 py-4">
                        {/* Mobile Navigation Links */}
                        <div className="flex flex-col gap-1">
                            <Link
                                to="/"
                                className="rounded-lg px-4 py-3 text-base font-light tracking-[0.02em] text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-800"
                                activeProps={{
                                    className: 'bg-stone-50 text-stone-800',
                                }}
                                onClick={closeMobileMenu}
                            >
                                {t('nav.home')}
                            </Link>
                            <Link
                                to="/about"
                                className="rounded-lg px-4 py-3 text-base font-light tracking-[0.02em] text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-800"
                                activeProps={{
                                    className: 'bg-stone-50 text-stone-800',
                                }}
                                onClick={closeMobileMenu}
                            >
                                {t('nav.about')}
                            </Link>
                            {!user && (
                                <>
                                    <Link
                                        to="/features"
                                        className="rounded-lg px-4 py-3 text-base font-light tracking-[0.02em] text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-800"
                                        activeProps={{
                                            className: 'bg-stone-50 text-stone-800',
                                        }}
                                        onClick={closeMobileMenu}
                                    >
                                        {t('nav.features')}
                                    </Link>
                                    <Link
                                        to="/pricing"
                                        className="rounded-lg px-4 py-3 text-base font-light tracking-[0.02em] text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-800"
                                        activeProps={{
                                            className: 'bg-stone-50 text-stone-800',
                                        }}
                                        onClick={closeMobileMenu}
                                    >
                                        {t('nav.pricing')}
                                    </Link>
                                </>
                            )}
                            {user && (
                                <Link
                                    to="/catalogues"
                                    className="rounded-lg px-4 py-3 text-base font-light tracking-[0.02em] text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-800"
                                    activeProps={{
                                        className: 'bg-stone-50 text-stone-800',
                                    }}
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav.catalogues')}
                                </Link>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="my-4 border-t border-stone-100" />

                        {/* Mobile User Section */}
                        <div className="flex flex-col gap-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="h-5 w-5 animate-spin rounded-full border border-stone-200 border-t-stone-600"></div>
                                </div>
                            ) : user ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-800"
                                        onClick={closeMobileMenu}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-600">
                                            {user.name
                                                ?.charAt(0)
                                                .toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base font-medium">
                                                {user.name}
                                            </span>
                                            <span className="text-sm text-stone-400">
                                                {t('nav.viewProfile')}
                                            </span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        disabled={logoutMutation.isPending}
                                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700 disabled:opacity-50"
                                    >
                                        <LogOut
                                            className="h-5 w-5"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-base font-light">
                                            {t('nav.logout')}
                                        </span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 px-4">
                                    <Button asChild className="w-full">
                                        <Link
                                            to="/register"
                                            onClick={closeMobileMenu}
                                        >
                                            {t('nav.getStarted')}
                                        </Link>
                                    </Button>
                                    <Link
                                        to="/login"
                                        className="w-full rounded-lg py-3 text-center text-base font-light tracking-[0.02em] text-stone-500 transition-colors hover:text-stone-800"
                                        onClick={closeMobileMenu}
                                    >
                                        {t('nav.signIn')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
