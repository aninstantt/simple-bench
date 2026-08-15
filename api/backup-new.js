import { createAdminClient } from '@supabase/server/core'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ code: -1, message: 'Method not allowed' })
    return
  }

  const { sync_id, public_key } = req.body
  if (!sync_id || !public_key) {
    res.status(400).json({ code: -1, message: 'Missing sync_id or public_key' })
    return
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('simple_bench_backups')
    .select('sync_id')
    .eq('sync_id', sync_id)
    .maybeSingle()

  if (existing) {
    res
      .status(200)
      .json({ code: 0, message: 'Backup already exists for this sync_id' })
    return
  }

  const { data: latest } = await supabase
    .from('simple_bench_backups')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latest) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const createdAt = new Date(latest.created_at)

    if (createdAt > oneHourAgo) {
      res.status(429).json({
        code: -1,
        message: 'Please retry later: a backup was created less than 1 hour ago'
      })
      return
    }
  }

  const { error: insertError } = await supabase
    .from('simple_bench_backups')
    .insert({
      sync_id,
      public_key,
      version: 0,
      payload: null
    })
    .select()
    .single()

  if (insertError) {
    res.status(500).json({ code: -1, message: insertError.message })
    return
  }

  res.status(201).json({ code: 0 })
}
