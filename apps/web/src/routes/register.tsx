import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth, useRegister } from '../features/auth/hooks';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to profile if already logged in
  useEffect(() => {
    if (user) {
      navigate({ to: '/profile' });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">
            Join Fotomania and organize your memories
          </p>
        </div>

        <RegisterForm />

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <span className="text-gray-600 mr-2">Already have an account?</span>
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:text-indigo-700 underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const registerMutation = useRegister();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      { email, password, name },
      {
        onSuccess: () => {
          navigate({ to: '/profile' });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {registerMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {registerMutation.error instanceof Error
            ? registerMutation.error.message
            : 'Registration failed. Please check your information and try again.'}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
          placeholder="John Doe"
          autoComplete="name"
        />
      </div>

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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
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
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
          placeholder="Create a strong password"
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-500 mt-2">
          Must be at least 8 characters with uppercase, lowercase, number, and special
          character
        </p>
      </div>

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
}
