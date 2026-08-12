import { createAdminClient } from '@supabase/server/core'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ code: -1, message: 'Method not allowed' })
    return
  }

  const { sync_id, salt, encrypted_payload, version } = req.body

  if (!sync_id || !salt || !encrypted_payload || version == null) {
    res.status(400).json({
      code: -1,
      message: 'Missing sync_id, salt, encrypted_payload, or version'
    })
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

  const serverVersion = existing.version
  const clientVersion = Number(version)

  if (serverVersion > clientVersion) {
    res.status(409).json({
      code: -1,
      message: 'Server version is newer',
      data: {
        server_version: serverVersion,
        client_version: clientVersion
      }
    })
    return
  }

  const hexPayload =
    '\\x' + Buffer.from(encrypted_payload, 'base64').toString('hex')

  const { data, error: upsertError } = await supabase
    .from('simple_bench_backups')
    .upsert(
      { sync_id, salt, encrypted_payload: hexPayload, version: clientVersion },
      { onConflict: 'sync_id' }
    )
    .select()
    .single()

  if (upsertError) {
    res.status(500).json({ code: -1, message: upsertError.message })
    return
  }

  res.status(200).json({ code: 0, data })
}
