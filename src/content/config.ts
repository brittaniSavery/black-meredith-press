import { z, defineCollection } from "astro:content";

const authorsCollection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    genres: z.array(z.string()),
    photo: z.string().optional(),
    socials: z.array(
      z.object({
        site: z.string(),
        url: z.string().url(),
      })
    ),
  }),
});

export const collections = {
  authors: authorsCollection,
};
