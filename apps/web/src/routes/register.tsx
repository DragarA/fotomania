import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth, useRegister } from '../features/auth/hooks';

export const Route = createFileRoute('/register')({
    component: RegisterPage,
});

function RegisterPage() {
    const { t } = useTranslation('auth');
    const { user } = useAuth();
    const navigate = useNavigate();

    // Redirect to profile if already logged in
    useEffect(() => {
        if (user) {
            navigate({ to: '/profile' });
        }
    }, [user, navigate]);

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('register.title')}
                    </h1>
                    <p className="text-gray-600">{t('register.subtitle')}</p>
                </div>

                <RegisterForm />

                <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                    <span className="text-gray-600 mr-2">
                        {t('register.hasAccount')}
                    </span>
                    <Link
                        to="/login"
                        className="text-accent-600 font-semibold hover:text-accent-700 underline"
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
        <form onSubmit={handleSubmit} className="space-y-6">
            {registerMutation.isError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {registerMutation.error instanceof Error
                        ? registerMutation.error.message
                        : t('register.error')}
                </div>
            )}

            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    {t('register.nameLabel')}
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                    placeholder={t('register.namePlaceholder')}
                    autoComplete="name"
                />
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    {t('register.emailLabel')}
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                    placeholder={t('register.emailPlaceholder')}
                    autoComplete="email"
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                >
                    {t('register.passwordLabel')}
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                    placeholder={t('register.passwordPlaceholder')}
                    autoComplete="new-password"
                />
                <p className="text-xs text-gray-500 mt-2">
                    {t('register.passwordHint')}
                </p>
            </div>

            <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-accent-500 text-white font-semibold py-3 rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {registerMutation.isPending
                    ? t('register.creatingAccount')
                    : t('register.createAccountButton')}
            </button>
        </form>
    );
}
