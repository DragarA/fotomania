import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

interface PhotoContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onOpen: () => void;
    onDownload: () => void;
    onDelete: () => void;
    onSetAsCover?: () => void;
    isCurrentCover?: boolean;
    onPointerEnterMenu?: () => void;
    onPointerLeaveMenu?: () => void;
}

export function PhotoContextMenu({
    x,
    y,
    onClose,
    onOpen,
    onDownload,
    onDelete,
    onSetAsCover,
    isCurrentCover,
    onPointerEnterMenu,
    onPointerLeaveMenu,
}: PhotoContextMenuProps) {
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
        {
            label: t('photoContextMenu.open'),
            icon: (
                <svg
                    className="w-4 h-4 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                </svg>
            ),
            onClick: onOpen,
        },
        {
            label: t('photoContextMenu.download'),
            icon: (
                <svg
                    className="w-4 h-4 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                </svg>
            ),
            onClick: onDownload,
        },
        {
            label: isCurrentCover
                ? t('photoContextMenu.currentCover')
                : t('photoContextMenu.setAsCover'),
            icon: (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            ),
            onClick: onSetAsCover || (() => {}),
            disabled: isCurrentCover || !onSetAsCover,
        },
        {
            label: t('photoContextMenu.delete'),
            icon: (
                <svg
                    className="w-4 h-4 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            ),
            onClick: onDelete,
            danger: true,
        },
    ];

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-[1000] min-w-[200px] rounded border border-white/20 bg-white/95 py-2 text-left shadow-[0_45px_120px_-90px_rgba(0,0,0,0.9)] backdrop-blur"
            style={{ left: coords.left, top: coords.top }}
            onMouseEnter={onPointerEnterMenu}
            onMouseLeave={() => {
                onPointerLeaveMenu?.();
            }}
        >
            {menuItems.map((item, index) => (
                <button
                    key={index}
                    onClick={() => {
                        if (!item.disabled) {
                            item.onClick();
                            onClose();
                        }
                    }}
                    disabled={item.disabled}
                    className={`flex w-full items-center gap-3 px-5 py-2 text-sm transition-colors ${
                        item.disabled
                            ? 'cursor-not-allowed text-stone-300'
                            : item.danger
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
