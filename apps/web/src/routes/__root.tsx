import { QueryClient } from '@tanstack/react-query';
import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { useAuth, useLogout } from '../features/auth/hooks';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { user, isLoading } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
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
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-gray-700 hover:text-accent-600 font-medium transition-colors"
                  activeProps={{ className: 'text-accent-600' }}
                >
                  About
                </Link>
                {user && (
                  <Link
                    to="/catalogues"
                    className="text-gray-700 hover:text-accent-600 font-medium transition-colors"
                    activeProps={{ className: 'text-accent-600' }}
                  >
                    Catalogues
                  </Link>
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-600"></div>
                  <span className="text-gray-600 text-sm">Loading...</span>
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
                    {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 font-medium hover:text-accent-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-accent-500 text-white font-medium rounded-lg hover:bg-accent-600 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen">
        <Outlet />
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 text-gray-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-gray-900 text-lg font-bold mb-4">Fotomania</h3>
              <p className="text-sm">
                The ultimate platform for photographers to store, manage, and showcase
                their work beautifully.
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-accent-600 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent-600 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent-600 transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="hover:text-accent-600 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-accent-600 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent-600 transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-accent-600 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent-600 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent-600 transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2024 Fotomania. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
