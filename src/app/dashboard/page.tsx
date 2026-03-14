import { createClient } from '@supabase/supabase-js'
import DashboardClient from './DashboardClient'

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

  console.log('Dashboard tweets:', JSON.stringify(tweets))
  console.log('Dashboard error:', JSON.stringify(error))

  return <DashboardClient tweets={tweets ?? []} />
}
