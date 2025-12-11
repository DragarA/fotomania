import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth, useLogout } from '../../features/auth/hooks';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export function Navigation() {
  const { t } = useTranslation('common');
  const { user, isLoading } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="text-2xl font-bold text-accent-600 hover:text-accent-700 transition-colors"
            >
              Fotomania
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-accent-600 font-medium transition-colors"
                activeProps={{ className: 'text-accent-600' }}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-accent-600 font-medium transition-colors"
                activeProps={{ className: 'text-accent-600' }}
              >
                {t('nav.about')}
              </Link>
              {user && (
                <Link
                  to="/catalogues"
                  className="text-gray-700 hover:text-accent-600 font-medium transition-colors"
                  activeProps={{ className: 'text-accent-600' }}
                >
                  {t('nav.catalogues')}
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-600"></div>
                <span className="text-gray-600 text-sm">{t('common.loading')}</span>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-accent-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {logoutMutation.isPending ? t('nav.loggingOut') : t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 font-medium hover:text-accent-600 transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-accent-500 text-white font-medium rounded-lg hover:bg-accent-600 transition-colors"
                >
                  {t('nav.getStarted')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
