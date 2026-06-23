import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EyeOpen = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPwd, setShowPwd]           = useState(false);
  const [emailError, setEmailError]     = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError]         = useState('');
  const [loading, setLoading]           = useState(false);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    if (!email) {
      setEmailError('Email is required'); valid = false;
    } else if (!EMAIL_RE.test(email)) {
      setEmailError('Please enter a valid email address'); valid = false;
    }
    if (!password) {
      setPasswordError('Password is required'); valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/data-sources', { replace: true });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <div className="text-4xl font-black text-[#031C30] tracking-tight">NYAI</div>
            <div className="text-xs font-medium tracking-widest uppercase text-[#1e7070]">Data Sources</div>
          </div>
        </div>

        <div className="bg-white py-10 px-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-xl sm:px-12">
          <h2 className="mb-8 text-center text-2xl font-normal text-[#374151]">Log In</h2>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                placeholder="Enter your organisation email"
                className={`block w-full px-4 py-3 border ${emailError ? 'border-red-300' : 'border-[#b8c1d3]'} rounded-lg text-sm text-[#374151] placeholder-[#9ca3af] outline-none focus:border-[#1e7070] focus:ring-1 focus:ring-[#1e7070]`}
              />
              {emailError && <p className="mt-1.5 text-sm text-red-600">{emailError}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                  placeholder="Enter your password"
                  className={`block w-full px-4 py-3 pr-10 border ${passwordError ? 'border-red-300' : 'border-[#b8c1d3]'} rounded-lg text-sm text-[#374151] placeholder-[#9ca3af] outline-none focus:border-[#1e7070] focus:ring-1 focus:ring-[#1e7070]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9ca3af] opacity-60 hover:opacity-100 transition-opacity"
                >
                  {showPwd ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
              {passwordError && <p className="mt-1.5 text-sm text-red-600">{passwordError}</p>}
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#1e7070] hover:bg-[#185f5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e7070] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>

            <p className="text-center text-sm text-[#9ca3af]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1e7070] hover:underline">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
