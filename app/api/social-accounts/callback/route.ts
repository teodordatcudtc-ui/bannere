import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * GET /api/social-accounts/callback
 * Handle OAuth callback from Outstand after user authorizes Facebook
 * 
 * Flow:
 * 1. User authorizes on Facebook
 * 2. Facebook redirects here with session token
 * 3. We fetch available pages using GET /v1/social-accounts/pending/:session
 * 4. Redirect to selection page where user chooses which pages to connect
 */
export async function GET(request: Request) {
  console.log('🔵 CALLBACK HIT - OAuth redirect received')
  console.log('🔵 Request URL:', request.url)
  
  try {
    // Check if this is a popup callback first
    const { searchParams: initialSearchParams } = new URL(request.url)
    const isPopup = initialSearchParams.get('popup') === 'true'
    
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('🔵 User check:', user ? `User ID: ${user.id}` : 'No user')
    console.log('🔵 User error:', userError || 'None')
    console.log('🔵 Is popup:', isPopup)
    console.log('🔵 Request headers:', Object.fromEntries(request.headers.entries()))

    if (!user) {
      console.error('❌ No user found in callback')
      
      // For popup, try to get session from cookies manually
      // Popup might not share cookies with parent window
      if (isPopup) {
        // Return HTML that redirects to a server endpoint that can handle auth
        // The endpoint will set cookies and redirect back
        const redirectUrl = new URL('/api/social-accounts/callback', request.url)
        redirectUrl.searchParams.set('popup', 'true')
        // Copy all search params from current request
        const currentUrl = new URL(request.url)
        currentUrl.searchParams.forEach((value, key) => {
          if (key !== 'popup') {
            redirectUrl.searchParams.set(key, value)
          }
        })
        
        return new NextResponse(
          `<!DOCTYPE html>
<html>
<head>
  <title>Authentication Required</title>
</head>
<body>
  <script>
    // Try to get auth from parent window via postMessage
    if (window.opener) {
      let authReceived = false;
      
      // Request auth from parent
      window.opener.postMessage({
        type: 'REQUEST_AUTH_TOKEN'
      }, window.location.origin);
      
      // Listen for response
      const messageHandler = function(event) {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'AUTH_TOKEN_RESPONSE' && event.data.token && !authReceived) {
          authReceived = true;
          // Store token temporarily and reload with it
          sessionStorage.setItem('temp_auth_token', event.data.token);
          // Reload page - server should check for token in sessionStorage
          window.location.reload();
        } else if (event.data.type === 'AUTH_TOKEN_ERROR' && !authReceived) {
          authReceived = true;
          window.opener.postMessage({
            type: 'TIKTOK_OAUTH_ERROR',
            error: 'Authentication required. Please log in first.'
          }, window.location.origin);
          setTimeout(() => { window.close(); }, 2000);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Timeout
      setTimeout(function() {
        if (!authReceived) {
          authReceived = true;
          window.removeEventListener('message', messageHandler);
          window.opener.postMessage({
            type: 'TIKTOK_OAUTH_ERROR',
            error: 'Authentication timeout. Please try again.'
          }, window.location.origin);
          setTimeout(() => { window.close(); }, 500);
        }
      }, 5000);
    } else {
      // Not in popup, redirect to login
      window.location.href = '/auth/login?error=unauthorized&redirect=' + encodeURIComponent(window.location.href);
    }
  </script>
  <p>Authenticating... Please wait.</p>
</body>
</html>`,
          {
            headers: {
              'Content-Type': 'text/html',
            },
          }
        )
      }
      
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', request.url)
      )
    }

    if (!OUTSTAND_API_KEY) {
      console.error('❌ OUTSTAND_API_KEY not configured')
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=config', request.url)
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('session') || searchParams.get('session_token')
    const error = searchParams.get('error')
    const success = searchParams.get('success')

    console.log('🔵 Session token:', sessionToken ? 'Found' : 'Missing')
    console.log('🔵 OAuth error:', error || 'None')
    console.log('🔵 Success message:', success || 'None')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error)
      
      // Check if this is a popup callback
      const { searchParams } = new URL(request.url)
      const isPopup = searchParams.get('popup') === 'true'
      
      if (isPopup) {
        // Return an HTML page that closes the popup and sends error message to parent
        return new NextResponse(
          `<!DOCTYPE html>
<html>
<head>
  <title>Connection Error</title>
</head>
<body>
  <script>
    // Send error message to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'TIKTOK_OAUTH_ERROR',
        error: 'OAuth error: ${error}'
      }, window.location.origin);
      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 500);
    } else {
      // If no opener, redirect normally
      window.location.href = '/dashboard/settings?error=oauth_${error}';
    }
  </script>
  <p>Connection error. This window will close automatically.</p>
</body>
</html>`,
          {
            headers: {
              'Content-Type': 'text/html',
            },
          }
        )
      }
      
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=oauth_${error}`, request.url)
      )
    }

    // TikTok and some platforms return success directly without session token
    // In this case, try to extract account info from success message or fetch from Outstand
    if (!sessionToken && success) {
      console.log('🟡 No session token but success message - trying to sync accounts')
      console.log('🟡 Success message:', success)
      
      // Try to extract platform and username from success message
      // Format: "TikTok account @adlence.ai connected successfully"
      const platformMatch = success.match(/(\w+)\s+account/i)
      const usernameMatch = success.match(/@?(\w+\.?\w*)/)
      
      const platform = platformMatch ? platformMatch[1].toLowerCase() : null
      const username = usernameMatch ? usernameMatch[1] : null
      
      console.log('🟡 Extracted platform:', platform)
      console.log('🟡 Extracted username:', username)
      
      return await syncAccountsFromOutstand(supabase, user.id, request.url, platform, username)
    }

    if (!sessionToken) {
      // Check if this is a popup callback
      const isPopup = searchParams.get('popup') === 'true'
      
      if (isPopup) {
        return new NextResponse(
          `<!DOCTYPE html>
<html>
<head>
  <title>Connection Error</title>
</head>
<body>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'TIKTOK_OAUTH_ERROR',
        error: 'Missing session token'
      }, window.location.origin);
      setTimeout(() => { window.close(); }, 500);
    } else {
      window.location.href = '/dashboard/settings?error=missing_session';
    }
  </script>
  <p>Connection error. This window will close automatically.</p>
