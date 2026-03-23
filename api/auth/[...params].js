// api/auth/[...params].js
// Handles GitHub OAuth for Decap CMS
// Vercel reads GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET from environment variables

const CLIENT_ID     = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const SITE_URL      = 'https://blesstech-x.vercel.app';

// ─── STEP 1: GitHub redirects back here with ?code=xxx ───────────────────────
async function handleCallback(code, res) {
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code:          code
      })
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      res.status(401).send(`
        <script>
          window.opener.postMessage(
            'authorization:github:error:${JSON.stringify({ error: tokenData.error })}',
            '${SITE_URL}'
          );
        </script>
      `);
      return;
    }

    // Send token back to Decap CMS via postMessage
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Authenticating...</title></head>
      <body>
        <p style="font-family:sans-serif;text-align:center;margin-top:40px;color:#0ea5e9">
          Logging you in to BLESSTech-X Admin...
        </p>
        <script>
          (function() {
            function receiveMessage(e) {
              console.log("receiveMessage %o", e);
            }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: "github" })}',
              '${SITE_URL}'
            );
          })();
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('OAuth error: ' + err.message);
  }
}

// ─── STEP 2: Decap CMS calls /api/auth to kick off the OAuth flow ────────────
function handleAuth(res) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope:     'repo,user',
    redirect_uri: `${SITE_URL}/api/auth/callback`
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  const { params } = req.query;
  const route = Array.isArray(params) ? params.join('/') : params;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', SITE_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (route === 'auth' || route === undefined) {
    // Redirect to GitHub OAuth
    handleAuth(res);

  } else if (route === 'callback') {
    // GitHub returned with auth code
    const code = req.query.code;
    if (!code) {
      res.status(400).send('Missing code parameter');
      return;
    }
    await handleCallback(code, res);

  } else {
    res.status(404).send('Not found');
  }
}
