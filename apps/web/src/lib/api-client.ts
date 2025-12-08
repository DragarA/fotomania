import { OpenAPI } from '@repo/sdk';

// Configure the OpenAPI client
OpenAPI.BASE =
  ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:3000';

// Add request interceptor to include JWT token
OpenAPI.TOKEN = async () => {
  const token = localStorage.getItem('accessToken');
  return token || '';
};

// Add response interceptor to handle 401 errors
OpenAPI.interceptors.response.use(async (response: Response) => {
  if (response.status === 401) {
    // Token expired or invalid, clear auth state
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:logout'));
  }
  return response;
});

export { OpenAPI };
