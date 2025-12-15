import { createFileRoute, redirect } from '@tanstack/react-router';

import { ProfilePage } from '../features/pages/ProfilePage';

export const Route = createFileRoute('/profile')({
    beforeLoad: () => {
        // Check if user is authenticated by looking at localStorage
        // This is a simple check - the AuthProvider will handle the actual state
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw redirect({
                to: '/login',
            });
        }
    },
    component: ProfilePage,
});
