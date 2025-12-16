import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../../../components/ui/dialog';

interface SaveSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    favoritesCount: number;
}

export function SaveSuccessModal({
    isOpen,
    onClose,
    email,
    favoritesCount,
}: SaveSuccessModalProps) {
    const { t } = useTranslation('public');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="border border-black/5 bg-white/90 backdrop-blur">
                <DialogHeader>
                    <div className="mb-4 flex justify-center">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500" strokeWidth={1.5} />
                    </div>
                    <DialogTitle className="text-center text-2xl font-light tracking-[0.02em] text-stone-800">
                        {t('modal.success.title')}
                    </DialogTitle>
                    <DialogDescription className="text-center text-stone-500">
                        {t('modal.success.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded border border-black/5 bg-white/80 px-6 py-4 text-sm text-stone-600 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-[0.4em]">
                                {t('modal.success.emailLabel')}
                            </span>
                            <span className="font-light text-stone-800">
                                {email}
                            </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-[0.4em]">
                                {t('modal.success.photosSavedLabel')}
                            </span>
                            <span className="font-light text-stone-800">
                                {favoritesCount}{' '}
                                {favoritesCount === 1
                                    ? t('modal.success.photo')
                                    : t('modal.success.photos')}
                            </span>
                        </div>
                    </div>

                    <div className="text-sm text-stone-500">
                        <p>{t('modal.success.followUp', { email })}</p>
                    </div>
                </div>

                <DialogFooter>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded border border-black/10 bg-stone-900 px-6 py-3 text-[0.65rem] uppercase tracking-[0.4em] text-white transition hover:-translate-y-0.5"
                    >
                        {t('modal.success.close')}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
