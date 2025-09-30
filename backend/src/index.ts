// Import Local.
import { contact } from './email';

//////////////////////////////
//////// Entry Point
//////////////////////////////
const fetch: ExportedHandlerFetchHandler<Env> = async (request, environment, context) => {
	console.log('request url', request.url)
	const url = new URL(request.url);

	// API Routes. 🚏
	if (request.method === 'POST' && url.pathname === '/api/email/contact') {
		return await contact(request, environment, context);
	}

	// Serve static assets. ⚡️
	return environment.ASSETS.fetch(request);
};

export default { fetch };

//////////////////////////////
//////// Environment
//////////////////////////////
interface Env extends Cloudflare.Env {
	ASSETS: Fetcher;
}
