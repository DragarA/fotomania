import { useState } from 'react';

import { UploadingFile } from './types';

interface UploadQueueProps {
  files: UploadingFile[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function UploadQueue({ files, onRemove, onClear }: UploadQueueProps) {
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
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-md">
      <div className="rounded-lg bg-white shadow-2xl border border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📤</span>
            <span className="font-medium text-gray-900">
              {uploadingCount > 0
                ? `Uploading ${uploadingCount} of ${totalCount} files...`
                : `${totalCount} file${totalCount === 1 ? '' : 's'} uploaded`}
            </span>
          </div>
          <span className="text-gray-500 text-xl">
            {isExpanded ? '−' : '+'}
          </span>
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200">
            <div className="max-h-96 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {file.file.name}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {file.status === 'uploading' && (
                            <span className="text-accent-600 text-lg animate-spin">
                              ⏳
                            </span>
                          )}
                          {file.status === 'success' && (
                            <span className="text-green-600 text-lg">✓</span>
                          )}
                          {file.status === 'error' && (
                            <span className="text-red-600 text-lg">✗</span>
                          )}
                          <button
                            onClick={() => onRemove(file.id)}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {file.status === 'uploading' && (
                        <div className="space-y-1">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-accent-500 h-2 rounded-full transition-all duration-200 cursor-pointer"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(file.progress)}%
                          </span>
                        </div>
                      )}

                      {file.status === 'success' && (
                        <span className="text-xs text-green-600">
                          Upload complete
                        </span>
                      )}

                      {file.status === 'error' && (
                        <div className="space-y-1">
                          <span className="text-xs text-red-600 block">
                            {file.error || 'Upload failed'}
                          </span>
                          <button className="text-xs text-accent-600 hover:text-accent-700 font-medium cursor-pointer">
                            Retry
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasCompleted && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClear}
                  className="w-full text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors cursor-pointer"
                >
                  Clear Completed
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
