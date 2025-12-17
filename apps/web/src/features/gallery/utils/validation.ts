import { z } from 'zod';

export const catalogueFormSchema = z.object({
    title: z
        .string()
        .min(1)
        .max(100),

    description: z
        .string()
        .max(500)
        .optional()
        .or(z.literal('')),

    publicUrlSlug: z
        .string()
        .min(3)
        .max(50)
        .regex(
            /^[a-z0-9-]+$/,
            'Slug can only contain lowercase letters, numbers, and hyphens'
        ),

    coverImage: z.url('Must be a valid URL').optional().or(z.literal(''))
});

export type CatalogueFormValues = z.infer<typeof catalogueFormSchema>;

export const catalogueCreateFormSchema = catalogueFormSchema.omit({
    publicUrlSlug: true,
    coverImage: true,
});
export type CatalogueCreateFormValues = z.infer<
    typeof catalogueCreateFormSchema
>;
export const collectionFormSchema = z.object({
    name: z
        .string()
        .min(1)
        .max(100),
    catalogueId: z.string().uuid('Invalid catalogue ID'),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
