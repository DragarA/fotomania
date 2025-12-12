import { z } from 'zod';

export const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // JWT Secrets
    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET must be at least 32 characters long')
        .describe(
            'Secret key for signing access tokens. Must be a strong, random string.'
        ),

    JWT_REFRESH_SECRET: z
        .string()
        .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long')
        .describe(
            'Secret key for signing refresh tokens. Must be a strong, random string different from JWT_SECRET.'
        ),

    // Google OAuth (optional)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Node environment
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
    try {
        return envSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues
                .map(
                    (issue) =>
                        `  - ${issue.path.join('.')}: ${issue.message}`
                )
                .join('\n');

            throw new Error(
                `Environment validation failed:\n${errorMessages}\n\nPlease check your .env file and ensure all required variables are set correctly.`
            );
        }
        throw error;
    }
}
