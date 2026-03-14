import { createClient } from '@supabase/supabase-js'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tweets, error } = await supabase
    .from('processed_tweets')
    .select('*, drafts(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) console.error('Dashboard error:', error.message)

  return <DashboardClient tweets={tweets ?? []} />
}
