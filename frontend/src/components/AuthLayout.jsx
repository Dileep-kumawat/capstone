import { Outlet } from 'react-router';
import { AuthProvider } from './AuthContext';

export default function AuthLayout() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
