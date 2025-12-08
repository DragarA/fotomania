import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '../features/auth/hooks';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              Capture. Organize. Share.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
              The ultimate platform for photographers to store, manage, and showcase
              their work beautifully.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/profile"
                  className="inline-block px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Go to Profile
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-block px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Get Started Free
                  </Link>
                  <button className="inline-block px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-indigo-600 transition-all">
                    Watch Demo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your photos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for professional photographers and
              enthusiasts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Unlimited Storage
              </h3>
              <p className="text-gray-600">
                Store all your high-resolution photos without worrying about space
                limits
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Organization
              </h3>
              <p className="text-gray-600">
                AI-powered tagging and smart albums make finding photos effortless
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-6">
                <svg
                  className="w-8 h-8 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Easy Sharing
              </h3>
              <p className="text-gray-600">
                Share galleries with clients and get feedback with built-in
                collaboration tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                1M+
              </div>
              <div className="text-gray-600 font-medium">Photos Stored</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                50K+
              </div>
              <div className="text-gray-600 font-medium">Photographers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2">
                100K+
              </div>
              <div className="text-gray-600 font-medium">Galleries Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                99.9%
              </div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to elevate your photography?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join thousands of photographers who trust Fotomania with their work
          </p>
          {!user && (
            <Link
              to="/login"
              className="inline-block px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Your Free Trial
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
