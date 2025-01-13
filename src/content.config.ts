// Import glob loader
import { glob } from "astro/loaders";
// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';

// 2. Define a `loader` and `schema` for each collection
const blog = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: "./src/collections/posts" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
        publishDate: z.date(),
    })
});

const projects = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: "./src/collections/projects" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        url: z.string().url().optional(),
    })
})

// 3. Export a single `collections` object to register your collection(s)
export const collections = { blog, projects };
