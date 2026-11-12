import type { APIRoute } from 'astro';

import { createRssResponse } from '../../lib/rss';

export const prerender = true;

export const GET: APIRoute = (context) => createRssResponse('id', context.site);
