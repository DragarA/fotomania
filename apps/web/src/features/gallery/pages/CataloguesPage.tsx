import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CatalogueCard } from "../components/catalogue/CatalogueCard";
import { CatalogueFormModal } from "../components/catalogue/CatalogueFormModal";
import { useCataloguesQuery } from "../hooks";

export function CataloguesPage() {
    const { t } = useTranslation('gallery');
    const navigate = useNavigate();
    const { data, isLoading, isError, error } = useCataloguesQuery();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleCreateSuccess = (catalogueId: string) => {
        navigate({ to: '/catalogues/$catalogueId', params: { catalogueId } });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('catalogues.title')}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {t('catalogues.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors cursor-pointer"
                >
                    + {t('catalogues.createButton')}
                </button>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('catalogues.loading')}</p>
                </div>
            ) : isError ? (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error?.message || t('catalogues.error')}
                </div>
            ) : data && data.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {data.map((catalogue) => (
                        <CatalogueCard key={catalogue.id} catalogue={catalogue} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                        {t('catalogues.empty.title')}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {t('catalogues.empty.message')}
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center px-5 py-3 bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-colors cursor-pointer"
                    >
                        {t('catalogues.createButton')}
                    </button>
                </div>
            )}

            <CatalogueFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
