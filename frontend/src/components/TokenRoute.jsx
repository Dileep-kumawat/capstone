import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuth } from './AuthContext'

const TokenRoute = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { checkAuth } = useAuth();

    useEffect(() => {
        const run = async () => {
            const token = searchParams.get('token');
            if (token) {
                localStorage.setItem('token', token);
                // Refresh auth context so ProtectedRoute sees the user immediately
                await checkAuth();
            }
            navigate('/');
        };
        run();
    }, [navigate, searchParams, checkAuth]);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#070b14', color: '#e2e8f0' }}>
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                     style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
                <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                    Authenticating...
                </span>
            </div>
        </div>
    )
}

export default TokenRoute
