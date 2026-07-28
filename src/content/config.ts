import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    photoAuthor: z.string().optional(),
  }),
});

const organizations = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    type: z.string(), // Allows flexibility for different organization types
    workHours: z.string(),
    phone: z.string(),
    contact: z.string().optional(),
    description: z.string(),
    heroImage: z.string().optional(),
    location: z.tuple([z.number(), z.number()]),
    mapUrl: z.string(),
    facebook: z.string().optional(),
    facebookUrl: z.string().optional(),
    instagram: z.string().optional(),
    instagramUrl: z.string().optional(),
  }),
});

const events = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    datetime: z.coerce.date(),
    location: z.string(),
    category: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, organizations, events };
