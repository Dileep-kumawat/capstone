import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from './AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user, loading: authLoading, checkAuth } = useAuth();
    const navigate = useNavigate();

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError('Email and password are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // The backend /api/auth/login redirects to /auth/callback?token=... on success
            // or returns { message: ... } on error.
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                // If it succeeded, fetch will follow the redirect.
                // The final response URL will contain the token in the query params.
                const url = new URL(res.url);
                const token = url.searchParams.get('token');
                if (token) {
                    localStorage.setItem('token', token);
                    await checkAuth();
                    navigate('/');
                } else {
                    setError('Authentication token not received.');
                }
            } else {
                const data = await res.json();
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-[#070b14]">
            {/* Background grid */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{
                     backgroundImage: `
                         linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)
                     `,
                     backgroundSize: '40px 40px'
                 }}
            />

            {/* Radial glow */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{
                     background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,211,238,0.05) 0%, transparent 70%)'
                 }}
            />

            {/* Main content */}
            <div className="relative z-10 w-full max-w-[420px] px-6 animate-fadeIn">
                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                         style={{
                             background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(8,145,178,0.08))',
                             border: '1px solid rgba(34,211,238,0.3)',
                             boxShadow: '0 0 30px rgba(34,211,238,0.15)'
                         }}>
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                            <rect x="4" y="4" width="14" height="14" rx="2" fill="#22d3ee" opacity="0.9" />
                            <rect x="22" y="4" width="14" height="14" rx="2" fill="#22d3ee" opacity="0.4" />
                            <rect x="4" y="22" width="14" height="14" rx="2" fill="#22d3ee" opacity="0.4" />
                            <rect x="22" y="22" width="14" height="14" rx="2" fill="#22d3ee" opacity="0.9" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2"
                        style={{
                            background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #22d3ee 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                        Welcome Back
                    </h1>
                    <p className="text-sm" style={{ color: '#64748b' }}>
                        Log in to access your secure developer workspace
                    </p>
                </div>

                {/* Glassmorphic Form Card */}
                <div className="rounded-2xl p-8 border"
                     style={{
                         background: 'rgba(13, 20, 36, 0.45)',
                         borderColor: '#1e2d45',
                         backdropFilter: 'blur(16px)',
                         boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                     }}>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Email Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                                Email Address
                            </label>
                            <div className="w-full rounded-xl overflow-hidden"
                                 style={{
                                     background: 'rgba(255,255,255,0.02)',
                                     border: '1px solid #1e2d45',
                                     transition: 'border-color 0.2s'
                                 }}
                                 onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
                                 onBlurCapture={e => e.currentTarget.style.borderColor = '#1e2d45'}
                            >
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError(null); }}
                                    placeholder="name@domain.com"
                                    className="w-full outline-none bg-transparent px-4 py-3 text-sm"
                                    style={{ color: '#e2e8f0', caretColor: '#22d3ee' }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>
                                Password
                            </label>
                            <div className="w-full rounded-xl overflow-hidden"
                                 style={{
                                     background: 'rgba(255,255,255,0.02)',
                                     border: '1px solid #1e2d45',
                                     transition: 'border-color 0.2s'
                                 }}
                                 onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
                                 onBlurCapture={e => e.currentTarget.style.borderColor = '#1e2d45'}
                            >
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(null); }}
                                    placeholder="••••••••"
                                    className="w-full outline-none bg-transparent px-4 py-3 text-sm"
                                    style={{ color: '#e2e8f0', caretColor: '#22d3ee' }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="px-4 py-2.5 rounded-lg text-xs font-medium"
                                 style={{
                                     background: 'rgba(239,68,68,0.08)',
                                     border: '1px solid rgba(239,68,68,0.2)',
                                     color: '#fca5a5'
                                 }}>
                                ⚠ {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, #22d3ee, #0891b2)',
                                color: '#070b14',
                                boxShadow: '0 0 20px rgba(34,211,238,0.25)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 35px rgba(34,211,238,0.4)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.25)'}
                        >
                            {loading ? (
                                <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                                     style={{ borderColor: '#070b14', borderTopColor: 'transparent' }} />
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-[#1e2d45]" />
                        <span className="text-xs" style={{ color: '#475569' }}>or continue with</span>
                        <div className="flex-1 h-px bg-[#1e2d45]" />
                    </div>

                    {/* Google Login Button */}
                    <a
                        href="/api/auth/google"
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200"
                        style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderColor: '#1e2d45',
                            color: '#cbd5e1'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(34,211,238,0.2)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            e.currentTarget.style.borderColor = '#1e2d45';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        Google
                    </a>
                </div>

                {/* Footer link */}
                <p className="text-center text-xs mt-6" style={{ color: '#475569' }}>
                    Don't have an account?{' '}
                    <Link to="/register" className="font-semibold transition-colors" style={{ color: '#22d3ee' }} onMouseEnter={e => e.currentTarget.style.color = '#0891b2'} onMouseLeave={e => e.currentTarget.style.color = '#22d3ee'}>
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
