// Cloudflare Worker entrypoint for the static Vite build used by Sites.
// Static files are served through the Sites-provided ASSETS binding.
const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const assetUrl = new URL(requestedPath, request.url);
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));

    // Keep client-side routes working when a user refreshes a deep link.
    if (response.status === 404 && !requestedPath.includes('.')) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }
    return response;
  },
};

export default worker;