</body>
</html>`,
          {
            headers: {
              'Content-Type': 'text/html',
            },
          }
        )
      }
      
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=missing_session', request.url)
      )
    }

    // Step 1: Get available pages/accounts from Outstand
    // GET /v1/social-accounts/pending/:session
    try {
      const pendingResponse = await fetch(
        `${OUTSTAND_API_URL}/social-accounts/pending/${sessionToken}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!pendingResponse.ok) {
        const errorText = await pendingResponse.text()
        console.error('Outstand pending accounts error:', errorText)
        
        // Check if this is a popup callback
        const isPopup = searchParams.get('popup') === 'true'
        if (isPopup) {
          return new NextResponse(
            `<!DOCTYPE html>
<html>
<head>
  <title>Connection Error</title>
</head>
<body>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'TIKTOK_OAUTH_ERROR',
        error: 'Failed to fetch pages: ${errorText}'
      }, window.location.origin);
      setTimeout(() => { window.close(); }, 500);
    } else {
      window.location.href = '/dashboard/settings?error=failed_to_fetch_pages';
    }
  </script>
  <p>Connection error. This window will close automatically.</p>
</body>
</html>`,
            {
              headers: {
                'Content-Type': 'text/html',
              },
            }
          )
        }
        
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=failed_to_fetch_pages', request.url)
        )
      }

      const pendingData = await pendingResponse.json()
      console.log('🔵 Pending data from Outstand:', JSON.stringify(pendingData, null, 2))
      
      const availableAccounts = pendingData.accounts || pendingData.pages || []
      console.log('🔵 Available accounts:', availableAccounts.length)

      // If no accounts available, redirect with error
      if (!availableAccounts || availableAccounts.length === 0) {
        console.error('❌ No accounts available in pending response')
        
        // Check if this is a popup callback
        const isPopup = searchParams.get('popup') === 'true'
        if (isPopup) {
          return new NextResponse(
            `<!DOCTYPE html>
<html>
<head>
  <title>Connection Error</title>
</head>
<body>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'TIKTOK_OAUTH_ERROR',
        error: 'No pages available'
      }, window.location.origin);
      setTimeout(() => { window.close(); }, 500);
    } else {
      window.location.href = '/dashboard/settings?error=no_pages_available';
    }
  </script>
  <p>Connection error. This window will close automatically.</p>
</body>
</html>`,
            {
              headers: {
                'Content-Type': 'text/html',
              },
            }
          )
        }
        
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=no_pages_available', request.url)
        )
      }

      // If only one account, auto-connect it
      if (availableAccounts.length === 1) {
        console.log('🔵 Only one account, auto-connecting...')
        console.log('🔵 Account ID:', availableAccounts[0].id)
        return await finalizeConnection(supabase, user.id, sessionToken, [availableAccounts[0].id], request.url)
      }

      // Multiple accounts - redirect to selection page
      const baseUrl = new URL(request.url)
      const selectionUrl = new URL('/dashboard/settings/select-pages', baseUrl.origin)
      selectionUrl.searchParams.set('session', sessionToken)
      selectionUrl.searchParams.set('platform', pendingData.platform || 'facebook')
      
      return NextResponse.redirect(selectionUrl.toString())
    } catch (error: any) {
      console.error('Error fetching pending accounts:', error)
      
      // Check if this is a popup callback
      const isPopup = searchParams.get('popup') === 'true'
      if (isPopup) {
        return new NextResponse(
          `<!DOCTYPE html>
<html>
<head>
  <title>Connection Error</title>
</head>
<body>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'TIKTOK_OAUTH_ERROR',
        error: 'Connection failed: ${error.message || 'Unknown error'}'
      }, window.location.origin);
      setTimeout(() => { window.close(); }, 500);
    } else {
      window.location.href = '/dashboard/settings?error=connection_failed';
    }
  </script>
  <p>Connection error. This window will close automatically.</p>
</body>
</html>`,
          {
            headers: {
              'Content-Type': 'text/html',
            },
          }
        )
      }
      
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=connection_failed', request.url)
      )
    }
  } catch (error: any) {
    console.error('Error in OAuth callback:', error)
    
    // Check if this is a popup callback
    const { searchParams: catchSearchParams } = new URL(request.url)
    const isPopup = catchSearchParams.get('popup') === 'true'
    if (isPopup) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <title>Connection Error</title>
</head>
<body>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'TIKTOK_OAUTH_ERROR',
        error: 'Callback error: ${error.message || 'Unknown error'}'
      }, window.location.origin);
      setTimeout(() => { window.close(); }, 500);
    } else {
      window.location.href = '/dashboard/settings?error=callback_error';
    }
  </script>
  <p>Connection error. This window will close automatically.</p>
