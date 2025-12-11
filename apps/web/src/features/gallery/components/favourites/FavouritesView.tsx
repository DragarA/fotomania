import { useTranslation } from 'react-i18next';
import type { ClientFavouriteSession } from '../../hooks';

interface FavouritesViewProps {
  sessions: ClientFavouriteSession[] | undefined;
  isLoading: boolean;
  onSessionClick: (session: ClientFavouriteSession) => void;
}

export function FavouritesView({
  sessions,
  isLoading,
  onSessionClick,
}: FavouritesViewProps) {
  const { t } = useTranslation('gallery');
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="text-6xl mb-4">❤️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {t('favouritesView.noFavouritesYet')}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          {t('favouritesView.clientsWillAppear')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session.sessionId}
          className="p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 border-2 border-transparent transition-all cursor-pointer group"
          onClick={() => onSessionClick(session)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {session.email}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {session.photoCount} {session.photoCount === 1 ? t('favouritesView.photo') : t('favouritesView.photos')} •{' '}
                {new Date(session.createdAt).toLocaleDateString(t('favouritesView.locale'), {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
