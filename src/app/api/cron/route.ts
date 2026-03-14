import { createClient } from '@/lib/supabase/server'
import { fetchListTweets, isOriginalPost, engagementScore } from '@/lib/x-api'
import { generateDrafts } from '@/lib/claude'

export const maxDuration = 60

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const results = { listsChecked: 0, tweetsProcessed: 0, draftsCreated: 0, errors: [] as string[] }

  try {
    const { data: niches, error } = await supabase.from('niches').select('*').eq('is_active', true)
    if (error) throw new Error(error.message)
    if (!niches || niches.length === 0) return Response.json({ message: 'No active niches' })

    for (const niche of niches) {
      try {
        const response = await fetchListTweets(niche.list_id, niche.since_id)
        if (!response.data || response.data.length === 0) continue

        results.listsChecked++

        const users = response.includes?.users ?? []
        const original = response.data.filter(isOriginalPost)
        const top3 = original.sort((a: any, b: any) => engagementScore(b) - engagementScore(a)).slice(0, 3)

        if (top3.length > 0) {
          await supabase.from('niches').update({
            since_id: response.meta?.newest_id,
            last_fetched_at: new Date().toISOString()
          }).eq('list_id', niche.list_id)
        }

        for (const tweet of top3) {
          const existing = await supabase.from('processed_tweets').select('id').eq('tweet_id', tweet.id).single()
          if (existing.data) continue

          const author = users.find((u: any) => u.id === tweet.author_id)
          const tweetUrl = author ? `https://x.com/${author.username}/status/${tweet.id}` : null

          await supabase.from('processed_tweets').insert({
            tweet_id: tweet.id,
            author_id: tweet.author_id,
            author_name: author?.name ?? null,
            author_username: author?.username ?? null,
            content: tweet.text,
            view_count: tweet.public_metrics?.impression_count ?? 0,
            like_count: tweet.public_metrics?.like_count ?? 0,
            reply_count: tweet.public_metrics?.reply_count ?? 0,
            retweet_count: tweet.public_metrics?.retweet_count ?? 0,
            list_id: niche.list_id,
            niche_name: niche.niche_name,
            tweet_url: tweetUrl,
            created_at: tweet.created_at,
          })

          const drafts = await generateDrafts(tweet.text, niche.persona_instruction, niche.niche_name)

          await supabase.from('drafts').insert([
            { tweet_id: tweet.id, persona_type: 'Value-Adder', draft_text: drafts.valueAdder, status: 'Pending' },
            { tweet_id: tweet.id, persona_type: 'Challenger', draft_text: drafts.challenger, status: 'Pending' },
            { tweet_id: tweet.id, persona_type: 'Wit', draft_text: drafts.wit, status: 'Pending' },
          ])

          results.tweetsProcessed++
          results.draftsCreated += 3
        }
      } catch (e: any) {
        results.errors.push(`List ${niche.list_id}: ${e.message}`)
      }
    }

    return Response.json({ success: true, ...results })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
