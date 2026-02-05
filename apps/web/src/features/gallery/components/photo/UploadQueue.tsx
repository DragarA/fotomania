import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UploadingFile } from '../../types';

interface UploadQueueProps {
    files: UploadingFile[];
    onRemove: (id: string) => void;
    onClear: () => void;
}

export function UploadQueue({ files, onRemove, onClear }: UploadQueueProps) {
    const { t } = useTranslation('gallery');
    const [isExpanded, setIsExpanded] = useState(true);

    const uploadingCount = files.filter((f) => f.status === 'uploading').length;
    const totalCount = files.length;
    const hasCompleted = files.some(
        (f) => f.status === 'success' || f.status === 'error'
    );

    if (files.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 w-full max-w-sm">
            <div className="rounded border border-white/20 bg-white/85 shadow-[0_60px_140px_-100px_rgba(0,0,0,0.95)] backdrop-blur">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-xs uppercase tracking-[0.4em] text-stone-500 transition hover:text-stone-800"
                >
                    <div className="flex items-center gap-3">
                        <span>📤</span>
                        <span>
                            {uploadingCount > 0
                                ? t('uploadQueue.uploading', {
                                      current: uploadingCount,
                                      total: totalCount,
                                  })
                                : t('uploadQueue.uploaded', {
                                      count: totalCount,
                                  })}
                        </span>
                    </div>
                    <span>{isExpanded ? '–' : '+'}</span>
                </button>

                {isExpanded && (
                    <div className="border-t border-black/5">
                        <div className="max-h-80 overflow-y-auto">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="border-b border-black/5 px-5 py-4 last:border-b-0"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-black/10 bg-stone-100">
                                            <img
                                                src={file.preview}
                                                alt={file.file.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate text-sm text-stone-800">
                                                    {file.file.name}
                                                </span>
                                                <div className="flex items-center gap-2 text-stone-500">
                                                    {file.status ===
                                                        'uploading' && (
                                                        <span className="h-4 w-4 animate-spin rounded-full border border-stone-400 border-t-stone-800" />
                                                    )}
                                                    {file.status ===
                                                        'success' && (
                                                        <span className="text-emerald-500">
                                                            ✓
                                                        </span>
                                                    )}
                                                    {file.status ===
                                                        'error' && (
                                                        <span className="text-red-500">
                                                            ×
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            onRemove(file.id)
                                                        }
                                                        className="text-stone-400 transition hover:text-stone-700"
                                                        title={t(
                                                            'uploadQueue.remove'
                                                        )}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                            {file.status === 'uploading' && (
                                                <div className="space-y-1">
                                                    <div className="h-1 w-full overflow-hidden rounded-full bg-stone-200/80">
                                                        <div
                                                            className="h-full rounded-full bg-stone-700 transition-all"
                                                            style={{
                                                                width: `${file.progress}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs uppercase tracking-[0.3em] text-stone-400">
                                                        {Math.round(
                                                            file.progress
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                            )}

                                            {file.status === 'success' && (
                                                <span className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                                                    {t(
                                                        'uploadQueue.uploadComplete'
                                                    )}
                                                </span>
                                            )}

                                            {file.status === 'error' && (
                                                <div className="space-y-1 text-xs text-red-500">
                                                    <span>
                                                        {file.error ||
                                                            t(
                                                                'uploadQueue.uploadFailed'
                                                            )}
                                                    </span>
                                                    <button className="text-[0.65rem] uppercase tracking-[0.3em] text-stone-500">
                                                        {t('uploadQueue.retry')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasCompleted && (
                            <div className="border-t border-black/5 px-5 py-3 text-center">
                                <button
                                    onClick={onClear}
                                    className="text-[0.65rem] uppercase tracking-[0.4em] text-stone-500 transition hover:text-stone-800"
                                >
                                    {t('uploadQueue.clearCompleted')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
