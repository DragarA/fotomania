import { Link } from '@tanstack/react-router';
import { LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { useAuth, useLogout } from '../../features/auth/hooks';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export function Navigation() {
    const { t } = useTranslation('common');
    const { user, isLoading } = useAuth();
    const logoutMutation = useLogout();

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo and Navigation */}
                    <div className="flex items-center gap-10">
                        <Link
                            to="/"
                            className="text-xl font-light tracking-[0.02em] text-stone-800 transition-colors duration-500 hover:text-stone-600"
                        >
                            Fotomania
                        </Link>
                        <div className="hidden items-center gap-8 md:flex">
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
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
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
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden text-sm font-light tracking-[0.02em] md:block">
                                        {user.name}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    disabled={logoutMutation.isPending}
                                    className="rounded-full border border-black/5 p-2 text-stone-400 transition-all duration-500 hover:border-black/10 hover:text-stone-600 disabled:opacity-50"
                                    title={t('nav.logout')}
                                >
                                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
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
                </div>
            </div>
        </nav>
    );
}
