import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface ConfirmDialogOptions {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

export function useConfirmDialog() {
    const { t } = useTranslation('common');

    const confirm = ({
        title,
        description,
        confirmLabel = t('confirmDialog.delete'),
        cancelLabel = t('confirmDialog.cancel'),
        onConfirm,
        onCancel,
    }: ConfirmDialogOptions) => {
        toast.custom(
            (t) => (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold mb-2">{title}</p>
                    {description && (
                        <p className="text-sm text-gray-600 mb-3">
                            {description}
                        </p>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                onConfirm();
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors cursor-pointer"
                        >
                            {confirmLabel}
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                onCancel?.();
                            }}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
            ),
            { duration: Infinity }
        );
    };

    const confirmDelete = (
        options: Omit<ConfirmDialogOptions, 'confirmLabel'>
    ) => {
        confirm({ ...options, confirmLabel: t('confirmDialog.delete') });
    };

    return { confirm, confirmDelete };
}
