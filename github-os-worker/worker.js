// GitHub OS - OAuth Token Exchange Worker
// Deploy to Cloudflare Workers (free tier)

const CLIENT_ID = 'Ov23liAdo8bSKYgsNNQ9';
let CLIENT_SECRET = ''; // Will be set from env or below

const TOKEN_URL = 'https://github.com/login/oauth/access_token';

export default {
  async fetch(request, env, ctx) {
    // Use secret from env or fallback
    const clientSecret = env.GITHUB_CLIENT_SECRET || CLIENT_SECRET;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      const body = await request.json();
      const { code, code_verifier, redirect_uri } = body;

      if (!code || !code_verifier) {
        return jsonResponse({ error: 'Missing code or code_verifier' }, 400);
      }

      // Exchange code for token
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: clientSecret,
        code: code,
        code_verifier: code_verifier,
        redirect_uri: redirect_uri || 'https://www.awesomejerry.space/github-os/callback.html'
      });

      const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();

      if (data.error) {
        return jsonResponse({ error: data.error_description || data.error }, 400);
      }

      return jsonResponse(data);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://www.awesomejerry.space',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
