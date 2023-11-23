// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';

// 2. Define a `type` and `schema` for each collection
const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        isDraft: z.boolean(),
        title: z.string(),
        description: z.string(),
        sortOrder: z.number(),
        image: z.object({
            url: z.string(),
            alt: z.string(),
        }),
        author: z.string().default('Anonymous'),
        language: z.enum(['en', 'es']),
        tags: z.array(z.string()),
        // An optional frontmatter property. Very common!
        // footnote: z.string().optional(),
        // In frontmatter, dates written without quotes around them are interpreted as Date objects
        publishDate: z.date(),
        // You can also transform a date string (e.g. "2022-07-08") to a Date object
        // publishDate: z.string().transform((str) => new Date(str)),
        // Advanced: Validate that the string is also an email
        // authorContact: z.string().email(),
        // Advanced: Validate that the string is also a URL
        canonicalURL: z.string().url(),
    })
})

// 3. Export a single `collections` object to register your collection(s)
export const collections = {
    'blog': blogCollection,
};