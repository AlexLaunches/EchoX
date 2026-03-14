import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { draftId } = await request.json()
    if (!draftId) return Response.json({ error: 'Missing draftId' }, { status: 400 })

    const supabase = await createClient()
    const { error } = await supabase
      .from('drafts')
      .update({ status: 'Discarded' })
      .eq('id', draftId)

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
