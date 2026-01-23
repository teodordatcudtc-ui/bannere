import { NextResponse } from 'next/server'

/**
 * GET /api/social-accounts/tiktok-logout
 * Intermediate endpoint that does TikTok logout, then redirects to OAuth
 * This helps force TikTok to show login page instead of auto-login
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const oauthUrl = searchParams.get('oauth_url')
  
  if (!oauthUrl) {
    return NextResponse.json(
      { error: 'Missing oauth_url parameter' },
      { status: 400 }
    )
  }
  
  // Return an HTML page that:
  // 1. Opens an iframe to TikTok logout (to clear session)
  // 2. Then redirects to OAuth URL
  // The iframe will attempt to clear TikTok session before OAuth
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head>
  <title>Preparing TikTok Login...</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 20px;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Preparing TikTok login...</p>
  </div>
  <iframe 
    id="logoutFrame" 
    src="https://www.tiktok.com/logout" 
    style="display: none; width: 0; height: 0; position: absolute; left: -9999px;"
    sandbox="allow-same-origin allow-scripts"
  ></iframe>
  <script>
    (function() {
      const oauthUrl = ${JSON.stringify(oauthUrl)};
      let redirectAttempted = false;
      
      // Function to redirect to OAuth with max_age=0
      function redirectToOAuth() {
        if (redirectAttempted) return;
        redirectAttempted = true;
        
        // Modify OAuth URL to add max_age=0 parameter directly to TikTok URL
        // This forces TikTok to show login page every time (OAuth/OIDC standard)
        try {
          // Parse the OAuth URL - it might be a redirect URL that goes through Outstand
          // We need to extract the final TikTok URL and add parameters there
          let finalUrl = oauthUrl;
          
          // If URL contains TikTok authorize endpoint, modify it directly
          if (oauthUrl.includes('tiktok.com/v2/auth/authorize') || oauthUrl.includes('tiktok.com/oauth/authorize')) {
            const url = new URL(oauthUrl);
            
            // CRITICAL: Add max_age=0 to force re-authentication (OAuth/OIDC standard)
            url.searchParams.set('max_age', '0');
            
            // Also add prompt parameters
            url.searchParams.set('prompt', 'select_account login');
            
            finalUrl = url.toString();
            console.log('✅ Modified TikTok OAuth URL with max_age=0:', finalUrl.substring(0, 200));
          } else {
            // URL might go through Outstand first, then to TikTok
            // Try to add parameters anyway - Outstand might forward them
            const url = new URL(oauthUrl);
            url.searchParams.set('max_age', '0');
            url.searchParams.set('provider_max_age', '0');
            url.searchParams.set('prompt', 'select_account login');
            url.searchParams.set('provider_prompt', 'select_account login');
            finalUrl = url.toString();
            console.log('✅ Added max_age=0 to OAuth URL (may be forwarded to TikTok):', finalUrl.substring(0, 200));
          }
          
          // Redirect to modified OAuth URL
          // If we're in a popup, add from_popup parameter to callback URL so it knows to close popup
          if (window.opener) {
            // We're in a popup - modify callback URL in OAuth URL to include from_popup parameter
            try {
              const urlObj = new URL(finalUrl);
              // Extract callback URL from redirect_uri parameter
              const redirectUri = urlObj.searchParams.get('redirect_uri');
              if (redirectUri) {
                const callbackUrl = new URL(redirectUri);
                callbackUrl.searchParams.set('from_popup', 'true');
                urlObj.searchParams.set('redirect_uri', callbackUrl.toString());
                finalUrl = urlObj.toString();
              }
            } catch (e) {
              console.log('Could not modify callback URL:', e);
            }
          }
          
          window.location.href = finalUrl;
        } catch (e) {
          // If URL parsing fails, redirect to original URL
          console.error('Could not modify OAuth URL:', e);
          window.location.href = oauthUrl;
        }
      }
      
      // Wait a bit for logout iframe to load, then redirect
      // The iframe attempts to clear TikTok session
      setTimeout(redirectToOAuth, 1500);
      
      // Also try to detect when iframe loads and redirect
      const logoutFrame = document.getElementById('logoutFrame');
      if (logoutFrame) {
        logoutFrame.onload = function() {
          // Iframe loaded, wait a bit more then redirect
          setTimeout(redirectToOAuth, 500);
        };
      }
      
      // Fallback: redirect after 3 seconds regardless
      setTimeout(redirectToOAuth, 3000);
    })();
  </script>
</body>
</html>`,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  )
}
