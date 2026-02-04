import { FileText, Mail, Pencil, Share2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface CollectionContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isDelivery?: boolean;
    hasInvoice?: boolean;
    onShareDelivery?: () => void;
    onSendDeliveryEmail?: () => void;
    onUploadInvoice?: () => void;
    onRemoveInvoice?: () => void;
}

export function CollectionContextMenu({
    x,
    y,
    onClose,
    onEdit,
    onDelete,
    isDelivery = false,
    hasInvoice = false,
    onShareDelivery,
    onSendDeliveryEmail,
    onUploadInvoice,
    onRemoveInvoice,
}: CollectionContextMenuProps) {
    const { t } = useTranslation('gallery');
    const menuRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ left: x, top: y });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    // Adjust position to keep menu within viewport
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const padding = 16;
            let left = x;
            let top = y;
            if (left + rect.width > window.innerWidth - padding) {
                left = window.innerWidth - rect.width - padding;
            }
            if (top + rect.height > window.innerHeight - padding) {
                top = window.innerHeight - rect.height - padding;
            }
            left = Math.max(padding, left);
            top = Math.max(padding, top);
            setCoords({ left, top });
        }
    }, [x, y]);

    const menuItems = [
        // Share delivery link (only for delivery collections)
        ...(isDelivery && onShareDelivery
            ? [
                  {
                      label: t('collectionContextMenu.shareDelivery'),
                      icon: <Share2 className="h-4 w-4" strokeWidth={1.5} />,
                      onClick: onShareDelivery,
                  },
              ]
            : []),
        // Send delivery email (only for delivery collections)
        ...(isDelivery && onSendDeliveryEmail
            ? [
                  {
                      label: t('collectionContextMenu.sendDeliveryEmail'),
                      icon: <Mail className="h-4 w-4" strokeWidth={1.5} />,
                      onClick: onSendDeliveryEmail,
                  },
              ]
            : []),
        // Upload/Remove invoice (only for delivery collections)
        ...(isDelivery && onUploadInvoice && !hasInvoice
            ? [
                  {
                      label: t('collectionContextMenu.uploadInvoice'),
                      icon: <FileText className="h-4 w-4" strokeWidth={1.5} />,
                      onClick: onUploadInvoice,
                  },
              ]
            : []),
        ...(isDelivery && onRemoveInvoice && hasInvoice
            ? [
                  {
                      label: t('collectionContextMenu.removeInvoice'),
                      icon: <FileText className="h-4 w-4" strokeWidth={1.5} />,
                      onClick: onRemoveInvoice,
                      danger: true,
                  },
              ]
            : []),
        {
            label: t('collectionContextMenu.edit'),
            icon: <Pencil className="h-4 w-4" strokeWidth={1.5} />,
            onClick: onEdit,
        },
        {
            label: t('collectionContextMenu.delete'),
            icon: <Trash2 className="h-4 w-4" strokeWidth={1.5} />,
            onClick: onDelete,
            danger: true,
        },
    ];

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-[1000] min-w-[200px] rounded border border-white/20 bg-white/95 py-2 shadow-[0_45px_120px_-90px_rgba(0,0,0,0.9)] backdrop-blur"
            style={{ left: coords.left, top: coords.top }}
        >
            {menuItems.map((item, index) => (
                <button
                    key={index}
                    onClick={() => {
                        item.onClick();
                        onClose();
                    }}
                    className={`flex w-full items-center gap-3 px-5 py-2 text-sm transition-colors ${
                        item.danger
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-stone-600 hover:bg-stone-100'
                    }`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </div>,
        document.body
    );
}