</body>
</html>`,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )
    }
    
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=callback_error', request.url)
    )
  }
}

/**
 * Sync accounts directly from Outstand API (for platforms like TikTok that don't use session tokens)
 */
async function syncAccountsFromOutstand(
  supabase: any,
  userId: string,
  baseUrl: string,
  platform?: string | null,
  username?: string | null
) {
  console.log('🟡 SYNC ACCOUNTS FROM OUTSTAND')
  console.log('🟡 User ID:', userId)
  console.log('🟡 Platform:', platform)
  console.log('🟡 Username:', username)
  
  const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
  const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

  try {
    // Try multiple endpoints to get accounts
    let accounts = []
    
    // Try 1: /v1/social-accounts
    console.log('🟡 Trying /v1/social-accounts endpoint...')
    try {
      const socialAccountsResponse = await fetch(
        `${OUTSTAND_API_URL}/social-accounts`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (socialAccountsResponse.ok) {
        const socialAccountsData = await socialAccountsResponse.json()
        console.log('🟡 /social-accounts response:', JSON.stringify(socialAccountsData, null, 2))
        
        if (Array.isArray(socialAccountsData)) {
          accounts = socialAccountsData
        } else if (socialAccountsData.accounts && Array.isArray(socialAccountsData.accounts)) {
          accounts = socialAccountsData.accounts
        } else if (socialAccountsData.data && Array.isArray(socialAccountsData.data)) {
          accounts = socialAccountsData.data
        }
      } else {
        console.log('🟡 /social-accounts returned:', socialAccountsResponse.status)
      }
    } catch (e) {
      console.log('🟡 /social-accounts error:', e)
    }

    // If no accounts found and we have platform/username from success message, create account manually
    if (accounts.length === 0 && platform && username) {
      console.log('🟡 No accounts from API, creating account from success message...')
      accounts = [{
        id: `manual_${Date.now()}`,
        platform: platform,
        username: username,
        name: username,
        network: platform,
      }]
      console.log('🟡 Created manual account:', accounts[0])
    }

    console.log('🟡 Final accounts:', JSON.stringify(accounts, null, 2))
    console.log('🟡 Accounts count:', accounts.length)

    if (accounts.length === 0) {
      console.error('No accounts found or created')
      
      // Check if this is a popup callback
      const { searchParams: noAccountsSearchParams } = new URL(baseUrl)
      const isPopup = noAccountsSearchParams.get('popup') === 'true'
      
      if (isPopup) {
        return new NextResponse(
          `<!DOCTYPE html>
