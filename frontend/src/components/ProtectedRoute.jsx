import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-[#e2e8f0]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                         style={{ borderColor: '#22d3ee', borderTopColor: 'transparent' }} />
                    <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                        Authenticating...
                    </span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return children;
}
