// client/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Label } from '../components/ui/shadcn';
import { Home, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b0d] px-4 py-8">
      <Card className="max-w-md w-full p-8 bg-[#121316] border border-neutral-800">
        <div className="text-center mb-6">
          <Link
            to="/"
            title="Back to Home"
            className="w-11 h-11 rounded-2xl bg-neutral-900 border border-[#d8cdbf]/40 flex items-center justify-center mx-auto mb-3 shadow-sm hover:border-[#d8cdbf] transition"
          >
            <Home className="w-6 h-6 text-[#f5efe6]" />
          </Link>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Sign in as User, Owner, or Admin
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/40 text-rose-400 px-4 py-2.5 rounded-xl mb-4 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-neutral-400 text-center text-xs mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#f5efe6] font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
}