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
        <div className="rounded-lg bg-stone-50 p-5">
            <div className="mb-2 flex items-center gap-2 text-stone-400">
                <span className="[&_svg]:h-4 [&_svg]:w-4 [&_svg]:stroke-[1.5]">
                    {icon}
                </span>
                <span className="text-[0.65rem] uppercase tracking-[0.2em]">
                    {label}
                </span>
            </div>
            <div className="text-stone-800">{children}</div>
        </div>
    );
}
