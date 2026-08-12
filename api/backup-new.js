import { createAdminClient } from '@supabase/server/core'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ code: -1, message: 'Method not allowed' })
    return
  }

  const { sync_id, salt } = req.body
  if (!sync_id || !salt) {
    res.status(400).json({ code: -1, message: 'Missing sync_id or salt' })
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
      .status(409)
      .json({ code: -1, message: 'Backup already exists for this sync_id' })
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
        message:
          'Please retry later: a backup was created less than 1 hour ago',
        data: {
          created_at: latest.created_at
        }
      })
      return
    }
  }

  const { error: insertError } = await supabase
    .from('simple_bench_backups')
    .insert({
      sync_id,
      salt,
      version: 1,
      encrypted_payload: null
    })
    .select()
    .single()

  if (insertError) {
    res.status(500).json({ code: -1, message: insertError.message })
    return
  }

  res.status(201).json({ code: 0 })
}
