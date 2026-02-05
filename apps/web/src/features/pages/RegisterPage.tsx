import { Link, useNavigate } from '@tanstack/react-router';
import { Lock, Mail, User, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { GoogleSignInButton } from '../auth/GoogleSignInButton';
import { useAuth, useRegister } from '../auth/hooks';

export function RegisterPage() {
    const { t } = useTranslation('auth');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate({ to: '/profile' });
        }
    }, [user, navigate]);

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-stone-100 px-6 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-stone-200/60">
                        <UserPlus
                            className="h-6 w-6 text-stone-600"
                            strokeWidth={1.5}
                        />
                    </div>
                    <h1 className="text-3xl font-light tracking-[0.02em] text-stone-800">
                        {t('register.title')}
                    </h1>
                    <p className="mt-3 text-sm text-stone-500">
                        {t('register.subtitle')}
                    </p>
                </div>

                {/* Form Card */}
                <div className="rounded-lg border border-black/5 bg-white p-8 shadow-sm">
                    <RegisterForm />
                </div>

                {/* Footer Link */}
                <div className="mt-8 text-center">
                    <span className="text-sm text-stone-500">
                        {t('register.hasAccount')}{' '}
                    </span>
                    <Link
                        to="/login"
                        className="text-sm font-medium text-stone-700 underline underline-offset-4 transition-colors duration-300 hover:text-stone-900"
                    >
                        {t('register.signInLink')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

function RegisterForm() {
    const { t } = useTranslation('auth');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const registerMutation = useRegister();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate(
            { email, password, name },
            {
                onSuccess: () => {
                    navigate({ to: '/profile' });
                },
            }
        );
    };

    return (
        <div className="space-y-5">
            {/* Google Sign Up */}
            <GoogleSignInButton />

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-stone-400">
                        {t('oauth.orDivider')}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {registerMutation.isError && (
                    <div className="rounded border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm text-red-700">
                        {registerMutation.error instanceof Error
                            ? registerMutation.error.message
                            : t('register.error')}
                    </div>
                )}

                <div className="space-y-2">
                    <label
                        htmlFor="name"
                        className="block text-xs uppercase tracking-[0.2em] text-stone-500"
                    >
                        {t('register.nameLabel')}
                    </label>
                    <div className="relative">
                        <User
                            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                            strokeWidth={1.5}
                        />
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded border border-black/10 bg-stone-50/50 py-3 pl-11 pr-4 text-sm text-stone-800 transition-all duration-300 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none"
                            placeholder={t('register.namePlaceholder')}
                            autoComplete="name"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="block text-xs uppercase tracking-[0.2em] text-stone-500"
                    >
                        {t('register.emailLabel')}
                    </label>
                    <div className="relative">
                        <Mail
                            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                            strokeWidth={1.5}
                        />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded border border-black/10 bg-stone-50/50 py-3 pl-11 pr-4 text-sm text-stone-800 transition-all duration-300 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none"
                            placeholder={t('register.emailPlaceholder')}
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="password"
                        className="block text-xs uppercase tracking-[0.2em] text-stone-500"
                    >
                        {t('register.passwordLabel')}
                    </label>
                    <div className="relative">
                        <Lock
                            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                            strokeWidth={1.5}
                        />
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded border border-black/10 bg-stone-50/50 py-3 pl-11 pr-4 text-sm text-stone-800 transition-all duration-300 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none"
                            placeholder={t('register.passwordPlaceholder')}
                            autoComplete="new-password"
                        />
                    </div>
                    <p className="pt-1 text-xs text-stone-400">
                        {t('register.passwordHint')}
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="mt-6 w-full"
                >
                    {registerMutation.isPending ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border border-white/30 border-t-white" />
                            {t('register.creatingAccount')}
                        </>
                    ) : (
                        t('register.createAccountButton')
                    )}
                </Button>
            </form>
        </div>
    );
}
