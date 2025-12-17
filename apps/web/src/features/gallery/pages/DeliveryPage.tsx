import { useParams } from '@tanstack/react-router';
import { Download, Package, Mail, Image, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api-client';

import { PasswordPrompt } from '../components/public/PasswordPrompt';
import {
    useDeliveryQuery,
    useDeliveryAccess,
    getDeliveryAccessToken,
} from '../hooks/useDelivery';

export function DeliveryPage() {
    const { slug } = useParams({ from: '/d/$slug' });
    const { t } = useTranslation('delivery');
    const [isDownloading, setIsDownloading] = useState(false);

    // Password protection
    const {
        verifyPassword,
        isPending: isVerifying,
        error: verifyError,
    } = useDeliveryAccess(slug);

    // Data fetching
    const {
        data: delivery,
        isLoading: deliveryLoading,
        isError,
        error,
        refetch,
    } = useDeliveryQuery(slug);

    // Check if password is required (401 error)
    const isPasswordRequired =
        isError && (error as Error & { status?: number })?.status === 401;

    // Handle password submit
    const handlePasswordSubmit = (password: string) => {
        verifyPassword(password, {
            onSuccess: () => {
                refetch();
            },
        });
    };

    // Handle download
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const token = getDeliveryAccessToken(slug);
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${API_BASE_URL}/public/delivery/${slug}/download`,
                { headers }
            );

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download =
                response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') ||
                `${delivery?.catalogueTitle}_delivery.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download error:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    // Loading state
    if (deliveryLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-300 border-t-stone-700"></div>
                    <p className="text-stone-600">{t('loading')}</p>
                </div>
            </div>
        );
    }

    // Password required
    if (isPasswordRequired) {
        return (
            <PasswordPrompt
                onSubmit={handlePasswordSubmit}
                isPending={isVerifying}
                error={verifyError as Error | null}
            />
        );
    }

    // Error state
    if (isError && !isPasswordRequired) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 p-4">
                <div className="text-center">
                    <Package className="mx-auto h-16 w-16 text-stone-400" />
                    <h1 className="mt-4 text-2xl font-light text-stone-800">
                        {t('notFound')}
                    </h1>
                    <p className="mt-2 text-stone-600">{t('notFoundDescription')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50">
            {/* Header */}
            <div className="border-b border-stone-200 bg-white/60 backdrop-blur-sm">
                <div className="mx-auto max-w-4xl px-6 py-8">
                    <div className="flex items-center gap-3 text-stone-400">
                        <Package className="h-5 w-5" />
                        <span className="text-xs uppercase tracking-[0.3em]">
                            {t('deliveryLabel')}
                        </span>
                    </div>
                    <h1 className="mt-3 text-3xl font-light tracking-wide text-stone-800">
                        {delivery?.catalogueTitle}
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-200/50">
                    {/* Recipient Info */}
                    <div className="border-b border-stone-100 px-8 py-6">
                        <div className="flex items-center gap-3 text-stone-500">
                            <Mail className="h-5 w-5" />
                            <span className="text-sm uppercase tracking-[0.2em]">
                                {t('preparedFor')}
                            </span>
                        </div>
                        <p className="mt-2 text-xl font-medium text-stone-800">
                            {String(delivery?.clientEmail || '') || t('noRecipient')}
                        </p>
                    </div>

                    {/* Photo Count */}
                    <div className="border-b border-stone-100 px-8 py-6">
                        <div className="flex items-center gap-3 text-stone-500">
                            <Image className="h-5 w-5" />
                            <span className="text-sm uppercase tracking-[0.2em]">
                                {t('photosIncluded')}
                            </span>
                        </div>
                        <p className="mt-2 text-xl font-medium text-stone-800">
                            {deliveryLoading ? (
                                <span className="text-stone-400">...</span>
                            ) : (
                                t('photoCount', { count: delivery?.photoCount || 0 })
                            )}
                        </p>
                    </div>

                    {/* Download Section */}
                    <div className="px-8 py-8">
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading || delivery?.photoCount === 0}
                            size="lg"
                            className="w-full bg-stone-800 py-6 text-base tracking-wide hover:bg-stone-900"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {t('downloading')}
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-5 w-5" />
                                    {t('downloadAll')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-stone-200 bg-white/40 py-6 text-center">
                <p className="text-xs tracking-wide text-stone-400">
                    {t('footer')}
                </p>
            </div>
        </div>
    );
}

