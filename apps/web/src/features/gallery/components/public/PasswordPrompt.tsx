import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PasswordPromptProps {
    onSubmit: (password: string) => void;
    isPending: boolean;
    error: Error | null;
}

export function PasswordPrompt({
    onSubmit,
    isPending,
    error,
}: PasswordPromptProps) {
    const { t } = useTranslation('public');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.trim()) {
            onSubmit(password);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(27,24,20,0.95))] px-4">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="rounded-2xl border border-white/10 bg-white/95 p-8 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-10">
                    {/* Icon */}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-stone-100 to-stone-200 shadow-inner">
                        <Lock
                            className="h-7 w-7 text-stone-600"
                            strokeWidth={1.5}
                        />
                    </div>

                    {/* Title */}
                    <h1 className="mb-2 text-center text-2xl font-light tracking-wide text-stone-800 sm:text-3xl">
                        {t('password.title')}
                    </h1>

                    {/* Description */}
                    <p className="mb-8 text-center text-sm text-stone-500">
                        {t('password.description')}
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('password.placeholder')}
                                className="w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-4 py-4 pr-12 text-stone-800 placeholder-stone-400 transition-all focus:border-stone-400 focus:bg-white focus:outline-none"
                                autoFocus
                                disabled={isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                                {error.message === 'Invalid password'
                                    ? t('password.error.invalid')
                                    : t('password.error.generic')}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isPending || !password.trim()}
                            className="w-full rounded-xl bg-gradient-to-r from-stone-800 to-stone-900 px-6 py-4 text-sm font-medium uppercase tracking-widest text-white shadow-lg transition-all hover:from-stone-700 hover:to-stone-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {t('password.verifying')}
                                </span>
                            ) : (
                                t('password.submit')
                            )}
                        </button>
                    </form>
                </div>

                {/* Subtle branding */}
                <p className="mt-6 text-center text-xs tracking-widest text-white/40">
                    {t('password.protected')}
                </p>
            </div>
        </div>
    );
}

