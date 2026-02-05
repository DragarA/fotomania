type JwtPayload = {
    exp?: number;
};

const decodeBase64Url = (value: string) => {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (padded.length % 4)) % 4);
    return atob(padded + padding);
};

export const getJwtExpiryMs = (token: string): number | null => {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        const payload = JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
        if (!payload.exp) return null;
        return payload.exp * 1000;
    } catch {
        return null;
    }
};
