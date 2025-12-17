import { KeyRound, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { useUpdateCatalogueStatusMutation } from '../../hooks';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    catalogueId: string;
    isProtected: boolean;
}

type ModalMode = 'menu' | 'add' | 'change' | 'remove';

export function PasswordModal({
    isOpen,
    onClose,
    catalogueId,
    isProtected,
}: PasswordModalProps) {
    const { t } = useTranslation('gallery');
    const [mode, setMode] = useState<ModalMode>(isProtected ? 'menu' : 'add');
    const [password, setPassword] = useState('');
    const updateStatusMutation = useUpdateCatalogueStatusMutation(catalogueId);

    // Sync mode with isProtected when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode(isProtected ? 'menu' : 'add');
            setPassword('');
        }
    }, [isOpen, isProtected]);

    // Reset state when modal closes
    const handleClose = () => {
        setPassword('');
        onClose();
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        if (mode === 'remove') {
            // Send null to remove password
            updateStatusMutation.mutate(
                { password: undefined, status: 'published' },
                {
                    onSuccess: () => {
                        toast.success(t('passwordModal.removeSuccess'));
                        handleClose();
                    },
                    onError: (error) => {
                        toast.error(
                            error.message || t('passwordModal.updateError')
                        );
                    },
                }
            );
        } else {
            // Add or change password
            updateStatusMutation.mutate(
                { password, status: 'published' },
                {
                    onSuccess: () => {
                        toast.success(
                            t(
                                mode === 'add'
                                    ? 'passwordModal.addSuccess'
                                    : 'passwordModal.changeSuccess'
                            )
                        );
                        handleClose();
                    },
                    onError: (error) => {
                        toast.error(
                            error.message || t('passwordModal.updateError')
                        );
                    },
                }
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'menu' && t('passwordModal.manageTitle')}
                        {mode === 'add' && t('passwordModal.addTitle')}
                        {mode === 'change' && t('passwordModal.changeTitle')}
                        {mode === 'remove' && t('passwordModal.removeTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'menu' &&
                            t('passwordModal.manageDescription')}
                        {mode === 'add' && t('passwordModal.addDescription')}
                        {mode === 'change' &&
                            t('passwordModal.changeDescription')}
                        {mode === 'remove' &&
                            t('passwordModal.removeDescription')}
                    </DialogDescription>
                </DialogHeader>

                {mode === 'menu' && (
                    <div className="space-y-2">
                        <Button
                            onClick={() => setMode('change')}
                            variant="outline"
                            className="w-full justify-start"
                        >
                            <KeyRound className="w-4 h-4 mr-2" />
                            {t('passwordModal.changePasswordLink')}
                        </Button>
                        <Button
                            onClick={() => setMode('remove')}
                            variant="destructive"
                            className="w-full justify-start"
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            {t('passwordModal.removePasswordLink')}
                        </Button>
                    </div>
                )}

                {(mode === 'add' || mode === 'change') && (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {mode === 'add'
                                        ? t('passwordModal.passwordLabel')
                                        : t('passwordModal.newPasswordLabel')}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder={
                                        mode === 'add'
                                            ? t(
                                                  'passwordModal.passwordPlaceholder'
                                              )
                                            : t(
                                                  'passwordModal.newPasswordPlaceholder'
                                              )
                                    }
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                            >
                                {t('passwordModal.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateStatusMutation.isPending}
                            >
                                {mode === 'add'
                                    ? t('passwordModal.addButton')
                                    : t('passwordModal.changeButton')}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {mode === 'remove' && (
                    <DialogFooter>
                        {isProtected && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMode('menu')}
                            >
                                {t('passwordModal.backToOptions')}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                        >
                            {t('passwordModal.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleSubmit()}
                            disabled={updateStatusMutation.isPending}
                        >
                            {t('passwordModal.removeButton')}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
