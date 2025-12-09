import { z } from 'zod';

export const collectionFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  catalogueId: z.string().uuid('Invalid catalogue ID'),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
