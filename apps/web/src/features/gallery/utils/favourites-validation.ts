import { z } from 'zod';

export const saveFavouritesSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type SaveFavouritesFormValues = z.infer<typeof saveFavouritesSchema>;
