import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = () => {
	const body = {
		status: 'ok',
		uptime: Math.round(process.uptime()),
		timestamp: new Date().toISOString(),
	};
	return Response.json(body, {
		headers: { 'Cache-Control': 'no-store' },
	});
};
