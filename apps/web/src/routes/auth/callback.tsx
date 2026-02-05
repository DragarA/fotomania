import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth/hooks';
import { API_BASE_URL } from '@/lib/api-client';

export const Route = createFileRoute('/auth/callback')({
    component: AuthCallbackPage,
});

function AuthCallbackPage() {
    const { t } = useTranslation('auth');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            // Extract exchange code from URL query params
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (!code) {
                setError(t('oauth.error'));
                setTimeout(() => navigate({ to: '/login' }), 2000);
                return;
            }

            try {
                const exchangeResponse = await fetch(
                    `${API_BASE_URL}/auth/exchange`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code }),
                    }
                );

                if (!exchangeResponse.ok) {
                    throw new Error('Failed to exchange OAuth code');
                }

                const exchangeData = await exchangeResponse.json();

                // Fetch user data using the received token
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${exchangeData.accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const user = await response.json();

                // Store credentials in AuthContext
                login(
                    exchangeData.accessToken,
                    exchangeData.refreshToken,
                    user
                );

                // Redirect to profile
                navigate({ to: '/profile' });
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(t('oauth.error'));
                setTimeout(() => navigate({ to: '/login' }), 2000);
            }
        };

        handleCallback();
    }, [login, navigate, t]);

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-stone-100 px-6 py-12">
            <div className="text-center">
                {error ? (
                    <div className="space-y-4">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                            <span className="text-2xl">✕</span>
                        </div>
                        <p className="text-sm text-red-600">{error}</p>
                        <p className="text-xs text-stone-500">
                            {t('oauth.redirecting')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-stone-600" />
                        <p className="text-sm text-stone-600">
                            {t('oauth.loading')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