<html>
<head>
  <title>Connection Error</title>
</head>
<body>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'TIKTOK_OAUTH_ERROR',
        error: 'No accounts found'
      }, window.location.origin);
      setTimeout(() => { window.close(); }, 500);
    } else {
      window.location.href = '/dashboard/settings?error=no_accounts_found';
    }
  </script>
  <p>Connection error. This window will close automatically.</p>
</body>
</html>`,
          {
            headers: {
              'Content-Type': 'text/html',
            },
          }
        )
      }
      
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=no_accounts_found', baseUrl)
      )
    }

    // Use admin client for all database operations
    const adminSupabase = createAdminClient()
    
    // Ensure user profile exists
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.warn('Profile not found, creating...')
      const { error: createProfileError } = await adminSupabase
        .from('profiles')
        .insert({ id: userId })
      
      if (createProfileError) {
        console.error('❌ Failed to create profile:', createProfileError)
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=profile_not_found', baseUrl)
        )
      }
    }

    // Save all accounts to database
    const savedAccounts = []
    for (const account of accounts) {
      // For manual accounts or accounts without ID, use username as outstand_account_id
      const outstandAccountId = account.id || account.account_id || account.username || `manual_${account.platform || account.network}_${Date.now()}`
      
      const accountToSave = {
        user_id: userId,
        outstand_account_id: outstandAccountId,
        platform: (account.platform || account.network || 'unknown').toLowerCase(),
        username: account.username || account.handle || account.name,
        name: account.name || account.display_name || account.username,
        is_active: true,
      }
      
      console.log('🟡 Saving account:', JSON.stringify(accountToSave, null, 2))
      
      // Try insert first, then update if it exists
      const { data: insertData, error: insertError } = await adminSupabase
        .from('social_accounts')
        .insert(accountToSave)
        .select()
      
      if (insertError) {
        // If unique constraint violation, update instead
        if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
          console.log('🟡 Account already exists, updating...')
          const { data: updateData, error: updateError } = await adminSupabase
            .from('social_accounts')
            .update({
              platform: accountToSave.platform,
              username: accountToSave.username,
              name: accountToSave.name,
              is_active: accountToSave.is_active,
            })
            .eq('user_id', accountToSave.user_id)
            .eq('outstand_account_id', accountToSave.outstand_account_id)
            .select()
          
          if (!updateError && updateData && updateData.length > 0) {
            savedAccounts.push(updateData[0])
            console.log('✅ Account updated successfully')
          }
        } else {
          console.error('❌ Error saving account:', insertError)
        }
      } else if (insertData && insertData.length > 0) {
        savedAccounts.push(insertData[0])
        console.log('✅ Account saved successfully:', JSON.stringify(insertData[0], null, 2))
      } else {
        console.warn('⚠️ No data returned from insert, trying to fetch...')
        // If no data returned, try to fetch it
        const { data: fetchedData, error: fetchError } = await adminSupabase
          .from('social_accounts')
          .select('*')
          .eq('user_id', accountToSave.user_id)
          .eq('outstand_account_id', accountToSave.outstand_account_id)
          .single()
        
        if (fetchedData) {
          savedAccounts.push(fetchedData)
          console.log('✅ Account fetched and added:', JSON.stringify(fetchedData, null, 2))
        } else {
          console.error('❌ Could not fetch account after insert. Fetch error:', fetchError)
        }
      }
    }

    console.log('🟡 Total saved accounts:', savedAccounts.length)
    console.log('🟡 Saved accounts details:', JSON.stringify(savedAccounts, null, 2))
    
    if (savedAccounts.length === 0) {
      console.error('❌ Failed to save any accounts to database')
      console.error('❌ This means the insert/update failed for all accounts')
      console.error('❌ Check the error logs above to see why')
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=failed_to_save_accounts', baseUrl)
      )
    }

    console.log('✅ Successfully saved', savedAccounts.length, 'account(s) from Outstand')
    
    // Check if this callback came from a popup (for TikTok)
    // If so, redirect to a page that closes popup and notifies parent
    const { searchParams } = new URL(baseUrl)
    const isPopup = searchParams.get('popup') === 'true' || searchParams.get('from_popup') === 'true'
    
    if (isPopup) {
      // Return an HTML page that closes the popup and sends a message to the parent
      // But first, check if we're actually in a popup
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <title>Connecting...</title>
</head>
<body>
  <script>
    // Check if we're in a popup
    if (window.opener && !window.opener.closed) {
      // We're in a popup - send success message to parent and close
      try {
        window.opener.postMessage({
          type: 'TIKTOK_OAUTH_SUCCESS',
          message: 'Account connected successfully'
        }, window.location.origin);
        
        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 500);
      } catch (e) {
        console.error('Error sending message to parent:', e);
        // Fallback: redirect parent window
        window.opener.location.href = '/dashboard/settings?connected=success';
        window.close();
      }
    } else {
      // Not in popup or opener closed - redirect normally
      window.location.href = '/dashboard/settings?connected=success';
    }
  </script>
  <p>Connecting your account... This window will close automatically.</p>
</body>
</html>`,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )
    }
    
    return NextResponse.redirect(
      new URL('/dashboard/settings?connected=success', baseUrl)
    )
  } catch (error: any) {
    console.error('Error syncing accounts from Outstand:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=sync_error', baseUrl)
    )
  }
}

