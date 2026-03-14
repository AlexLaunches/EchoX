import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { draftId, tweetId, draftText } = await request.json()
    if (!draftId || !tweetId || !draftText) return Response.json({ error: 'Missing fields' }, { status: 400 })

    const oauth = await buildOAuthHeader('POST', 'https://api.twitter.com/2/tweets')

    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: oauth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: draftText,
        quote_tweet_id: tweetId,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('X API post error:', err)
      return Response.json({ error: err }, { status: 500 })
    }

    const supabase = await createClient()
    await supabase
      .from('drafts')
      .update({ status: 'Posted', posted_at: new Date().toISOString() })
      .eq('id', draftId)

    return Response.json({ success: true })
  } catch (e: any) {
    console.error('Post route error:', e.message)
    return Response.json({ error: e.message }, { status: 500 })
  }
}

async function buildOAuthHeader(method: string, url: string): Promise<string> {
  const consumerKey = process.env.X_API_KEY!
  const consumerSecret = process.env.X_API_KEY_SECRET!
  const accessToken = process.env.X_ACCESS_TOKEN!
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET!

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  const sortedParams = Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
    .join('&')

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join('&')

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingKey),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(baseString))
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

  oauthParams.oauth_signature = signatureBase64

  const headerValue = Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ')

  return `OAuth ${headerValue}`
}
