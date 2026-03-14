import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: tweets } = await supabase
    .from('processed_tweets')
    .select('*, drafts(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  return <DashboardClient tweets={tweets ?? []} />
}
