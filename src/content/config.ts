import { z, defineCollection } from "astro:content";

const authorsCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      genres: z.array(z.string()),
      photo: image(),
      socials: z.object({
        facebook: z.string().url(),
        instagram: z.string().url(),
        twitter: z.string().url(),
        goodreads: z.string().url(),
        hardcover: z.string().url().optional(),
      }),
    }),
});

export const collections = {
  authors: authorsCollection,
};
