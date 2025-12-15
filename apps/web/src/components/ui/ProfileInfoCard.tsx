import type { ReactNode } from 'react';

interface ProfileInfoCardProps {
    icon: ReactNode;
    label: string;
    children: ReactNode;
}

export function ProfileInfoCard({
    icon,
    label,
    children,
}: ProfileInfoCardProps) {
    return (
        <div className="rounded-xl bg-gray-50 p-6">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 text-accent-600">{icon}</div>
                <div className="flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-gray-700">
                        {label}
                    </h3>
                    {children}
                </div>
            </div>
        </div>
    );
}
