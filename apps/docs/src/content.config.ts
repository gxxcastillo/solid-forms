import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { type ContentConfig, defineCollection } from 'astro:content';

export const collections: ContentConfig['collections'] = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() })
};
