const X_API_BASE = 'https://api.twitter.com/2'

async function buildOAuthHeader(method: string, url: string, queryParams: Record<string, string> = {}): Promise<string> {
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

  const allParams = { ...queryParams, ...oauthParams }
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
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

export async function fetchListTweets(listId: string, sinceId?: string | null) {
  const queryParams: Record<string, string> = {
    max_results: '100',
    'tweet.fields': 'created_at,public_metrics,referenced_tweets,author_id',
    'user.fields': 'id,name,username',
    expansions: 'author_id',
  }

  if (sinceId) queryParams.since_id = sinceId

  const url = `${X_API_BASE}/lists/${listId}/tweets`
  const params = new URLSearchParams(queryParams)
  const oauth = await buildOAuthHeader('GET', url, queryParams)

  const res = await fetch(`${url}?${params}`, {
    headers: { Authorization: oauth },
    cache: 'no-store',
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`X API error ${res.status}: ${error}`)
  }

  return res.json()
}

export function isOriginalPost(tweet: any): boolean {
  if (tweet.text.startsWith('RT @')) return false
  if (tweet.text.startsWith('@')) return false
  if (tweet.referenced_tweets?.some((r: any) => r.type === 'retweeted')) return false
  return true
}

export function engagementScore(tweet: any): number {
  const m = tweet.public_metrics
  if (!m) return 0
  return m.like_count * 2 + m.reply_count * 3 + m.retweet_count * 1.5 + (m.impression_count ?? 0) * 0.001
}
