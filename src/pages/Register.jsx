// client/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Card, Input, Label } from '../components/ui/shadcn';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(formData);
      if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#0a0b0d] px-4 py-10">
      <Card className="max-w-md w-full p-8 bg-[#121316] border border-neutral-800">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5efe6]/10 border border-[#f5efe6]/25 text-[#f5efe6] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#d8cdbf]" /> Zero-Broker Room Rental Platform
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Your Account</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Join as a User to search rooms or as an Owner to publish your rooms
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/40 text-rose-400 px-4 py-2.5 rounded-xl mb-4 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name *</Label>
            <Input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Kamal Kumar"
            />
          </div>

          <div>
            <Label>Email Address *</Label>
            <Input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
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

          <div>
            <Label>Phone Number *</Label>
            <Input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="9876543210"
            />
          </div>

          <div>
            <Label>Select Role *</Label>
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <div
                role="radio"
                aria-checked={formData.role === 'user'}
                onClick={() => setFormData({ ...formData, role: 'user' })}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all ${
                  formData.role === 'user'
                    ? isDark
                      ? 'bg-[#18191e] border-[#f5efe6] ring-1 ring-[#f5efe6]/40 text-white'
                      : 'bg-[#f3ede2] border-neutral-900 ring-1 ring-neutral-900/30 text-neutral-950 shadow-xs'
                    : isDark
                      ? 'bg-[#0f1013] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    formData.role === 'user'
                      ? isDark
                        ? 'border-[#f5efe6] bg-[#f5efe6]'
                        : 'border-neutral-900 bg-neutral-900'
                      : isDark
                        ? 'border-neutral-600 bg-transparent'
                        : 'border-neutral-400 bg-transparent'
                  }`}
                >
                  {formData.role === 'user' && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-neutral-950' : 'bg-white'}`} />
                  )}
                </div>
                <span className="font-semibold">Tenant / User</span>
              </div>

              <div
                role="radio"
                aria-checked={formData.role === 'owner'}
                onClick={() => setFormData({ ...formData, role: 'owner' })}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all ${
                  formData.role === 'owner'
                    ? isDark
                      ? 'bg-[#18191e] border-[#f5efe6] ring-1 ring-[#f5efe6]/40 text-white'
                      : 'bg-[#f3ede2] border-neutral-900 ring-1 ring-neutral-900/30 text-neutral-950 shadow-xs'
                    : isDark
                      ? 'bg-[#0f1013] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:border-neutral-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    formData.role === 'owner'
                      ? isDark
                        ? 'border-[#f5efe6] bg-[#f5efe6]'
                        : 'border-neutral-900 bg-neutral-900'
                      : isDark
                        ? 'border-neutral-600 bg-transparent'
                        : 'border-neutral-400 bg-transparent'
                  }`}
                >
                  {formData.role === 'owner' && (
                    <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-neutral-950' : 'bg-white'}`} />
                  )}
                </div>
                <span className="font-semibold">Owner</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 bg-[#0f1013] border border-neutral-800 rounded-lg px-3 py-2">
            Note: You can add your Profile Picture, Aadhaar, PAN, and Bank Account details anytime from your <strong>Profile</strong> page after signing in.
          </p>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <p className="text-neutral-400 text-center text-xs mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#f5efe6] font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </Card>
    </div>
  );
}