/**
 * Finalize the connection by calling Outstand API
 */
async function finalizeConnection(
  supabase: any,
  userId: string,
  sessionToken: string,
  accountIds: string[],
  baseUrl: string
) {
  console.log('🟢 FINALIZE CONNECTION CALLED')
  console.log('🟢 User ID:', userId)
  console.log('🟢 Session token:', sessionToken)
  console.log('🟢 Account IDs:', accountIds)
  
  const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
  const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

  try {
    console.log('🟢 Calling Outstand finalize API...')
    // POST /v1/social-accounts/pending/:session/finalize
    const finalizeResponse = await fetch(
      `${OUTSTAND_API_URL}/social-accounts/pending/${sessionToken}/finalize`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_ids: accountIds,
        }),
      }
    )

    if (!finalizeResponse.ok) {
      const errorText = await finalizeResponse.text()
      console.error('Outstand finalize error:', errorText)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=finalize_failed', baseUrl)
      )
    }

    const accountData = await finalizeResponse.json()
    console.log('🟢 Outstand finalize response (callback):', JSON.stringify(accountData, null, 2))
    console.log('🟢 Response keys:', Object.keys(accountData))
    console.log('🟢 accountData.accounts:', accountData.accounts)
    console.log('🟢 accountData.data?.accounts:', accountData.data?.accounts)
    console.log('🟢 accountData.data:', accountData.data)
    
    // Try multiple possible response formats
    let accounts = []
    if (Array.isArray(accountData)) {
      accounts = accountData
    } else if (accountData.accounts && Array.isArray(accountData.accounts)) {
      accounts = accountData.accounts
    } else if (accountData.data?.accounts && Array.isArray(accountData.data.accounts)) {
      accounts = accountData.data.accounts
    } else if (accountData.data && Array.isArray(accountData.data)) {
      accounts = accountData.data
    } else if (accountData.account) {
      accounts = [accountData.account]
    }
    
    console.log('🟢 Extracted accounts (callback):', JSON.stringify(accounts, null, 2))
    console.log('🟢 Accounts count:', accounts.length)

    if (accounts.length === 0) {
      console.error('No accounts found in Outstand response (callback)')
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=no_accounts_in_response', baseUrl)
      )
    }

    // Use admin client for all database operations
    const adminSupabase = createAdminClient()
    
    // Ensure user profile exists (user_id must reference profiles.id which should equal auth.uid())
    console.log('Checking if profile exists for user:', userId)
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    console.log('Profile check - data:', profile)
    console.log('Profile check - error:', profileError)

    if (profileError || !profile) {
      console.warn('Profile not found for user (callback), creating...')
      console.warn('Profile error:', profileError)
      // Try to create profile if it doesn't exist using admin client
      const { data: newProfile, error: createProfileError } = await adminSupabase
        .from('profiles')
        .insert({ id: userId })
        .select()
      
      console.log('Create profile - data:', newProfile)
      console.log('Create profile - error:', createProfileError)
      
      if (createProfileError) {
        console.error('❌ Failed to create profile (callback):', createProfileError)
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=profile_not_found', baseUrl)
        )
      }
      console.log('✅ Profile created successfully')
    } else {
      console.log('✅ Profile exists')
    }

    // Save connected accounts to database
    const savedAccounts = []
    for (const account of accounts) {
      const accountToSave = {
        user_id: userId, // This should be auth.uid() which equals profiles.id
        outstand_account_id: account.id || account.account_id,
        platform: account.platform || account.network || 'facebook',
        username: account.username || account.handle || account.name,
        name: account.name || account.display_name || account.username,
        is_active: true,
      }
      
      console.log('Saving account to database (callback):', JSON.stringify(accountToSave, null, 2))
      console.log('User ID (auth.uid):', userId)
      
      // Try insert first, then update if it exists
      let savedData = null
      let upsertError = null
      
      // Try to insert the account using admin client to bypass RLS
      console.log('Attempting to insert account:', JSON.stringify(accountToSave, null, 2))
      const { data: insertData, error: insertError } = await adminSupabase
        .from('social_accounts')
        .insert(accountToSave)
        .select()
      
      console.log('Insert result - data:', insertData)
      console.log('Insert result - error:', insertError)
      
      if (insertError) {
        console.error('Insert error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        })
        
        // If unique constraint violation, update instead
        if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
          console.log('Account already exists, updating...')
          const { data: updateData, error: updateError } = await adminSupabase
            .from('social_accounts')
            .update({
              platform: accountToSave.platform,
              username: accountToSave.username,
              name: accountToSave.name,
              is_active: accountToSave.is_active,
            })
            .eq('user_id', accountToSave.user_id)
            .eq('outstand_account_id', accountToSave.outstand_account_id)
            .select()
          
          console.log('Update result - data:', updateData)
          console.log('Update result - error:', updateError)
          
          savedData = updateData
          upsertError = updateError
        } else {
          savedData = null
          upsertError = insertError
        }
      } else {
        savedData = insertData
        console.log('✅ Insert successful!')
      }

      if (upsertError) {
        console.error('❌ Error saving account to database (callback):', upsertError)
        console.error('Error code:', upsertError.code)
        console.error('Error message:', upsertError.message)
        console.error('Error details:', upsertError.details)
        console.error('Error hint:', upsertError.hint)
        console.error('Full error:', JSON.stringify(upsertError, null, 2))
        console.error('Account data that failed:', accountToSave)
        // Continue with other accounts even if one fails
      } else {
        console.log('✅ Account saved successfully (callback):', savedData)
        if (savedData && savedData.length > 0) {
          savedAccounts.push(savedData[0])
          console.log('✅ Account added to savedAccounts array')
        } else {
          console.warn('⚠️ No data returned from insert/update, trying to fetch...')
          // If no data returned, try to fetch it
          const { data: fetchedData, error: fetchError } = await adminSupabase
            .from('social_accounts')
            .select('*')
            .eq('user_id', accountToSave.user_id)
            .eq('outstand_account_id', accountToSave.outstand_account_id)
            .single()
          
          console.log('Fetch result - data:', fetchedData)
          console.log('Fetch result - error:', fetchError)
          
          if (fetchedData) {
            savedAccounts.push(fetchedData)
            console.log('✅ Account fetched and added to savedAccounts')
          } else {
            console.error('❌ Could not fetch account after insert/update')
          }
        }
      }
    }

    console.log('Total saved accounts:', savedAccounts.length)
    console.log('Saved accounts:', JSON.stringify(savedAccounts, null, 2))
    
    if (savedAccounts.length === 0) {
      console.error('❌ Failed to save any accounts to database (callback)')
      console.error('This means the insert/update failed for all accounts')
      console.error('Check the error logs above to see why')
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=failed_to_save_accounts', baseUrl)
      )
    }

    console.log('✅ Successfully saved', savedAccounts.length, 'account(s)')
    
    // Check if this is a popup callback (for TikTok)
    const { searchParams: finalSearchParams } = new URL(baseUrl)
    const isPopup = finalSearchParams.get('popup') === 'true'
    
    if (isPopup) {
      // Return an HTML page that closes the popup and sends a message to the parent
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <title>Connecting...</title>
</head>
<body>
  <script>
    // Send success message to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'TIKTOK_OAUTH_SUCCESS',
        message: 'Account connected successfully'
      }, window.location.origin);
      // Close popup after a short delay
      setTimeout(() => {
        window.close();
      }, 500);
    } else {
      // If no opener, redirect normally
      window.location.href = '/dashboard/settings?connected=success';
    }
  </script>
  <p>Connecting your account... This window will close automatically.</p>
</body>
</html>`,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )
    }
    
    return NextResponse.redirect(
      new URL('/dashboard/settings?connected=success', baseUrl)
    )
  } catch (error: any) {
    console.error('Error finalizing connection:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=finalize_error', baseUrl)
    )
  }
}
