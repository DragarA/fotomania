import { Link } from '@tanstack/react-router';
import { RotateCcw } from 'lucide-react';

import { IS_DEMO_MODE, resetFotomaniaDemo } from '@/lib/demo-mode';

export function DemoBanner() {
    if (!IS_DEMO_MODE) return null;

    return (
        <div className="sticky top-0 z-[60] border-b border-stone-700 bg-stone-900 px-4 py-2 text-xs text-stone-200">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 font-medium uppercase tracking-wider text-amber-300">
                        Interactive Demo
                    </span>
                    <span className="text-stone-400">Jump to:</span>
                    <Link
                        to="/catalogues"
                        className="underline decoration-stone-600 underline-offset-4 hover:text-white"
                    >
                        Studio Dashboard
                    </Link>
                    <Link
                        to="/catalogues/$catalogueId"
                        params={{ catalogueId: 'cat-tuscany' }}
                        className="underline decoration-stone-600 underline-offset-4 hover:text-white"
                    >
                        Gallery Workspace
                    </Link>
                    <Link
                        to="/c/$slug"
                        params={{ slug: 'tuscany-golden-hour' }}
                        className="underline decoration-stone-600 underline-offset-4 hover:text-white"
                    >
                        Client Selection
                    </Link>
                    <Link
                        to="/d/$slug"
                        params={{ slug: 'tuscany-delivery' }}
                        className="underline decoration-stone-600 underline-offset-4 hover:text-white"
                    >
                        Final Delivery
                    </Link>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        resetFotomaniaDemo();
                        window.location.reload();
                    }}
                    className="inline-flex items-center gap-1 text-stone-400 hover:text-white"
                >
                    <RotateCcw className="h-3 w-3" />
                    Reset Demo
                </button>
            </div>
        </div>
    );
}
