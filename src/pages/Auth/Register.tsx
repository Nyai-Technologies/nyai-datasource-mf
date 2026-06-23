import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../lib/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_RE   = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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

type FieldErrors = Partial<Record<'firstName' | 'lastName' | 'entityName' | 'email' | 'password' | 'confirm', string>>;

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [entityName, setEntityName] = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState<FieldErrors>({});
  const [apiError, setApiError]     = useState('');
  const [success, setSuccess]       = useState(false);

  const clearField = (field: keyof FieldErrors) =>
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim())  e.lastName  = 'Last name is required';
    if (!entityName.trim()) e.entityName = 'Organisation name is required';
    if (!email)                         e.email    = 'Email is required';
    else if (!EMAIL_RE.test(email))     e.email    = 'Please enter a valid email address';
    if (!password)                      e.password = 'Password is required';
    else if (!PWD_RE.test(password))    e.password = 'Min 8 characters: uppercase, lowercase, number, and special character (@$!%*?&)';
    if (!confirm)                       e.confirm  = 'Please confirm your password';
    else if (password !== confirm)      e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await auth.register(email.trim(), password, firstName.trim(), lastName.trim(), entityName.trim());
      setSuccess(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: keyof FieldErrors) =>
    `block w-full px-4 py-3 border ${errors[field] ? 'border-red-300' : 'border-[#b8c1d3]'} rounded-lg text-sm text-[#374151] placeholder-[#9ca3af] outline-none focus:border-[#1e7070] focus:ring-1 focus:ring-[#1e7070]`;

  if (success) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col justify-center py-12 px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="bg-white py-10 px-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] rounded-xl sm:px-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[rgba(30,112,112,0.1)] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#1e7070]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#374151] mb-2">Account created</h2>
            <p className="text-sm text-[#9ca3af] mb-6">Your account has been registered successfully. You can now log in.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#1e7070] hover:bg-[#185f5f] transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="mb-8 text-center text-2xl font-normal text-[#374151]">Create Account</h2>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                  First name <span className="text-red-500">*</span>
                </label>
                <input id="firstName" type="text" autoFocus autoComplete="given-name" value={firstName}
                  onChange={e => { setFirstName(e.target.value); clearField('firstName'); }}
                  placeholder="First" className={inputCls('firstName')} />
                {errors.firstName && <p className="mt-1.5 text-xs text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input id="lastName" type="text" autoComplete="family-name" value={lastName}
                  onChange={e => { setLastName(e.target.value); clearField('lastName'); }}
                  placeholder="Last" className={inputCls('lastName')} />
                {errors.lastName && <p className="mt-1.5 text-xs text-red-600">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="entityName" className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                Organisation name <span className="text-red-500">*</span>
              </label>
              <input id="entityName" type="text" autoComplete="organization" value={entityName}
                onChange={e => { setEntityName(e.target.value); clearField('entityName'); }}
                placeholder="Your company or organisation" className={inputCls('entityName')} />
              {errors.entityName && <p className="mt-1.5 text-sm text-red-600">{errors.entityName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input id="email" type="email" autoComplete="email" value={email}
                onChange={e => { setEmail(e.target.value); clearField('email'); }}
                placeholder="Enter your organisation email" className={inputCls('email')} />
              {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input id="password" type={showPwd ? 'text' : 'password'} autoComplete="new-password" value={password}
                  onChange={e => { setPassword(e.target.value); clearField('password'); }}
                  placeholder="Minimum 8 characters" className={inputCls('password')} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9ca3af] opacity-60 hover:opacity-100 transition-opacity">
                  {showPwd ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
              {errors.password
                ? <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
                : <p className="mt-1.5 text-xs text-[#9ca3af]">At least 8 characters: uppercase, lowercase, number, and special character.</p>
              }
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-[#9ca3af] mb-1.5">
                Confirm password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input id="confirm" type={showPwd ? 'text' : 'password'} autoComplete="new-password" value={confirm}
                  onChange={e => { setConfirm(e.target.value); clearField('confirm'); }}
                  placeholder="Re-enter password" className={inputCls('confirm')} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9ca3af] opacity-60 hover:opacity-100 transition-opacity">
                  {showPwd ? <EyeOpen /> : <EyeOff />}
                </button>
              </div>
              {errors.confirm && <p className="mt-1.5 text-sm text-red-600">{errors.confirm}</p>}
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#1e7070] hover:bg-[#185f5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e7070] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-[#9ca3af]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#1e7070] hover:underline">Log In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
