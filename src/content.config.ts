import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: ({ image }) =>
		z
			.object({
				title: z.string().min(1).max(120),
				description: z.string().min(1).max(200),
				pubDate: z.coerce.date(),
				updatedDate: z.coerce.date().optional(),
				heroImage: image().optional(),
				heroImageAlt: z.string().min(1).optional(),
				tags: z.array(z.string().min(1)).default([]),
				draft: z.boolean().default(false),
				/** Shared across translations so language switching keeps the reader in place. */
				translationKey: z.string().min(1).optional(),
			})
			.refine((data) => data.heroImage === undefined || data.heroImageAlt !== undefined, {
				message: 'heroImageAlt is required when heroImage is set',
				path: ['heroImageAlt'],
			}),
});

export const collections = { blog };
