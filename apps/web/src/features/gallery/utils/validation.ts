import { z } from 'zod';

export const catalogueFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),

  publicUrlSlug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),

  coverImage: z
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .or(z.literal('')),
});

export type CatalogueFormValues = z.infer<typeof catalogueFormSchema>;

export const catalogueCreateFormSchema = catalogueFormSchema.omit({ publicUrlSlug: true, coverImage: true });
export type CatalogueCreateFormValues = z.infer<typeof catalogueCreateFormSchema>;
export const collectionFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  catalogueId: z.string().uuid('Invalid catalogue ID'),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
