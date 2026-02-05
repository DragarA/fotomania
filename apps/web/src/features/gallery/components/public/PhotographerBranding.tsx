import { API_BASE_URL } from '@/lib/api-client';

interface PhotographerBrandingProps {
    businessName?: string | null;
    businessWebsite?: string | null;
    logoUrl?: string | null;
}

export function PhotographerBranding({
    businessName,
    businessWebsite,
    logoUrl,
}: PhotographerBrandingProps) {
    if (!businessName && !logoUrl) {
        return null;
    }

    const content = (
        <div className="flex items-center gap-3">
            {logoUrl && (
                <img
                    src={`${API_BASE_URL}/${logoUrl}`}
                    alt={businessName || 'Photographer logo'}
                    className="h-12 w-auto max-w-[200px] object-contain"
                />
            )}
            {businessName && !logoUrl && (
                <span className="text-sm font-medium tracking-wide text-stone-800">
                    {businessName}
                </span>
            )}
        </div>
    );

    if (businessWebsite) {
        return (
            <a
                href={businessWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-opacity hover:opacity-75"
            >
                {content}
            </a>
        );
    }

    return content;
}
