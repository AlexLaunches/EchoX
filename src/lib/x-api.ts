const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN!
const X_API_BASE = 'https://api.twitter.com/2'

export async function fetchListTweets(listId: string, sinceId?: string | null) {
  const params = new URLSearchParams({
    max_results: '100',
    'tweet.fields': 'created_at,public_metrics,referenced_tweets,author_id',
    'user.fields': 'id,name,username',
    expansions: 'author_id',
  })

  if (sinceId) params.set('since_id', sinceId)

  const res = await fetch(`${X_API_BASE}/lists/${listId}/tweets?${params}`, {
    headers: { Authorization: `Bearer ${X_BEARER_TOKEN}` },
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
