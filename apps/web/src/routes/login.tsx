import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth, useLogin } from '../features/auth/hooks';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to profile if already logged in
  useEffect(() => {
    if (user) {
      navigate({ to: '/profile' });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-8">
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to manage your photo collections</p>
        </div>

        <LoginForm />

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <span className="text-gray-600 mr-2">Don't have an account?</span>
          <Link
            to="/register"
            className="text-accent-600 font-semibold hover:text-accent-700 underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate({ to: '/profile' });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {loginMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          Invalid email or password. Please try again.
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 transition-colors"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-accent-500 text-white font-semibold py-3 rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
