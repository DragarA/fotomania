import { redirect } from '@tanstack/react-router';

export function requireAuth() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        throw redirect({
            to: '/login',
        });
    }
}
