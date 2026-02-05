type ApiErrorLike = {
    body?: {
        message?: string;
    };
    message?: string;
};

export const getErrorMessage = (error: unknown, fallback: string) => {
    if (error && typeof error === 'object') {
        const apiError = error as ApiErrorLike;
        return apiError.body?.message || apiError.message || fallback;
    }
    return fallback;
};
