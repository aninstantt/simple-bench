import { createAdminClient } from '@supabase/server/core'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ code: -1, message: 'Method not allowed' })
    return
  }

  const { sync_id, version } = req.body
  if (!sync_id || version == null) {
    res.status(400).json({ code: -1, message: 'Missing sync_id or version' })
    return
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('simple_bench_backups')
    .select('version')
    .eq('sync_id', sync_id)
    .maybeSingle()

  if (!existing) {
    res
      .status(404)
      .json({ code: -1, message: 'No backup found for this sync_id' })
    return
  }

  const clientVersion = Number(version)
  const serverVersion = existing.version

  res.status(200).json({
    code: 0,
    data: {
      has_newer: serverVersion > clientVersion,
      server_version: serverVersion,
      client_version: clientVersion
    }
  })
}
